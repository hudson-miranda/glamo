import { HttpError } from 'wasp/server';
import { Prisma } from '@prisma/client';
import type { 
  GetSalesReport,
  GetCommissionsReport,
  GetInventoryReport,
  GetAppointmentReport,
  GetFinancialReport
} from 'wasp/server/operations';
import { requirePermission } from '../rbac/requirePermission';

// ============================================================================
// Types
// ============================================================================

type GetSalesReportInput = {
  salonId: string;
  startDate: string;
  endDate: string;
  groupBy?: 'day' | 'week' | 'month' | 'professional' | 'service' | 'product';
  professionalId?: string;
  serviceId?: string;
  productId?: string;
};

type GetCommissionsReportInput = {
  salonId: string;
  startDate: string;
  endDate: string;
  professionalId?: string;
  groupBy?: 'professional' | 'service' | 'day';
};

type GetInventoryReportInput = {
  salonId: string;
  categoryId?: string;
  brandId?: string;
  lowStockOnly?: boolean;
};

type GetAppointmentReportInput = {
  salonId: string;
  startDate: string;
  endDate: string;
  professionalId?: string;
  serviceId?: string;
  status?: 'PENDING' | 'CONFIRMED' | 'IN_SERVICE' | 'DONE' | 'CANCELLED';
  groupBy?: 'day' | 'professional' | 'service' | 'status';
};

type GetFinancialReportInput = {
  salonId: string;
  startDate: string;
  endDate: string;
  groupBy?: 'day' | 'week' | 'month' | 'payment_method';
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Gets a sales report with aggregated data.
 * Permission required: can_view_reports
 */
export const getSalesReport: GetSalesReport<GetSalesReportInput, any> = async (
  { salonId, startDate, endDate, groupBy = 'day', professionalId, serviceId, productId },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_view_reports', context.entities);

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Validate date range
  if (start > end) {
    throw new HttpError(400, 'Start date must be before end date');
  }

  // Build where clause
  const where: any = {
    salonId,
    createdAt: {
      gte: start,
      lte: end,
    },
    status: 'CLOSED', // Only count closed sales
  };

  if (professionalId) {
    where.employeeId = professionalId;
  }

  // Get sales with items
  const sales = await context.entities.Sale.findMany({
    where,
    include: {
      employee: {
        select: {
          id: true,
          name: true,
        },
      },
      saleServices: {
        include: {
          service: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        ...(serviceId ? { where: { serviceId } } : {}),
      },
      saleProducts: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        ...(productId ? { where: { productId } } : {}),
      },
      salePackages: {
        include: {
          package: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  // Calculate totals
  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.finalTotal, 0);
  const totalDiscount = sales.reduce((sum, sale) => sum + sale.discountTotal, 0);
  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

  // Group data based on groupBy parameter
  const groupedData: any = {};

  sales.forEach(sale => {
    let key: string;

    switch (groupBy) {
      case 'day':
        key = sale.createdAt.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(sale.createdAt);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${sale.createdAt.getFullYear()}-${String(sale.createdAt.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'professional':
        key = sale.employee.name || sale.employeeId;
        break;
      case 'service':
        // Count each service in the sale
        sale.saleServices.forEach(ss => {
          const serviceKey = ss.service.name;
          if (!groupedData[serviceKey]) {
            groupedData[serviceKey] = {
              count: 0,
              revenue: 0,
            };
          }
          groupedData[serviceKey].count += 1;
          groupedData[serviceKey].revenue += ss.finalPrice;
        });
        return; // Skip the default grouping below
      case 'product':
        // Count each product in the sale
        sale.saleProducts.forEach(sp => {
          const productKey = sp.product.name;
          if (!groupedData[productKey]) {
            groupedData[productKey] = {
              count: 0,
              revenue: 0,
              quantity: 0,
            };
          }
          groupedData[productKey].count += 1;
          groupedData[productKey].revenue += sp.finalPrice;
          groupedData[productKey].quantity += sp.quantity;
        });
        return; // Skip the default grouping below
      default:
        key = 'all';
    }

    if (!groupedData[key]) {
      groupedData[key] = {
        count: 0,
        revenue: 0,
        discount: 0,
      };
    }

    groupedData[key].count += 1;
    groupedData[key].revenue += sale.finalTotal;
    groupedData[key].discount += sale.discountTotal;
  });

  // Log access
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Report',
      entityId: salonId,
      action: 'VIEW',
      before: Prisma.DbNull,
      after: { type: 'sales', startDate, endDate, groupBy },
    },
  });

  return {
    summary: {
      totalSales,
      totalRevenue,
      totalDiscount,
      averageTicket,
      period: {
        startDate: startDate,
        endDate: endDate,
      },
    },
    groupedData,
  };
};

/**
 * Gets a commissions report (placeholder - requires commission tracking table).
 * Permission required: can_view_reports
 */
export const getCommissionsReport: GetCommissionsReport<GetCommissionsReportInput, any> = async (
  { salonId, startDate, endDate, professionalId, groupBy = 'professional' },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_view_reports', context.entities);

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Validate date range
  if (start > end) {
    throw new HttpError(400, 'Start date must be before end date');
  }

  // TODO: This would require a Commission table to track commissions
  // For now, return a placeholder structure

  // Log access
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Report',
      entityId: salonId,
      action: 'VIEW',
      before: Prisma.DbNull,
      after: { type: 'commissions', startDate, endDate, groupBy },
    },
  });

  return {
    message: 'Commission tracking table not yet implemented',
    summary: {
      totalCommissions: 0,
      period: {
        startDate,
        endDate,
      },
    },
    groupedData: {},
  };
};

/**
 * Gets an inventory report with stock levels and movements.
 * Permission required: can_view_reports
 */
export const getInventoryReport: GetInventoryReport<GetInventoryReportInput, any> = async (
  { salonId, categoryId, brandId, lowStockOnly = false },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_view_reports', context.entities);

  const where: any = {
    salonId,
    deletedAt: null,
  };

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (brandId) {
    where.brandId = brandId;
  }

  const products = await context.entities.Product.findMany({
    where,
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      brand: {
        select: {
          id: true,
          name: true,
        },
      },
      stockRecords: {
        orderBy: { createdAt: 'desc' },
        take: 5, // Last 5 movements per product
      },
    },
  });

  // Filter low stock if requested
  let reportProducts = products;
  if (lowStockOnly) {
    reportProducts = products.filter(p => p.stockQuantity <= p.minimumStock);
  }

  // Calculate summary
  const totalProducts = reportProducts.length;
  const totalStockValue = reportProducts.reduce(
    (sum, p) => sum + (p.stockQuantity * p.costPrice),
    0
  );
  const lowStockCount = reportProducts.filter(p => p.stockQuantity <= p.minimumStock).length;
  const outOfStockCount = reportProducts.filter(p => p.stockQuantity === 0).length;

  // Group by category
  const byCategory: any = {};
  reportProducts.forEach(product => {
    const categoryName = product.category?.name || 'Uncategorized';
    if (!byCategory[categoryName]) {
      byCategory[categoryName] = {
        products: 0,
        stockValue: 0,
        lowStock: 0,
      };
    }
    byCategory[categoryName].products += 1;
    byCategory[categoryName].stockValue += product.stockQuantity * product.costPrice;
    if (product.stockQuantity <= product.minimumStock) {
      byCategory[categoryName].lowStock += 1;
    }
  });

  // Log access
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Report',
      entityId: salonId,
      action: 'VIEW',
      before: Prisma.DbNull,
      after: { type: 'inventory', categoryId, brandId, lowStockOnly },
    },
  });

  return {
    summary: {
      totalProducts,
      totalStockValue,
      lowStockCount,
      outOfStockCount,
    },
    byCategory,
    products: reportProducts.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category?.name,
      brand: p.brand?.name,
      stockQuantity: p.stockQuantity,
      minimumStock: p.minimumStock,
      costPrice: p.costPrice,
      salePrice: p.salePrice,
      stockValue: p.stockQuantity * p.costPrice,
      isLowStock: p.stockQuantity <= p.minimumStock,
      isOutOfStock: p.stockQuantity === 0,
      recentMovements: p.stockRecords,
    })),
  };
};

/**
 * Gets an appointment report with statistics.
 * Permission required: can_view_reports
 */
export const getAppointmentReport: GetAppointmentReport<GetAppointmentReportInput, any> = async (
  { salonId, startDate, endDate, professionalId, serviceId, status, groupBy = 'day' },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_view_reports', context.entities);

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Validate date range
  if (start > end) {
    throw new HttpError(400, 'Start date must be before end date');
  }

  const where: any = {
    salonId,
    startAt: {
      gte: start,
      lte: end,
    },
  };

  if (professionalId) {
    where.professionalId = professionalId;
  }

  if (status) {
    where.status = status;
  }

  const appointments = await context.entities.Appointment.findMany({
    where,
    include: {
      professional: {
        select: {
          id: true,
          name: true,
        },
      },
      client: {
        select: {
          id: true,
          name: true,
        },
      },
      services: {
        include: {
          service: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        ...(serviceId ? { where: { serviceId } } : {}),
      },
    },
  });

  // Calculate totals
  const totalAppointments = appointments.length;
  const byStatus: any = {};
  
  appointments.forEach(apt => {
    if (!byStatus[apt.status]) {
      byStatus[apt.status] = 0;
    }
    byStatus[apt.status] += 1;
  });

  // Group data
  const groupedData: any = {};

  appointments.forEach(apt => {
    let key: string;

    switch (groupBy) {
      case 'day':
        key = apt.startAt.toISOString().split('T')[0];
        break;
      case 'professional':
        key = apt.professionalId;
        break;
      case 'service':
        apt.services.forEach(as => {
          const serviceKey = as.service.name;
          if (!groupedData[serviceKey]) {
            groupedData[serviceKey] = {
              count: 0,
            };
          }
          groupedData[serviceKey].count += 1;
        });
        return;
      case 'status':
        key = apt.status;
        break;
      default:
        key = 'all';
    }

    if (!groupedData[key]) {
      groupedData[key] = {
        count: 0,
      };
    }

    groupedData[key].count += 1;
  });

  // Log access
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Report',
      entityId: salonId,
      action: 'VIEW',
      before: Prisma.DbNull,
      after: { type: 'appointments', startDate, endDate, groupBy },
    },
  });

  return {
    summary: {
      totalAppointments,
      byStatus,
      period: {
        startDate,
        endDate,
      },
    },
    groupedData,
  };
};

/**
 * Gets a financial report with revenue and payment analysis.
 * Permission required: can_view_reports
 */
export const getFinancialReport: GetFinancialReport<GetFinancialReportInput, any> = async (
  { salonId, startDate, endDate, groupBy = 'day' },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_view_reports', context.entities);

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Validate date range
  if (start > end) {
    throw new HttpError(400, 'Start date must be before end date');
  }

  // Get all payments in the period
  const payments = await context.entities.Payment.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
      sale: {
        salonId,
      },
    },
    include: {
      method: true,
      sale: {
        select: {
          id: true,
          finalTotal: true,
          status: true,
        },
      },
    },
  });

  // Calculate totals
  const totalPayments = payments.length;
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const approvedPayments = payments.filter(p => p.status === 'PAID');
  const approvedRevenue = approvedPayments.reduce((sum, p) => sum + p.amount, 0);

  // Group by payment method
  const byPaymentMethod: any = {};
  payments.forEach(payment => {
    const methodName = payment.method.name;
    if (!byPaymentMethod[methodName]) {
      byPaymentMethod[methodName] = {
        count: 0,
        total: 0,
      };
    }
    byPaymentMethod[methodName].count += 1;
    byPaymentMethod[methodName].total += payment.amount;
  });

  // Group by time period if requested
  const groupedData: any = {};

  if (groupBy === 'payment_method') {
    Object.assign(groupedData, byPaymentMethod);
  } else {
    payments.forEach(payment => {
      let key: string;

      switch (groupBy) {
        case 'day':
          key = payment.createdAt.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(payment.createdAt);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${payment.createdAt.getFullYear()}-${String(payment.createdAt.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          key = 'all';
      }

      if (!groupedData[key]) {
        groupedData[key] = {
          count: 0,
          total: 0,
        };
      }

      groupedData[key].count += 1;
      groupedData[key].total += payment.amount;
    });
  }

  // Log access
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Report',
      entityId: salonId,
      action: 'VIEW',
      before: Prisma.DbNull,
      after: { type: 'financial', startDate, endDate, groupBy },
    },
  });

  return {
    summary: {
      totalPayments,
      totalRevenue,
      approvedRevenue,
      period: {
        startDate,
        endDate,
      },
    },
    byPaymentMethod,
    groupedData,
  };
};

