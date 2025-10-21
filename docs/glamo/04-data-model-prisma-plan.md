Resumo de entidades principais:

* **User** → dados pessoais, activeSalonId.
* **Salon** → unidade de negócio.
* **UserSalon** → vínculo entre usuário e salão.
* **Role/Permission/UserRole/RolePermission** → RBAC contextual.
* **Client** → informações e histórico.
* **Service / ServiceVariant / CommissionConfig** → estrutura de serviços.
* **Appointment / AppointmentService / AppointmentAssistant / AppointmentRepetition / AppointmentStatusLog** → controle de agenda.
* **Product / StockRecord** → estoque.
* **Sale / SaleService / SaleProduct / SalePackage / Payment / PaymentMethod / ClientCredit / CreditPayment** → vendas e pagamentos.
* **CashRegisterSession / CashMovement** → caixa.
* **Notification / Log** → comunicação e auditoria.

Diferenças do ERD original:

* Normalização de arrays de roles/permissions.
* Inclusão de `Notification.channel` e `systemGenerated`.
* Ajuste de relacionamentos para integridade referencial.