# Clients Module

## Overview
The Clients module manages client (customer) data for salons in the Glamo system. It provides CRUD operations with proper RBAC authorization and validation.

## Features
- List clients with search and pagination
- View client details with relationships (appointments, sales, credits)
- Create new clients with validation
- Update existing clients
- Soft delete clients (with active appointment check)
- Comprehensive audit logging

## Operations

### Queries

#### `listClients`
Lists all clients for a salon with optional search and pagination.

**Permission Required:** `can_view_clients`

**Input:**
```typescript
{
  salonId: string;
  search?: string;      // Search in name, email, phone, CPF, CNPJ
  page?: number;        // Default: 1
  perPage?: number;     // Default: 20
}
```

**Output:**
```typescript
{
  clients: Client[];
  total: number;
  page: number;
  perPage: number;
}
```

#### `getClient`
Gets a single client with full details and relationships.

**Permission Required:** `can_view_clients`

**Input:**
```typescript
{
  clientId: string;
  salonId: string;
}
```

**Output:**
```typescript
Client & {
  appointments: Appointment[] (last 10);
  sales: Sale[] (last 10);
  clientCredits: ClientCredit[] (last 10);
}
```

### Actions

#### `createClient`
Creates a new client for a salon.

**Permission Required:** `can_create_clients`

**Input:**
```typescript
{
  salonId: string;
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  cnpj?: string;
  observations?: string;
}
```

**Validations:**
- At least one of: email, phone, cpf, or cnpj must be provided
- Email must be unique per salon (if provided)

**Output:** Created Client object

#### `updateClient`
Updates an existing client.

**Permission Required:** `can_edit_clients`

**Input:**
```typescript
{
  clientId: string;
  salonId: string;
  name?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  cnpj?: string;
  observations?: string;
}
```

**Validations:**
- Email must be unique per salon (if changed)

**Output:** Updated Client object

#### `deleteClient`
Soft deletes a client.

**Permission Required:** `can_delete_clients`

**Input:**
```typescript
{
  clientId: string;
  salonId: string;
}
```

**Validations:**
- Cannot delete client with active appointments (PENDING, CONFIRMED, IN_SERVICE)

**Output:** Deleted Client object (with deletedAt timestamp)

## Database Schema

```prisma
model Client {
  id           String    @id @default(uuid())
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  salonId      String
  userId       String?
  name         String
  email        String?
  phone        String?
  cpf          String?
  cnpj         String?
  observations String?
  deletedAt    DateTime?
  
  salon         Salon          @relation(fields: [salonId], references: [id])
  appointments  Appointment[]
  sales         Sale[]
  clientCredits ClientCredit[]
  
  @@unique([salonId, email])
}
```

## Usage Examples

### List Clients
```typescript
import { listClients } from 'wasp/client/operations';

// List all clients
const result = await listClients({
  salonId: 'salon-uuid',
});

// Search clients
const searchResult = await listClients({
  salonId: 'salon-uuid',
  search: 'john',
  page: 1,
  perPage: 10,
});
```

### Get Client Details
```typescript
import { getClient } from 'wasp/client/operations';

const client = await getClient({
  clientId: 'client-uuid',
  salonId: 'salon-uuid',
});

// Access relationships
console.log(client.appointments);
console.log(client.sales);
console.log(client.clientCredits);
```

### Create Client
```typescript
import { createClient } from 'wasp/client/operations';

const newClient = await createClient({
  salonId: 'salon-uuid',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+5511999999999',
});
```

### Update Client
```typescript
import { updateClient } from 'wasp/client/operations';

const updated = await updateClient({
  clientId: 'client-uuid',
  salonId: 'salon-uuid',
  phone: '+5511988888888',
  observations: 'Prefers afternoon appointments',
});
```

### Delete Client
```typescript
import { deleteClient } from 'wasp/client/operations';

try {
  await deleteClient({
    clientId: 'client-uuid',
    salonId: 'salon-uuid',
  });
} catch (error) {
  // Will throw error if client has active appointments
  console.error(error.message);
}
```

## Error Handling

All operations throw `HttpError` with appropriate status codes:

- **401**: User not authenticated
- **403**: No permission or access denied
- **404**: Client not found
- **400**: Validation error (duplicate email, missing required fields, active appointments)

## Audit Logging

All operations automatically log actions to the `Log` table:
- CREATE: When a new client is created
- UPDATE: When a client is updated (includes before/after values)
- DELETE: When a client is soft deleted

## RBAC Permissions

The following permissions are used:
- `can_view_clients`: Required to list and view clients
- `can_create_clients`: Required to create new clients
- `can_edit_clients`: Required to update existing clients
- `can_delete_clients`: Required to delete clients

## Testing

To test the Clients module:

1. Ensure you have a test salon with proper RBAC setup
2. Create a user with appropriate permissions
3. Test each operation with valid and invalid inputs
4. Verify error handling for edge cases

### Test Scenarios

1. **Create client with minimal data** (only name + email)
2. **Create client with all fields**
3. **Try to create duplicate email** (should fail)
4. **Update client email to existing email** (should fail)
5. **Search clients by name, email, phone**
6. **Pagination works correctly**
7. **Get client with relationships**
8. **Try to delete client with active appointments** (should fail)
9. **Delete client successfully**
10. **Verify soft delete** (deletedAt is set)
11. **Permission checks work** (unauthorized user gets 403)
12. **Audit logs are created** for all operations
