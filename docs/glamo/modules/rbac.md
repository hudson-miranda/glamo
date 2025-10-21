### Objetivo

Controle de acesso contextual por salão.

### Entidades

* **User**, **Salon**, **UserSalon**, **Role**, **Permission**, **RolePermission**, **UserRole**

### Regras

1. **Contexto Ativo:**

   * `User.activeSalonId` define o salão corrente; todas as ações exigem essa referência.
2. **Permissões:**

   * Verificação via `requirePermission(ctxUser, salonId, permission)`.
3. **Seeds:**

   * Criar permissões e papéis padrão; atribuir `owner` ao criador do salão.

### Testes

* Verificação de permissão por rota
* Troca de salão ativo