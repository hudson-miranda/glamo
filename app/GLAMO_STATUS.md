# Glamo Implementation Status

## Overview
This document tracks the implementation status of the Glamo salon management system based on OpenSaaS/Wasp.

**Last Updated:** 2025-10-21

## Sprint 1 Status: ✅ COMPLETED

### ✅ Prisma Schema
- [x] Extended User model with Glamo-specific fields (phone, address, birthDate, activeSalonId, etc.)
- [x] Created complete RBAC models (Role, Permission, RolePermission, UserRole, UserSalon)
- [x] Added all business models (40+ models including Client, Service, Appointment, Sale, Product, etc.)
- [x] Defined all enums (NotificationChannel, NotificationType, AppointmentStatus, PaymentStatus, etc.)
- [x] Set up relationships with proper onDelete constraints
- [x] Initial migration created: `20251020183229_init`

### ✅ RBAC System
- [x] Created `requirePermission` helper with 3 functions:
  - `requirePermission(user, salonId, permission, prisma)` - Throws error if no permission
  - `hasPermission(user, salonId, permission, prisma)` - Returns boolean
  - `getUserPermissions(userId, salonId, prisma)` - Returns array of permission names
- [x] Defined 40+ permissions across all modules
- [x] Created 6 default roles:
  - **owner**: Full access to all features
  - **manager**: Most features except some admin functions
  - **professional**: Client, appointment, and service management
  - **cashier**: Sales, payments, and cash register
  - **assistant**: View-only access
  - **client**: Self-booking and viewing own appointments
- [x] Implemented `createDefaultRolesForSalon(salonId)` helper
- [x] Implemented `assignOwnerRole(userId, salonId)` helper
- [x] Auto-assign owner role to salon creator
- [x] 10 test scenarios documented in `requirePermission.test.ts`

### ✅ Clients Module
- [x] **listClients** query with search and pagination
- [x] **getClient** query with full relationships (appointments, sales, credits)
- [x] **createClient** action with validations:
  - At least one contact method required (email, phone, CPF, or CNPJ)
  - Email uniqueness per salon
- [x] **updateClient** action with duplicate checks
- [x] **deleteClient** action (soft delete):
  - Prevents deletion of clients with active appointments
- [x] Comprehensive audit logging for all operations
- [x] Full documentation in `src/clients/README.md`

### ✅ Notifications Module
- [x] **listNotifications** query with unread count and pagination
- [x] **createNotification** action with multi-channel support
- [x] **markNotificationRead** action (single notification)
- [x] **markAllNotificationsRead** action (bulk operation)
- [x] **createSystemNotification** helper function for programmatic notifications
- [x] Support for 4 channels: INTERNAL, PUSH, EMAIL, WHATSAPP
- [x] Support for 4 notification types: INFO, WARNING, ALERT, SYSTEM
- [x] Comprehensive audit logging for all operations
- [x] Full documentation in `src/notifications/README.md`

### ✅ Wasp Configuration
- [x] All operations registered in `main.wasp`
- [x] Proper entity dependencies configured
- [x] Database seeds configured to run RBAC seed

## Sprint 2 Status: 🔜 PENDING

### 🔜 Appointments Module
- [ ] Create Appointment CRUD with conflict detection
- [ ] Implement `availableSlots` query
- [ ] Add support for services, assistants, and recurrence
- [ ] Implement status lifecycle with AppointmentStatusLog
- [ ] Add comprehensive tests for conflicts and edge cases

### 🔜 Services + Commission Engine
- [ ] Create Service and ServiceVariant CRUD
- [ ] Implement CommissionConfig management
- [ ] Build commission calculation engine
- [ ] Handle solo/with assistant/as assistant scenarios
- [ ] Add edge case tests (negative values, 100% solo, 50/50 split)

## Sprint 3 Status: 🔜 PENDING

### 🔜 Sales + Payments + Client Credits
- [ ] Create Sale CRUD with multiple items
- [ ] Implement multiple payment support
- [ ] Add ClientCredit management
- [ ] Integrate commission calculation on sale close
- [ ] Handle cancellation with stock reversal
- [ ] Add receipt generation

### 🔜 Inventory Module
- [ ] Create Product CRUD
- [ ] Implement StockRecord for movements
- [ ] Add low stock notifications
- [ ] Prevent negative stock (configurable)
- [ ] Add concurrency tests

### 🔜 Cash Register Module
- [ ] Create session management (open/close)
- [ ] Implement cash movements
- [ ] Add reconciliation logic
- [ ] Generate daily statements
- [ ] Ensure only one open session at a time

### 🔜 Reports Module
- [ ] Create report queries
- [ ] Add filtering by date, professional, salon
- [ ] Implement async export with PgBoss
- [ ] Send notification on report completion
- [ ] Add pagination for performance

## Technical Implementation Details

### Architecture
- **Framework**: Wasp 0.18.0 (React + Node.js + Prisma)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: Wasp Auth (email-based)
- **Job Queue**: PgBoss (for async operations)

### RBAC Implementation
The RBAC system is contextual per salon:
- `User.activeSalonId` defines the current salon context
- All protected operations call `requirePermission(user, salonId, permission, prisma)`
- Permissions are checked via `UserSalon → UserRole → Role → RolePermission → Permission`
- Access denied attempts are logged in the `Log` table

### Audit Logging
All significant operations create entries in the `Log` table:
```typescript
{
  userId: string;        // Who performed the action
  entity: string;        // What entity was affected (e.g., "Client", "Notification")
  entityId: string;      // ID of the affected entity
  action: string;        // What action was performed (e.g., "CREATE", "UPDATE", "DELETE")
  before: Json;          // State before the action
  after: Json;           // State after the action
}
```

### Validation Patterns
1. **Authentication**: Check `context.user` exists
2. **Authorization**: Call `requirePermission` with appropriate permission
3. **Business Logic**: Validate business rules (e.g., unique email, no active appointments)
4. **Database Operation**: Perform the database operation
5. **Audit**: Create log entry
6. **Return**: Return the result

### Error Handling
All operations throw `HttpError` with appropriate status codes:
- **401**: User not authenticated
- **403**: No permission or access denied
- **404**: Resource not found
- **400**: Validation error or business rule violation

## Database Schema Overview

### Core Models (40+ total)
- **Auth & Multi-tenancy**: User, Salon, UserSalon
- **RBAC**: Role, Permission, RolePermission, UserRole
- **Audit**: Log, Notification
- **Clients**: Client, ClientCredit
- **Services**: Service, ServiceVariant, ServiceCategory, CommissionConfig, ServiceRoom
- **Appointments**: Appointment, AppointmentService, AppointmentAssistant, AppointmentRepetition, AppointmentStatusLog, AvailableTimeslot
- **Products**: Product, ProductCategory, ProductBrand, Supplier, StockRecord
- **Packages**: Package, PackageService
- **Sales**: Sale, SaleService, SaleProduct, SalePackage, Payment, PaymentMethod, CreditPayment
- **Cash**: CashRegisterSession, CashMovement
- **Vouchers**: Voucher

## Next Steps

### Immediate Tasks
1. ✅ Complete Sprint 1 implementation (DONE)
2. 🔄 Test modules in a running Wasp environment
3. 🔄 Run database seed to populate RBAC permissions
4. 🔜 Begin Sprint 2: Appointments module
5. 🔜 Begin Sprint 2: Services + Commission Engine

### Testing Approach
1. **Unit Tests**: Test individual functions with mocked data
2. **Integration Tests**: Test full operations with test database
3. **E2E Tests**: Test complete user flows
4. **Manual Testing**: Test in browser with UI

### Deployment Checklist
- [ ] Configure production database
- [ ] Set up environment variables
- [ ] Run migrations
- [ ] Run seeds
- [ ] Configure email service (SendGrid/Mailgun)
- [ ] Configure payment processor (Stripe/LemonSqueezy)
- [ ] Set up monitoring and logging
- [ ] Configure backups
- [ ] Set up CI/CD pipeline

## File Structure

```
app/
├── src/
│   ├── rbac/
│   │   ├── requirePermission.ts      # RBAC helper functions
│   │   ├── requirePermission.test.ts # Test scenarios
│   │   └── seed.ts                   # Permission and role seeds
│   ├── clients/
│   │   ├── operations.ts             # Client CRUD operations
│   │   └── README.md                 # Module documentation
│   ├── notifications/
│   │   ├── operations.ts             # Notification operations
│   │   └── README.md                 # Module documentation
│   ├── server/
│   │   └── scripts/
│   │       └── glamoSeeds.ts         # Main seed entry point
│   └── ... (other OpenSaaS modules)
├── schema.prisma                      # Database schema
├── main.wasp                          # Wasp configuration
└── migrations/
    └── 20251020183229_init/          # Initial migration
```

## Key Design Decisions

1. **Multi-tenancy**: Implemented at the database level with `salonId` foreign keys
2. **Soft Deletes**: Most entities use `deletedAt` timestamp instead of hard deletes
3. **Audit Trail**: All significant operations logged for compliance and debugging
4. **Permission Checking**: Centralized in `requirePermission` helper
5. **Type Safety**: TypeScript used throughout with proper Wasp types
6. **Validation**: Input validation at the operation level
7. **Error Messages**: Clear, user-friendly error messages in English (can be i18n later)

## Known Limitations

1. **Wasp Build Required**: Code needs to be built with Wasp CLI to generate types
2. **No UI Yet**: Only backend operations implemented (UI to be added)
3. **No External Integrations**: Email, WhatsApp, Push notifications not yet integrated
4. **No Tests Running**: Test framework not yet set up (scenarios documented)
5. **No Production Config**: Environment-specific configuration needed

## Contributing

When adding new modules, follow this pattern:
1. Create module directory in `src/`
2. Create `operations.ts` with queries and actions
3. Add type definitions for inputs/outputs
4. Implement permission checks with `requirePermission`
5. Add audit logging
6. Register operations in `main.wasp`
7. Create comprehensive documentation in `README.md`
8. Add test scenarios

## Resources

- [Wasp Documentation](https://wasp.sh/docs)
- [OpenSaaS Template](https://opensaas.sh)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

---

**Status**: Sprint 1 Complete ✅ | Ready for Sprint 2 🚀
