import { HttpError } from 'wasp/server';
import { Prisma } from '@prisma/client';
import type { CreatePaymentRefund, ListPaymentRefunds } from 'wasp/server/operations';
import { requirePermission } from '../rbac/requirePermission';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

// ============================================================================
// Types
// ============================================================================

type CreatePaymentRefundInput = {
  paymentId: string;
  amount?: number; // Optional: partial refund. If not provided, full refund
  reason: string;
};

type ListPaymentRefundsInput = {
  salonId: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
};

// ============================================================================
// Action: Create Payment Refund
// ============================================================================

export const createPaymentRefund: CreatePaymentRefund<CreatePaymentRefundInput, any> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'Você precisa estar autenticado.');
  }

  // Get payment
  const payment = await context.entities.Payment.findUnique({
    where: { id: args.paymentId },
    include: {
      appointment: {
        include: {
          salon: {
            include: {
              bookingConfig: true,
            },
          },
        },
      },
    },
  });

  if (!payment) {
    throw new HttpError(404, 'Pagamento não encontrado.');
  }

  if (!payment.appointment) {
    throw new HttpError(400, 'Apenas pagamentos de agendamento podem ser reembolsados.');
  }

  // Check permission
  await requirePermission(context, 'payment.refund', payment.appointment.salonId);

  // Validate payment status
  if (payment.status !== 'PAID') {
    throw new HttpError(400, 'Apenas pagamentos confirmados podem ser reembolsados.');
  }

  if (payment.isRefunded) {
    throw new HttpError(400, 'Este pagamento já foi reembolsado.');
  }

  // Validate refund amount
  const refundAmount = args.amount || payment.amount;
  if (refundAmount <= 0) {
    throw new HttpError(400, 'O valor do reembolso deve ser maior que zero.');
  }

  if (refundAmount > payment.amount) {
    throw new HttpError(400, 'O valor do reembolso não pode ser maior que o valor pago.');
  }

  // Check cancellation policy
  const config = payment.appointment.salon.bookingConfig;
  const appointmentStart = new Date(payment.appointment.startAt);
  const now = new Date();
  const hoursUntilAppointment =
    (appointmentStart.getTime() - now.getTime()) / (1000 * 60 * 60);

  let cancellationFee = 0;
  if (config && hoursUntilAppointment < config.cancellationDeadlineHours) {
    // Apply cancellation fee
    if (config.cancellationFeeType === 'PERCENTAGE') {
      cancellationFee = (refundAmount * config.cancellationFeeAmount) / 100;
    } else {
      cancellationFee = config.cancellationFeeAmount;
    }
  }

  const finalRefundAmount = Math.max(0, refundAmount - cancellationFee);

  if (finalRefundAmount === 0) {
    throw new HttpError(
      400,
      'O valor do reembolso após aplicar a taxa de cancelamento é zero.'
    );
  }

  // Process Stripe refund
  if (!payment.stripePaymentIntentId) {
    throw new HttpError(400, 'ID do pagamento Stripe não encontrado.');
  }

  try {
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      amount: Math.round(finalRefundAmount * 100), // Convert to cents
      reason: 'requested_by_customer',
      metadata: {
        appointmentId: payment.appointmentId!,
        originalAmount: refundAmount.toString(),
        cancellationFee: cancellationFee.toString(),
        reason: args.reason,
      },
    });

    // Update payment
    const updatedPayment = await context.entities.Payment.update({
      where: { id: payment.id },
      data: {
        isRefunded: true,
        refundedAt: new Date(),
        refundAmount: finalRefundAmount,
        refundReason: args.reason,
        status: 'REFUNDED',
      },
    });

    // Update appointment
    const totalPaid = Math.max(0, payment.appointment.totalPaid - finalRefundAmount);
    const remainingAmount =
      (payment.appointment.totalPrice || 0) - totalPaid;

    await context.entities.Appointment.update({
      where: { id: payment.appointmentId! },
      data: {
        paymentStatus: 'REFUNDED',
        totalPaid,
        remainingAmount,
        cancellationFee,
      },
    });

    // Log action
    await context.entities.Log.create({
      data: {
        userId: context.user.id,
        action: 'CREATE_PAYMENT_REFUND',
        entity: 'Payment',
        entityId: payment.id,
        description: `Reembolso de R$ ${finalRefundAmount.toFixed(2)} processado para agendamento ${payment.appointmentId}${cancellationFee > 0 ? ` (Taxa de cancelamento: R$ ${cancellationFee.toFixed(2)})` : ''}`,
      },
    });

    return {
      payment: updatedPayment,
      refund: {
        id: refund.id,
        amount: finalRefundAmount,
        cancellationFee,
        status: refund.status,
        createdAt: new Date(refund.created * 1000),
      },
    };
  } catch (error: any) {
    console.error('Stripe refund error:', error);
    throw new HttpError(
      500,
      `Erro ao processar reembolso no Stripe: ${error.message || 'Erro desconhecido'}`
    );
  }
};

// ============================================================================
// Query: List Payment Refunds
// ============================================================================

export const listPaymentRefunds: ListPaymentRefunds<ListPaymentRefundsInput, any> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'Você precisa estar autenticado.');
  }

  // Check permission
  await requirePermission(context, 'payment.view', args.salonId);

  const page = args.page || 1;
  const pageSize = args.pageSize || 20;
  const skip = (page - 1) * pageSize;

  // Build date filter
  const dateFilter: any = {};
  if (args.startDate) {
    dateFilter.gte = new Date(args.startDate);
  }
  if (args.endDate) {
    dateFilter.lte = new Date(args.endDate);
  }

  const where: Prisma.PaymentWhereInput = {
    appointment: {
      salonId: args.salonId,
    },
    isRefunded: true,
    ...(Object.keys(dateFilter).length > 0 && { refundedAt: dateFilter }),
  };

  // Get refunds
  const [refunds, total] = await Promise.all([
    context.entities.Payment.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { refundedAt: 'desc' },
      include: {
        appointment: {
          include: {
            client: true,
            services: {
              include: {
                service: true,
              },
            },
          },
        },
        method: true,
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    }),
    context.entities.Payment.count({ where }),
  ]);

  // Calculate summary
  const totalRefunded = refunds.reduce((sum, r) => sum + (r.refundAmount || 0), 0);
  const totalCancellationFees = refunds.reduce(
    (sum, r) => sum + (r.appointment?.cancellationFee || 0),
    0
  );

  return {
    refunds,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    summary: {
      totalRefunded,
      totalCancellationFees,
      netRefunded: totalRefunded - totalCancellationFees,
    },
  };
};
