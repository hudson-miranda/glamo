import { HttpError } from 'wasp/server';
import type { Client } from 'wasp/entities';
import { requirePermission } from '../rbac/requirePermission';

// Types
type ClientInput = {
  salonId: string;
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  cnpj?: string;
  observations?: string;
};

type ClientUpdateInput = Partial<Omit<ClientInput, 'salonId'>> & {
  id: string;
  salonId: string;
};

type ListClientsArgs = {
  salonId: string;
  search?: string;
  page?: number;
  perPage?: number;
};

type GetClientArgs = {
  id: string;
  salonId: string;
};

type DeleteClientArgs = {
  id: string;
  salonId: string;
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Lists clients for a specific salon with optional search and pagination.
 */
export const listClients = async (
  args: ListClientsArgs,
  context: any
): Promise<{ clients: Client[]; total: number }> => {
  const { salonId, search, page = 1, perPage = 20 } = args;

  // Check permission
  await requirePermission(context.user, salonId, 'can_view_clients', context.entities);

  const where: any = {
    salonId,
    deletedAt: null,
  };

  // Add search filter if provided
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
      { cpf: { contains: search, mode: 'insensitive' } },
      { cnpj: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Get total count
  const total = await context.entities.Client.count({ where });

  // Get paginated clients
  const clients = await context.entities.Client.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * perPage,
    take: perPage,
    include: {
      appointments: {
        where: { deletedAt: null },
        orderBy: { startAt: 'desc' },
        take: 5,
      },
      sales: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });

  return { clients, total };
};

/**
 * Gets a single client by ID with full details.
 */
export const getClient = async (
  args: GetClientArgs,
  context: any
): Promise<Client> => {
  const { id, salonId } = args;

  // Check permission
  await requirePermission(context.user, salonId, 'can_view_clients', context.entities);

  const client = await context.entities.Client.findFirst({
    where: {
      id,
      salonId,
      deletedAt: null,
    },
    include: {
      appointments: {
        where: { deletedAt: null },
        orderBy: { startAt: 'desc' },
        include: {
          professional: {
            select: { id: true, name: true, email: true },
          },
          services: {
            include: {
              service: true,
              variant: true,
            },
          },
        },
      },
      sales: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        include: {
          employee: {
            select: { id: true, name: true, email: true },
          },
          saleServices: {
            include: {
              service: true,
              variant: true,
            },
          },
          saleProducts: {
            include: {
              product: true,
            },
          },
        },
      },
      clientCredits: {
        orderBy: { createdAt: 'desc' },
        include: {
          professional: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  if (!client) {
    throw new HttpError(404, 'Client not found');
  }

  return client;
};

// ============================================================================
// ACTIONS
// ============================================================================

/**
 * Creates a new client in the salon.
 */
export const createClient = async (
  args: ClientInput,
  context: any
): Promise<Client> => {
  const { salonId, name, email, phone, cpf, cnpj, observations } = args;

  // Check permission
  await requirePermission(context.user, salonId, 'can_create_clients', context.entities);

  // Validate email is unique per salon if provided
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

  // Validate name is required
  if (!name || name.trim().length === 0) {
    throw new HttpError(400, 'Client name is required');
  }

  // Create client
  const client = await context.entities.Client.create({
    data: {
      salonId,
      name: name.trim(),
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      cpf: cpf?.trim() || null,
      cnpj: cnpj?.trim() || null,
      observations: observations?.trim() || null,
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
      after: client,
    },
  });

  return client;
};

/**
 * Updates an existing client.
 */
export const updateClient = async (
  args: ClientUpdateInput,
  context: any
): Promise<Client> => {
  const { id, salonId, name, email, phone, cpf, cnpj, observations } = args;

  // Check permission
  await requirePermission(context.user, salonId, 'can_edit_clients', context.entities);

  // Get existing client
  const existingClient = await context.entities.Client.findFirst({
    where: {
      id,
      salonId,
      deletedAt: null,
    },
  });

  if (!existingClient) {
    throw new HttpError(404, 'Client not found');
  }

  // Validate email is unique per salon if changing email
  if (email && email !== existingClient.email) {
    const duplicateClient = await context.entities.Client.findFirst({
      where: {
        salonId,
        email,
        deletedAt: null,
        id: { not: id },
      },
    });

    if (duplicateClient) {
      throw new HttpError(400, 'A client with this email already exists in this salon');
    }
  }

  // Build update data
  const updateData: any = {};
  if (name !== undefined) updateData.name = name.trim();
  if (email !== undefined) updateData.email = email?.trim() || null;
  if (phone !== undefined) updateData.phone = phone?.trim() || null;
  if (cpf !== undefined) updateData.cpf = cpf?.trim() || null;
  if (cnpj !== undefined) updateData.cnpj = cnpj?.trim() || null;
  if (observations !== undefined) updateData.observations = observations?.trim() || null;

  // Update client
  const updatedClient = await context.entities.Client.update({
    where: { id },
    data: updateData,
  });

  // Log update
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Client',
      entityId: id,
      action: 'UPDATE',
      before: existingClient,
      after: updatedClient,
    },
  });

  return updatedClient;
};

/**
 * Soft deletes a client (marks as deleted without removing from database).
 */
export const deleteClient = async (
  args: DeleteClientArgs,
  context: any
): Promise<{ success: boolean }> => {
  const { id, salonId } = args;

  // Check permission
  await requirePermission(context.user, salonId, 'can_delete_clients', context.entities);

  // Get existing client
  const existingClient = await context.entities.Client.findFirst({
    where: {
      id,
      salonId,
      deletedAt: null,
    },
  });

  if (!existingClient) {
    throw new HttpError(404, 'Client not found');
  }

  // Check if client has active appointments
  const activeAppointments = await context.entities.Appointment.count({
    where: {
      clientId: id,
      deletedAt: null,
      status: {
        in: ['PENDING', 'CONFIRMED', 'IN_SERVICE'],
      },
    },
  });

  if (activeAppointments > 0) {
    throw new HttpError(
      400,
      'Cannot delete client with active appointments. Please cancel or complete appointments first.'
    );
  }

  // Soft delete client
  await context.entities.Client.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });

  // Log deletion
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Client',
      entityId: id,
      action: 'DELETE',
      before: existingClient,
      after: null,
    },
  });

  return { success: true };
};
