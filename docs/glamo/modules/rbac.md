### Objetivo

Controle de acesso contextual por negócio.

### Entidades

* **User**, **Salon**, **UserSalon**, **Role**, **Permission**, **RolePermission**, **UserRole**

### Regras

1. **Contexto Ativo:**

   * `User.activeSalonId` define o negócio corrente; todas as ações exigem essa referência.
2. **Permissões:**

   * Verificação via `requirePermission(ctxUser, salonId, permission)`.
3. **Seeds:**

   * Criar permissões e papéis padrão; atribuir `owner` ao criador do negócio.

### Testes

* Verificação de permissão por rota
* Troca de negócio ativo