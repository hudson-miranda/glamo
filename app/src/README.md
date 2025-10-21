# Glamo Backend Implementation

## Overview

This directory contains the backend implementation for the Glamo salon management system. The codebase is organized in a modular architecture with separate modules for each business domain.

## Project Status

- **Sprint 1:** ✅ Complete (Foundation)
- **Sprint 2:** ✅ Complete (Core Business Logic)  
- **Sprint 3:** 🔜 Pending (Sales & Operations)

**Overall Progress:** 66% (2/3 sprints)

## Architecture

### Technology Stack
- **Framework:** Wasp 0.18.0 (React + Node.js)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Language:** TypeScript
- **Auth:** Wasp Auth (email-based)
- **Jobs:** PgBoss (async operations)

### Module Structure

```
src/
├── rbac/                    # Role-Based Access Control
│   ├── requirePermission.ts # Permission checking helpers
│   ├── seed.ts             # RBAC seed data (40+ permissions, 6 roles)
│   └── requirePermission.test.ts
│
├── clients/                 # Client Management (Sprint 1)
│   ├── operations.ts       # 5 operations (list, get, create, update, delete)
│   └── README.md           # Complete documentation
│
├── notifications/           # Notification System (Sprint 1)
│   ├── operations.ts       # 4 operations + system helper
│   └── README.md           # Complete documentation
│
├── services/               # Service Catalog (Sprint 2)
│   ├── operations.ts       # 9 operations (services + variants + commission)
│   ├── commissionCalculator.ts  # Commission calculation engine
│   └── README.md           # Complete documentation
│
├── appointments/           # Appointment Scheduling (Sprint 2)
│   ├── operations.ts       # 7 operations (CRUD + status + slots)
│   ├── conflictDetector.ts # Conflict detection helpers
│   └── README.md           # Complete documentation
│
└── [OpenSaaS modules]      # Existing OpenSaaS functionality
    ├── admin/              # Admin dashboards
    ├── analytics/          # Analytics
    ├── auth/               # Authentication
    ├── payment/            # Payment processing
    ├── user/               # User management
    └── ...
```

## Implemented Modules

### 1. RBAC System (`rbac/`)

**Purpose:** Contextual role-based access control per salon

**Features:**
- 40+ granular permissions
- 6 default roles (owner, manager, professional, cashier, assistant, client)
- Salon-scoped permission checking
- Helper functions for permission validation

**Key Functions:**
- `requirePermission(user, salonId, permission, entities)` - Throws error if no permission
- `hasPermission(user, salonId, permission, entities)` - Returns boolean
- `getUserPermissions(userId, salonId, entities)` - Returns array of permissions

**Documentation:** See `requirePermission.test.ts` for 10 test scenarios

---

### 2. Clients Module (`clients/`)

**Purpose:** Customer/client management for salons

**Operations (5):**
- `listClients` - Search and paginate clients
- `getClient` - Get client with relationships (appointments, sales, credits)
- `createClient` - Create with validation (email uniqueness per salon)
- `updateClient` - Update with duplicate checks
- `deleteClient` - Soft delete with active appointment protection

**Key Features:**
- Multi-field search (name, email, phone, CPF, CNPJ)
- Email uniqueness per salon
- Soft deletes
- Audit logging

**Documentation:** `clients/README.md` (12 test scenarios)

---

### 3. Notifications Module (`notifications/`)

**Purpose:** Multi-channel notification system

**Operations (4 + 1 helper):**
- `listNotifications` - List with unread count
- `createNotification` - Multi-channel support (INTERNAL, PUSH, EMAIL, WHATSAPP)
- `markNotificationRead` - Mark single as read
- `markAllNotificationsRead` - Bulk operation
- `createSystemNotification` - Server-side helper for automated notifications

**Key Features:**
- 4 notification channels
- 4 notification types (INFO, WARNING, ALERT, SYSTEM)
- Unread tracking
- Salon context validation

**Documentation:** `notifications/README.md` (12 test scenarios)

---

### 4. Services Module (`services/`)

**Purpose:** Service catalog management with pricing and commission configuration

**Operations (9):**
- `listServices` - Search and paginate services
- `getService` - Get with variants and commission config
- `createService` - Create with cost tracking
- `updateService` - Update with validation
- `deleteService` - Soft delete with appointment protection
- `createServiceVariant` - Add pricing variants
- `updateServiceVariant` - Update variants
- `deleteServiceVariant` - Soft delete variants
- `manageCommissionConfig` - Configure commission rules

**Key Features:**
- Service variants for flexible pricing
- Cost value tracking (FIXED or PERCENT)
- Non-commissionable value tracking
- Service room assignment
- Commission configuration for 3 scenarios (solo, with assistant, as assistant)

**Commission Calculator:**
- `calculateCommission(config, serviceData, scenario)` - Main router
- `calculateSoloCommission` - Professional alone
- `calculateWithAssistantCommission` - With optional deduction
- `calculateAsAssistantCommission` - Assistant role
- Supports FIXED and PERCENT value types
- Handles complex edge cases

**Documentation:** `services/README.md` (30 test scenarios)

---

### 5. Appointments Module (`appointments/`)

**Purpose:** Appointment scheduling with conflict detection

**Operations (7):**
- `listAppointments` - Filter by professional, client, status, date range
- `getAppointment` - Full details with status history
- `getAvailableSlots` - Calculate available time slots
- `createAppointment` - Create with conflict detection
- `updateAppointment` - Update with re-validation
- `deleteAppointment` - Cancel (soft delete)
- `updateAppointmentStatus` - Status lifecycle management

**Key Features:**
- Multi-service appointments
- Assistant assignment
- Professional and assistant conflict detection
- Status lifecycle (PENDING → CONFIRMED → IN_SERVICE → DONE)
- Business hours validation (9 AM - 6 PM)
- Automatic duration calculation
- Status history tracking

**Conflict Detection:**
- `checkProfessionalConflict` - Prevent double-booking
- `checkAssistantConflict` - Check assistant availability
- `getAvailableSlots` - Calculate free time slots
- `doTimeSlotsOverlap` - Time overlap utility
- `isWithinBusinessHours` - Business hours validation
- `calculateAppointmentEndTime` - Duration calculation

**Documentation:** `appointments/README.md` (34 test scenarios)

---

## Common Patterns

### Operation Structure

All operations follow a consistent pattern:

```typescript
export const operationName: OperationType<InputType, OutputType> = async (
  input,
  context
) => {
  // 1. Authentication check
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  // 2. Authorization check
  await requirePermission(context.user, salonId, 'permission_name', context.entities);

  // 3. Business logic validation
  // Validate inputs, check business rules

  // 4. Database operation
  const result = await context.entities.Model.create/update/delete({...});

  // 5. Audit logging
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'EntityName',
      entityId: result.id,
      action: 'CREATE',
      before: null,
      after: {...},
    },
  });

  // 6. Return result
  return result;
};
```

### Error Handling

Standard error codes:
- **401:** User not authenticated
- **403:** No permission or access denied
- **404:** Resource not found
- **400:** Validation error or business rule violation
- **409:** Conflict (e.g., double-booking)

### RBAC Integration

Every protected operation:
1. Checks if user is authenticated
2. Calls `requirePermission(user, salonId, permission, entities)`
3. Validates salon context for all resources
4. Logs access attempts (including denials)

### Audit Logging

Every operation creates log entries:
```typescript
{
  userId: string;        // Who performed the action
  entity: string;        // What was affected
  entityId: string;      // ID of affected entity
  action: string;        // CREATE, UPDATE, DELETE, STATUS_UPDATE
  before: Json;          // State before
  after: Json;           // State after
}
```

### Soft Deletes

Most entities use soft deletes:
- Sets `deletedAt` timestamp instead of hard delete
- Preserves historical data
- Prevents deletion when dependencies exist
- Excluded from normal queries via `deletedAt: null` filter

## Database Schema

### Core Models (40+)

**Foundation:**
- User, Salon, UserSalon (multi-tenancy)
- Role, Permission, RolePermission, UserRole (RBAC)
- Log, Notification (audit & notifications)

**Sprint 1:**
- Client, ClientCredit

**Sprint 2:**
- Service, ServiceVariant, ServiceCategory, CommissionConfig, ServiceRoom
- Appointment, AppointmentService, AppointmentAssistant, AppointmentRepetition, AppointmentStatusLog
- AvailableTimeslot

**Sprint 3 (Pending):**
- Product, ProductCategory, ProductBrand, Supplier, StockRecord
- Package, PackageService
- Sale, SaleService, SaleProduct, SalePackage
- Payment, PaymentMethod, CreditPayment
- CashRegisterSession, CashMovement
- Voucher

### Key Enums

- `NotificationChannel`: INTERNAL, PUSH, EMAIL, WHATSAPP
- `NotificationType`: INFO, WARNING, ALERT, SYSTEM
- `AppointmentStatus`: PENDING, CONFIRMED, IN_SERVICE, DONE, CANCELLED
- `PaymentStatus`: PENDING, PARTIAL, PAID, REFUNDED
- `ValueType`: FIXED, PERCENT
- `MovementType`: IN, OUT, ADJUST
- `SaleStatus`: OPEN, CLOSED, CANCELLED
- `PaymentMethodType`: (TBD in Sprint 3)
- `CashMovementType`: (TBD in Sprint 3)

## Testing Strategy

### Test Documentation
- RBAC: 10 scenarios in `requirePermission.test.ts`
- Clients: 12 scenarios in `clients/README.md`
- Notifications: 12 scenarios in `notifications/README.md`
- Services: 30 scenarios in `services/README.md`
- Appointments: 34 scenarios in `appointments/README.md`

**Total:** 98+ test scenarios documented

### Running Tests

To run tests after Wasp setup:

```bash
# Start database
wasp start db

# Run migrations
wasp db migrate-dev

# Run seeds (RBAC + mock data)
wasp db seed

# Start dev server
wasp start

# Execute tests (when test framework is set up)
wasp test
```

## Security

### CodeQL Analysis
- ✅ 0 vulnerabilities found (verified October 21, 2025)
- All code analyzed for SQL injection, XSS, security issues
- Regular security audits recommended

### Security Measures
- SQL injection protection (Prisma ORM)
- Input validation on all operations
- Authorization checks via RBAC
- Audit logging for accountability
- Soft deletes prevent data loss
- No sensitive data in logs
- Error messages don't expose internals

## API Usage

### From React Components

```typescript
import { listClients, createClient } from 'wasp/client/operations';

// List clients
const { clients, total } = await listClients({
  salonId: userActiveSalonId,
  search: 'John',
  page: 1,
  perPage: 20,
});

// Create client
const client = await createClient({
  salonId: userActiveSalonId,
  name: 'Jane Doe',
  email: 'jane@example.com',
  phone: '+5511999999999',
});
```

### From Server-Side

```typescript
import { createSystemNotification } from '@src/notifications/operations';
import { calculateCommission } from '@src/services/commissionCalculator';

// System notification (no user context needed)
await createSystemNotification(
  prisma,
  userId,
  salonId,
  'Low Stock Alert',
  'Product X is running low',
  'WARNING',
  'INTERNAL'
);

// Calculate commission
const commission = calculateCommission(
  commissionConfig,
  serviceData,
  'SOLO'
);
```

## Development Guidelines

### Adding New Operations

1. Create operation file in appropriate module
2. Define TypeScript types for input/output
3. Implement operation following common patterns
4. Add RBAC permission check
5. Add audit logging
6. Register in `main.wasp` with entity dependencies
7. Document in module README with test scenarios

### Module Organization

```
module-name/
├── operations.ts       # All queries and actions
├── helpers.ts         # Utility functions (optional)
├── README.md          # Complete documentation
└── *.test.ts         # Tests (optional)
```

### Code Style

- TypeScript for type safety
- Async/await for asynchronous operations
- Descriptive variable names
- Comments for complex logic
- Consistent error handling
- Comprehensive validation

## Next Steps: Sprint 3

### Remaining Modules

1. **Sales Module**
   - Multi-item sales (services, products, packages)
   - Multiple payment methods
   - Client credits
   - Commission integration
   - Cancellation with reversals

2. **Inventory Module**
   - Product CRUD
   - Stock movements
   - Low stock alerts
   - Concurrency handling

3. **Cash Register Module**
   - Session management
   - Cash movements
   - Reconciliation
   - Daily statements

4. **Reports Module**
   - Sales reports
   - Commission reports
   - Inventory reports
   - Cash reports
   - Async export (PgBoss)

## Resources

- [Wasp Documentation](https://wasp.sh/docs)
- [OpenSaaS Template](https://opensaas.sh)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## Support

For questions or issues:
1. Check module README files for detailed documentation
2. Review test scenarios for usage examples
3. Check `GLAMO_STATUS.md` for implementation status
4. Review `SUMMARY.md` or `SPRINT2_SUMMARY.md` for overviews

## License

[Your License Here]

---

**Status:** Sprint 2 Complete (66%) | Ready for Sprint 3  
**Last Updated:** October 21, 2025
