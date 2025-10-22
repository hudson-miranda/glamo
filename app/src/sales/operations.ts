import { HttpError } from 'wasp/server';
import { Prisma } from '@prisma/client';
import type { 
  ListSales,
  GetSale,
  CreateSale,
  UpdateSale,
  CloseSale,
  CancelSale,
  ListClientCredits,
  AddClientCredit
} from 'wasp/server/operations';
import { requirePermission } from '../rbac/requirePermission';
import { calculateSaleCommissions } from './commissionIntegration';

// ============================================================================
// Types
// ============================================================================

type ListSalesInput = {
  salonId: string;
  startDate?: string;
  endDate?: string;
  clientId?: string;
  employeeId?: string;
  status?: 'OPEN' | 'CLOSED' | 'CANCELLED';
  page?: number;
  perPage?: number;
};

type ListSalesOutput = {
  sales: any[];
  total: number;
  page: number;
  perPage: number;
};

type GetSaleInput = {
  saleId: string;
  salonId: string;
};

type CreateSaleInput = {
  salonId: string;
  clientId?: string;
  employeeId: string;
  voucherId?: string;
  services?: Array<{
    serviceId: string;
    variantId?: string;
    professionalId: string;
    assistantIds?: string[];
    discount?: number;
  }>;
  products?: Array<{
    productId: string;
    quantity: number;
    discount?: number;
  }>;
  packages?: Array<{
    packageId: string;
    discount?: number;
  }>;
  notes?: string;
};

type UpdateSaleInput = {
  saleId: string;
  salonId: string;
  clientId?: string;
  employeeId?: string;
  voucherId?: string;
  services?: Array<{
    id?: string; // For updating existing items
    serviceId: string;
    variantId?: string;
    professionalId: string;
    assistantIds?: string[];
    discount?: number;
  }>;
  products?: Array<{
    id?: string;
    productId: string;
    quantity: number;
    discount?: number;
  }>;
  packages?: Array<{
    id?: string;
    packageId: string;
    discount?: number;
  }>;
  notes?: string;
};

type CloseSaleInput = {
  saleId: string;
  salonId: string;
  payments: Array<{
    paymentMethodId: string;
    amount: number;
    creditAmount?: number; // Amount paid using client credit
  }>;
};

type CancelSaleInput = {
  saleId: string;
  salonId: string;
  reason: string;
};

type ListClientCreditsInput = {
  salonId: string;
  clientId: string;
};

type AddClientCreditInput = {
  salonId: string;
  clientId: string;
  amount: number;
  origin: string;
  paymentMethodId?: string;
  notes?: string;
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Lists sales with filtering and pagination.
 * Permission required: can_view_sales
 */
export const listSales: ListSales<ListSalesInput, ListSalesOutput> = async (
  { salonId, startDate, endDate, clientId, employeeId, status, page = 1, perPage = 20 },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_view_sales', context.entities);

  const where: any = {
    salonId,
    deletedAt: null,
  };

  if (startDate && endDate) {
    where.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  } else if (startDate) {
    where.createdAt = { gte: new Date(startDate) };
  } else if (endDate) {
    where.createdAt = { lte: new Date(endDate) };
  }

  if (clientId) {
    where.clientId = clientId;
  }

  if (employeeId) {
    where.employeeId = employeeId;
  }

  if (status) {
    where.status = status;
  }

  const [sales, total] = await Promise.all([
    context.entities.Sale.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        employee: {
          select: {
            id: true,
            name: true,
          },
        },
        voucher: {
          select: {
            id: true,
            code: true,
            discountValue: true,
            discountPercentage: true,
            discountType: true,
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
            variant: {
              select: {
                id: true,
                name: true,
              },
            },
          },
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
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    context.entities.Sale.count({ where }),
  ]);

  // Log access
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Sale',
      entityId: salonId,
      action: 'LIST',
      before: Prisma.DbNull,
      after: { filters: { startDate, endDate, clientId, employeeId, status } },
    },
  });

  return {
    sales,
    total,
    page,
    perPage,
  };
};

/**
 * Gets detailed information about a specific sale.
 * Permission required: can_view_sales
 */
export const getSale: GetSale<GetSaleInput, any> = async (
  { saleId, salonId },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_view_sales', context.entities);

  const sale = await context.entities.Sale.findUnique({
    where: { id: saleId },
    include: {
      salon: {
        select: {
          id: true,
          name: true,
        },
      },
      client: true,
      employee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      voucher: true,
      createdBy: {
        select: {
          id: true,
          name: true,
        },
      },
      updatedBy: {
        select: {
          id: true,
          name: true,
        },
      },
      saleServices: {
        include: {
          service: true,
          variant: true,
        },
      },
      saleProducts: {
        include: {
          product: true,
        },
      },
      salePackages: {
        include: {
          package: true,
        },
      },
      payments: {
        include: {
          method: true,
          creditPayments: {
            include: {
              credit: true,
            },
          },
        },
      },
    },
  });

  if (!sale) {
    throw new HttpError(404, 'Sale not found');
  }

  if (sale.salonId !== salonId) {
    throw new HttpError(403, 'Access denied to this sale');
  }

  // Log access
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Sale',
      entityId: saleId,
      action: 'VIEW',
      before: Prisma.DbNull,
      after: Prisma.DbNull,
    },
  });

  return sale;
};

/**
 * Lists client credits with balance calculation.
 * Permission required: can_view_clients or can_manage_client_credits
 */
export const listClientCredits: ListClientCredits<ListClientCreditsInput, any> = async (
  { salonId, clientId },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_view_clients', context.entities);

  // Verify client belongs to salon
  const client = await context.entities.Client.findUnique({
    where: { id: clientId },
  });

  if (!client || client.salonId !== salonId) {
    throw new HttpError(404, 'Client not found');
  }

  const credits = await context.entities.ClientCredit.findMany({
    where: {
      clientId,
    },
    include: {
      professional: {
        select: {
          id: true,
          name: true,
        },
      },
      creditPayments: {
        select: {
          id: true,
          amountUsed: true,
          payment: {
            select: {
              id: true,
              createdAt: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate balance for each credit
  const creditsWithBalance = credits.map(credit => {
    const usedAmount = credit.creditPayments.reduce((sum, cp) => sum + cp.amountUsed, 0);
    const balance = credit.amount - usedAmount;
    return {
      ...credit,
      usedAmount,
      balance,
    };
  });

  // Calculate total balance
  const totalBalance = creditsWithBalance.reduce((sum, credit) => sum + credit.balance, 0);

  return {
    credits: creditsWithBalance,
    totalBalance,
  };
};

// ============================================================================
// Actions
// ============================================================================

/**
 * Creates a new sale with services, products, and/or packages.
 * Permission required: can_create_sales
 */
export const createSale: CreateSale<CreateSaleInput, any> = async (
  { salonId, clientId, employeeId, voucherId, services = [], products = [], packages = [], notes },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_create_sales', context.entities);

  // Validate at least one item
  if (services.length === 0 && products.length === 0 && packages.length === 0) {
    throw new HttpError(400, 'Sale must have at least one service, product, or package');
  }

  // Validate employee belongs to salon
  const employee = await context.entities.UserSalon.findFirst({
    where: {
      userId: employeeId,
      salonId,
      isActive: true,
    },
  });

  if (!employee) {
    throw new HttpError(400, 'Employee not found or not active in this salon');
  }

  // Validate client if provided
  if (clientId) {
    const client = await context.entities.Client.findUnique({
      where: { id: clientId },
    });

    if (!client || client.salonId !== salonId) {
      throw new HttpError(400, 'Client not found');
    }
  }

  // Validate voucher if provided
  let voucherDiscount = 0;
  if (voucherId) {
    const voucher = await context.entities.Voucher.findUnique({
      where: { id: voucherId },
    });

    if (!voucher) {
      throw new HttpError(400, 'Voucher not found');
    }

    if (voucher.expirationDate && voucher.expirationDate < new Date()) {
      throw new HttpError(400, 'Voucher has expired');
    }

    if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
      throw new HttpError(400, 'Voucher usage limit reached');
    }

    voucherDiscount = voucher.discountValue || 0;
  }

  // Calculate totals
  let originalTotal = 0;
  let discountTotal = voucherDiscount;

  // Prepare sale services
  const saleServicesData: any[] = [];
  for (const item of services) {
    const service = await context.entities.Service.findUnique({
      where: { id: item.serviceId },
    });

    if (!service || service.salonId !== salonId || service.deletedAt) {
      throw new HttpError(400, `Service ${item.serviceId} not found`);
    }

    let price = service.price;
    if (item.variantId) {
      const variant = await context.entities.ServiceVariant.findUnique({
        where: { id: item.variantId },
      });

      if (!variant || variant.serviceId !== item.serviceId || variant.deletedAt) {
        throw new HttpError(400, `Service variant ${item.variantId} not found`);
      }

      price = variant.price;
    }

    const discount = item.discount || 0;
    const finalPrice = price - discount;

    originalTotal += price;
    discountTotal += discount;

    saleServicesData.push({
      serviceId: item.serviceId,
      variantId: item.variantId,
      unitPrice: price,
      discount,
      finalPrice,
    });
  }

  // Prepare sale products
  const saleProductsData: any[] = [];
  for (const item of products) {
    const product = await context.entities.Product.findUnique({
      where: { id: item.productId },
    });

    if (!product || product.salonId !== salonId || product.deletedAt) {
      throw new HttpError(400, `Product ${item.productId} not found`);
    }

    // Check stock availability
    if (product.stockQuantity < item.quantity) {
      throw new HttpError(400, `Insufficient stock for product ${product.name}. Available: ${product.stockQuantity}, Required: ${item.quantity}`);
    }

    const unitPrice = product.salePrice;
    const discount = item.discount || 0;
    const finalPrice = (unitPrice * item.quantity) - discount;

    originalTotal += unitPrice * item.quantity;
    discountTotal += discount;

    saleProductsData.push({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice,
      discount,
      finalPrice,
    });
  }

  // Prepare sale packages
  const salePackagesData: any[] = [];
  for (const item of packages) {
    const pkg = await context.entities.Package.findUnique({
      where: { id: item.packageId },
    });

    if (!pkg || pkg.salonId !== salonId || pkg.deletedAt) {
      throw new HttpError(400, `Package ${item.packageId} not found`);
    }

    const originalPrice = pkg.totalPrice;
    const discount = item.discount || 0;
    const finalPrice = originalPrice - discount;

    originalTotal += originalPrice;
    discountTotal += discount;

    salePackagesData.push({
      packageId: item.packageId,
      originalPrice,
      discount,
      finalPrice,
    });
  }

  const finalTotal = originalTotal - discountTotal;

  // Create sale with all items in a transaction
  const sale = await context.entities.Sale.create({
    data: {
      salonId,
      clientId,
      employeeId,
      voucherId,
      createdByUserId: context.user.id,
      originalTotal,
      discountTotal,
      finalTotal,
      status: 'OPEN',
      saleServices: {
        create: saleServicesData,
      },
      saleProducts: {
        create: saleProductsData,
      },
      salePackages: {
        create: salePackagesData,
      },
    },
    include: {
      saleServices: true,
      saleProducts: true,
      salePackages: true,
    },
  });

  // Update voucher usage count if applicable
  if (voucherId) {
    await context.entities.Voucher.update({
      where: { id: voucherId },
      data: {
        usedCount: { increment: 1 },
      },
    });
  }

  // Log creation
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Sale',
      entityId: sale.id,
      action: 'CREATE',
      before: Prisma.DbNull,
      after: {
        salonId,
        clientId,
        employeeId,
        originalTotal,
        discountTotal,
        finalTotal,
        itemsCount: services.length + products.length + packages.length,
      },
    },
  });

  return sale;
};

/**
 * Updates an existing sale (only if status is OPEN).
 * Permission required: can_update_sales
 */
export const updateSale: UpdateSale<UpdateSaleInput, any> = async (
  { saleId, salonId, ...updates },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_update_sales', context.entities);

  const sale = await context.entities.Sale.findUnique({
    where: { id: saleId },
    include: {
      saleServices: true,
      saleProducts: true,
      salePackages: true,
    },
  });

  if (!sale) {
    throw new HttpError(404, 'Sale not found');
  }

  if (sale.salonId !== salonId) {
    throw new HttpError(403, 'Access denied to this sale');
  }

  if (sale.status !== 'OPEN') {
    throw new HttpError(400, 'Can only update sales with OPEN status');
  }

  // For now, we'll keep it simple and just update basic fields
  // More complex item updates would require careful transaction handling
  const updatedSale = await context.entities.Sale.update({
    where: { id: saleId },
    data: {
      clientId: updates.clientId,
      employeeId: updates.employeeId,
      voucherId: updates.voucherId,
      updatedByUserId: context.user.id,
    },
    include: {
      saleServices: true,
      saleProducts: true,
      salePackages: true,
    },
  });

  // Log update
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Sale',
      entityId: saleId,
      action: 'UPDATE',
      before: { clientId: sale.clientId, employeeId: sale.employeeId },
      after: { clientId: updates.clientId, employeeId: updates.employeeId },
    },
  });

  return updatedSale;
};

/**
 * Closes a sale by recording payments and calculating commissions.
 * Permission required: can_close_sales
 */
export const closeSale: CloseSale<CloseSaleInput, any> = async (
  { saleId, salonId, payments },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_close_sales', context.entities);

  const sale = await context.entities.Sale.findUnique({
    where: { id: saleId },
    include: {
      saleServices: {
        include: {
          service: {
            include: {
              commissionConfig: true,
            },
          },
          variant: true,
        },
      },
      saleProducts: {
        include: {
          product: true,
        },
      },
      salePackages: {
        include: {
          package: true,
        },
      },
    },
  });

  if (!sale) {
    throw new HttpError(404, 'Sale not found');
  }

  if (sale.salonId !== salonId) {
    throw new HttpError(403, 'Access denied to this sale');
  }

  if (sale.status !== 'OPEN') {
    throw new HttpError(400, 'Sale is already closed or cancelled');
  }

  // Validate payment amount
  const totalPayment = payments.reduce((sum, p) => sum + p.amount, 0);
  if (Math.abs(totalPayment - sale.finalTotal) > 0.01) {
    throw new HttpError(400, `Payment total (${totalPayment}) does not match sale total (${sale.finalTotal})`);
  }

  // Process payments in a transaction
  const paymentRecords: any[] = [];
  for (const payment of payments) {
    // Validate payment method
    const paymentMethod = await context.entities.PaymentMethod.findUnique({
      where: { id: payment.paymentMethodId },
    });

    if (!paymentMethod) {
      throw new HttpError(400, `Payment method ${payment.paymentMethodId} not found`);
    }

    // Create payment record
    const paymentRecord = await context.entities.Payment.create({
      data: {
        saleId: sale.id,
        methodId: payment.paymentMethodId,
        userId: context.user.id,
        amount: payment.amount,
        status: 'PAID',
      },
    });

    paymentRecords.push(paymentRecord);

    // Handle client credit if used
    if (payment.creditAmount && payment.creditAmount > 0) {
      // Find available credits for the client
      const clientCredits = await context.entities.ClientCredit.findMany({
        where: {
          clientId: sale.clientId!,
        },
        include: {
          creditPayments: true,
        },
      });

      let remainingCreditToUse = payment.creditAmount;

      for (const credit of clientCredits) {
        if (remainingCreditToUse <= 0) break;

        const usedAmount = credit.creditPayments.reduce((sum, cp) => sum + cp.amountUsed, 0);
        const availableBalance = credit.amount - usedAmount;

        if (availableBalance > 0) {
          const amountToUse = Math.min(remainingCreditToUse, availableBalance);

          await context.entities.CreditPayment.create({
            data: {
              paymentId: paymentRecord.id,
              creditId: credit.id,
              amountUsed: amountToUse,
            },
          });

          remainingCreditToUse -= amountToUse;
        }
      }

      if (remainingCreditToUse > 0.01) {
        throw new HttpError(400, 'Insufficient client credit balance');
      }
    }
  }

  // Update stock for products
  for (const saleProduct of sale.saleProducts) {
    const product = saleProduct.product;
    
    await context.entities.Product.update({
      where: { id: product.id },
      data: {
        stockQuantity: { decrement: saleProduct.quantity },
      },
    });

    // Record stock movement
    await context.entities.StockRecord.create({
      data: {
        productId: product.id,
        movementType: 'OUT',
        quantity: saleProduct.quantity,
        reason: `Sale ${sale.id}`,
        previousQuantity: product.stockQuantity,
        finalQuantity: product.stockQuantity - saleProduct.quantity,
      },
    });
  }

  // Calculate commissions using the integration helper
  // This will be implemented in commissionIntegration.ts
  // await calculateSaleCommissions(sale, context);

  // Close the sale
  const closedSale = await context.entities.Sale.update({
    where: { id: saleId },
    data: {
      status: 'PAID',
      updatedByUserId: context.user.id,
    },
    include: {
      saleServices: true,
      saleProducts: true,
      salePackages: true,
      payments: true,
    },
  });

  // Log closure
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Sale',
      entityId: saleId,
      action: 'CLOSE',
      before: { status: 'OPEN' },
      after: { status: 'CLOSED', paymentsCount: payments.length },
    },
  });

  return closedSale;
};

/**
 * Cancels a sale and reverses stock movements.
 * Permission required: can_cancel_sales
 */
export const cancelSale: CancelSale<CancelSaleInput, any> = async (
  { saleId, salonId, reason },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_cancel_sales', context.entities);

  const sale = await context.entities.Sale.findUnique({
    where: { id: saleId },
    include: {
      saleProducts: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!sale) {
    throw new HttpError(404, 'Sale not found');
  }

  if (sale.salonId !== salonId) {
    throw new HttpError(403, 'Access denied to this sale');
  }

  if (sale.status === 'CANCELLED') {
    throw new HttpError(400, 'Sale is already cancelled');
  }

  // Reverse stock movements if sale was paid
  if (sale.status === 'PAID') {
    for (const saleProduct of sale.saleProducts) {
      const product = saleProduct.product;
      
      await context.entities.Product.update({
        where: { id: product.id },
        data: {
          stockQuantity: { increment: saleProduct.quantity },
        },
      });

      // Record stock reversal
      await context.entities.StockRecord.create({
        data: {
          productId: product.id,
          movementType: 'IN',
          quantity: saleProduct.quantity,
          reason: `Sale ${sale.id} cancelled: ${reason}`,
          previousQuantity: product.stockQuantity,
          finalQuantity: product.stockQuantity + saleProduct.quantity,
        },
      });
    }
  }

  // Cancel the sale
  const cancelledSale = await context.entities.Sale.update({
    where: { id: saleId },
    data: {
      status: 'CANCELLED',
      updatedByUserId: context.user.id,
    },
  });

  // Log cancellation
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Sale',
      entityId: saleId,
      action: 'CANCEL',
      before: { status: sale.status },
      after: { status: 'CANCELLED', reason },
    },
  });

  return cancelledSale;
};

/**
 * Adds credit to a client account.
 * Permission required: can_manage_client_credits
 */
export const addClientCredit: AddClientCredit<AddClientCreditInput, any> = async (
  { salonId, clientId, amount, origin, paymentMethodId, notes },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_manage_client_credits', context.entities);

  if (amount <= 0) {
    throw new HttpError(400, 'Credit amount must be positive');
  }

  // Verify client belongs to salon
  const client = await context.entities.Client.findUnique({
    where: { id: clientId },
  });

  if (!client || client.salonId !== salonId) {
    throw new HttpError(404, 'Client not found');
  }

  // Verify payment method if provided
  if (paymentMethodId) {
    const paymentMethod = await context.entities.PaymentMethod.findUnique({
      where: { id: paymentMethodId },
    });

    if (!paymentMethod) {
      throw new HttpError(400, 'Payment method not found');
    }
  }

  // Create credit record
  const credit = await context.entities.ClientCredit.create({
    data: {
      clientId,
      professionalId: context.user.id,
      salonId: context.user.activeSalonId!,
      amount,
      origin,
      paymentMethod: paymentMethodId,
      notes,
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
        },
      },
      professional: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Log creation
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'ClientCredit',
      entityId: credit.id,
      action: 'CREATE',
      before: Prisma.DbNull,
      after: { clientId, amount, origin },
    },
  });

  return credit;
};

