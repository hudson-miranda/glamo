import { HttpError } from 'wasp/server';
import { Prisma } from '@prisma/client';
import type {
  // Financial Categories
  ListFinancialCategories,
  CreateFinancialCategory,
  UpdateFinancialCategory,
  DeleteFinancialCategory,
  
  // Accounts Receivable
  ListAccountsReceivable,
  GetAccountReceivable,
  CreateAccountReceivable,
  UpdateAccountReceivable,
  DeleteAccountReceivable,
  ReceiveAccount,
  
  // Accounts Payable
  ListAccountsPayable,
  GetAccountPayable,
  CreateAccountPayable,
  UpdateAccountPayable,
  DeleteAccountPayable,
  PayAccount,
  
  // Expenses
  ListExpenses,
  CreateExpense,
  UpdateExpense,
  DeleteExpense,
  
  // Budgets
  ListBudgets,
  GetBudget,
  CreateBudget,
  UpdateBudget,
  DeleteBudget,
  
  // Financial Reports
  GetCashFlowReport,
  GetFinancialSummary,
  GetProfitAndLoss,
} from 'wasp/server/operations';
import { requirePermission } from '../rbac/requirePermission';

// ============================================================================
// Types - Financial Categories
// ============================================================================

type ListFinancialCategoriesInput = {
  salonId: string;
  type?: 'INCOME' | 'EXPENSE';
  includeDeleted?: boolean;
};

type CreateFinancialCategoryInput = {
  salonId: string;
  name: string;
  description?: string;
  type: 'INCOME' | 'EXPENSE';
  parentId?: string;
  color?: string;
};

type UpdateFinancialCategoryInput = {
  categoryId: string;
  salonId: string;
  name?: string;
  description?: string;
  parentId?: string;
  color?: string;
};

type DeleteFinancialCategoryInput = {
  categoryId: string;
  salonId: string;
};

// ============================================================================
// Types - Accounts Receivable
// ============================================================================

type ListAccountsReceivableInput = {
  salonId: string;
  status?: 'PENDING' | 'PAID' | 'OVERDUE' | 'PARTIALLY_PAID' | 'CANCELLED';
  clientId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  perPage?: number;
};

type GetAccountReceivableInput = {
  accountId: string;
  salonId: string;
};

type CreateAccountReceivableInput = {
  salonId: string;
  clientId?: string;
  categoryId?: string;
  description: string;
  amount: number;
  dueDate: Date;
  notes?: string;
  saleId?: string;
};

type UpdateAccountReceivableInput = {
  accountId: string;
  salonId: string;
  clientId?: string;
  categoryId?: string;
  description?: string;
  amount?: number;
  dueDate?: Date;
  notes?: string;
  status?: 'PENDING' | 'PAID' | 'OVERDUE' | 'PARTIALLY_PAID' | 'CANCELLED';
};

type DeleteAccountReceivableInput = {
  accountId: string;
  salonId: string;
};

type ReceiveAccountInput = {
  accountId: string;
  salonId: string;
  receivedDate?: Date;
};

// ============================================================================
// Types - Accounts Payable
// ============================================================================

type ListAccountsPayableInput = {
  salonId: string;
  status?: 'PENDING' | 'PAID' | 'OVERDUE' | 'PARTIALLY_PAID' | 'CANCELLED';
  supplierId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  perPage?: number;
};

type GetAccountPayableInput = {
  accountId: string;
  salonId: string;
};

type CreateAccountPayableInput = {
  salonId: string;
  supplierId?: string;
  categoryId?: string;
  description: string;
  amount: number;
  dueDate: Date;
  notes?: string;
};

type UpdateAccountPayableInput = {
  accountId: string;
  salonId: string;
  supplierId?: string;
  categoryId?: string;
  description?: string;
  amount?: number;
  dueDate?: Date;
  notes?: string;
  status?: 'PENDING' | 'PAID' | 'OVERDUE' | 'PARTIALLY_PAID' | 'CANCELLED';
};

type DeleteAccountPayableInput = {
  accountId: string;
  salonId: string;
};

type PayAccountInput = {
  accountId: string;
  salonId: string;
  paidDate?: Date;
};

// ============================================================================
// Types - Expenses
// ============================================================================

type ListExpensesInput = {
  salonId: string;
  categoryId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  perPage?: number;
};

type CreateExpenseInput = {
  salonId: string;
  categoryId?: string;
  description: string;
  amount: number;
  expenseDate?: Date;
  paymentMethod?: string;
  notes?: string;
};

type UpdateExpenseInput = {
  expenseId: string;
  salonId: string;
  categoryId?: string;
  description?: string;
  amount?: number;
  expenseDate?: Date;
  paymentMethod?: string;
  notes?: string;
};

type DeleteExpenseInput = {
  expenseId: string;
  salonId: string;
};

// ============================================================================
// Types - Budgets
// ============================================================================

type ListBudgetsInput = {
  salonId: string;
  status?: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
};

type GetBudgetInput = {
  budgetId: string;
  salonId: string;
};

type CreateBudgetInput = {
  salonId: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  totalPlanned: number;
  items: {
    categoryId?: string;
    description: string;
    plannedAmount: number;
  }[];
};

type UpdateBudgetInput = {
  budgetId: string;
  salonId: string;
  name?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  status?: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  items?: {
    id?: string;
    categoryId?: string;
    description: string;
    plannedAmount: number;
    actualAmount?: number;
  }[];
};

type DeleteBudgetInput = {
  budgetId: string;
  salonId: string;
};

// ============================================================================
// Types - Financial Reports
// ============================================================================

type GetCashFlowReportInput = {
  salonId: string;
  startDate: Date;
  endDate: Date;
};

type GetFinancialSummaryInput = {
  salonId: string;
  startDate: Date;
  endDate: Date;
};

type GetProfitAndLossInput = {
  salonId: string;
  startDate: Date;
  endDate: Date;
};

// ============================================================================
// Queries - Financial Categories
// ============================================================================

export const listFinancialCategories: ListFinancialCategories<ListFinancialCategoriesInput, any> = async (
  { salonId, type, includeDeleted = false },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_view_financial', context.entities);

  const where: any = { salonId };
  
  if (!includeDeleted) {
    where.deletedAt = null;
  }

  if (type) {
    where.type = type;
  }

  const categories = await context.entities.FinancialCategory.findMany({
    where,
    orderBy: { name: 'asc' },
    include: {
      parent: {
        select: {
          id: true,
          name: true,
        },
      },
      subCategories: {
        where: includeDeleted ? {} : { deletedAt: null },
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          accountsReceivable: true,
          accountsPayable: true,
          expenses: true,
        },
      },
    },
  });

  return categories;
};

// ============================================================================
// Actions - Financial Categories
// ============================================================================

export const createFinancialCategory: CreateFinancialCategory<CreateFinancialCategoryInput, any> = async (
  { salonId, name, description, type, parentId, color },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_manage_financial', context.entities);

  // Validate parent if provided
  if (parentId) {
    const parent = await context.entities.FinancialCategory.findUnique({
      where: { id: parentId },
    });

    if (!parent || parent.salonId !== salonId || parent.deletedAt) {
      throw new HttpError(400, 'Parent category not found');
    }

    if (parent.type !== type) {
      throw new HttpError(400, 'Parent category must be of the same type');
    }
  }

  const category = await context.entities.FinancialCategory.create({
    data: {
      salonId,
      name,
      description,
      type,
      parentId,
      color,
    },
    include: {
      parent: true,
      subCategories: true,
    },
  });

  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'FinancialCategory',
      entityId: category.id,
      action: 'CREATE',
      before: Prisma.DbNull,
      after: { name, type },
    },
  });

  return category;
};

export const updateFinancialCategory: UpdateFinancialCategory<UpdateFinancialCategoryInput, any> = async (
  { categoryId, salonId, ...updates },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_manage_financial', context.entities);

  const category = await context.entities.FinancialCategory.findUnique({
    where: { id: categoryId },
  });

  if (!category || category.salonId !== salonId) {
    throw new HttpError(404, 'Category not found');
  }

  if (category.deletedAt) {
    throw new HttpError(400, 'Cannot update deleted category');
  }

  // Validate parent if provided
  if (updates.parentId) {
    if (updates.parentId === categoryId) {
      throw new HttpError(400, 'Category cannot be its own parent');
    }

    const parent = await context.entities.FinancialCategory.findUnique({
      where: { id: updates.parentId },
    });

    if (!parent || parent.salonId !== salonId || parent.deletedAt) {
      throw new HttpError(400, 'Parent category not found');
    }

    if (parent.type !== category.type) {
      throw new HttpError(400, 'Parent category must be of the same type');
    }
  }

  const updatedCategory = await context.entities.FinancialCategory.update({
    where: { id: categoryId },
    data: updates,
    include: {
      parent: true,
      subCategories: true,
    },
  });

  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'FinancialCategory',
      entityId: categoryId,
      action: 'UPDATE',
      before: { name: category.name },
      after: { name: updates.name },
    },
  });

  return updatedCategory;
};

export const deleteFinancialCategory: DeleteFinancialCategory<DeleteFinancialCategoryInput, any> = async (
  { categoryId, salonId },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_manage_financial', context.entities);

  const category = await context.entities.FinancialCategory.findUnique({
    where: { id: categoryId },
    include: {
      subCategories: {
        where: { deletedAt: null },
        take: 1,
      },
      _count: {
        select: {
          accountsReceivable: true,
          accountsPayable: true,
          expenses: true,
        },
      },
    },
  });

  if (!category || category.salonId !== salonId) {
    throw new HttpError(404, 'Category not found');
  }

  if (category.subCategories.length > 0) {
    throw new HttpError(400, 'Cannot delete category with active subcategories');
  }

  const totalUsage = category._count.accountsReceivable + category._count.accountsPayable + category._count.expenses;
  if (totalUsage > 0) {
    throw new HttpError(400, 'Cannot delete category that is in use');
  }

  const deletedCategory = await context.entities.FinancialCategory.update({
    where: { id: categoryId },
    data: {
      deletedAt: new Date(),
    },
  });

  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'FinancialCategory',
      entityId: categoryId,
      action: 'DELETE',
      before: { name: category.name },
      after: Prisma.DbNull,
    },
  });

  return deletedCategory;
};

// ============================================================================
// Queries - Accounts Receivable
// ============================================================================

export const listAccountsReceivable: ListAccountsReceivable<ListAccountsReceivableInput, any> = async (
  { salonId, status, clientId, startDate, endDate, page = 1, perPage = 20 },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_view_financial', context.entities);

  const where: any = {
    salonId,
    deletedAt: null,
  };

  if (status) {
    where.status = status;
  } else {
    // Auto-update overdue accounts
    const today = new Date();
    await context.entities.AccountReceivable.updateMany({
      where: {
        salonId,
        status: 'PENDING',
        dueDate: { lt: today },
      },
      data: {
        status: 'OVERDUE',
      },
    });
  }

  if (clientId) {
    where.clientId = clientId;
  }

  if (startDate || endDate) {
    where.dueDate = {};
    if (startDate) where.dueDate.gte = startDate;
    if (endDate) where.dueDate.lte = endDate;
  }

  const [accounts, total] = await Promise.all([
    context.entities.AccountReceivable.findMany({
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
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        sale: {
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    context.entities.AccountReceivable.count({ where }),
  ]);

  return {
    accounts,
    total,
    page,
    perPage,
  };
};

export const getAccountReceivable: GetAccountReceivable<GetAccountReceivableInput, any> = async (
  { accountId, salonId },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_view_financial', context.entities);

  const account = await context.entities.AccountReceivable.findUnique({
    where: { id: accountId },
    include: {
      salon: {
        select: {
          id: true,
          name: true,
        },
      },
      client: true,
      category: true,
      sale: {
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
        },
      },
    },
  });

  if (!account) {
    throw new HttpError(404, 'Account not found');
  }

  if (account.salonId !== salonId) {
    throw new HttpError(403, 'Access denied to this account');
  }

  return account;
};

// ============================================================================
// Actions - Accounts Receivable
// ============================================================================

export const createAccountReceivable: CreateAccountReceivable<CreateAccountReceivableInput, any> = async (
  { salonId, clientId, categoryId, description, amount, dueDate, notes, saleId },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_manage_financial', context.entities);

  if (amount <= 0) {
    throw new HttpError(400, 'Amount must be positive');
  }

  // Validate client if provided
  if (clientId) {
    const client = await context.entities.Client.findUnique({
      where: { id: clientId },
    });

    if (!client || client.salonId !== salonId || client.deletedAt) {
      throw new HttpError(400, 'Client not found');
    }
  }

  // Validate category if provided
  if (categoryId) {
    const category = await context.entities.FinancialCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category || category.salonId !== salonId || category.type !== 'INCOME' || category.deletedAt) {
      throw new HttpError(400, 'Invalid category');
    }
  }

  // Validate sale if provided
  if (saleId) {
    const sale = await context.entities.Sale.findUnique({
      where: { id: saleId },
    });

    if (!sale || sale.salonId !== salonId) {
      throw new HttpError(400, 'Sale not found');
    }
  }

  // Check if due date is overdue
  const today = new Date();
  const status = dueDate < today ? 'OVERDUE' : 'PENDING';

  const account = await context.entities.AccountReceivable.create({
    data: {
      salonId,
      clientId,
      categoryId,
      description,
      amount,
      dueDate,
      notes,
      saleId,
      status,
    },
    include: {
      client: true,
      category: true,
    },
  });

  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'AccountReceivable',
      entityId: account.id,
      action: 'CREATE',
      before: Prisma.DbNull,
      after: { description, amount, dueDate },
    },
  });

  return account;
};

export const updateAccountReceivable: UpdateAccountReceivable<UpdateAccountReceivableInput, any> = async (
  { accountId, salonId, ...updates },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_manage_financial', context.entities);

  const account = await context.entities.AccountReceivable.findUnique({
    where: { id: accountId },
  });

  if (!account || account.salonId !== salonId) {
    throw new HttpError(404, 'Account not found');
  }

  if (account.deletedAt) {
    throw new HttpError(400, 'Cannot update deleted account');
  }

  if (account.status === 'PAID') {
    throw new HttpError(400, 'Cannot update paid account');
  }

  if (updates.amount !== undefined && updates.amount <= 0) {
    throw new HttpError(400, 'Amount must be positive');
  }

  // Validate client if provided
  if (updates.clientId) {
    const client = await context.entities.Client.findUnique({
      where: { id: updates.clientId },
    });

    if (!client || client.salonId !== salonId || client.deletedAt) {
      throw new HttpError(400, 'Client not found');
    }
  }

  // Validate category if provided
  if (updates.categoryId) {
    const category = await context.entities.FinancialCategory.findUnique({
      where: { id: updates.categoryId },
    });

    if (!category || category.salonId !== salonId || category.type !== 'INCOME' || category.deletedAt) {
      throw new HttpError(400, 'Invalid category');
    }
  }

  const updatedAccount = await context.entities.AccountReceivable.update({
    where: { id: accountId },
    data: updates,
    include: {
      client: true,
      category: true,
    },
  });

  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'AccountReceivable',
      entityId: accountId,
      action: 'UPDATE',
      before: { amount: account.amount, status: account.status },
      after: { amount: updates.amount, status: updates.status },
    },
  });

  return updatedAccount;
};

export const receiveAccount: ReceiveAccount<ReceiveAccountInput, any> = async (
  { accountId, salonId, receivedDate = new Date() },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_manage_financial', context.entities);

  const account = await context.entities.AccountReceivable.findUnique({
    where: { id: accountId },
  });

  if (!account || account.salonId !== salonId) {
    throw new HttpError(404, 'Account not found');
  }

  if (account.status === 'PAID') {
    throw new HttpError(400, 'Account is already paid');
  }

  if (account.status === 'CANCELLED') {
    throw new HttpError(400, 'Cannot receive cancelled account');
  }

  const updatedAccount = await context.entities.AccountReceivable.update({
    where: { id: accountId },
    data: {
      status: 'PAID',
      receivedDate,
    },
    include: {
      client: true,
      category: true,
    },
  });

  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'AccountReceivable',
      entityId: accountId,
      action: 'RECEIVE',
      before: { status: account.status },
      after: { status: 'PAID', receivedDate },
    },
  });

  return updatedAccount;
};

export const deleteAccountReceivable: DeleteAccountReceivable<DeleteAccountReceivableInput, any> = async (
  { accountId, salonId },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_manage_financial', context.entities);

  const account = await context.entities.AccountReceivable.findUnique({
    where: { id: accountId },
  });

  if (!account || account.salonId !== salonId) {
    throw new HttpError(404, 'Account not found');
  }

  if (account.status === 'PAID') {
    throw new HttpError(400, 'Cannot delete paid account');
  }

  const deletedAccount = await context.entities.AccountReceivable.update({
    where: { id: accountId },
    data: {
      deletedAt: new Date(),
    },
  });

  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'AccountReceivable',
      entityId: accountId,
      action: 'DELETE',
      before: { description: account.description, amount: account.amount },
      after: Prisma.DbNull,
    },
  });

  return deletedAccount;
};

// ============================================================================
// Queries - Accounts Payable
// ============================================================================

export const listAccountsPayable: ListAccountsPayable<ListAccountsPayableInput, any> = async (
  { salonId, status, supplierId, startDate, endDate, page = 1, perPage = 20 },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_view_financial', context.entities);

  const where: any = {
    salonId,
    deletedAt: null,
  };

  if (status) {
    where.status = status;
  } else {
    // Auto-update overdue accounts
    const today = new Date();
    await context.entities.AccountPayable.updateMany({
      where: {
        salonId,
        status: 'PENDING',
        dueDate: { lt: today },
      },
      data: {
        status: 'OVERDUE',
      },
    });
  }

  if (supplierId) {
    where.supplierId = supplierId;
  }

  if (startDate || endDate) {
    where.dueDate = {};
    if (startDate) where.dueDate.gte = startDate;
    if (endDate) where.dueDate.lte = endDate;
  }

  const [accounts, total] = await Promise.all([
    context.entities.AccountPayable.findMany({
      where,
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    context.entities.AccountPayable.count({ where }),
  ]);

  return {
    accounts,
    total,
    page,
    perPage,
  };
};

export const getAccountPayable: GetAccountPayable<GetAccountPayableInput, any> = async (
  { accountId, salonId },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_view_financial', context.entities);

  const account = await context.entities.AccountPayable.findUnique({
    where: { id: accountId },
    include: {
      salon: {
        select: {
          id: true,
          name: true,
        },
      },
      supplier: true,
      category: true,
    },
  });

  if (!account) {
    throw new HttpError(404, 'Account not found');
  }

  if (account.salonId !== salonId) {
    throw new HttpError(403, 'Access denied to this account');
  }

  return account;
};

// ============================================================================
// Actions - Accounts Payable
// ============================================================================

export const createAccountPayable: CreateAccountPayable<CreateAccountPayableInput, any> = async (
  { salonId, supplierId, categoryId, description, amount, dueDate, notes },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_manage_financial', context.entities);

  if (amount <= 0) {
    throw new HttpError(400, 'Amount must be positive');
  }

  // Validate supplier if provided
  if (supplierId) {
    const supplier = await context.entities.Supplier.findUnique({
      where: { id: supplierId },
    });

    if (!supplier || supplier.salonId !== salonId || supplier.deletedAt) {
      throw new HttpError(400, 'Supplier not found');
    }
  }

  // Validate category if provided
  if (categoryId) {
    const category = await context.entities.FinancialCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category || category.salonId !== salonId || category.type !== 'EXPENSE' || category.deletedAt) {
      throw new HttpError(400, 'Invalid category');
    }
  }

  // Check if due date is overdue
  const today = new Date();
  const status = dueDate < today ? 'OVERDUE' : 'PENDING';

  const account = await context.entities.AccountPayable.create({
    data: {
      salonId,
      supplierId,
      categoryId,
      description,
      amount,
      dueDate,
      notes,
      status,
    },
    include: {
      supplier: true,
      category: true,
    },
  });

  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'AccountPayable',
      entityId: account.id,
      action: 'CREATE',
      before: Prisma.DbNull,
      after: { description, amount, dueDate },
    },
  });

  return account;
};

export const updateAccountPayable: UpdateAccountPayable<UpdateAccountPayableInput, any> = async (
  { accountId, salonId, ...updates },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_manage_financial', context.entities);

  const account = await context.entities.AccountPayable.findUnique({
    where: { id: accountId },
  });

  if (!account || account.salonId !== salonId) {
    throw new HttpError(404, 'Account not found');
  }

  if (account.deletedAt) {
    throw new HttpError(400, 'Cannot update deleted account');
  }

  if (account.status === 'PAID') {
    throw new HttpError(400, 'Cannot update paid account');
  }

  if (updates.amount !== undefined && updates.amount <= 0) {
    throw new HttpError(400, 'Amount must be positive');
  }

  // Validate supplier if provided
  if (updates.supplierId) {
    const supplier = await context.entities.Supplier.findUnique({
      where: { id: updates.supplierId },
    });

    if (!supplier || supplier.salonId !== salonId || supplier.deletedAt) {
      throw new HttpError(400, 'Supplier not found');
    }
  }

  // Validate category if provided
  if (updates.categoryId) {
    const category = await context.entities.FinancialCategory.findUnique({
      where: { id: updates.categoryId },
    });

    if (!category || category.salonId !== salonId || category.type !== 'EXPENSE' || category.deletedAt) {
      throw new HttpError(400, 'Invalid category');
    }
  }

  const updatedAccount = await context.entities.AccountPayable.update({
    where: { id: accountId },
    data: updates,
    include: {
      supplier: true,
      category: true,
    },
  });

  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'AccountPayable',
      entityId: accountId,
      action: 'UPDATE',
      before: { amount: account.amount, status: account.status },
      after: { amount: updates.amount, status: updates.status },
    },
  });

  return updatedAccount;
};

export const payAccount: PayAccount<PayAccountInput, any> = async (
  { accountId, salonId, paidDate = new Date() },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_manage_financial', context.entities);

  const account = await context.entities.AccountPayable.findUnique({
    where: { id: accountId },
  });

  if (!account || account.salonId !== salonId) {
    throw new HttpError(404, 'Account not found');
  }

  if (account.status === 'PAID') {
    throw new HttpError(400, 'Account is already paid');
  }

  if (account.status === 'CANCELLED') {
    throw new HttpError(400, 'Cannot pay cancelled account');
  }

  const updatedAccount = await context.entities.AccountPayable.update({
    where: { id: accountId },
    data: {
      status: 'PAID',
      paidDate,
    },
    include: {
      supplier: true,
      category: true,
    },
  });

  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'AccountPayable',
      entityId: accountId,
      action: 'PAY',
      before: { status: account.status },
      after: { status: 'PAID', paidDate },
    },
  });

  return updatedAccount;
};

export const deleteAccountPayable: DeleteAccountPayable<DeleteAccountPayableInput, any> = async (
  { accountId, salonId },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_manage_financial', context.entities);

  const account = await context.entities.AccountPayable.findUnique({
    where: { id: accountId },
  });

  if (!account || account.salonId !== salonId) {
    throw new HttpError(404, 'Account not found');
  }

  if (account.status === 'PAID') {
    throw new HttpError(400, 'Cannot delete paid account');
  }

  const deletedAccount = await context.entities.AccountPayable.update({
    where: { id: accountId },
    data: {
      deletedAt: new Date(),
    },
  });

  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'AccountPayable',
      entityId: accountId,
      action: 'DELETE',
      before: { description: account.description, amount: account.amount },
      after: Prisma.DbNull,
    },
  });

  return deletedAccount;
};

// ============================================================================
// Queries - Expenses
// ============================================================================

export const listExpenses: ListExpenses<ListExpensesInput, any> = async (
  { salonId, categoryId, startDate, endDate, page = 1, perPage = 20 },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_view_financial', context.entities);

  const where: any = {
    salonId,
    deletedAt: null,
  };

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (startDate || endDate) {
    where.expenseDate = {};
    if (startDate) where.expenseDate.gte = startDate;
    if (endDate) where.expenseDate.lte = endDate;
  }

  const [expenses, total] = await Promise.all([
    context.entities.Expense.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: { expenseDate: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    context.entities.Expense.count({ where }),
  ]);

  return {
    expenses,
    total,
    page,
    perPage,
  };
};

// ============================================================================
// Actions - Expenses
// ============================================================================

export const createExpense: CreateExpense<CreateExpenseInput, any> = async (
  { salonId, categoryId, description, amount, expenseDate = new Date(), paymentMethod, notes },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_manage_financial', context.entities);

  if (amount <= 0) {
    throw new HttpError(400, 'Amount must be positive');
  }

  // Validate category if provided
  if (categoryId) {
    const category = await context.entities.FinancialCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category || category.salonId !== salonId || category.type !== 'EXPENSE' || category.deletedAt) {
      throw new HttpError(400, 'Invalid category');
    }
  }

  const expense = await context.entities.Expense.create({
    data: {
      salonId,
      categoryId,
      description,
      amount,
      expenseDate,
      paymentMethod,
      notes,
    },
    include: {
      category: true,
    },
  });

  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Expense',
      entityId: expense.id,
      action: 'CREATE',
      before: Prisma.DbNull,
      after: { description, amount, expenseDate },
    },
  });

  return expense;
};

export const updateExpense: UpdateExpense<UpdateExpenseInput, any> = async (
  { expenseId, salonId, ...updates },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_manage_financial', context.entities);

  const expense = await context.entities.Expense.findUnique({
    where: { id: expenseId },
  });

  if (!expense || expense.salonId !== salonId) {
    throw new HttpError(404, 'Expense not found');
  }

  if (expense.deletedAt) {
    throw new HttpError(400, 'Cannot update deleted expense');
  }

  if (updates.amount !== undefined && updates.amount <= 0) {
    throw new HttpError(400, 'Amount must be positive');
  }

  // Validate category if provided
  if (updates.categoryId) {
    const category = await context.entities.FinancialCategory.findUnique({
      where: { id: updates.categoryId },
    });

    if (!category || category.salonId !== salonId || category.type !== 'EXPENSE' || category.deletedAt) {
      throw new HttpError(400, 'Invalid category');
    }
  }

  const updatedExpense = await context.entities.Expense.update({
    where: { id: expenseId },
    data: updates,
    include: {
      category: true,
    },
  });

  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Expense',
      entityId: expenseId,
      action: 'UPDATE',
      before: { amount: expense.amount },
      after: { amount: updates.amount },
    },
  });

  return updatedExpense;
};

export const deleteExpense: DeleteExpense<DeleteExpenseInput, any> = async (
  { expenseId, salonId },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_manage_financial', context.entities);

  const expense = await context.entities.Expense.findUnique({
    where: { id: expenseId },
  });

  if (!expense || expense.salonId !== salonId) {
    throw new HttpError(404, 'Expense not found');
  }

  const deletedExpense = await context.entities.Expense.update({
    where: { id: expenseId },
    data: {
      deletedAt: new Date(),
    },
  });

  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Expense',
      entityId: expenseId,
      action: 'DELETE',
      before: { description: expense.description, amount: expense.amount },
      after: Prisma.DbNull,
    },
  });

  return deletedExpense;
};

// ============================================================================
// Queries - Budgets
// ============================================================================

export const listBudgets: ListBudgets<ListBudgetsInput, any> = async (
  { salonId, status },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_view_financial', context.entities);

  const where: any = {
    salonId,
    deletedAt: null,
  };

  if (status) {
    where.status = status;
  }

  const budgets = await context.entities.Budget.findMany({
    where,
    include: {
      budgetItems: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      },
    },
    orderBy: { startDate: 'desc' },
  });

  return budgets;
};

export const getBudget: GetBudget<GetBudgetInput, any> = async (
  { budgetId, salonId },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_view_financial', context.entities);

  const budget = await context.entities.Budget.findUnique({
    where: { id: budgetId },
    include: {
      salon: {
        select: {
          id: true,
          name: true,
        },
      },
      budgetItems: {
        include: {
          category: true,
        },
      },
    },
  });

  if (!budget) {
    throw new HttpError(404, 'Budget not found');
  }

  if (budget.salonId !== salonId) {
    throw new HttpError(403, 'Access denied to this budget');
  }

  return budget;
};

// ============================================================================
// Actions - Budgets
// ============================================================================

export const createBudget: CreateBudget<CreateBudgetInput, any> = async (
  { salonId, name, description, startDate, endDate, totalPlanned, items },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_manage_financial', context.entities);

  if (totalPlanned <= 0) {
    throw new HttpError(400, 'Total planned must be positive');
  }

  if (endDate <= startDate) {
    throw new HttpError(400, 'End date must be after start date');
  }

  if (!items || items.length === 0) {
    throw new HttpError(400, 'Budget must have at least one item');
  }

  // Validate total of items matches totalPlanned
  const itemsTotal = items.reduce((sum, item) => sum + item.plannedAmount, 0);
  if (Math.abs(itemsTotal - totalPlanned) > 0.01) {
    throw new HttpError(400, 'Sum of item amounts must match total planned');
  }

  // Validate categories
  for (const item of items) {
    if (item.categoryId) {
      const category = await context.entities.FinancialCategory.findUnique({
        where: { id: item.categoryId },
      });

      if (!category || category.salonId !== salonId || category.deletedAt) {
        throw new HttpError(400, `Invalid category: ${item.categoryId}`);
      }
    }
  }

  const budget = await context.entities.Budget.create({
    data: {
      salonId,
      name,
      description,
      startDate,
      endDate,
      totalPlanned,
      budgetItems: {
        create: items,
      },
    },
    include: {
      budgetItems: {
        include: {
          category: true,
        },
      },
    },
  });

  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Budget',
      entityId: budget.id,
      action: 'CREATE',
      before: Prisma.DbNull,
      after: { name, totalPlanned, itemCount: items.length },
    },
  });

  return budget;
};

export const updateBudget: UpdateBudget<UpdateBudgetInput, any> = async (
  { budgetId, salonId, items, ...updates },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_manage_financial', context.entities);

  const budget = await context.entities.Budget.findUnique({
    where: { id: budgetId },
    include: {
      budgetItems: true,
    },
  });

  if (!budget || budget.salonId !== salonId) {
    throw new HttpError(404, 'Budget not found');
  }

  if (budget.deletedAt) {
    throw new HttpError(400, 'Cannot update deleted budget');
  }

  if (budget.status === 'COMPLETED' || budget.status === 'CANCELLED') {
    throw new HttpError(400, 'Cannot update completed or cancelled budget');
  }

  if (updates.startDate && updates.endDate && updates.endDate <= updates.startDate) {
    throw new HttpError(400, 'End date must be after start date');
  }

  // Update items if provided
  if (items) {
    // Delete existing items
    await context.entities.BudgetItem.deleteMany({
      where: { budgetId },
    });

    // Create new items
    for (const item of items) {
      await context.entities.BudgetItem.create({
        data: {
          budgetId,
          categoryId: item.categoryId,
          description: item.description,
          plannedAmount: item.plannedAmount,
          actualAmount: item.actualAmount || 0,
        },
      });
    }
  }

  const updatedBudget = await context.entities.Budget.update({
    where: { id: budgetId },
    data: updates,
    include: {
      budgetItems: {
        include: {
          category: true,
        },
      },
    },
  });

  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Budget',
      entityId: budgetId,
      action: 'UPDATE',
      before: { name: budget.name, status: budget.status },
      after: { name: updates.name, status: updates.status },
    },
  });

  return updatedBudget;
};

export const deleteBudget: DeleteBudget<DeleteBudgetInput, any> = async (
  { budgetId, salonId },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_manage_financial', context.entities);

  const budget = await context.entities.Budget.findUnique({
    where: { id: budgetId },
  });

  if (!budget || budget.salonId !== salonId) {
    throw new HttpError(404, 'Budget not found');
  }

  if (budget.status === 'COMPLETED') {
    throw new HttpError(400, 'Cannot delete completed budget');
  }

  const deletedBudget = await context.entities.Budget.update({
    where: { id: budgetId },
    data: {
      deletedAt: new Date(),
    },
  });

  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Budget',
      entityId: budgetId,
      action: 'DELETE',
      before: { name: budget.name },
      after: Prisma.DbNull,
    },
  });

  return deletedBudget;
};

// ============================================================================
// Financial Reports
// ============================================================================

export const getCashFlowReport: GetCashFlowReport<GetCashFlowReportInput, any> = async (
  { salonId, startDate, endDate },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_view_financial', context.entities);

  // Get all income (sales and received accounts)
  const [sales, receivedAccounts] = await Promise.all([
    context.entities.Sale.findMany({
      where: {
        salonId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: 'PAID',
        deletedAt: null,
      },
      select: {
        finalTotal: true,
        createdAt: true,
      },
    }),
    context.entities.AccountReceivable.findMany({
      where: {
        salonId,
        receivedDate: {
          gte: startDate,
          lte: endDate,
        },
        status: 'PAID',
        deletedAt: null,
      },
      select: {
        amount: true,
        receivedDate: true,
      },
    }),
  ]);

  // Get all expenses (paid accounts and expenses)
  const [paidAccounts, expenses] = await Promise.all([
    context.entities.AccountPayable.findMany({
      where: {
        salonId,
        paidDate: {
          gte: startDate,
          lte: endDate,
        },
        status: 'PAID',
        deletedAt: null,
      },
      select: {
        amount: true,
        paidDate: true,
      },
    }),
    context.entities.Expense.findMany({
      where: {
        salonId,
        expenseDate: {
          gte: startDate,
          lte: endDate,
        },
        deletedAt: null,
      },
      select: {
        amount: true,
        expenseDate: true,
      },
    }),
  ]);

  // Calculate totals
  const totalIncome = 
    sales.reduce((sum, s) => sum + s.finalTotal, 0) +
    receivedAccounts.reduce((sum, a) => sum + a.amount, 0);

  const totalExpenses = 
    paidAccounts.reduce((sum, a) => sum + a.amount, 0) +
    expenses.reduce((sum, e) => sum + e.amount, 0);

  const netCashFlow = totalIncome - totalExpenses;

  // Organize by day
  const dailyCashFlow: Record<string, { date: Date; income: number; expenses: number; net: number }> = {};

  // Process sales
  sales.forEach(sale => {
    const dateKey = sale.createdAt.toISOString().split('T')[0];
    if (!dailyCashFlow[dateKey]) {
      dailyCashFlow[dateKey] = { date: sale.createdAt, income: 0, expenses: 0, net: 0 };
    }
    dailyCashFlow[dateKey].income += sale.finalTotal;
  });

  // Process received accounts
  receivedAccounts.forEach(account => {
    if (!account.receivedDate) return;
    const dateKey = account.receivedDate.toISOString().split('T')[0];
    if (!dailyCashFlow[dateKey]) {
      dailyCashFlow[dateKey] = { date: account.receivedDate, income: 0, expenses: 0, net: 0 };
    }
    dailyCashFlow[dateKey].income += account.amount;
  });

  // Process paid accounts
  paidAccounts.forEach(account => {
    if (!account.paidDate) return;
    const dateKey = account.paidDate.toISOString().split('T')[0];
    if (!dailyCashFlow[dateKey]) {
      dailyCashFlow[dateKey] = { date: account.paidDate, income: 0, expenses: 0, net: 0 };
    }
    dailyCashFlow[dateKey].expenses += account.amount;
  });

  // Process expenses
  expenses.forEach(expense => {
    const dateKey = expense.expenseDate.toISOString().split('T')[0];
    if (!dailyCashFlow[dateKey]) {
      dailyCashFlow[dateKey] = { date: expense.expenseDate, income: 0, expenses: 0, net: 0 };
    }
    dailyCashFlow[dateKey].expenses += expense.amount;
  });

  // Calculate net for each day
  Object.values(dailyCashFlow).forEach(day => {
    day.net = day.income - day.expenses;
  });

  return {
    summary: {
      totalIncome,
      totalExpenses,
      netCashFlow,
    },
    dailyFlow: Object.values(dailyCashFlow).sort((a, b) => a.date.getTime() - b.date.getTime()),
  };
};

export const getFinancialSummary: GetFinancialSummary<GetFinancialSummaryInput, any> = async (
  { salonId, startDate, endDate },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_view_financial', context.entities);

  // Get accounts receivable summary
  const accountsReceivable = await context.entities.AccountReceivable.groupBy({
    by: ['status'],
    where: {
      salonId,
      dueDate: {
        gte: startDate,
        lte: endDate,
      },
      deletedAt: null,
    },
    _sum: {
      amount: true,
    },
    _count: true,
  });

  // Get accounts payable summary
  const accountsPayable = await context.entities.AccountPayable.groupBy({
    by: ['status'],
    where: {
      salonId,
      dueDate: {
        gte: startDate,
        lte: endDate,
      },
      deletedAt: null,
    },
    _sum: {
      amount: true,
    },
    _count: true,
  });

  // Get expenses by category
  const expensesByCategory = await context.entities.Expense.groupBy({
    by: ['categoryId'],
    where: {
      salonId,
      expenseDate: {
        gte: startDate,
        lte: endDate,
      },
      deletedAt: null,
    },
    _sum: {
      amount: true,
    },
    _count: true,
  });

  // Get category details
  const categoryIds = expensesByCategory
    .map(e => e.categoryId)
    .filter((id): id is string => id !== null);
  
  const categories = await context.entities.FinancialCategory.findMany({
    where: {
      id: { in: categoryIds },
    },
    select: {
      id: true,
      name: true,
      color: true,
    },
  });

  const categoryMap = new Map(categories.map(c => [c.id, c]));

  return {
    accountsReceivable: {
      byStatus: accountsReceivable.map(ar => ({
        status: ar.status,
        total: ar._sum.amount || 0,
        count: ar._count,
      })),
      totalAmount: accountsReceivable.reduce((sum, ar) => sum + (ar._sum.amount || 0), 0),
      totalCount: accountsReceivable.reduce((sum, ar) => sum + ar._count, 0),
    },
    accountsPayable: {
      byStatus: accountsPayable.map(ap => ({
        status: ap.status,
        total: ap._sum.amount || 0,
        count: ap._count,
      })),
      totalAmount: accountsPayable.reduce((sum, ap) => sum + (ap._sum.amount || 0), 0),
      totalCount: accountsPayable.reduce((sum, ap) => sum + ap._count, 0),
    },
    expenses: {
      byCategory: expensesByCategory.map(e => ({
        categoryId: e.categoryId,
        categoryName: e.categoryId ? categoryMap.get(e.categoryId)?.name : 'Uncategorized',
        categoryColor: e.categoryId ? categoryMap.get(e.categoryId)?.color : null,
        total: e._sum.amount || 0,
        count: e._count,
      })),
      totalAmount: expensesByCategory.reduce((sum, e) => sum + (e._sum.amount || 0), 0),
      totalCount: expensesByCategory.reduce((sum, e) => sum + e._count, 0),
    },
  };
};

export const getProfitAndLoss: GetProfitAndLoss<GetProfitAndLossInput, any> = async (
  { salonId, startDate, endDate },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_view_financial', context.entities);

  // Calculate revenue (closed sales)
  const sales = await context.entities.Sale.findMany({
    where: {
      salonId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      status: 'PAID',
      deletedAt: null,
    },
    include: {
      saleServices: {
        include: {
          service: {
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
              costPrice: true,
            },
          },
        },
      },
    },
  });

  let totalRevenue = 0;
  let serviceRevenue = 0;
  let productRevenue = 0;
  let productCost = 0;

  sales.forEach(sale => {
    totalRevenue += sale.finalTotal;
    
    sale.saleServices.forEach(ss => {
      serviceRevenue += ss.finalPrice;
    });

    sale.saleProducts.forEach(sp => {
      productRevenue += sp.finalPrice;
      productCost += sp.product.costPrice * sp.quantity;
    });
  });

  // Calculate expenses
  const [expenses, paidAccounts] = await Promise.all([
    context.entities.Expense.findMany({
      where: {
        salonId,
        expenseDate: {
          gte: startDate,
          lte: endDate,
        },
        deletedAt: null,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    context.entities.AccountPayable.findMany({
      where: {
        salonId,
        paidDate: {
          gte: startDate,
          lte: endDate,
        },
        status: 'PAID',
        deletedAt: null,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
  ]);

  const expensesByCategory: Record<string, { categoryName: string; amount: number }> = {};

  expenses.forEach(expense => {
    const categoryName = expense.category?.name || 'Uncategorized';
    if (!expensesByCategory[categoryName]) {
      expensesByCategory[categoryName] = { categoryName, amount: 0 };
    }
    expensesByCategory[categoryName].amount += expense.amount;
  });

  paidAccounts.forEach(account => {
    const categoryName = account.category?.name || 'Uncategorized';
    if (!expensesByCategory[categoryName]) {
      expensesByCategory[categoryName] = { categoryName, amount: 0 };
    }
    expensesByCategory[categoryName].amount += account.amount;
  });

  const totalExpenses = Object.values(expensesByCategory).reduce((sum, e) => sum + e.amount, 0);
  const grossProfit = totalRevenue - productCost;
  const netProfit = grossProfit - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return {
    revenue: {
      total: totalRevenue,
      services: serviceRevenue,
      products: productRevenue,
    },
    costs: {
      productCost,
    },
    grossProfit,
    expenses: {
      byCategory: Object.values(expensesByCategory),
      total: totalExpenses,
    },
    netProfit,
    profitMargin,
  };
};
