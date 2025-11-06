### Papéis Padrão

| Papel            | Permissões principais                      |
| ---------------- | ------------------------------------------ |
| **Owner**        | Todas as permissões do negócio               |
| **Manager**      | Gestão de usuários, agenda, vendas e caixa |
| **Professional** | Acesso à própria agenda e comissões        |
| **Cashier**      | Operações de vendas e caixa                |
| **Assistant**    | Acesso parcial à agenda                    |
| **Client**       | Visualização e agendamento próprios        |

### Permissões (exemplos)

* `can_view_clients`, `can_create_clients`, `can_edit_clients`, `can_delete_clients`
* `can_view_appointments`, `can_edit_appointments`
* `can_view_services`, `can_edit_services`
* `can_view_sales`, `can_edit_sales`
* `can_view_cash`, `can_close_cash`
* `can_view_reports`

### Helper

`requirePermission(ctxUser, salonId, permission)` → valida se o usuário possui permissão ativa no negócio.