/**
 * Cash Register Reconciliation Helper
 * 
 * This module handles cash register reconciliation calculations.
 * It compares expected vs actual balances and identifies discrepancies.
 */

export type ReconciliationResult = {
  openingBalance: number;
  totalPayments: number;
  totalSangria: number;
  totalSuprimento: number;
  expectedClosingBalance: number;
  paymentsByMethod: Array<{
    methodName: string;
    methodType: string;
    total: number;
    count: number;
  }>;
};

/**
 * Calculates the expected closing balance for a cash register session.
 * 
 * Formula:
 * Expected Closing = Opening Balance + Payments + Suprimento - Sangria
 */
export async function calculateReconciliation(
  sessionId: string,
  context: any
): Promise<ReconciliationResult> {
  const session = await context.entities.CashRegisterSession.findUnique({
    where: { id: sessionId },
    include: {
      movements: true,
    },
  });

  if (!session) {
    throw new Error('Cash register session not found');
  }

  // Get all payments during the session period
  const startTime = session.openedAt;
  const endTime = session.closedAt || new Date();

  const payments = await context.entities.Payment.findMany({
    where: {
      createdAt: {
        gte: startTime,
        lte: endTime,
      },
      sale: {
        salonId: session.salonId,
      },
    },
    include: {
      paymentMethod: true,
    },
  });

  // Calculate totals
  const openingBalance = session.openingBalance;
  const totalPayments = payments.reduce((sum: number, p: any) => sum + p.amount, 0);
  
  // Calculate movement totals
  const totalSangria = session.movements
    .filter((m: any) => m.type === 'SANGRIA')
    .reduce((sum: number, m: any) => sum + m.amount, 0);
  
  const totalSuprimento = session.movements
    .filter((m: any) => m.type === 'SUPRIMENTO')
    .reduce((sum: number, m: any) => sum + m.amount, 0);

  // Calculate expected closing balance
  const expectedClosingBalance = openingBalance + totalPayments + totalSuprimento - totalSangria;

  // Group payments by method
  const paymentsByMethodMap = new Map<string, {
    methodName: string;
    methodType: string;
    total: number;
    count: number;
  }>();

  payments.forEach((payment: any) => {
    const methodId = payment.paymentMethodId;
    const methodName = payment.paymentMethod.name;
    const methodType = payment.paymentMethod.type;

    if (!paymentsByMethodMap.has(methodId)) {
      paymentsByMethodMap.set(methodId, {
        methodName,
        methodType,
        total: 0,
        count: 0,
      });
    }

    const methodData = paymentsByMethodMap.get(methodId)!;
    methodData.total += payment.amount;
    methodData.count += 1;
  });

  return {
    openingBalance,
    totalPayments,
    totalSangria,
    totalSuprimento,
    expectedClosingBalance,
    paymentsByMethod: Array.from(paymentsByMethodMap.values()),
  };
}

/**
 * Validates a reconciliation by comparing actual vs expected balance.
 * Returns true if the difference is within tolerance (default 0.01).
 */
export function validateReconciliation(
  expectedBalance: number,
  actualBalance: number,
  tolerance: number = 0.01
): {
  isValid: boolean;
  discrepancy: number;
  discrepancyPercent: number;
} {
  const discrepancy = actualBalance - expectedBalance;
  const discrepancyPercent = expectedBalance !== 0 
    ? (discrepancy / expectedBalance) * 100 
    : 0;

  return {
    isValid: Math.abs(discrepancy) <= tolerance,
    discrepancy,
    discrepancyPercent,
  };
}

/**
 * Generates a detailed reconciliation report.
 */
export async function generateReconciliationReport(
  sessionId: string,
  actualClosingBalance: number,
  context: any
): Promise<{
  reconciliation: ReconciliationResult;
  validation: ReturnType<typeof validateReconciliation>;
  summary: string;
}> {
  const reconciliation = await calculateReconciliation(sessionId, context);
  const validation = validateReconciliation(
    reconciliation.expectedClosingBalance,
    actualClosingBalance
  );

  // Generate summary text
  let summary = `Opening Balance: R$ ${reconciliation.openingBalance.toFixed(2)}\n`;
  summary += `Total Payments: R$ ${reconciliation.totalPayments.toFixed(2)}\n`;
  summary += `Total Suprimento: R$ ${reconciliation.totalSuprimento.toFixed(2)}\n`;
  summary += `Total Sangria: R$ ${reconciliation.totalSangria.toFixed(2)}\n`;
  summary += `Expected Closing: R$ ${reconciliation.expectedClosingBalance.toFixed(2)}\n`;
  summary += `Actual Closing: R$ ${actualClosingBalance.toFixed(2)}\n`;
  summary += `Discrepancy: R$ ${validation.discrepancy.toFixed(2)}`;
  
  if (validation.isValid) {
    summary += ` ✓ Reconciled\n`;
  } else {
    summary += ` ✗ Not Reconciled\n`;
  }

  summary += `\nPayments by Method:\n`;
  reconciliation.paymentsByMethod.forEach(method => {
    summary += `  ${method.methodName}: R$ ${method.total.toFixed(2)} (${method.count} transactions)\n`;
  });

  return {
    reconciliation,
    validation,
    summary,
  };
}
