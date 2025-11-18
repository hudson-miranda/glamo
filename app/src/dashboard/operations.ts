import { HttpError } from 'wasp/server';
import type { GetDashboardAnalytics } from 'wasp/server/operations';
import { requirePermission } from '../rbac/permissions';

type DateRange = {
  startDate: string;
  endDate: string;
};

type DashboardAnalyticsInput = {
  salonId: string;
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
};

type DailyData = {
  date: string;
  sales: number;
  appointments: number;
  revenue: number;
};

type EmployeeStats = {
  id: string;
  name: string;
  appointmentCount: number;
  averageTicket: number;
  totalRevenue: number;
  profilePhoto?: string | null;
};

type ClientStats = {
  id: string;
  name: string;
  email?: string | null;
  totalSpent: number;
  visitCount: number;
  lastVisit?: string | null;
  birthDate?: string | null;
};

type CategorySales = {
  category: string;
  revenue: number;
  count: number;
};

type HeatmapData = {
  day: number; // 0-6 (Sunday-Saturday)
  hour: number; // 0-23
  count: number;
};

type OccupancyData = {
  employeeId: string;
  employeeName: string;
  totalMinutesAvailable: number;
  totalMinutesBooked: number;
  occupancyPercentage: number;
};

export type DashboardAnalyticsResult = {
  // Period info
  periodStart: string;
  periodEnd: string;
  previousPeriodStart: string;
  previousPeriodEnd: string;

  // Sales metrics
  totalSales: number;
  totalSalesCurrentDay: number;
  totalSalesPreviousPeriod: number;
  salesGrowth: number;

  // Appointments metrics
  totalAppointments: number;
  totalAppointmentsPreviousPeriod: number;
  appointmentsGrowth: number;
  appointmentsByStatus: {
    all: number;
    confirmed: number;
    billed: number;
    cancelled: number;
  };

  // Cash register (comandas)
  totalSessions: number;
  totalSessionsPreviousPeriod: number;
  sessionsGrowth: number;

  // Average ticket
  averageTicket: number;
  averageTicketPreviousPeriod: number;
  averageTicketGrowth: number;

  // Daily data for charts
  dailyData: DailyData[];
  dailyDataPreviousPeriod: DailyData[];

  // Employees
  employeeStats: EmployeeStats[];

  // Clients
  newClients: number;
  newClientsPreviousPeriod: number;
  topClients: ClientStats[];
  upcomingBirthdays: ClientStats[];
  retentionRate: number;

  // Sales by category
  salesByCategory: CategorySales[];

  // Payment methods
  paymentMethods: {
    method: string;
    total: number;
    count: number;
  }[];

  // Products vs Services
  productsRevenue: number;
  servicesRevenue: number;
  packagesRevenue: number;

  // Conversion rate
  conversionRate: number;

  // Cancellation rate
  cancellationRate: number;

  // Average service time (in minutes)
  averageServiceTime: number;

  // Peak hours
  peakHours: {
    hour: number;
    count: number;
  }[];

  // Heatmap data
  heatmapData: HeatmapData[];

  // Occupancy data
  occupancyData: OccupancyData[];
};

export const getDashboardAnalytics: GetDashboardAnalytics<
  DashboardAnalyticsInput,
  DashboardAnalyticsResult
> = async ({ salonId, startDate, endDate }, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  // Check permission
  await requirePermission(context.user, salonId, 'can_view_reports', context.entities);

  // Calculate date ranges
  const now = new Date();
  const periodEnd = endDate ? new Date(endDate) : now;
  const periodStart = startDate
    ? new Date(startDate)
    : new Date(periodEnd.getTime() - 14 * 24 * 60 * 60 * 1000); // Default: last 14 days

  // Calculate previous period
  const periodDuration = periodEnd.getTime() - periodStart.getTime();
  const previousPeriodEnd = new Date(periodStart.getTime() - 1);
  const previousPeriodStart = new Date(previousPeriodEnd.getTime() - periodDuration);

  // Helper function to get date range
  const getDateRange = (start: Date, end: Date): DateRange => ({
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  });

  const currentRange = getDateRange(periodStart, periodEnd);
  const previousRange = getDateRange(previousPeriodStart, previousPeriodEnd);

  // ====================
  // SALES DATA
  // ====================
  const [sales, previousSales] = await Promise.all([
    context.entities.Sale.findMany({
      where: {
        salonId,
        createdAt: {
          gte: periodStart,
          lte: periodEnd,
        },
        deletedAt: null,
      },
      include: {
        saleServices: {
          include: {
            service: true,
          },
        },
        saleProducts: {
          include: {
            product: true,
          },
        },
        salePackages: true,
        payments: true,
        employee: true,
      },
    }),
    context.entities.Sale.findMany({
      where: {
        salonId,
        createdAt: {
          gte: previousPeriodStart,
          lte: previousPeriodEnd,
        },
        deletedAt: null,
      },
    }),
  ]);

  const totalSales = sales.reduce((sum, sale) => sum + sale.finalTotal, 0);
  const totalSalesPreviousPeriod = previousSales.reduce((sum, sale) => sum + sale.finalTotal, 0);

  // Today's sales
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const todaySales = await context.entities.Sale.findMany({
    where: {
      salonId,
      createdAt: {
        gte: todayStart,
        lte: todayEnd,
      },
      deletedAt: null,
    },
  });

  const totalSalesCurrentDay = todaySales.reduce((sum, sale) => sum + sale.finalTotal, 0);

  // ====================
  // APPOINTMENTS DATA
  // ====================
  const [appointments, previousAppointments] = await Promise.all([
    context.entities.Appointment.findMany({
      where: {
        salonId,
        startAt: {
          gte: periodStart,
          lte: periodEnd,
        },
        deletedAt: null,
      },
      include: {
        services: {
          include: {
            service: true,
          },
        },
        employee: true,
        client: true,
      },
    }),
    context.entities.Appointment.findMany({
      where: {
        salonId,
        startAt: {
          gte: previousPeriodStart,
          lte: previousPeriodEnd,
        },
        deletedAt: null,
      },
    }),
  ]);

  const totalAppointments = appointments.length;
  const totalAppointmentsPreviousPeriod = previousAppointments.length;

  // Appointments by status
  const appointmentsByStatus = {
    all: appointments.length,
    confirmed: appointments.filter((apt) => apt.status === 'CONFIRMED').length,
    billed: appointments.filter((apt) => apt.paymentStatus === 'PAID').length,
    cancelled: appointments.filter((apt) => apt.status === 'CANCELLED').length,
  };

  // ====================
  // CASH REGISTER SESSIONS
  // ====================
  const [sessions, previousSessions] = await Promise.all([
    context.entities.CashRegisterSession.findMany({
      where: {
        salonId,
        openedAt: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
    }),
    context.entities.CashRegisterSession.findMany({
      where: {
        salonId,
        openedAt: {
          gte: previousPeriodStart,
          lte: previousPeriodEnd,
        },
      },
    }),
  ]);

  const totalSessions = sessions.length;
  const totalSessionsPreviousPeriod = previousSessions.length;

  // ====================
  // AVERAGE TICKET
  // ====================
  const averageTicket = sales.length > 0 ? totalSales / sales.length : 0;
  const averageTicketPreviousPeriod =
    previousSales.length > 0 ? totalSalesPreviousPeriod / previousSales.length : 0;

  // ====================
  // DAILY DATA
  // ====================
  const generateDailyData = (start: Date, end: Date, salesList: any[], aptList: any[]): DailyData[] => {
    const days: DailyData[] = [];
    const current = new Date(start);

    while (current <= end) {
      const dayStart = new Date(current);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(current);
      dayEnd.setHours(23, 59, 59, 999);

      const daySales = salesList.filter(
        (s) => new Date(s.createdAt) >= dayStart && new Date(s.createdAt) <= dayEnd
      );

      const dayApts = aptList.filter(
        (a) => new Date(a.startAt) >= dayStart && new Date(a.startAt) <= dayEnd
      );

      days.push({
        date: current.toISOString().split('T')[0],
        sales: daySales.length,
        appointments: dayApts.length,
        revenue: daySales.reduce((sum, s) => sum + s.finalTotal, 0),
      });

      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const dailyData = generateDailyData(periodStart, periodEnd, sales, appointments);
  const dailyDataPreviousPeriod = generateDailyData(
    previousPeriodStart,
    previousPeriodEnd,
    previousSales,
    previousAppointments
  );

  // ====================
  // EMPLOYEE STATS
  // ====================
  const employeeMap = new Map<string, EmployeeStats>();

  appointments.forEach((apt) => {
    if (!apt.employee) return;

    const empId = apt.employee.id;
    if (!employeeMap.has(empId)) {
      employeeMap.set(empId, {
        id: empId,
        name: apt.employee.name,
        appointmentCount: 0,
        averageTicket: 0,
        totalRevenue: 0,
        profilePhoto: apt.employee.profilePhoto,
      });
    }

    const emp = employeeMap.get(empId)!;
    emp.appointmentCount++;

    // Calculate revenue from appointments that were billed
    if (apt.finalPrice) {
      emp.totalRevenue += apt.finalPrice;
    }
  });

  // Calculate average ticket per employee
  employeeMap.forEach((emp) => {
    if (emp.appointmentCount > 0) {
      emp.averageTicket = emp.totalRevenue / emp.appointmentCount;
    }
  });

  const employeeStats = Array.from(employeeMap.values()).sort(
    (a, b) => b.appointmentCount - a.appointmentCount
  );

  // ====================
  // CLIENTS DATA
  // ====================
  const [newClients, previousNewClients] = await Promise.all([
    context.entities.Client.count({
      where: {
        salonId,
        createdAt: {
          gte: periodStart,
          lte: periodEnd,
        },
        deletedAt: null,
      },
    }),
    context.entities.Client.count({
      where: {
        salonId,
        createdAt: {
          gte: previousPeriodStart,
          lte: previousPeriodEnd,
        },
        deletedAt: null,
      },
    }),
  ]);

  // Top clients by spending
  const clientSpendingMap = new Map<string, ClientStats>();

  sales.forEach((sale) => {
    if (!sale.clientId) return;

    if (!clientSpendingMap.has(sale.clientId)) {
      clientSpendingMap.set(sale.clientId, {
        id: sale.clientId,
        name: sale.client?.name || 'Unknown',
        email: sale.client?.email,
        totalSpent: 0,
        visitCount: 0,
        birthDate: sale.client?.birthDate?.toISOString(),
      });
    }

    const client = clientSpendingMap.get(sale.clientId)!;
    client.totalSpent += sale.finalTotal;
    client.visitCount++;
  });

  const topClients = Array.from(clientSpendingMap.values())
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 3);

  // Upcoming birthdays (next 30 days)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const allClients = await context.entities.Client.findMany({
    where: {
      salonId,
      deletedAt: null,
      birthDate: { not: null },
    },
    select: {
      id: true,
      name: true,
      email: true,
      birthDate: true,
    },
  });

  const upcomingBirthdays = allClients
    .filter((client) => {
      if (!client.birthDate) return false;
      const birthday = new Date(client.birthDate);
      const today = new Date();

      // Get birthday this year
      const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());

      // If birthday already passed this year, check next year
      if (thisYearBirthday < today) {
        thisYearBirthday.setFullYear(today.getFullYear() + 1);
      }

      return thisYearBirthday <= thirtyDaysFromNow;
    })
    .map((client) => ({
      id: client.id,
      name: client.name,
      email: client.email,
      totalSpent: 0,
      visitCount: 0,
      birthDate: client.birthDate?.toISOString(),
    }))
    .slice(0, 5);

  // Retention rate: % of clients who returned
  const uniqueClients = new Set(appointments.map((apt) => apt.clientId));
  const returningClients = appointments.filter((apt) => {
    const previousVisit = appointments.find(
      (prev) => prev.clientId === apt.clientId && prev.startAt < apt.startAt
    );
    return !!previousVisit;
  });

  const retentionRate = uniqueClients.size > 0 ? (returningClients.length / uniqueClients.size) * 100 : 0;

  // ====================
  // SALES BY CATEGORY
  // ====================
  const categoryMap = new Map<string, CategorySales>();

  sales.forEach((sale) => {
    sale.saleServices?.forEach((ss) => {
      const category = ss.service?.category || 'Outros';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { category, revenue: 0, count: 0 });
      }
      const cat = categoryMap.get(category)!;
      cat.revenue += ss.finalPrice;
      cat.count++;
    });
  });

  const salesByCategory = Array.from(categoryMap.values()).sort((a, b) => b.revenue - a.revenue);

  // ====================
  // PAYMENT METHODS
  // ====================
  const paymentMethodMap = new Map<string, { method: string; total: number; count: number }>();

  sales.forEach((sale) => {
    sale.payments?.forEach((payment) => {
      const method = payment.method || 'Outros';
      if (!paymentMethodMap.has(method)) {
        paymentMethodMap.set(method, { method, total: 0, count: 0 });
      }
      const pm = paymentMethodMap.get(method)!;
      pm.total += payment.amount;
      pm.count++;
    });
  });

  const paymentMethods = Array.from(paymentMethodMap.values()).sort((a, b) => b.total - a.total);

  // ====================
  // PRODUCTS VS SERVICES VS PACKAGES
  // ====================
  const productsRevenue = sales.reduce((sum, sale) => {
    const productTotal = sale.saleProducts?.reduce((s, sp) => s + sp.finalPrice, 0) || 0;
    return sum + productTotal;
  }, 0);

  const servicesRevenue = sales.reduce((sum, sale) => {
    const serviceTotal = sale.saleServices?.reduce((s, ss) => s + ss.finalPrice, 0) || 0;
    return sum + serviceTotal;
  }, 0);

  const packagesRevenue = sales.reduce((sum, sale) => {
    const packageTotal = sale.salePackages?.reduce((s, sp) => s + sp.finalPrice, 0) || 0;
    return sum + packageTotal;
  }, 0);

  // ====================
  // CONVERSION RATE
  // ====================
  const billedAppointments = appointments.filter((apt) => apt.paymentStatus === 'PAID').length;
  const conversionRate = appointments.length > 0 ? (billedAppointments / appointments.length) * 100 : 0;

  // ====================
  // CANCELLATION RATE
  // ====================
  const cancelledAppointments = appointments.filter((apt) => apt.status === 'CANCELLED').length;
  const cancellationRate = appointments.length > 0 ? (cancelledAppointments / appointments.length) * 100 : 0;

  // ====================
  // AVERAGE SERVICE TIME
  // ====================
  const completedAppointments = appointments.filter((apt) => apt.endAt && apt.startAt);
  const totalMinutes = completedAppointments.reduce((sum, apt) => {
    const duration = new Date(apt.endAt!).getTime() - new Date(apt.startAt).getTime();
    return sum + duration / (1000 * 60);
  }, 0);
  const averageServiceTime = completedAppointments.length > 0 ? totalMinutes / completedAppointments.length : 0;

  // ====================
  // PEAK HOURS
  // ====================
  const hourMap = new Map<number, number>();

  appointments.forEach((apt) => {
    const hour = new Date(apt.startAt).getHours();
    hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
  });

  const peakHours = Array.from(hourMap.entries())
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // ====================
  // HEATMAP DATA
  // ====================
  const heatmapMap = new Map<string, number>();

  appointments.forEach((apt) => {
    const date = new Date(apt.startAt);
    const day = date.getDay();
    const hour = date.getHours();
    const key = `${day}-${hour}`;
    heatmapMap.set(key, (heatmapMap.get(key) || 0) + 1);
  });

  const heatmapData: HeatmapData[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const key = `${day}-${hour}`;
      heatmapData.push({
        day,
        hour,
        count: heatmapMap.get(key) || 0,
      });
    }
  }

  // ====================
  // OCCUPANCY DATA
  // ====================
  const employees = await context.entities.Employee.findMany({
    where: {
      salonId,
      isActive: true,
      deletedAt: null,
    },
    include: {
      schedules: true,
      appointments: {
        where: {
          startAt: {
            gte: periodStart,
            lte: periodEnd,
          },
          status: { not: 'CANCELLED' },
        },
      },
    },
  });

  const occupancyData: OccupancyData[] = employees.map((emp) => {
    // Calculate total available minutes from schedules
    const daysInPeriod = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (24 * 60 * 60 * 1000));
    const totalMinutesAvailable = emp.schedules.reduce((sum, schedule) => {
      // Assuming 8 hours per day as default if no specific schedule
      const minutesPerDay = 8 * 60;
      return sum + minutesPerDay * daysInPeriod;
    }, 0);

    // Calculate booked minutes
    const totalMinutesBooked = emp.appointments.reduce((sum, apt) => {
      if (apt.endAt && apt.startAt) {
        const duration = (new Date(apt.endAt).getTime() - new Date(apt.startAt).getTime()) / (1000 * 60);
        return sum + duration;
      }
      // Default 60 minutes if no end time
      return sum + 60;
    }, 0);

    const occupancyPercentage =
      totalMinutesAvailable > 0 ? (totalMinutesBooked / totalMinutesAvailable) * 100 : 0;

    return {
      employeeId: emp.id,
      employeeName: emp.name,
      totalMinutesAvailable: totalMinutesAvailable || 8 * 60 * daysInPeriod, // Default 8h/day
      totalMinutesBooked,
      occupancyPercentage,
    };
  });

  // ====================
  // CALCULATE GROWTH RATES
  // ====================
  const calculateGrowth = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const salesGrowth = calculateGrowth(totalSales, totalSalesPreviousPeriod);
  const appointmentsGrowth = calculateGrowth(totalAppointments, totalAppointmentsPreviousPeriod);
  const sessionsGrowth = calculateGrowth(totalSessions, totalSessionsPreviousPeriod);
  const averageTicketGrowth = calculateGrowth(averageTicket, averageTicketPreviousPeriod);

  // ====================
  // RETURN RESULT
  // ====================
  return {
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
    previousPeriodStart: previousPeriodStart.toISOString(),
    previousPeriodEnd: previousPeriodEnd.toISOString(),

    totalSales,
    totalSalesCurrentDay,
    totalSalesPreviousPeriod,
    salesGrowth,

    totalAppointments,
    totalAppointmentsPreviousPeriod,
    appointmentsGrowth,
    appointmentsByStatus,

    totalSessions,
    totalSessionsPreviousPeriod,
    sessionsGrowth,

    averageTicket,
    averageTicketPreviousPeriod,
    averageTicketGrowth,

    dailyData,
    dailyDataPreviousPeriod,

    employeeStats,

    newClients,
    newClientsPreviousPeriod,
    topClients,
    upcomingBirthdays,
    retentionRate,

    salesByCategory,
    paymentMethods,

    productsRevenue,
    servicesRevenue,
    packagesRevenue,

    conversionRate,
    cancellationRate,
    averageServiceTime,

    peakHours,
    heatmapData,
    occupancyData,
  };
};
