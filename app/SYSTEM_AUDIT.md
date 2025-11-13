# Análise Completa do Sistema Glamo

Este documento detalha todas as rotas de frontend, operações de backend (queries e actions), APIs e jobs definidos no sistema, com base na análise do arquivo `main.wasp`. O objetivo é fornecer uma visão completa da arquitetura da aplicação e servir como base para identificar funcionalidades implementadas, parcialmente implementadas ou ausentes.

## Sumário da Análise

A análise está dividida nas seguintes seções:

1.  **Configurações Gerais da Aplicação (`app`)**
2.  **Autenticação (`auth`)**
3.  **Rotas e Páginas do Frontend**
4.  **Operações de Backend (Queries & Actions)**
5.  **APIs Externas (`api`)**
6.  **Jobs Agendados (`job`)**
7.  **Análise Detalhada por Módulo**
8.  **Resumo Final e Plano de Ação**

---

## 1. Configurações Gerais da Aplicação (`app`)

- **Título:** Glamo - Sistema de Gestão para Salões
- **Head HTML:** Inclui metatags para SEO, OGP (Open Graph Protocol) para compartilhamento em redes sociais e scripts de analytics (Plausible).
- **Banco de Dados (`db`):**
  - **Seeds:**
    - `seedMockUsers`: Popula o banco com usuários de teste.
    - `seedGlamoData`: Popula o banco com dados específicos do Glamo (permissões e papéis RBAC).
- **Cliente (`client`):**
  - **Componente Raiz:** `App` de `@src/client/App`.
- **Envio de Email (`emailSender`):**
  - **Provedor:** `SendGrid`.
  - **Remetente Padrão:** `Glamo <contato@glamo.com.br>`.

---

## 2. Autenticação (`auth`)

- **Entidade de Usuário:** `User`.
- **Métodos de Autenticação:**
  - **Email & Senha:**
    - **Remetente:** `Glamo <contato@glamo.com.br>`.
    - **Verificação de Email:** Habilitada, usa o template `getVerificationEmailContent`.
    - **Reset de Senha:** Habilitado, usa o template `getPasswordResetEmailContent`.
    - **Campos de Cadastro:** Definidos em `getEmailUserFields`.
  - **Google:** Habilitado, com configuração em `getGoogleAuthConfig` e campos de usuário em `getGoogleUserFields`.
- **Redirecionamentos:**
  - **Falha na Autenticação:** Redireciona para `/login`.
  - **Sucesso na Autenticação:** Redireciona para `/dashboard`.

---

## 3. Rotas e Páginas do Frontend

| Rota (Path)                       | Nome da Rota                | Página Vinculada           | Autenticação Necessária? | Arquivo do Componente                                                  | Status Preliminar     |
| --------------------------------- | --------------------------- | -------------------------- | ------------------------ | ---------------------------------------------------------------------- | --------------------- |
| `/`                               | `LandingPageRoute`          | `LandingPage`              | Não                      | `@src/landing-page/LandingPage`                                        | Implementado          |
| `/login`                          | `LoginRoute`                | `LoginPage`                | Não                      | `@src/auth/LoginPage`                                                  | Implementado          |
| `/signup`                         | `SignupRoute`               | `SignupPage`               | Não                      | `@src/auth/SignupPage`                                                 | Implementado          |
| `/request-password-reset`         | `RequestPasswordResetRoute` | `RequestPasswordResetPage` | Não                      | `@src/auth/email-and-pass/RequestPasswordResetPage`                    | Implementado          |
| `/password-reset`                 | `PasswordResetRoute`        | `PasswordResetPage`        | Não                      | `@src/auth/email-and-pass/PasswordResetPage`                           | Implementado          |
| `/email-verification`             | `EmailVerificationRoute`    | `EmailVerificationPage`    | Não                      | `@src/auth/email-and-pass/EmailVerificationPage`                       | Implementado          |
| `/signup-success`                 | `SignupSuccessRoute`        | `SignupSuccessPage`        | Não                      | `@src/auth/SignupSuccessPage`                                          | Implementado          |
| `/account`                        | `AccountRoute`              | `AccountPage`              | Sim                      | `@src/user/AccountPage`                                                | Implementado          |
| `/demo-app`                       | `DemoAppRoute`              | `DemoAppPage`              | Sim                      | `@src/demo-ai-app/DemoAppPage`                                         | Implementado (Demo)   |
| `/pricing`                        | `PricingPageRoute`          | `PricingPage`              | Não                      | `@src/payment/PricingPage`                                             | Implementado          |
| `/checkout`                       | `CheckoutRoute`             | `CheckoutPage`             | Sim                      | `@src/payment/CheckoutPage`                                            | Implementado          |
| `/file-upload`                    | `FileUploadRoute`           | `FileUploadPage`           | Sim                      | `@src/file-upload/FileUploadPage`                                      | Implementado (Demo)   |
| `/admin`                          | `AdminRoute`                | `AnalyticsDashboardPage`   | Sim                      | `@src/admin/dashboards/analytics/AnalyticsDashboardPage`               | Implementado          |
| `/admin/users`                    | `AdminUsersRoute`           | `AdminUsersPage`           | Sim                      | `@src/admin/dashboards/users/UsersDashboardPage`                       | Implementado          |
| `/admin/settings`                 | `AdminSettingsRoute`        | `AdminSettingsPage`        | Sim                      | `@src/admin/elements/settings/SettingsPage`                            | Implementado          |
| `/settings/online-booking`        | `OnlineBookingSettingsRoute`| `OnlineBookingSettingsPage`| Sim                      | `@src/client/modules/settings/OnlineBookingSettingsPage`               | Implementado          |
| `/admin/calendar`                 | `AdminCalendarRoute`        | `AdminCalendarPage`        | Sim                      | `@src/admin/elements/calendar/CalendarPage`                            | Implementado          |
| `/admin/ui/buttons`               | `AdminUIButtonsRoute`       | `AdminUIButtonsPage`       | Sim                      | `@src/admin/elements/ui-elements/ButtonsPage`                          | Implementado (UI Kit) |
| `/admin/messages`                 | `AdminMessagesRoute`        | `AdminMessagesPage`        | Sim                      | `@src/admin/dashboards/messages/MessagesPage`                          | Implementado          |
| `/dashboard`                      | `DashboardRoute`            | `DashboardPage`            | Sim                      | `@src/client/modules/dashboard/DashboardPage`                          | Implementado          |
| `/onboarding`                     | `OnboardingRoute`           | `OnboardingPage`           | Sim                      | `@src/client/modules/onboarding/OnboardingPage`                        | Implementado          |
| `/onboarding/create-salon`        | `CreateSalonRoute`          | `CreateSalonPage`          | Sim                      | `@src/client/modules/onboarding/CreateSalonPage`                       | Implementado          |
| `/onboarding/waiting-invite`      | `WaitingInviteRoute`        | `WaitingInvitePage`        | Sim                      | `@src/client/modules/onboarding/WaitingInvitePage`                     | Implementado          |
| `/clients`                        | `ClientsListRoute`          | `ClientsListPage`          | Sim                      | `@src/client/modules/clients/ClientsListPage`                          | Implementado          |
| `/clients/:id`                    | `ClientDetailRoute`         | `ClientDetailPage`         | Sim                      | `@src/client/modules/clients/ClientDetailPage`                         | Implementado          |
| `*` (Not Found)                   | `NotFoundRoute`             | `NotFoundPage`             | N/A                      | `@src/client/components/NotFoundPage`                                  | Implementado          |

---

## 4. Operações de Backend (Queries & Actions)

Esta seção lista todas as operações de backend, agrupadas por módulo.

### Módulo: User
- **`query getPaginatedUsers`**: Busca usuários com paginação.
- **`action updateIsUserAdminById`**: Atualiza o status de administrador de um usuário.

### Módulo: Demo AI App (Demonstração)
- **`action generateGptResponse`**: Gera uma resposta usando GPT.
- **`action createTask`**: Cria uma nova tarefa.
- **`action deleteTask`**: Deleta uma tarefa.
- **`action updateTask`**: Atualiza uma tarefa.
- **`query getGptResponses`**: Busca respostas do GPT.
- **`query getAllTasksByUser`**: Busca todas as tarefas de um usuário.

### Módulo: Payment (Pagamentos)
- **`query getCustomerPortalUrl`**: (Comentado) Busca a URL do portal do cliente.
- **`action generateCheckoutSession`**: (Comentado) Gera uma sessão de checkout.

### Módulo: File Upload (Demonstração)
- **`action createFile`**: Cria um registro de arquivo.
- **`query getAllFilesByUser`**: Busca todos os arquivos de um usuário.
- **`query getDownloadFileSignedURL`**: Obtém uma URL assinada para download.

### Módulo: Analytics
- **`query getDailyStats`**: Busca estatísticas diárias.

### Módulo: Contact Form (Formulário de Contato)
- **`action createContactMessage`**: Cria uma nova mensagem de contato.
- **`query getContactMessages`**: Busca mensagens de contato.
- **`action updateContactMessageStatus`**: Atualiza o status de uma mensagem.
- **`action markContactMessageAsRead`**: Marca uma mensagem como lida.

### Módulo: Clients (Clientes)
- **`query listClients`**: Lista todos os clientes.
- **`query getClient`**: Busca detalhes de um cliente específico.
- **`action createClient`**: Cria um novo cliente.
- **`action updateClient`**: Atualiza um cliente.
- **`action deleteClient`**: Deleta um cliente.
- **`query getClientNotes`**: Busca as notas de um cliente.
- **`action addClientNote`**: Adiciona uma nota a um cliente.
- **`action updateClientNote`**: Atualiza uma nota de um cliente.
- **`action deleteClientNote`**: Deleta uma nota de um cliente.
- **`action addClientTag`**: Adiciona uma tag a um cliente.
- **`action removeClientTag`**: Remove uma tag de um cliente.
- **`query getClientDocuments`**: Busca os documentos de um cliente.
- **`action uploadClientDocument`**: Faz upload de um documento para um cliente.
- **`action deleteClientDocument`**: Deleta um documento de um cliente.
- **`query getClientHistory`**: Busca o histórico de um cliente.

### Módulo: Salon (Gestão do Salão)
- **`query getUserSalons`**: Busca os salões de um usuário.
- **`action createSalon`**: Cria um novo salão.
- **`action switchActiveSalon`**: Troca o salão ativo do usuário.
- **`query listSalonRoles`**: Lista os papéis (roles) de um salão.
- **`query getPendingInvites`**: Busca convites pendentes.
- **`action sendSalonInvite`**: Envia um convite para um salão.
- **`action acceptSalonInvite`**: Aceita um convite para um salão.
- **`action rejectSalonInvite`**: Rejeita um convite para um salão.
- **`action updateEmployeeRole`**: Atualiza o papel de um funcionário.
- **`action deactivateEmployee`**: Desativa um funcionário.
- **`action resendInvite`**: Reenvia um convite.
- **`action cancelInvite`**: Cancela um convite.

### Módulo: Notifications (Notificações)
- **`query listNotifications`**: Lista as notificações do usuário.
- **`action createNotification`**: Cria uma nova notificação.
- **`action markNotificationRead`**: Marca uma notificação como lida.
- **`action markAllNotificationsRead`**: Marca todas as notificações como lidas.

### Módulo: Services (Serviços)
- **`query listServices`**: Lista todos os serviços.
- **`query getService`**: Busca detalhes de um serviço.
- **`action createService`**: Cria um novo serviço.
- **`action updateService`**: Atualiza um serviço.
- **`action deleteService`**: Deleta um serviço.
- **`action createServiceVariant`**: Cria uma variante de um serviço.
- **`action updateServiceVariant`**: Atualiza uma variante de um serviço.
- **`action deleteServiceVariant`**: Deleta uma variante de um serviço.
- **`action manageCommissionConfig`**: Gerencia a configuração de comissão de um serviço.

### Módulo: Employees (Funcionários)
- **`query listEmployees`**: Lista todos os funcionários.
- **`query getEmployee`**: Busca detalhes de um funcionário.
- **`action createEmployee`**: Cria um novo funcionário.
- **`action updateEmployee`**: Atualiza um funcionário.
- **`action deleteEmployee`**: Deleta um funcionário.
- **`action updateEmployeeSchedules`**: Atualiza os horários de um funcionário.
- **`action updateEmployeeServices`**: Atualiza os serviços que um funcionário realiza.
- **`action uploadEmployeePhoto`**: Faz upload da foto de um funcionário.
- **`action linkEmployeeToUser`**: Vincula um funcionário a uma conta de usuário.
- **`action unlinkEmployeeFromUser`**: Desvincula um funcionário de uma conta de usuário.
- **`query listEmployeeSchedules`**: Lista os horários de um funcionário.
- **`action createEmployeeSchedule`**: Cria um horário para um funcionário.
- **`action updateEmployeeSchedule`**: Atualiza um horário de um funcionário.
- **`action deleteEmployeeSchedule`**: Deleta um horário de um funcionário.
- **`query listEmployeeServices`**: Lista os serviços de um funcionário.
- **`action assignServiceToEmployee`**: Atribui um serviço a um funcionário.
- **`action updateEmployeeServiceDetails`**: Atualiza detalhes do serviço de um funcionário.
- **`action removeServiceFromEmployee`**: Remove um serviço de um funcionário.

### Módulo: Appointments (Agendamentos)
- **`query listAppointments`**: Lista agendamentos.
- **`query getAppointment`**: Busca detalhes de um agendamento.
- **`query getAvailableSlots`**: Busca horários disponíveis.
- **`action createAppointment`**: Cria um novo agendamento.
- **`action updateAppointment`**: Atualiza um agendamento.
- **`action deleteAppointment`**: Deleta um agendamento.
- **`action updateAppointmentStatus`**: Atualiza o status de um agendamento.

### Módulo: Scheduling (Agendamento Avançado e Público)
- **`query listTimeBlocks`**: Lista bloqueios de tempo.
- **`query listWaitingList`**: Lista a fila de espera.
- **`action createTimeBlock`**: Cria um bloqueio de tempo.
- **`action addToWaitingList`**: Adiciona um cliente à fila de espera.
- **`query getPublicBookingConfig`**: (API Antiga) Busca configurações para agendamento público.
- **`query getPublicAvailability`**: (API Antiga) Busca disponibilidade pública.
- **`action createPublicBooking`**: (API Antiga) Cria um agendamento público.
- **`query getBookingConfig`**: Busca as configurações de agendamento do salão.
- **`action updateBookingConfig`**: Atualiza as configurações de agendamento.

### Módulo: Public Booking (Nova API Simplificada)
- **`query getPublicBookingPageConfig`**: Busca a configuração da página de agendamento público.
- **`query listPublicServices`**: Lista os serviços disponíveis publicamente.
- **`query listPublicEmployees`**: Lista os funcionários disponíveis publicamente.
- **`query calculateAvailability`**: Calcula a disponibilidade para agendamento público.
- **`action createPublicAppointment`**: Cria um agendamento a partir da página pública.

### Módulo: Sales (Vendas)
- **`query listSales`**: Lista todas as vendas.
- **`query getSale`**: Busca detalhes de uma venda.
- **`query listClientCredits`**: Lista os créditos de um cliente.
- **`action createSale`**: Cria uma nova venda.
- **`action updateSale`**: Atualiza uma venda.
- **`action closeSale`**: Fecha/finaliza uma venda.
- **`action cancelSale`**: Cancela uma venda.
- **`action addClientCredit`**: Adiciona crédito para um cliente.

### Módulo: Inventory (Estoque)
- **`query listProducts`**: Lista todos os produtos.
- **`query getProduct`**: Busca detalhes de um produto.
- **`query getLowStockProducts`**: Lista produtos com baixo estoque.
- **`query listProductCategories`**: Lista categorias de produtos.
- **`query listProductBrands`**: Lista marcas de produtos.
- **`query listSuppliers`**: Lista fornecedores.
- **`action createProduct`**: Cria um novo produto.
- **`action updateProduct`**: Atualiza um produto.
- **`action deleteProduct`**: Deleta um produto.
- **`action recordStockMovement`**: Registra uma movimentação de estoque.
- **`action createProductCategory`**: Cria uma categoria de produto.
- **`action updateProductCategory`**: Atualiza uma categoria de produto.
- **`action deleteProductCategory`**: Deleta uma categoria de produto.
- **`action createProductBrand`**: Cria uma marca de produto.
- **`action updateProductBrand`**: Atualiza uma marca de produto.
- **`action deleteProductBrand`**: Deleta uma marca de produto.
- **`action createSupplier`**: Cria um fornecedor.
- **`action updateSupplier`**: Atualiza um fornecedor.
- **`action deleteSupplier`**: Deleta um fornecedor.

### Módulo: Cash Register (Caixa)
- **`query listCashSessions`**: Lista as sessões de caixa.
- **`query getCashSession`**: Busca detalhes de uma sessão de caixa.
- **`query getDailyCashReport`**: Gera o relatório diário do caixa.
- **`action openCashSession`**: Abre uma nova sessão de caixa.
- **`action closeCashSession`**: Fecha uma sessão de caixa.
- **`action addCashMovement`**: Adiciona uma movimentação de caixa (sangria/suprimento).

### Módulo: Reports (Relatórios)
- **`query getSalesReport`**: Gera o relatório de vendas.
- **`query getCommissionsReport`**: Gera o relatório de comissões.
- **`query getInventoryReport`**: Gera o relatório de estoque.
- **`query getAppointmentReport`**: Gera o relatório de agendamentos.
- **`query getFinancialReport`**: Gera o relatório financeiro.

---

## 5. APIs Externas (`api`)

- **`api paymentsWebhook`**:
  - **Endpoint:** `POST /payments-webhook`
  - **Função:** `paymentsWebhook` de `@src/payment/webhook`.
  - **Descrição:** Webhook para receber eventos de pagamento (ex: Stripe), essencial para atualizar o status de assinaturas e pagamentos.

---

## 6. Jobs Agendados (`job`)

- **`job dailyStatsJob`**:
  - **Executor:** `PgBoss`
  - **Função:** `calculateDailyStats` de `@src/analytics/stats`.
  - **Agendamento (Cron):** `0 * * * *` (a cada hora).
  - **Descrição:** Job responsável por calcular e agregar estatísticas diárias de uso da plataforma, como novos usuários e outras métricas relevantes.

---

## 7. Análise Detalhada por Módulo

Nesta seção, cada módulo é analisado em detalhes, comparando as funcionalidades do frontend com as operações de backend disponíveis.

### Módulo: Clients (Clientes) - Análise de Frontend

- **Páginas Analisadas:**
  - `ClientsListPage.tsx` (`/clients`)
  - `ClientDetailPage.tsx` (`/clients/:id`)
  - `ClientNotesTab.tsx`
  - `ClientDocumentsTab.tsx`
  - `ClientHistoryTab.tsx`

- **Status Geral do Módulo:** **Parcialmente Implementado**

- **Funcionalidades Implementadas (Frontend):**
  - **`listClients` (Query):** Utilizada com sucesso na `ClientsListPage` para exibir, filtrar e paginar a lista de clientes. **Status: 100%**.
  - **`getClient` (Query):** Utilizada na `ClientDetailPage` para buscar todos os detalhes de um cliente específico. **Status: 100%**.
  - **`getClientNotes` (Query):** Utilizada na `ClientNotesTab` para listar as notas. **Status: 100%**.
  - **`addClientNote` (Action):** Implementada e funcional na `ClientNotesTab` para criar novas notas. **Status: 100%**.
  - **`updateClientNote` (Action):** Implementada e funcional na `ClientNotesTab` para editar notas existentes. **Status: 100%**.
  - **`deleteClientNote` (Action):** Implementada e funcional na `ClientNotesTab` para excluir notas. **Status: 100%**.
  - **`getClientDocuments` (Query):** Utilizada na `ClientDocumentsTab` para listar os documentos. **Status: 100%**.
  - **`deleteClientDocument` (Action):** Implementada e funcional na `ClientDocumentsTab`. **Status: 100%**.
  - **`getClientHistory` (Query):** Utilizada na `ClientHistoryTab` para exibir o histórico de atividades do cliente. **Status: 100%**.

- **Funcionalidades Ausentes ou Incompletas (GAPs):**
  - **`createClient` (Action):** **GAP!** A `ClientsListPage` possui um botão "New Client", mas ele não está conectado a nenhum formulário ou lógica para criar um novo cliente. A `action` existe no backend, mas não há interface para utilizá-la. **Status: 0%**.
  - **`updateClient` (Action):** **GAP Potencial.** A `ClientDetailPage` redireciona para uma rota `/edit`, mas é necessário verificar se a página de edição existe e se ela implementa esta `action`. A funcionalidade não está diretamente visível nas páginas analisadas. **Status: ?%**.
  - **`deleteClient` (Action):** **GAP!** Não há funcionalidade na interface para deletar um cliente, seja na lista ou na página de detalhes. A `action` existe, mas não é utilizada. **Status: 0%**.
  - **`uploadClientDocument` (Action):** **GAP!** A `ClientDocumentsTab` possui uma interface de upload, mas a chamada para a `action` está comentada e a funcionalidade não está implementada. **Status: 10% (apenas UI)**.
  - **`addClientTag` / `removeClientTag` (Actions):** **GAP!** Não foi encontrada nenhuma interface para adicionar ou remover tags de um cliente, embora a `query listClients` permita filtrar por tags. **Status: 0%**.
  - **Exportação para CSV:** A `ClientsListPage` tem um botão "Export", mas a funcionalidade não está implementada. Isso pode exigir uma nova `action` no backend. **Status: 10% (apenas UI)**.

### Módulo: Dashboard - Análise de Frontend

- **Página Analisada:**
  - `DashboardPage.tsx` (`/dashboard`)

- **Status Geral do Módulo:** **Parcialmente Implementado**

- **Funcionalidades Implementadas (Frontend):**
  - **`listClients` (Query):** Utilizada para obter a contagem total de clientes e exibir no card "Total Clients". **Status: 100%**.
  - **`listAppointments` (Query):** Utilizada para buscar os agendamentos do dia e calcular as estatísticas do card "Appointments Today" (total, concluídos, pendentes). **Status: 100%**.
  - **Links de Ação Rápida:** A página contém botões de "Ação Rápida" que redirecionam para as seções de `Appointments`, `Sales`, `Clients` e `Services`. A funcionalidade de link está correta. **Status: 100%**.

- **Funcionalidades Ausentes ou Incompletas (GAPs):**
  - **Cálculo de Receita (`Revenue`):** **GAP!** O card "Revenue (Month)" exibe um valor estático (`R$ --`) e a mensagem "Coming soon". Nenhuma `query` financeira (como `getFinancialReport` ou `getSalesReport`) é chamada para calcular este valor. **Status: 0%**.
  - **Cálculo de Crescimento (`Growth Rate`):** **GAP!** O card "Growth Rate" exibe um valor estático (`--`) e a mensagem "Coming soon". Nenhuma `query` de analytics (como `getDailyStats`) é utilizada para calcular essa métrica. **Status: 0%**.
  - **Lógica de Agendamentos:** A query `listAppointments` busca os últimos 100 agendamentos, e o filtro para "hoje" é feito no frontend. Isso é ineficiente e pode falhar se houver mais de 100 agendamentos no período. A `query` deveria aceitar parâmetros de data para filtrar no backend. **Status: 50% (Funcional, mas ineficiente)**.

### Módulo: Appointments (Agendamentos)

- **Páginas Analisadas:**
  - `admin/elements/calendar/CalendarPage.tsx` (`/admin/calendar`)
  - Verificação da ausência de uma página principal de agendamentos.

- **Status Geral do Módulo:** **Grande GAP Funcional**

- **Funcionalidades Implementadas (Frontend):**
  - **NENHUMA.** A página `/admin/calendar` é um componente estático que exibe um layout de calendário, mas não busca nem exibe dados de agendamentos. Não há chamadas para `listAppointments` ou qualquer outra `query`.

- **Funcionalidades Ausentes ou Incompletas (GAPs):**
  - **Página Principal de Agendamentos:** **GAP CRÍTICO!** Não existe uma página principal para visualização e gerenciamento de agendamentos (ex: `/appointments`). O link na `DashboardPage` aponta para uma rota inexistente. Toda a interface de calendário funcional, que deveria ser o coração do sistema, está ausente.
  - **`listAppointments` (Query):** Não é utilizada em nenhuma página de calendário funcional.
  - **`getAppointment` (Query):** Não há interface para ver os detalhes de um agendamento.
  - **`createAppointment` (Action):** Não há formulário ou modal para criar novos agendamentos.
  - **`updateAppointment` (Action):** Não há interface para editar agendamentos existentes.
  - **`deleteAppointment` (Action):** Não há funcionalidade para cancelar/deletar agendamentos.
  - **`updateAppointmentStatus` (Action):** Não há como alterar o status de um agendamento (ex: de 'Pendente' para 'Confirmado' ou 'Concluído').
  - **Visualização de Horários (`getAvailableSlots`):** Nenhuma interface utiliza esta `query` para mostrar horários disponíveis.

- **Conclusão do Módulo:** Este módulo possui um backend robusto, mas o frontend correspondente é quase totalmente inexistente. A criação da interface de calendário é uma das tarefas mais críticas e de maior prioridade para o sistema se tornar funcional.

### Módulo: Sales (Vendas)

- **Página Analisada:**
  - `SalesListPage.tsx` (Rota `/sales` não definida, mas arquivo existe)

- **Status Geral do Módulo:** **Grande GAP Funcional**

- **Funcionalidades Implementadas (Frontend):**
  - **`listSales` (Query):** Utilizada com sucesso na `SalesListPage` para exibir e paginar a lista de vendas. **Status: 100%**.

- **Funcionalidades Ausentes ou Incompletas (GAPs):**
  - **Rota de Vendas:** **GAP CRÍTICO!** Não existe uma rota definida em `main.wasp` para a página de vendas. O arquivo `SalesListPage.tsx` existe, mas não pode ser acessado. O link na `DashboardPage` aponta para `/sales`, que resultará em um erro 404.
  - **`createSale` (Action):** **GAP!** A página de listagem possui um botão "New Sale", mas ele não tem funcionalidade e não há interface para criar uma nova venda.
  - **`getSale` (Query):** **GAP!** A tabela de vendas tem um botão "View" para cada venda, mas ele não está conectado a nenhuma página de detalhes. A `query` para buscar os detalhes de uma venda específica não é utilizada.
  - **`updateSale` (Action):** **GAP!** Não há interface para editar uma venda em andamento.
  - **`closeSale` (Action):** **GAP!** Funcionalidade crítica ausente. Não há como finalizar uma venda, registrar pagamentos, aplicar descontos, etc.
  - **`cancelSale` (Action):** **GAP!** Não há como cancelar uma venda.
  - **Gestão de Crédito de Cliente (`listClientCredits`, `addClientCredit`):** **GAP!** Nenhuma interface relacionada à gestão de créditos de clientes foi encontrada.

- **Conclusão do Módulo:** Similar ao módulo de Agendamentos, o módulo de Vendas tem um backend com muitas operações, mas o frontend é extremamente limitado. Existe apenas uma página de listagem que não pode ser acessada e que não implementa nenhuma das ações essenciais de um PDV (Ponto de Venda). A implementação completa deste módulo é de alta prioridade.

### Módulo: Inventory (Estoque)

- **Páginas Analisadas:**
  - `InventoryDashboard.tsx`
  - `InventoryListPage.tsx`

- **Status Geral do Módulo:** **Parcialmente Implementado**

- **Funcionalidades Implementadas (Frontend):**
  - **`listProducts` (Query):** Utilizada na `InventoryListPage` para listar, buscar e filtrar produtos. Também usada no `InventoryDashboard` para calcular estatísticas. **Status: 100%**.
  - **`getLowStockProducts` (Query):** Utilizada no `InventoryDashboard` para o card "Low Stock Alerts" e para listar os produtos com baixo estoque. **Status: 100%**.

- **Funcionalidades Ausentes ou Incompletas (GAPs):**
  - **Rota de Estoque:** **GAP!** Não há rotas definidas em `main.wasp` para as páginas de inventário. Os arquivos existem, mas não são acessíveis.
  - **`createProduct` (Action):** **GAP!** O botão "New Product" na `InventoryListPage` não possui funcionalidade. Não há interface para adicionar novos produtos.
  - **`getProduct` (Query):** **GAP!** O botão "View" na tabela de produtos não tem ação. Não há página de detalhes do produto para utilizar esta `query`.
  - **`updateProduct` (Action):** **GAP!** Não há interface para editar produtos existentes.
  - **`deleteProduct` (Action):** **GAP!** Não há como marcar um produto como inativo/deletado.
  - **`recordStockMovement` (Action):** **GAP!** Funcionalidade crítica ausente. Não há interface para registrar entradas (compras) ou saídas (uso interno, perdas) de estoque.
  - **Gestão de Categorias, Marcas e Fornecedores:** **GAP!** Todo o conjunto de `queries` e `actions` para gerenciar (`create`, `update`, `delete`) categorias, marcas e fornecedores não possui interface correspondente.

- **Conclusão do Módulo:** O módulo de inventário possui um bom começo com um dashboard informativo e uma página de listagem funcional. No entanto, todas as ações de escrita (criar, atualizar, deletar, movimentar estoque) estão ausentes, tornando o módulo somente leitura na prática. A implementação dos formulários e páginas de detalhes é essencial.

### Módulo: Services (Serviços)

- **Página Analisada:**
  - `ServicesListPage.tsx`

- **Status Geral do Módulo:** **Grande GAP Funcional**

- **Funcionalidades Implementadas (Frontend):**
  - **`listServices` (Query):** Utilizada na `ServicesListPage` para listar e buscar os serviços. **Status: 100%**.

- **Funcionalidades Ausentes ou Incompletas (GAPs):**
  - **Rota de Serviços:** **GAP!** Não há rota definida em `main.wasp` para a página de serviços. O link na `DashboardPage` aponta para `/services`, que resultará em um erro 404.
  - **`createService` (Action):** **GAP!** O botão "New Service" não tem funcionalidade. Não há interface para criar novos serviços.
  - **`getService` (Query):** **GAP!** Não há página de detalhes para um serviço, portanto esta `query` não é utilizada.
  - **`updateService` (Action):** **GAP!** O botão "Edit" na tabela não tem funcionalidade.
  - **`deleteService` (Action):** **GAP!** O botão "Delete" na tabela não tem funcionalidade.
  - **Gestão de Variantes (`create/update/deleteServiceVariant`):** **GAP!** Não há interface para gerenciar variantes de serviços.
  - **Gestão de Comissão (`manageCommissionConfig`):** **GAP!** Não há interface para configurar comissões.

- **Conclusão do Módulo:** Assim como outros módulos, apenas a listagem está implementada. Todas as funcionalidades de criação, edição e gerenciamento avançado (variantes, comissões) estão ausentes.

---

### Módulo: Employees (Funcionários)

- **Página Analisada:**
  - `EmployeesListPage.tsx`

- **Status Geral do Módulo:** **Parcialmente Implementado**

- **Funcionalidades Implementadas (Frontend):**
  - **`listEmployees` (Query):** Utilizada na `EmployeesListPage` para listar e buscar funcionários. **Status: 100%**.
  - **Navegação:** Os botões na página redirecionam para rotas como `/employees/new`, `/employees/:id/edit`, e `/employees/:id/schedules`.

- **Funcionalidades Ausentes ou Incompletas (GAPs):**
  - **Rotas de Funcionários:** **GAP!** Nenhuma das rotas para funcionários (`/employees`, `/employees/new`, etc.) está definida em `main.wasp`.
  - **`deleteEmployee` (Action):** **GAP!** O botão de exclusão na tabela possui um `confirm`, mas a chamada para a `action` está comentada (`// TODO`).
  - **Páginas de Criação/Edição:** É necessário verificar os arquivos `CreateEmployeePage.tsx` e `EditEmployeePage.tsx` para analisar a implementação das `actions` `createEmployee` e `updateEmployee`.
  - **Página de Horários:** É necessário verificar `EmployeeSchedulesPage.tsx` para analisar a implementação das `actions` de gerenciamento de horários.
  - **Gestão de Serviços do Funcionário:** **GAP!** Não há interface visível na listagem para gerenciar os serviços que um funcionário realiza (`updateEmployeeServices`, etc.).

- **Conclusão do Módulo:** A página de listagem está bem estruturada, mas as rotas não existem e a funcionalidade de exclusão está incompleta. A análise das páginas de criação/edição é necessária para ter uma visão completa.

---

### Módulo: Cash Register (Caixa)

- **Página Analisada:**
  - `CashRegisterPage.tsx`

- **Status Geral do Módulo:** **Grande GAP Funcional**

- **Funcionalidades Implementadas (Frontend):**
  - **`listCashSessions` (Query):** Utilizada para listar o histórico de sessões de caixa e verificar se o usuário atual tem uma sessão aberta. **Status: 100%**.

- **Funcionalidades Ausentes ou Incompletas (GAPs):**
  - **Rota de Caixa:** **GAP!** Não há rota definida em `main.wasp` para a página de caixa.
  - **`openCashSession` (Action):** **GAP!** O botão "Open Session" não possui funcionalidade.
  - **`closeCashSession` (Action):** **GAP!** O botão "Close Session" no card da sessão ativa não possui funcionalidade.
  - **`getCashSession` (Query):** **GAP!** Não há página de detalhes para uma sessão de caixa.
  - **`addCashMovement` (Action):** **GAP!** Não há interface para adicionar sangrias ou suprimentos.
  - **`getDailyCashReport` (Query):** **GAP!** Nenhuma funcionalidade de relatório diário está visível.

- **Conclusão do Módulo:** A página tem uma boa estrutura visual, mas, na prática, é somente leitura. Nenhuma das ações essenciais para operar o caixa está implementada.

---

### Módulo: Reports (Relatórios)

- **Página Analisada:**
  - `ReportsPage.tsx`

- **Status Geral do Módulo:** **Não Implementado (Apenas Mockup)**

- **Funcionalidades Implementadas (Frontend):**
  - **NENHUMA.** A página é um mockup completamente estático. Ela exibe dados falsos e nenhum dos botões "View Full Report" tem funcionalidade.

- **Funcionalidades Ausentes ou Incompletas (GAPs):**
  - **Rota de Relatórios:** **GAP!** Não há rota definida em `main.wasp`.
  - **Todas as Queries de Relatório:** **GAP CRÍTICO!** Nenhuma das `queries` (`getSalesReport`, `getCommissionsReport`, `getInventoryReport`, `getAppointmentReport`, `getFinancialReport`) é utilizada. O módulo inteiro de relatórios existe no backend, mas não tem nenhuma conexão com o frontend.

- **Conclusão do Módulo:** O módulo de relatórios está 0% implementado no frontend. É apenas uma página de fachada.

---

## 8. Resumo Final e Plano de Ação

Após uma análise detalhada de `main.wasp` e dos principais arquivos de frontend, a auditoria revela um padrão consistente: o backend do Glamo é extenso e rico em funcionalidades, mas o frontend correspondente está em um estágio significativamente anterior de desenvolvimento. Muitos módulos essenciais existem apenas como páginas de listagem (somente leitura) e carecem de funcionalidades CRUD (Criar, Ler, Atualizar, Deletar) completas.

### Status Geral da Aplicação

- **Backend:** Robusto e abrangente, cobrindo a maioria das operações necessárias para um sistema de gestão de salão.
- **Frontend:** Parcialmente implementado. A base da UI (componentes, layout) é sólida, mas as páginas funcionais estão incompletas ou são inexistentes.
- **Conectividade:** Onde implementado (principalmente em listagens), o frontend se conecta corretamente às `queries` do backend. O principal problema é a ausência de interfaces para chamar as `actions`.

### Classificação dos Módulos por Status de Frontend

- **Funcional (com GAPs menores):**
  - **Clientes:** Visualização funcional. Faltam CRUD e gerenciamento de tags/documentos.

- **Grandes GAPs Funcionais (Funcionalidade de Escrita Ausente):**
  - **Dashboard:** Cards de estatísticas básicas funcionam; cards financeiros não.
  - **Vendas (Sales):** Apenas listagem. Funcionalidade de PDV ausente.
  - **Estoque (Inventory):** Apenas listagem/dashboard. Gerenciamento de estoque ausente.
  - **Serviços:** Apenas listagem. CRUD ausente.
  - **Funcionários (Employees):** Listagem funcional. CRUD e gerenciamento de horários/serviços dependem de páginas não verificadas/rotas inexistentes.
  - **Caixa (Cash Register):** Apenas listagem. Operações de caixa ausentes.

- **Não Implementado / Mockup Estático:**
  - **Agendamentos (Appointments):** **Prioridade Máxima.** O coração do sistema é um mockup.
  - **Relatórios (Reports):** **Prioridade Alta.** Módulo inteiro é um mockup.

### Plano de Ação Priorizado (To-Do List)

Para que o sistema atinja um estado de "versão 1.0" funcional, as seguintes tarefas devem ser executadas, em ordem de prioridade:

**Prioridade Máxima: Funcionalidades Essenciais**

1.  **Implementar Módulo de Agendamentos:**
    - [ ] Criar a rota `/appointments` em `main.wasp`.
    - [ ] Desenvolver uma página de calendário interativa (`AppointmentsPage.tsx`) que utilize `listAppointments` para exibir os agendamentos.
    - [ ] Implementar um modal/formulário para `createAppointment` e `updateAppointment`.
    - [ ] Adicionar funcionalidade para `deleteAppointment` e `updateAppointmentStatus`.
    - [ ] Utilizar `getAvailableSlots` para mostrar horários disponíveis ao agendar.

2.  **Implementar Módulo de Vendas (PDV):**
    - [ ] Criar as rotas `/sales` e `/sales/:id` em `main.wasp`.
    - [ ] Desenvolver a interface de "Nova Venda" para usar a `action createSale`.
    - [ ] Criar uma página de detalhes da venda (`SaleDetailPage.tsx`) que use `getSale`.
    - [ ] Implementar a funcionalidade de `closeSale`, incluindo a seleção de métodos de pagamento.
    - [ ] Adicionar a funcionalidade de `cancelSale`.

**Prioridade Alta: Gerenciamento Principal**

3.  **Completar Módulo de Clientes:**
    - [ ] Criar a rota e a página/modal para `createClient`.
    - [ ] Implementar a funcionalidade de `deleteClient`.
    - [ ] Implementar a funcionalidade de `updateClient` (verificar/criar a página de edição).
    - [ ] Ativar a `action uploadClientDocument` na aba de documentos.

4.  **Completar Módulo de Estoque:**
    - [ ] Criar as rotas `/inventory` e `/inventory/:id` em `main.wasp`.
    - [ ] Implementar a interface para `createProduct` e `updateProduct`.
    - [ ] Implementar a interface para `recordStockMovement` (entrada/saída de estoque).
    - [ ] Criar interfaces para gerenciar categorias, marcas e fornecedores.

5.  **Completar Módulo de Serviços:**
    - [ ] Criar a rota `/services` em `main.wasp`.
    - [ ] Implementar a interface para `createService` e `updateService`.
    - [ ] Implementar a funcionalidade de `deleteService`.

**Prioridade Média: Funcionalidades de Suporte e Analytics**

6.  **Implementar Módulo de Relatórios:**
    - [ ] Criar a rota `/reports` em `main.wasp`.
    - [ ] Substituir o mockup estático por chamadas reais às `queries` de relatório (`getSalesReport`, `getFinancialReport`, etc.).
    - [ ] Adicionar visualizações de dados (gráficos) para os relatórios.

7.  **Completar Módulo de Caixa:**
    - [ ] Criar a rota `/cash-register` em `main.wasp`.
    - [ ] Implementar as `actions` `openCashSession` e `closeCashSession`.
    - [ ] Implementar a `action` `addCashMovement`.

8.  **Completar Módulo de Funcionários:**
    - [ ] Criar as rotas para funcionários em `main.wasp`.
    - [ ] Implementar a `action` `deleteEmployee`.
    - [ ] Garantir que as páginas de criação/edição (`CreateEmployeePage`, `EditEmployeePage`) estejam funcionais.

9.  **Atualizar Dashboard:**
    - [ ] Implementar chamadas às `queries` financeiras para popular os cards de "Revenue" e "Growth Rate".
    - [ ] Otimizar a `query` de agendamentos para buscar apenas os do dia.
