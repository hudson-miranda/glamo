/**
 * Subscription status logic for trial and paid plans
 * 
 * TRIAL RULES:
 * - 14 days trial with Profissional plan features
 * - After trial: block all access until plan is selected
 * 
 * SUBSCRIPTION RULES:
 * - Active subscription: full access
 * - Expired subscription: 7-day grace period (read-only)
 * - After grace period: block all access
 */

import type { User } from 'wasp/entities';

export enum SubscriptionStatus {
  TRIAL_ACTIVE = 'TRIAL_ACTIVE',
  TRIAL_EXPIRED = 'TRIAL_EXPIRED',
  SUBSCRIPTION_ACTIVE = 'SUBSCRIPTION_ACTIVE',
  SUBSCRIPTION_GRACE_PERIOD = 'SUBSCRIPTION_GRACE_PERIOD',
  SUBSCRIPTION_EXPIRED = 'SUBSCRIPTION_EXPIRED',
}

/**
 * Get subscription status for a user
 */
export function getSubscriptionStatus(user: {
  subscriptionPlan: string | null;
  createdAt: Date;
  datePaid: Date | null;
}): SubscriptionStatus {
  const now = new Date();

  // If user has a paid plan
  if (user.subscriptionPlan && user.subscriptionPlan !== 'essencial' && user.datePaid) {
    const monthsSincePaid = getMonthsDifference(user.datePaid, now);

    // Active subscription (less than 1 month since payment)
    if (monthsSincePaid < 1) {
      return SubscriptionStatus.SUBSCRIPTION_ACTIVE;
    }

    // Grace period (1-2 months since payment)
    if (monthsSincePaid < 2) {
      return SubscriptionStatus.SUBSCRIPTION_GRACE_PERIOD;
    }

    // Expired (more than 2 months since payment)
    return SubscriptionStatus.SUBSCRIPTION_EXPIRED;
  }

  // User is on trial or essencial plan
  const daysSinceCreated = getDaysDifference(user.createdAt, now);

  // Trial active (less than 14 days)
  if (daysSinceCreated < 14) {
    return SubscriptionStatus.TRIAL_ACTIVE;
  }

  // Trial expired
  return SubscriptionStatus.TRIAL_EXPIRED;
}

/**
 * Check if user has write access (can create/update/delete)
 */
export function hasWriteAccess(status: SubscriptionStatus): boolean {
  return (
    status === SubscriptionStatus.TRIAL_ACTIVE ||
    status === SubscriptionStatus.SUBSCRIPTION_ACTIVE
  );
}

/**
 * Check if user has read access (can view data)
 */
export function hasReadAccess(status: SubscriptionStatus): boolean {
  return (
    status === SubscriptionStatus.TRIAL_ACTIVE ||
    status === SubscriptionStatus.SUBSCRIPTION_ACTIVE ||
    status === SubscriptionStatus.SUBSCRIPTION_GRACE_PERIOD
  );
}

/**
 * Check if user is blocked (no access at all)
 */
export function isBlocked(status: SubscriptionStatus): boolean {
  return (
    status === SubscriptionStatus.TRIAL_EXPIRED ||
    status === SubscriptionStatus.SUBSCRIPTION_EXPIRED
  );
}

/**
 * Get days remaining in grace period (0 if not in grace period)
 */
export function getGracePeriodDaysRemaining(user: {
  datePaid: Date | null;
}): number {
  if (!user.datePaid) {
    return 0;
  }

  const now = new Date();
  const monthsSincePaid = getMonthsDifference(user.datePaid, now);

  // Not in grace period yet
  if (monthsSincePaid < 1) {
    return 0;
  }

  // Calculate days since grace period started (1 month after payment)
  const gracePeriodStart = new Date(user.datePaid);
  gracePeriodStart.setMonth(gracePeriodStart.getMonth() + 1);

  const daysSinceGraceStart = getDaysDifference(gracePeriodStart, now);
  const daysRemaining = 30 - daysSinceGraceStart; // 30 days grace period

  return Math.max(0, daysRemaining);
}

/**
 * Get trial days remaining (0 if trial expired)
 */
export function getTrialDaysRemaining(user: { createdAt: Date }): number {
  const now = new Date();
  const daysSinceCreated = getDaysDifference(user.createdAt, now);
  const daysRemaining = 14 - daysSinceCreated;

  return Math.max(0, daysRemaining);
}

/**
 * Helper: Get difference in days between two dates
 */
function getDaysDifference(startDate: Date, endDate: Date): number {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Reset time to midnight for accurate day calculation
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Helper: Get difference in months between two dates
 */
function getMonthsDifference(startDate: Date, endDate: Date): number {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const yearsDiff = end.getFullYear() - start.getFullYear();
  const monthsDiff = end.getMonth() - start.getMonth();

  return yearsDiff * 12 + monthsDiff;
}
