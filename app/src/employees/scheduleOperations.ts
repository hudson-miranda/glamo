import type { EmployeeSchedule } from 'wasp/entities';
import type { 
  ListEmployeeSchedules,
  CreateEmployeeSchedule,
  UpdateEmployeeSchedule,
  DeleteEmployeeSchedule
} from 'wasp/server/operations';
import { HttpError } from 'wasp/server';
import { requirePermission } from '../rbac/requirePermission';

// ============================================================================
// Query: listEmployeeSchedules
// ============================================================================
type ListEmployeeSchedulesInput = {
  employeeId: string;
  isActive?: boolean;
  dayOfWeek?: number;
};

type ListEmployeeSchedulesOutput = {
  schedules: EmployeeSchedule[];
  total: number;
};

export const listEmployeeSchedules: ListEmployeeSchedules<ListEmployeeSchedulesInput, ListEmployeeSchedulesOutput> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'Você precisa estar autenticado');
  }

  // Verificar se o employee existe e obter salonId
  const employee = await context.entities.Employee.findUnique({
    where: { id: args.employeeId },
    select: { id: true, salonId: true },
  });

  if (!employee) {
    throw new HttpError(404, 'Colaborador não encontrado');
  }

  // Verificar permissão
  await requirePermission(context.user, employee.salonId, 'employees:read', context.entities);

  const where: any = {
    employeeId: args.employeeId,
  };

  if (args.isActive !== undefined) {
    where.isActive = args.isActive;
  }

  if (args.dayOfWeek !== undefined) {
    where.dayOfWeek = args.dayOfWeek;
  }

  const [schedules, total] = await Promise.all([
    context.entities.EmployeeSchedule.findMany({
      where,
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    }),
    context.entities.EmployeeSchedule.count({ where }),
  ]);

  return { schedules, total };
};

// ============================================================================
// Action: createEmployeeSchedule
// ============================================================================
type CreateEmployeeScheduleInput = {
  employeeId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive?: boolean;
};

export const createEmployeeSchedule: CreateEmployeeSchedule<CreateEmployeeScheduleInput, EmployeeSchedule> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'Você precisa estar autenticado');
  }

  // Verificar se o employee existe e obter salonId
  const employee = await context.entities.Employee.findUnique({
    where: { id: args.employeeId },
    select: { id: true, salonId: true },
  });

  if (!employee) {
    throw new HttpError(404, 'Colaborador não encontrado');
  }

  // Verificar permissão
  await requirePermission(context.user, employee.salonId, 'employees:update', context.entities);

  // Validações
  if (args.dayOfWeek < 0 || args.dayOfWeek > 6) {
    throw new HttpError(400, 'Dia da semana inválido (0-6)');
  }

  if (!isValidTimeFormat(args.startTime)) {
    throw new HttpError(400, 'Formato de hora de início inválido (HH:mm)');
  }

  if (!isValidTimeFormat(args.endTime)) {
    throw new HttpError(400, 'Formato de hora de fim inválido (HH:mm)');
  }

  if (args.startTime >= args.endTime) {
    throw new HttpError(400, 'Hora de início deve ser menor que hora de fim');
  }

  // Verificar sobreposição de horários no mesmo dia
  const overlapping = await context.entities.EmployeeSchedule.findFirst({
    where: {
      employeeId: args.employeeId,
      dayOfWeek: args.dayOfWeek,
      isActive: true,
      OR: [
        // Novo horário começa durante um horário existente
        {
          startTime: { lte: args.startTime },
          endTime: { gt: args.startTime },
        },
        // Novo horário termina durante um horário existente
        {
          startTime: { lt: args.endTime },
          endTime: { gte: args.endTime },
        },
        // Novo horário engloba um horário existente
        {
          startTime: { gte: args.startTime },
          endTime: { lte: args.endTime },
        },
      ],
    },
  });

  if (overlapping) {
    throw new HttpError(400, 'Horário sobrepõe com horário existente');
  }

  // Criar horário
  const schedule = await context.entities.EmployeeSchedule.create({
    data: {
      employeeId: args.employeeId,
      dayOfWeek: args.dayOfWeek,
      startTime: args.startTime,
      endTime: args.endTime,
      isActive: args.isActive ?? true,
    },
  });

  // Log da ação
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'EmployeeSchedule',
      entityId: schedule.id,
      action: 'CREATE',
      after: {
        employeeId: args.employeeId,
        dayOfWeek: args.dayOfWeek,
        startTime: args.startTime,
        endTime: args.endTime,
      },
    },
  });

  return schedule;
};

// ============================================================================
// Action: updateEmployeeSchedule
// ============================================================================
type UpdateEmployeeScheduleInput = {
  scheduleId: string;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  isActive?: boolean;
};

export const updateEmployeeSchedule: UpdateEmployeeSchedule<UpdateEmployeeScheduleInput, EmployeeSchedule> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'Você precisa estar autenticado');
  }

  // Verificar se o schedule existe
  const schedule = await context.entities.EmployeeSchedule.findUnique({
    where: { id: args.scheduleId },
    include: {
      employee: {
        select: { id: true, salonId: true },
      },
    },
  });

  if (!schedule) {
    throw new HttpError(404, 'Horário não encontrado');
  }

  // Verificar permissão
  await requirePermission(context.user, schedule.employee.salonId, 'employees:update', context.entities);

  // Validações
  const newDayOfWeek = args.dayOfWeek ?? schedule.dayOfWeek;
  const newStartTime = args.startTime ?? schedule.startTime;
  const newEndTime = args.endTime ?? schedule.endTime;

  if (newDayOfWeek < 0 || newDayOfWeek > 6) {
    throw new HttpError(400, 'Dia da semana inválido (0-6)');
  }

  if (args.startTime && !isValidTimeFormat(args.startTime)) {
    throw new HttpError(400, 'Formato de hora de início inválido (HH:mm)');
  }

  if (args.endTime && !isValidTimeFormat(args.endTime)) {
    throw new HttpError(400, 'Formato de hora de fim inválido (HH:mm)');
  }

  if (newStartTime >= newEndTime) {
    throw new HttpError(400, 'Hora de início deve ser menor que hora de fim');
  }

  // Verificar sobreposição (excluindo o horário atual)
  const overlapping = await context.entities.EmployeeSchedule.findFirst({
    where: {
      id: { not: args.scheduleId },
      employeeId: schedule.employeeId,
      dayOfWeek: newDayOfWeek,
      isActive: true,
      OR: [
        {
          startTime: { lte: newStartTime },
          endTime: { gt: newStartTime },
        },
        {
          startTime: { lt: newEndTime },
          endTime: { gte: newEndTime },
        },
        {
          startTime: { gte: newStartTime },
          endTime: { lte: newEndTime },
        },
      ],
    },
  });

  if (overlapping) {
    throw new HttpError(400, 'Horário sobrepõe com horário existente');
  }

  const before = { ...schedule };

  // Atualizar horário
  const updated = await context.entities.EmployeeSchedule.update({
    where: { id: args.scheduleId },
    data: {
      dayOfWeek: args.dayOfWeek,
      startTime: args.startTime,
      endTime: args.endTime,
      isActive: args.isActive,
    },
  });

  // Log da ação
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'EmployeeSchedule',
      entityId: schedule.id,
      action: 'UPDATE',
      before: {
        dayOfWeek: before.dayOfWeek,
        startTime: before.startTime,
        endTime: before.endTime,
        isActive: before.isActive,
      },
      after: {
        dayOfWeek: updated.dayOfWeek,
        startTime: updated.startTime,
        endTime: updated.endTime,
        isActive: updated.isActive,
      },
    },
  });

  return updated;
};

// ============================================================================
// Action: deleteEmployeeSchedule
// ============================================================================
type DeleteEmployeeScheduleInput = {
  scheduleId: string;
};

export const deleteEmployeeSchedule: DeleteEmployeeSchedule<DeleteEmployeeScheduleInput, EmployeeSchedule> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'Você precisa estar autenticado');
  }

  // Verificar se o schedule existe
  const schedule = await context.entities.EmployeeSchedule.findUnique({
    where: { id: args.scheduleId },
    include: {
      employee: {
        select: { id: true, salonId: true },
      },
    },
  });

  if (!schedule) {
    throw new HttpError(404, 'Horário não encontrado');
  }

  // Verificar permissão
  await requirePermission(context.user, schedule.employee.salonId, 'employees:update', context.entities);

  // Deletar horário (permanente - não é soft delete)
  const deleted = await context.entities.EmployeeSchedule.delete({
    where: { id: args.scheduleId },
  });

  // Log da ação
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'EmployeeSchedule',
      entityId: schedule.id,
      action: 'DELETE',
      before: {
        employeeId: schedule.employeeId,
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
      },
    },
  });

  return deleted;
};

// ============================================================================
// Utility Functions
// ============================================================================
function isValidTimeFormat(time: string): boolean {
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}
