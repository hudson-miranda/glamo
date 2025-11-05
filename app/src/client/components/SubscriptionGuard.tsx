/**
 * Subscription Guard - Checks subscription status and shows modal/banner
 * Integrates with App.tsx to enforce trial and subscription rules
 */

import { useAuth } from 'wasp/client/auth';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import TrialExpiredModal from './TrialExpiredModal';
import GracePeriodBanner from './GracePeriodBanner';

// Client-side subscription status logic (mirrors server)
enum SubscriptionStatus {
  TRIAL_ACTIVE = 'TRIAL_ACTIVE',
  TRIAL_EXPIRED = 'TRIAL_EXPIRED',
  SUBSCRIPTION_ACTIVE = 'SUBSCRIPTION_ACTIVE',
  SUBSCRIPTION_GRACE_PERIOD = 'SUBSCRIPTION_GRACE_PERIOD',
  SUBSCRIPTION_EXPIRED = 'SUBSCRIPTION_EXPIRED',
}

function getSubscriptionStatus(user: {
  subscriptionPlan: string | null;
  createdAt: Date;
  datePaid: Date | null;
}): SubscriptionStatus {
  const now = new Date();

  // If user has a paid plan
  if (user.subscriptionPlan && user.subscriptionPlan !== 'essencial' && user.datePaid) {
    const monthsSincePaid = getMonthsDifference(new Date(user.datePaid), now);

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
  const daysSinceCreated = getDaysDifference(new Date(user.createdAt), now);

  // Trial active (less than 14 days)
  if (daysSinceCreated < 14) {
    return SubscriptionStatus.TRIAL_ACTIVE;
  }

  // Trial expired
  return SubscriptionStatus.TRIAL_EXPIRED;
}

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

function getMonthsDifference(startDate: Date, endDate: Date): number {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const yearsDiff = end.getFullYear() - start.getFullYear();
  const monthsDiff = end.getMonth() - start.getMonth();

  return yearsDiff * 12 + monthsDiff;
}

function getGracePeriodDaysRemaining(datePaid: Date | null): number {
  if (!datePaid) {
    return 0;
  }

  const now = new Date();
  const paid = new Date(datePaid);
  const monthsSincePaid = getMonthsDifference(paid, now);

  // Not in grace period yet
  if (monthsSincePaid < 1) {
    return 0;
  }

  // Calculate days since grace period started (1 month after payment)
  const gracePeriodStart = new Date(paid);
  gracePeriodStart.setMonth(gracePeriodStart.getMonth() + 1);

  const daysSinceGraceStart = getDaysDifference(gracePeriodStart, now);
  const daysRemaining = 30 - daysSinceGraceStart; // 30 days grace period

  return Math.max(0, daysRemaining);
}

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export default function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const { data: user } = useAuth();
  const location = useLocation();

  // Pages where subscription checks should NOT be enforced
  const exemptPages = useMemo(
    () => [
      '/',
      '/pricing',
      '/login',
      '/signup',
      '/request-password-reset',
      '/password-reset',
      '/email-verification',
      '/signup-success',
      '/blog',
      '/privacy',
      '/terms',
    ],
    []
  );

  const isExemptPage = useMemo(() => {
    return exemptPages.some((page) => location.pathname === page || location.pathname.startsWith(`${page}/`));
  }, [location, exemptPages]);

  // Don't check subscription on exempt pages or if user is not logged in
  if (!user || isExemptPage) {
    return <>{children}</>;
  }

  const status = getSubscriptionStatus({
    subscriptionPlan: user.subscriptionPlan,
    createdAt: user.createdAt,
    datePaid: user.datePaid,
  });

  // TRIAL EXPIRED or SUBSCRIPTION EXPIRED - Block all access
  if (
    status === SubscriptionStatus.TRIAL_EXPIRED ||
    status === SubscriptionStatus.SUBSCRIPTION_EXPIRED
  ) {
    return (
      <>
        {children}
        <TrialExpiredModal isOpen={true} userName={user.name || user.email || 'Usuário'} />
      </>
    );
  }

  // GRACE PERIOD - Show banner, allow read-only access
  if (status === SubscriptionStatus.SUBSCRIPTION_GRACE_PERIOD) {
    const daysRemaining = getGracePeriodDaysRemaining(user.datePaid);

    return (
      <>
        <GracePeriodBanner daysRemaining={daysRemaining} />
        {children}
      </>
    );
  }

  // TRIAL_ACTIVE or SUBSCRIPTION_ACTIVE - Full access
  return <>{children}</>;
}
