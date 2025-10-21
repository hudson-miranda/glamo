import { HttpError } from 'wasp/server';
import type { 
  ListCashSessions,
  GetCashSession,
  OpenCashSession,
  CloseCashSession,
  AddCashMovement,
  GetDailyCashReport
} from 'wasp/server/operations';
import { requirePermission } from '../rbac/requirePermission';
import { calculateReconciliation } from './reconciliation';

// ============================================================================
// Types
// ============================================================================

type ListCashSessionsInput = {
  salonId: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
  reconciled?: boolean;
  page?: number;
  perPage?: number;
};

type ListCashSessionsOutput = {
  sessions: any[];
  total: number;
  page: number;
  perPage: number;
};

type GetCashSessionInput = {
  sessionId: string;
  salonId: string;
};

type OpenCashSessionInput = {
  salonId: string;
  openingBalance: number;
};

type CloseCashSessionInput = {
  sessionId: string;
  salonId: string;
  closingBalance: number;
};

type AddCashMovementInput = {
  sessionId: string;
  salonId: string;
  type: 'SANGRIA' | 'SUPRIMENTO';
  amount: number;
  notes?: string;
};

type GetDailyCashReportInput = {
  salonId: string;
  date: string; // YYYY-MM-DD
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Lists cash register sessions with filtering and pagination.
 * Permission required: can_view_cash_register
 */
export const listCashSessions: ListCashSessions<ListCashSessionsInput, ListCashSessionsOutput> = async (
  { salonId, startDate, endDate, userId, reconciled, page = 1, perPage = 20 },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_view_cash_register', context.entities);

  const where: any = {
    salonId,
  };

  if (startDate && endDate) {
    where.openedAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  } else if (startDate) {
    where.openedAt = { gte: new Date(startDate) };
  } else if (endDate) {
    where.openedAt = { lte: new Date(endDate) };
  }

  if (userId) {
    where.openedBy = userId;
  }

  if (reconciled !== undefined) {
    where.reconciled = reconciled;
  }

  const [sessions, total] = await Promise.all([
    context.entities.CashRegisterSession.findMany({
      where,
      include: {
        opener: {
          select: {
            id: true,
            name: true,
          },
        },
        closer: {
          select: {
            id: true,
            name: true,
          },
        },
        movements: true,
      },
      orderBy: { openedAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    context.entities.CashRegisterSession.count({ where }),
  ]);

  // Log access
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'CashRegisterSession',
      entityId: salonId,
      action: 'LIST',
      before: null,
      after: { filters: { startDate, endDate, userId, reconciled } },
    },
  });

  return {
    sessions,
    total,
    page,
    perPage,
  };
};

/**
 * Gets detailed information about a specific cash register session.
 * Permission required: can_view_cash_register
 */
export const getCashSession: GetCashSession<GetCashSessionInput, any> = async (
  { sessionId, salonId },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_view_cash_register', context.entities);

  const session = await context.entities.CashRegisterSession.findUnique({
    where: { id: sessionId },
    include: {
      salon: {
        select: {
          id: true,
          name: true,
        },
      },
      opener: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      closer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      movements: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!session) {
    throw new HttpError(404, 'Cash register session not found');
  }

  if (session.salonId !== salonId) {
    throw new HttpError(403, 'Access denied to this cash register session');
  }

  // Calculate reconciliation details if session is closed
  let reconciliation = null;
  if (session.closedAt && session.closingBalance !== null) {
    reconciliation = await calculateReconciliation(sessionId, context);
  }

  // Log access
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'CashRegisterSession',
      entityId: sessionId,
      action: 'VIEW',
      before: null,
      after: null,
    },
  });

  return {
    ...session,
    reconciliation,
  };
};

/**
 * Gets a consolidated daily cash report for all sessions.
 * Permission required: can_view_cash_register
 */
export const getDailyCashReport: GetDailyCashReport<GetDailyCashReportInput, any> = async (
  { salonId, date },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_view_cash_register', context.entities);

  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);

  // Get all sessions for the day
  const sessions = await context.entities.CashRegisterSession.findMany({
    where: {
      salonId,
      openedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      opener: {
        select: {
          id: true,
          name: true,
        },
      },
      closer: {
        select: {
          id: true,
          name: true,
        },
      },
      movements: true,
    },
  });

  // Get all payments for the day
  const payments = await context.entities.Payment.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      sale: {
        salonId,
      },
    },
    include: {
      paymentMethod: true,
      sale: {
        select: {
          id: true,
          finalTotal: true,
        },
      },
    },
  });

  // Calculate totals
  const totalOpeningBalance = sessions.reduce((sum, s) => sum + s.openingBalance, 0);
  const totalClosingBalance = sessions.reduce((sum, s) => sum + (s.closingBalance || 0), 0);
  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
  
  // Calculate movements
  const totalSangria = sessions.reduce((sum, s) => 
    sum + s.movements.filter(m => m.type === 'SANGRIA').reduce((ms, m) => ms + m.amount, 0), 0
  );
  const totalSuprimento = sessions.reduce((sum, s) => 
    sum + s.movements.filter(m => m.type === 'SUPRIMENTO').reduce((ms, m) => ms + m.amount, 0), 0
  );

  // Calculate expected closing balance
  const expectedClosingBalance = totalOpeningBalance + totalPayments + totalSuprimento - totalSangria;
  const discrepancy = totalClosingBalance - expectedClosingBalance;

  // Group payments by method
  const paymentsByMethod: { [key: string]: { name: string; total: number; count: number } } = {};
  
  payments.forEach(payment => {
    const methodName = payment.paymentMethod.name;
    if (!paymentsByMethod[methodName]) {
      paymentsByMethod[methodName] = {
        name: methodName,
        total: 0,
        count: 0,
      };
    }
    paymentsByMethod[methodName].total += payment.amount;
    paymentsByMethod[methodName].count += 1;
  });

  return {
    date,
    sessions: sessions.length,
    openSessions: sessions.filter(s => !s.closedAt).length,
    totalOpeningBalance,
    totalClosingBalance,
    totalPayments,
    totalSangria,
    totalSuprimento,
    expectedClosingBalance,
    discrepancy,
    paymentsByMethod: Object.values(paymentsByMethod),
    sessionDetails: sessions,
  };
};

// ============================================================================
// Actions
// ============================================================================

/**
 * Opens a new cash register session.
 * Permission required: can_manage_cash_register
 */
export const openCashSession: OpenCashSession<OpenCashSessionInput, any> = async (
  { salonId, openingBalance },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_manage_cash_register', context.entities);

  if (openingBalance < 0) {
    throw new HttpError(400, 'Opening balance must be non-negative');
  }

  // Check if user already has an open session
  const existingSession = await context.entities.CashRegisterSession.findFirst({
    where: {
      salonId,
      openedBy: context.user.id,
      closedAt: null,
    },
  });

  if (existingSession) {
    throw new HttpError(400, 'You already have an open cash register session. Please close it before opening a new one.');
  }

  // Create new session
  const session = await context.entities.CashRegisterSession.create({
    data: {
      salonId,
      openedBy: context.user.id,
      openingBalance,
    },
    include: {
      opener: {
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
      entity: 'CashRegisterSession',
      entityId: session.id,
      action: 'OPEN',
      before: null,
      after: { openingBalance },
    },
  });

  return session;
};

/**
 * Closes a cash register session and performs reconciliation.
 * Permission required: can_manage_cash_register
 */
export const closeCashSession: CloseCashSession<CloseCashSessionInput, any> = async (
  { sessionId, salonId, closingBalance },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_manage_cash_register', context.entities);

  if (closingBalance < 0) {
    throw new HttpError(400, 'Closing balance must be non-negative');
  }

  const session = await context.entities.CashRegisterSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new HttpError(404, 'Cash register session not found');
  }

  if (session.salonId !== salonId) {
    throw new HttpError(403, 'Access denied to this cash register session');
  }

  if (session.closedAt) {
    throw new HttpError(400, 'Cash register session is already closed');
  }

  // Only the user who opened the session or a manager can close it
  const canCloseOthers = await context.entities.UserSalon.findFirst({
    where: {
      userId: context.user.id,
      salonId,
      isActive: true,
      userRoles: {
        some: {
          role: {
            name: {
              in: ['owner', 'manager'],
            },
          },
        },
      },
    },
  });

  if (session.openedBy !== context.user.id && !canCloseOthers) {
    throw new HttpError(403, 'You can only close your own cash register session');
  }

  // Calculate reconciliation
  const reconciliation = await calculateReconciliation(sessionId, context);
  const expectedBalance = reconciliation.expectedClosingBalance;
  const discrepancy = closingBalance - expectedBalance;
  const isReconciled = Math.abs(discrepancy) < 0.01; // Allow 1 cent difference

  // Close session
  const closedSession = await context.entities.CashRegisterSession.update({
    where: { id: sessionId },
    data: {
      closedBy: context.user.id,
      closedAt: new Date(),
      closingBalance,
      reconciled: isReconciled,
    },
    include: {
      opener: {
        select: {
          id: true,
          name: true,
        },
      },
      closer: {
        select: {
          id: true,
          name: true,
        },
      },
      movements: true,
    },
  });

  // Log closure
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'CashRegisterSession',
      entityId: sessionId,
      action: 'CLOSE',
      before: { status: 'open' },
      after: { 
        status: 'closed', 
        closingBalance, 
        expectedBalance, 
        discrepancy, 
        reconciled: isReconciled 
      },
    },
  });

  return {
    ...closedSession,
    reconciliation: {
      ...reconciliation,
      actualClosingBalance: closingBalance,
      discrepancy,
      isReconciled,
    },
  };
};

/**
 * Adds a cash movement (sangria or suprimento) to an open session.
 * Permission required: can_manage_cash_register
 */
export const addCashMovement: AddCashMovement<AddCashMovementInput, any> = async (
  { sessionId, salonId, type, amount, notes },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_manage_cash_register', context.entities);

  if (amount <= 0) {
    throw new HttpError(400, 'Amount must be positive');
  }

  const session = await context.entities.CashRegisterSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new HttpError(404, 'Cash register session not found');
  }

  if (session.salonId !== salonId) {
    throw new HttpError(403, 'Access denied to this cash register session');
  }

  if (session.closedAt) {
    throw new HttpError(400, 'Cannot add movement to a closed session');
  }

  // Create movement
  const movement = await context.entities.CashMovement.create({
    data: {
      sessionId,
      type,
      amount,
      notes,
    },
  });

  // Log creation
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'CashMovement',
      entityId: movement.id,
      action: 'CREATE',
      before: null,
      after: { sessionId, type, amount, notes },
    },
  });

  return movement;
};
