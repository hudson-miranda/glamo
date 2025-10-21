### Stack Base

* **Frontend:** React (Wasp client)
* **Backend:** Node.js (Wasp server)
* **ORM:** Prisma (PostgreSQL)
* **Jobs:** PgBoss (nativo OpenSaaS)
* **Auth:** Wasp auth + roles customizados

### Estrutura de Pastas (features)

```
app/src/
 ├── clients/
 ├── appointments/
 ├── services/
 ├── sales/
 ├── payments/
 ├── inventory/
 ├── cash/
 ├── notifications/
 ├── reports/
 └── rbac/
```

### Regras Técnicas

* Actions/Queries substituem endpoints REST.
* Autorização via `requirePermission(user, salonId, permission)`.
* RBAC: `User`, `Salon`, `UserSalon`, `Role`, `Permission`, `RolePermission`, `UserRole`.
* `Notification` inclui `channel` e `systemGenerated`.
* Agenda utiliza transações Prisma p/ evitar conflitos.
* CommissionEngine calcula valores e logs de auditoria.