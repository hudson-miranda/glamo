// Advanced Scheduling Module - Backend Operations
import type { 
  CreateAppointmentInput,
  UpdateAppointmentInput,
  CreateRecurringAppointmentInput,
  TimeBlockInput,
  WaitingListInput,
  AvailabilityRequest,
  ConflictResult
} from './types';
import { generateConfirmationCode, addMinutes, differenceInHours } from './utils/dateUtils';
import { checkAdvancedConflicts, findAlternativeSlots } from './utils/conflictDetector';
import { 
  calculateAvailableSlots, 
  getMultiEmployeeAvailability,
  isSlotAvailable,
  findNextAvailableSlot,
  getOccupiedTimeBlocks
} from './utils/availabilityCalculator';
import { 
  generateOccurrences, 
  generateRRule, 
  validateRecurrenceRule,
  getRecurrenceSummary 
} from './utils/recurrenceUtils';
import { requirePermission } from '../rbac/requirePermission';
import { HttpError } from 'wasp/server';

// ============================================================================
// APPOINTMENT OPERATIONS
// ============================================================================

/**
 * Create a new appointment with conflict checking
 */
export const createAppointment = async (
  args: CreateAppointmentInput,
  context: any
) => {
  if (!context.user) {
    throw new HttpError(401, 'Não autenticado');
  }

  await requirePermission(
    context.user,
    args.salonId,
    'can_create_appointments',
    context.entities
  );

  const { salonId, clientId, employeeId, serviceIds, startTime, notes, bookedOnline, bookingSource } = args;

  // Get services to calculate duration and price
  const services = await context.entities.Service.findMany({
    where: {
      id: { in: serviceIds },
      salonId
    },
    include: {
      employeeServices: {
        where: { employeeId },
        select: { customDuration: true, customPrice: true }
      }
    }
  });

  if (services.length !== serviceIds.length) {
    throw new HttpError(400, 'Um ou mais serviços não encontrados');
  }

  // Calculate total duration and price
  let totalDuration = 0;
  let totalPrice = 0;

  services.forEach((service: any) => {
    const customDuration = service.employeeServices[0]?.customDuration;
    const customPrice = service.employeeServices[0]?.customPrice;
    
    totalDuration += customDuration || service.duration;
    totalPrice += customPrice || service.price;
  });

  const endTime = addMinutes(startTime, totalDuration);

  // Check for conflicts
  const conflict = await checkAdvancedConflicts(
    salonId,
    employeeId,
    startTime,
    endTime,
    serviceIds[0],
    undefined,
    context
  );

  if (conflict.hasConflict) {
    throw new HttpError(409, conflict.message || 'Conflito de agendamento detectado', {
      conflict,
      alternatives: await findAlternativeSlots(
        salonId,
        employeeId,
        serviceIds[0],
        startTime,
        totalDuration,
        context
      )
    });
  }

  // Create appointment
  const appointment = await context.entities.Appointment.create({
    data: {
      salonId,
      clientId,
      professionalId: context.user.id,
      employeeId,
      startAt: startTime,
      endAt: endTime,
      totalPrice,
      finalPrice: totalPrice,
      bookedOnline: bookedOnline || false,
      bookingSource: bookingSource || 'STAFF',
      confirmationCode: generateConfirmationCode(),
      status: 'PENDING',
      notes,
      services: {
        create: services.map((service: any) => ({
          serviceId: service.id,
          customPrice: service.employeeServices[0]?.customPrice,
          customDuration: service.employeeServices[0]?.customDuration
        }))
      }
    },
    include: {
      client: true,
      employee: true,
      services: {
        include: {
          service: true
        }
      }
    }
  });

  // Create appointment history entry
  await context.entities.AppointmentHistory.create({
    data: {
      appointmentId: appointment.id,
      userId: context.user.id,
      action: 'CREATED',
      notes: 'Agendamento criado'
    }
  });

  // Schedule reminders if enabled
  const bookingConfig = await context.entities.BookingConfig.findUnique({
    where: { salonId }
  });

  if (bookingConfig?.enableReminders) {
    await scheduleReminders(appointment, bookingConfig, context);
  }

  return appointment;
};

/**
 * Create recurring appointments
 */
export const createRecurringAppointment = async (
  args: CreateRecurringAppointmentInput,
  context: any
) => {
  if (!context.user) {
    throw new HttpError(401, 'Não autenticado');
  }

  await requirePermission(
    context.user,
    args.salonId,
    'can_create_appointments',
    context.entities
  );

  // Validate recurrence rule
  const validation = validateRecurrenceRule(args.recurrenceRule);
  if (!validation.valid) {
    throw new HttpError(400, validation.error);
  }

  // Generate occurrence dates
  const occurrences = generateOccurrences(args.startTime, args.recurrenceRule);

  if (occurrences.length === 0) {
    throw new HttpError(400, 'Nenhuma ocorrência foi gerada com esta regra');
  }

  // Create parent appointment
  const parentAppointment = await createAppointment(args, context);

  // Add recurrence rule to parent
  await context.entities.AppointmentRepetition.create({
    data: {
      appointmentId: parentAppointment.id,
      rule: generateRRule(args.recurrenceRule),
      repeatUntil: args.recurrenceRule.endDate
    }
  });

  // Create child appointments (skip first as it's the parent)
  const childAppointments: any[] = [];
  
  for (let i = 1; i < occurrences.length; i++) {
    const occurrenceDate = occurrences[i];
    
    try {
      const childAppointment = await createAppointment(
        {
          ...args,
          startTime: occurrenceDate
        },
        context
      );
      
      childAppointments.push(childAppointment);
    } catch (error) {
      // Log conflict but continue creating other occurrences
      console.warn(`Conflito ao criar ocorrência ${i + 1}:`, error);
    }
  }

  return {
    parent: parentAppointment,
    children: childAppointments,
    summary: getRecurrenceSummary(args.recurrenceRule),
    totalCreated: childAppointments.length + 1
  };
};

/**
 * Update an existing appointment
 */
export const updateAppointment = async (
  args: UpdateAppointmentInput,
  context: any
) => {
  if (!context.user) {
    throw new HttpError(401, 'Não autenticado');
  }

  const appointment = await context.entities.Appointment.findUnique({
    where: { id: args.appointmentId },
    include: {
      services: true
    }
  });

  if (!appointment) {
    throw new HttpError(404, 'Agendamento não encontrado');
  }

  await requirePermission(
    context.user,
    appointment.salonId,
    'can_edit_appointments',
    context.entities
  );

  const updates: any = {};
  const historyEntries: any[] = [];

  // Handle time changes
  if (args.startTime || args.endTime) {
    const newStartTime = args.startTime || appointment.startAt;
    const newEndTime = args.endTime || appointment.endAt;

    // Check for conflicts
    const conflict = await checkAdvancedConflicts(
      appointment.salonId,
      appointment.employeeId!,
      newStartTime,
      newEndTime,
      appointment.services[0].serviceId,
      appointment.id,
      context
    );

    if (conflict.hasConflict) {
      throw new HttpError(409, conflict.message || 'Conflito de agendamento');
    }

    updates.startAt = newStartTime;
    updates.endAt = newEndTime;
    
    if (appointment.rescheduleCount !== undefined) {
      updates.rescheduleCount = appointment.rescheduleCount + 1;
    }

    historyEntries.push({
      appointmentId: appointment.id,
      userId: context.user.id,
      action: 'RESCHEDULED',
      oldValue: `${appointment.startAt} - ${appointment.endAt}`,
      newValue: `${newStartTime} - ${newEndTime}`
    });
  }

  // Handle service changes
  if (args.serviceIds) {
    // Delete old services
    await context.entities.AppointmentService.deleteMany({
      where: { appointmentId: appointment.id }
    });

    // Create new services
    const services = await context.entities.Service.findMany({
      where: { id: { in: args.serviceIds } }
    });

    await context.entities.AppointmentService.createMany({
      data: services.map((service: any) => ({
        appointmentId: appointment.id,
        serviceId: service.id
      }))
    });

    historyEntries.push({
      appointmentId: appointment.id,
      userId: context.user.id,
      action: 'UPDATED',
      field: 'services',
      notes: 'Serviços alterados'
    });
  }

  // Handle status changes
  if (args.status) {
    updates.status = args.status;
    
    historyEntries.push({
      appointmentId: appointment.id,
      userId: context.user.id,
      action: 'STATUS_CHANGED',
      field: 'status',
      oldValue: appointment.status,
      newValue: args.status
    });
  }

  // Handle notes
  if (args.notes !== undefined) {
    updates.notes = args.notes;
  }

  // Update appointment
  const updated = await context.entities.Appointment.update({
    where: { id: args.appointmentId },
    data: updates,
    include: {
      client: true,
      employee: true,
      services: {
        include: {
          service: true
        }
      }
    }
  });

  // Create history entries
  if (historyEntries.length > 0) {
    await context.entities.AppointmentHistory.createMany({
      data: historyEntries
    });
  }

  return updated;
};

/**
 * Cancel an appointment
 */
export const cancelAppointment = async (
  { appointmentId, reason, cancelledBy }: {
    appointmentId: string;
    reason?: string;
    cancelledBy: 'CLIENT' | 'STAFF' | 'SYSTEM';
  },
  context: any
) => {
  if (!context.user && cancelledBy !== 'SYSTEM') {
    throw new HttpError(401, 'Não autenticado');
  }

  const appointment = await context.entities.Appointment.findUnique({
    where: { id: appointmentId },
    include: {
      salon: {
        include: {
          bookingConfig: true
        }
      }
    }
  });

  if (!appointment) {
    throw new HttpError(404, 'Agendamento não encontrado');
  }

  if (context.user) {
    await requirePermission(
      context.user,
      appointment.salonId,
      'can_edit_appointments',
      context.entities
    );
  }

  // Calculate cancellation fee
  const hoursUntilAppointment = differenceInHours(appointment.startAt, new Date());
  const config = appointment.salon.bookingConfig;
  
  let cancellationFee = 0;
  if (config && cancelledBy === 'CLIENT') {
    if (hoursUntilAppointment < config.lateCancellationHours) {
      cancellationFee = (appointment.totalPrice || 0) * (config.lateCancellationFee / 100);
    }
  }

  // Update appointment
  const cancelled = await context.entities.Appointment.update({
    where: { id: appointmentId },
    data: {
      status: 'CANCELLED',
      cancelledBy,
      cancellationReason: reason,
      cancellationFee
    },
    include: {
      client: true,
      employee: true,
      services: {
        include: {
          service: true
        }
      }
    }
  });

  // Create history entry
  await context.entities.AppointmentHistory.create({
    data: {
      appointmentId,
      userId: context.user?.id,
      action: 'CANCELLED',
      notes: reason || 'Agendamento cancelado'
    }
  });

  // Cancel scheduled reminders
  await context.entities.AppointmentReminder.updateMany({
    where: {
      appointmentId,
      status: 'PENDING'
    },
    data: {
      status: 'CANCELLED'
    }
  });

  // Check waiting list for notifications
  await checkWaitingListForNotifications(appointment, context);

  return cancelled;
};

/**
 * Get appointment details with full relations
 */
export const getAppointment = async (
  { appointmentId }: { appointmentId: string },
  context: any
) => {
  if (!context.user) {
    throw new HttpError(401, 'Não autenticado');
  }

  const appointment = await context.entities.Appointment.findUnique({
    where: { id: appointmentId },
    include: {
      client: true,
      professional: true,
      employee: true,
      services: {
        include: {
          service: true,
          variant: true
        }
      },
      assistants: {
        include: {
          assistant: true
        }
      },
      repetition: true,
      statusLogs: {
        include: {
          updatedBy: true
        },
        orderBy: {
          changedAt: 'desc'
        }
      },
      history: {
        include: {
          user: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      reminders: {
        orderBy: {
          scheduledFor: 'asc'
        }
      }
    }
  });

  if (!appointment) {
    throw new HttpError(404, 'Agendamento não encontrado');
  }

  await requirePermission(
    context.user,
    appointment.salonId,
    'can_view_appointments',
    context.entities
  );

  return appointment;
};

/**
 * List appointments with filters
 */
export const listAppointments = async (
  args: {
    salonId: string;
    employeeId?: string;
    clientId?: string;
    status?: string[];
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
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

  if (args.clientId) {
    where.clientId = args.clientId;
  }

  if (args.status && args.status.length > 0) {
    where.status = { in: args.status };
  }

  if (args.startDate || args.endDate) {
    where.startAt = {};
    if (args.startDate) {
      where.startAt.gte = args.startDate;
    }
    if (args.endDate) {
      where.startAt.lte = args.endDate;
    }
  }

  const [appointments, total] = await Promise.all([
    context.entities.Appointment.findMany({
      where,
      include: {
        client: true,
        employee: true,
        services: {
          include: {
            service: true
          }
        }
      },
      orderBy: {
        startAt: 'asc'
      },
      take: args.limit || 100,
      skip: args.offset || 0
    }),
    context.entities.Appointment.count({ where })
  ]);

  return {
    appointments,
    total,
    limit: args.limit || 100,
    offset: args.offset || 0
  };
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Schedule reminders for an appointment
 */
async function scheduleReminders(appointment: any, config: any, context: any) {
  const reminders: any[] = [];

  if (config.reminder24h) {
    const scheduledFor = new Date(appointment.startAt);
    scheduledFor.setHours(scheduledFor.getHours() - 24);

    reminders.push({
      appointmentId: appointment.id,
      type: 'REMINDER_24H',
      channel: 'EMAIL',
      scheduledFor,
      recipient: appointment.client.email || appointment.client.phone,
      message: `Lembrete: Você tem um agendamento amanhã às ${appointment.startAt.toLocaleTimeString()}`
    });
  }

  if (config.reminder2h) {
    const scheduledFor = new Date(appointment.startAt);
    scheduledFor.setHours(scheduledFor.getHours() - 2);

    reminders.push({
      appointmentId: appointment.id,
      type: 'REMINDER_2H',
      channel: 'SMS',
      scheduledFor,
      recipient: appointment.client.phone || appointment.client.email,
      message: `Lembrete: Seu agendamento é em 2 horas`
    });
  }

  if (reminders.length > 0) {
    await context.entities.AppointmentReminder.createMany({
      data: reminders
    });
  }
}

/**
 * Check waiting list and notify when slot becomes available
 */
async function checkWaitingListForNotifications(appointment: any, context: any) {
  // Implementation for waiting list notifications
  // This would integrate with the notification system
  console.log('Checking waiting list for', appointment.id);
}

// Export availability and conflict checking operations
export {
  calculateAvailableSlots,
  getMultiEmployeeAvailability,
  isSlotAvailable,
  findNextAvailableSlot,
  checkAdvancedConflicts,
  findAlternativeSlots,
  getOccupiedTimeBlocks
};
