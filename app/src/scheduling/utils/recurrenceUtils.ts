// Recurrence Utilities for Recurring Appointments
import { addDays, addMinutes, getDayOfWeek, isSameDay } from './dateUtils';
import type { RecurrenceRule } from '../types';

/**
 * Generate RRULE string from recurrence config
 */
export function generateRRule(rule: RecurrenceRule): string {
  const parts: string[] = [`FREQ=${rule.frequency}`];
  
  if (rule.interval > 1) {
    parts.push(`INTERVAL=${rule.interval}`);
  }
  
  if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
    const days = rule.daysOfWeek.map(day => {
      const dayNames = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
      return dayNames[day];
    }).join(',');
    parts.push(`BYDAY=${days}`);
  }
  
  if (rule.endDate) {
    const dateStr = rule.endDate.toISOString().split('T')[0].replace(/-/g, '');
    parts.push(`UNTIL=${dateStr}`);
  } else if (rule.occurrences) {
    parts.push(`COUNT=${rule.occurrences}`);
  }
  
  return parts.join(';');
}

/**
 * Parse RRULE string to recurrence config
 */
export function parseRRule(rrule: string): RecurrenceRule {
  const parts = rrule.split(';');
  const rule: any = {
    frequency: 'WEEKLY',
    interval: 1
  };
  
  parts.forEach(part => {
    const [key, value] = part.split('=');
    
    switch (key) {
      case 'FREQ':
        rule.frequency = value as 'DAILY' | 'WEEKLY' | 'MONTHLY';
        break;
      case 'INTERVAL':
        rule.interval = parseInt(value);
        break;
      case 'BYDAY':
        const dayNames = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
        rule.daysOfWeek = value.split(',').map(d => dayNames.indexOf(d));
        break;
      case 'UNTIL':
        // Parse YYYYMMDD format
        const year = parseInt(value.substring(0, 4));
        const month = parseInt(value.substring(4, 6)) - 1;
        const day = parseInt(value.substring(6, 8));
        rule.endDate = new Date(year, month, day);
        break;
      case 'COUNT':
        rule.occurrences = parseInt(value);
        break;
    }
  });
  
  return rule;
}

/**
 * Generate all occurrence dates for a recurring appointment
 */
export function generateOccurrences(
  startDate: Date,
  rule: RecurrenceRule,
  maxOccurrences: number = 52 // Default to 1 year of weekly appointments
): Date[] {
  const occurrences: Date[] = [startDate];
  let currentDate = new Date(startDate);
  let count = 1;
  
  const limit = rule.occurrences || maxOccurrences;
  const endDate = rule.endDate || addDays(startDate, 365); // Default 1 year
  
  while (count < limit && currentDate < endDate) {
    let nextDate: Date;
    
    switch (rule.frequency) {
      case 'DAILY':
        nextDate = addDays(currentDate, rule.interval);
        break;
        
      case 'WEEKLY':
        if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
          // Find next occurrence based on selected days
          nextDate = findNextWeeklyOccurrence(currentDate, rule.daysOfWeek, rule.interval);
        } else {
          // Default to same day of week
          nextDate = addDays(currentDate, 7 * rule.interval);
        }
        break;
        
      case 'MONTHLY':
        nextDate = new Date(currentDate);
        nextDate.setMonth(currentDate.getMonth() + rule.interval);
        break;
        
      default:
        nextDate = addDays(currentDate, 7);
    }
    
    if (nextDate <= endDate) {
      occurrences.push(nextDate);
      count++;
    }
    
    currentDate = nextDate;
  }
  
  return occurrences;
}

/**
 * Find next weekly occurrence based on selected days of week
 */
function findNextWeeklyOccurrence(
  fromDate: Date,
  daysOfWeek: number[],
  interval: number
): Date {
  let nextDate = addDays(fromDate, 1);
  const startWeek = Math.floor(fromDate.getTime() / (7 * 24 * 60 * 60 * 1000));
  
  // Search for next valid day
  for (let i = 0; i < 14; i++) { // Search up to 2 weeks
    const nextWeek = Math.floor(nextDate.getTime() / (7 * 24 * 60 * 60 * 1000));
    const weekDiff = nextWeek - startWeek;
    
    if (weekDiff % interval === 0) {
      const dayOfWeek = getDayOfWeek(nextDate);
      if (daysOfWeek.includes(dayOfWeek)) {
        return nextDate;
      }
    }
    
    nextDate = addDays(nextDate, 1);
  }
  
  return nextDate;
}

/**
 * Check if a date matches a recurrence rule
 */
export function matchesRecurrence(
  date: Date,
  startDate: Date,
  rule: RecurrenceRule
): boolean {
  
  // Date must be on or after start date
  if (date < startDate) {
    return false;
  }
  
  // Check end date
  if (rule.endDate && date > rule.endDate) {
    return false;
  }
  
  const daysDiff = Math.floor((date.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  
  switch (rule.frequency) {
    case 'DAILY':
      return daysDiff % rule.interval === 0;
      
    case 'WEEKLY':
      const weeksDiff = Math.floor(daysDiff / 7);
      if (weeksDiff % rule.interval !== 0) {
        return false;
      }
      
      if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
        const dayOfWeek = getDayOfWeek(date);
        return rule.daysOfWeek.includes(dayOfWeek);
      }
      
      return getDayOfWeek(date) === getDayOfWeek(startDate);
      
    case 'MONTHLY':
      const monthsDiff = (date.getFullYear() - startDate.getFullYear()) * 12 + 
                        (date.getMonth() - startDate.getMonth());
      return monthsDiff % rule.interval === 0 && 
             date.getDate() === startDate.getDate();
      
    default:
      return false;
  }
}

/**
 * Get next occurrence date after a given date
 */
export function getNextOccurrence(
  fromDate: Date,
  startDate: Date,
  rule: RecurrenceRule
): Date | null {
  
  const occurrences = generateOccurrences(startDate, rule);
  
  for (const occurrence of occurrences) {
    if (occurrence > fromDate) {
      return occurrence;
    }
  }
  
  return null;
}

/**
 * Get recurrence summary text
 */
export function getRecurrenceSummary(rule: RecurrenceRule): string {
  const parts: string[] = [];
  
  switch (rule.frequency) {
    case 'DAILY':
      if (rule.interval === 1) {
        parts.push('Todos os dias');
      } else {
        parts.push(`A cada ${rule.interval} dias`);
      }
      break;
      
    case 'WEEKLY':
      if (rule.interval === 1) {
        parts.push('Toda semana');
      } else {
        parts.push(`A cada ${rule.interval} semanas`);
      }
      
      if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
        const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const days = rule.daysOfWeek.map(d => dayNames[d]).join(', ');
        parts.push(`às ${days}`);
      }
      break;
      
    case 'MONTHLY':
      if (rule.interval === 1) {
        parts.push('Todo mês');
      } else {
        parts.push(`A cada ${rule.interval} meses`);
      }
      break;
  }
  
  if (rule.endDate) {
    const dateStr = rule.endDate.toLocaleDateString('pt-BR');
    parts.push(`até ${dateStr}`);
  } else if (rule.occurrences) {
    parts.push(`(${rule.occurrences} vezes)`);
  }
  
  return parts.join(' ');
}

/**
 * Validate recurrence rule
 */
export function validateRecurrenceRule(rule: RecurrenceRule): { valid: boolean; error?: string } {
  
  if (!['DAILY', 'WEEKLY', 'MONTHLY'].includes(rule.frequency)) {
    return { valid: false, error: 'Frequência inválida' };
  }
  
  if (rule.interval < 1) {
    return { valid: false, error: 'Intervalo deve ser pelo menos 1' };
  }
  
  if (rule.daysOfWeek) {
    if (rule.daysOfWeek.some(d => d < 0 || d > 6)) {
      return { valid: false, error: 'Dias da semana inválidos' };
    }
  }
  
  if (rule.endDate && rule.occurrences) {
    return { valid: false, error: 'Não é possível definir data final e número de ocorrências ao mesmo tempo' };
  }
  
  if (rule.occurrences && rule.occurrences < 1) {
    return { valid: false, error: 'Número de ocorrências deve ser pelo menos 1' };
  }
  
  return { valid: true };
}
