import { HttpError } from 'wasp/server';
import { Prisma } from '@prisma/client';
import type { 
  ListClients, 
  GetClient, 
  CreateClient, 
  UpdateClient, 
  DeleteClient,
  GetClientNotes,
  AddClientNote,
  UpdateClientNote,
  DeleteClientNote,
  AddClientTag,
  RemoveClientTag,
  GetClientDocuments,
  UploadClientDocument,
  DeleteClientDocument,
  GetClientHistory
} from 'wasp/server/operations';
import { requirePermission } from '../rbac/requirePermission';

// ============================================================================
// Types
// ============================================================================

type ListClientsInput = {
  salonId: string;
  search?: string;
  status?: string;
  clientType?: string;
  tags?: string[];
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
  birthDate?: string;
  gender?: string;
  profilePhotoUrl?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  preferredContactMethod?: string;
  emailMarketingConsent?: boolean;
  smsMarketingConsent?: boolean;
  whatsappMarketingConsent?: boolean;
  dataProcessingConsent?: boolean;
  status?: string;
  clientType?: string;
  referralSource?: string;
  referralDetails?: string;
  instagramHandle?: string;
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
  birthDate?: string;
  gender?: string;
  profilePhotoUrl?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  preferredContactMethod?: string;
  emailMarketingConsent?: boolean;
  smsMarketingConsent?: boolean;
  whatsappMarketingConsent?: boolean;
  dataProcessingConsent?: boolean;
  status?: string;
  clientType?: string;
  referralSource?: string;
  referralDetails?: string;
  instagramHandle?: string;
  observations?: string;
};

type DeleteClientInput = {
  clientId: string;
  salonId: string;
};

type GetClientNotesInput = {
  clientId: string;
  salonId: string;
};

type AddClientNoteInput = {
  clientId: string;
  salonId: string;
  title?: string;
  content: string;
  noteType?: string;
  isAlert?: boolean;
  isInternal?: boolean;
};

type UpdateClientNoteInput = {
  noteId: string;
  clientId: string;
  salonId: string;
  title?: string;
  content?: string;
  noteType?: string;
  isAlert?: boolean;
  isInternal?: boolean;
};

type DeleteClientNoteInput = {
  noteId: string;
  clientId: string;
  salonId: string;
};

type AddClientTagInput = {
  clientId: string;
  salonId: string;
  name: string;
  color?: string;
};

type RemoveClientTagInput = {
  tagId: string;
  clientId: string;
  salonId: string;
};

type GetClientDocumentsInput = {
  clientId: string;
  salonId: string;
};

type UploadClientDocumentInput = {
  clientId: string;
  salonId: string;
  title: string;
  description?: string;
  documentType: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
};

type DeleteClientDocumentInput = {
  documentId: string;
  clientId: string;
  salonId: string;
};

type GetClientHistoryInput = {
  clientId: string;
  salonId: string;
  page?: number;
  perPage?: number;
};

// ============================================================================
// Helper Functions
// ============================================================================

async function createHistoryRecord(
  context: any,
  clientId: string,
  salonId: string,
  action: string,
  field?: string,
  oldValue?: string,
  newValue?: string,
  metadata?: any
) {
  await context.entities.ClientHistory.create({
    data: {
      clientId,
      salonId,
      userId: context.user?.id,
      action,
      field,
      oldValue,
      newValue,
      metadata,
    },
  });
}

// ============================================================================
// Queries
// ============================================================================

/**
 * Lists all clients for a salon with advanced filters and pagination.
 * Permission required: can_view_clients
 */
export const listClients: ListClients<ListClientsInput, ListClientsOutput> = async (
  { salonId, search = '', status, clientType, tags = [], page = 1, perPage = 20 },
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
          { instagramHandle: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  // Build filters
  const filters: any = {
    salonId,
    deletedAt: null,
    ...searchFilter,
  };

  if (status) {
    filters.status = status;
  }

  if (clientType) {
    filters.clientType = clientType;
  }

  if (tags.length > 0) {
    filters.tags = {
      some: {
        name: {
          in: tags,
        },
      },
    };
  }

  // Get total count
  const total = await context.entities.Client.count({ where: filters });

  // Get paginated clients with tags
  const clients = await context.entities.Client.findMany({
    where: filters,
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
      status: true,
      clientType: true,
      profilePhotoUrl: true,
      totalVisits: true,
      totalSpent: true,
      lastVisitDate: true,
      createdAt: true,
      updatedAt: true,
      tags: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
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
      tags: {
        orderBy: { createdAt: 'desc' },
      },
      notes: {
        where: { isInternal: false },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      documents: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      appointments: {
        where: { deletedAt: null },
        orderBy: { startAt: 'desc' },
        take: 10,
        select: {
          id: true,
          startAt: true,
          endAt: true,
          status: true,
          totalPrice: true,
          professional: {
            select: {
              id: true,
              name: true,
            },
          },
          services: {
            include: {
              service: {
                select: {
                  id: true,
                  name: true,
                },
              },
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

/**
 * Gets client notes with pagination
 * Permission required: can_view_clients
 */
export const getClientNotes: GetClientNotes<GetClientNotesInput, any> = async (
  { clientId, salonId },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_view_clients', context.entities);

  const notes = await context.entities.ClientNote.findMany({
    where: {
      clientId,
      salonId,
    },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return notes;
};

/**
 * Gets client documents
 * Permission required: can_view_clients
 */
export const getClientDocuments: GetClientDocuments<GetClientDocumentsInput, any> = async (
  { clientId, salonId },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_view_clients', context.entities);

  const documents = await context.entities.ClientDocument.findMany({
    where: {
      clientId,
      salonId,
      deletedAt: null,
    },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return documents;
};

/**
 * Gets client history with pagination
 * Permission required: can_view_clients
 */
export const getClientHistory: GetClientHistory<GetClientHistoryInput, any> = async (
  { clientId, salonId, page = 1, perPage = 50 },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_view_clients', context.entities);

  const total = await context.entities.ClientHistory.count({
    where: { clientId, salonId },
  });

  const history = await context.entities.ClientHistory.findMany({
    where: {
      clientId,
      salonId,
    },
    skip: (page - 1) * perPage,
    take: perPage,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return {
    history,
    total,
    page,
    perPage,
  };
};

// ============================================================================
// Actions
// ============================================================================

/**
 * Creates a new client for a salon.
 * Permission required: can_create_clients
 */
export const createClient: CreateClient<CreateClientInput, any> = async (
  input,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  const { salonId, ...data } = input;

  // Check permission
  await requirePermission(context.user, salonId, 'can_create_clients', context.entities);

  // Validate at least one contact method
  if (!data.email && !data.phone && !data.cpf && !data.cnpj) {
    throw new HttpError(
      400,
      'Client must have at least one of: email, phone, CPF, or CNPJ'
    );
  }

  // Check if email already exists for this salon (if email provided)
  if (data.email) {
    const existingClient = await context.entities.Client.findFirst({
      where: {
        salonId,
        email: data.email,
        deletedAt: null,
      },
    });

    if (existingClient) {
      throw new HttpError(400, 'A client with this email already exists in this salon');
    }
  }

  // Parse date if provided
  const clientData: any = {
    ...data,
    salonId,
  };

  if (data.birthDate) {
    clientData.birthDate = new Date(data.birthDate);
  }

  if (data.emailMarketingConsent || data.smsMarketingConsent || data.whatsappMarketingConsent) {
    clientData.consentDate = new Date();
  }

  // Create client
  const client = await context.entities.Client.create({
    data: clientData,
  });

  // Create history record
  await createHistoryRecord(
    context,
    client.id,
    salonId,
    'CREATED',
    undefined,
    undefined,
    undefined,
    { clientName: data.name }
  );

  // Log creation
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Client',
      entityId: client.id,
      action: 'CREATE',
      before: Prisma.DbNull,
      after: { name: data.name, email: data.email },
    },
  });

  return client;
};

/**
 * Updates an existing client.
 * Permission required: can_edit_clients
 */
export const updateClient: UpdateClient<UpdateClientInput, any> = async (
  input,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  const { clientId, salonId, ...updateData } = input;

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
  if (updateData.email && updateData.email !== existingClient.email) {
    const duplicateClient = await context.entities.Client.findFirst({
      where: {
        salonId,
        email: updateData.email,
        deletedAt: null,
        id: { not: clientId },
      },
    });

    if (duplicateClient) {
      throw new HttpError(400, 'A client with this email already exists in this salon');
    }
  }

  // Parse date if provided
  const clientUpdateData: any = { ...updateData };
  
  if (updateData.birthDate) {
    clientUpdateData.birthDate = new Date(updateData.birthDate);
  }

  // Update client
  const updatedClient = await context.entities.Client.update({
    where: { id: clientId },
    data: clientUpdateData,
  });

  // Create history records for changed fields
  for (const [field, newValue] of Object.entries(updateData)) {
    if (newValue !== undefined) {
      const oldValue = (existingClient as any)[field];
      if (oldValue !== newValue) {
        await createHistoryRecord(
          context,
          clientId,
          salonId,
          'UPDATED',
          field,
          String(oldValue),
          String(newValue)
        );
      }
    }
  }

  // Log update
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Client',
      entityId: clientId,
      action: 'UPDATE',
      before: { name: existingClient.name, email: existingClient.email },
      after: updateData,
    },
  });

  return updatedClient;
};

/**
 * Soft deletes a client.
 * Permission required: can_delete_clients
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

  // Create history record
  await createHistoryRecord(
    context,
    clientId,
    salonId,
    'UPDATED',
    'deletedAt',
    undefined,
    new Date().toISOString(),
    { deletedBy: context.user.name }
  );

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
      after: Prisma.DbNull,
    },
  });

  return deletedClient;
};

/**
 * Adds a note to a client.
 * Permission required: can_edit_clients
 */
export const addClientNote: AddClientNote<AddClientNoteInput, any> = async (
  { clientId, salonId, title, content, noteType = 'GENERAL', isAlert = false, isInternal = false },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_edit_clients', context.entities);

  // Verify client exists
  const client = await context.entities.Client.findFirst({
    where: { id: clientId, salonId, deletedAt: null },
  });

  if (!client) {
    throw new HttpError(404, 'Client not found');
  }

  // Create note
  const note = await context.entities.ClientNote.create({
    data: {
      clientId,
      salonId,
      userId: context.user.id,
      title,
      content,
      noteType,
      isAlert,
      isInternal,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Create history record
  await createHistoryRecord(
    context,
    clientId,
    salonId,
    'NOTE_ADDED',
    undefined,
    undefined,
    undefined,
    { noteType, title }
  );

  // Log action
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'ClientNote',
      entityId: note.id,
      action: 'CREATE',
      before: Prisma.DbNull,
      after: { clientId, content, noteType },
    },
  });

  return note;
};

/**
 * Updates a client note.
 * Permission required: can_edit_clients
 */
export const updateClientNote: UpdateClientNote<UpdateClientNoteInput, any> = async (
  { noteId, clientId, salonId, ...updateData },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_edit_clients', context.entities);

  // Verify note exists and belongs to client
  const existingNote = await context.entities.ClientNote.findFirst({
    where: { id: noteId, clientId, salonId },
  });

  if (!existingNote) {
    throw new HttpError(404, 'Note not found');
  }

  // Update note
  const updatedNote = await context.entities.ClientNote.update({
    where: { id: noteId },
    data: updateData,
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Log action
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'ClientNote',
      entityId: noteId,
      action: 'UPDATE',
      before: { content: existingNote.content },
      after: updateData,
    },
  });

  return updatedNote;
};

/**
 * Deletes a client note.
 * Permission required: can_edit_clients
 */
export const deleteClientNote: DeleteClientNote<DeleteClientNoteInput, any> = async (
  { noteId, clientId, salonId },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_edit_clients', context.entities);

  // Verify note exists
  const note = await context.entities.ClientNote.findFirst({
    where: { id: noteId, clientId, salonId },
  });

  if (!note) {
    throw new HttpError(404, 'Note not found');
  }

  // Delete note
  await context.entities.ClientNote.delete({
    where: { id: noteId },
  });

  // Log action
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'ClientNote',
      entityId: noteId,
      action: 'DELETE',
      before: { content: note.content },
      after: Prisma.DbNull,
    },
  });

  return { success: true };
};

/**
 * Adds a tag to a client.
 * Permission required: can_edit_clients
 */
export const addClientTag: AddClientTag<AddClientTagInput, any> = async (
  { clientId, salonId, name, color },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_edit_clients', context.entities);

  // Verify client exists
  const client = await context.entities.Client.findFirst({
    where: { id: clientId, salonId, deletedAt: null },
  });

  if (!client) {
    throw new HttpError(404, 'Client not found');
  }

  // Check if tag already exists
  const existingTag = await context.entities.ClientTag.findFirst({
    where: { clientId, salonId, name },
  });

  if (existingTag) {
    throw new HttpError(400, 'Tag already exists for this client');
  }

  // Create tag
  const tag = await context.entities.ClientTag.create({
    data: {
      clientId,
      salonId,
      name,
      color,
    },
  });

  // Create history record
  await createHistoryRecord(
    context,
    clientId,
    salonId,
    'TAG_ADDED',
    undefined,
    undefined,
    undefined,
    { tagName: name }
  );

  // Log action
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'ClientTag',
      entityId: tag.id,
      action: 'CREATE',
      before: Prisma.DbNull,
      after: { clientId, name },
    },
  });

  return tag;
};

/**
 * Removes a tag from a client.
 * Permission required: can_edit_clients
 */
export const removeClientTag: RemoveClientTag<RemoveClientTagInput, any> = async (
  { tagId, clientId, salonId },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_edit_clients', context.entities);

  // Verify tag exists
  const tag = await context.entities.ClientTag.findFirst({
    where: { id: tagId, clientId, salonId },
  });

  if (!tag) {
    throw new HttpError(404, 'Tag not found');
  }

  // Delete tag
  await context.entities.ClientTag.delete({
    where: { id: tagId },
  });

  // Create history record
  await createHistoryRecord(
    context,
    clientId,
    salonId,
    'TAG_REMOVED',
    undefined,
    undefined,
    undefined,
    { tagName: tag.name }
  );

  // Log action
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'ClientTag',
      entityId: tagId,
      action: 'DELETE',
      before: { name: tag.name },
      after: Prisma.DbNull,
    },
  });

  return { success: true };
};

/**
 * Uploads a document for a client.
 * Permission required: can_edit_clients
 */
export const uploadClientDocument: UploadClientDocument<UploadClientDocumentInput, any> = async (
  input,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  const { clientId, salonId, ...docData } = input;

  await requirePermission(context.user, salonId, 'can_edit_clients', context.entities);

  // Verify client exists
  const client = await context.entities.Client.findFirst({
    where: { id: clientId, salonId, deletedAt: null },
  });

  if (!client) {
    throw new HttpError(404, 'Client not found');
  }

  // Create document record
  const document = await context.entities.ClientDocument.create({
    data: {
      clientId,
      salonId,
      userId: context.user.id,
      ...docData,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Create history record
  await createHistoryRecord(
    context,
    clientId,
    salonId,
    'DOCUMENT_UPLOADED',
    undefined,
    undefined,
    undefined,
    { documentType: docData.documentType, title: docData.title }
  );

  // Log action
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'ClientDocument',
      entityId: document.id,
      action: 'CREATE',
      before: Prisma.DbNull,
      after: { clientId, title: docData.title },
    },
  });

  return document;
};

/**
 * Deletes a client document.
 * Permission required: can_edit_clients
 */
export const deleteClientDocument: DeleteClientDocument<DeleteClientDocumentInput, any> = async (
  { documentId, clientId, salonId },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_edit_clients', context.entities);

  // Verify document exists
  const document = await context.entities.ClientDocument.findFirst({
    where: { id: documentId, clientId, salonId, deletedAt: null },
  });

  if (!document) {
    throw new HttpError(404, 'Document not found');
  }

  // Soft delete document
  await context.entities.ClientDocument.update({
    where: { id: documentId },
    data: { deletedAt: new Date() },
  });

  // Log action
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'ClientDocument',
      entityId: documentId,
      action: 'DELETE',
      before: { title: document.title },
      after: Prisma.DbNull,
    },
  });

  return { success: true };
};
