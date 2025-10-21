/**
 * Appointment Conflict Detection Helper
 * 
 * This module handles conflict detection for appointments to prevent:
 * - Professional double-booking
 * - Overlapping appointments for the same professional
 * - Assistant conflicts when assigned to multiple appointments
 * 
 * Uses time ranges to detect overlaps.
 */

export interface TimeSlot {
  startAt: Date;
  endAt: Date;
}

export interface AppointmentConflict {
  hasConflict: boolean;
  conflictType?: 'PROFESSIONAL' | 'ASSISTANT' | 'ROOM';
  conflictingAppointmentId?: string;
  message?: string;
}

/**
 * Checks if two time ranges overlap
 * Returns true if there's any overlap between the two periods
 */
export function doTimeSlotsOverlap(slot1: TimeSlot, slot2: TimeSlot): boolean {
  const start1 = new Date(slot1.startAt).getTime();
  const end1 = new Date(slot1.endAt).getTime();
  const start2 = new Date(slot2.startAt).getTime();
  const end2 = new Date(slot2.endAt).getTime();

  // No overlap if one ends before the other starts
  if (end1 <= start2 || end2 <= start1) {
    return false;
  }

  return true;
}

/**
 * Checks if a professional has conflicting appointments
 * 
 * @param prisma Prisma client
 * @param professionalId ID of the professional
 * @param salonId Salon context
 * @param startAt Start time of new appointment
 * @param endAt End time of new appointment
 * @param excludeAppointmentId Optional appointment ID to exclude (for updates)
 * @returns Conflict information
 */
export async function checkProfessionalConflict(
  prisma: any,
  professionalId: string,
  salonId: string,
  startAt: Date,
  endAt: Date,
  excludeAppointmentId?: string
): Promise<AppointmentConflict> {
  const conflictingAppointments = await prisma.appointment.findMany({
    where: {
      salonId,
      professionalId,
      status: {
        in: ['PENDING', 'CONFIRMED', 'IN_SERVICE'],
      },
      deletedAt: null,
      ...(excludeAppointmentId ? { id: { not: excludeAppointmentId } } : {}),
      OR: [
        // New appointment starts during existing appointment
        {
          AND: [
            { startAt: { lte: startAt } },
            { endAt: { gt: startAt } },
          ],
        },
        // New appointment ends during existing appointment
        {
          AND: [
            { startAt: { lt: endAt } },
            { endAt: { gte: endAt } },
          ],
        },
        // New appointment completely contains existing appointment
        {
          AND: [
            { startAt: { gte: startAt } },
            { endAt: { lte: endAt } },
          ],
        },
        // Existing appointment completely contains new appointment
        {
          AND: [
            { startAt: { lte: startAt } },
            { endAt: { gte: endAt } },
          ],
        },
      ],
    },
    select: {
      id: true,
      startAt: true,
      endAt: true,
      client: {
        select: { name: true },
      },
    },
  });

  if (conflictingAppointments.length > 0) {
    const conflict = conflictingAppointments[0];
    return {
      hasConflict: true,
      conflictType: 'PROFESSIONAL',
      conflictingAppointmentId: conflict.id,
      message: `Professional already has an appointment with ${conflict.client.name} from ${conflict.startAt.toLocaleTimeString()} to ${conflict.endAt.toLocaleTimeString()}`,
    };
  }

  return { hasConflict: false };
}

/**
 * Checks if an assistant has conflicting appointments
 * 
 * @param prisma Prisma client
 * @param assistantId ID of the assistant
 * @param salonId Salon context
 * @param startAt Start time of new appointment
 * @param endAt End time of new appointment
 * @param excludeAppointmentId Optional appointment ID to exclude (for updates)
 * @returns Conflict information
 */
export async function checkAssistantConflict(
  prisma: any,
  assistantId: string,
  salonId: string,
  startAt: Date,
  endAt: Date,
  excludeAppointmentId?: string
): Promise<AppointmentConflict> {
  // Get all appointments where this user is an assistant
  const assistantAppointments = await prisma.appointmentAssistant.findMany({
    where: {
      assistantUserId: assistantId,
      appointment: {
        salonId,
        status: {
          in: ['PENDING', 'CONFIRMED', 'IN_SERVICE'],
        },
        deletedAt: null,
        ...(excludeAppointmentId ? { id: { not: excludeAppointmentId } } : {}),
      },
    },
    include: {
      appointment: {
        select: {
          id: true,
          startAt: true,
          endAt: true,
          client: {
            select: { name: true },
          },
        },
      },
    },
  });

  // Check for overlaps
  for (const assistantAppt of assistantAppointments) {
    const appt = assistantAppt.appointment;
    if (doTimeSlotsOverlap({ startAt, endAt }, { startAt: appt.startAt, endAt: appt.endAt })) {
      return {
        hasConflict: true,
        conflictType: 'ASSISTANT',
        conflictingAppointmentId: appt.id,
        message: `Assistant already assigned to an appointment with ${appt.client.name} from ${appt.startAt.toLocaleTimeString()} to ${appt.endAt.toLocaleTimeString()}`,
      };
    }
  }

  return { hasConflict: false };
}

/**
 * Calculates available time slots for a professional on a specific date
 * 
 * @param prisma Prisma client
 * @param professionalId ID of the professional
 * @param salonId Salon context
 * @param date Date to check (YYYY-MM-DD)
 * @param slotDuration Duration of each slot in minutes
 * @param workStartHour Start of workday (0-23)
 * @param workEndHour End of workday (0-23)
 * @returns Array of available time slots
 */
export async function getAvailableSlots(
  prisma: any,
  professionalId: string,
  salonId: string,
  date: string,
  slotDuration: number = 30,
  workStartHour: number = 9,
  workEndHour: number = 18
): Promise<TimeSlot[]> {
  const targetDate = new Date(date);
  const dayStart = new Date(targetDate);
  dayStart.setHours(workStartHour, 0, 0, 0);
  const dayEnd = new Date(targetDate);
  dayEnd.setHours(workEndHour, 0, 0, 0);

  // Get all appointments for this professional on this date
  const appointments = await prisma.appointment.findMany({
    where: {
      salonId,
      professionalId,
      status: {
        in: ['PENDING', 'CONFIRMED', 'IN_SERVICE'],
      },
      deletedAt: null,
      startAt: {
        gte: dayStart,
        lt: dayEnd,
      },
    },
    select: {
      startAt: true,
      endAt: true,
    },
    orderBy: {
      startAt: 'asc',
    },
  });

  const availableSlots: TimeSlot[] = [];
  let currentTime = new Date(dayStart);

  for (const appointment of appointments) {
    // Add slots before this appointment
    while (currentTime < appointment.startAt) {
      const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000);
      
      if (slotEnd <= appointment.startAt && slotEnd <= dayEnd) {
        availableSlots.push({
          startAt: new Date(currentTime),
          endAt: new Date(slotEnd),
        });
      }
      
      currentTime = new Date(currentTime.getTime() + slotDuration * 60000);
    }

    // Move current time to end of this appointment
    currentTime = new Date(appointment.endAt);
  }

  // Add remaining slots after last appointment
  while (currentTime < dayEnd) {
    const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000);
    
    if (slotEnd <= dayEnd) {
      availableSlots.push({
        startAt: new Date(currentTime),
        endAt: new Date(slotEnd),
      });
    }
    
    currentTime = new Date(currentTime.getTime() + slotDuration * 60000);
  }

  return availableSlots;
}

/**
 * Validates appointment time is within business hours
 */
export function isWithinBusinessHours(
  startAt: Date,
  endAt: Date,
  businessStartHour: number = 9,
  businessEndHour: number = 18
): boolean {
  const startHour = startAt.getHours();
  const endHour = endAt.getHours();
  const endMinutes = endAt.getMinutes();

  if (startHour < businessStartHour) {
    return false;
  }

  // Allow appointments that end exactly at business end hour
  if (endHour > businessEndHour || (endHour === businessEndHour && endMinutes > 0)) {
    return false;
  }

  return true;
}

/**
 * Calculates end time based on services duration
 */
export function calculateAppointmentEndTime(
  startAt: Date,
  services: Array<{ duration: number }>
): Date {
  const totalDuration = services.reduce((sum, service) => sum + service.duration, 0);
  return new Date(startAt.getTime() + totalDuration * 60000);
}
