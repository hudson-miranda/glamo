# Employee Management Module

Complete employee management system for Glamo, including CRUD operations, schedule management, and service assignments.

## Overview

This module provides comprehensive functionality for managing salon employees/collaborators, including:

- **Employee CRUD**: Complete create, read, update, delete operations with validation
- **Schedule Management**: Define working hours for each employee by day of week
- **Service Assignment**: Assign services to employees with custom pricing and commission
- **User Linking**: Link employees to system users for access control
- **Photo Upload**: Profile photos for online booking
- **Audit Logging**: All operations are logged for compliance

## Architecture

### Backend Operations (15 total)

```
app/src/employees/
├── operations.ts           # Main employee CRUD (10 operations)
├── scheduleOperations.ts  # Schedule management (4 operations)
└── serviceOperations.ts   # Service assignments (4 operations)
```

### Frontend Components

```
app/src/client/modules/employees/
├── EmployeesPage.tsx              # List with stats and filters
├── CreateEmployeePage.tsx         # Multi-step creation form
├── EditEmployeePage.tsx          # Edit employee details
├── EmployeeSchedulesPage.tsx     # Schedule management
└── components/
    ├── PersonalDataStep.tsx      # Personal info form
    ├── ScheduleStep.tsx          # Schedule editor
    ├── ServicesStep.tsx          # Service selector
    ├── CommissionStep.tsx        # Commission config
    ├── EmployeesTable.tsx        # Data table
    └── ...
```

## Backend Operations

### Employee Operations (`operations.ts`)

#### Queries

##### `listEmployees`

Lists all employees for a salon with filtering and sorting.

**Permission Required**: `employees:read`

**Input**:
```typescript
{
  salonId?: string;      // Optional, defaults to activeSalonId
  isActive?: boolean;    // Filter by active status
  search?: string;       // Search in name, email, phone, cpf
}
```

**Output**:
```typescript
{
  employees: Array<Employee & {
    user: { id, name, email } | null;
    schedules: EmployeeSchedule[];
    _count: { serviceAssignments: number };
  }>;
  total: number;
}
```

**Example**:
```typescript
const { employees, total } = await listEmployees({
  salonId: 'salon-123',
  isActive: true,
  search: 'João'
});
```

---

##### `getEmployee`

Gets detailed information about a specific employee.

**Permission Required**: `employees:read`

**Input**:
```typescript
{
  id: string;  // Employee ID
}
```

**Output**:
```typescript
Employee & {
  user: { id, name, email } | null;
  schedules: EmployeeSchedule[];
  serviceAssignments: Array<EmployeeService & {
    service: { id, name, duration, price };
  }>;
}
```

**Example**:
```typescript
const employee = await getEmployee({ id: 'emp-123' });
console.log(employee.schedules);  // Working hours
console.log(employee.serviceAssignments);  // Assigned services
```

---

#### Actions

##### `createEmployee`

Creates a new employee with complete data.

**Permission Required**: `employees:create`

**Input**:
```typescript
{
  salonId?: string;
  name: string;                    // Required, min 3 chars
  email?: string;
  phone?: string;
  phone2?: string;
  instagram?: string;
  birthDate?: string;              // ISO date string
  color?: string;                  // Hex color for calendar
  position?: string;
  
  // Documents
  cpf?: string;
  rg?: string;
  rgIssuingBody?: string;
  
  // Banking
  pixKey?: string;
  bankName?: string;
  bankAgency?: string;
  bankAccount?: string;
  bankDigit?: string;
  accountType?: string;
  personType?: string;
  companyName?: string;
  cnpj?: string;
  
  // Address
  address?: string;
  addressNumber?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  
  // Professional
  permissions?: string[];
  commissionType?: string;
  commissionValue?: number;
  tipRule?: string;
  canReceiveTips?: boolean;
  tipsOnlyFromAppointments?: boolean;
  
  // Schedules (optional)
  schedules?: Array<{
    dayOfWeek: number;      // 0-6 (Sunday-Saturday)
    startTime: string;      // HH:mm
    endTime: string;        // HH:mm
  }>;
  
  // Invitation
  sendInvite?: boolean;     // Default true if email provided
}
```

**Validations**:
- Name must be at least 3 characters
- Email is validated and checked for existing users
- Phone numbers are normalized (digits only)
- CPF/CNPJ are normalized
- Birth date cannot be in the future
- Color is auto-generated if not provided
- If email is provided and user exists, links automatically

**Example**:
```typescript
const employee = await createEmployee({
  name: 'João Silva',
  email: 'joao@example.com',
  phone: '11999999999',
  position: 'Cabeleireiro',
  color: '#4ECDC4',
  schedules: [
    { dayOfWeek: 1, startTime: '09:00', endTime: '18:00' },  // Monday
    { dayOfWeek: 2, startTime: '09:00', endTime: '18:00' },  // Tuesday
  ],
  sendInvite: true  // Sends invitation email
});
```

---

##### `updateEmployee`

Updates an existing employee.

**Permission Required**: `employees:update`

**Input**: Same as `createEmployee` but with `id` field

**Validations**: Same as create

**Example**:
```typescript
await updateEmployee({
  id: 'emp-123',
  position: 'Cabeleireiro Sênior',
  commissionValue: 50
});
```

---

##### `deleteEmployee`

Soft deletes an employee (sets `deletedAt` and `isActive = false`).

**Permission Required**: `employees:delete`

**Input**:
```typescript
{
  id: string;
}
```

**Example**:
```typescript
await deleteEmployee({ id: 'emp-123' });
```

---

##### `uploadEmployeePhoto`

Updates the employee's profile photo.

**Permission Required**: `employees:update`

**Input**:
```typescript
{
  id: string;
  photoUrl: string;  // Must be valid URL
}
```

**Validations**:
- URL format is validated

**Example**:
```typescript
await uploadEmployeePhoto({
  id: 'emp-123',
  photoUrl: 'https://i.pinimg.com/474x/88/46/c0/8846c0ca8a43822e640c929b9a4f4cd2.jpg'
});
```

---

##### `linkEmployeeToUser`

Links an employee to a system user account.

**Permission Required**: `employees:update`

**Input**:
```typescript
{
  employeeId: string;
  userId: string;
}
```

**Validations**:
- User must exist
- User must belong to the same salon

**Example**:
```typescript
await linkEmployeeToUser({
  employeeId: 'emp-123',
  userId: 'user-456'
});
```

---

##### `unlinkEmployeeFromUser`

Removes the link between employee and user.

**Permission Required**: `employees:update`

**Input**:
```typescript
{
  employeeId: string;
}
```

**Validations**:
- Employee must be currently linked

**Example**:
```typescript
await unlinkEmployeeFromUser({
  employeeId: 'emp-123'
});
```

---

### Schedule Operations (`scheduleOperations.ts`)

#### `listEmployeeSchedules`

Lists all schedules for an employee.

**Permission Required**: `employees:read`

**Input**:
```typescript
{
  employeeId: string;
  isActive?: boolean;
  dayOfWeek?: number;  // 0-6
}
```

**Output**:
```typescript
{
  schedules: EmployeeSchedule[];
  total: number;
}
```

---

#### `createEmployeeSchedule`

Creates a new schedule block for an employee.

**Permission Required**: `employees:update`

**Input**:
```typescript
{
  employeeId: string;
  dayOfWeek: number;      // 0-6 (Sunday-Saturday)
  startTime: string;      // HH:mm format
  endTime: string;        // HH:mm format
  isActive?: boolean;     // Default true
}
```

**Validations**:
- Day of week must be 0-6
- Time format must be HH:mm (24h)
- Start time must be before end time
- Cannot overlap with existing active schedules

**Example**:
```typescript
await createEmployeeSchedule({
  employeeId: 'emp-123',
  dayOfWeek: 1,           // Monday
  startTime: '09:00',
  endTime: '12:00'
});
```

---

#### `updateEmployeeSchedule`

Updates an existing schedule.

**Permission Required**: `employees:update`

**Input**:
```typescript
{
  scheduleId: string;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  isActive?: boolean;
}
```

**Validations**: Same as create (excluding current schedule from overlap check)

---

#### `deleteEmployeeSchedule`

Permanently deletes a schedule.

**Permission Required**: `employees:update`

**Input**:
```typescript
{
  scheduleId: string;
}
```

**Note**: This is a hard delete, not soft delete.

---

### Service Operations (`serviceOperations.ts`)

#### `listEmployeeServices`

Lists all services assigned to an employee.

**Permission Required**: `employees:read`

**Input**:
```typescript
{
  employeeId: string;
}
```

**Output**:
```typescript
{
  services: Array<EmployeeService & {
    service: {
      id: string;
      name: string;
      description: string | null;
      duration: number;
      price: number;
    };
  }>;
  total: number;
}
```

---

#### `assignServiceToEmployee`

Assigns a service to an employee with optional customizations.

**Permission Required**: `employees:update`

**Input**:
```typescript
{
  employeeId: string;
  serviceId: string;
  customDuration?: number;    // Minutes, overrides service default
  customPrice?: number;       // R$, overrides service default
  commission?: number;        // %, 0-100
}
```

**Validations**:
- Service must exist and belong to same salon
- Service cannot be deleted
- Custom duration must be > 0
- Custom price must be >= 0
- Commission must be 0-100
- Cannot duplicate assignment

**Example**:
```typescript
await assignServiceToEmployee({
  employeeId: 'emp-123',
  serviceId: 'srv-456',
  customDuration: 45,      // This employee takes 45min instead of default
  customPrice: 80.00,      // Custom pricing for this employee
  commission: 50           // 50% commission
});
```

---

#### `updateEmployeeServiceDetails`

Updates customizations for an existing service assignment.

**Permission Required**: `employees:update`

**Input**:
```typescript
{
  employeeServiceId: string;
  customDuration?: number | null;
  customPrice?: number | null;
  commission?: number | null;
}
```

**Note**: Pass `null` to remove customization and use service defaults.

---

#### `removeServiceFromEmployee`

Removes a service from an employee.

**Permission Required**: `employees:update`

**Input**:
```typescript
{
  employeeServiceId: string;
}
```

**Validations**:
- Cannot remove if there are future appointments with this employee+service combination

**Example**:
```typescript
await removeServiceFromEmployee({
  employeeServiceId: 'es-789'
});
```

---

## Frontend Components

### EmployeesPage

Main listing page with:
- **Stats Cards**: Total, Active, Inactive, Online Booking enabled
- **Filters**: 
  - Search (name, email, phone)
  - Status filter (all/active/inactive)
  - Position filter (dropdown with unique positions)
- **Employee Table**: Shows all employees with quick actions
- **Pending Invites**: Shows invitations awaiting acceptance

**Route**: `/employees`

---

### CreateEmployeePage

Multi-step form with 4 steps:
1. **Personal Data**: Name, email, phone, documents, address, banking
2. **Schedule**: Visual editor for working hours by day
3. **Services**: Select which services the employee can perform
4. **Commission**: Configure commission rules and tip settings

**Route**: `/employees/new`

---

### EditEmployeePage

Same as create but pre-filled with existing data.

**Route**: `/employees/:id/edit`

---

### EmployeeSchedulesPage

Dedicated page for managing employee schedules with visual calendar view.

**Route**: `/employees/:id/schedules`

---

## RBAC Permissions

| Permission | Description |
|-----------|-------------|
| `employees:read` | View employees and their details |
| `employees:create` | Create new employees |
| `employees:update` | Update employee information, schedules, services |
| `employees:delete` | Delete employees |

**Note**: Schedule and service management use the `employees:update` permission.

---

## Database Schema

### Employee

```prisma
model Employee {
  id                        String    @id @default(uuid())
  salonId                   String
  userId                    String?
  
  // Personal
  name                      String
  email                     String?
  phone                     String?
  phone2                    String?
  instagram                 String?
  birthDate                 DateTime?
  color                     String?
  
  // Documents
  cpf                       String?
  rg                        String?
  rgIssuingBody             String?
  
  // Banking
  pixKey                    String?
  bankName                  String?
  bankAgency                String?
  bankAccount               String?
  bankDigit                 String?
  accountType               String?
  personType                String?
  companyName               String?
  cnpj                      String?
  
  // Address
  address                   String?
  addressNumber             String?
  complement                String?
  neighborhood              String?
  city                      String?
  state                     String?
  zipCode                   String?
  
  // Professional
  position                  String?
  permissions               String[]
  commissionType            String?
  commissionValue           Float?
  tipRule                   String?
  canReceiveTips            Boolean @default(true)
  tipsOnlyFromAppointments  Boolean @default(true)
  
  // Online Booking
  profilePhoto              String?
  bio                       String?
  specialties               String[]
  acceptsOnlineBooking      Boolean @default(true)
  
  isActive                  Boolean @default(true)
  deletedAt                 DateTime?
  
  // Relations
  salon                     Salon
  user                      User?
  schedules                 EmployeeSchedule[]
  serviceAssignments        EmployeeService[]
  appointments              Appointment[]
}
```

### EmployeeSchedule

```prisma
model EmployeeSchedule {
  id          String   @id @default(uuid())
  employeeId  String
  dayOfWeek   Int      // 0=Sunday, 6=Saturday
  startTime   String   // HH:mm
  endTime     String   // HH:mm
  isActive    Boolean  @default(true)
  
  employee    Employee @relation(...)
}
```

### EmployeeService

```prisma
model EmployeeService {
  id             String  @id @default(uuid())
  employeeId     String
  serviceId      String
  customDuration Int?    // Override service duration
  customPrice    Float?  // Override service price
  commission     Float?  // Employee commission %
  
  employee       Employee @relation(...)
  service        Service  @relation(...)
  
  @@unique([employeeId, serviceId])
}
```

---

## Integration Points

### With Appointments Module

When creating appointments, the system:
1. Validates that the employee exists and is active
2. Validates that the employee can perform the requested service (via EmployeeService)
3. Validates availability based on EmployeeSchedule
4. Uses custom duration/price if defined in EmployeeService

### With User Module

Employees can be linked to User accounts to:
- Access the system dashboard
- Manage their own schedule and services
- View their appointments and performance

### With Invitation System

When creating an employee with email:
- System checks if user exists
- If yes: auto-links
- If no: sends invitation email
- User can accept/reject invitation

---

## Testing Examples

### Create Employee with Full Data

```typescript
const employee = await createEmployee({
  name: 'Maria Santos',
  email: 'maria@example.com',
  phone: '11988887777',
  cpf: '12345678900',
  position: 'Manicure',
  color: '#FF6B6B',
  address: 'Rua das Flores',
  addressNumber: '123',
  city: 'São Paulo',
  state: 'SP',
  zipCode: '01234567',
  pixKey: 'maria@example.com',
  commissionType: 'PERCENTAGE',
  commissionValue: 40,
  schedules: [
    { dayOfWeek: 1, startTime: '09:00', endTime: '18:00' },
    { dayOfWeek: 3, startTime: '09:00', endTime: '18:00' },
    { dayOfWeek: 5, startTime: '09:00', endTime: '18:00' },
  ]
});
```

### Assign Multiple Services

```typescript
const services = ['srv-1', 'srv-2', 'srv-3'];

for (const serviceId of services) {
  await assignServiceToEmployee({
    employeeId: employee.id,
    serviceId,
    commission: 45
  });
}
```

### Create Complex Schedule

```typescript
// Monday: morning and afternoon
await createEmployeeSchedule({
  employeeId: 'emp-123',
  dayOfWeek: 1,
  startTime: '08:00',
  endTime: '12:00'
});

await createEmployeeSchedule({
  employeeId: 'emp-123',
  dayOfWeek: 1,
  startTime: '14:00',
  endTime: '18:00'
});
```

---

## Error Handling

All operations throw `HttpError` with appropriate status codes:

- **401**: User not authenticated
- **403**: Missing permission or wrong salon
- **404**: Employee/Schedule/Service not found
- **400**: Validation errors

Example:
```typescript
try {
  await deleteEmployee({ id: 'emp-123' });
} catch (error) {
  if (error.statusCode === 400) {
    // Validation error (e.g., has future appointments)
    console.log(error.message);
  }
}
```

---

## Audit Logging

All operations create audit logs with:
- User ID (who performed the action)
- Entity type (Employee, EmployeeSchedule, EmployeeService)
- Action type (CREATE, UPDATE, DELETE, LINK_USER, UNLINK_USER)
- Before/After state (for updates)

Query logs:
```typescript
const logs = await prisma.log.findMany({
  where: {
    entity: 'Employee',
    entityId: 'emp-123'
  },
  orderBy: { createdAt: 'desc' }
});
```

---

## Best Practices

1. **Always validate employee exists before operations**: Use `getEmployee` first
2. **Use soft deletes**: Employees are soft-deleted to maintain historical data
3. **Schedule validation**: Check for overlaps before creating schedules
4. **Service validation**: Ensure employee can perform service before appointments
5. **Commission tracking**: Store commission in EmployeeService for accurate reporting
6. **Audit everything**: All operations are logged for compliance
7. **Permission checks**: All operations require appropriate RBAC permissions

---

## Future Enhancements

- [ ] Employee performance metrics
- [ ] Automated schedule templates
- [ ] Bulk service assignment
- [ ] Employee availability calendar view
- [ ] Commission reports
- [ ] Time-off/vacation management
- [ ] Skills and certifications tracking
- [ ] Employee reviews/ratings

---

## Support

For questions or issues with the Employee module:
- Check the operation signatures in the source files
- Review the Prisma schema for data structure
- Check RBAC permissions for access issues
- Review audit logs for troubleshooting

**Maintainer**: Glamo Development Team
**Last Updated**: November 2024
