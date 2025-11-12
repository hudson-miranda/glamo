import { HttpError } from 'wasp/server';
import type {
  CreateBookingCheckout,
  ConfirmBookingPayment,
} from 'wasp/server/operations';
import { requirePermission } from '../rbac/requirePermission';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

// ============================================================================
// Types
// ============================================================================

type CreateBookingCheckoutInput = {
  appointmentId: string;
  paymentOption: 'full' | 'deposit';
  successUrl?: string;
  cancelUrl?: string;
};

type ConfirmBookingPaymentInput = {
  appointmentId: string;
  stripeSessionId: string;
};

// ============================================================================
// Action: Create Booking Checkout
// ============================================================================

export const createBookingCheckout: CreateBookingCheckout<
  CreateBookingCheckoutInput,
  any
> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Você precisa estar autenticado.');
  }

  // Get appointment with all related data
  const appointment = await context.entities.Appointment.findUnique({
    where: { id: args.appointmentId },
    include: {
      salon: {
        include: {
          bookingConfig: true,
        },
      },
      client: true,
      services: {
        include: {
          service: true,
        },
      },
    },
  });

  if (!appointment) {
    throw new HttpError(404, 'Agendamento não encontrado.');
  }

  // Check permission
  await requirePermission(context, 'appointment.pay', appointment.salonId);

  // Check if appointment already has payment
  if (appointment.paymentStatus === 'PAID') {
    throw new HttpError(400, 'Este agendamento já foi pago.');
  }

  // Get booking config
  const config = appointment.salon.bookingConfig;
  if (!config) {
    throw new HttpError(400, 'Configuração de pagamento não encontrada.');
  }

  // Calculate total amount
  const totalAmount = appointment.services.reduce(
    (sum, s) => sum + (s.service?.price || 0),
    0
  );

  if (totalAmount <= 0) {
    throw new HttpError(400, 'O valor total do agendamento deve ser maior que zero.');
  }

  // Calculate payment amount based on option
  let paymentAmount = totalAmount;
  let paymentType: 'FULL' | 'DEPOSIT' | 'REMAINING' = 'FULL';

  if (args.paymentOption === 'deposit' && config.acceptOnlineDeposit) {
    // Calculate deposit
    if (config.depositType === 'PERCENTAGE') {
      paymentAmount = (totalAmount * config.depositAmount) / 100;
    } else {
      paymentAmount = config.depositAmount;
    }

    // Ensure minimum deposit
    paymentAmount = Math.max(paymentAmount, config.minDepositAmount);

    // Ensure deposit doesn't exceed total
    paymentAmount = Math.min(paymentAmount, totalAmount);

    paymentType = 'DEPOSIT';
  } else if (!config.acceptFullPayment && args.paymentOption === 'full') {
    throw new HttpError(400, 'Pagamento total não está habilitado. Apenas depósito é aceito.');
  }

  // Convert to cents for Stripe
  const amountInCents = Math.round(paymentAmount * 100);

  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'brl',
          product_data: {
            name:
              paymentType === 'DEPOSIT'
                ? `Depósito - Agendamento ${appointment.salon.name}`
                : `Agendamento ${appointment.salon.name}`,
            description: appointment.services
              .map((s) => s.service?.name || '')
              .filter(Boolean)
              .join(', '),
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      appointmentId: appointment.id,
      salonId: appointment.salonId,
      clientId: appointment.clientId,
      userId: context.user.id,
      paymentType,
      totalAmount: totalAmount.toString(),
      paymentAmount: paymentAmount.toString(),
    },
    success_url: args.successUrl || `${process.env.WASP_WEB_CLIENT_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: args.cancelUrl || `${process.env.WASP_WEB_CLIENT_URL}/booking/cancel`,
    customer_email: appointment.client.email || undefined,
  });

  // Create payment record in pending state
  const paymentMethod = await context.entities.PaymentMethod.findFirst({
    where: { type: 'ONLINE', isOnline: true },
  });

  if (!paymentMethod) {
    throw new HttpError(500, 'Método de pagamento online não encontrado.');
  }

  const payment = await context.entities.Payment.create({
    data: {
      userId: context.user.id,
      appointmentId: appointment.id,
      methodId: paymentMethod.id,
      amount: paymentAmount,
      status: 'PENDING',
      type: paymentType,
      stripeCheckoutId: session.id,
      depositAmount: paymentType === 'DEPOSIT' ? paymentAmount : null,
      remainingAmount: paymentType === 'DEPOSIT' ? totalAmount - paymentAmount : 0,
    },
  });

  // Update appointment
  await context.entities.Appointment.update({
    where: { id: appointment.id },
    data: {
      requiresPayment: true,
      totalPaid: 0,
      remainingAmount: totalAmount,
    },
  });

  // Log action
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      action: 'CREATE_BOOKING_CHECKOUT',
      entity: 'Payment',
      entityId: payment.id,
      description: `Checkout criado para agendamento ${appointment.id} - ${paymentType}`,
    },
  });

  return {
    sessionId: session.id,
    sessionUrl: session.url,
    paymentId: payment.id,
    amount: paymentAmount,
    type: paymentType,
  };
};

// ============================================================================
// Action: Confirm Booking Payment
// ============================================================================

export const confirmBookingPayment: ConfirmBookingPayment<
  ConfirmBookingPaymentInput,
  any
> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Você precisa estar autenticado.');
  }

  // Get payment by stripe session ID
  const payment = await context.entities.Payment.findFirst({
    where: { stripeCheckoutId: args.stripeSessionId },
    include: {
      appointment: true,
    },
  });

  if (!payment) {
    throw new HttpError(404, 'Pagamento não encontrado.');
  }

  if (!payment.appointment) {
    throw new HttpError(404, 'Agendamento não encontrado.');
  }

  // Check permission
  await requirePermission(context, 'appointment.view', payment.appointment.salonId);

  // Retrieve Stripe session
  const session = await stripe.checkout.sessions.retrieve(args.stripeSessionId);

  if (session.payment_status !== 'paid') {
    throw new HttpError(400, 'Pagamento ainda não foi confirmado pelo Stripe.');
  }

  // Update payment
  const updatedPayment = await context.entities.Payment.update({
    where: { id: payment.id },
    data: {
      status: 'PAID',
      stripePaymentIntentId: session.payment_intent as string,
    },
  });

  // Update appointment
  const totalPaid = payment.appointment.totalPaid + payment.amount;
  const remainingAmount = Math.max(0, (payment.appointment.totalPrice || 0) - totalPaid);
  const newPaymentStatus =
    remainingAmount <= 0 ? 'PAID' : payment.type === 'DEPOSIT' ? 'PARTIAL' : 'PENDING';

  await context.entities.Appointment.update({
    where: { id: payment.appointmentId! },
    data: {
      paymentStatus: newPaymentStatus,
      totalPaid,
      remainingAmount,
    },
  });

  // Log action
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      action: 'CONFIRM_BOOKING_PAYMENT',
      entity: 'Payment',
      entityId: payment.id,
      description: `Pagamento confirmado para agendamento ${payment.appointmentId}`,
    },
  });

  return updatedPayment;
};
