import { HttpError } from 'wasp/server';
import { Prisma } from '@prisma/client';
import type {
  GetClientMetrics,
  CalculateClientMetrics,
  GetClientChurnRisk,
  GetClientCLV,
  GetRetentionAnalytics,
  GetCohortAnalysis,
  GetClientSegmentMetrics,
  UpdateSalonAnalytics,
  GetSalonDashboard,
  GetTopClients,
  GetClientPreferences
} from 'wasp/server/operations';
import { requirePermission } from '../rbac/requirePermission';

// ============================================================================
// Types
// ============================================================================

type CalculateClientMetricsInput = {
  clientId: string;
  salonId: string;
};

type GetCohortAnalysisInput = {
  salonId: string;
  startDate: string;
  endDate: string;
  period: 'MONTHLY' | 'QUARTERLY';
};

// ============================================================================
// Helper Functions
// ============================================================================

const calculateChurnRisk = (
  daysSinceLastVisit: number,
  avgDaysBetweenVisits: number,
  cancellationRate: number,
  totalVisits: number
): number => {
  let riskScore = 0;

  // Factor 1: Days since last visit vs average
  if (avgDaysBetweenVisits > 0) {
    const visitRatio = daysSinceLastVisit / avgDaysBetweenVisits;
    if (visitRatio > 2) riskScore += 40;
    else if (visitRatio > 1.5) riskScore += 25;
    else if (visitRatio > 1.2) riskScore += 10;
  }

  // Factor 2: Cancellation rate
  riskScore += cancellationRate * 30;

  // Factor 3: Visit frequency
  if (totalVisits < 3) riskScore += 15;
  else if (totalVisits < 5) riskScore += 10;

  // Factor 4: Absolute time threshold
  if (daysSinceLastVisit > 90) riskScore += 25;
  else if (daysSinceLastVisit > 60) riskScore += 15;

  return Math.min(riskScore, 100);
};

const calculateCLV = (
  avgTransactionValue: number,
  visitFrequency: number,
  avgMonthlySpending: number,
  totalVisits: number
): number => {
  // Simple CLV calculation
  // CLV = (Average Monthly Spending * 12 months * Average Customer Lifespan in years)
  // Assume average lifespan of 3 years for established clients
  const lifespan = totalVisits < 5 ? 1 : totalVisits < 12 ? 2 : 3;
  return avgMonthlySpending * 12 * lifespan;
};

const determineRetentionStatus = (
  daysSinceLastVisit: number,
  totalVisits: number
): 'NEW' | 'ACTIVE' | 'AT_RISK' | 'DORMANT' | 'CHURNED' | 'REACTIVATED' => {
  if (totalVisits === 1 && daysSinceLastVisit <= 30) return 'NEW';
  if (daysSinceLastVisit <= 45) return 'ACTIVE';
  if (daysSinceLastVisit <= 90) return 'AT_RISK';
  if (daysSinceLastVisit <= 180) return 'DORMANT';
  return 'CHURNED';
};

// ============================================================================
// Client Metrics Operations
// ============================================================================

export const getClientMetrics: GetClientMetrics<{
  clientId: string;
  salonId: string;
}, any> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'clients:view');

  let metrics = await context.entities.ClientMetrics.findUnique({
    where: {
      clientId: args.clientId
    }
  });

  if (!metrics) {
    // Calculate if not exists
    metrics = await calculateClientMetrics({ ...args }, context);
  }

  return metrics;
};

export const calculateClientMetrics: CalculateClientMetrics<CalculateClientMetricsInput, any> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'clients:view');

  // Get client with related data
  const client = await context.entities.Client.findUnique({
    where: { id: args.clientId },
    include: {
      appointments: {
        where: {
          status: { in: ['DONE', 'CONFIRMED', 'IN_SERVICE'] }
        },
        orderBy: { startAt: 'desc' }
      },
      sales: {
        where: {
          status: 'PAID'
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!client) {
    throw new HttpError(404, 'Client not found');
  }

  // Calculate metrics
  const totalVisits = client.appointments.length;
  const totalSpent = client.sales.reduce((sum, sale) => sum + sale.finalTotal, 0);
  const avgTransactionValue = totalVisits > 0 ? totalSpent / totalVisits : 0;

  const completedAppointments = client.appointments.filter(a => a.status === 'DONE');
  const cancelledAppointments = client.appointments.filter(a => a.status === 'CANCELLED');
  const cancelledCount = cancelledAppointments.length;
  const cancellationRate = client.appointments.length > 0
    ? (cancelledCount / client.appointments.length) * 100
    : 0;

  const lastVisit = completedAppointments[0];
  const daysSinceLastVisit = lastVisit
    ? Math.floor((Date.now() - lastVisit.startAt.getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  // Calculate visit frequency and average days between visits
  let avgDaysBetweenVisits = 0;
  let visitFrequency = 0;

  if (completedAppointments.length > 1) {
    const firstVisit = completedAppointments[completedAppointments.length - 1];
    const daysSinceFirst = Math.floor(
      (Date.now() - firstVisit.startAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    visitFrequency = daysSinceFirst > 0 ? (completedAppointments.length / daysSinceFirst) * 30 : 0;
    avgDaysBetweenVisits = daysSinceFirst / (completedAppointments.length - 1);
  }

  const avgMonthlySpending = visitFrequency > 0
    ? avgTransactionValue * visitFrequency
    : 0;

  // Calculate CLV
  const lifetimeValue = totalSpent;
  const predictedLTV = calculateCLV(
    avgTransactionValue,
    visitFrequency,
    avgMonthlySpending,
    totalVisits
  );

  // Calculate churn risk
  const appointmentShowRate = client.appointments.length > 0
    ? ((client.appointments.length - cancelledCount) / client.appointments.length) * 100
    : 100;

  const churnRisk = calculateChurnRisk(
    daysSinceLastVisit,
    avgDaysBetweenVisits,
    cancellationRate / 100,
    totalVisits
  );

  const retentionStatus = determineRetentionStatus(daysSinceLastVisit, totalVisits);

  // Get preferences
  const serviceFrequency: { [key: string]: number } = {};
  completedAppointments.forEach(apt => {
    // Would need to join with services, simplified here
    serviceFrequency['general'] = (serviceFrequency['general'] || 0) + 1;
  });

  const preferredServices = Object.entries(serviceFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([id]) => id);

  // Cohort month
  const firstVisit = completedAppointments[completedAppointments.length - 1];
  const cohortMonth = firstVisit
    ? `${firstVisit.startAt.getFullYear()}-${String(firstVisit.startAt.getMonth() + 1).padStart(2, '0')}`
    : null;

  const monthsSinceFirstVisit = firstVisit
    ? Math.floor((Date.now() - firstVisit.startAt.getTime()) / (1000 * 60 * 60 * 24 * 30))
    : 0;

  // Loyalty and satisfaction scores (would be calculated from actual data)
  const loyaltyScore = Math.min(100, (totalVisits * 10) + (appointmentShowRate * 0.5));
  const satisfactionScore = appointmentShowRate > 90 ? 9 : appointmentShowRate > 80 ? 8 : 7;
  const referralScore = loyaltyScore > 80 ? 85 : loyaltyScore > 60 ? 60 : 40;

  // Flags
  const isVIP = lifetimeValue > 5000 || totalVisits > 20;
  const isAtRisk = churnRisk > 60 || retentionStatus === 'AT_RISK';
  const needsAttention = isAtRisk || retentionStatus === 'DORMANT';

  const lastPurchaseAmount = client.sales[0]?.finalTotal || 0;

  // Upsert metrics
  const metrics = await context.entities.ClientMetrics.upsert({
    where: {
      clientId: args.clientId
    },
    create: {
      clientId: args.clientId,
      salonId: args.salonId,
      lifetimeValue,
      predictedLTV,
      avgTransactionValue,
      totalVisits,
      visitFrequency,
      daysSinceLastVisit,
      avgDaysBetweenVisits,
      totalSpent,
      avgMonthlySpending,
      lastPurchaseAmount,
      appointmentShowRate,
      cancellationRate,
      rescheduleRate: 0,
      retentionStatus,
      churnRisk,
      cohortMonth,
      monthsSinceFirstVisit,
      preferredServices,
      satisfactionScore,
      loyaltyScore,
      referralScore,
      isVIP,
      isAtRisk,
      needsAttention,
      lastCalculatedAt: new Date()
    },
    update: {
      lifetimeValue,
      predictedLTV,
      avgTransactionValue,
      totalVisits,
      visitFrequency,
      daysSinceLastVisit,
      avgDaysBetweenVisits,
      totalSpent,
      avgMonthlySpending,
      lastPurchaseAmount,
      appointmentShowRate,
      cancellationRate,
      retentionStatus,
      churnRisk,
      cohortMonth,
      monthsSinceFirstVisit,
      preferredServices,
      satisfactionScore,
      loyaltyScore,
      referralScore,
      isVIP,
      isAtRisk,
      needsAttention,
      lastCalculatedAt: new Date()
    }
  });

  return metrics;
};

export const getClientChurnRisk: GetClientChurnRisk<{
  salonId: string;
  minRisk?: number;
  limit?: number;
}, any> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'clients:view');

  const minRisk = args.minRisk || 60;
  const limit = args.limit || 50;

  const atRiskClients = await context.entities.ClientMetrics.findMany({
    where: {
      salonId: args.salonId,
      churnRisk: {
        gte: minRisk
      }
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          profilePhotoUrl: true
        }
      }
    },
    orderBy: {
      churnRisk: 'desc'
    },
    take: limit
  });

  return atRiskClients;
};

export const getClientCLV: GetClientCLV<{
  salonId: string;
  orderBy?: 'lifetime' | 'predicted';
  limit?: number;
}, any> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'clients:view');

  const limit = args.limit || 50;
  const orderField = args.orderBy === 'predicted' ? 'predictedLTV' : 'lifetimeValue';

  const topClients = await context.entities.ClientMetrics.findMany({
    where: {
      salonId: args.salonId
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          profilePhotoUrl: true
        }
      }
    },
    orderBy: {
      [orderField]: 'desc'
    },
    take: limit
  });

  return topClients;
};

// ============================================================================
// Salon Analytics Operations
// ============================================================================

export const getRetentionAnalytics: GetRetentionAnalytics<{
  salonId: string;
}, any> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'analytics:view');

  // Get metrics grouped by retention status
  const statusCounts = await context.entities.ClientMetrics.groupBy({
    by: ['retentionStatus'],
    where: {
      salonId: args.salonId
    },
    _count: {
      id: true
    }
  });

  const total = statusCounts.reduce((sum, item) => sum + item._count.id, 0);

  const byStatus = statusCounts.map(item => ({
    status: item.retentionStatus,
    count: item._count.id,
    percentage: total > 0 ? (item._count.id / total) * 100 : 0
  }));

  // Calculate retention rate (active + new / total)
  const activeCount = statusCounts
    .filter(s => s.retentionStatus === 'ACTIVE' || s.retentionStatus === 'NEW')
    .reduce((sum, item) => sum + item._count.id, 0);

  const retentionRate = total > 0 ? (activeCount / total) * 100 : 0;

  // Calculate churn rate
  const churnedCount = statusCounts
    .filter(s => s.retentionStatus === 'CHURNED')
    .reduce((sum, item) => sum + item._count.id, 0);

  const churnRate = total > 0 ? (churnedCount / total) * 100 : 0;

  return {
    totalClients: total,
    retentionRate,
    churnRate,
    byStatus
  };
};

export const getCohortAnalysis: GetCohortAnalysis<GetCohortAnalysisInput, any> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'analytics:view');

  // Group clients by cohort month
  const cohortData = await context.entities.ClientMetrics.groupBy({
    by: ['cohortMonth'],
    where: {
      salonId: args.salonId,
      cohortMonth: {
        not: null
      }
    },
    _count: {
      id: true
    },
    _avg: {
      lifetimeValue: true,
      totalVisits: true,
      churnRisk: true
    }
  });

  const cohorts = cohortData.map(cohort => ({
    month: cohort.cohortMonth,
    clients: cohort._count.id,
    avgLTV: cohort._avg.lifetimeValue || 0,
    avgVisits: cohort._avg.totalVisits || 0,
    avgChurnRisk: cohort._avg.churnRisk || 0
  }));

  return cohorts.sort((a, b) => (a.month || '').localeCompare(b.month || ''));
};

export const updateSalonAnalytics: UpdateSalonAnalytics<{
  salonId: string;
  date?: string;
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
}, any> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'analytics:manage');

  const date = args.date ? new Date(args.date) : new Date();

  // Calculate metrics for the period
  const [
    totalClients,
    activeClients,
    newClients,
    churnedClients,
    appointments,
    sales
  ] = await Promise.all([
    context.entities.Client.count({
      where: { salonId: args.salonId }
    }),
    context.entities.ClientMetrics.count({
      where: {
        salonId: args.salonId,
        retentionStatus: 'ACTIVE'
      }
    }),
    context.entities.ClientMetrics.count({
      where: {
        salonId: args.salonId,
        retentionStatus: 'NEW'
      }
    }),
    context.entities.ClientMetrics.count({
      where: {
        salonId: args.salonId,
        retentionStatus: 'CHURNED'
      }
    }),
    context.entities.Appointment.findMany({
      where: {
        salonId: args.salonId
      }
    }),
    context.entities.Sale.findMany({
      where: {
        salonId: args.salonId,
        status: 'PAID'
      }
    })
  ]);

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.finalTotal, 0);
  const avgTransactionValue = sales.length > 0 ? totalRevenue / sales.length : 0;

  const completedAppointments = appointments.filter(a => a.status === 'DONE').length;
  const cancelledAppointments = appointments.filter(a => a.status === 'CANCELLED').length;
  const noShowAppointments = appointments.filter(a => a.isNoShow).length;

  const retentionRate = totalClients > 0 ? (activeClients / totalClients) * 100 : 0;
  const churnRate = totalClients > 0 ? (churnedClients / totalClients) * 100 : 0;

  // Get average CLV
  const avgCLV = await context.entities.ClientMetrics.aggregate({
    where: { salonId: args.salonId },
    _avg: { lifetimeValue: true }
  });

  const analytics = await context.entities.SalonAnalytics.upsert({
    where: {
      salonId_date_period: {
        salonId: args.salonId,
        date,
        period: args.period
      }
    },
    create: {
      salonId: args.salonId,
      date,
      period: args.period,
      totalClients,
      activeClients,
      newClients,
      churnedClients,
      reactivatedClients: 0,
      totalRevenue,
      avgTransactionValue,
      avgClientLTV: avgCLV._avg.lifetimeValue || 0,
      totalAppointments: appointments.length,
      completedAppointments,
      cancelledAppointments,
      noShowAppointments,
      retentionRate,
      churnRate,
      repeatClientRate: 0
    },
    update: {
      totalClients,
      activeClients,
      newClients,
      churnedClients,
      totalRevenue,
      avgTransactionValue,
      avgClientLTV: avgCLV._avg.lifetimeValue || 0,
      totalAppointments: appointments.length,
      completedAppointments,
      cancelledAppointments,
      noShowAppointments,
      retentionRate,
      churnRate
    }
  });

  return analytics;
};

export const getSalonDashboard: GetSalonDashboard<{
  salonId: string;
  period?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
}, any> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'analytics:view');

  const period = args.period || 'MONTHLY';

  const analytics = await context.entities.SalonAnalytics.findFirst({
    where: {
      salonId: args.salonId,
      period
    },
    orderBy: {
      date: 'desc'
    }
  });

  // Get additional real-time metrics
  const [atRiskCount, vipCount, avgChurnRisk] = await Promise.all([
    context.entities.ClientMetrics.count({
      where: {
        salonId: args.salonId,
        isAtRisk: true
      }
    }),
    context.entities.ClientMetrics.count({
      where: {
        salonId: args.salonId,
        isVIP: true
      }
    }),
    context.entities.ClientMetrics.aggregate({
      where: { salonId: args.salonId },
      _avg: { churnRisk: true }
    })
  ]);

  return {
    ...analytics,
    atRiskClients: atRiskCount,
    vipClients: vipCount,
    avgChurnRisk: avgChurnRisk._avg.churnRisk || 0
  };
};

export const getTopClients: GetTopClients<{
  salonId: string;
  orderBy: 'revenue' | 'visits' | 'clv';
  limit?: number;
}, any> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'clients:view');

  const limit = args.limit || 10;
  let orderField: any = { lifetimeValue: 'desc' };

  if (args.orderBy === 'visits') {
    orderField = { totalVisits: 'desc' };
  } else if (args.orderBy === 'clv') {
    orderField = { predictedLTV: 'desc' };
  }

  const topClients = await context.entities.ClientMetrics.findMany({
    where: {
      salonId: args.salonId
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          profilePhotoUrl: true
        }
      }
    },
    orderBy: orderField,
    take: limit
  });

  return topClients;
};

export const getClientPreferences: GetClientPreferences<{
  clientId: string;
  salonId: string;
}, any> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'clients:view');

  const metrics = await context.entities.ClientMetrics.findUnique({
    where: { clientId: args.clientId }
  });

  if (!metrics) {
    return null;
  }

  return {
    preferredServices: metrics.preferredServices,
    preferredProfessional: metrics.preferredProfessional,
    preferredDayOfWeek: metrics.preferredDayOfWeek,
    preferredTimeOfDay: metrics.preferredTimeOfDay,
    avgDaysBetweenVisits: metrics.avgDaysBetweenVisits
  };
};
