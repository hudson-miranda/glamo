import { HttpError } from 'wasp/server';
import { Prisma } from '@prisma/client';
import type {
  // Referral Program operations
  CreateReferralProgram,
  UpdateReferralProgram,
  GetReferralProgram,
  ListReferralPrograms,
  DeleteReferralProgram,
  
  // Referral operations
  CreateReferral,
  GetClientReferralCode,
  TrackReferralClick,
  CompleteReferralSignup,
  QualifyReferral,
  GetReferralStats,
  ListReferrals,
  GetReferralLeaderboard
} from 'wasp/server/operations';
import { requirePermission } from '../rbac/requirePermission';

// ============================================================================
// Types
// ============================================================================

type CreateReferralProgramInput = {
  salonId: string;
  name: string;
  description?: string;
  referrerRewardType: 'CASHBACK' | 'DISCOUNT_PERCENT' | 'DISCOUNT_FIXED' | 'FREE_SERVICE' | 'POINTS';
  referrerRewardValue: number;
  referrerRewardDelay?: number;
  refereeRewardType: 'CASHBACK' | 'DISCOUNT_PERCENT' | 'DISCOUNT_FIXED' | 'FREE_SERVICE' | 'POINTS';
  refereeRewardValue: number;
  refereeRewardOnFirstVisit?: boolean;
  minPurchaseAmount?: number;
  maxRewardPerReferrer?: number;
  expiryDays?: number;
  requireFirstVisit?: boolean;
};

type CreateReferralInput = {
  salonId: string;
  referrerId: string;
  refereeName?: string;
  refereePhone?: string;
  refereeEmail?: string;
  sharedVia?: 'WHATSAPP' | 'EMAIL' | 'SMS' | 'LINK' | 'QR_CODE' | 'IN_PERSON';
};

// ============================================================================
// Helper Functions
// ============================================================================

const generateReferralCode = async (context: any, clientName: string): Promise<string> => {
  // Generate code from name + random number
  const namePart = clientName
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .substring(0, 6);
  const randomPart = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  const code = `${namePart}${randomPart}`;
  
  // Check if code exists
  const existing = await context.entities.Referral.findUnique({
    where: { referrerCode: code }
  });
  
  if (existing) {
    // Try again with different random part
    return generateReferralCode(context, clientName);
  }
  
  return code;
};

const issueReferralReward = async (
  context: any,
  referral: any,
  program: any,
  isReferrer: boolean
) => {
  const rewardType = isReferrer ? program.referrerRewardType : program.refereeRewardType;
  const rewardValue = isReferrer ? program.referrerRewardValue : program.refereeRewardValue;
  const clientId = isReferrer ? referral.referrerId : referral.refereeId;

  if (!clientId) return;

  // Issue reward based on type
  if (rewardType === 'CASHBACK') {
    // Add to loyalty balance
    const loyaltyBalance = await context.entities.ClientLoyaltyBalance.findFirst({
      where: {
        clientId,
        salonId: referral.salonId
      }
    });

    if (loyaltyBalance) {
      await context.entities.ClientLoyaltyBalance.update({
        where: { id: loyaltyBalance.id },
        data: {
          availableBalance: loyaltyBalance.availableBalance + rewardValue,
          lifetimeEarned: loyaltyBalance.lifetimeEarned + rewardValue
        }
      });

      await context.entities.LoyaltyTransaction.create({
        data: {
          balanceId: loyaltyBalance.id,
          programId: loyaltyBalance.programId,
          salonId: referral.salonId,
          clientId,
          type: 'BONUS',
          amount: rewardValue,
          balanceAfter: loyaltyBalance.availableBalance + rewardValue,
          description: `Referral reward - ${isReferrer ? 'Referrer' : 'Referee'}`
        }
      });
    }
  }

  // Update referral record
  const updateData: any = {};
  if (isReferrer) {
    updateData.referrerRewardIssued = true;
    updateData.referrerRewardIssuedAt = new Date();
    updateData.referrerRewardAmount = rewardValue;
  } else {
    updateData.refereeRewardIssued = true;
    updateData.refereeRewardIssuedAt = new Date();
    updateData.refereeRewardAmount = rewardValue;
  }

  await context.entities.Referral.update({
    where: { id: referral.id },
    data: updateData
  });
};

// ============================================================================
// Referral Program Operations
// ============================================================================

export const createReferralProgram: CreateReferralProgram<CreateReferralProgramInput, any> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'referral:manage');

  const program = await context.entities.ReferralProgram.create({
    data: {
      salonId: args.salonId,
      name: args.name,
      description: args.description,
      isActive: true,
      referrerRewardType: args.referrerRewardType,
      referrerRewardValue: args.referrerRewardValue,
      referrerRewardDelay: args.referrerRewardDelay || 0,
      refereeRewardType: args.refereeRewardType,
      refereeRewardValue: args.refereeRewardValue,
      refereeRewardOnFirstVisit: args.refereeRewardOnFirstVisit !== false,
      minPurchaseAmount: args.minPurchaseAmount,
      maxRewardPerReferrer: args.maxRewardPerReferrer,
      expiryDays: args.expiryDays,
      requireFirstVisit: args.requireFirstVisit !== false,
      trackingCookie: true
    }
  });

  return program;
};

export const updateReferralProgram: UpdateReferralProgram<CreateReferralProgramInput & {
  programId: string;
  isActive?: boolean;
}, any> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'referral:manage');

  const program = await context.entities.ReferralProgram.update({
    where: {
      id: args.programId
    },
    data: {
      name: args.name,
      description: args.description,
      isActive: args.isActive,
      referrerRewardType: args.referrerRewardType,
      referrerRewardValue: args.referrerRewardValue,
      referrerRewardDelay: args.referrerRewardDelay,
      refereeRewardType: args.refereeRewardType,
      refereeRewardValue: args.refereeRewardValue,
      refereeRewardOnFirstVisit: args.refereeRewardOnFirstVisit,
      minPurchaseAmount: args.minPurchaseAmount,
      maxRewardPerReferrer: args.maxRewardPerReferrer,
      expiryDays: args.expiryDays,
      requireFirstVisit: args.requireFirstVisit
    }
  });

  return program;
};

export const getReferralProgram: GetReferralProgram<{ programId: string; salonId: string }, any> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'referral:view');

  const program = await context.entities.ReferralProgram.findFirst({
    where: {
      id: args.programId,
      salonId: args.salonId
    },
    include: {
      _count: {
        select: {
          referrals: true
        }
      }
    }
  });

  if (!program) {
    throw new HttpError(404, 'Referral program not found');
  }

  return program;
};

export const listReferralPrograms: ListReferralPrograms<{ salonId: string }, any> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'referral:view');

  const programs = await context.entities.ReferralProgram.findMany({
    where: {
      salonId: args.salonId,
      deletedAt: null
    },
    include: {
      _count: {
        select: {
          referrals: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return programs;
};

export const deleteReferralProgram: DeleteReferralProgram<{ programId: string; salonId: string }, any> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'referral:manage');

  const program = await context.entities.ReferralProgram.update({
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
// Referral Operations
// ============================================================================

export const createReferral: CreateReferral<CreateReferralInput, any> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'clients:manage');

  // Get active referral program
  const program = await context.entities.ReferralProgram.findFirst({
    where: {
      salonId: args.salonId,
      isActive: true,
      deletedAt: null
    }
  });

  if (!program) {
    throw new HttpError(404, 'No active referral program found');
  }

  // Get referrer client
  const referrer = await context.entities.Client.findUnique({
    where: { id: args.referrerId }
  });

  if (!referrer) {
    throw new HttpError(404, 'Referrer client not found');
  }

  // Check if referral code exists for this client
  let existingReferral = await context.entities.Referral.findFirst({
    where: {
      referrerId: args.referrerId,
      salonId: args.salonId,
      status: 'PENDING'
    }
  });

  let referralCode: string;
  if (existingReferral) {
    referralCode = existingReferral.referrerCode;
  } else {
    referralCode = await generateReferralCode(context, referrer.name);
  }

  // Calculate expiry date
  const expiresAt = program.expiryDays
    ? new Date(Date.now() + program.expiryDays * 24 * 60 * 60 * 1000)
    : null;

  // Create referral
  const referral = await context.entities.Referral.create({
    data: {
      programId: program.id,
      salonId: args.salonId,
      referrerId: args.referrerId,
      referrerCode: referralCode,
      refereeName: args.refereeName,
      refereePhone: args.refereePhone,
      refereeEmail: args.refereeEmail,
      status: 'PENDING',
      sharedVia: args.sharedVia,
      expiresAt
    },
    include: {
      referrer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        }
      },
      program: true
    }
  });

  return referral;
};

export const getClientReferralCode: GetClientReferralCode<{
  clientId: string;
  salonId: string;
}, any> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'clients:view');

  // Get or create referral code
  let referral = await context.entities.Referral.findFirst({
    where: {
      referrerId: args.clientId,
      salonId: args.salonId
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  if (!referral) {
    // Create new referral code
    const client = await context.entities.Client.findUnique({
      where: { id: args.clientId }
    });

    if (!client) {
      throw new HttpError(404, 'Client not found');
    }

    const program = await context.entities.ReferralProgram.findFirst({
      where: {
        salonId: args.salonId,
        isActive: true,
        deletedAt: null
      }
    });

    if (!program) {
      throw new HttpError(404, 'No active referral program found');
    }

    const code = await generateReferralCode(context, client.name);

    referral = await context.entities.Referral.create({
      data: {
        programId: program.id,
        salonId: args.salonId,
        referrerId: args.clientId,
        referrerCode: code,
        status: 'PENDING'
      }
    });
  }

  return {
    code: referral.referrerCode,
    referralLink: `/referral/${referral.referrerCode}`,
    qrCode: `/api/referral/qr/${referral.referrerCode}`
  };
};

export const trackReferralClick: TrackReferralClick<{
  referralCode: string;
}, any> = async (args, context) => {
  const referral = await context.entities.Referral.findUnique({
    where: { referrerCode: args.referralCode }
  });

  if (!referral) {
    throw new HttpError(404, 'Referral code not found');
  }

  // Update if not already clicked
  if (!referral.clickedAt) {
    await context.entities.Referral.update({
      where: { id: referral.id },
      data: {
        status: 'CLICKED',
        clickedAt: new Date()
      }
    });
  }

  return { success: true };
};

export const completeReferralSignup: CompleteReferralSignup<{
  referralCode: string;
  refereeClientId: string;
  salonId: string;
}, any> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  const referral = await context.entities.Referral.findFirst({
    where: {
      referrerCode: args.referralCode,
      salonId: args.salonId
    },
    include: {
      program: true
    }
  });

  if (!referral) {
    throw new HttpError(404, 'Referral not found');
  }

  // Update referral with referee
  const updatedReferral = await context.entities.Referral.update({
    where: { id: referral.id },
    data: {
      refereeId: args.refereeClientId,
      status: 'SIGNED_UP',
      signedUpAt: new Date()
    }
  });

  // Issue referee reward if not requiring first visit
  if (!referral.program.requireFirstVisit) {
    await issueReferralReward(context, updatedReferral, referral.program, false);
  }

  return updatedReferral;
};

export const qualifyReferral: QualifyReferral<{
  referralId: string;
  salonId: string;
  purchaseAmount?: number;
}, any> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'referral:manage');

  const referral = await context.entities.Referral.findFirst({
    where: {
      id: args.referralId,
      salonId: args.salonId
    },
    include: {
      program: true
    }
  });

  if (!referral) {
    throw new HttpError(404, 'Referral not found');
  }

  // Check if already qualified
  if (referral.status === 'QUALIFIED' || referral.status === 'REWARDED') {
    throw new HttpError(400, 'Referral already qualified');
  }

  // Check minimum purchase if required
  if (referral.program.minPurchaseAmount && args.purchaseAmount) {
    if (args.purchaseAmount < referral.program.minPurchaseAmount) {
      throw new HttpError(400, `Minimum purchase of ${referral.program.minPurchaseAmount} required`);
    }
  }

  // Update status
  const updatedReferral = await context.entities.Referral.update({
    where: { id: referral.id },
    data: {
      status: 'QUALIFIED',
      qualifiedAt: new Date(),
      firstVisitAt: new Date()
    }
  });

  // Issue rewards
  await issueReferralReward(context, updatedReferral, referral.program, true); // Referrer
  await issueReferralReward(context, updatedReferral, referral.program, false); // Referee

  // Mark as rewarded
  await context.entities.Referral.update({
    where: { id: referral.id },
    data: {
      status: 'REWARDED'
    }
  });

  return updatedReferral;
};

export const listReferrals: ListReferrals<{
  salonId: string;
  clientId?: string;
  status?: string;
  page?: number;
  perPage?: number;
}, any> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'referral:view');

  const page = args.page || 1;
  const perPage = args.perPage || 20;
  const skip = (page - 1) * perPage;

  const where: any = {
    salonId: args.salonId
  };

  if (args.clientId) {
    where.referrerId = args.clientId;
  }

  if (args.status) {
    where.status = args.status;
  }

  const [referrals, total] = await Promise.all([
    context.entities.Referral.findMany({
      where,
      include: {
        referrer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        referee: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
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
    context.entities.Referral.count({ where })
  ]);

  return {
    referrals,
    total,
    page,
    perPage
  };
};

export const getReferralStats: GetReferralStats<{ salonId: string }, any> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'referral:view');

  const [
    totalReferrals,
    qualifiedReferrals,
    pendingReferrals,
    totalRewards
  ] = await Promise.all([
    context.entities.Referral.count({
      where: { salonId: args.salonId }
    }),
    context.entities.Referral.count({
      where: {
        salonId: args.salonId,
        status: { in: ['QUALIFIED', 'REWARDED'] }
      }
    }),
    context.entities.Referral.count({
      where: {
        salonId: args.salonId,
        status: 'PENDING'
      }
    }),
    context.entities.Referral.aggregate({
      where: {
        salonId: args.salonId,
        status: 'REWARDED'
      },
      _sum: {
        referrerRewardAmount: true,
        refereeRewardAmount: true
      }
    })
  ]);

  return {
    totalReferrals,
    qualifiedReferrals,
    pendingReferrals,
    conversionRate: totalReferrals > 0 ? (qualifiedReferrals / totalReferrals) * 100 : 0,
    totalRewardsIssued: (totalRewards._sum.referrerRewardAmount || 0) + (totalRewards._sum.refereeRewardAmount || 0)
  };
};

export const getReferralLeaderboard: GetReferralLeaderboard<{
  salonId: string;
  limit?: number;
}, any> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'referral:view');

  const limit = args.limit || 10;

  // Get top referrers
  const referrals = await context.entities.Referral.groupBy({
    by: ['referrerId'],
    where: {
      salonId: args.salonId,
      status: { in: ['QUALIFIED', 'REWARDED'] }
    },
    _count: {
      id: true
    },
    _sum: {
      referrerRewardAmount: true
    },
    orderBy: {
      _count: {
        id: 'desc'
      }
    },
    take: limit
  });

  // Get client details
  const leaderboard = await Promise.all(
    referrals.map(async (item) => {
      const client = await context.entities.Client.findUnique({
        where: { id: item.referrerId },
        select: {
          id: true,
          name: true,
          email: true,
          profilePhotoUrl: true
        }
      });

      return {
        client,
        referralCount: item._count.id,
        totalRewards: item._sum.referrerRewardAmount || 0
      };
    })
  );

  return leaderboard;
};
