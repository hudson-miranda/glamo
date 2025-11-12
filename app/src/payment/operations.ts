import { HttpError } from 'wasp/server';
import { Prisma } from '@prisma/client';
import type {
  ListPayments,
  GetPayment,
  GetPaymentMetrics,
  GetPaymentTransactions,
} from 'wasp/server/operations';
import { requirePermission } from '../rbac/requirePermission';

// ============================================================================
// Types
// ============================================================================

type ListPaymentsInput = {
  salonId: string;
  status?: 'PENDING' | 'PARTIAL' | 'PAID' | 'REFUNDED' | 'CANCELLED';
  type?: 'FULL' | 'DEPOSIT' | 'REMAINING';
  startDate?: string;
  endDate?: string;
  appointmentId?: string;
  page?: number;
  pageSize?: number;
};

type GetPaymentInput = {
  paymentId: string;
};

type GetPaymentMetricsInput = {
  salonId: string;
  startDate?: string;
  endDate?: string;
};

type GetPaymentTransactionsInput = {
  salonId: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
};

// ============================================================================
// Query: List Payments
// ============================================================================

export const listPayments: ListPayments<ListPaymentsInput, any> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Você precisa estar autenticado.');
  }

  // Check permission
  await requirePermission(context.user, args.salonId, 'payment.view', context.entities);

  const page = args.page || 1;
  const pageSize = args.pageSize || 20;
  const skip = (page - 1) * pageSize;

  // Build where clause
  const where: Prisma.PaymentWhereInput = {
    OR: [
      {
        appointment: {
          salonId: args.salonId,
        },
      },
      {
        sale: {
          salonId: args.salonId,
        },
      },
    ],
  };

  if (args.status) {
    where.status = args.status;
  }

  if (args.type) {
    where.type = args.type;
  }

  if (args.appointmentId) {
    where.appointmentId = args.appointmentId;
  }

  if (args.startDate || args.endDate) {
    where.createdAt = {};
    if (args.startDate) {
      where.createdAt.gte = new Date(args.startDate);
    }
    if (args.endDate) {
      where.createdAt.lte = new Date(args.endDate);
    }
  }

  // Get payments
  const [payments, total] = await Promise.all([
    context.entities.Payment.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
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
        sale: {
          include: {
            client: true,
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

  return {
    payments,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
};

// ============================================================================
// Query: Get Payment
// ============================================================================

export const getPayment: GetPayment<GetPaymentInput, any> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Você precisa estar autenticado.');
  }

  // Get payment
  const payment = await context.entities.Payment.findUnique({
    where: { id: args.paymentId },
    include: {
      appointment: {
        include: {
          client: true,
          salon: true,
          services: {
            include: {
              service: true,
            },
          },
        },
      },
      sale: {
        include: {
          client: true,
          salon: true,
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
  });

  if (!payment) {
    throw new HttpError(404, 'Pagamento não encontrado.');
  }

  // Check permission
  const salonId = payment.appointment?.salonId || payment.sale?.salonId;
  if (!salonId) {
    throw new HttpError(400, 'Salão não encontrado para este pagamento.');
  }

  await requirePermission(context.user, salonId, 'payment.view', context.entities);

  return payment;
};

// ============================================================================
// Query: Get Payment Metrics
// ============================================================================

export const getPaymentMetrics: GetPaymentMetrics<GetPaymentMetricsInput, any> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'Você precisa estar autenticado.');
  }

  // Check permission
  await requirePermission(context.user, args.salonId, 'payment.view', context.entities);

  // Build date filter
  const dateFilter: any = {};
  if (args.startDate) {
    dateFilter.gte = new Date(args.startDate);
  }
  if (args.endDate) {
    dateFilter.lte = new Date(args.endDate);
  }

  const where: Prisma.PaymentWhereInput = {
    OR: [
      {
        appointment: {
          salonId: args.salonId,
        },
      },
      {
        sale: {
          salonId: args.salonId,
        },
      },
    ],
    ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
  };

  // Get metrics
  const [totalPayments, paidPayments, pendingPayments, refundedPayments] = await Promise.all([
    context.entities.Payment.count({ where }),
    context.entities.Payment.count({ where: { ...where, status: 'PAID' } }),
    context.entities.Payment.count({ where: { ...where, status: 'PENDING' } }),
    context.entities.Payment.count({ where: { ...where, status: 'REFUNDED' } }),
  ]);

  // Get revenue metrics
  const paidPaymentsData = await context.entities.Payment.findMany({
    where: { ...where, status: 'PAID' },
    select: {
      amount: true,
      type: true,
      createdAt: true,
    },
  });

  const totalRevenue = paidPaymentsData.reduce((sum, p) => sum + p.amount, 0);
  const depositRevenue = paidPaymentsData
    .filter((p) => p.type === 'DEPOSIT')
    .reduce((sum, p) => sum + p.amount, 0);
  const fullPaymentRevenue = paidPaymentsData
    .filter((p) => p.type === 'FULL')
    .reduce((sum, p) => sum + p.amount, 0);

  // Get refund metrics
  const refundedPaymentsData = await context.entities.Payment.findMany({
    where: { ...where, status: 'REFUNDED' },
    select: {
      refundAmount: true,
    },
  });

  const totalRefunded = refundedPaymentsData.reduce(
    (sum, p) => sum + (p.refundAmount || 0),
    0
  );

  // Get appointments with online payment
  const appointmentsWithPayment = await context.entities.Appointment.count({
    where: {
      salonId: args.salonId,
      requiresPayment: true,
      ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
    },
  });

  const appointmentsPaid = await context.entities.Appointment.count({
    where: {
      salonId: args.salonId,
      requiresPayment: true,
      paymentStatus: 'PAID',
      ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
    },
  });

  const conversionRate =
    appointmentsWithPayment > 0 ? (appointmentsPaid / appointmentsWithPayment) * 100 : 0;

  return {
    totalPayments,
    paidPayments,
    pendingPayments,
    refundedPayments,
    totalRevenue,
    depositRevenue,
    fullPaymentRevenue,
    totalRefunded,
    netRevenue: totalRevenue - totalRefunded,
    appointmentsWithPayment,
    appointmentsPaid,
    conversionRate,
    averagePaymentValue: paidPayments > 0 ? totalRevenue / paidPayments : 0,
  };
};

// ============================================================================
// Query: Get Payment Transactions
// ============================================================================

export const getPaymentTransactions: GetPaymentTransactions<
  GetPaymentTransactionsInput,
  any
> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Você precisa estar autenticado.');
  }

  // Check permission
  await requirePermission(context.user, args.salonId, 'payment.view', context.entities);

  const page = args.page || 1;
  const pageSize = args.pageSize || 50;
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
    OR: [
      {
        appointment: {
          salonId: args.salonId,
        },
      },
      {
        sale: {
          salonId: args.salonId,
        },
      },
    ],
    status: 'PAID',
    ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
  };

  // Get transactions
  const [transactions, total] = await Promise.all([
    context.entities.Payment.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        amount: true,
        status: true,
        type: true,
        stripePaymentIntentId: true,
        appointment: {
          select: {
            id: true,
            startAt: true,
            client: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        sale: {
          select: {
            id: true,
            createdAt: true,
            client: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        method: {
          select: {
            name: true,
            type: true,
          },
        },
      },
    }),
    context.entities.Payment.count({ where }),
  ]);

  return {
    transactions,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
};
