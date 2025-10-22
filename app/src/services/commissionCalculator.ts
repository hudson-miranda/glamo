/**
 * Commission Calculation Engine for Glamo
 * 
 * This module handles commission calculations for services based on different scenarios:
 * - Solo professional (without assistant)
 * - Professional with assistant
 * - As assistant (helping another professional)
 * 
 * Supports both FIXED and PERCENT value types.
 */

export type ValueType = 'FIXED' | 'PERCENT';

export interface CommissionConfig {
  commissionType: string;
  baseValueType: ValueType;
  baseValue: number;
  deductAssistantsFromProfessional: boolean;
  soloValue: number;
  soloValueType: ValueType;
  withAssistantValue: number;
  withAssistantValueType: ValueType;
  asAssistantValue: number;
  asAssistantValueType: ValueType;
}

export interface ServiceData {
  price: number;
  costValue: number;
  costValueType: ValueType;
  nonCommissionableValue: number;
  nonCommissionableValueType: ValueType;
}

export interface CommissionResult {
  grossValue: number;              // Service price
  costValue: number;                // Cost deduction
  nonCommissionableValue: number;   // Non-commissionable deduction
  commissionableBase: number;       // Base for commission calculation
  commissionValue: number;          // Final commission value
  commissionPercentage: number;     // Percentage of gross value
  scenario: 'SOLO' | 'WITH_ASSISTANT' | 'AS_ASSISTANT';
}

/**
 * Calculates the actual value from a configuration value (fixed or percentage)
 */
function calculateValue(value: number, valueType: ValueType, baseAmount: number): number {
  if (valueType === 'FIXED') {
    return value;
  } else {
    // PERCENT
    return (baseAmount * value) / 100;
  }
}

/**
 * Calculates the commissionable base by deducting costs and non-commissionable values
 */
function calculateCommissionableBase(serviceData: ServiceData): {
  commissionableBase: number;
  costValue: number;
  nonCommissionableValue: number;
} {
  const { price, costValue, costValueType, nonCommissionableValue, nonCommissionableValueType } = serviceData;

  const actualCostValue = calculateValue(costValue, costValueType, price);
  const actualNonCommissionableValue = calculateValue(
    nonCommissionableValue,
    nonCommissionableValueType,
    price
  );

  const commissionableBase = Math.max(0, price - actualCostValue - actualNonCommissionableValue);

  return {
    commissionableBase,
    costValue: actualCostValue,
    nonCommissionableValue: actualNonCommissionableValue,
  };
}

/**
 * Calculates commission for a professional working solo (without assistant)
 * 
 * @param config Commission configuration
 * @param serviceData Service pricing data
 * @returns Commission calculation result
 * 
 * @example
 * // Service price: 100, no costs, solo commission: 50%
 * const result = calculateSoloCommission(config, { price: 100, ... });
 * // result.commissionValue = 50
 */
export function calculateSoloCommission(
  config: CommissionConfig,
  serviceData: ServiceData
): CommissionResult {
  const { commissionableBase, costValue, nonCommissionableValue } = 
    calculateCommissionableBase(serviceData);

  const commissionValue = calculateValue(
    config.soloValue,
    config.soloValueType,
    commissionableBase
  );

  return {
    grossValue: serviceData.price,
    costValue,
    nonCommissionableValue,
    commissionableBase,
    commissionValue: Math.max(0, commissionValue),
    commissionPercentage: serviceData.price > 0 
      ? (commissionValue / serviceData.price) * 100 
      : 0,
    scenario: 'SOLO',
  };
}

/**
 * Calculates commission for a professional working with an assistant
 * 
 * The professional receives their commission, and if configured,
 * assistant commissions are deducted from the professional's share.
 * 
 * @param config Commission configuration
 * @param serviceData Service pricing data
 * @param assistantCount Number of assistants (default: 1)
 * @returns Commission calculation result
 * 
 * @example
 * // Service price: 100, with assistant commission: 40%, assistant gets: 10% each
 * // If deductAssistantsFromProfessional is true:
 * //   Professional = 40 - 10 = 30
 * // If false:
 * //   Professional = 40
 */
export function calculateWithAssistantCommission(
  config: CommissionConfig,
  serviceData: ServiceData,
  assistantCount: number = 1
): CommissionResult {
  const { commissionableBase, costValue, nonCommissionableValue } = 
    calculateCommissionableBase(serviceData);

  let commissionValue = calculateValue(
    config.withAssistantValue,
    config.withAssistantValueType,
    commissionableBase
  );

  // Deduct assistant commissions if configured
  if (config.deductAssistantsFromProfessional) {
    const assistantCommissionPerAssistant = calculateValue(
      config.asAssistantValue,
      config.asAssistantValueType,
      commissionableBase
    );

    const totalAssistantCommission = assistantCommissionPerAssistant * assistantCount;
    commissionValue = Math.max(0, commissionValue - totalAssistantCommission);
  }

  return {
    grossValue: serviceData.price,
    costValue,
    nonCommissionableValue,
    commissionableBase,
    commissionValue: Math.max(0, commissionValue),
    commissionPercentage: serviceData.price > 0 
      ? (commissionValue / serviceData.price) * 100 
      : 0,
    scenario: 'WITH_ASSISTANT',
  };
}

/**
 * Calculates commission for a professional working as an assistant
 * 
 * @param config Commission configuration
 * @param serviceData Service pricing data
 * @returns Commission calculation result
 * 
 * @example
 * // Service price: 100, as assistant commission: 10%
 * const result = calculateAsAssistantCommission(config, { price: 100, ... });
 * // result.commissionValue = 10
 */
export function calculateAsAssistantCommission(
  config: CommissionConfig,
  serviceData: ServiceData
): CommissionResult {
  const { commissionableBase, costValue, nonCommissionableValue } = 
    calculateCommissionableBase(serviceData);

  const commissionValue = calculateValue(
    config.asAssistantValue,
    config.asAssistantValueType,
    commissionableBase
  );

  return {
    grossValue: serviceData.price,
    costValue,
    nonCommissionableValue,
    commissionableBase,
    commissionValue: Math.max(0, commissionValue),
    commissionPercentage: serviceData.price > 0 
      ? (commissionValue / serviceData.price) * 100 
      : 0,
    scenario: 'AS_ASSISTANT',
  };
}

/**
 * Main commission calculation function that routes to the appropriate calculator
 * based on the scenario.
 * 
 * @param config Commission configuration
 * @param serviceData Service pricing data
 * @param scenario Scenario type
 * @param assistantCount Number of assistants (only used for WITH_ASSISTANT scenario)
 * @returns Commission calculation result
 */
export function calculateCommission(
  config: CommissionConfig,
  serviceData: ServiceData,
  scenario: 'SOLO' | 'WITH_ASSISTANT' | 'AS_ASSISTANT',
  assistantCount: number = 1
): CommissionResult {
  switch (scenario) {
    case 'SOLO':
      return calculateSoloCommission(config, serviceData);
    case 'WITH_ASSISTANT':
      return calculateWithAssistantCommission(config, serviceData, assistantCount);
    case 'AS_ASSISTANT':
      return calculateAsAssistantCommission(config, serviceData);
    default:
      throw new Error(`Invalid commission scenario: ${scenario}`);
  }
}

/**
 * Utility function to format currency values
 */
export function formatCurrency(value: number, currency: string = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Utility function to format percentage values
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}
