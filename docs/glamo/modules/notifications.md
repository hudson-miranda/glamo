### Objetivo

Notificações internas e multicanal para usuários do negócio.

### Entidades

* **Notification**(userId, salonId, title, message, type, channel: INTERNAL|PUSH|EMAIL|WHATSAPP, systemGenerated: bool, read: bool, createdAt)
* **NotificationDelivery**(notificationId, channel, status, deliveredAt?) – opcional

### Regras

1. **Preferências de Canal:**

   * Respeitar preferências do usuário/negócio quando externas (email/WhatsApp/push).
2. **Leitura:**

   * `markAsRead` altera flag e grava log.

### Queries/Actions

* **Queries**: `listNotifications`
* **Actions**: `markNotificationRead`, `createNotification`

### Testes

* Entrega interna
* Marcação de lido