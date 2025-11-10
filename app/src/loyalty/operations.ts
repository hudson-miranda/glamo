import { HttpError } from 'wasp/server';
import { Prisma } from '@prisma/client';
import type {
  // Loyalty Program operations
  CreateLoyaltyProgram,
  UpdateLoyaltyProgram,
  GetLoyaltyProgram,
  ListLoyaltyPrograms,
  DeleteLoyaltyProgram,
  
  // Loyalty Tier operations
  CreateLoyaltyTier,
  UpdateLoyaltyTier,
  DeleteLoyaltyTier,
  
  // Client Balance operations
  GetClientLoyaltyBalance,
  AdjustLoyaltyBalance,
  RedeemLoyalty,
  
  // Transaction operations
  GetLoyaltyTransactions,
  ProcessCashbackEarning,
  ProcessLoyaltyRedemption,
  
  // Analytics
  GetLoyaltyProgramStats
} from 'wasp/server/operations';
import { requirePermission } from '../rbac/requirePermission';

// ============================================================================
// Types
// ============================================================================

type CreateLoyaltyProgramInput = {
  salonId: string;
  name: string;
  description?: string;
  cashbackEnabled: boolean;
  cashbackType: 'PERCENTAGE' | 'FIXED' | 'POINTS';
  cashbackValue: number;
  minPurchaseForCashback?: number;
  maxCashbackPerTransaction?: number;
  minBalanceToRedeem?: number;
  maxRedemptionPercentage?: number;
  cashbackExpiryDays?: number;
  vipTiersEnabled?: boolean;
};

type UpdateLoyaltyProgramInput = CreateLoyaltyProgramInput & {
  programId: string;
  isActive?: boolean;
};

type CreateLoyaltyTierInput = {
  programId: string;
  salonId: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  minTotalSpent?: number;
  minVisits?: number;
  minMonthlySpent?: number;
  cashbackMultiplier: number;
  discountPercentage?: number;
  priorityBooking?: boolean;
  exclusiveServices?: boolean;
  order: number;
};

type RedeemLoyaltyInput = {
  clientId: string;
  salonId: string;
  amount: number;
  saleId?: string;
};

type ProcessCashbackEarningInput = {
  clientId: string;
  salonId: string;
  saleId: string;
  saleAmount: number;
};

// ============================================================================
// Loyalty Program Operations
// ============================================================================

export const createLoyaltyProgram: CreateLoyaltyProgram<CreateLoyaltyProgramInput, any> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'loyalty:manage');

  const program = await context.entities.LoyaltyProgram.create({
    data: {
      salonId: args.salonId,
      name: args.name,
      description: args.description,
      cashbackEnabled: args.cashbackEnabled,
      cashbackType: args.cashbackType,
      cashbackValue: args.cashbackValue,
      minPurchaseForCashback: args.minPurchaseForCashback || 0,
      maxCashbackPerTransaction: args.maxCashbackPerTransaction,
      minBalanceToRedeem: args.minBalanceToRedeem || 0,
      maxRedemptionPercentage: args.maxRedemptionPercentage || 100,
      cashbackExpiryDays: args.cashbackExpiryDays,
      vipTiersEnabled: args.vipTiersEnabled || false,
      isActive: true
    },
    include: {
      tiers: true
    }
  });

  return program;
};

export const updateLoyaltyProgram: UpdateLoyaltyProgram<UpdateLoyaltyProgramInput, any> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'loyalty:manage');

  const program = await context.entities.LoyaltyProgram.update({
    where: {
      id: args.programId
    },
    data: {
      name: args.name,
      description: args.description,
      cashbackEnabled: args.cashbackEnabled,
      cashbackType: args.cashbackType,
      cashbackValue: args.cashbackValue,
      minPurchaseForCashback: args.minPurchaseForCashback,
      maxCashbackPerTransaction: args.maxCashbackPerTransaction,
      minBalanceToRedeem: args.minBalanceToRedeem,
      maxRedemptionPercentage: args.maxRedemptionPercentage,
      cashbackExpiryDays: args.cashbackExpiryDays,
      vipTiersEnabled: args.vipTiersEnabled,
      isActive: args.isActive
    },
    include: {
      tiers: true
    }
  });

  return program;
};

export const getLoyaltyProgram: GetLoyaltyProgram<{ programId: string; salonId: string }, any> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'loyalty:view');

  const program = await context.entities.LoyaltyProgram.findFirst({
    where: {
      id: args.programId,
      salonId: args.salonId
    },
    include: {
      tiers: {
        orderBy: { order: 'asc' }
      },
      _count: {
        select: {
          balances: true,
          transactions: true
        }
      }
    }
  });

  if (!program) {
    throw new HttpError(404, 'Loyalty program not found');
  }

  return program;
};

export const listLoyaltyPrograms: ListLoyaltyPrograms<{ salonId: string }, any> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'loyalty:view');

  const programs = await context.entities.LoyaltyProgram.findMany({
    where: {
      salonId: args.salonId,
      deletedAt: null
    },
    include: {
      tiers: {
        orderBy: { order: 'asc' }
      },
      _count: {
        select: {
          balances: true,
          transactions: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return programs;
};

export const deleteLoyaltyProgram: DeleteLoyaltyProgram<{ programId: string; salonId: string }, any> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'loyalty:manage');

  const program = await context.entities.LoyaltyProgram.update({
    where: {
      id: args.programId
    },
    data: {
      deletedAt: new Date(),
      isActive: false
    }
  });

  return program;
};

// ============================================================================
// Loyalty Tier Operations
// ============================================================================

export const createLoyaltyTier: CreateLoyaltyTier<CreateLoyaltyTierInput, any> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'loyalty:manage');

  const tier = await context.entities.LoyaltyTier.create({
    data: {
      programId: args.programId,
      name: args.name,
      description: args.description,
      color: args.color,
      icon: args.icon,
      minTotalSpent: args.minTotalSpent,
      minVisits: args.minVisits,
      minMonthlySpent: args.minMonthlySpent,
      cashbackMultiplier: args.cashbackMultiplier,
      discountPercentage: args.discountPercentage || 0,
      priorityBooking: args.priorityBooking || false,
      exclusiveServices: args.exclusiveServices || false,
      order: args.order
    }
  });

  return tier;
};

export const updateLoyaltyTier: UpdateLoyaltyTier<CreateLoyaltyTierInput & { tierId: string }, any> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'loyalty:manage');

  const tier = await context.entities.LoyaltyTier.update({
    where: {
      id: args.tierId
    },
    data: {
      name: args.name,
      description: args.description,
      color: args.color,
      icon: args.icon,
      minTotalSpent: args.minTotalSpent,
      minVisits: args.minVisits,
      minMonthlySpent: args.minMonthlySpent,
      cashbackMultiplier: args.cashbackMultiplier,
      discountPercentage: args.discountPercentage,
      priorityBooking: args.priorityBooking,
      exclusiveServices: args.exclusiveServices,
      order: args.order
    }
  });

  return tier;
};

export const deleteLoyaltyTier: DeleteLoyaltyTier<{ tierId: string; salonId: string }, any> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'loyalty:manage');

  await context.entities.LoyaltyTier.delete({
    where: {
      id: args.tierId
    }
  });

  return { success: true };
};

// ============================================================================
// Client Balance Operations
// ============================================================================

export const getClientLoyaltyBalance: GetClientLoyaltyBalance<{ clientId: string; salonId: string }, any> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'clients:view');

  const balance = await context.entities.ClientLoyaltyBalance.findFirst({
    where: {
      clientId: args.clientId,
      salonId: args.salonId
    },
    include: {
      program: true,
      tier: true,
      client: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        }
      }
    }
  });

  if (!balance) {
    // Return empty balance if not found
    return {
      availableBalance: 0,
      pendingBalance: 0,
      lifetimeEarned: 0,
      lifetimeRedeemed: 0,
      totalSpent: 0,
      totalVisits: 0
    };
  }

  return balance;
};

export const adjustLoyaltyBalance: AdjustLoyaltyBalance<{
  clientId: string;
  salonId: string;
  amount: number;
  reason: string;
  type: 'ADJUSTED' | 'BONUS';
}, any> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'loyalty:manage');

  // Get or create client balance
  let balance = await context.entities.ClientLoyaltyBalance.findFirst({
    where: {
      clientId: args.clientId,
      salonId: args.salonId
    }
  });

  if (!balance) {
    // Get the active program
    const program = await context.entities.LoyaltyProgram.findFirst({
      where: {
        salonId: args.salonId,
        isActive: true,
        deletedAt: null
      }
    });

    if (!program) {
      throw new HttpError(404, 'No active loyalty program found');
    }

    balance = await context.entities.ClientLoyaltyBalance.create({
      data: {
        clientId: args.clientId,
        salonId: args.salonId,
        programId: program.id,
        availableBalance: 0,
        pendingBalance: 0,
        lifetimeEarned: 0,
        lifetimeRedeemed: 0,
        totalSpent: 0,
        totalVisits: 0
      }
    });
  }

  const newBalance = balance.availableBalance + args.amount;

  // Update balance
  const updatedBalance = await context.entities.ClientLoyaltyBalance.update({
    where: {
      id: balance.id
    },
    data: {
      availableBalance: newBalance,
      lifetimeEarned: args.amount > 0 ? balance.lifetimeEarned + args.amount : balance.lifetimeEarned
    }
  });

  // Create transaction record
  await context.entities.LoyaltyTransaction.create({
    data: {
      balanceId: balance.id,
      programId: balance.programId,
      salonId: args.salonId,
      clientId: args.clientId,
      type: args.type,
      amount: args.amount,
      balanceAfter: newBalance,
      description: args.reason
    }
  });

  return updatedBalance;
};

// ============================================================================
// Transaction Operations
// ============================================================================

export const processCashbackEarning: ProcessCashbackEarning<ProcessCashbackEarningInput, any> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'sales:manage');

  // Get active loyalty program
  const program = await context.entities.LoyaltyProgram.findFirst({
    where: {
      salonId: args.salonId,
      isActive: true,
      cashbackEnabled: true,
      deletedAt: null
    },
    include: {
      tiers: true
    }
  });

  if (!program) {
    return null; // No active program
  }

  // Check minimum purchase
  if (program.minPurchaseForCashback && args.saleAmount < program.minPurchaseForCashback) {
    return null;
  }

  // Calculate cashback
  let cashbackAmount = 0;
  if (program.cashbackType === 'PERCENTAGE') {
    cashbackAmount = (args.saleAmount * program.cashbackValue) / 100;
  } else if (program.cashbackType === 'FIXED') {
    cashbackAmount = program.cashbackValue;
  }

  // Apply max limit
  if (program.maxCashbackPerTransaction && cashbackAmount > program.maxCashbackPerTransaction) {
    cashbackAmount = program.maxCashbackPerTransaction;
  }

  // Get or create client balance
  let balance = await context.entities.ClientLoyaltyBalance.findFirst({
    where: {
      clientId: args.clientId,
      programId: program.id
    },
    include: {
      tier: true
    }
  });

  if (!balance) {
    balance = await context.entities.ClientLoyaltyBalance.create({
      data: {
        clientId: args.clientId,
        salonId: args.salonId,
        programId: program.id,
        availableBalance: 0,
        pendingBalance: 0,
        lifetimeEarned: 0,
        lifetimeRedeemed: 0,
        totalSpent: 0,
        totalVisits: 0
      },
      include: {
        tier: true
      }
    });
  }

  // Apply tier multiplier
  if (balance.tier && balance.tier.cashbackMultiplier) {
    cashbackAmount *= balance.tier.cashbackMultiplier;
  }

  // Update balance
  const newBalance = balance.availableBalance + cashbackAmount;
  const newTotalSpent = balance.totalSpent + args.saleAmount;
  const newTotalVisits = balance.totalVisits + 1;

  const updatedBalance = await context.entities.ClientLoyaltyBalance.update({
    where: {
      id: balance.id
    },
    data: {
      availableBalance: newBalance,
      lifetimeEarned: balance.lifetimeEarned + cashbackAmount,
      totalSpent: newTotalSpent,
      totalVisits: newTotalVisits,
      lastActivityAt: new Date()
    }
  });

  // Create transaction
  const expiresAt = program.cashbackExpiryDays
    ? new Date(Date.now() + program.cashbackExpiryDays * 24 * 60 * 60 * 1000)
    : null;

  const transaction = await context.entities.LoyaltyTransaction.create({
    data: {
      balanceId: balance.id,
      programId: program.id,
      salonId: args.salonId,
      clientId: args.clientId,
      type: 'EARNED',
      amount: cashbackAmount,
      balanceAfter: newBalance,
      saleId: args.saleId,
      description: `Cashback earned from sale`,
      expiresAt
    }
  });

  // Check for tier upgrade
  if (program.vipTiersEnabled && program.tiers.length > 0) {
    const eligibleTier = program.tiers
      .filter(tier => {
        const meetsSpent = !tier.minTotalSpent || newTotalSpent >= tier.minTotalSpent;
        const meetsVisits = !tier.minVisits || newTotalVisits >= tier.minVisits;
        return meetsSpent && meetsVisits;
      })
      .sort((a, b) => (b.minTotalSpent || 0) - (a.minTotalSpent || 0))[0];

    if (eligibleTier && (!balance.currentTierId || eligibleTier.id !== balance.currentTierId)) {
      await context.entities.ClientLoyaltyBalance.update({
        where: {
          id: balance.id
        },
        data: {
          currentTierId: eligibleTier.id,
          tierAchievedAt: new Date()
        }
      });
    }
  }

  return {
    cashbackAmount,
    transaction,
    balance: updatedBalance
  };
};

export const redeemLoyalty: ProcessLoyaltyRedemption<RedeemLoyaltyInput, any> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'sales:manage');

  // Get client balance
  const balance = await context.entities.ClientLoyaltyBalance.findFirst({
    where: {
      clientId: args.clientId,
      salonId: args.salonId
    },
    include: {
      program: true
    }
  });

  if (!balance) {
    throw new HttpError(404, 'Client loyalty balance not found');
  }

  // Validate redemption
  if (args.amount > balance.availableBalance) {
    throw new HttpError(400, 'Insufficient loyalty balance');
  }

  if (balance.program.minBalanceToRedeem && balance.availableBalance < balance.program.minBalanceToRedeem) {
    throw new HttpError(400, `Minimum balance of ${balance.program.minBalanceToRedeem} required for redemption`);
  }

  // Update balance
  const newBalance = balance.availableBalance - args.amount;

  const updatedBalance = await context.entities.ClientLoyaltyBalance.update({
    where: {
      id: balance.id
    },
    data: {
      availableBalance: newBalance,
      lifetimeRedeemed: balance.lifetimeRedeemed + args.amount,
      lastActivityAt: new Date()
    }
  });

  // Create transaction
  const transaction = await context.entities.LoyaltyTransaction.create({
    data: {
      balanceId: balance.id,
      programId: balance.programId,
      salonId: args.salonId,
      clientId: args.clientId,
      type: 'REDEEMED',
      amount: -args.amount,
      balanceAfter: newBalance,
      redemptionSaleId: args.saleId,
      description: 'Cashback redeemed'
    }
  });

  return {
    transaction,
    balance: updatedBalance
  };
};

export const getLoyaltyTransactions: GetLoyaltyTransactions<{
  clientId?: string;
  salonId: string;
  page?: number;
  perPage?: number;
}, any> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'clients:view');

  const page = args.page || 1;
  const perPage = args.perPage || 20;
  const skip = (page - 1) * perPage;

  const where: any = {
    salonId: args.salonId
  };

  if (args.clientId) {
    where.clientId = args.clientId;
  }

  const [transactions, total] = await Promise.all([
    context.entities.LoyaltyTransaction.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        program: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: perPage
    }),
    context.entities.LoyaltyTransaction.count({ where })
  ]);

  return {
    transactions,
    total,
    page,
    perPage
  };
};

export const getLoyaltyProgramStats: GetLoyaltyProgramStats<{ programId: string; salonId: string }, any> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'loyalty:view');

  const [
    totalMembers,
    activeMembers,
    totalEarned,
    totalRedeemed,
    transactions
  ] = await Promise.all([
    context.entities.ClientLoyaltyBalance.count({
      where: {
        programId: args.programId,
        salonId: args.salonId
      }
    }),
    context.entities.ClientLoyaltyBalance.count({
      where: {
        programId: args.programId,
        salonId: args.salonId,
        availableBalance: {
          gt: 0
        }
      }
    }),
    context.entities.LoyaltyTransaction.aggregate({
      where: {
        programId: args.programId,
        salonId: args.salonId,
        type: 'EARNED'
      },
      _sum: {
        amount: true
      }
    }),
    context.entities.LoyaltyTransaction.aggregate({
      where: {
        programId: args.programId,
        salonId: args.salonId,
        type: 'REDEEMED'
      },
      _sum: {
        amount: true
      }
    }),
    context.entities.LoyaltyTransaction.count({
      where: {
        programId: args.programId,
        salonId: args.salonId
      }
    })
  ]);

  return {
    totalMembers,
    activeMembers,
    totalEarned: totalEarned._sum.amount || 0,
    totalRedeemed: Math.abs(totalRedeemed._sum.amount || 0),
    totalTransactions: transactions
  };
};
