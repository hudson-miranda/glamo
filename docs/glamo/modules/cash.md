### Objetivo

Gerir o caixa diário por negócio e/ou por colaborador, com abertura, fechamento, conciliação e export.

### Entidades

* **CashRegisterSession**(id, salonId, openedBy, openedAt, openingBalance, closedBy?, closedAt?, reconciled?)
* **CashMovement**(sessionId, type: PAYMENT|SANGRIA|SUPRIMENTO, amount, at, notes?)

### Regras

1. **Sessão Única Aberta:**

   * Apenas uma sessão aberta por caixa/unidade por vez.
2. **Conciliação:**

   * Fechamento calcula saldo esperado e marca `reconciled` após conferência.
3. **Export:**

   * Extrato diário (CSV/PDF) com totalizações por método de pagamento.

### Queries/Actions

* **Queries**: `getOpenSession`, `listSessions(range)`
* **Actions**: `openSession`, `closeSession`, `recordMovement`, `exportDailyStatement`

### Testes

* Abertura/fechamento duplo
* Sangria/suprimento afetando saldo
* Export com totais corretos