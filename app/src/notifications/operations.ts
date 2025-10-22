import { HttpError } from 'wasp/server';
import { Prisma } from '@prisma/client';
import type { 
  ListNotifications, 
  CreateNotification, 
  MarkNotificationRead,
  MarkAllNotificationsRead 
} from 'wasp/server/operations';

// ============================================================================
// Types
// ============================================================================

type ListNotificationsInput = {
  salonId: string;
  unreadOnly?: boolean;
  page?: number;
  perPage?: number;
};

type ListNotificationsOutput = {
  notifications: any[];
  unreadCount: number;
  total: number;
  page: number;
  perPage: number;
};

type CreateNotificationInput = {
  userId: string;
  salonId: string;
  title: string;
  message: string;
  type?: 'INFO' | 'WARNING' | 'ALERT' | 'SYSTEM';
  channel?: 'INTERNAL' | 'PUSH' | 'EMAIL' | 'WHATSAPP';
  systemGenerated?: boolean;
};

type MarkNotificationReadInput = {
  notificationId: string;
  salonId: string;
};

type MarkAllNotificationsReadInput = {
  salonId: string;
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Lists notifications for the current user in a salon.
 * Returns notifications with unread count and pagination.
 */
export const listNotifications: ListNotifications<
  ListNotificationsInput,
  ListNotificationsOutput
> = async ({ salonId, unreadOnly = false, page = 1, perPage = 20 }, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  // Build filter
  const where: any = {
    userId: context.user.id,
    salonId,
  };

  if (unreadOnly) {
    where.read = false;
  }

  // Get unread count (always total unread, regardless of unreadOnly filter)
  const unreadCount = await context.entities.Notification.count({
    where: {
      userId: context.user.id,
      salonId,
      read: false,
    },
  });

  // Get total count with current filter
  const total = await context.entities.Notification.count({ where });

  // Get paginated notifications
  const notifications = await context.entities.Notification.findMany({
    where,
    skip: (page - 1) * perPage,
    take: perPage,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      message: true,
      type: true,
      channel: true,
      systemGenerated: true,
      read: true,
      createdAt: true,
    },
  });

  return {
    notifications,
    unreadCount,
    total,
    page,
    perPage,
  };
};

// ============================================================================
// Actions
// ============================================================================

/**
 * Creates a new notification.
 * Can be called internally by the system or by authorized users.
 * Automatically logs the creation.
 */
export const createNotification: CreateNotification<CreateNotificationInput, any> = async (
  { userId, salonId, title, message, type = 'INFO', channel = 'INTERNAL', systemGenerated = false },
  context
) => {
  // System-generated notifications don't require authentication
  // But if there's a user, they should be part of the salon
  if (context.user && !systemGenerated) {
    // Verify user has access to this salon
    const userSalon = await context.entities.UserSalon.findFirst({
      where: {
        userId: context.user.id,
        salonId,
        isActive: true,
        deletedAt: null,
      },
    });

    if (!userSalon) {
      throw new HttpError(403, 'User does not have access to this salon');
    }
  }

  // Verify target user exists and has access to salon
  const targetUserSalon = await context.entities.UserSalon.findFirst({
    where: {
      userId,
      salonId,
      isActive: true,
      deletedAt: null,
    },
  });

  if (!targetUserSalon) {
    throw new HttpError(400, 'Target user does not have access to this salon');
  }

  // Create notification
  const notification = await context.entities.Notification.create({
    data: {
      userId,
      salonId,
      title,
      message,
      type,
      channel,
      systemGenerated,
      read: false,
    },
  });

  // Log creation
  await context.entities.Log.create({
    data: {
      userId: context.user?.id || null,
      entity: 'Notification',
      entityId: notification.id,
      action: 'CREATE',
      before: Prisma.DbNull,
      after: {
        userId,
        title,
        message,
        type,
        channel,
        systemGenerated,
      },
    },
  });

  return notification;
};

/**
 * Marks a single notification as read.
 * Only the notification owner can mark it as read.
 */
export const markNotificationRead: MarkNotificationRead<
  MarkNotificationReadInput,
  any
> = async ({ notificationId, salonId }, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  // Get notification
  const notification = await context.entities.Notification.findFirst({
    where: {
      id: notificationId,
      userId: context.user.id,
      salonId,
    },
  });

  if (!notification) {
    throw new HttpError(404, 'Notification not found');
  }

  // If already read, just return it
  if (notification.read) {
    return notification;
  }

  // Mark as read
  const updatedNotification = await context.entities.Notification.update({
    where: { id: notificationId },
    data: { read: true },
  });

  // Log the action
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Notification',
      entityId: notificationId,
      action: 'MARK_READ',
      before: { read: false },
      after: { read: true },
    },
  });

  return updatedNotification;
};

/**
 * Marks all notifications as read for the current user in a salon.
 * Returns the count of notifications that were marked as read.
 */
export const markAllNotificationsRead: MarkAllNotificationsRead<
  MarkAllNotificationsReadInput,
  number
> = async ({ salonId }, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  // Mark all unread notifications as read
  const result = await context.entities.Notification.updateMany({
    where: {
      userId: context.user.id,
      salonId,
      read: false,
    },
    data: {
      read: true,
    },
  });

  // Log the action
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Notification',
      entityId: salonId, // Use salonId as the entity ID for bulk operations
      action: 'MARK_ALL_READ',
      before: Prisma.DbNull,
      after: { count: result.count },
    },
  });

  return result.count;
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Helper function to create a system notification.
 * This can be called from other parts of the application without requiring
 * a user context.
 * 
 * @param prisma - Prisma client instance
 * @param userId - Target user ID
 * @param salonId - Salon ID
 * @param title - Notification title
 * @param message - Notification message
 * @param type - Notification type (default: INFO)
 * @param channel - Notification channel (default: INTERNAL)
 */
export async function createSystemNotification(
  prisma: any,
  userId: string,
  salonId: string,
  title: string,
  message: string,
  type: 'INFO' | 'WARNING' | 'ALERT' | 'SYSTEM' = 'SYSTEM',
  channel: 'INTERNAL' | 'PUSH' | 'EMAIL' | 'WHATSAPP' = 'INTERNAL'
): Promise<any> {
  // Verify target user exists and has access to salon
  const targetUserSalon = await prisma.userSalon.findFirst({
    where: {
      userId,
      salonId,
      isActive: true,
      deletedAt: null,
    },
  });

  if (!targetUserSalon) {
    throw new Error('Target user does not have access to this salon');
  }

  // Create notification
  const notification = await prisma.notification.create({
    data: {
      userId,
      salonId,
      title,
      message,
      type,
      channel,
      systemGenerated: true,
      read: false,
    },
  });

  // Log creation
  await prisma.log.create({
    data: {
      userId: null, // System-generated, no user
      entity: 'Notification',
      entityId: notification.id,
      action: 'CREATE_SYSTEM',
      before: Prisma.DbNull,
      after: {
        userId,
        title,
        message,
        type,
        channel,
      },
    },
  });

  return notification;
}

