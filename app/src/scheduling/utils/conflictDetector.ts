// Enhanced Conflict Detection for Advanced Scheduling
import { doTimeSlotsOverlap, getDayOfWeek, parseTimeString, addMinutes, subMinutes } from './dateUtils';
import type { ConflictResult } from '../types';

/**
 * Check for all types of scheduling conflicts
 */
export async function checkAdvancedConflicts(
  salonId: string,
  employeeId: string,
  startTime: Date,
  endTime: Date,
  serviceId: string,
  excludeAppointmentId: string | undefined,
  context: any
): Promise<ConflictResult> {
  
  // 1. Check existing appointments
  const appointmentConflict = await checkAppointmentConflicts(
    employeeId,
    startTime,
    endTime,
    excludeAppointmentId,
    context
  );
  
  if (appointmentConflict.hasConflict) {
    return appointmentConflict;
  }
  
  // 2. Check time blocks (vacation, breaks, etc.)
  const timeBlockConflict = await checkTimeBlockConflicts(
    employeeId,
    startTime,
    endTime,
    context
  );
  
  if (timeBlockConflict.hasConflict) {
    return timeBlockConflict;
  }
  
  // 3. Check employee working hours
  const workingHoursConflict = await checkWorkingHours(
    employeeId,
    startTime,
    endTime,
    context
  );
  
  if (workingHoursConflict.hasConflict) {
    return workingHoursConflict;
  }
  
  // 4. Check if employee can perform the service
  const serviceConflict = await checkServiceAssignment(
    employeeId,
    serviceId,
    context
  );
  
  if (serviceConflict.hasConflict) {
    return serviceConflict;
  }
  
  // 5. Check buffer time requirements
  const bufferConflict = await checkBufferTime(
    salonId,
    employeeId,
    startTime,
    endTime,
    excludeAppointmentId,
    context
  );
  
  if (bufferConflict.hasConflict) {
    return bufferConflict;
  }
  
  // No conflicts found
  return { hasConflict: false };
}

/**
 * Check for appointment conflicts
 */
async function checkAppointmentConflicts(
  employeeId: string,
  startTime: Date,
  endTime: Date,
  excludeAppointmentId: string | undefined,
  context: any
): Promise<ConflictResult> {
  
  const conflictingAppointments = await context.entities.Appointment.findMany({
    where: {
      OR: [
        { employeeId },
        { assistants: { some: { assistantUserId: employeeId } } }
      ],
      status: { in: ['PENDING', 'CONFIRMED', 'IN_SERVICE'] },
      NOT: excludeAppointmentId ? { id: excludeAppointmentId } : undefined,
      AND: [
        { startAt: { lt: endTime } },
        { endAt: { gt: startTime } }
      ]
    },
    include: {
      client: { select: { name: true } },
      services: {
        include: { service: { select: { name: true } } }
      }
    }
  });
  
  if (conflictingAppointments.length > 0) {
    return {
      hasConflict: true,
      conflictType: 'APPOINTMENT',
      message: `O profissional já tem ${conflictingAppointments.length} agendamento(s) neste horário`,
      conflicts: conflictingAppointments
    };
  }
  
  return { hasConflict: false };
}

/**
 * Check for time block conflicts
 */
async function checkTimeBlockConflicts(
  employeeId: string,
  startTime: Date,
  endTime: Date,
  context: any
): Promise<ConflictResult> {
  
  const conflictingBlocks = await context.entities.TimeBlock.findMany({
    where: {
      employeeId,
      deletedAt: null,
      AND: [
        { startTime: { lt: endTime } },
        { endTime: { gt: startTime } }
      ]
    }
  });
  
  if (conflictingBlocks.length > 0) {
    const block = conflictingBlocks[0];
    return {
      hasConflict: true,
      conflictType: 'TIME_BLOCK',
      message: `O profissional está indisponível: ${block.reason || block.type}`,
      conflicts: conflictingBlocks
    };
  }
  
  return { hasConflict: false };
}

/**
 * Check if time is within employee working hours
 */
async function checkWorkingHours(
  employeeId: string,
  startTime: Date,
  endTime: Date,
  context: any
): Promise<ConflictResult> {
  
  const dayOfWeek = getDayOfWeek(startTime);
  
  const schedules = await context.entities.EmployeeSchedule.findMany({
    where: {
      employeeId,
      dayOfWeek,
      isActive: true
    }
  });
  
  if (schedules.length === 0) {
    return {
      hasConflict: true,
      conflictType: 'OUTSIDE_HOURS',
      message: 'O profissional não trabalha neste dia da semana'
    };
  }
  
  // Check if appointment time falls within any of the employee's work periods
  let isWithinWorkingHours = false;
  
  for (const schedule of schedules) {
    const scheduleStart = parseTimeString(schedule.startTime, startTime);
    const scheduleEnd = parseTimeString(schedule.endTime, startTime);
    
    if (startTime >= scheduleStart && endTime <= scheduleEnd) {
      isWithinWorkingHours = true;
      break;
    }
  }
  
  if (!isWithinWorkingHours) {
    return {
      hasConflict: true,
      conflictType: 'OUTSIDE_HOURS',
      message: 'O horário solicitado está fora do expediente do profissional'
    };
  }
  
  return { hasConflict: false };
}

/**
 * Check if employee can perform the service
 */
async function checkServiceAssignment(
  employeeId: string,
  serviceId: string,
  context: any
): Promise<ConflictResult> {
  
  const assignment = await context.entities.EmployeeService.findFirst({
    where: {
      employeeId,
      serviceId
    }
  });
  
  if (!assignment) {
    return {
      hasConflict: true,
      conflictType: 'SERVICE_UNAVAILABLE',
      message: 'Este profissional não realiza o serviço selecionado'
    };
  }
  
  return { hasConflict: false };
}

/**
 * Check buffer time between appointments
 */
async function checkBufferTime(
  salonId: string,
  employeeId: string,
  startTime: Date,
  endTime: Date,
  excludeAppointmentId: string | undefined,
  context: any
): Promise<ConflictResult> {
  
  // Get salon's booking configuration
  const bookingConfig = await context.entities.BookingConfig.findUnique({
    where: { salonId }
  });
  
  if (!bookingConfig || bookingConfig.bufferTimeMinutes === 0) {
    return { hasConflict: false };
  }
  
  const bufferMinutes = bookingConfig.bufferTimeMinutes;
  const bufferedStart = subMinutes(startTime, bufferMinutes);
  const bufferedEnd = addMinutes(endTime, bufferMinutes);
  
  // Check for appointments within buffer zone
  const adjacentAppointments = await context.entities.Appointment.findMany({
    where: {
      employeeId,
      status: { in: ['PENDING', 'CONFIRMED', 'IN_SERVICE'] },
      NOT: excludeAppointmentId ? { id: excludeAppointmentId } : undefined,
      OR: [
        {
          // Ends within buffer before new appointment
          endAt: { gt: bufferedStart, lte: startTime }
        },
        {
          // Starts within buffer after new appointment
          startAt: { gte: endTime, lt: bufferedEnd }
        }
      ]
    }
  });
  
  if (adjacentAppointments.length > 0) {
    return {
      hasConflict: true,
      conflictType: 'BUFFER_TIME',
      message: `É necessário um intervalo de ${bufferMinutes} minutos entre agendamentos`,
      conflicts: adjacentAppointments
    };
  }
  
  return { hasConflict: false };
}

/**
 * Find alternative available time slots when there's a conflict
 */
export async function findAlternativeSlots(
  salonId: string,
  employeeId: string,
  serviceId: string,
  preferredDate: Date,
  durationMinutes: number,
  context: any
): Promise<Date[]> {
  
  const alternatives: Date[] = [];
  const dayOfWeek = getDayOfWeek(preferredDate);
  
  // Get employee schedules for the day
  const schedules = await context.entities.EmployeeSchedule.findMany({
    where: {
      employeeId,
      dayOfWeek,
      isActive: true
    }
  });
  
  if (schedules.length === 0) {
    return alternatives;
  }
  
  // Get booking configuration
  const bookingConfig = await context.entities.BookingConfig.findUnique({
    where: { salonId }
  });
  
  const slotInterval = bookingConfig?.slotInterval || 15;
  
  // Check each schedule period
  for (const schedule of schedules) {
    const scheduleStart = parseTimeString(schedule.startTime, preferredDate);
    const scheduleEnd = parseTimeString(schedule.endTime, preferredDate);
    
    let currentSlot = scheduleStart;
    
    while (addMinutes(currentSlot, durationMinutes) <= scheduleEnd) {
      const slotEnd = addMinutes(currentSlot, durationMinutes);
      
      // Check if this slot is available
      const conflict = await checkAdvancedConflicts(
        salonId,
        employeeId,
        currentSlot,
        slotEnd,
        serviceId,
        undefined,
        context
      );
      
      if (!conflict.hasConflict) {
        alternatives.push(new Date(currentSlot));
      }
      
      currentSlot = addMinutes(currentSlot, slotInterval);
      
      // Limit to 10 alternatives
      if (alternatives.length >= 10) {
        return alternatives;
      }
    }
  }
  
  return alternatives;
}
