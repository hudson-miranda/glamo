// Waiting List Management Operations
import type { WaitingListInput } from './types';
import { requirePermission } from '@src/rbac/requirePermission';
import { HttpError } from 'wasp/server';
import { addMinutes } from './utils/dateUtils';

/**
 * Add a client to the waiting list
 */
export const addToWaitingList = async (
  args: WaitingListInput,
  context: any
) => {
  if (!context.user) {
    throw new HttpError(401, 'Não autenticado');
  }

  await requirePermission(
    context.user,
    args.salonId,
    'appointments:manage_waiting_list',
    context.entities
  );

  // Check if client is already on waiting list for these services
  const existing = await context.entities.WaitingList.findFirst({
    where: {
      salonId: args.salonId,
      clientId: args.clientId,
      status: 'WAITING'
    }
  });

  if (existing) {
    throw new HttpError(400, 'Cliente já está na lista de espera');
  }

  const waitingListEntry = await context.entities.WaitingList.create({
    data: {
      salonId: args.salonId,
      clientId: args.clientId,
      employeeId: args.employeeId,
      serviceIds: args.serviceIds,
      preferredDate: args.preferredDate,
      preferredStartTime: args.preferredStartTime,
      preferredEndTime: args.preferredEndTime,
      flexibleTiming: args.flexibleTiming !== undefined ? args.flexibleTiming : true,
      notes: args.notes,
      status: 'WAITING'
    },
    include: {
      client: true,
      employee: true
    }
  });

  return waitingListEntry;
};

/**
 * Update waiting list entry
 */
export const updateWaitingListEntry = async (
  args: {
    entryId: string;
    preferredDate?: Date;
    preferredStartTime?: string;
    preferredEndTime?: string;
    flexibleTiming?: boolean;
    notes?: string;
    priority?: number;
  },
  context: any
) => {
  if (!context.user) {
    throw new HttpError(401, 'Não autenticado');
  }

  const entry = await context.entities.WaitingList.findUnique({
    where: { id: args.entryId }
  });

  if (!entry) {
    throw new HttpError(404, 'Entrada na lista de espera não encontrada');
  }

  await requirePermission(
    context.user,
    entry.salonId,
    'appointments:manage_waiting_list',
    context.entities
  );

  const updates: any = {};

  if (args.preferredDate !== undefined) updates.preferredDate = args.preferredDate;
  if (args.preferredStartTime !== undefined) updates.preferredStartTime = args.preferredStartTime;
  if (args.preferredEndTime !== undefined) updates.preferredEndTime = args.preferredEndTime;
  if (args.flexibleTiming !== undefined) updates.flexibleTiming = args.flexibleTiming;
  if (args.notes !== undefined) updates.notes = args.notes;
  if (args.priority !== undefined) updates.priority = args.priority;

  const updated = await context.entities.WaitingList.update({
    where: { id: args.entryId },
    data: updates,
    include: {
      client: true,
      employee: true
    }
  });

  return updated;
};

/**
 * Notify client from waiting list about available slot
 */
export const notifyWaitingListClient = async (
  {
    entryId,
    availableSlot
  }: {
    entryId: string;
    availableSlot: {
      startTime: Date;
      endTime: Date;
    };
  },
  context: any
) => {
  if (!context.user) {
    throw new HttpError(401, 'Não autenticado');
  }

  const entry = await context.entities.WaitingList.findUnique({
    where: { id: entryId },
    include: {
      client: true
    }
  });

  if (!entry) {
    throw new HttpError(404, 'Entrada na lista de espera não encontrada');
  }

  await requirePermission(
    context.user,
    entry.salonId,
    'appointments:manage_waiting_list',
    context.entities
  );

  if (entry.status !== 'WAITING') {
    throw new HttpError(400, 'Esta entrada não está mais aguardando');
  }

  // Update status and set expiration (30 minutes to respond)
  const expiresAt = addMinutes(new Date(), 30);

  const updated = await context.entities.WaitingList.update({
    where: { id: entryId },
    data: {
      status: 'NOTIFIED',
      notifiedAt: new Date(),
      expiresAt
    },
    include: {
      client: true,
      employee: true
    }
  });

  // TODO: Send notification to client via SMS/Email/WhatsApp
  // This would integrate with the notification system
  console.log('Notifying client:', entry.client.name, 'about available slot');

  return updated;
};

/**
 * Client accepts slot from waiting list
 */
export const acceptWaitingListSlot = async (
  {
    entryId,
    startTime,
    notes
  }: {
    entryId: string;
    startTime: Date;
    notes?: string;
  },
  context: any
) => {
  if (!context.user) {
    throw new HttpError(401, 'Não autenticado');
  }

  const entry = await context.entities.WaitingList.findUnique({
    where: { id: entryId },
    include: {
      client: true,
      employee: true
    }
  });

  if (!entry) {
    throw new HttpError(404, 'Entrada na lista de espera não encontrada');
  }

  await requirePermission(
    context.user,
    entry.salonId,
    'can_create_appointments',
    context.entities
  );

  if (entry.status !== 'NOTIFIED') {
    throw new HttpError(400, 'Esta entrada não foi notificada ou já expirou');
  }

  // Check if offer has expired
  if (entry.expiresAt && entry.expiresAt < new Date()) {
    throw new HttpError(400, 'A oferta expirou');
  }

  // Create appointment from waiting list
  const { createAppointment } = await import('./operations');
  
  const appointment = await createAppointment(
    {
      salonId: entry.salonId,
      clientId: entry.clientId,
      employeeId: entry.employeeId!,
      serviceIds: entry.serviceIds,
      startTime,
      notes: notes || entry.notes || 'Agendado via lista de espera',
      bookingSource: 'STAFF'
    },
    context
  );

  // Update waiting list entry status
  await context.entities.WaitingList.update({
    where: { id: entryId },
    data: {
      status: 'ACCEPTED'
    }
  });

  return {
    appointment,
    waitingListEntry: entry
  };
};

/**
 * Cancel/remove from waiting list
 */
export const cancelWaitingListEntry = async (
  { entryId, reason }: { entryId: string; reason?: string },
  context: any
) => {
  if (!context.user) {
    throw new HttpError(401, 'Não autenticado');
  }

  const entry = await context.entities.WaitingList.findUnique({
    where: { id: entryId }
  });

  if (!entry) {
    throw new HttpError(404, 'Entrada na lista de espera não encontrada');
  }

  await requirePermission(
    context.user,
    entry.salonId,
    'appointments:manage_waiting_list',
    context.entities
  );

  const updated = await context.entities.WaitingList.update({
    where: { id: entryId },
    data: {
      status: 'CANCELLED',
      notes: reason ? `${entry.notes || ''}\nCancelado: ${reason}` : entry.notes
    }
  });

  return updated;
};

/**
 * List waiting list entries
 */
export const listWaitingList = async (
  args: {
    salonId: string;
    status?: string;
    employeeId?: string;
    clientId?: string;
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

  if (args.status) {
    where.status = args.status;
  }

  if (args.employeeId) {
    where.employeeId = args.employeeId;
  }

  if (args.clientId) {
    where.clientId = args.clientId;
  }

  const entries = await context.entities.WaitingList.findMany({
    where,
    include: {
      client: true,
      employee: true
    },
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'asc' }
    ]
  });

  return entries;
};

/**
 * Get waiting list entry by ID
 */
export const getWaitingListEntry = async (
  { entryId }: { entryId: string },
  context: any
) => {
  if (!context.user) {
    throw new HttpError(401, 'Não autenticado');
  }

  const entry = await context.entities.WaitingList.findUnique({
    where: { id: entryId },
    include: {
      client: true,
      employee: true
    }
  });

  if (!entry) {
    throw new HttpError(404, 'Entrada na lista de espera não encontrada');
  }

  await requirePermission(
    context.user,
    entry.salonId,
    'can_view_appointments',
    context.entities
  );

  return entry;
};

/**
 * Auto-expire old waiting list notifications
 */
export const expireWaitingListOffers = async (
  args: { salonId: string },
  context: any
) => {
  const now = new Date();

  const expired = await context.entities.WaitingList.updateMany({
    where: {
      salonId: args.salonId,
      status: 'NOTIFIED',
      expiresAt: {
        lt: now
      }
    },
    data: {
      status: 'EXPIRED'
    }
  });

  return {
    expiredCount: expired.count
  };
};
