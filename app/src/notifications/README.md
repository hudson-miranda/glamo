# Notifications Module

## Overview
The Notifications module manages multi-channel notifications for users in the Glamo system. It supports internal notifications, push notifications, email, and WhatsApp messaging.

## Features
- List notifications with unread count and pagination
- Create notifications for users
- Multi-channel support (INTERNAL, PUSH, EMAIL, WHATSAPP)
- Multiple notification types (INFO, WARNING, ALERT, SYSTEM)
- Mark single notification as read
- Mark all notifications as read
- System-generated notifications
- Comprehensive audit logging

## Operations

### Queries

#### `listNotifications`
Lists notifications for the current user in a salon.

**Input:**
```typescript
{
  salonId: string;
  unreadOnly?: boolean;  // Default: false
  page?: number;         // Default: 1
  perPage?: number;      // Default: 20
}
```

**Output:**
```typescript
{
  notifications: Notification[];
  unreadCount: number;      // Always returns total unread count
  total: number;
  page: number;
  perPage: number;
}
```

### Actions

#### `createNotification`
Creates a new notification for a user.

**Input:**
```typescript
{
  userId: string;
  salonId: string;
  title: string;
  message: string;
  type?: 'INFO' | 'WARNING' | 'ALERT' | 'SYSTEM';  // Default: 'INFO'
  channel?: 'INTERNAL' | 'PUSH' | 'EMAIL' | 'WHATSAPP';  // Default: 'INTERNAL'
  systemGenerated?: boolean;  // Default: false
}
```

**Validations:**
- Target user must have access to the salon
- If not system-generated, creating user must have access to the salon

**Output:** Created Notification object

#### `markNotificationRead`
Marks a single notification as read.

**Input:**
```typescript
{
  notificationId: string;
  salonId: string;
}
```

**Validations:**
- Only the notification owner can mark it as read

**Output:** Updated Notification object

#### `markAllNotificationsRead`
Marks all notifications as read for the current user in a salon.

**Input:**
```typescript
{
  salonId: string;
}
```

**Output:** Number of notifications marked as read

## Helper Functions

### `createSystemNotification`
Helper function to create system-generated notifications without requiring user context.

```typescript
async function createSystemNotification(
  prisma: any,
  userId: string,
  salonId: string,
  title: string,
  message: string,
  type?: 'INFO' | 'WARNING' | 'ALERT' | 'SYSTEM',
  channel?: 'INTERNAL' | 'PUSH' | 'EMAIL' | 'WHATSAPP'
): Promise<Notification>
```

This function can be called from other parts of the application to create notifications programmatically.

## Database Schema

```prisma
enum NotificationChannel {
  INTERNAL
  PUSH
  EMAIL
  WHATSAPP
}

enum NotificationType {
  INFO
  WARNING
  ALERT
  SYSTEM
}

model Notification {
  id              String              @id @default(uuid())
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt
  userId          String
  salonId         String
  title           String
  message         String
  type            NotificationType    @default(INFO)
  channel         NotificationChannel @default(INTERNAL)
  systemGenerated Boolean             @default(false)
  read            Boolean             @default(false)
  
  user  User  @relation(fields: [userId], references: [id])
  salon Salon @relation(fields: [salonId], references: [id])
}
```

## Usage Examples

### List Notifications
```typescript
import { listNotifications } from 'wasp/client/operations';

// List all notifications
const result = await listNotifications({
  salonId: 'salon-uuid',
});

console.log(`You have ${result.unreadCount} unread notifications`);

// List only unread notifications
const unread = await listNotifications({
  salonId: 'salon-uuid',
  unreadOnly: true,
});
```

### Create User Notification
```typescript
import { createNotification } from 'wasp/client/operations';

const notification = await createNotification({
  userId: 'user-uuid',
  salonId: 'salon-uuid',
  title: 'New Appointment',
  message: 'You have a new appointment scheduled for tomorrow at 10:00 AM',
  type: 'INFO',
  channel: 'INTERNAL',
});
```

### Create System Notification (Server-side)
```typescript
import { createSystemNotification } from '@src/notifications/operations';

// In a server-side action or job
const notification = await createSystemNotification(
  context.entities,
  userId,
  salonId,
  'Low Stock Alert',
  'Product "Hair Gel" is running low. Current stock: 5 units.',
  'WARNING',
  'INTERNAL'
);
```

### Mark Notification as Read
```typescript
import { markNotificationRead } from 'wasp/client/operations';

await markNotificationRead({
  notificationId: 'notification-uuid',
  salonId: 'salon-uuid',
});
```

### Mark All Notifications as Read
```typescript
import { markAllNotificationsRead } from 'wasp/client/operations';

const count = await markAllNotificationsRead({
  salonId: 'salon-uuid',
});

console.log(`Marked ${count} notifications as read`);
```

## Notification Types

### INFO
General informational notifications.
- Example: "Your appointment has been confirmed"
- Example: "New product added to catalog"

### WARNING
Important notifications that require attention.
- Example: "Low stock alert"
- Example: "Payment due soon"

### ALERT
Critical notifications requiring immediate attention.
- Example: "Appointment conflict detected"
- Example: "System maintenance scheduled"

### SYSTEM
System-generated notifications.
- Example: "Database backup completed"
- Example: "Monthly report ready"

## Notification Channels

### INTERNAL
Displayed within the application interface.
- Always available
- No external service required

### PUSH
Push notifications to mobile devices.
- Requires push notification service integration
- User must have granted push notification permissions

### EMAIL
Email notifications.
- Requires email service configuration
- Sent to user's registered email

### WHATSAPP
WhatsApp messages.
- Requires WhatsApp Business API integration
- Sent to user's registered phone number

## Integration Examples

### Appointment Confirmation
```typescript
// When an appointment is confirmed, notify the client
await createSystemNotification(
  prisma,
  client.userId,
  salonId,
  'Appointment Confirmed',
  `Your appointment on ${appointmentDate} at ${appointmentTime} has been confirmed.`,
  'INFO',
  'WHATSAPP'
);
```

### Low Stock Alert
```typescript
// When inventory reaches minimum level, notify managers
const managers = await getManagersForSalon(salonId);
for (const manager of managers) {
  await createSystemNotification(
    prisma,
    manager.id,
    salonId,
    'Low Stock Alert',
    `Product "${productName}" is running low. Current stock: ${currentStock} units.`,
    'WARNING',
    'INTERNAL'
  );
}
```

### Sale Completed
```typescript
// When a sale is completed, notify the employee
await createSystemNotification(
  prisma,
  employeeId,
  salonId,
  'Sale Completed',
  `Sale #${saleId} has been completed. Total: R$ ${total.toFixed(2)}`,
  'INFO',
  'INTERNAL'
);
```

## Error Handling

All operations throw `HttpError` with appropriate status codes:

- **401**: User not authenticated
- **403**: User does not have access to salon
- **404**: Notification not found
- **400**: Target user does not have access to salon

## Audit Logging

All operations automatically log actions to the `Log` table:
- CREATE: When a notification is created
- CREATE_SYSTEM: When a system notification is created
- MARK_READ: When a notification is marked as read
- MARK_ALL_READ: When all notifications are marked as read

## Best Practices

1. **Use appropriate notification types**
   - INFO for general updates
   - WARNING for important but non-critical notifications
   - ALERT for critical notifications
   - SYSTEM for automated system notifications

2. **Choose the right channel**
   - INTERNAL for in-app notifications
   - EMAIL for important notifications that need a record
   - PUSH for time-sensitive notifications
   - WHATSAPP for customer communications

3. **Keep messages concise and clear**
   - Use clear, actionable language
   - Include relevant details (dates, times, names)
   - Add context when necessary

4. **Avoid notification spam**
   - Don't send duplicate notifications
   - Group related notifications when possible
   - Allow users to configure notification preferences

5. **Use system notifications for automation**
   - Inventory alerts
   - Appointment reminders
   - Report generation completion
   - System maintenance notices

## Testing

To test the Notifications module:

1. Ensure you have test users in a test salon
2. Test each operation with valid and invalid inputs
3. Verify notification delivery for different channels
4. Test mark as read functionality
5. Verify audit logging

### Test Scenarios

1. **Create notification for valid user**
2. **Try to create notification for user without salon access** (should fail)
3. **List notifications with pagination**
4. **List only unread notifications**
5. **Mark single notification as read**
6. **Mark all notifications as read**
7. **Verify unread count is accurate**
8. **Try to mark another user's notification as read** (should fail)
9. **Create system notification without user context**
10. **Verify different notification types display correctly**
11. **Test multi-channel support** (if services configured)
12. **Verify audit logs are created** for all operations

## Future Enhancements

- Notification preferences per user (which channels to use)
- Notification templates for common scenarios
- Scheduled notifications
- Notification grouping/batching
- Read receipts and delivery status
- Notification history and archiving
- Push notification service integration
- WhatsApp Business API integration
