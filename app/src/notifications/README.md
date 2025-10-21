# Notifications Module

## Overview
The Notifications module manages multi-channel notifications for users in the Glamo system. It supports internal notifications with planned expansion to email, push notifications, and WhatsApp.

## Features
- Create and list notifications for users
- Mark notifications as read (individual or bulk)
- Support for multiple notification channels (INTERNAL, PUSH, EMAIL, WHATSAPP)
- System-generated vs user-generated notifications
- Notification types (INFO, WARNING, ALERT, SYSTEM)
- Unread count tracking
- Pagination support
- Audit logging for all operations

## API Operations

### Queries

#### `listNotifications`
Lists notifications for the current user with optional filters.

**No permission check** - Users can always see their own notifications

**Arguments:**
```typescript
{
  salonId: string;
  unreadOnly?: boolean;   // Default: false
  page?: number;          // Default: 1
  perPage?: number;       // Default: 20
}
```

**Returns:**
```typescript
{
  notifications: Notification[];
  total: number;
  unreadCount: number;
}
```

### Actions

#### `createNotification`
Creates a new notification for a user. Can be called by system or other users.

**No permission check** - But validates user has access to salon

**Arguments:**
```typescript
{
  userId: string;
  salonId: string;
  title: string;                                    // Required
  message: string;                                  // Required
  type?: NotificationType;                          // Default: 'INFO'
  channel?: NotificationChannel;                    // Default: 'INTERNAL'
  systemGenerated?: boolean;                        // Default: false
}
```

**NotificationType:** `'INFO' | 'WARNING' | 'ALERT' | 'SYSTEM'`

**NotificationChannel:** `'INTERNAL' | 'PUSH' | 'EMAIL' | 'WHATSAPP'`

**Returns:** Created `Notification`

**Validations:**
- Title and message are required and non-empty
- User must have active access to the salon
- Logs creation action

#### `markNotificationRead`
Marks a specific notification as read.

**No permission check** - Users can only mark their own notifications

**Arguments:**
```typescript
{
  id: string;
  salonId: string;
}
```

**Returns:** Updated `Notification`

**Validations:**
- Notification must belong to the current user
- Idempotent - returns success if already read
- Logs read action

#### `markAllNotificationsRead`
Marks all unread notifications as read for the current user in a salon.

**No permission check** - Users can only mark their own notifications

**Arguments:**
```typescript
{
  salonId: string;
}
```

**Returns:** `{ count: number }` - Number of notifications marked as read

## Helper Functions

### `createSystemNotification`
Internal helper for other modules to create system notifications.

```typescript
export const createSystemNotification = async (
  userId: string,
  salonId: string,
  title: string,
  message: string,
  type: NotificationType,
  context: any
): Promise<Notification>
```

**Usage Example:**
```typescript
import { createSystemNotification } from '../notifications/operations';

// In another module (e.g., appointments)
await createSystemNotification(
  client.userId,
  salon.id,
  'Appointment Confirmed',
  `Your appointment on ${appointmentDate} has been confirmed.`,
  'INFO',
  context
);
```

## Usage Examples

### Listing Notifications
```typescript
import { listNotifications } from 'wasp/client/operations';

// Get all notifications
const { notifications, total, unreadCount } = await listNotifications({
  salonId: 'salon-123'
});

// Get only unread notifications
const { notifications: unread } = await listNotifications({
  salonId: 'salon-123',
  unreadOnly: true
});

// Display unread count in UI
console.log(`You have ${unreadCount} unread notifications`);
```

### Creating a Notification
```typescript
import { createNotification } from 'wasp/client/operations';

// User-generated notification
const notification = await createNotification({
  userId: 'user-456',
  salonId: 'salon-123',
  title: 'Appointment Reminder',
  message: 'You have an appointment tomorrow at 10:00 AM',
  type: 'INFO',
  channel: 'INTERNAL'
});

// System notification with warning
await createNotification({
  userId: 'manager-789',
  salonId: 'salon-123',
  title: 'Low Stock Alert',
  message: 'Product "Shampoo XYZ" is below minimum stock level',
  type: 'WARNING',
  channel: 'INTERNAL',
  systemGenerated: true
});
```

### Marking Notifications as Read
```typescript
import { markNotificationRead, markAllNotificationsRead } from 'wasp/client/operations';

// Mark single notification as read
await markNotificationRead({
  id: 'notification-123',
  salonId: 'salon-123'
});

// Mark all notifications as read
const { count } = await markAllNotificationsRead({
  salonId: 'salon-123'
});
console.log(`Marked ${count} notifications as read`);
```

## Notification Types

### INFO
General informational notifications:
- Appointment confirmations
- Payment received confirmations
- General updates

### WARNING
Warnings that require attention:
- Low stock alerts
- Upcoming appointment reminders
- Pending tasks

### ALERT
Urgent notifications:
- Appointment cancellations
- Payment failures
- System issues

### SYSTEM
System-level notifications:
- Maintenance announcements
- New feature announcements
- System updates

## Notification Channels

### INTERNAL
Always stored in database and shown in app UI. Currently the only fully implemented channel.

### PUSH
**Planned:** Mobile push notifications via Firebase Cloud Messaging or similar service.

### EMAIL
**Planned:** Email notifications via SendGrid or configured email service.

### WHATSAPP
**Planned:** WhatsApp notifications via WhatsApp Business API.

## Database Schema

The Notification model includes:
- `id` (UUID, primary key)
- `userId` (FK to User)
- `salonId` (FK to Salon)
- `title` (required)
- `message` (required)
- `type` (enum: INFO, WARNING, ALERT, SYSTEM)
- `channel` (enum: INTERNAL, PUSH, EMAIL, WHATSAPP)
- `systemGenerated` (boolean, default false)
- `read` (boolean, default false)
- `createdAt`, `updatedAt` (timestamps)

## Error Handling

All operations may throw `HttpError` with the following status codes:

- **401 Unauthorized:** User not authenticated (for operations requiring authentication)
- **404 Not Found:** Notification not found or access denied
- **400 Bad Request:** Validation errors (empty title/message, user doesn't have salon access)

## Integration with Other Modules

The Notifications module is designed to be used by other modules to notify users of events:

### Appointments Module
- Appointment confirmed
- Appointment reminder (24h before)
- Appointment cancelled
- Appointment completed

### Sales Module
- Payment received
- Receipt ready
- Refund processed

### Inventory Module
- Low stock alert
- Product out of stock
- Stock replenished

### Cash Register Module
- Cash session opened
- Cash discrepancy detected
- Daily report ready

### Commissions Module
- Commission calculated
- Commission paid

## Security Considerations
- Users can only see their own notifications
- Users can only mark their own notifications as read
- System notifications are flagged separately for audit purposes
- All notification actions are logged
- Target user must have active access to the salon

## Future Enhancements

### Multi-Channel Delivery
1. **Email Integration:**
   - SendGrid/Mailgun integration
   - HTML email templates
   - Unsubscribe management

2. **Push Notifications:**
   - Firebase Cloud Messaging setup
   - Device token management
   - Notification preferences per device

3. **WhatsApp Integration:**
   - WhatsApp Business API integration
   - Template message management
   - Opt-in/opt-out handling

### Features
- Notification preferences per user
- Do Not Disturb schedule
- Notification grouping/batching
- Rich content (images, buttons, actions)
- Notification categories/filtering
- Archive/delete functionality
- Scheduled notifications
- Notification templates
- Digest notifications (daily/weekly summary)

### Analytics
- Notification open rates
- Click-through rates
- Delivery success rates
- Channel effectiveness comparison
