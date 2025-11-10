// Availability Calculation for Appointment Booking
import { 
  getDayOfWeek, 
  parseTimeString, 
  addMinutes, 
  generateTimeSlots,
  startOfDay,
  endOfDay
} from './dateUtils';
import { checkAdvancedConflicts } from './conflictDetector';
import type { TimeSlot, EmployeeAvailability, AvailabilityRequest } from '../types';

/**
 * Calculate available time slots for a specific employee and services
 */
export async function calculateAvailableSlots(
  request: AvailabilityRequest,
  context: any
): Promise<TimeSlot[]> {
  
  const { salonId, employeeId, serviceIds, date, excludeAppointmentId } = request;
  
  // Get total duration needed for all services
  const services = await context.entities.Service.findMany({
    where: { id: { in: serviceIds } },
    include: {
      employeeServices: {
        where: { employeeId },
        select: { customDuration: true }
      }
    }
  });
  
  const totalDuration = services.reduce((sum: number, service: any) => {
    // Use custom duration if set for this employee, otherwise use service default
    const duration = service.employeeServices[0]?.customDuration || service.duration;
    return sum + duration;
  }, 0);
  
  if (!employeeId) {
    throw new Error('Employee ID is required');
  }
  
  // Get employee's working hours for this day
  const dayOfWeek = getDayOfWeek(date);
  const schedules = await context.entities.EmployeeSchedule.findMany({
    where: {
      employeeId,
      dayOfWeek,
      isActive: true
    }
  });
  
  if (schedules.length === 0) {
    return []; // Employee doesn't work on this day
  }
  
  // Get booking configuration
  const bookingConfig = await context.entities.BookingConfig.findUnique({
    where: { salonId }
  });
  
  const slotInterval = bookingConfig?.slotInterval || 15;
  const availableSlots: TimeSlot[] = [];
  
  // Check each work period
  for (const schedule of schedules) {
    const scheduleStart = parseTimeString(schedule.startTime, date);
    const scheduleEnd = parseTimeString(schedule.endTime, date);
    
    // Generate potential time slots
    const potentialSlots = generateTimeSlots(
      scheduleStart,
      scheduleEnd,
      slotInterval
    );
    
    // Check each slot for availability
    for (const slotStart of potentialSlots) {
      const slotEnd = addMinutes(slotStart, totalDuration);
      
      // Skip if slot end exceeds schedule end
      if (slotEnd > scheduleEnd) {
        continue;
      }
      
      // Check for conflicts
      const conflict = await checkAdvancedConflicts(
        salonId,
        employeeId,
        slotStart,
        slotEnd,
        serviceIds[0], // Use first service for conflict check
        excludeAppointmentId,
        context
      );
      
      availableSlots.push({
        startTime: slotStart,
        endTime: slotEnd,
        available: !conflict.hasConflict,
        employeeId
      });
    }
  }
  
  return availableSlots;
}

/**
 * Get availability for multiple employees
 */
export async function getMultiEmployeeAvailability(
  salonId: string,
  serviceIds: string[],
  date: Date,
  context: any
): Promise<EmployeeAvailability[]> {
  
  // Get all employees who can perform these services
  const employeeServices = await context.entities.EmployeeService.findMany({
    where: {
      serviceId: { in: serviceIds }
    },
    include: {
      employee: {
        include: {
          user: {
            select: { name: true }
          }
        }
      }
    }
  });
  
  // Get unique employees
  const employeeMap = new Map<string, any>();
  employeeServices.forEach(es => {
    if (!employeeMap.has(es.employeeId)) {
      employeeMap.set(es.employeeId, es.employee);
    }
  });
  
  const employees = Array.from(employeeMap.values());
  const results: EmployeeAvailability[] = [];
  
  // Calculate availability for each employee
  for (const employee of employees) {
    const slots = await calculateAvailableSlots(
      {
        salonId,
        employeeId: employee.id,
        serviceIds,
        date
      },
      context
    );
    
    const availableSlots = slots.filter(slot => slot.available);
    const nextAvailable = availableSlots.length > 0 ? availableSlots[0].startTime : undefined;
    
    results.push({
      employeeId: employee.id,
      employeeName: employee.name || employee.user?.name || 'Profissional',
      employeeColor: employee.color,
      availableSlots,
      nextAvailable
    });
  }
  
  // Sort by next available time
  results.sort((a, b) => {
    if (!a.nextAvailable) return 1;
    if (!b.nextAvailable) return -1;
    return a.nextAvailable.getTime() - b.nextAvailable.getTime();
  });
  
  return results;
}

/**
 * Get availability for a date range
 */
export async function getAvailabilityRange(
  salonId: string,
  employeeId: string,
  serviceIds: string[],
  startDate: Date,
  endDate: Date,
  context: any
): Promise<Map<string, TimeSlot[]>> {
  
  const availabilityMap = new Map<string, TimeSlot[]>();
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dateKey = currentDate.toISOString().split('T')[0];
    
    const slots = await calculateAvailableSlots(
      {
        salonId,
        employeeId,
        serviceIds,
        date: new Date(currentDate)
      },
      context
    );
    
    availabilityMap.set(dateKey, slots.filter(slot => slot.available));
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return availabilityMap;
}

/**
 * Check if a specific time slot is available
 */
export async function isSlotAvailable(
  salonId: string,
  employeeId: string,
  serviceIds: string[],
  startTime: Date,
  context: any
): Promise<boolean> {
  
  // Get total duration
  const services = await context.entities.Service.findMany({
    where: { id: { in: serviceIds } },
    include: {
      employeeServices: {
        where: { employeeId },
        select: { customDuration: true }
      }
    }
  });
  
  const totalDuration = services.reduce((sum: number, service: any) => {
    const duration = service.employeeServices[0]?.customDuration || service.duration;
    return sum + duration;
  }, 0);
  
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
  
  return !conflict.hasConflict;
}

/**
 * Find the next available slot for an appointment
 */
export async function findNextAvailableSlot(
  salonId: string,
  employeeId: string,
  serviceIds: string[],
  fromDate: Date,
  context: any
): Promise<Date | null> {
  
  // Search for next 30 days
  const searchDays = 30;
  const currentDate = new Date(fromDate);
  
  for (let i = 0; i < searchDays; i++) {
    const slots = await calculateAvailableSlots(
      {
        salonId,
        employeeId,
        serviceIds,
        date: new Date(currentDate)
      },
      context
    );
    
    const availableSlot = slots.find(slot => slot.available);
    if (availableSlot) {
      return availableSlot.startTime;
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return null; // No availability found in next 30 days
}

/**
 * Get busy/occupied time periods for visualization
 */
export async function getOccupiedTimeBlocks(
  salonId: string,
  employeeId: string,
  date: Date,
  context: any
): Promise<Array<{ start: Date; end: Date; type: string; details?: any }>> {
  
  const blocks: Array<{ start: Date; end: Date; type: string; details?: any }> = [];
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);
  
  // Get appointments
  const appointments = await context.entities.Appointment.findMany({
    where: {
      employeeId,
      status: { in: ['PENDING', 'CONFIRMED', 'IN_SERVICE'] },
      startAt: { gte: dayStart, lte: dayEnd }
    },
    include: {
      client: { select: { name: true } },
      services: {
        include: { service: { select: { name: true } } }
      }
    }
  });
  
  appointments.forEach(apt => {
    blocks.push({
      start: apt.startAt,
      end: apt.endAt,
      type: 'APPOINTMENT',
      details: apt
    });
  });
  
  // Get time blocks
  const timeBlocks = await context.entities.TimeBlock.findMany({
    where: {
      employeeId,
      deletedAt: null,
      startTime: { gte: dayStart, lte: dayEnd }
    }
  });
  
  timeBlocks.forEach(block => {
    blocks.push({
      start: block.startTime,
      end: block.endTime,
      type: 'TIME_BLOCK',
      details: block
    });
  });
  
  // Sort by start time
  blocks.sort((a, b) => a.start.getTime() - b.start.getTime());
  
  return blocks;
}
