**📘 DOCUMENTAÇÃO DE API, PAPÉIS E ROTEAMENTO - SISTEMA GLAMO**

**Visão Geral de Funcionalidades Backend (via API)**

**🔹 Módulo: Autenticação e Sessão**

| **Funcionalidade** | **Método** | **Endpoint** | **Descrição** |
| --- | --- | --- | --- |
| Registrar novo usuário | POST | /api/auth/register | Cria um novo usuário com dados básicos. |
| Login do usuário | POST | /api/auth/login | Gera token JWT e refreshToken após autenticação. |
| Refresh de sessão | POST | /api/auth/refresh | Gera novo token JWT a partir do refreshToken. |
| Logout do usuário | POST | /api/auth/logout | Invalida sessão atual. |

**🔹 Módulo: Usuários e Papéis**

| **Funcionalidade** | **Método** | **Endpoint** | **Descrição** |
| --- | --- | --- | --- |
| Listar usuários | GET | /api/users | Lista todos os usuários (visível apenas para administradores). |
| Obter detalhes de um usuário | GET | /api/users/:id | Recupera informações detalhadas de um usuário. |
| Atualizar dados do usuário | PUT | /api/users/:id | Edita dados pessoais e de contato. |
| Excluir (soft delete) usuário | DELETE | /api/users/:id | Marca usuário como deletado. |
| Alternar negócio ativo | PATCH | /api/users/switch-salon | Altera o negócio ativo do usuário logado. |
| Listar permissões atuais | GET | /api/users/me/permissions | Lista todas as permissões do usuário no negócio ativo. |

**🔹 Módulo: Papéis, Permissões e Vínculos**

| **Funcionalidade** | **Método** | **Endpoint** | **Descrição** |
| --- | --- | --- | --- |
| Listar papéis | GET | /api/roles | Lista os papéis do negócio ativo. |
| Criar novo papel | POST | /api/roles | Cria um papel customizado. |
| Atualizar papel | PUT | /api/roles/:id | Edita nome ou permissões. |
| Excluir papel | DELETE | /api/roles/:id | Remove papel, se não estiver vinculado a usuários. |
| Atribuir papel a usuário no negócio | POST | /api/user-roles | Liga usuário a um papel no contexto de um negócio. |
| Listar permissões disponíveis | GET | /api/permissions | Lista todas as permissões possíveis do sistema. |

**🔹 Módulo: Notificações**

| **Funcionalidade** | **Método** | **Endpoint** | **Descrição** |
| --- | --- | --- | --- |
| Listar notificações | GET | /api/notifications | Lista notificações do usuário logado. |
| Marcar como lida | PATCH | /api/notifications/:id | Define notificação como "lida". |
| Criar notificação manual | POST | /api/notifications | Cria uma nova notificação (usuários com permissão). |

Campo channel deve ser incluído no payload (opções: internal, push, email, whatsapp) para suportar múltiplos meios de envio.

**🔹 Módulo: Logs**

| **Funcionalidade** | **Método** | **Endpoint** | **Descrição** |
| --- | --- | --- | --- |
| Consultar logs | GET | /api/logs | Lista logs com filtros (entidade, data, usuário, ação). |

Logs registram ipAddress, userAgent, dados anteriores e posteriores da alteração.

**🔹 Middleware de Segurança**

| **Nome** | **Descrição** |
| --- | --- |
| authMiddleware | Valida JWT e session. |
| rolePermissionMiddleware('permission') | Verifica se o usuário tem permissão no negócio ativo. |
| rateLimiterMiddleware | Limita requisições por IP/usuário usando Redis. |

**🔹 Módulo: Clientes**

| **Funcionalidade** | **Método** | **Endpoint** | **Descrição** | **Permissão Necessária** |
| --- | --- | --- | --- | --- |
| Listar clientes do negócio | GET | /api/clients | Lista todos os clientes vinculados ao negócio ativo. | can_view_clients |
| Criar cliente | POST | /api/clients | Cadastra um novo cliente manualmente. | can_create_clients |
| Editar cliente | PUT | /api/clients/:id | Altera dados do cliente. | can_edit_clients |
| Excluir cliente | DELETE | /api/clients/:id | Soft delete do cliente. | can_delete_clients |
| Obter histórico de agendamentos | GET | /api/clients/:id/history | Lista agendamentos, créditos e vendas. | can_view_clients |

**🔹 Módulo: Agendamentos**

| **Funcionalidade** | **Método** | **Endpoint** | **Descrição** | **Permissão Necessária** |
| --- | --- | --- | --- | --- |
| Listar agendamentos do negócio | GET | /api/appointments | Lista agendamentos por período, status, profissional, cliente, etc. | can_view_appointments |
| Horários disponíveis |     | /api/appointments/available-slots | Retorna horários disponíveis por profissional. | can_create_appointments |
| Criar novo agendamento | POST | /api/appointments | Cria um novo agendamento com serviços, horários e assistentes. | can_create_appointments |
| Editar agendamento | PUT | /api/appointments/:id | Permite reagendamento ou edição parcial. | can_edit_appointments |
| Cancelar ou excluir agendamento | DELETE | /api/appointments/:id | Remove ou cancela o agendamento. | can_delete_appointments |
| Obter detalhes do agendamento | GET | /api/appointments/:id | Retorna dados detalhados, serviços e assistentes. | can_view_appointments |

**🔹 Módulo: Serviços por Agendamento**

| **Funcionalidade** | **Método** | **Endpoint** | **Descrição** | **Permissão Necessária** |
| --- | --- | --- | --- | --- |
| Adicionar serviços a um agendamento | POST | /api/appointment-services | Adiciona serviços e variações ao agendamento. | can_edit_appointments |
| Atualizar item de serviço | PUT | /api/appointment-services/:id | Edita preço, duração e desconto do serviço. | can_edit_appointments |
| Remover item de serviço do agendamento | DELETE | /api/appointment-services/:id | Remove serviço do agendamento. | can_edit_appointments |

**🔹 Módulo: Assistentes em Agendamento**

| **Funcionalidade** | **Método** | **Endpoint** | **Descrição** | **Permissão Necessária** |
| --- | --- | --- | --- | --- |
| Adicionar assistente a agendamento | POST | /api/appointment-assistants | Adiciona assistente ao atendimento. | can_edit_appointments |
| Remover assistente de agendamento | DELETE | /api/appointment-assistants/:id | Remove profissional auxiliar. | can_edit_appointments |

**🔹 Módulo: Repetições de Agendamento**

| **Funcionalidade** | **Método** | **Endpoint** | **Descrição** | **Permissão Necessária** |
| --- | --- | --- | --- | --- |
| Adicionar repetição a um agendamento | POST | /api/appointment-repetitions | Define frequência de repetição. | can_create_appointments |
| Cancelar recorrência | DELETE | /api/appointment-repetitions/:id | Remove configuração de repetição. | can_edit_appointments |

**🔹 Módulo: Logs de Status do Agendamento**

| **Funcionalidade** | **Método** | **Endpoint** | **Descrição** | **Permissão Necessária** |
| --- | --- | --- | --- | --- |
| Listar histórico de status | GET | /api/appointment-status-logs/:id | Lista todas as alterações de status do agendamento. | can_view_appointments |

**🔹 Módulo: Comissões**

| **Funcionalidade** | **Método** | **Endpoint** | **Descrição** | **Permissão Necessária** |
| --- | --- | --- | --- | --- |
| Listar comissões | GET | /api/commissions | Lista comissões por profissional, período. | can_view_sales |
| Configurar comissões | POST | /api/commissions/config | Cria regra personalizada por serviço. | can_edit_services |

**🔹 Módulo: Vouchers**

| **Funcionalidade** | **Método** | **Endpoint** | **Descrição** | **Permissão Necessária** |
| --- | --- | --- | --- | --- |
| Listar vouchers | GET | /api/vouchers | Lista os vouchers ativos, expirados e utilizados. | can_view_vouchers |
| Criar voucher | POST | /api/vouchers | Cria um novo voucher com regras de uso. | can_create_vouchers |
| Atualizar voucher | PUT | /api/vouchers/:id | Edita regras ou prazo de validade. | can_edit_vouchers |
| Excluir voucher | DELETE | /api/vouchers/:id | Soft delete do voucher. | can_delete_vouchers |

**🔹 Módulo: Produtos**

| **Funcionalidade** | **Método** | **Endpoint** | **Descrição** | **Permissão Necessária** |
| --- | --- | --- | --- | --- |
| Listar produtos | GET | /api/products | Lista produtos do negócio com filtros por categoria, marca ou estoque. | can_view_products |
| Criar produto | POST | /api/products | Cadastra novo produto. | can_create_products |
| Atualizar produto | PUT | /api/products/:id | Edita informações do produto. | can_edit_products |
| Arquivar produto | DELETE | /api/products/:id | Marca produto como arquivado (soft delete). | can_delete_products |

**🔹 Módulo: Categorias, Marcas e Fornecedores**

| **Funcionalidade** | **Método** | **Endpoint** | **Descrição** | **Permissão Necessária** |
| --- | --- | --- | --- | --- |
| Listar categorias de produto | GET | /api/product-categories | Lista categorias cadastradas. | can_view_products |
| Criar categoria | POST | /api/product-categories | Cria uma nova categoria de produto. | can_create_products |
| Listar marcas | GET | /api/product-brands | Lista todas as marcas disponíveis. | can_view_products |
| Cadastrar marca | POST | /api/product-brands | Adiciona nova marca. | can_create_products |
| Listar fornecedores | GET | /api/suppliers | Lista fornecedores ativos. | can_view_products |
| Cadastrar fornecedor | POST | /api/suppliers | Cadastra novo fornecedor com CNPJ e contatos. | can_create_products |

**🔹 Módulo: Estoque**

| **Funcionalidade** | **Método** | **Endpoint** | **Descrição** | **Permissão Necessária** |
| --- | --- | --- | --- | --- |
| Registrar movimentação de estoque | POST | /api/stock-records | Lança entrada/saída/correção de estoque. | can_manage_inventory |
| Listar movimentações por produto | GET | /api/stock-records | Exibe histórico de movimentações filtrado por período/produto. | can_manage_inventory |

O payload deve incluir: previousQuantity, finalQuantity, reason e movementType.

**🔹 Módulo: Vendas**

| **Funcionalidade** | **Método** | **Endpoint** | **Descrição** | **Permissão Necessária** |
| --- | --- | --- | --- | --- |
| Listar vendas | GET | /api/sales | Lista vendas por período, cliente ou operador. | can_view_sales |
| Criar nova venda | POST | /api/sales | Cria venda com produtos, serviços, pacotes e desconto. | can_create_sales |
| Ver detalhes da venda | GET | /api/sales/:id | Exibe produtos, serviços, comissões e pagamentos. | can_view_sales |
| Editar/ajustar venda | PUT | /api/sales/:id | Permite ajuste manual (autorizado apenas com permissão especial). | can_edit_sales |
| Cancelar venda | DELETE | /api/sales/:id | Cancela uma venda, mantendo o histórico. | can_cancel_sales |

**🔹 Módulo: Comandas (Vinculadas à Venda)**

| **Funcionalidade** | **Método** | **Endpoint** | **Descrição** | **Permissão Necessária** |
| --- | --- | --- | --- | --- |
| Gerar comanda da venda | GET | /api/sales/:id/receipt | Gera PDF da comanda detalhada. | can_view_sales |
| Visualizar histórico de comandas | GET | /api/sales/receipts | Lista comandas emitidas com filtros por período. | can_view_sales |
| Reimprimir comanda | PUT | /api/sales/:id/receipt/reprint | Gera nova via com log de reimpressão. | can_view_sales |

**🔹 Módulo: Pagamentos**

| **Funcionalidade** | **Método** | **Endpoint** | **Descrição** | **Permissão Necessária** |
| --- | --- | --- | --- | --- |
| Registrar pagamento | POST | /api/payments | Lança um novo pagamento para uma venda. | can_create_sales |
| Listar pagamentos da venda | GET | /api/payments?saleId=X | Lista todos os pagamentos vinculados à venda. | can_view_sales |
| Registrar uso de crédito no pagamento | POST | /api/credit-payments | Aponta quais créditos foram usados no pagamento. | can_create_sales |
| Listar métodos de pagamento disponíveis | GET | /api/payment-methods | Lista Pix, Cartão, Dinheiro, etc. | can_view_sales |

**🔹 Papéis de Usuário (Roles)**

No Glamo, cada usuário pode ter um ou mais papéis **por negócio**, com permissões ajustáveis. Os papéis abaixo são sugestões padrão:

| **Papel Padrão** | **Descrição** |
| --- | --- |
| owner | Dono do negócio, acesso completo. |
| manager | Gestor geral, acesso a vendas, agendamentos, produtos e relatórios. |
| professional | Profissional prestador de serviço. Acesso à própria agenda e comissões. |
| cashier | Responsável por comandas, caixa e recebimentos. |
| assistant | Auxiliar com acesso parcial à agenda e execução de serviços. |
| client | Cliente com acesso apenas ao frontend público (mobile/web). |

**🔹 Permissões do Sistema (Permissions)**

As permissões são **ações atômicas** atribuídas aos papéis. A seguir, algumas das principais permissões disponíveis:

| **Permissão** | **Descrição** |
| --- | --- |
| can_view_users | Visualizar usuários do sistema. |
| can_manage_users | Criar, editar e deletar usuários. |
| can_view_roles | Ver papéis existentes no negócio. |
| can_manage_roles | Criar e editar papéis. |
| can_view_clients | Visualizar lista de clientes. |
| can_create_clients | Cadastrar novos clientes. |
| can_edit_clients | Editar dados de clientes. |
| can_delete_clients | Remover (soft delete) clientes. |
| can_view_appointments | Visualizar agendamentos do negócio. |
| can_create_appointments | Criar novos agendamentos. |
| can_edit_appointments | Editar agendamentos existentes. |
| can_delete_appointments | Cancelar ou excluir agendamentos. |
| can_view_products | Ver lista de produtos. |
| can_create_products | Cadastrar produtos, marcas e categorias. |
| can_edit_products | Editar produtos. |
| can_delete_products | Arquivar ou excluir produtos. |
| can_manage_inventory | Controlar entradas e saídas de estoque. |
| can_view_sales | Ver vendas e relatórios comerciais. |
| can_create_sales | Registrar nova venda. |
| can_edit_sales | Editar vendas anteriores. |
| can_cancel_sales | Cancelar vendas. |
| can_view_vouchers | Visualizar vouchers ativos e expirados. |
| can_create_vouchers | Criar novos cupons de desconto. |
| can_edit_vouchers | Editar regras de vouchers. |
| can_delete_vouchers | Inativar/remover vouchers. |
| can_manage_cash | Abrir e fechar caixa, lançar sangria/suprimento. |
| can_view_reports | Acessar dashboards e relatórios gerenciais. |
| can_manage_notifications | Criar notificações manuais. |
| can_manage_logs | Acessar logs de auditoria e status. |

**🔹 Controle de Acesso (Middleware de Autorização)**

Cada rota da API deve aplicar os seguintes middlewares:

- authMiddleware: Valida o JWT e a sessão.
- rolePermissionMiddleware: Verifica se o usuário possui a permissão exigida, de acordo com o salonId ativo.

Exemplo de uso no backend:

router.get('/clients', authMiddleware, rolePermissionMiddleware('can_view_clients'), controller.listClients);

**🔹 Observações Adicionais**

- Os papéis são personalizáveis por negócio (via USER_ROLES).
- As permissões são centralizadas (via PERMISSIONS) e associadas aos papéis (via ROLE_PERMISSIONS).
- Usuários podem ter múltiplos papéis em diferentes salões e alternar o contexto com activeSalonId.