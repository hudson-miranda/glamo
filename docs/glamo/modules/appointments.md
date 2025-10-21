### Objetivo

Gerenciar agendamentos de serviços em salões multi-tenant com prevenção de conflitos, suporte a assistentes e recorrência, registrando todo o histórico de status e mudanças (auditoria).

### Escopo

* CRUD de agendamentos (Appointments)
* Serviços por agendamento (AppointmentService)
* Assistentes (AppointmentAssistant)
* Recorrência (AppointmentRepetition)
* Log de status (AppointmentStatusLog)
* Consulta de disponibilidade (availableSlots)

### Entidades envolvidas (referência)

* **Appointment**(id, salonId, clientId, professionalId, startAt, endAt, status: PENDING|CONFIRMED|IN_SERVICE|DONE|CANCELLED, notes)
* **AppointmentService**(appointmentId, serviceId, variantId?, duration, price, discount)
* **AppointmentAssistant**(appointmentId, assistantUserId)
* **AppointmentRepetition**(appointmentId, rule, repeatUntil)
* **AppointmentStatusLog**(appointmentId, fromStatus, toStatus, changedBy, changedAt)

### Regras de Negócio

1. **Conflito de Horário (hard-block):**

   * Não é permitido dois agendamentos para o mesmo `professionalId` com interseção entre `[startAt, endAt)`.
   * Opcional: evitar conflito por `serviceRoomId` quando aplicável.
2. **Janela mínima de atendimento:**

   * A duração mínima de um agendamento é 10 min; máxima por política do salão (default: 240 min).
3. **Assistentes:**

   * Podem ser adicionados e removidos até o início do serviço.
   * Mudanças após início devem gerar log em `AppointmentStatusLog`.
4. **Recorrência:**

   * Criar série por `rule` (ex.: RRULE) e `repeatUntil`.
   * Cancelamento de uma ocorrência não remove a série; cancelar série remove as futuras (não passadas).
5. **Status Lifecycle:** `PENDING → CONFIRMED → IN_SERVICE → DONE` ou `CANCELLED`.

   * Cada transição deve ser gravada em `AppointmentStatusLog` (com autor).
6. **Permissões:**

   * Visualização/edição dependem do papel no salão (`requirePermission`).
7. **Auditoria:**

   * Qualquer alteração relevante registra `Log` com before/after.

### Validações

* `startAt < endAt` (obrigatório)
* Cliente e Profissional ativos no mesmo `salonId`.
* Agendamento não pode ser movido para o passado se já estiver `DONE`.

### Queries/Actions (Wasp)

* **Queries**: `listAppointments(filters)`, `getAppointment(id)`, `availableSlots(professionalId, date)`
* **Actions**: `createAppointment`, `updateAppointment`, `cancelAppointment`, `addServiceToAppointment`, `addAssistant`, `setRecurrence`, `logStatusChange`

### Casos de Teste (essenciais)

* Impedir conflito de horário (vários cenários de borda)
* Recorrência com cancelamento de uma ocorrência
* Mudança de status com log
* Permissões de leitura/edição por papel