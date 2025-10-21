# Appointments Module

## Overview
The Appointments module manages salon appointments in the Glamo system. It provides comprehensive CRUD operations with conflict detection, status lifecycle management, and support for multiple services, assistants, and recurring appointments.

## Features
- List appointments with filtering and pagination
- View detailed appointment information with full relationships
- Create appointments with automatic conflict detection
- Update appointments with validation
- Cancel appointments (soft delete)
- Status lifecycle management (PENDING → CONFIRMED → IN_SERVICE → DONE)
- Available time slots calculation
- Multi-service support per appointment
- Assistant assignment
- Comprehensive audit logging
- Business hours validation

## Operations

### Queries

#### `listAppointments`
Lists appointments with filtering options and pagination.

**Permission Required:** `can_view_appointments` (own appointments) or `can_view_all_appointments` (all appointments)

**Input:**
```typescript
{
  salonId: string;
  professionalId?: string;
  clientId?: string;
  status?: 'PENDING' | 'CONFIRMED' | 'IN_SERVICE' | 'DONE' | 'CANCELLED';
  startDate?: string;        // ISO date string
  endDate?: string;          // ISO date string
  page?: number;             // Default: 1
  perPage?: number;          // Default: 20
}
```

**Output:**
```typescript
{
  appointments: Appointment[];  // Includes client, professional, services, assistants
  total: number;
  page: number;
  perPage: number;
}
```

**Behavior:**
- Users with `can_view_appointments` see only their own appointments
- Users with `can_view_all_appointments` can see all salon appointments
- Filters can be combined for precise queries

#### `getAppointment`
Gets detailed information about a specific appointment.

**Permission Required:** `can_view_appointments`

**Input:**
```typescript
{
  appointmentId: string;
  salonId: string;
}
```

**Output:**
```typescript
Appointment & {
  client: Client;
  professional: User;
  services: AppointmentService[];
  assistants: AppointmentAssistant[];
  voucher: Voucher | null;
  repetition: AppointmentRepetition | null;
  statusLogs: AppointmentStatusLog[];
}
```

#### `getAvailableSlots`
Calculates available time slots for a professional on a specific date.

**Permission Required:** `can_view_appointments`

**Input:**
```typescript
{
  salonId: string;
  professionalId: string;
  date: string;              // YYYY-MM-DD
  slotDuration?: number;     // In minutes, default: 30
}
```

**Output:**
```typescript
{
  date: string;
  professionalId: string;
  slots: Array<{
    startAt: Date;
    endAt: Date;
  }>;
  slotDuration: number;
}
```

**Behavior:**
- Considers existing appointments
- Business hours: 9 AM - 6 PM (configurable)
- Excludes time slots occupied by active appointments

### Actions

#### `createAppointment`
Creates a new appointment with automatic conflict detection.

**Permission Required:** `can_create_appointments`

**Input:**
```typescript
{
  salonId: string;
  clientId: string;
  professionalId: string;
  startAt: string;           // ISO date string
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
}
```

**Validations:**
- Client must exist and belong to salon
- Professional must be active in salon
- At least one service required
- All services must exist and belong to salon
- Appointment must be within business hours (9 AM - 6 PM)
- No professional conflicts (double-booking)
- No assistant conflicts

**Automatic Calculations:**
- End time calculated from services duration
- Initial status set to PENDING
- Status log created automatically

**Output:**
```typescript
Appointment (with client, professional, services, assistants)
```

#### `updateAppointment`
Updates an existing appointment with validation.

**Permission Required:** `can_edit_appointments`

**Input:**
```typescript
{
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
}
```

**Business Rules:**
- Cannot update DONE or CANCELLED appointments
- Cannot update deleted appointments
- Re-checks conflicts when time/professional/assistants change
- Recalculates end time when services or start time changes

**Output:**
```typescript
Appointment (updated)
```

#### `deleteAppointment`
Cancels an appointment (soft delete).

**Permission Required:** `can_delete_appointments`

**Input:**
```typescript
{
  appointmentId: string;
  salonId: string;
}
```

**Behavior:**
- Sets `deletedAt` timestamp
- Changes status to CANCELLED
- Creates status log entry
- Maintains historical data

**Output:**
```typescript
{
  success: boolean;
  message: string;
}
```

#### `updateAppointmentStatus`
Updates appointment status with validation.

**Permission Required:** `can_edit_appointments`

**Input:**
```typescript
{
  appointmentId: string;
  salonId: string;
  status: 'PENDING' | 'CONFIRMED' | 'IN_SERVICE' | 'DONE' | 'CANCELLED';
  notes?: string;
}
```

**Status Lifecycle:**
```
PENDING → CONFIRMED → IN_SERVICE → DONE
   ↓         ↓            ↓
CANCELLED  CANCELLED   CANCELLED
```

**Valid Transitions:**
- PENDING → CONFIRMED, CANCELLED
- CONFIRMED → IN_SERVICE, CANCELLED
- IN_SERVICE → DONE, CANCELLED
- DONE → (no transitions allowed)
- CANCELLED → (no transitions allowed)

**Output:**
```typescript
Appointment (updated)
```

## Conflict Detection

The module includes a sophisticated conflict detection system in `conflictDetector.ts`.

### Functions

#### `checkProfessionalConflict`
Checks if a professional has overlapping appointments.

```typescript
async function checkProfessionalConflict(
  prisma: any,
  professionalId: string,
  salonId: string,
  startAt: Date,
  endAt: Date,
  excludeAppointmentId?: string
): Promise<AppointmentConflict>
```

**Returns:**
```typescript
{
  hasConflict: boolean;
  conflictType?: 'PROFESSIONAL';
  conflictingAppointmentId?: string;
  message?: string;
}
```

#### `checkAssistantConflict`
Checks if an assistant has overlapping appointments.

```typescript
async function checkAssistantConflict(
  prisma: any,
  assistantId: string,
  salonId: string,
  startAt: Date,
  endAt: Date,
  excludeAppointmentId?: string
): Promise<AppointmentConflict>
```

#### `getAvailableSlots`
Calculates available time slots for a professional.

```typescript
async function getAvailableSlots(
  prisma: any,
  professionalId: string,
  salonId: string,
  date: string,
  slotDuration?: number,
  workStartHour?: number,
  workEndHour?: number
): Promise<TimeSlot[]>
```

#### `doTimeSlotsOverlap`
Utility to check if two time ranges overlap.

```typescript
function doTimeSlotsOverlap(
  slot1: TimeSlot,
  slot2: TimeSlot
): boolean
```

#### `isWithinBusinessHours`
Validates appointment is within business hours.

```typescript
function isWithinBusinessHours(
  startAt: Date,
  endAt: Date,
  businessStartHour?: number,
  businessEndHour?: number
): boolean
```

#### `calculateAppointmentEndTime`
Calculates end time based on services.

```typescript
function calculateAppointmentEndTime(
  startAt: Date,
  services: Array<{ duration: number }>
): Date
```

## Database Schema

### Appointment Model
```typescript
{
  id: string;
  salonId: string;
  clientId: string;
  professionalId: string;
  voucherId?: string;
  startAt: DateTime;
  endAt: DateTime;
  status: 'PENDING' | 'CONFIRMED' | 'IN_SERVICE' | 'DONE' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' | 'REFUNDED';
  notes?: string;
  deletedAt?: DateTime;
}
```

### AppointmentService Model
```typescript
{
  id: string;
  appointmentId: string;
  serviceId: string;
  variantId?: string;
  customPrice?: number;
  customDuration?: number;
  discount: number;
}
```

### AppointmentAssistant Model
```typescript
{
  id: string;
  appointmentId: string;
  assistantUserId: string;
}
```

### AppointmentStatusLog Model
```typescript
{
  id: string;
  appointmentId: string;
  updatedByUserId: string;
  fromStatus?: AppointmentStatus;
  toStatus: AppointmentStatus;
  changedAt: DateTime;
}
```

### AppointmentRepetition Model
```typescript
{
  id: string;
  appointmentId: string;
  rule: string;              // RRULE format
  repeatUntil?: DateTime;
}
```

## Usage Examples

### Create an Appointment
```typescript
import { createAppointment } from 'wasp/client/operations';

const appointment = await createAppointment({
  salonId: 'salon-123',
  clientId: 'client-456',
  professionalId: 'user-789',
  startAt: '2025-10-25T10:00:00Z',
  services: [
    {
      serviceId: 'service-abc',
      variantId: 'variant-def',
      discount: 10,
    },
  ],
  assistantIds: ['user-012'],
  notes: 'Client prefers quiet environment',
});
```

### Update Appointment Status
```typescript
import { updateAppointmentStatus } from 'wasp/client/operations';

const updated = await updateAppointmentStatus({
  appointmentId: appointment.id,
  salonId: 'salon-123',
  status: 'CONFIRMED',
  notes: 'Client confirmed via phone',
});
```

### Get Available Slots
```typescript
import { getAvailableSlots } from 'wasp/client/operations';

const slots = await getAvailableSlots({
  salonId: 'salon-123',
  professionalId: 'user-789',
  date: '2025-10-25',
  slotDuration: 30,
});

// slots.slots = [
//   { startAt: '2025-10-25T09:00:00Z', endAt: '2025-10-25T09:30:00Z' },
//   { startAt: '2025-10-25T09:30:00Z', endAt: '2025-10-25T10:00:00Z' },
//   ...
// ]
```

### List Appointments for a Day
```typescript
import { listAppointments } from 'wasp/client/operations';

const { appointments, total } = await listAppointments({
  salonId: 'salon-123',
  professionalId: 'user-789',
  startDate: '2025-10-25T00:00:00Z',
  endDate: '2025-10-25T23:59:59Z',
  status: 'CONFIRMED',
});
```

## Test Scenarios

### Appointment CRUD Tests
1. **Create appointment** - Valid inputs create appointment successfully
2. **Create with multiple services** - Total duration calculated correctly
3. **Create with assistants** - Assistants assigned successfully
4. **Invalid client** - Reject appointment with non-existent client
5. **Invalid professional** - Reject appointment with professional not in salon
6. **No services** - Reject appointment without services
7. **Update appointment** - Fields update correctly
8. **Update time** - End time recalculated, conflicts re-checked
9. **Update done appointment** - Reject update of completed appointment
10. **Delete appointment** - Soft delete sets deletedAt and status to CANCELLED

### Conflict Detection Tests
11. **Professional conflict** - Reject overlapping appointments for same professional
12. **Assistant conflict** - Reject when assistant has overlapping appointment
13. **No conflict** - Allow appointments with no overlap
14. **Back-to-back appointments** - Allow appointments that end when next starts
15. **Update without conflict** - Allow update when no new conflicts
16. **Exclude current appointment** - Don't detect conflict with self when updating

### Status Transition Tests
17. **Valid transition** - PENDING → CONFIRMED succeeds
18. **Invalid transition** - DONE → PENDING fails
19. **Cannot change DONE** - Reject any status change from DONE
20. **Cannot change CANCELLED** - Reject any status change from CANCELLED
21. **Status log created** - Verify status log entry created on each transition

### Available Slots Tests
22. **Empty day** - Return full day of slots when no appointments
23. **With appointments** - Return only available slots between appointments
24. **Fully booked** - Return empty array when no available slots
25. **Custom slot duration** - Calculate slots with correct duration

### Business Hours Tests
26. **Before hours** - Reject appointment starting before 9 AM
27. **After hours** - Reject appointment ending after 6 PM
28. **On boundary** - Allow appointment ending exactly at 6 PM
29. **Overnight** - Reject appointment spanning midnight

### Multi-Service Tests
30. **Multiple services** - End time = sum of all service durations
31. **Custom duration** - Use custom duration when provided
32. **Custom price** - Apply custom price when provided
33. **Service variants** - Use variant duration and price when specified
34. **Discounts** - Apply discount to service price

## Error Handling

All operations throw `HttpError` with appropriate status codes:
- **401**: User not authenticated
- **403**: No permission or resource doesn't belong to salon
- **404**: Appointment not found
- **400**: Validation error or business rule violation
- **409**: Conflict detected (professional or assistant double-booking)

## Security Considerations

- All operations check RBAC permissions
- Salon context validated for all resources
- Professionals and assistants must be active in salon
- Soft deletes prevent data loss
- Audit logging tracks all changes
- Status transitions are validated
- Conflict detection prevents double-booking

## Best Practices

1. **Conflict Prevention**: Always check available slots before creating appointments
2. **Status Management**: Follow the status lifecycle strictly
3. **Service Selection**: Prefer service variants for flexible pricing
4. **Assistant Assignment**: Verify assistant availability before assigning
5. **Notes**: Add relevant notes for context (e.g., client preferences)
6. **Cancellation**: Use delete operation rather than manual status change
7. **Time Zones**: Always use ISO date strings with timezone information

## Performance Considerations

- Pagination recommended for large appointment lists
- Index on `salonId`, `professionalId`, `startAt` for fast queries
- Conflict detection queries optimized with date ranges
- Available slots calculation caches business hours config

## Future Enhancements

- Recurring appointments (daily, weekly, monthly)
- Appointment reminders (email, SMS, push)
- Online booking widget for clients
- Automatic conflict resolution suggestions
- Room assignment and room conflict detection
- Appointment templates for common services
- Calendar view integration
- Google Calendar / Outlook synchronization
- Appointment series management
- Waitlist functionality
- No-show tracking and penalties

## Related Modules

- **Clients**: Appointments link to clients
- **Services**: Services are selected for appointments
- **Sales**: Appointments can generate sales
- **Notifications**: Send appointment confirmations and reminders
- **Users**: Professionals and assistants are users
- **Reports**: Appointment reports for analytics
