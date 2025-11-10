// Advanced Scheduling Module - Type Definitions

export type BookingSource = 'STAFF' | 'CLIENT_ONLINE' | 'CLIENT_PHONE' | 'WALK_IN' | 'INSTAGRAM' | 'FACEBOOK' | 'GOOGLE';

export type CancelledBy = 'CLIENT' | 'STAFF' | 'SYSTEM';

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  available: boolean;
  employeeId: string;
  employeeName?: string;
}

export interface ConflictResult {
  hasConflict: boolean;
  conflictType?: 'APPOINTMENT' | 'TIME_BLOCK' | 'OUTSIDE_HOURS' | 'SERVICE_UNAVAILABLE' | 'BUFFER_TIME';
  message?: string;
  conflicts?: any[];
  suggestions?: TimeSlot[];
}

export interface AvailabilityRequest {
  salonId: string;
  employeeId?: string;
  serviceIds: string[];
  date: Date;
  excludeAppointmentId?: string;
}

export interface AvailabilityResponse {
  date: Date;
  availableSlots: TimeSlot[];
  employees: EmployeeAvailability[];
  totalDuration: number;
  estimatedPrice: number;
}

export interface EmployeeAvailability {
  employeeId: string;
  employeeName: string;
  employeeColor?: string;
  availableSlots: TimeSlot[];
  nextAvailable?: Date;
}

export interface CreateAppointmentInput {
  salonId: string;
  clientId: string;
  employeeId: string;
  serviceIds: string[];
  startTime: Date;
  notes?: string;
  bookedOnline?: boolean;
  bookingSource?: BookingSource;
}

export interface UpdateAppointmentInput {
  appointmentId: string;
  startTime?: Date;
  endTime?: Date;
  serviceIds?: string[];
  notes?: string;
  status?: string;
}

export interface RecurrenceRule {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  interval: number; // Every X days/weeks/months
  daysOfWeek?: number[]; // For weekly: 0=Sunday, 1=Monday, etc.
  endDate?: Date;
  occurrences?: number; // Alternative to endDate
}

export interface CreateRecurringAppointmentInput extends CreateAppointmentInput {
  recurrenceRule: RecurrenceRule;
}

export interface TimeBlockInput {
  salonId: string;
  employeeId?: string;
  startTime: Date;
  endTime: Date;
  reason?: string;
  type: string;
  isRecurring?: boolean;
  recurrenceRule?: string;
}

export interface WaitingListInput {
  salonId: string;
  clientId: string;
  employeeId?: string;
  serviceIds: string[];
  preferredDate?: Date;
  preferredStartTime?: string;
  preferredEndTime?: string;
  flexibleTiming?: boolean;
  notes?: string;
}

export interface BookingPolicyConfig {
  minAdvanceHours: number;
  maxAdvanceDays: number;
  freeCancellationHours: number;
  lateCancellationHours: number;
  lateCancellationFee: number;
  allowRescheduling: boolean;
  maxRescheduleCount: number;
  minRescheduleHours: number;
  noShowFeePercent: number;
  autoMarkNoShowMinutes: number;
  allowSameDayBooking: boolean;
  slotInterval: number;
  bufferTimeMinutes: number;
}

export interface ReminderConfig {
  enabled: boolean;
  reminder24h: boolean;
  reminder2h: boolean;
  channels: string[];
}
