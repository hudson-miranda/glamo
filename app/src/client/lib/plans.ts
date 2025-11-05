/**
 * Client-side utility for getting plan information
 * This mirrors the server-side logic from @src/payment/plans.ts
 */

export type PaymentPlanId = 'essencial' | 'profissional' | 'enterprise';

export interface PlanLimits {
  maxSalons: number;
  maxProfessionalsPerSalon: number;
  maxMonthlyAppointments: number;
  maxStorageGB: number;
  supportPriority: 'standard' | 'priority' | 'dedicated';
  customReports: boolean;
  apiAccess: boolean;
}

const planLimits: Record<PaymentPlanId, PlanLimits> = {
  essencial: {
    maxSalons: 1,
    maxProfessionalsPerSalon: 1,
    maxMonthlyAppointments: 150,
    maxStorageGB: 5,
    supportPriority: 'standard',
    customReports: false,
    apiAccess: false,
  },
  profissional: {
    maxSalons: 2,
    maxProfessionalsPerSalon: 5,
    maxMonthlyAppointments: Infinity,
    maxStorageGB: 50,
    supportPriority: 'priority',
    customReports: true,
    apiAccess: false,
  },
  enterprise: {
    maxSalons: Infinity,
    maxProfessionalsPerSalon: Infinity,
    maxMonthlyAppointments: Infinity,
    maxStorageGB: 500,
    supportPriority: 'dedicated',
    customReports: true,
    apiAccess: true,
  },
};

export function getPlanLimits(planId: PaymentPlanId): PlanLimits {
  return planLimits[planId] || planLimits.essencial;
}

/**
 * Determines the user's effective plan based on subscription and trial status
 */
export function getEffectivePlan(user: {
  subscriptionPlan?: string | null;
  createdAt: Date;
  datePaid?: Date | null;
}): PaymentPlanId {
  // If user has an active paid subscription, return it
  if (user.subscriptionPlan) {
    return user.subscriptionPlan as PaymentPlanId;
  }

  // Check if user is within 14-day trial period
  const trialDays = 14;
  const createdAt = new Date(user.createdAt);
  const now = new Date();
  const daysSinceCreation = Math.floor(
    (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceCreation < trialDays) {
    return 'profissional'; // Trial users get Profissional plan benefits
  }

  // Trial expired, default to Essencial
  return 'essencial';
}

/**
 * Check if user is currently in trial period
 */
export function hasActiveTrial(user: {
  subscriptionPlan?: string | null;
  createdAt: Date;
}): boolean {
  if (user.subscriptionPlan) {
    return false; // Has paid subscription, not in trial
  }

  const trialDays = 14;
  const createdAt = new Date(user.createdAt);
  const now = new Date();
  const daysSinceCreation = Math.floor(
    (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysSinceCreation < trialDays;
}

/**
 * Get number of days remaining in trial
 */
export function getTrialDaysRemaining(user: { createdAt: Date }): number {
  const trialDays = 14;
  const createdAt = new Date(user.createdAt);
  const now = new Date();
  const daysSinceCreation = Math.floor(
    (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  return Math.max(0, trialDays - daysSinceCreation);
}
