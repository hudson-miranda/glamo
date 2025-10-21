import { HttpError } from 'wasp/server';
import type { Notification, NotificationChannel, NotificationType } from 'wasp/entities';

// Types
type CreateNotificationArgs = {
  userId: string;
  salonId: string;
  title: string;
  message: string;
  type?: NotificationType;
  channel?: NotificationChannel;
  systemGenerated?: boolean;
};

type ListNotificationsArgs = {
  salonId: string;
  unreadOnly?: boolean;
  page?: number;
  perPage?: number;
};

type MarkNotificationReadArgs = {
  id: string;
  salonId: string;
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Lists notifications for the current user with optional filters.
 */
export const listNotifications = async (
  args: ListNotificationsArgs,
  context: any
): Promise<{ notifications: Notification[]; total: number; unreadCount: number }> => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  const { salonId, unreadOnly = false, page = 1, perPage = 20 } = args;

  const where: any = {
    userId: context.user.id,
    salonId,
  };

  if (unreadOnly) {
    where.read = false;
  }

  // Get total count
  const total = await context.entities.Notification.count({ where });

  // Get unread count
  const unreadCount = await context.entities.Notification.count({
    where: {
      userId: context.user.id,
      salonId,
      read: false,
    },
  });

  // Get paginated notifications
  const notifications = await context.entities.Notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * perPage,
    take: perPage,
  });

  return { notifications, total, unreadCount };
};

// ============================================================================
// ACTIONS
// ============================================================================

/**
 * Creates a new notification for a user.
 * Can be called by system (systemGenerated=true) or by other users.
 */
export const createNotification = async (
  args: CreateNotificationArgs,
  context: any
): Promise<Notification> => {
  const {
    userId,
    salonId,
    title,
    message,
    type = 'INFO',
    channel = 'INTERNAL',
    systemGenerated = false,
  } = args;

  // Validate required fields
  if (!title || title.trim().length === 0) {
    throw new HttpError(400, 'Notification title is required');
  }

  if (!message || message.trim().length === 0) {
    throw new HttpError(400, 'Notification message is required');
  }

  // Verify user exists and has access to salon
  const userSalon = await context.entities.UserSalon.findFirst({
    where: {
      userId,
      salonId,
      isActive: true,
      deletedAt: null,
    },
  });

  if (!userSalon) {
    throw new HttpError(400, 'User does not have access to this salon');
  }

  // Create notification
  const notification = await context.entities.Notification.create({
    data: {
      userId,
      salonId,
      title: title.trim(),
      message: message.trim(),
      type,
      channel,
      systemGenerated,
      read: false,
    },
  });

  // Log notification creation
  await context.entities.Log.create({
    data: {
      userId: context.user?.id || null,
      entity: 'Notification',
      entityId: notification.id,
      action: 'CREATE',
      before: null,
      after: {
        userId,
        salonId,
        title,
        type,
        channel,
        systemGenerated,
      },
    },
  });

  // TODO: In future iterations, implement actual delivery based on channel:
  // - PUSH: Send push notification via service like Firebase
  // - EMAIL: Send email via SendGrid/configured email service
  // - WHATSAPP: Send via WhatsApp Business API
  // For now, all notifications are stored internally

  return notification;
};

/**
 * Marks a notification as read.
 */
export const markNotificationRead = async (
  args: MarkNotificationReadArgs,
  context: any
): Promise<Notification> => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  const { id, salonId } = args;

  // Get notification
  const notification = await context.entities.Notification.findFirst({
    where: {
      id,
      userId: context.user.id,
      salonId,
    },
  });

  if (!notification) {
    throw new HttpError(404, 'Notification not found or access denied');
  }

  // If already read, return as is
  if (notification.read) {
    return notification;
  }

  // Mark as read
  const updatedNotification = await context.entities.Notification.update({
    where: { id },
    data: { read: true },
  });

  // Log read action
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Notification',
      entityId: id,
      action: 'MARK_READ',
      before: { read: false },
      after: { read: true },
    },
  });

  return updatedNotification;
};

/**
 * Marks all notifications as read for the current user in a salon.
 */
export const markAllNotificationsRead = async (
  args: { salonId: string },
  context: any
): Promise<{ count: number }> => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  const { salonId } = args;

  // Update all unread notifications
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

  // Log bulk read action
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Notification',
      entityId: salonId,
      action: 'MARK_ALL_READ',
      before: null,
      after: { count: result.count },
    },
  });

  return { count: result.count };
};

/**
 * Helper function to create a system notification.
 * Used internally by other modules to notify users of events.
 */
export const createSystemNotification = async (
  userId: string,
  salonId: string,
  title: string,
  message: string,
  type: NotificationType,
  context: any
): Promise<Notification> => {
  return createNotification(
    {
      userId,
      salonId,
      title,
      message,
      type,
      channel: 'INTERNAL',
      systemGenerated: true,
    },
    context
  );
};
