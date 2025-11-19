import { HttpError } from 'wasp/server';
import { Prisma } from '@prisma/client';
import type { 
  ListServiceCareMessages,
  CreateServiceCareMessage,
  UpdateServiceCareMessage,
  DeleteServiceCareMessage,
  ReorderServiceCareMessages,
} from 'wasp/server/operations';
import { requirePermission } from '../rbac/requirePermission';

// ============================================================================
// Types
// ============================================================================

type ListServiceCareMessagesInput = {
  serviceId: string;
  salonId: string;
  type?: 'PRE_APPOINTMENT' | 'POST_APPOINTMENT';
};

type CreateServiceCareMessageInput = {
  serviceId: string;
  salonId: string;
  type: 'PRE_APPOINTMENT' | 'POST_APPOINTMENT';
  timeValue: number;
  timeUnit: 'HOURS' | 'DAYS';
  message: string;
  active?: boolean;
};

type UpdateServiceCareMessageInput = {
  messageId: string;
  salonId: string;
  timeValue?: number;
  timeUnit?: 'HOURS' | 'DAYS';
  message?: string;
  active?: boolean;
};

type DeleteServiceCareMessageInput = {
  messageId: string;
  salonId: string;
};

type ReorderServiceCareMessagesInput = {
  serviceId: string;
  salonId: string;
  messageIds: string[];
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Lists care messages for a service.
 * Permission required: can_view_services
 */
export const listServiceCareMessages: ListServiceCareMessages<ListServiceCareMessagesInput, any> = async (
  { serviceId, salonId, type },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  // Check permission
  await requirePermission(context.user, salonId, 'can_view_services', context.entities);

  // Verify service belongs to salon
  const service = await context.entities.Service.findUnique({
    where: { id: serviceId },
  });

  if (!service || service.salonId !== salonId) {
    throw new HttpError(403, 'Service does not belong to this salon');
  }

  // Build where clause
  const where: any = {
    serviceId,
  };

  if (type) {
    where.type = type;
  }

  // Get messages
  const messages = await context.entities.ServiceCareMessage.findMany({
    where,
    orderBy: [
      { type: 'asc' },
      { order: 'asc' },
    ],
  });

  return messages;
};

// ============================================================================
// Actions
// ============================================================================

/**
 * Creates a new care message.
 * Permission required: can_edit_services
 * Limit: Maximum 10 messages per type (PRE/POST)
 */
export const createServiceCareMessage: CreateServiceCareMessage<CreateServiceCareMessageInput, any> = async (
  { serviceId, salonId, type, timeValue, timeUnit, message, active = true },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  // Check permission
  await requirePermission(context.user, salonId, 'can_edit_services', context.entities);

  // Verify service belongs to salon
  const service = await context.entities.Service.findUnique({
    where: { id: serviceId },
  });

  if (!service) {
    throw new HttpError(404, 'Service not found');
  }

  if (service.salonId !== salonId) {
    throw new HttpError(403, 'Service does not belong to this salon');
  }

  if (service.deletedAt) {
    throw new HttpError(400, 'Cannot add care message to deleted service');
  }

  // Validate inputs
  if (!type || (type !== 'PRE_APPOINTMENT' && type !== 'POST_APPOINTMENT')) {
    throw new HttpError(400, 'Invalid message type. Must be PRE_APPOINTMENT or POST_APPOINTMENT');
  }

  if (!timeValue || timeValue <= 0) {
    throw new HttpError(400, 'Time value must be greater than 0');
  }

  if (!timeUnit || (timeUnit !== 'HOURS' && timeUnit !== 'DAYS')) {
    throw new HttpError(400, 'Invalid time unit. Must be HOURS or DAYS');
  }

  if (!message || message.trim().length === 0) {
    throw new HttpError(400, 'Message text is required');
  }

  if (message.trim().length > 1000) {
    throw new HttpError(400, 'Message cannot exceed 1000 characters');
  }

  // Check limit: max 10 messages per type
  const existingMessagesCount = await context.entities.ServiceCareMessage.count({
    where: {
      serviceId,
      type,
    },
  });

  if (existingMessagesCount >= 10) {
    throw new HttpError(
      400,
      `Maximum of 10 ${type === 'PRE_APPOINTMENT' ? 'pre-appointment' : 'post-appointment'} messages reached`
    );
  }

  // Get next order number
  const maxOrder = await context.entities.ServiceCareMessage.findFirst({
    where: {
      serviceId,
      type,
    },
    orderBy: {
      order: 'desc',
    },
    select: {
      order: true,
    },
  });

  const nextOrder = (maxOrder?.order ?? -1) + 1;

  // Create the message
  const careMessage = await context.entities.ServiceCareMessage.create({
    data: {
      serviceId,
      type,
      timeValue,
      timeUnit,
      message: message.trim(),
      active,
      order: nextOrder,
    },
  });

  // Log the creation
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'ServiceCareMessage',
      entityId: careMessage.id,
      action: 'CREATE',
      before: Prisma.DbNull,
      after: careMessage,
    },
  });

  return careMessage;
};

/**
 * Updates a care message.
 * Permission required: can_edit_services
 */
export const updateServiceCareMessage: UpdateServiceCareMessage<UpdateServiceCareMessageInput, any> = async (
  { messageId, salonId, timeValue, timeUnit, message, active },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  // Check permission
  await requirePermission(context.user, salonId, 'can_edit_services', context.entities);

  // Get existing message with service
  const existingMessage = await context.entities.ServiceCareMessage.findUnique({
    where: { id: messageId },
    include: {
      service: true,
    },
  });

  if (!existingMessage) {
    throw new HttpError(404, 'Care message not found');
  }

  if (existingMessage.service.salonId !== salonId) {
    throw new HttpError(403, 'Care message does not belong to this salon');
  }

  // Validate inputs
  if (timeValue !== undefined && timeValue <= 0) {
    throw new HttpError(400, 'Time value must be greater than 0');
  }

  if (timeUnit !== undefined && timeUnit !== 'HOURS' && timeUnit !== 'DAYS') {
    throw new HttpError(400, 'Invalid time unit. Must be HOURS or DAYS');
  }

  if (message !== undefined && message.trim().length === 0) {
    throw new HttpError(400, 'Message text cannot be empty');
  }

  if (message !== undefined && message.trim().length > 1000) {
    throw new HttpError(400, 'Message cannot exceed 1000 characters');
  }

  // Prepare update data
  const updateData: any = {};

  if (timeValue !== undefined) updateData.timeValue = timeValue;
  if (timeUnit !== undefined) updateData.timeUnit = timeUnit;
  if (message !== undefined) updateData.message = message.trim();
  if (active !== undefined) updateData.active = active;

  // Update the message
  const updatedMessage = await context.entities.ServiceCareMessage.update({
    where: { id: messageId },
    data: updateData,
  });

  // Log the update
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'ServiceCareMessage',
      entityId: updatedMessage.id,
      action: 'UPDATE',
      before: existingMessage,
      after: updatedMessage,
    },
  });

  return updatedMessage;
};

/**
 * Deletes a care message.
 * Permission required: can_edit_services
 */
export const deleteServiceCareMessage: DeleteServiceCareMessage<DeleteServiceCareMessageInput, any> = async (
  { messageId, salonId },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  // Check permission
  await requirePermission(context.user, salonId, 'can_edit_services', context.entities);

  // Get existing message with service
  const existingMessage = await context.entities.ServiceCareMessage.findUnique({
    where: { id: messageId },
    include: {
      service: true,
    },
  });

  if (!existingMessage) {
    throw new HttpError(404, 'Care message not found');
  }

  if (existingMessage.service.salonId !== salonId) {
    throw new HttpError(403, 'Care message does not belong to this salon');
  }

  // Delete the message
  await context.entities.ServiceCareMessage.delete({
    where: { id: messageId },
  });

  // Reorder remaining messages of the same type
  const remainingMessages = await context.entities.ServiceCareMessage.findMany({
    where: {
      serviceId: existingMessage.serviceId,
      type: existingMessage.type,
    },
    orderBy: {
      order: 'asc',
    },
  });

  // Update order for remaining messages
  for (let i = 0; i < remainingMessages.length; i++) {
    if (remainingMessages[i].order !== i) {
      await context.entities.ServiceCareMessage.update({
        where: { id: remainingMessages[i].id },
        data: { order: i },
      });
    }
  }

  // Log the deletion
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'ServiceCareMessage',
      entityId: existingMessage.id,
      action: 'DELETE',
      before: existingMessage,
      after: Prisma.DbNull,
    },
  });

  return { success: true, message: 'Care message deleted successfully' };
};

/**
 * Reorders care messages for a service.
 * Permission required: can_edit_services
 */
export const reorderServiceCareMessages: ReorderServiceCareMessages<ReorderServiceCareMessagesInput, any> = async (
  { serviceId, salonId, messageIds },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  // Check permission
  await requirePermission(context.user, salonId, 'can_edit_services', context.entities);

  // Verify service belongs to salon
  const service = await context.entities.Service.findUnique({
    where: { id: serviceId },
  });

  if (!service || service.salonId !== salonId) {
    throw new HttpError(403, 'Service does not belong to this salon');
  }

  // Validate that all messageIds belong to this service
  const messages = await context.entities.ServiceCareMessage.findMany({
    where: {
      id: { in: messageIds },
      serviceId,
    },
  });

  if (messages.length !== messageIds.length) {
    throw new HttpError(400, 'Some message IDs are invalid or do not belong to this service');
  }

  // Update order for each message
  for (let i = 0; i < messageIds.length; i++) {
    await context.entities.ServiceCareMessage.update({
      where: { id: messageIds[i] },
      data: { order: i },
    });
  }

  // Log the reorder
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'ServiceCareMessage',
      entityId: serviceId,
      action: 'REORDER',
      before: Prisma.DbNull,
      after: { messageIds, timestamp: new Date() },
    },
  });

  return { success: true, message: 'Messages reordered successfully' };
};
