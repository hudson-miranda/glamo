import { HttpError } from 'wasp/server';
import { Prisma } from '@prisma/client';
import type {
  ListAppointments,
  GetAppointment,
  CreateAppointment,
  UpdateAppointment,
  DeleteAppointment,
  UpdateAppointmentStatus,
  GetAvailableSlots,
} from 'wasp/server/operations';
import { requirePermission } from '../rbac/requirePermission';
import {
  checkProfessionalConflict,
  checkAssistantConflict,
  getAvailableSlots as calculateAvailableSlots,
  isWithinBusinessHours,
  calculateAppointmentEndTime,
} from './conflictDetector';
import { getEffectivePlan, getPlanLimits } from '../payment/plans';

// ============================================================================
// Types
// ============================================================================

type ListAppointmentsInput = {
  salonId: string;
  professionalId?: string;
  clientId?: string;
  status?: 'PENDING' | 'CONFIRMED' | 'IN_SERVICE' | 'DONE' | 'CANCELLED';
  startDate?: string;
  endDate?: string;
  page?: number;
  perPage?: number;
};

type ListAppointmentsOutput = {
  appointments: any[];
  total: number;
  page: number;
  perPage: number;
};

type GetAppointmentInput = {
  appointmentId: string;
  salonId: string;
};

type CreateAppointmentInput = {
  salonId: string;
  clientId: string;
  professionalId: string;
  startAt: string; // ISO date string
  services: Array<{
    serviceId: string;
    variantId?: string;
    customPrice?: number;
    customDuration?: number;
    discount?: number;
  }>;
  assistantIds?: string[];
  voucherId?: string;
  notes?: string;
};

type UpdateAppointmentInput = {
  appointmentId: string;
  salonId: string;
  clientId?: string;
  professionalId?: string;
  startAt?: string;
  services?: Array<{
    serviceId: string;
    variantId?: string;
    customPrice?: number;
    customDuration?: number;
    discount?: number;
  }>;
  assistantIds?: string[];
  voucherId?: string;
  notes?: string;
};

type DeleteAppointmentInput = {
  appointmentId: string;
  salonId: string;
};

type UpdateAppointmentStatusInput = {
  appointmentId: string;
  salonId: string;
  status: 'PENDING' | 'CONFIRMED' | 'IN_SERVICE' | 'DONE' | 'CANCELLED';
  notes?: string;
};

type GetAvailableSlotsInput = {
  salonId: string;
  professionalId: string;
  date: string; // YYYY-MM-DD
  slotDuration?: number;
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Lists appointments with filtering and pagination.
 * Permission required: can_view_appointments or can_view_all_appointments
 */
export const listAppointments: ListAppointments<ListAppointmentsInput, ListAppointmentsOutput> = async (
  { salonId, professionalId, clientId, status, startDate, endDate, page = 1, perPage = 20 },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  // Check if user can view all appointments or just their own
  const canViewAll = await context.entities.UserSalon.findFirst({
    where: {
      userId: context.user.id,
      salonId,
      isActive: true,
    },
    include: {
      userRoles: {
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const hasViewAllPermission = canViewAll?.userRoles.some(ur =>
    ur.role.rolePermissions.some(rp => rp.permission.name === 'can_view_all_appointments')
  );

  if (!hasViewAllPermission) {
    // Check if user has permission to view their own appointments
    await requirePermission(context.user, salonId, 'can_view_appointments', context.entities);
    // If not viewing all, restrict to user's own appointments
    professionalId = context.user.id;
  }

  // Build filters
  const where: any = {
    salonId,
    deletedAt: null,
  };

  if (professionalId) where.professionalId = professionalId;
  if (clientId) where.clientId = clientId;
  if (status) where.status = status;

  if (startDate || endDate) {
    where.startAt = {};
    if (startDate) where.startAt.gte = new Date(startDate);
    if (endDate) where.startAt.lte = new Date(endDate);
  }

  // Get total count
  const total = await context.entities.Appointment.count({ where });

  // Get paginated appointments
  const appointments = await context.entities.Appointment.findMany({
    where,
    skip: (page - 1) * perPage,
    take: perPage,
    orderBy: { startAt: 'asc' },
    include: {
      client: {
        select: { id: true, name: true, phone: true, email: true },
      },
      professional: {
        select: { id: true, name: true },
      },
      services: {
        include: {
          service: {
            select: { id: true, name: true, duration: true, price: true },
          },
          variant: {
            select: { id: true, name: true, duration: true, price: true },
          },
        },
      },
      assistants: {
        include: {
          assistant: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  return {
    appointments,
    total,
    page,
    perPage,
  };
};

/**
 * Gets detailed information about a specific appointment.
 * Permission required: can_view_appointments
 */
export const getAppointment: GetAppointment<GetAppointmentInput, any> = async (
  { appointmentId, salonId },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  // Check permission
  await requirePermission(context.user, salonId, 'can_view_appointments', context.entities);

  const appointment = await context.entities.Appointment.findUnique({
    where: { id: appointmentId },
    include: {
      client: true,
      professional: {
        select: { id: true, name: true, phone: true, email: true },
      },
      services: {
        include: {
          service: true,
          variant: true,
        },
      },
      assistants: {
        include: {
          assistant: {
            select: { id: true, name: true },
          },
        },
      },
      voucher: true,
      repetition: true,
      statusLogs: {
        orderBy: { changedAt: 'desc' },
        include: {
          updatedBy: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  if (!appointment) {
    throw new HttpError(404, 'Appointment not found');
  }

  if (appointment.salonId !== salonId) {
    throw new HttpError(403, 'Appointment does not belong to this salon');
  }

  return appointment;
};

/**
 * Gets available time slots for a professional on a specific date.
 * Permission required: can_view_appointments
 */
export const getAvailableSlots: GetAvailableSlots<GetAvailableSlotsInput, any> = async (
  { salonId, professionalId, date, slotDuration = 30 },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  // Check permission
  await requirePermission(context.user, salonId, 'can_view_appointments', context.entities);

  // Validate professional belongs to salon
  const userSalon = await context.entities.UserSalon.findFirst({
    where: {
      userId: professionalId,
      salonId,
      isActive: true,
    },
  });

  if (!userSalon) {
    throw new HttpError(400, 'Professional not found in this salon');
  }

  const slots = await calculateAvailableSlots(
    context.entities,
    professionalId,
    salonId,
    date,
    slotDuration
  );

  return {
    date,
    professionalId,
    slots,
    slotDuration,
  };
};

// ============================================================================
// Actions
// ============================================================================

/**
 * Creates a new appointment with conflict detection.
 * Permission required: can_create_appointments
 */
export const createAppointment: CreateAppointment<CreateAppointmentInput, any> = async (
  { salonId, clientId, professionalId, startAt, services, assistantIds = [], voucherId, notes },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  // Check permission
  await requirePermission(context.user, salonId, 'can_create_appointments', context.entities);

  // Check plan limits - monthly appointments
  const effectivePlan = getEffectivePlan({
    subscriptionPlan: context.user.subscriptionPlan,
    createdAt: context.user.createdAt,
    datePaid: context.user.datePaid,
  });
  const limits = getPlanLimits(effectivePlan);

  // Only check if plan has monthly appointment limit (not unlimited)
  if (limits.maxMonthlyAppointments !== Infinity) {
    // Get first and last day of current month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Count appointments in current month for this salon
    const monthlyAppointmentCount = await context.entities.Appointment.count({
      where: {
        salonId,
        createdAt: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
        deletedAt: null,
        status: {
          not: 'CANCELLED', // Don't count cancelled appointments
        },
      },
    });

    if (monthlyAppointmentCount >= limits.maxMonthlyAppointments) {
      throw new HttpError(
        403,
        `Monthly appointment limit reached: Your plan allows ${limits.maxMonthlyAppointments} appointments per month. Please upgrade to create more appointments.`
      );
    }
  }

  // Validate client exists and belongs to salon
  const client = await context.entities.Client.findUnique({
    where: { id: clientId },
  });

  if (!client || client.salonId !== salonId || client.deletedAt) {
    throw new HttpError(400, 'Invalid client');
  }

  // Validate professional belongs to salon
  const professionalUserSalon = await context.entities.UserSalon.findFirst({
    where: {
      userId: professionalId,
      salonId,
      isActive: true,
    },
  });

  if (!professionalUserSalon) {
    throw new HttpError(400, 'Professional not found in this salon');
  }

  // Validate services
  if (!services || services.length === 0) {
    throw new HttpError(400, 'At least one service is required');
  }

  const serviceDetails = await Promise.all(
    services.map(async (svc) => {
      const service = await context.entities.Service.findUnique({
        where: { id: svc.serviceId },
        include: { variants: true },
      });

      if (!service || service.salonId !== salonId || service.deletedAt) {
        throw new HttpError(400, `Invalid service: ${svc.serviceId}`);
      }

      if (svc.variantId) {
        const variant = service.variants.find(v => v.id === svc.variantId && !v.deletedAt);
        if (!variant) {
          throw new HttpError(400, `Invalid service variant: ${svc.variantId}`);
        }
        return {
          ...svc,
          duration: svc.customDuration || variant.duration,
          price: svc.customPrice || variant.price,
        };
      }

      return {
        ...svc,
        duration: svc.customDuration || service.duration,
        price: svc.customPrice || service.price,
      };
    })
  );

  // Calculate end time based on services
  const startAtDate = new Date(startAt);
  const endAtDate = calculateAppointmentEndTime(
    startAtDate,
    serviceDetails.map(s => ({ duration: s.duration }))
  );

  // Check business hours
  if (!isWithinBusinessHours(startAtDate, endAtDate)) {
    throw new HttpError(400, 'Appointment time is outside business hours (9 AM - 6 PM)');
  }

  // Check for professional conflicts
  const professionalConflict = await checkProfessionalConflict(
    context.entities,
    professionalId,
    salonId,
    startAtDate,
    endAtDate
  );

  if (professionalConflict.hasConflict) {
    throw new HttpError(409, professionalConflict.message || 'Professional has a conflicting appointment');
  }

  // Check for assistant conflicts
  for (const assistantId of assistantIds) {
    const assistantConflict = await checkAssistantConflict(
      context.entities,
      assistantId,
      salonId,
      startAtDate,
      endAtDate
    );

    if (assistantConflict.hasConflict) {
      throw new HttpError(409, assistantConflict.message || 'Assistant has a conflicting appointment');
    }
  }

  // Create appointment with services and assistants
  const appointment = await context.entities.Appointment.create({
    data: {
      salonId,
      clientId,
      professionalId,
      startAt: startAtDate,
      endAt: endAtDate,
      status: 'PENDING',
      voucherId,
      notes,
      services: {
        create: services.map(svc => ({
          serviceId: svc.serviceId,
          variantId: svc.variantId,
          customPrice: svc.customPrice,
          customDuration: svc.customDuration,
          discount: svc.discount || 0,
        })),
      },
      assistants: {
        create: assistantIds.map(assistantId => ({
          assistantUserId: assistantId,
        })),
      },
      statusLogs: {
        create: {
          updatedByUserId: context.user.id,
          fromStatus: null,
          toStatus: 'PENDING',
        },
      },
    },
    include: {
      client: true,
      professional: true,
      services: {
        include: {
          service: true,
          variant: true,
        },
      },
      assistants: {
        include: {
          assistant: true,
        },
      },
    },
  });

  // Log the creation
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Appointment',
      entityId: appointment.id,
      action: 'CREATE',
      before: Prisma.DbNull,
      after: {
        clientId,
        professionalId,
        startAt: startAtDate,
        endAt: endAtDate,
        status: 'PENDING',
      },
    },
  });

  return appointment;
};

/**
 * Updates an existing appointment.
 * Permission required: can_edit_appointments
 */
export const updateAppointment: UpdateAppointment<UpdateAppointmentInput, any> = async (
  { appointmentId, salonId, clientId, professionalId, startAt, services, assistantIds, voucherId, notes },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  // Check permission
  await requirePermission(context.user, salonId, 'can_edit_appointments', context.entities);

  // Get existing appointment
  const existingAppointment = await context.entities.Appointment.findUnique({
    where: { id: appointmentId },
    include: {
      services: true,
      assistants: true,
    },
  });

  if (!existingAppointment) {
    throw new HttpError(404, 'Appointment not found');
  }

  if (existingAppointment.salonId !== salonId) {
    throw new HttpError(403, 'Appointment does not belong to this salon');
  }

  if (existingAppointment.deletedAt) {
    throw new HttpError(400, 'Cannot update deleted appointment');
  }

  if (existingAppointment.status === 'DONE' || existingAppointment.status === 'CANCELLED') {
    throw new HttpError(400, 'Cannot update completed or cancelled appointment');
  }

  // Validate updates
  if (clientId) {
    const client = await context.entities.Client.findUnique({
      where: { id: clientId },
    });

    if (!client || client.salonId !== salonId || client.deletedAt) {
      throw new HttpError(400, 'Invalid client');
    }
  }

  if (professionalId) {
    const professionalUserSalon = await context.entities.UserSalon.findFirst({
      where: {
        userId: professionalId,
        salonId,
        isActive: true,
      },
    });

    if (!professionalUserSalon) {
      throw new HttpError(400, 'Professional not found in this salon');
    }
  }

  // Calculate new end time if start time or services change
  let endAtDate = existingAppointment.endAt;
  if (startAt || services) {
    const startAtDate = startAt ? new Date(startAt) : existingAppointment.startAt;
    
    if (services) {
      const serviceDetails = await Promise.all(
        services.map(async (svc) => {
          const service = await context.entities.Service.findUnique({
            where: { id: svc.serviceId },
            include: { variants: true },
          });

          if (!service || service.salonId !== salonId || service.deletedAt) {
            throw new HttpError(400, `Invalid service: ${svc.serviceId}`);
          }

          if (svc.variantId) {
            const variant = service.variants.find(v => v.id === svc.variantId && !v.deletedAt);
            if (!variant) {
              throw new HttpError(400, `Invalid service variant: ${svc.variantId}`);
            }
            return {
              ...svc,
              duration: svc.customDuration || variant.duration,
            };
          }

          return {
            ...svc,
            duration: svc.customDuration || service.duration,
          };
        })
      );

      endAtDate = calculateAppointmentEndTime(
        startAtDate,
        serviceDetails.map(s => ({ duration: s.duration }))
      );
    } else {
      const currentDuration = existingAppointment.endAt.getTime() - existingAppointment.startAt.getTime();
      endAtDate = new Date(startAtDate.getTime() + currentDuration);
    }

    // Check business hours
    if (!isWithinBusinessHours(startAtDate, endAtDate)) {
      throw new HttpError(400, 'Appointment time is outside business hours (9 AM - 6 PM)');
    }

    // Check for conflicts with new time
    const checkProfessionalId = professionalId || existingAppointment.professionalId;
    const professionalConflict = await checkProfessionalConflict(
      context.entities,
      checkProfessionalId,
      salonId,
      startAtDate,
      endAtDate,
      appointmentId
    );

    if (professionalConflict.hasConflict) {
      throw new HttpError(409, professionalConflict.message || 'Professional has a conflicting appointment');
    }

    // Check assistant conflicts
    const checkAssistantIds = assistantIds || existingAppointment.assistants.map(a => a.assistantUserId);
    for (const assistantId of checkAssistantIds) {
      const assistantConflict = await checkAssistantConflict(
        context.entities,
        assistantId,
        salonId,
        startAtDate,
        endAtDate,
        appointmentId
      );

      if (assistantConflict.hasConflict) {
        throw new HttpError(409, assistantConflict.message || 'Assistant has a conflicting appointment');
      }
    }
  }

  // Prepare update data
  const updateData: any = {};
  if (clientId !== undefined) updateData.clientId = clientId;
  if (professionalId !== undefined) updateData.professionalId = professionalId;
  if (startAt !== undefined) {
    updateData.startAt = new Date(startAt);
    updateData.endAt = endAtDate;
  }
  if (voucherId !== undefined) updateData.voucherId = voucherId;
  if (notes !== undefined) updateData.notes = notes;

  // Update appointment
  const appointment = await context.entities.Appointment.update({
    where: { id: appointmentId },
    data: updateData,
    include: {
      client: true,
      professional: true,
      services: {
        include: {
          service: true,
          variant: true,
        },
      },
      assistants: {
        include: {
          assistant: true,
        },
      },
    },
  });

  // Update services if provided
  if (services) {
    // Delete existing services
    await context.entities.AppointmentService.deleteMany({
      where: { appointmentId },
    });

    // Create new services
    await Promise.all(
      services.map(svc =>
        context.entities.AppointmentService.create({
          data: {
            appointmentId,
            serviceId: svc.serviceId,
            variantId: svc.variantId,
            customPrice: svc.customPrice,
            customDuration: svc.customDuration,
            discount: svc.discount || 0,
          },
        })
      )
    );
  }

  // Update assistants if provided
  if (assistantIds) {
    // Delete existing assistants
    await context.entities.AppointmentAssistant.deleteMany({
      where: { appointmentId },
    });

    // Create new assistants
    await Promise.all(
      assistantIds.map(assistantId =>
        context.entities.AppointmentAssistant.create({
          data: {
            appointmentId,
            assistantUserId: assistantId,
          },
        })
      )
    );
  }

  // Log the update
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Appointment',
      entityId: appointment.id,
      action: 'UPDATE',
      before: {
        startAt: existingAppointment.startAt,
        endAt: existingAppointment.endAt,
        professionalId: existingAppointment.professionalId,
      },
      after: {
        startAt: appointment.startAt,
        endAt: appointment.endAt,
        professionalId: appointment.professionalId,
      },
    },
  });

  return appointment;
};

/**
 * Soft deletes an appointment (cancels it).
 * Permission required: can_delete_appointments
 */
export const deleteAppointment: DeleteAppointment<DeleteAppointmentInput, any> = async (
  { appointmentId, salonId },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  // Check permission
  await requirePermission(context.user, salonId, 'can_delete_appointments', context.entities);

  // Get existing appointment
  const appointment = await context.entities.Appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment) {
    throw new HttpError(404, 'Appointment not found');
  }

  if (appointment.salonId !== salonId) {
    throw new HttpError(403, 'Appointment does not belong to this salon');
  }

  if (appointment.deletedAt) {
    throw new HttpError(400, 'Appointment is already deleted');
  }

  // Soft delete and set status to CANCELLED
  const deletedAppointment = await context.entities.Appointment.update({
    where: { id: appointmentId },
    data: {
      deletedAt: new Date(),
      status: 'CANCELLED',
    },
  });

  // Create status log
  await context.entities.AppointmentStatusLog.create({
    data: {
      appointmentId,
      updatedByUserId: context.user.id,
      fromStatus: appointment.status,
      toStatus: 'CANCELLED',
    },
  });

  // Log the deletion
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Appointment',
      entityId: appointment.id,
      action: 'DELETE',
      before: {
        status: appointment.status,
        deletedAt: null,
      },
      after: {
        status: 'CANCELLED',
        deletedAt: deletedAppointment.deletedAt,
      },
    },
  });

  return { success: true, message: 'Appointment cancelled successfully' };
};

/**
 * Updates appointment status with validation.
 * Permission required: can_edit_appointments
 */
export const updateAppointmentStatus: UpdateAppointmentStatus<UpdateAppointmentStatusInput, any> = async (
  { appointmentId, salonId, status, notes },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  // Check permission
  await requirePermission(context.user, salonId, 'can_edit_appointments', context.entities);

  // Get existing appointment
  const appointment = await context.entities.Appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment) {
    throw new HttpError(404, 'Appointment not found');
  }

  if (appointment.salonId !== salonId) {
    throw new HttpError(403, 'Appointment does not belong to this salon');
  }

  if (appointment.deletedAt) {
    throw new HttpError(400, 'Cannot update status of deleted appointment');
  }

  // Validate status transition
  const validTransitions: Record<string, string[]> = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['IN_SERVICE', 'CANCELLED'],
    IN_SERVICE: ['DONE', 'CANCELLED'],
    DONE: [], // Cannot change from DONE
    CANCELLED: [], // Cannot change from CANCELLED
  };

  const allowedStatuses = validTransitions[appointment.status] || [];
  if (!allowedStatuses.includes(status)) {
    throw new HttpError(
      400,
      `Cannot transition from ${appointment.status} to ${status}. Allowed transitions: ${allowedStatuses.join(', ')}`
    );
  }

  // Update status
  const updatedAppointment = await context.entities.Appointment.update({
    where: { id: appointmentId },
    data: {
      status,
      ...(notes ? { notes } : {}),
    },
  });

  // Create status log
  await context.entities.AppointmentStatusLog.create({
    data: {
      appointmentId,
      updatedByUserId: context.user.id,
      fromStatus: appointment.status,
      toStatus: status,
    },
  });

  // Log the status change
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Appointment',
      entityId: appointment.id,
      action: 'STATUS_UPDATE',
      before: {
        status: appointment.status,
      },
      after: {
        status,
      },
    },
  });

  return updatedAppointment;
};
