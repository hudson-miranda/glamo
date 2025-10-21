# Clients Module

## Overview
The Clients module manages client information for salons in the Glamo system. It provides CRUD operations with proper RBAC authorization and audit logging.

## Features
- Create, read, update, and soft delete clients
- Unique email validation per salon
- Optional CPF/CNPJ fields for Brazilian tax identification
- Search functionality across multiple fields
- Pagination support
- Relationship tracking with appointments, sales, and credits
- Audit logging for all operations
- Prevents deletion of clients with active appointments

## API Operations

### Queries

#### `listClients`
Lists clients for a specific salon with optional search and pagination.

**Permission Required:** `can_view_clients`

**Arguments:**
```typescript
{
  salonId: string;
  search?: string;      // Searches across name, email, phone, CPF, CNPJ
  page?: number;        // Default: 1
  perPage?: number;     // Default: 20
}
```

**Returns:**
```typescript
{
  clients: Client[];
  total: number;
}
```

#### `getClient`
Gets a single client with full details including appointments, sales, and credits.

**Permission Required:** `can_view_clients`

**Arguments:**
```typescript
{
  id: string;
  salonId: string;
}
```

**Returns:** `Client` with included relationships

### Actions

#### `createClient`
Creates a new client in the salon.

**Permission Required:** `can_create_clients`

**Arguments:**
```typescript
{
  salonId: string;
  name: string;           // Required
  email?: string;         // Must be unique per salon
  phone?: string;
  cpf?: string;           // Brazilian tax ID
  cnpj?: string;          // Brazilian company tax ID
  observations?: string;
}
```

**Returns:** Created `Client`

**Validations:**
- Name is required and non-empty
- Email must be unique per salon (if provided)
- Logs creation action

#### `updateClient`
Updates an existing client.

**Permission Required:** `can_edit_clients`

**Arguments:**
```typescript
{
  id: string;
  salonId: string;
  name?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  cnpj?: string;
  observations?: string;
}
```

**Returns:** Updated `Client`

**Validations:**
- Client must exist and not be deleted
- Email uniqueness check (if changing email)
- Logs update action with before/after state

#### `deleteClient`
Soft deletes a client (marks as deleted without removing from database).

**Permission Required:** `can_delete_clients`

**Arguments:**
```typescript
{
  id: string;
  salonId: string;
}
```

**Returns:** `{ success: boolean }`

**Validations:**
- Client must exist and not be deleted
- Cannot delete client with active appointments (PENDING, CONFIRMED, IN_SERVICE)
- Logs deletion action

## Usage Examples

### Creating a Client
```typescript
import { createClient } from 'wasp/client/operations';

const newClient = await createClient({
  salonId: 'salon-123',
  name: 'Maria Silva',
  email: 'maria@example.com',
  phone: '+55 11 98765-4321',
  cpf: '123.456.789-00',
  observations: 'Prefers morning appointments'
});
```

### Listing Clients with Search
```typescript
import { listClients } from 'wasp/client/operations';

const { clients, total } = await listClients({
  salonId: 'salon-123',
  search: 'maria',
  page: 1,
  perPage: 20
});
```

### Getting Client Details
```typescript
import { getClient } from 'wasp/client/operations';

const client = await getClient({
  id: 'client-123',
  salonId: 'salon-123'
});

// Access appointments
console.log(client.appointments);
// Access sales history
console.log(client.sales);
// Access credits
console.log(client.clientCredits);
```

### Updating a Client
```typescript
import { updateClient } from 'wasp/client/operations';

const updated = await updateClient({
  id: 'client-123',
  salonId: 'salon-123',
  phone: '+55 11 91234-5678',
  observations: 'Updated contact info'
});
```

### Deleting a Client
```typescript
import { deleteClient } from 'wasp/client/operations';

await deleteClient({
  id: 'client-123',
  salonId: 'salon-123'
});
```

## Error Handling

All operations may throw `HttpError` with the following status codes:

- **401 Unauthorized:** User not authenticated
- **403 Forbidden:** Missing required permission or wrong salon context
- **404 Not Found:** Client not found
- **400 Bad Request:** Validation errors (duplicate email, empty name, active appointments, etc.)

## Database Schema

The Client model includes:
- `id` (UUID, primary key)
- `salonId` (FK to Salon)
- `userId` (optional FK to User, for linked user accounts)
- `name` (required)
- `email` (optional, unique per salon)
- `phone` (optional)
- `cpf` (optional, Brazilian tax ID)
- `cnpj` (optional, Brazilian company tax ID)
- `observations` (optional notes)
- `createdAt`, `updatedAt`, `deletedAt` (timestamps)

## Relationships
- Belongs to one Salon
- Can be linked to one User (optional)
- Has many Appointments
- Has many Sales
- Has many ClientCredits

## Security Considerations
- All operations require appropriate RBAC permissions
- Email uniqueness is scoped per salon (multi-tenant isolation)
- Soft delete prevents data loss and maintains referential integrity
- Active appointments block deletion to prevent orphaned records
- All operations are logged for audit trail

## Future Enhancements
- Client import/export functionality
- Duplicate detection and merging
- Client tags/categories
- Birthday reminders
- Loyalty program integration
- Communication preferences (email, SMS, WhatsApp opt-in/out)
