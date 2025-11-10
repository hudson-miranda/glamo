// Date and Time Utility Functions for Scheduling

/**
 * Check if two time ranges overlap
 */
export function doTimeSlotsOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 < end2 && end1 > start2;
}

/**
 * Add minutes to a date
 */
export function addMinutes(date: Date, minutes: number): Date {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
}

/**
 * Add hours to a date
 */
export function addHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Subtract minutes from a date
 */
export function subMinutes(date: Date, minutes: number): Date {
  return addMinutes(date, -minutes);
}

/**
 * Subtract hours from a date
 */
export function subHours(date: Date, hours: number): Date {
  return addHours(date, -hours);
}

/**
 * Calculate difference in minutes between two dates
 */
export function differenceInMinutes(date1: Date, date2: Date): number {
  return Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60));
}

/**
 * Calculate difference in hours between two dates
 */
export function differenceInHours(date1: Date, date2: Date): number {
  return Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60 * 60));
}

/**
 * Get start of day
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of day
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Format time to HH:mm
 */
export function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Parse HH:mm time string to Date (using today's date)
 */
export function parseTimeString(timeStr: string, baseDate?: Date): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const result = baseDate ? new Date(baseDate) : new Date();
  result.setHours(hours, minutes, 0, 0);
  return result;
}

/**
 * Get day of week (0 = Sunday, 6 = Saturday)
 */
export function getDayOfWeek(date: Date): number {
  return date.getDay();
}

/**
 * Generate time slots between start and end time with given interval
 */
export function generateTimeSlots(
  startTime: Date,
  endTime: Date,
  intervalMinutes: number
): Date[] {
  const slots: Date[] = [];
  let current = new Date(startTime);
  
  while (current < endTime) {
    slots.push(new Date(current));
    current = addMinutes(current, intervalMinutes);
  }
  
  return slots;
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Date): boolean {
  return date < new Date();
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: Date): boolean {
  return date > new Date();
}

/**
 * Get date range for a week (Monday to Sunday)
 */
export function getWeekRange(date: Date): { start: Date; end: Date } {
  const dayOfWeek = date.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust for Monday start
  
  const start = new Date(date);
  start.setDate(date.getDate() - diff);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

/**
 * Get date range for a month
 */
export function getMonthRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

/**
 * Generate a unique confirmation code
 */
export function generateConfirmationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Calculate duration in minutes between two times
 */
export function calculateDuration(startTime: Date, endTime: Date): number {
  return Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
}

/**
 * Check if time is within a time range
 */
export function isTimeInRange(
  time: Date,
  rangeStart: Date,
  rangeEnd: Date
): boolean {
  return time >= rangeStart && time <= rangeEnd;
}

/**
 * Round time to nearest interval
 */
export function roundToInterval(date: Date, intervalMinutes: number): Date {
  const ms = 1000 * 60 * intervalMinutes;
  return new Date(Math.round(date.getTime() / ms) * ms);
}
