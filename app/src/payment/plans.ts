import { requireNodeEnvVar } from '../server/utils';

export enum SubscriptionStatus {
  PastDue = 'past_due',
  CancelAtPeriodEnd = 'cancel_at_period_end',
  Active = 'active',
  Deleted = 'deleted',
}

export enum PaymentPlanId {
  Essencial = 'essencial',
  Profissional = 'profissional',
  Enterprise = 'enterprise',
  Credits10 = 'credits10',
}

export interface PaymentPlan {
  // Returns the id under which this payment plan is identified on your payment processor.
  // E.g. this might be price id on Stripe, or variant id on LemonSqueezy.
  getPaymentProcessorPlanId: () => string;
  effect: PaymentPlanEffect;
}

export type PaymentPlanEffect = { kind: 'subscription' } | { kind: 'credits'; amount: number };

export const paymentPlans: Record<PaymentPlanId, PaymentPlan> = {
  [PaymentPlanId.Essencial]: {
    getPaymentProcessorPlanId: () => requireNodeEnvVar('PAYMENTS_ESSENCIAL_SUBSCRIPTION_PLAN_ID'),
    effect: { kind: 'subscription' },
  },
  [PaymentPlanId.Profissional]: {
    getPaymentProcessorPlanId: () => requireNodeEnvVar('PAYMENTS_PROFISSIONAL_SUBSCRIPTION_PLAN_ID'),
    effect: { kind: 'subscription' },
  },
  [PaymentPlanId.Enterprise]: {
    getPaymentProcessorPlanId: () => requireNodeEnvVar('PAYMENTS_ENTERPRISE_SUBSCRIPTION_PLAN_ID'),
    effect: { kind: 'subscription' },
  },
  [PaymentPlanId.Credits10]: {
    getPaymentProcessorPlanId: () => requireNodeEnvVar('PAYMENTS_CREDITS_10_PLAN_ID'),
    effect: { kind: 'credits', amount: 10 },
  },
};

export function prettyPaymentPlanName(planId: PaymentPlanId): string {
  const planToName: Record<PaymentPlanId, string> = {
    [PaymentPlanId.Essencial]: 'Essencial',
    [PaymentPlanId.Profissional]: 'Profissional',
    [PaymentPlanId.Enterprise]: 'Enterprise',
    [PaymentPlanId.Credits10]: '10 Credits',
  };
  return planToName[planId];
}

export function parsePaymentPlanId(planId: string): PaymentPlanId {
  if ((Object.values(PaymentPlanId) as string[]).includes(planId)) {
    return planId as PaymentPlanId;
  } else {
    throw new Error(`Invalid PaymentPlanId: ${planId}`);
  }
}

export function getSubscriptionPaymentPlanIds(): PaymentPlanId[] {
  return Object.values(PaymentPlanId).filter((planId) => paymentPlans[planId].effect.kind === 'subscription');
}

// Plan limits configuration
export interface PlanLimits {
  maxSalons: number;
  maxProfessionalsPerSalon: number;
  maxMonthlyAppointments: number; // Using Infinity for unlimited
  maxAppointmentsPerMonth: number | null; // null = unlimited (deprecated, use maxMonthlyAppointments)
  features: {
    onlineBooking: boolean;
    inventory: boolean;
    advancedReports: boolean;
    commissions: boolean;
    whatsappIntegration: boolean;
    multiUnit: boolean;
    customApi: boolean;
    customDomain: boolean;
    dedicatedManager: boolean;
    customIntegrations: boolean;
    teamTraining: boolean;
    sla: boolean;
    support24x7: boolean;
  };
}

export const planLimits: Record<PaymentPlanId, PlanLimits> = {
  [PaymentPlanId.Essencial]: {
    maxSalons: 1,
    maxProfessionalsPerSalon: 1,
    maxMonthlyAppointments: 150,
    maxAppointmentsPerMonth: 150,
    features: {
      onlineBooking: true,
      inventory: false,
      advancedReports: false,
      commissions: false,
      whatsappIntegration: false,
      multiUnit: false,
      customApi: false,
      customDomain: false,
      dedicatedManager: false,
      customIntegrations: false,
      teamTraining: false,
      sla: false,
      support24x7: false,
    },
  },
  [PaymentPlanId.Profissional]: {
    maxSalons: 2,
    maxProfessionalsPerSalon: 5,
    maxMonthlyAppointments: Infinity,
    maxAppointmentsPerMonth: null, // unlimited
    features: {
      onlineBooking: true,
      inventory: true,
      advancedReports: true,
      commissions: true,
      whatsappIntegration: true,
      multiUnit: true,
      customApi: false,
      customDomain: false,
      dedicatedManager: false,
      customIntegrations: false,
      teamTraining: false,
      sla: false,
      support24x7: false,
    },
  },
  [PaymentPlanId.Enterprise]: {
    maxSalons: 999, // unlimited
    maxProfessionalsPerSalon: 999, // unlimited
    maxMonthlyAppointments: Infinity,
    maxAppointmentsPerMonth: null, // unlimited
    features: {
      onlineBooking: true,
      inventory: true,
      advancedReports: true,
      commissions: true,
      whatsappIntegration: true,
      multiUnit: true,
      customApi: true,
      customDomain: true,
      dedicatedManager: true,
      customIntegrations: true,
      teamTraining: true,
      sla: true,
      support24x7: true,
    },
  },
  [PaymentPlanId.Credits10]: {
    maxSalons: 0,
    maxProfessionalsPerSalon: 0,
    maxMonthlyAppointments: 0,
    maxAppointmentsPerMonth: 0,
    features: {
      onlineBooking: false,
      inventory: false,
      advancedReports: false,
      commissions: false,
      whatsappIntegration: false,
      multiUnit: false,
      customApi: false,
      customDomain: false,
      dedicatedManager: false,
      customIntegrations: false,
      teamTraining: false,
      sla: false,
      support24x7: false,
    },
  },
};

/**
 * Get plan limits for a specific plan
 */
export function getPlanLimits(planId: PaymentPlanId | null): PlanLimits {
  if (!planId) {
    // Default to Essencial limits for users without a plan
    return planLimits[PaymentPlanId.Essencial];
  }
  return planLimits[planId];
}

/**
 * Check if user has active trial (14 days from account creation)
 */
export function hasActiveTrial(user: { createdAt: Date; datePaid: Date | null }): boolean {
  if (user.datePaid) {
    return false; // User has paid, no trial
  }
  
  const trialEndDate = new Date(user.createdAt);
  trialEndDate.setDate(trialEndDate.getDate() + 14); // 14 days trial
  
  return new Date() < trialEndDate;
}

/**
 * Get effective plan for user (considering trial)
 */
export function getEffectivePlan(user: {
  subscriptionPlan: string | null;
  createdAt: Date;
  datePaid: Date | null;
}): PaymentPlanId {
  // If user has active trial, they get Profissional plan
  if (hasActiveTrial(user)) {
    return PaymentPlanId.Profissional;
  }
  
  // If user has paid plan, use it
  if (user.subscriptionPlan) {
    try {
      return parsePaymentPlanId(user.subscriptionPlan);
    } catch {
      return PaymentPlanId.Essencial;
    }
  }
  
  // Default to Essencial
  return PaymentPlanId.Essencial;
}
