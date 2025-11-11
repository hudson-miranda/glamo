// Time Block Management Operations
import type { TimeBlockInput } from './types';
import { requirePermission } from '../rbac/requirePermission';
import { HttpError } from 'wasp/server';
import { startOfDay, endOfDay } from './utils/dateUtils';

/**
 * Create a time block (vacation, break, etc.)
 */
export const createTimeBlock = async (
  args: TimeBlockInput,
  context: any
) => {
  if (!context.user) {
    throw new HttpError(401, 'Não autenticado');
  }

  await requirePermission(
    context.user,
    args.salonId,
    'appointments:manage_blocks',
    context.entities
  );

  // Validate time range
  if (args.startTime >= args.endTime) {
    throw new HttpError(400, 'Hora de início deve ser antes da hora de fim');
  }

  const timeBlock = await context.entities.TimeBlock.create({
    data: {
      salonId: args.salonId,
      employeeId: args.employeeId,
      startTime: args.startTime,
      endTime: args.endTime,
      reason: args.reason,
      type: args.type,
      isRecurring: args.isRecurring || false,
      recurrenceRule: args.recurrenceRule
    },
    include: {
      employee: true
    }
  });

  return timeBlock;
};

/**
 * Update a time block
 */
export const updateTimeBlock = async (
  args: {
    timeBlockId: string;
    startTime?: Date;
    endTime?: Date;
    reason?: string;
    type?: string;
  },
  context: any
) => {
  if (!context.user) {
    throw new HttpError(401, 'Não autenticado');
  }

  const timeBlock = await context.entities.TimeBlock.findUnique({
    where: { id: args.timeBlockId }
  });

  if (!timeBlock) {
    throw new HttpError(404, 'Bloqueio de horário não encontrado');
  }

  await requirePermission(
    context.user,
    timeBlock.salonId,
    'appointments:manage_blocks',
    context.entities
  );

  const updates: any = {};

  if (args.startTime) updates.startTime = args.startTime;
  if (args.endTime) updates.endTime = args.endTime;
  if (args.reason !== undefined) updates.reason = args.reason;
  if (args.type) updates.type = args.type;

  // Validate time range if changed
  const newStart = args.startTime || timeBlock.startTime;
  const newEnd = args.endTime || timeBlock.endTime;
  
  if (newStart >= newEnd) {
    throw new HttpError(400, 'Hora de início deve ser antes da hora de fim');
  }

  const updated = await context.entities.TimeBlock.update({
    where: { id: args.timeBlockId },
    data: updates,
    include: {
      employee: true
    }
  });

  return updated;
};

/**
 * Delete a time block
 */
export const deleteTimeBlock = async (
  { timeBlockId }: { timeBlockId: string },
  context: any
) => {
  if (!context.user) {
    throw new HttpError(401, 'Não autenticado');
  }

  const timeBlock = await context.entities.TimeBlock.findUnique({
    where: { id: timeBlockId }
  });

  if (!timeBlock) {
    throw new HttpError(404, 'Bloqueio de horário não encontrado');
  }

  await requirePermission(
    context.user,
    timeBlock.salonId,
    'appointments:manage_blocks',
    context.entities
  );

  // Soft delete
  await context.entities.TimeBlock.update({
    where: { id: timeBlockId },
    data: { deletedAt: new Date() }
  });

  return { success: true };
};

/**
 * List time blocks with filters
 */
export const listTimeBlocks = async (
  args: {
    salonId: string;
    employeeId?: string;
    startDate?: Date;
    endDate?: Date;
    type?: string;
  },
  context: any
) => {
  if (!context.user) {
    throw new HttpError(401, 'Não autenticado');
  }

  await requirePermission(
    context.user,
    args.salonId,
    'can_view_appointments',
    context.entities
  );

  const where: any = {
    salonId: args.salonId,
    deletedAt: null
  };

  if (args.employeeId) {
    where.employeeId = args.employeeId;
  }

  if (args.type) {
    where.type = args.type;
  }

  if (args.startDate || args.endDate) {
    where.AND = [];
    if (args.startDate) {
      where.AND.push({ endTime: { gte: args.startDate } });
    }
    if (args.endDate) {
      where.AND.push({ startTime: { lte: args.endDate } });
    }
  }

  const timeBlocks = await context.entities.TimeBlock.findMany({
    where,
    include: {
      employee: true
    },
    orderBy: {
      startTime: 'asc'
    }
  });

  return timeBlocks;
};

/**
 * Get time block by ID
 */
export const getTimeBlock = async (
  { timeBlockId }: { timeBlockId: string },
  context: any
) => {
  if (!context.user) {
    throw new HttpError(401, 'Não autenticado');
  }

  const timeBlock = await context.entities.TimeBlock.findUnique({
    where: { id: timeBlockId },
    include: {
      employee: true
    }
  });

  if (!timeBlock) {
    throw new HttpError(404, 'Bloqueio de horário não encontrado');
  }

  await requirePermission(
    context.user,
    timeBlock.salonId,
    'can_view_appointments',
    context.entities
  );

  return timeBlock;
};

/**
 * Create recurring time blocks (e.g., lunch break every day)
 */
export const createRecurringTimeBlock = async (
  args: TimeBlockInput & {
    recurrenceRule: string;
    occurrences: number;
  },
  context: any
) => {
  if (!context.user) {
    throw new HttpError(401, 'Não autenticado');
  }

  await requirePermission(
    context.user,
    args.salonId,
    'appointments:manage_blocks',
    context.entities
  );

  // Create parent block
  const parent = await createTimeBlock(
    {
      ...args,
      isRecurring: true
    },
    context
  );

  // TODO: Generate and create child blocks based on recurrence rule
  // This would use the recurrenceUtils to generate occurrences

  return parent;
};
