# Services Module

## Overview
The Services module manages services, service variants, and commission configurations for salons in the Glamo system. It provides comprehensive CRUD operations with proper RBAC authorization, validation, and a powerful commission calculation engine.

## Features
- List services with search and pagination
- View service details with variants and commission config
- Create and update services with cost and pricing management
- Manage service variants for flexible pricing
- Configure commission settings for different scenarios (solo, with assistant, as assistant)
- Commission calculation engine with support for FIXED and PERCENT values
- Soft delete services/variants (with active appointment checks)
- Comprehensive audit logging

## Operations

### Queries

#### `listServices`
Lists all services for a salon with optional search and pagination.

**Permission Required:** `can_view_services`

**Input:**
```typescript
{
  salonId: string;
  search?: string;         // Search in name and description
  page?: number;           // Default: 1
  perPage?: number;        // Default: 20
  includeDeleted?: boolean; // Default: false
}
```

**Output:**
```typescript
{
  services: Service[];     // Includes variants and commission config
  total: number;
  page: number;
  perPage: number;
}
```

#### `getService`
Gets a single service with full details including variants, commission config, and categories.

**Permission Required:** `can_view_services`

**Input:**
```typescript
{
  serviceId: string;
  salonId: string;
}
```

**Output:**
```typescript
Service & {
  variants: ServiceVariant[];
  commissionConfig: CommissionConfig | null;
  categories: ServiceCategory[];
  serviceRoom: ServiceRoom | null;
  createdBy: User;
  updatedBy: User | null;
}
```

### Actions

#### `createService`
Creates a new service for a salon.

**Permission Required:** `can_create_services`

**Input:**
```typescript
{
  salonId: string;
  name: string;
  description?: string;
  duration: number;                          // In minutes
  price: number;
  hasVariants?: boolean;                     // Default: false
  serviceRoomId?: string;
  costValue?: number;                        // Default: 0
  costValueType?: 'FIXED' | 'PERCENT';      // Default: 'FIXED'
  nonCommissionableValue?: number;           // Default: 0
  nonCommissionableValueType?: 'FIXED' | 'PERCENT'; // Default: 'FIXED'
  cardColor?: string;                        // Hex color for UI
}
```

**Validations:**
- Name is required and non-empty
- Duration must be greater than 0
- Price cannot be negative
- ServiceRoomId must exist and belong to the salon (if provided)

**Output:**
```typescript
Service
```

#### `updateService`
Updates an existing service.

**Permission Required:** `can_edit_services`

**Input:**
```typescript
{
  serviceId: string;
  salonId: string;
  name?: string;
  description?: string;
  duration?: number;
  price?: number;
  hasVariants?: boolean;
  serviceRoomId?: string;
  costValue?: number;
  costValueType?: 'FIXED' | 'PERCENT';
  nonCommissionableValue?: number;
  nonCommissionableValueType?: 'FIXED' | 'PERCENT';
  cardColor?: string;
}
```

**Validations:**
- Cannot update deleted service
- Same validation rules as create (when fields are provided)

**Output:**
```typescript
Service
```

#### `deleteService`
Soft deletes a service.

**Permission Required:** `can_delete_services`

**Input:**
```typescript
{
  serviceId: string;
  salonId: string;
}
```

**Business Rules:**
- Cannot delete service with active appointments (PENDING, CONFIRMED, or IN_SERVICE)
- Soft delete only (sets deletedAt timestamp)

**Output:**
```typescript
{
  success: boolean;
  message: string;
}
```

#### `createServiceVariant`
Creates a new variant for a service.

**Permission Required:** `can_create_services`

**Input:**
```typescript
{
  serviceId: string;
  salonId: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  costValue?: number;
  costValueType?: 'FIXED' | 'PERCENT';
  nonCommissionableValue?: number;
  nonCommissionableValueType?: 'FIXED' | 'PERCENT';
}
```

**Behavior:**
- Automatically sets `hasVariants = true` on the parent service
- Cannot add variant to deleted service

**Output:**
```typescript
ServiceVariant
```

#### `updateServiceVariant`
Updates an existing service variant.

**Permission Required:** `can_edit_services`

**Input:**
```typescript
{
  variantId: string;
  salonId: string;
  name?: string;
  description?: string;
  duration?: number;
  price?: number;
  costValue?: number;
  costValueType?: 'FIXED' | 'PERCENT';
  nonCommissionableValue?: number;
  nonCommissionableValueType?: 'FIXED' | 'PERCENT';
}
```

**Output:**
```typescript
ServiceVariant
```

#### `deleteServiceVariant`
Soft deletes a service variant.

**Permission Required:** `can_delete_services`

**Input:**
```typescript
{
  variantId: string;
  salonId: string;
}
```

**Business Rules:**
- Cannot delete variant with active appointments

**Output:**
```typescript
{
  success: boolean;
  message: string;
}
```

#### `manageCommissionConfig`
Creates or updates commission configuration for a service.

**Permission Required:** `can_manage_commissions`

**Input:**
```typescript
{
  serviceId: string;
  salonId: string;
  commissionType: string;
  baseValueType: 'FIXED' | 'PERCENT';
  baseValue: number;
  deductAssistantsFromProfessional?: boolean;  // Default: false
  soloValue: number;
  soloValueType: 'FIXED' | 'PERCENT';
  withAssistantValue: number;
  withAssistantValueType: 'FIXED' | 'PERCENT';
  asAssistantValue: number;
  asAssistantValueType: 'FIXED' | 'PERCENT';
}
```

**Validations:**
- All commission values must be non-negative
- Cannot configure commission for deleted service

**Output:**
```typescript
CommissionConfig
```

## Commission Calculator

The module includes a powerful commission calculation engine in `commissionCalculator.ts`.

### Functions

#### `calculateCommission`
Main function that calculates commission based on scenario.

```typescript
function calculateCommission(
  config: CommissionConfig,
  serviceData: ServiceData,
  scenario: 'SOLO' | 'WITH_ASSISTANT' | 'AS_ASSISTANT',
  assistantCount?: number
): CommissionResult
```

**Example:**
```typescript
import { calculateCommission } from './commissionCalculator';

const result = calculateCommission(
  commissionConfig,
  {
    price: 100,
    costValue: 10,
    costValueType: 'FIXED',
    nonCommissionableValue: 0,
    nonCommissionableValueType: 'FIXED',
  },
  'SOLO'
);

// result.commissionValue = commission amount
// result.commissionableBase = 90 (100 - 10 cost)
```

#### `calculateSoloCommission`
Calculates commission when professional works alone.

**Example Scenario:**
- Service price: R$ 100
- Cost: R$ 10 (FIXED)
- Solo commission: 50% (PERCENT)
- Result: R$ 45 commission (50% of R$ 90 commissionable base)

#### `calculateWithAssistantCommission`
Calculates commission when professional works with assistant(s).

**Example Scenario:**
- Service price: R$ 100
- Cost: R$ 10 (FIXED)
- With assistant commission: 40% (PERCENT)
- As assistant commission: 10% (PERCENT)
- Assistant count: 1
- Deduct assistants: true
- Result: R$ 27 commission (40% - 10% = 30% of R$ 90)

#### `calculateAsAssistantCommission`
Calculates commission when working as an assistant.

**Example Scenario:**
- Service price: R$ 100
- Cost: R$ 10 (FIXED)
- As assistant commission: 15% (PERCENT)
- Result: R$ 13.50 commission (15% of R$ 90)

### Commission Result Structure

```typescript
interface CommissionResult {
  grossValue: number;              // Original service price
  costValue: number;                // Actual cost deduction
  nonCommissionableValue: number;   // Non-commissionable deduction
  commissionableBase: number;       // Base for calculation (after deductions)
  commissionValue: number;          // Final commission amount
  commissionPercentage: number;     // Percentage of gross value
  scenario: 'SOLO' | 'WITH_ASSISTANT' | 'AS_ASSISTANT';
}
```

## Database Schema

### Service Model
```typescript
{
  id: string;
  salonId: string;
  createdByUserId: string;
  updatedByUserId?: string;
  serviceRoomId?: string;
  name: string;
  description?: string;
  hasVariants: boolean;
  duration: number;                          // Minutes
  price: number;
  costValue: number;
  costValueType: 'FIXED' | 'PERCENT';
  nonCommissionableValue: number;
  nonCommissionableValueType: 'FIXED' | 'PERCENT';
  cardColor?: string;
  deletedAt?: DateTime;
}
```

### ServiceVariant Model
```typescript
{
  id: string;
  serviceId: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  costValue: number;
  costValueType: 'FIXED' | 'PERCENT';
  nonCommissionableValue: number;
  nonCommissionableValueType: 'FIXED' | 'PERCENT';
  deletedAt?: DateTime;
}
```

### CommissionConfig Model
```typescript
{
  id: string;
  serviceId: string;                         // Unique
  commissionType: string;
  baseValueType: 'FIXED' | 'PERCENT';
  baseValue: number;
  deductAssistantsFromProfessional: boolean;
  soloValue: number;
  soloValueType: 'FIXED' | 'PERCENT';
  withAssistantValue: number;
  withAssistantValueType: 'FIXED' | 'PERCENT';
  asAssistantValue: number;
  asAssistantValueType: 'FIXED' | 'PERCENT';
}
```

## Usage Examples

### Create a Service
```typescript
import { createService } from 'wasp/client/operations';

const service = await createService({
  salonId: 'salon-123',
  name: 'Haircut',
  description: 'Standard haircut service',
  duration: 30,
  price: 50,
  costValue: 5,
  costValueType: 'FIXED',
});
```

### Add Service Variant
```typescript
import { createServiceVariant } from 'wasp/client/operations';

const variant = await createServiceVariant({
  serviceId: service.id,
  salonId: 'salon-123',
  name: 'Premium Haircut',
  duration: 45,
  price: 80,
});
```

### Configure Commission
```typescript
import { manageCommissionConfig } from 'wasp/client/operations';

const config = await manageCommissionConfig({
  serviceId: service.id,
  salonId: 'salon-123',
  commissionType: 'PERCENTAGE',
  baseValueType: 'PERCENT',
  baseValue: 100,
  soloValue: 50,
  soloValueType: 'PERCENT',
  withAssistantValue: 40,
  withAssistantValueType: 'PERCENT',
  asAssistantValue: 15,
  asAssistantValueType: 'PERCENT',
  deductAssistantsFromProfessional: true,
});
```

### Calculate Commission (Server-side)
```typescript
import { calculateCommission } from '@src/services/commissionCalculator';

// Solo scenario
const soloResult = calculateCommission(
  commissionConfig,
  serviceData,
  'SOLO'
);

// With assistant
const withAssistantResult = calculateCommission(
  commissionConfig,
  serviceData,
  'WITH_ASSISTANT',
  2  // 2 assistants
);
```

## Test Scenarios

### Service CRUD Tests
1. **Create service** - Valid inputs create service successfully
2. **Create with room** - Service created with service room reference
3. **Invalid duration** - Reject duration <= 0
4. **Invalid price** - Reject negative price
5. **Update service** - All fields update correctly
6. **Update deleted service** - Reject update of deleted service
7. **Delete service** - Soft delete sets deletedAt timestamp
8. **Delete with active appointments** - Reject deletion with active bookings
9. **Search services** - Find services by name and description
10. **Pagination** - Correctly paginate large service lists

### Variant Tests
11. **Create variant** - Variant created and hasVariants set to true
12. **Create on deleted service** - Reject variant creation on deleted service
13. **Update variant** - Variant updates correctly
14. **Delete variant** - Soft delete variant
15. **Delete variant with appointments** - Reject deletion with active bookings

### Commission Config Tests
16. **Create config** - New config created successfully
17. **Update config** - Existing config updated
18. **Negative values** - Reject negative commission values
19. **Config for deleted service** - Reject config management for deleted service

### Commission Calculator Tests
20. **Solo calculation** - Correct commission for solo professional
21. **With assistant (deduct)** - Professional commission minus assistant share
22. **With assistant (no deduct)** - Full professional commission
23. **As assistant** - Correct assistant commission
24. **FIXED values** - Fixed amount commission calculated correctly
25. **PERCENT values** - Percentage commission calculated correctly
26. **Mixed values** - FIXED cost with PERCENT commission
27. **Zero price** - Handle zero price gracefully
28. **100% solo** - Full commissionable base as commission
29. **50/50 split** - Equal split between professional and assistant
30. **Multiple assistants** - Correct deduction with 2+ assistants

## Error Handling

All operations throw `HttpError` with appropriate status codes:
- **401**: User not authenticated
- **403**: No permission or resource doesn't belong to salon
- **404**: Service/variant not found
- **400**: Validation error or business rule violation

## Security Considerations

- All operations check RBAC permissions
- Salon context validated for all resources
- Soft deletes prevent data loss
- Audit logging tracks all changes
- Input validation prevents invalid data
- Commission values cannot be negative

## Best Practices

1. **Service Design**: Group related services with variants rather than creating duplicate services
2. **Commission Config**: Set up commission rules that incentivize desired behaviors
3. **Cost Tracking**: Always configure cost values for accurate profit reporting
4. **Deletion**: Use soft deletes to maintain historical data integrity
5. **Room Assignment**: Assign service rooms to help with scheduling and conflict detection

## Future Enhancements

- Service categories with hierarchical structure
- Service packages (bundled services)
- Time-based pricing (peak hours)
- Dynamic pricing based on demand
- Multi-currency support
- Commission tiers based on performance
- Automated commission adjustments
- Integration with external booking systems

## Related Modules

- **Appointments**: Services are selected when creating appointments
- **Sales**: Services can be sold independently or as part of appointments
- **Reports**: Commission reports use the calculation engine
- **Clients**: Services track which clients use them most
- **Inventory**: Products can be linked to services for automatic stock deduction
