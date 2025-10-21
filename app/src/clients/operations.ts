import { HttpError } from 'wasp/server';
import type { 
  ListClients, 
  GetClient, 
  CreateClient, 
  UpdateClient, 
  DeleteClient 
} from 'wasp/server/operations';
import { requirePermission } from '../rbac/requirePermission';

// ============================================================================
// Types
// ============================================================================

type ListClientsInput = {
  salonId: string;
  search?: string;
  page?: number;
  perPage?: number;
};

type ListClientsOutput = {
  clients: any[];
  total: number;
  page: number;
  perPage: number;
};

type GetClientInput = {
  clientId: string;
  salonId: string;
};

type CreateClientInput = {
  salonId: string;
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  cnpj?: string;
  observations?: string;
};

type UpdateClientInput = {
  clientId: string;
  salonId: string;
  name?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  cnpj?: string;
  observations?: string;
};

type DeleteClientInput = {
  clientId: string;
  salonId: string;
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Lists all clients for a salon with optional search and pagination.
 * Permission required: can_view_clients
 */
export const listClients: ListClients<ListClientsInput, ListClientsOutput> = async (
  { salonId, search = '', page = 1, perPage = 20 },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  // Check permission
  await requirePermission(context.user, salonId, 'can_view_clients', context.entities);

  // Build search filter
  const searchFilter = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search, mode: 'insensitive' as const } },
          { cpf: { contains: search, mode: 'insensitive' as const } },
          { cnpj: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const where = {
    salonId,
    deletedAt: null,
    ...searchFilter,
  };

  // Get total count
  const total = await context.entities.Client.count({ where });

  // Get paginated clients
  const clients = await context.entities.Client.findMany({
    where,
    skip: (page - 1) * perPage,
    take: perPage,
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      cpf: true,
      cnpj: true,
      observations: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    clients,
    total,
    page,
    perPage,
  };
};

/**
 * Gets a single client with full details and relationships.
 * Permission required: can_view_clients
 */
export const getClient: GetClient<GetClientInput, any> = async (
  { clientId, salonId },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  // Check permission
  await requirePermission(context.user, salonId, 'can_view_clients', context.entities);

  // Get client with relationships
  const client = await context.entities.Client.findFirst({
    where: {
      id: clientId,
      salonId,
      deletedAt: null,
    },
    include: {
      appointments: {
        where: { deletedAt: null },
        orderBy: { startAt: 'desc' },
        take: 10,
        select: {
          id: true,
          startAt: true,
          endAt: true,
          status: true,
          professional: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      sales: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          createdAt: true,
          finalTotal: true,
          status: true,
        },
      },
      clientCredits: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!client) {
    throw new HttpError(404, 'Client not found');
  }

  return client;
};

// ============================================================================
// Actions
// ============================================================================

/**
 * Creates a new client for a salon.
 * Permission required: can_create_clients
 * Validates:
 * - Email uniqueness per salon (if provided)
 * - At least one of: email, phone, cpf, or cnpj
 */
export const createClient: CreateClient<CreateClientInput, any> = async (
  { salonId, name, email, phone, cpf, cnpj, observations },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  // Check permission
  await requirePermission(context.user, salonId, 'can_create_clients', context.entities);

  // Validate at least one contact method
  if (!email && !phone && !cpf && !cnpj) {
    throw new HttpError(
      400,
      'Client must have at least one of: email, phone, CPF, or CNPJ'
    );
  }

  // Check if email already exists for this salon (if email provided)
  if (email) {
    const existingClient = await context.entities.Client.findFirst({
      where: {
        salonId,
        email,
        deletedAt: null,
      },
    });

    if (existingClient) {
      throw new HttpError(400, 'A client with this email already exists in this salon');
    }
  }

  // Create client
  const client = await context.entities.Client.create({
    data: {
      salonId,
      name,
      email,
      phone,
      cpf,
      cnpj,
      observations,
    },
  });

  // Log creation
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Client',
      entityId: client.id,
      action: 'CREATE',
      before: null,
      after: { name, email, phone, cpf, cnpj },
    },
  });

  return client;
};

/**
 * Updates an existing client.
 * Permission required: can_edit_clients
 * Validates:
 * - Email uniqueness per salon (if changed)
 */
export const updateClient: UpdateClient<UpdateClientInput, any> = async (
  { clientId, salonId, name, email, phone, cpf, cnpj, observations },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  // Check permission
  await requirePermission(context.user, salonId, 'can_edit_clients', context.entities);

  // Get existing client
  const existingClient = await context.entities.Client.findFirst({
    where: {
      id: clientId,
      salonId,
      deletedAt: null,
    },
  });

  if (!existingClient) {
    throw new HttpError(404, 'Client not found');
  }

  // Check if email is being changed and already exists
  if (email && email !== existingClient.email) {
    const duplicateClient = await context.entities.Client.findFirst({
      where: {
        salonId,
        email,
        deletedAt: null,
        id: { not: clientId },
      },
    });

    if (duplicateClient) {
      throw new HttpError(400, 'A client with this email already exists in this salon');
    }
  }

  // Build update data
  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (phone !== undefined) updateData.phone = phone;
  if (cpf !== undefined) updateData.cpf = cpf;
  if (cnpj !== undefined) updateData.cnpj = cnpj;
  if (observations !== undefined) updateData.observations = observations;

  // Update client
  const updatedClient = await context.entities.Client.update({
    where: { id: clientId },
    data: updateData,
  });

  // Log update
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Client',
      entityId: clientId,
      action: 'UPDATE',
      before: {
        name: existingClient.name,
        email: existingClient.email,
        phone: existingClient.phone,
        cpf: existingClient.cpf,
        cnpj: existingClient.cnpj,
      },
      after: updateData,
    },
  });

  return updatedClient;
};

/**
 * Soft deletes a client.
 * Permission required: can_delete_clients
 * Validates:
 * - No active appointments exist for this client
 */
export const deleteClient: DeleteClient<DeleteClientInput, any> = async (
  { clientId, salonId },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  // Check permission
  await requirePermission(context.user, salonId, 'can_delete_clients', context.entities);

  // Get existing client
  const existingClient = await context.entities.Client.findFirst({
    where: {
      id: clientId,
      salonId,
      deletedAt: null,
    },
  });

  if (!existingClient) {
    throw new HttpError(404, 'Client not found');
  }

  // Check for active appointments
  const activeAppointments = await context.entities.Appointment.count({
    where: {
      clientId,
      deletedAt: null,
      status: {
        in: ['PENDING', 'CONFIRMED', 'IN_SERVICE'],
      },
    },
  });

  if (activeAppointments > 0) {
    throw new HttpError(
      400,
      'Cannot delete client with active appointments. Please cancel or complete them first.'
    );
  }

  // Soft delete client
  const deletedClient = await context.entities.Client.update({
    where: { id: clientId },
    data: { deletedAt: new Date() },
  });

  // Log deletion
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Client',
      entityId: clientId,
      action: 'DELETE',
      before: {
        name: existingClient.name,
        email: existingClient.email,
      },
      after: null,
    },
  });

  return deletedClient;
};
