# Documento Consolidado do Projeto Glamo

## 1. Introdução

Este documento representa uma consolidação abrangente do estado atual do projeto Glamo, integrando informações de diversas fontes fornecidas: Documento de Requisitos, Documentação Técnica, Documentação de API, Diagrama de Entidade-Relacionamento (ERD) e o código-fonte exportado. O objetivo é criar um repositório único e atualizado que sirva como referência principal para o entendimento do sistema, suas funcionalidades, arquitetura e implementação.

As informações foram extraídas e combinadas dos seguintes arquivos:

*   `DOCUMENTO DE REQUISITOS - Glamo.md`
*   `DOCUMENTAÇÃO TÉCNICA - Glamo.md`
*   `DOCUMENTAÇÃO DE API - Glamo.md`
*   `ERD.md`
*   `project-exported.md`

Em casos de discrepâncias ou evoluções, buscou-se refletir o estado mais atualizado, frequentemente inferido a partir do código-fonte, mas também considerando a intenção original descrita nos requisitos e documentações. Este documento será estruturado para cobrir todos os aspectos relevantes do projeto.

## 2. Visão Geral do Projeto

O Glamo é um sistema de gestão projetado especificamente para salões de beleza e estabelecimentos similares. Seu objetivo principal é centralizar e otimizar as operações diárias, abrangendo desde o gerenciamento de clientes e agendamentos até o controle financeiro, estoque de produtos e cálculo de comissões para profissionais. O sistema visa fornecer ferramentas robustas para proprietários, gerentes e profissionais do negócio, além de potencialmente oferecer funcionalidades para os clientes finais (como agendamento online, embora não explicitamente detalhado como funcionalidade principal nos requisitos iniciais).

**Principais Módulos e Funcionalidades:**

*   **Gestão de Usuários e Acesso:** Cadastro, autenticação, recuperação de senha, gerenciamento de múltiplos salões por usuário, papéis e permissões customizáveis.
*   **Gestão de Clientes (CRM):** Cadastro, histórico de serviços, vendas, créditos e agendamentos.
*   **Agendamentos:** Criação, edição, cancelamento, visualização de calendário, agendamentos recorrentes, controle de conflitos, gestão de status e notificações.
*   **Gestão de Serviços:** Cadastro de serviços, durações, preços e variações.
*   **Gestão de Produtos e Estoque:** Cadastro de produtos (com categorias, marcas, fornecedores), controle de estoque (atual, mínimo, movimentações), alertas de estoque baixo.
*   **Vendas e Pagamentos:** Registro de vendas (produtos e serviços), aplicação de vouchers, múltiplos métodos de pagamento, controle de status de pagamento, gestão de créditos de cliente.
*   **Comissionamento:** Cálculo automático de comissões para profissionais com regras flexíveis (simples, avançada, por contexto).
*   **Controle de Caixa:** Abertura e fechamento de caixa diário e por profissional, registro de movimentações.
*   **Relatórios e Análises:** KPIs gerenciais, relatórios filtráveis e exportáveis (vendas, agendamentos, etc.).
*   **Notificações:** Sistema de notificações internas e potencialmente externas (push, e-mail).
*   **Logs e Auditoria:** Rastreamento de ações críticas no sistema.

## 3. Requisitos Funcionais e Não Funcionais

## 3. Requisitos Funcionais e Não Funcionais

Esta seção detalha os requisitos funcionais (RF) e não funcionais (RNF) conforme especificado no documento original, servindo como base para comparação com a implementação atual.

**Requisitos Funcionais (RF)**

**RF - Usuários, Autenticação e Acesso**

*   **RF.001 - Cadastro e Autenticação de Usuários**
    *   RF.001.01 O sistema deve permitir o cadastro de usuários com nome, e-mail, senha, telefone e endereço.
    *   RF.001.02 O sistema deve validar a unicidade do e-mail.
    *   RF.001.03 O sistema deve criptografar a senha dos usuários utilizando algoritmo seguro.
    *   RF.001.04 O sistema deve permitir login via e-mail e senha.
    *   RF.001.05 O sistema deve permitir recuperação de senha via e-mail.
    *   RF.001.06 O sistema deve permitir a autenticação por token (JWT).
*   **RF.002 - Atribuição de Papéis e Permissões**
    *   RF.002.01 O sistema deve permitir que cada usuário esteja associado a um ou mais salões.
    *   RF.002.02 Cada associação usuário ↔ negócio deve conter papéis e permissões específicos.
    *   RF.002.03 O dono do negócio pode criar papéis personalizados com permissões específicas.
    *   RF.002.04 O sistema deve controlar o acesso a funcionalidades com base nas permissões atribuídas.
    *   RF.002.05 O sistema deve permitir a visualização de todas as permissões do usuário autenticado no negócio ativo via endpoint dedicado.
*   **RF.003 - Alternância de Salões**
    *   RF.003.01 O sistema deve permitir ao usuário alternar entre os salões que participa.
    *   RF.003.02 A alternância define o "negócio ativo", cujos dados serão exibidos na interface.
*   **RF.004 - Notificações**
    *   RF.004.01 O sistema deve permitir o envio de notificações aos usuários via painel interno.
    *   RF.004.02 As notificações podem ser geradas manualmente ou automaticamente pelo sistema.
    *   RF.004.03 O usuário deve poder marcar notificações como lidas.
    *   RF.004.04 O sistema deve registrar se a notificação foi gerada pelo sistema (systemGenerated).
    *   RF.004.05 O sistema deve suportar múltiplos canais de envio de notificação (painel interno, push, e-mail e WhatsApp - futuro).
    *   RF.004.06 O sistema deve registrar o canal utilizado para envio da notificação.
*   **RF.005 - Logs e Auditoria**
    *   RF.005.01 O sistema deve registrar logs de ações administrativas críticas (criação, atualização, exclusão).
    *   RF.005.02 Cada log deve conter o usuário responsável, a entidade alterada e os dados antes e depois da ação.
    *   RF.005.03 Os logs devem ser imutáveis e disponíveis apenas para administradores com permissão.

**RF - Gestão de Clientes**

*   **RF.006 - Gestão de Clientes**
    *   RF.006.01 O sistema deve permitir o cadastro de clientes por meio de formulário.
    *   RF.006.02 Cada cliente pode estar vinculado a um ou mais salões.
    *   RF.006.03 Um cliente pode estar vinculado a um usuário (login próprio) ou ser gerenciado apenas pelo negócio.
    *   RF.006.04 O sistema deve armazenar nome, telefone, e-mail, data de nascimento e observações.
    *   RF.006.05 O sistema deve manter histórico de serviços realizados, vendas, créditos e agendamentos por cliente.

**RF - Agendamentos**

*   **RF.007 - Agendamentos de Serviços**
    *   RF.007.01 O sistema deve permitir que usuários com permissão agendem atendimentos para clientes.
    *   RF.007.02 Um agendamento pode conter um ou mais serviços, com variações e valores personalizados.
    *   RF.007.03 Cada serviço pode ser executado com ou sem assistentes.
    *   RF.007.04 O sistema deve permitir agendamentos recorrentes com data de fim (repeatUntil).
    *   RF.007.05 O sistema deve calcular o tempo total do atendimento baseado na duração dos serviços e auxiliar(es).
    *   RF.007.06 O sistema deve impedir agendamentos conflitantes com horários já ocupados.
    *   RF.007.07 O sistema deve disponibilizar horários disponíveis por profissional via endpoint /appointments/available-slots.
*   **RF.008 - Status e Rastreamento de Agendamentos**
    *   RF.008.01 O sistema deve registrar status de agendamentos (ex: agendado, cancelado, finalizado).
    *   RF.008.02 Alterações de status devem ser registradas na tabela APPOINTMENT_STATUS_LOGS.
    *   RF.008.03 Cada log deve conter o status anterior, novo status, data/hora e usuário responsável.
*   **RF.009 - Notificações de Agendamento**
    *   RF.009.01 O sistema deve enviar notificações para o cliente e profissional quando o agendamento for criado ou alterado.
    *   RF.009.02 O sistema deve permitir lembretes automáticos de agendamento via push, e-mail ou WhatsApp (futuro).
    *   RF.009.03 As notificações devem conter o horário, local, serviços e profissional envolvido.
    *   RF.009.04 O sistema deve registrar logs de envio e leitura dessas notificações.

**RF - Promoções e Vouchers**

*   **RF.010 - Gestão de Vouchers**
    *   RF.010.01 O sistema deve permitir a criação de vouchers com valor fixo ou percentual de desconto.
    *   RF.010.02 Um voucher pode ter validade limitada por data, número de usos ou ambos.
    *   RF.010.03 Vouchers podem ser aplicados a agendamentos ou vendas, conforme applicableTo.
    *   RF.010.04 O sistema deve atualizar automaticamente o número de vezes que o voucher foi utilizado (usedCount).
    *   RF.010.05 Vouchers expirados ou utilizados no limite devem ser marcados como inativos automaticamente.
    *   RF.010.06 O sistema deve registrar o histórico de uso de vouchers (quem utilizou, em qual venda/agendamento e quando).

**RF - Produtos e Estoque**

*   **RF.011 - Cadastro e Gestão de Produtos**
    *   RF.011.01 O sistema deve permitir o cadastro de produtos com nome, descrição, marca, categoria e fornecedor.
    *   RF.011.02 O sistema deve armazenar preço de custo, preço de venda, comissão sobre a venda e unidade de medida.
    *   RF.011.03 Cada produto deve conter informações de estoque atual, estoque inicial e estoque mínimo.
    *   RF.011.04 O sistema deve gerar alertas automáticos para produtos abaixo do estoque mínimo.
    *   RF.011.05 Produtos arquivados não devem ser exibidos na tela de venda, mas devem permanecer no histórico.
    *   RF.011.06 O sistema deve registrar movimentações de estoque com valores anterior e final (previousQuantity, finalQuantity).
*   **RF.012 - Categorias e Marcas**
    *   RF.012.01 O sistema deve permitir o cadastro e edição de categorias de produtos.
    *   RF.012.02 O sistema deve permitir o cadastro de marcas vinculadas aos produtos.
*   **RF.013 - Fornecedores**
    *   RF.013.01 O sistema deve permitir o cadastro de fornecedores com nome, e-mail, telefones e CNPJ.
    *   RF.013.02 Deve ser possível relacionar cada produto a um fornecedor.
    *   RF.013.03 O sistema deve permitir visualizar todos os produtos fornecidos por um mesmo fornecedor.
*   **RF.014 - Controle de Estoque**
    *   RF.014.01 Toda movimentação de estoque (entrada ou saída) deve ser registrada na tabela STOCK_RECORDS.
    *   RF.014.02 O sistema deve registrar tipo de movimentação (entrada, saída, correção), quantidade e motivo.
    *   RF.014.03 A movimentação de estoque deve atualizar automaticamente o campo stockQuantity do produto.
    *   RF.014.04 O sistema deve permitir corrigir o estoque manualmente com um motivo justificado.

**RF - Vendas e Financeiro**

*   **RF.015 - Vendas**
    *   RF.015.01 O sistema deve permitir registrar vendas com um ou mais produtos, serviços ou pacotes.
    *   RF.015.02 A venda deve conter o cliente, o usuário responsável, o valor original, descontos e valor final.
    *   RF.015.03 O sistema deve permitir aplicar vouchers em vendas.
    *   RF.015.04 Cada item vendido (produto, serviço, pacote) deve ser registrado em sua respectiva tabela: SALE_PRODUCTS, SALE_SERVICES, SALE_PACKAGES.
    *   RF.015.05 As vendas devem ser listadas por período, cliente e tipo de item vendido.
    *   RF.015.06 O sistema deve suportar cancelamento e reembolso parcial de vendas, com registro do motivo.
    *   RF.015.07 O sistema deve permitir reimpressão de comandas com rastreamento das reimpressões (logs)
*   **RF.016 - Pagamentos**
    *   RF.016.01 O sistema deve permitir registrar pagamentos associados a uma venda.
    *   RF.016.02 Um pagamento deve conter: método de pagamento, valor pago e status (aprovado, pendente, recusado).
    *   RF.016.03 Os métodos de pagamento devem ser definidos na tabela PAYMENT_METHODS.
    *   RF.016.04 O sistema deve permitir múltiplos pagamentos para uma mesma venda (ex: parte Pix, parte dinheiro).
    *   RF.016.05 O sistema deve exibir o status de pagamento no detalhe da venda e do agendamento.
*   **RF.017 - Créditos de Cliente**
    *   RF.017.01 O sistema deve permitir adicionar créditos manuais ao cliente, informando origem e forma de pagamento.
    *   RF.017.02 Créditos podem ser aplicados parcial ou integralmente em pagamentos futuros.
    *   RF.017.03 O consumo de créditos deve ser registrado na tabela CREDIT_PAYMENTS.
    *   RF.017.04 O sistema deve permitir visualizar o saldo de créditos de cada cliente.
    *   RF.017.05 O crédito deve ter rastreabilidade de origem, data, profissional e observações.
*   **RF.018 - Cálculo de Comissões**
    *   RF.018.01 O sistema deve calcular comissões de profissionais com base na configuração do serviço e produto.
    *   RF.018.02 Cada serviço pode ter uma regra simples (fixa ou percentual) ou avançada:
        *   Comissão sozinha
        *   Comissão com assistente
        *   Comissão como assistente
    *   RF.018.03 O sistema deve registrar a comissão de cada item vendido (serviço ou produto) no momento da venda.
    *   RF.018.04 O sistema deve permitir emissão de relatório por período e por profissional com totais de comissão.
    *   RF.018.05 O sistema deve permitir configurar se a comissão dos assistentes será subtraída do profissional.
    *   RF.018.06 O sistema deve permitir exceções manuais de comissão por campanha ou bonificação específica.
*   **RF.019 - Controle de Caixa**
    *   RF.019.01 O sistema deve permitir abertura e fechamento de caixa diário por colaborador.
    *   RF.019.02 Cada operação (pagamento, sangria, suprimento) deve ser registrada com horário e valor.
    *   RF.019.03 O sistema deve calcular automaticamente o saldo final com base nas entradas e saídas.
    *   RF.019.04 Deve ser possível imprimir ou exportar o extrato diário do caixa.
    *   RF.019.05 A abertura de caixa deve conter o saldo inicial informado.
    *   RF.019.06 O sistema deve identificar quem abriu e quem fechou o caixa, e indicar se o fechamento foi conciliado.

**RF - Relatórios**

*   **RF.020 - Relatórios e Dashboards**
    *   RF.020.01 O sistema deve permitir visualização de KPIs gerenciais, incluindo:
        *   Total de vendas
        *   Agendamentos por profissional
        *   Clientes recorrentes vs. novos
        *   Valor médio por venda
    *   RF.020.02 Os relatórios devem ter filtros por período, profissional e tipo de item vendido.
    *   RF.020.03 O sistema deve permitir exportar relatórios em PDF, CSV e Excel.

**Requisitos Não-Funcionais (RNF)**

*   **RNF.001 - Arquitetura e Escalabilidade**
    *   RNF.001.01 O sistema deve ser construído com arquitetura **modular e escalável**, utilizando **Node.js** no backend com **PostgreSQL** como banco de dados relacional e **Redis** para caching.
    *   RNF.001.02 O frontend deve ser baseado em **React + Next.js + TailwindCSS + ShadCN UI** (para web) e **Expo + React Native + NativeWind** (para mobile), com APIs REST entre os módulos.
    *   RNF.001.03 A aplicação deve ser **dockerizada**, permitindo múltiplas instâncias em ambientes de staging e produção.
    *   RNF.001.04 O backend deve ser estruturado com middlewares, controllers e services separados, garantindo manutenibilidade.
    *   RNF.001.05 O sistema deve utilizar Redis para cache de sessões, filas de notificação e proteção contra requisições excessivas (rate limit).
*   **RNF.002 - Performance**
    *   RNF.002.01 O sistema deve suportar pelo menos **500 usuários simultâneos** em seu pico inicial, escalando horizontalmente quando necessário.
    *   RNF.002.02 O tempo médio de resposta da API para operações padrão (CRUD simples) deve ser inferior a **300ms**.
    *   RNF.002.03 Operações críticas com múltiplas dependências (vendas, fechamento de caixa) devem responder em até **1 segundo**.
*   **RNF.003 - Segurança**
    *   RNF.003.01 Toda comunicação entre frontend e backend deve ocorrer via HTTPS.
    *   RNF.003.02 Senhas de usuários devem ser **criptografadas** utilizando algoritmos fortes como bcrypt.
    *   RNF.003.03 O sistema deve implementar **JWT com refresh tokens** para autenticação segura.
    *   RNF.003.04 Todas as ações sensíveis devem ser registradas em log com identificação do usuário e timestamp.
    *   RNF.003.05 O sistema deve implementar controle de acesso baseado em permissões e papéis customizáveis.
    *   RNF.003.06 Deve haver proteção contra **injeção de SQL**, **XSS** e **CSRF** nas interfaces.
*   **RNF.004 - Disponibilidade e Tolerância a Falhas**
    *   RNF.004.01 O sistema deve estar disponível **24x7**, com mecanismos de retry em operações críticas.
    *   RNF.004.02 Logs de erro devem ser registrados com detalhes, incluindo stack trace, em arquivos e serviços externos (ex: LogDNA, Winston).
    *   RNF.004.03 O banco de dados deve ter backups automáticos diários e retenção por pelo menos **30 dias**.
*   **RNF.005 - Usabilidade e Interface**
    *   RNF.005.01 O sistema deve seguir padrões de design responsivo, com usabilidade otimizada para desktop e mobile.
    *   RNF.005.02 A interface do sistema deve ser intuitiva e suportar **tema escuro e claro** (dark/light mode).
    *   RNF.005.03 Campos de formulário devem conter validações claras e feedback ao usuário em tempo real.
    *   RNF.005.04 O sistema deve oferecer acessibilidade mínima com suporte a leitores de tela e atalhos de navegação.
*   **RNF.006 - Integrações**
    *   RNF.006.01 O sistema deve se integrar com APIs externas como:
        *   Google Maps (localização de salões)
        *   Gateways de pagamento (ex: Mercado Pago, PagSeguro, Pix)
        *   Sistemas de envio de notificações (push/email/SMS via Firebase ou OneSignal)
        *   Emissores de Nota Fiscal Eletrônica (NF-e)
    *   RNF.006.02 Em caso de falha nas integrações, o sistema deve aplicar retries e fallback para canais alternativos (quando possível).
*   **RNF.007 - LGPD e Privacidade**
    *   RNF.007.01 O sistema deve garantir a conformidade com a **Lei Geral de Proteção de Dados (LGPD)**.
    *   RNF.007.02 O usuário deve poder solicitar a exclusão de seus dados pessoais.
    *   RNF.007.03 A política de privacidade e os termos de uso devem ser visíveis na plataforma.
    *   RNF.007.04 O sistema deve registrar consentimento explícito do usuário no primeiro acesso.
    *   RNF.007.05 O sistema deve permitir exportação de todos os dados pessoais a pedido do titular.

## 4. Arquitetura Técnica e Tecnologias

Conforme especificado nos requisitos não funcionais (RNF.001) e detalhado na documentação técnica, o sistema Glamo adota uma arquitetura modular e escalável, com as seguintes tecnologias principais:

*   **Backend:**
    *   **Linguagem/Plataforma:** Node.js com TypeScript.
    *   **Framework/Estrutura:** A estrutura segue um padrão com separação clara entre `middlewares`, `controllers` e `services`, promovendo a manutenibilidade (RNF.001.04). O código-fonte exportado confirma o uso de Express.js como framework web.
    *   **Banco de Dados Relacional:** PostgreSQL (RNF.001.01). A interação é feita via ORM Sequelize, conforme observado nos modelos (`src/models`).
    *   **Cache e Filas:** Redis é utilizado para caching (potencialmente sessões), filas (notificações, relatórios, webhooks - `src/queues`) e rate limiting (RNF.001.05).
*   **Frontend:**
    *   **Web:** React com Next.js, utilizando TailwindCSS e ShadCN UI para estilização e componentes (RNF.001.02).
    *   **Mobile:** Expo com React Native, utilizando NativeWind (equivalente ao TailwindCSS para React Native) (RNF.001.02).
*   **Comunicação:** A comunicação entre frontend e backend ocorre via API RESTful sobre HTTPS (RNF.003.01).
*   **Containerização:** A aplicação é projetada para ser dockerizada, facilitando a implantação e escalabilidade em diferentes ambientes (RNF.001.03). O código-fonte exportado inclui `Dockerfile` e `docker-compose.yml`.
*   **Autenticação:** Utiliza JSON Web Tokens (JWT) com refresh tokens (RNF.003.03), gerenciados pelo `authService` e validados pelo `authMiddleware`.

Essa stack tecnológica moderna fornece uma base robusta para escalabilidade, performance e segurança, alinhada com os requisitos não funcionais do projeto.

## 5. Modelo de Dados (ERD e Modelos Sequelize)

## 5. Modelo de Dados (ERD e Modelos Sequelize)

A modelagem de dados é um pilar central do sistema Glamo, definindo a estrutura de armazenamento das informações. A documentação técnica fornece uma descrição detalhada das tabelas, que é complementada e validada pelos modelos Sequelize encontrados no código-fonte (`src/models`).

**Observação:** O código-fonte (`project-exported.md`) contém definições de modelos Sequelize que correspondem em grande parte às tabelas descritas na documentação técnica. Pequenas divergências (como nomes de campos ou tipos de dados específicos do Sequelize vs. tipos genéricos da documentação) foram observadas e, em geral, a definição do modelo Sequelize é considerada a fonte mais atualizada da estrutura implementada.

**Estrutura das Tabelas (Baseada na Documentação Técnica e Modelos Sequelize):**

**5.1. Usuários e Acesso**

*   **Tabela: `users` (Modelo: `User`)**
    *   **Descrição**: Armazena informações de todos os usuários (clientes, profissionais, proprietários).
    *   **Campos Principais:** `id`, `name`, `email` (unique), `password` (hashed), `phone`, `phone2`, `phoneType`, `phoneType2`, `address`, `adressNumber`, `complement`, `city`, `state`, `zipCode`, `birthDate`, `activeSalonId`, `resetPasswordToken`, `resetPasswordExpires`, `createdAt`, `updatedAt`, `deletedAt` (paranoid).
*   **Tabela: `user_salons` (Modelo: `UserSalon`)**
    *   **Descrição**: Relacionamento N:N entre usuários e salões.
    *   **Campos Principais:** `id`, `userId` (FK para `users`), `salonId` (FK para `salons`), `isActive`, `createdAt`, `updatedAt`, `deletedAt` (paranoid).
*   **Tabela: `roles` (Modelo: `Role`)**
    *   **Descrição**: Papéis customizáveis por negócio.
    *   **Campos Principais:** `id`, `salonId` (FK para `salons`), `name`, `createdAt`, `updatedAt`, `deletedAt` (paranoid).
*   **Tabela: `permissions` (Modelo: `Permission`)**
    *   **Descrição**: Permissões atômicas do sistema.
    *   **Campos Principais:** `id`, `name` (unique), `description`, `createdAt`.
*   **Tabela: `role_permissions` (Modelo: `RolePermission`)**
    *   **Descrição**: Associações N:N entre papéis e permissões.
    *   **Campos Principais:** `id`, `roleId` (FK para `roles`), `permissionId` (FK para `permissions`), `createdAt`.
*   **Tabela: `user_roles` (Modelo: `UserRole`)**
    *   **Descrição**: Associa papéis a um vínculo usuário-negócio.
    *   **Campos Principais:** `id`, `userSalonId` (FK para `user_salons`), `roleId` (FK para `roles`), `createdAt`.
*   **Tabela: `logs` (Modelo: `Log`)**
    *   **Descrição**: Registros de auditoria de ações críticas.
    *   **Campos Principais:** `id`, `userId` (FK para `users`), `entity`, `entityId`, `action`, `before` (TEXT/JSON), `after` (TEXT/JSON), `ipAddress`, `userAgent`, `createdAt`.
*   **Tabela: `login_audits` (Modelo: `LoginAudit`)**
    *   **Descrição**: Registros de tentativas de login.
    *   **Campos Principais:** `id`, `userId` (FK para `users`), `ipAddress`, `userAgent`, `createdAt`.

**5.2. Clientes e Financeiro**

*   **Tabela: `clients` (Modelo: `Client`)**
    *   **Descrição**: Informações dos clientes do negócio.
    *   **Campos Principais:** `id`, `salonId` (FK para `salons`), `userId` (FK para `users`, nullable), `name`, `email`, `phone`, `observations`, `createdAt`, `updatedAt`, `deletedAt` (paranoid).
*   **Tabela: `client_credits` (Modelo: `ClientCredit`)**
    *   **Descrição**: Créditos associados aos clientes.
    *   **Campos Principais:** `id`, `clientId` (FK para `clients`), `salonId` (FK para `salons`), `amount`, `origin`, `paymentMethod`, `date`, `notes`, `createdAt`, `updatedAt`. *(Nota: Doc. Técnica menciona `professionalId`, mas não está no modelo `ClientCredit`)*.
*   **Tabela: `payments` (Modelo: `Payment`)**
    *   **Descrição**: Pagamentos efetuados.
    *   **Campos Principais:** `id`, `userId` (FK para `users`), `saleId` (FK para `sales`), `methodId` (FK para `payment_methods`), `amount`, `status`, `createdAt`.
*   **Tabela: `payment_methods` (Modelo: Ausente no código exportado)**
    *   **Descrição**: Métodos de pagamento disponíveis.
    *   **Campos (Doc. Técnica):** `id`, `name`, `type`, `isOnline`.
*   **Tabela: `credit_payments` (Modelo: Ausente no código exportado)**
    *   **Descrição**: Uso de créditos em pagamentos.
    *   **Campos (Doc. Técnica):** `id`, `paymentId` (FK para `payments`), `creditId` (FK para `client_credits`), `amountUsed`, `createdAt`.
*   **Tabela: `daily_cash` (Modelo: `DailyCash`)**
    *   **Descrição**: Controle de caixa diário do negócio.
    *   **Campos Principais:** `id`, `salonId` (FK para `salons`), `openingAmount`, `closingAmount`, `openedAt`, `closedAt`, `openedByUserId` (FK para `users`), `closedByUserId` (FK para `users`), `createdAt`, `updatedAt`.
*   **Tabela: `professional_cash` (Modelo: `ProfessionalCash`)**
    *   **Descrição**: Controle de caixa por profissional (se aplicável).
    *   **Campos Principais:** `id`, `salonId` (FK para `salons`), `professionalId` (FK para `users`), `openingAmount`, `closingAmount`, `openedAt`, `closedAt`, `openedByUserId` (FK para `users`), `closedByUserId` (FK para `users`), `createdAt`, `updatedAt`.

**5.3. Serviços e Comissionamento**

*   **Tabela: `services` (Modelo: `Service`)**
    *   **Descrição**: Serviços oferecidos pelo negócio.
    *   **Campos Principais:** `id`, `salonId` (FK para `salons`), `name`, `description`, `baseDuration`, `basePrice`, `isActive`, `createdAt`, `updatedAt`. *(Nota: Modelo `Service` é mais simples que a tabela na Doc. Técnica, omitindo campos como `createdByUserId`, `costValue`, `nonCommissionableValue`, etc. Estes podem estar em outros modelos ou a implementação difere)*.
*   **Tabela: `service_variants` (Modelo: Ausente no código exportado)**
    *   **Descrição**: Variações de serviços.
    *   **Campos (Doc. Técnica):** `id`, `serviceId` (FK para `services`), `name`, `description`, `duration`, `price`, `costValue`, `costValueType`, `nonCommissionableValue`, `nonCommissionableValueType`, `createdAt`, `updatedAt`, `deletedAt`.
*   **Tabela: `commission_configs` (Modelo: `CommissionConfig`)**
    *   **Descrição**: Configurações de comissão por serviço.
    *   **Campos Principais:** `id`, `serviceId` (FK para `services`), `commissionType`, `baseValueType`, `baseValue`, `soloValueType`, `soloValue`, `withAssistantValueType`, `withAssistantValue`, `asAssistantValueType`, `asAssistantValue`, `createdAt`, `updatedAt`. *(Nota: Doc. Técnica menciona `deductAssistantsFromProfessional`, ausente no modelo)*.
*   **Tabela: `commissions` (Modelo: `Commission`)**
    *   **Descrição**: Registros de comissões calculadas.
    *   **Campos Principais:** `id`, `saleId` (FK para `sales`), `saleServiceId` (FK para `sale_services`), `professionalId` (FK para `users`), `amount`, `context` (`solo`, `withAssistant`, `asAssistant`, `simple`), `createdAt`.
*   **Tabela: `commission_audits` (Modelo: `CommissionAudit`)**
    *   **Descrição**: Auditoria do cálculo de comissões.
    *   **Campos Principais:** `id`, `commissionId` (FK para `commissions`), `saleId`, `saleServiceId`, `professionalId`, `amount`, `context`, `calculatedAt`, `triggeredByUserId` (FK para `users`), `ipAddress`, `userAgent`.
*   **Tabela: `service_categories` (Modelo: Ausente no código exportado)**
    *   **Descrição**: Categorias de serviços.
    *   **Campos (Doc. Técnica):** `id`, `serviceId` (FK para `services`), `name`, `color`, `createdAt`, `updatedAt`.

**5.4. Pacotes de Serviços**

*   **Tabela: `packages` (Modelo: Ausente no código exportado)**
    *   **Descrição**: Pacotes promocionais de serviços.
    *   **Campos (Doc. Técnica):** `id`, `salonId`, `createdByUserId`, `updatedByUserId`, `name`, `description`, `totalPrice`, `validityType`, `validityValue`, `isArchived`, `createdAt`, `updatedAt`, `deletedAt`.
*   **Tabela: `package_services` (Modelo: Ausente no código exportado)**
    *   **Descrição**: Serviços incluídos nos pacotes.
    *   **Campos (Doc. Técnica):** `id`, `packageId` (FK para `packages`), `serviceId` (FK para `services`), `customUnitPrice`, `quantity`, `createdAt`, `updatedAt`.

**5.5. Produtos e Inventário**

*   **Tabela: `products` (Modelo: `Product`)**
    *   **Descrição**: Produtos comercializados.
    *   **Campos Principais:** `id`, `salonId` (FK para `salons`), `categoryId` (FK para `product_categories`), `brandId` (FK para `product_brands`), `supplierId` (FK para `suppliers`, nullable), `name`, `costPrice`, `salePrice`, `stockQuantity`, `minimumStock`, `barcode`, `sku`, `createdAt`, `updatedAt`, `deletedAt` (paranoid). *(Nota: Modelo omite `initialStock`, `saleCommissionValue/Type`, `unitOfMeasure`, `quantityPerPackage`, `isArchived` presentes na Doc. Técnica)*.
*   **Tabela: `product_categories` (Modelo: `ProductCategory`)**
    *   **Descrição**: Categorias de produtos.
    *   **Campos Principais:** `id`, `salonId` (FK para `salons`), `name`, `createdAt`, `updatedAt`, `deletedAt` (paranoid).
*   **Tabela: `product_brands` (Modelo: `ProductBrand`)**
    *   **Descrição**: Marcas de produtos.
    *   **Campos Principais:** `id`, `salonId` (FK para `salons`), `name`, `createdAt`, `updatedAt`, `deletedAt` (paranoid).
*   **Tabela: `suppliers` (Modelo: `Supplier`)**
    *   **Descrição**: Fornecedores de produtos.
    *   **Campos Principais:** `id`, `salonId` (FK para `salons`), `name`, `email`, `phone`, `cnpj`, `createdAt`, `updatedAt`, `deletedAt` (paranoid). *(Nota: Modelo omite campos detalhados de endereço e contato presentes na Doc. Técnica)*.
*   **Tabela: `stock_records` (Modelo: `StockRecord`)**
    *   **Descrição**: Registros de movimentação de estoque.
    *   **Campos Principais:** `id`, `productId` (FK para `products`), `movementType`, `quantity`, `reason`, `date`, `createdAt`, `updatedAt`.

**5.6. Agendamentos**

*   **Tabela: `appointments` (Modelo: `Appointment`)**
    *   **Descrição**: Agendamentos de atendimentos.
    *   **Campos Principais:** `id`, `salonId` (FK para `salons`), `clientId` (FK para `clients`), `professionalId` (FK para `users`), `date`, `startTime`, `status`, `paymentStatus`, `notes`, `createdAt`, `updatedAt`, `deletedAt` (paranoid).
*   **Tabela: `appointment_services` (Modelo: `AppointmentService`)**
    *   **Descrição**: Serviços incluídos em um agendamento.
    *   **Campos Principais:** `id`, `appointmentId` (FK para `appointments`), `serviceId` (FK para `services`), `variantId` (nullable, FK para `service_variants`?), `customPrice`, `customDuration`, `discountType`, `discountValue`, `createdAt`, `updatedAt`.
*   **Tabela: `appointment_assistants` (Modelo: `AppointmentAssistant`)**
    *   **Descrição**: Assistentes designados para um agendamento.
    *   **Campos Principais:** `id`, `appointmentId` (FK para `appointments`), `userId` (FK para `users`), `createdAt`.
*   **Tabela: `appointment_repetitions` (Modelo: `AppointmentRepetition`)**
    *   **Descrição**: Configuração de recorrência de agendamentos.
    *   **Campos Principais:** `id`, `appointmentId` (FK para `appointments`), `intervalValue`, `intervalUnit`, `repeatUntil`, `createdAt`.
*   **Tabela: `appointment_status_logs` (Modelo: `AppointmentStatusLog`)**
    *   **Descrição**: Histórico de alterações de status de agendamentos.
    *   **Campos Principais:** `id`, `appointmentId` (FK para `appointments`), `updatedByUserId` (FK para `users`), `fromStatus`, `toStatus`, `changedAt`.
*   **Tabela: `available_timeslots` (Modelo: `AvailableTimeslot`)**
    *   **Descrição**: Horários disponíveis configurados por profissional.
    *   **Campos Principais:** `id`, `userId` (FK para `users`), `dayOfWeek`, `startTime`, `endTime`, `createdAt`.
*   **Tabela: `professional_absences` (Modelo: `ProfessionalAbsence`)**
    *   **Descrição**: Registros de ausências de profissionais.
    *   **Campos Principais:** `id`, `userId` (FK para `users`), `salonId` (FK para `salons`), `date`, `reason`, `createdAt`, `updatedAt`.

**5.7. Vendas**

*   **Tabela: `sales` (Modelo: `Sale`)**
    *   **Descrição**: Registros de vendas realizadas.
    *   **Campos Principais:** `id`, `clientId` (FK para `clients`), `employeeId` (FK para `users`), `originalTotal`, `discountApplied`, `finalTotal`, `date`, `createdAt`, `updatedAt`, `deletedAt` (paranoid).
*   **Tabela: `sale_services` (Modelo: `SaleService`)**
    *   **Descrição**: Serviços incluídos em uma venda.
    *   **Campos Principais:** `id`, `saleId` (FK para `sales`), `serviceId` (FK para `services`), `variantId` (nullable), `unitPrice`, `discount`, `finalPrice`, `createdAt`.
*   **Tabela: `sale_products` (Modelo: Ausente no código exportado)**
    *   **Descrição**: Produtos incluídos em uma venda.
    *   **Campos (Inferidos):** `id`, `saleId` (FK para `sales`), `productId` (FK para `products`), `quantity`, `unitPrice`, `discount`, `finalPrice`, `createdAt`.
*   **Tabela: `sale_packages` (Modelo: Ausente no código exportado)**
    *   **Descrição**: Pacotes incluídos em uma venda.
    *   **Campos (Inferidos):** `id`, `saleId` (FK para `sales`), `packageId` (FK para `packages`), `unitPrice`, `discount`, `finalPrice`, `createdAt`.

**5.8. Outros**

*   **Tabela: `salons` (Modelo: `Salon`)**
    *   **Descrição**: Informações dos salões cadastrados.
    *   **Campos Principais:** `id`, `name`, `document` (CNPJ), `phone`, `email`, `logoUrl`, `address`, `ownerId` (FK para `users`), `createdAt`, `updatedAt`.
*   **Tabela: `vouchers` (Modelo: `Voucher`)**
    *   **Descrição**: Vouchers de desconto.
    *   **Campos Principais:** `id`, `code` (unique), `discountType`, `discountValue`, `validUntil`, `createdAt`. *(Nota: Modelo omite `applicableTo`, `usedCount`, `isActive` presentes nos requisitos)*.
*   **Tabela: `notifications` (Modelo: `Notification`)**
    *   **Descrição**: Notificações enviadas aos usuários.
    *   **Campos Principais:** `id`, `userId` (FK para `users`), `title`, `message`, `type` (`info`, `warning`, `success`, `error`), `read`, `createdAt`, `updatedAt`. *(Nota: Modelo omite `systemGenerated`, `channel` presentes nos requisitos)*.
*   **Tabela: `feedbacks` (Modelo: `Feedback`)**
    *   **Descrição**: Feedback de clientes sobre agendamentos.
    *   **Campos Principais:** `id`, `appointmentId` (FK para `appointments`), `clientId` (FK para `clients`), `rating` (1-5), `comment`, `createdAt`.
*   **Tabela: `service_feedbacks` (Modelo: `ServiceFeedback`)**
    *   **Descrição**: Feedback específico sobre serviços dentro de um agendamento (duplicação aparente com `feedbacks`?).
    *   **Campos Principais:** `id`, `appointmentId` (FK para `appointments`), `clientId` (FK para `clients`), `rating` (1-5), `comment`, `createdAt`.
*   **Tabela: `loyalty_points` (Modelo: `LoyaltyPoint`)**
    *   **Descrição**: Pontos de fidelidade acumulados por clientes.
    *   **Campos Principais:** `id`, `clientId` (FK para `clients`), `salonId` (FK para `salons`), `appointmentId` (FK para `appointments`), `points`, `reason`, `createdAt`.
*   **Tabela: `promotion_campaigns` (Modelo: `PromotionCampaign`)**
    *   **Descrição**: Campanhas promocionais.
    *   **Campos Principais:** `id`, `salonId` (FK para `salons`), `name`, `description`, `discountType`, `discountValue`, `applicableTo`, `applicableEntityId` (nullable), `startDate`, `endDate`, `isActive`, `createdAt`.
*   **Tabela: `webhooks` (Modelo: `Webhook`)**
    *   **Descrição**: Configuração de webhooks para eventos do sistema.
    *   **Campos Principais:** `id`, `salonId` (FK para `salons`), `event`, `url`, `secretToken`, `active`, `createdAt`, `updatedAt`.

## 6. Documentação da API (Endpoints, Rotas, Controladores)

## 6. Documentação da API (Endpoints, Rotas, Controladores)

A API RESTful é a interface principal para a comunicação entre o frontend e o backend do Glamo. A documentação da API, combinada com a análise das rotas (`src/routes`) e controladores (`src/controllers`) no código-fonte, fornece a seguinte visão dos endpoints disponíveis:

**Observação:** O código-fonte pode conter endpoints adicionais ou variações não explicitamente listadas na documentação da API original. As permissões (`rolePermissionMiddleware`) são cruciais para o controle de acesso.

**6.1. Autenticação e Sessão (`/api/auth`)**

*   **POST `/register`**: Cria um novo usuário.
*   **POST `/login`**: Autentica o usuário e retorna tokens JWT e refresh.
*   **POST `/refresh`**: Gera novo token JWT usando o refresh token.
*   **POST `/logout`**: Invalida a sessão atual.
*   **POST `/forgot-password`**: Inicia o processo de recuperação de senha (envia e-mail com token).
*   **POST `/reset-password`**: Define uma nova senha usando o token de recuperação.

**6.2. Usuários (`/api/users`)**

*   **GET `/`**: Lista todos os usuários (requer permissão, ex: `can_view_users`).
*   **GET `/:id`**: Obtém detalhes de um usuário específico.
*   **PUT `/:id`**: Atualiza dados do usuário.
*   **DELETE `/:id`**: Exclui (soft delete) um usuário (requer permissão, ex: `can_manage_users`).
*   **PATCH `/switch-salon`**: Altera o negócio ativo do usuário logado.
*   **GET `/me/permissions`**: Lista as permissões do usuário logado no negócio ativo.
*   **GET `/me`**: Obtém os dados do usuário logado.

**6.3. Papéis e Permissões (`/api/roles`, `/api/permissions`, `/api/user-roles`)**

*   **GET `/api/roles`**: Lista os papéis do negócio ativo (requer permissão, ex: `can_view_roles`).
*   **POST `/api/roles`**: Cria um novo papel (requer permissão, ex: `can_manage_roles`).
*   **PUT `/api/roles/:id`**: Atualiza um papel (requer permissão, ex: `can_manage_roles`).
*   **DELETE `/api/roles/:id`**: Exclui um papel (requer permissão, ex: `can_manage_roles`).
*   **GET `/api/permissions`**: Lista todas as permissões disponíveis no sistema.
*   **POST `/api/user-roles`**: Atribui um papel a um usuário em um negócio específico (requer permissão, ex: `can_manage_users`).
*   **DELETE `/api/user-roles/:userSalonId/:roleId`**: Remove um papel de um usuário em um negócio (requer permissão, ex: `can_manage_users`).

**6.4. Notificações (`/api/notifications`)**

*   **GET `/`**: Lista as notificações do usuário logado.
*   **POST `/`**: Cria uma notificação manual (requer permissão, ex: `can_manage_notifications`).
*   **PATCH `/:id`**: Marca uma notificação como lida.
*   **DELETE `/:id`**: Exclui uma notificação.

**6.5. Logs (`/api/logs`, `/api/login-audits`)**

*   **GET `/api/logs`**: Consulta logs de auditoria com filtros (requer permissão, ex: `can_manage_logs`).
*   **GET `/api/login-audits`**: Consulta logs de login (requer permissão).

**6.6. Clientes (`/api/clients`)**

*   **GET `/`**: Lista clientes do negócio ativo (requer `can_view_clients`).
*   **POST `/`**: Cria um novo cliente (requer `can_create_clients`).
*   **GET `/:id`**: Obtém detalhes de um cliente (requer `can_view_clients`).
*   **PUT `/:id`**: Edita dados de um cliente (requer `can_edit_clients`).
*   **DELETE `/:id`**: Exclui (soft delete) um cliente (requer `can_delete_clients`).
*   **GET `/:id/history`**: Obtém histórico do cliente (agendamentos, vendas, etc.) (requer `can_view_clients`).

**6.7. Agendamentos (`/api/appointments`, etc.)**

*   **GET `/api/appointments`**: Lista agendamentos com filtros (requer `can_view_appointments`).
*   **GET `/api/appointments/available-slots`**: Retorna horários disponíveis por profissional.
*   **POST `/api/appointments`**: Cria um novo agendamento (requer `can_create_appointments`).
*   **GET `/api/appointments/:id`**: Obtém detalhes de um agendamento (requer `can_view_appointments`).
*   **PUT `/api/appointments/:id`**: Edita um agendamento (requer `can_edit_appointments`).
*   **DELETE `/api/appointments/:id`**: Cancela ou exclui um agendamento (requer `can_delete_appointments`).
*   **POST `/api/appointment-services`**: Adiciona serviços a um agendamento (requer `can_edit_appointments`).
*   **PUT `/api/appointment-services/:id`**: Atualiza um serviço dentro do agendamento (requer `can_edit_appointments`).
*   **DELETE `/api/appointment-services/:id`**: Remove um serviço do agendamento (requer `can_edit_appointments`).
*   **POST `/api/appointment-assistants`**: Adiciona assistente a um agendamento (requer `can_edit_appointments`).
*   **DELETE `/api/appointment-assistants/:id`**: Remove assistente de um agendamento (requer `can_edit_appointments`).
*   **POST `/api/appointment-repetitions`**: Define recorrência para um agendamento (requer `can_create_appointments`).
*   **DELETE `/api/appointment-repetitions/:id`**: Remove recorrência (requer `can_edit_appointments`).
*   **GET `/api/appointment-status-logs/:id`**: Lista histórico de status de um agendamento (requer `can_view_appointments`).

**6.8. Serviços (`/api/services`)**

*   **GET `/`**: Lista serviços do negócio ativo.
*   **POST `/`**: Cria um novo serviço (requer permissão, ex: `can_edit_services`).
*   **GET `/:id`**: Obtém detalhes de um serviço.
*   **PUT `/:id`**: Atualiza um serviço (requer permissão, ex: `can_edit_services`).
*   **DELETE `/:id`**: Exclui (soft delete) um serviço (requer permissão, ex: `can_edit_services`).

**6.9. Comissões (`/api/commissions`, `/api/commission-configs`)**

*   **GET `/api/commissions`**: Lista comissões calculadas com filtros (requer `can_view_sales` ou permissão específica).
*   **GET `/api/commission-configs`**: Lista configurações de comissão por serviço.
*   **POST `/api/commission-configs`**: Cria/atualiza configuração de comissão para um serviço (requer `can_edit_services`).
*   **GET `/api/commission-audits`**: Lista logs de auditoria de cálculo de comissão (requer permissão).

**6.10. Vouchers (`/api/vouchers`)**

*   **GET `/`**: Lista vouchers (requer `can_view_vouchers`).
*   **POST `/`**: Cria um novo voucher (requer `can_create_vouchers`).
*   **GET `/:id`**: Obtém detalhes de um voucher.
*   **PUT `/:id`**: Atualiza um voucher (requer `can_edit_vouchers`).
*   **DELETE `/:id`**: Exclui (soft delete) um voucher (requer `can_delete_vouchers`).

**6.11. Produtos e Estoque (`/api/products`, `/api/product-categories`, etc.)**

*   **GET `/api/products`**: Lista produtos com filtros (requer `can_view_products`).
*   **POST `/api/products`**: Cria um novo produto (requer `can_create_products`).
*   **GET `/api/products/:id`**: Obtém detalhes de um produto.
*   **PUT `/api/products/:id`**: Atualiza um produto (requer `can_edit_products`).
*   **DELETE `/api/products/:id`**: Arquiva (soft delete) um produto (requer `can_delete_products`).
*   **GET `/api/product-categories`**: Lista categorias de produto.
*   **POST `/api/product-categories`**: Cria categoria de produto (requer `can_create_products`).
*   **PUT `/api/product-categories/:id`**: Atualiza categoria.
*   **DELETE `/api/product-categories/:id`**: Exclui categoria.
*   **GET `/api/product-brands`**: Lista marcas de produto.
*   **POST `/api/product-brands`**: Cria marca de produto (requer `can_create_products`).
*   **PUT `/api/product-brands/:id`**: Atualiza marca.
*   **DELETE `/api/product-brands/:id`**: Exclui marca.
*   **GET `/api/suppliers`**: Lista fornecedores.
*   **POST `/api/suppliers`**: Cria fornecedor (requer `can_create_products`).
*   **PUT `/api/suppliers/:id`**: Atualiza fornecedor.
*   **DELETE `/api/suppliers/:id`**: Exclui fornecedor.
*   **POST `/api/stock-records`**: Registra movimentação de estoque (requer `can_manage_inventory`).
*   **GET `/api/stock-records`**: Lista movimentações de estoque com filtros (requer `can_manage_inventory`).

**6.12. Vendas e Pagamentos (`/api/sales`, `/api/payments`, etc.)**

*   **GET `/api/sales`**: Lista vendas com filtros (requer `can_view_sales`).
*   **POST `/api/sales`**: Cria uma nova venda (requer `can_create_sales`).
*   **GET `/api/sales/:id`**: Obtém detalhes de uma venda (requer `can_view_sales`).
*   **PUT `/api/sales/:id`**: Edita uma venda (requer `can_edit_sales`).
*   **DELETE `/api/sales/:id`**: Cancela uma venda (requer `can_cancel_sales`).
*   **GET `/api/sales/:id/receipt`**: Gera comanda/recibo da venda (requer `can_view_sales`).
*   **PUT `/api/sales/:id/receipt/reprint`**: Reemprime comanda com log (requer `can_view_sales`).
*   **POST `/api/payments`**: Registra um pagamento para uma venda (requer `can_create_sales`).
*   **GET `/api/payments`**: Lista pagamentos (filtrado por `saleId`, etc.) (requer `can_view_sales`).
*   **GET `/api/payment-methods`**: Lista métodos de pagamento disponíveis.
*   *(Endpoint para `credit-payments` não documentado explicitamente, mas inferido pela necessidade)*

**6.13. Caixa (`/api/daily-cash`, `/api/professional-cash`)**

*   **POST `/api/daily-cash/open`**: Abre o caixa diário do negócio (requer `can_manage_cash`).
*   **POST `/api/daily-cash/close`**: Fecha o caixa diário do negócio (requer `can_manage_cash`).
*   **GET `/api/daily-cash/current`**: Obtém o status do caixa diário atual.
*   **POST `/api/professional-cash/open`**: Abre o caixa do profissional (requer `can_manage_cash`).
*   **POST `/api/professional-cash/close`**: Fecha o caixa do profissional (requer `can_manage_cash`).
*   **GET `/api/professional-cash/current`**: Obtém o status do caixa do profissional atual.

**6.14. Relatórios (`/api/reports`)**

*   **GET `/sales`**: Gera relatório de vendas (requer `can_view_reports`).
*   **GET `/appointments`**: Gera relatório de agendamentos (requer `can_view_reports`).
*   **GET `/commissions`**: Gera relatório de comissões (requer `can_view_reports`).
*   *(Outros endpoints de relatório podem existir)*

**6.15. Outros (`/api/salons`, `/api/health`, etc.)**

*   **GET `/api/salons`**: Lista os salões aos quais o usuário tem acesso.
*   **POST `/api/salons`**: Cria um novo negócio (requer permissão de superadmin ou específica).
*   **GET `/api/salons/:id`**: Obtém detalhes de um negócio.
*   **PUT `/api/salons/:id`**: Atualiza dados de um negócio (requer permissão de owner/manager).
*   **GET `/api/health`**: Endpoint de verificação de saúde da aplicação.
*   *(Endpoints para Feedbacks, Loyalty Points, Promotion Campaigns, Webhooks podem existir conforme modelos, mas não estão na Doc. API)*

**Middleware de Autorização:**

Quase todas as rotas (exceto autenticação e health check) utilizam `authMiddleware` para verificar o JWT e `rolePermissionMiddleware('permissao_necessaria')` para garantir que o usuário logado, no contexto do negócio ativo, possua a permissão requerida para executar a ação.

## 7. Detalhes da Implementação (Código-Fonte)

## 7. Detalhes da Implementação (Código-Fonte)

O arquivo `project-exported.md` fornece uma visão da estrutura e de partes do código-fonte do backend. A análise revela detalhes importantes sobre a implementação:

**7.1. Estrutura do Projeto (`src`)**

A estrutura do diretório `src` segue um padrão comum em aplicações Node.js/Express, separando responsabilidades:

*   **`config`**: Contém arquivos de configuração para banco de dados (`database.ts`), JWT (`jwt.ts`), logging (`logger.ts`), Redis (`redis.ts`) e Swagger (`swagger.ts`).
*   **`controllers`**: Responsáveis por receber as requisições HTTP das rotas, interagir com os serviços e enviar as respostas. Exemplos: `auth.controller.ts`, `user.controller.ts`, `appointment.controller.ts`, etc.
*   **`dtos`**: Data Transfer Objects, provavelmente definidos com Zod (conforme `package.json`), usados para validar os dados de entrada das requisições.
*   **`middlewares`**: Funções que interceptam requisições para realizar tarefas como autenticação (`auth.middleware.ts`), verificação de permissões (`rolePermission.middleware.ts`), tratamento de erros (`errorHandler.middleware.ts`), validação de dados (`validateRequest.middleware.ts`) e limitação de taxa (`rateLimiter.middleware.ts`).
*   **`models`**: Definições dos modelos Sequelize que mapeiam as tabelas do banco de dados PostgreSQL. Inclui definições de associações entre modelos.
*   **`queues`**: Configuração e processamento de filas usando BullMQ e Redis (ex: `notification.queue.ts`, `report.queue.ts`).
*   **`routes`**: Define os endpoints da API e os associa aos controladores e middlewares correspondentes.
*   **`schedulers`**: Tarefas agendadas (ex: `report.scheduler.ts` para agendar a geração de relatórios).
*   **`services`**: Contêm a lógica de negócio principal da aplicação, interagindo com os modelos do banco de dados e outras dependências.
*   **`utils`**: Funções utilitárias reutilizáveis.
*   **`validators`**: Esquemas de validação Zod para os DTOs.
*   **`workers`**: Processam tarefas das filas (ex: `notification.worker.ts`, `report.worker.ts`).
*   **`app.ts`**: Ponto de entrada principal da aplicação Express, onde middlewares globais e rotas são configurados.
*   **`server.ts`**: Inicia o servidor HTTP e conecta ao banco de dados.

**7.2. Configuração e Ambiente**

*   **Docker:** O projeto utiliza Docker e Docker Compose (`docker-compose.yml`, `docker-compose.prod.yml`, `Dockerfile`) para gerenciar o ambiente de desenvolvimento e produção, incluindo os serviços de API, PostgreSQL, Redis e PgAdmin.
*   **Variáveis de Ambiente:** A configuração é gerenciada via variáveis de ambiente (arquivo `.env`), cobrindo portas, credenciais de banco de dados, Redis, segredos JWT e tokens de Swagger.
*   **Dependências:** O `package.json` lista as dependências principais, confirmando o uso de Express, Sequelize, pg, Redis (ioredis), BullMQ, JWT (jsonwebtoken), bcryptjs, Zod, Winston (logging), Helmet, CORS, express-rate-limit, Swagger, entre outras.

**7.3. Lógica de Negócio Chave (Exemplos Inferidos)**

*   **Autenticação (`auth.service.ts`, `auth.controller.ts`):** Lida com registro (hash de senha com bcrypt), login (geração de JWT e refresh token), validação de tokens e logout.
*   **Permissões (`rolePermission.middleware.ts`, `role.service.ts`):** O middleware verifica se o `userId` e `activeSalonId` da requisição (provavelmente injetados pelo `authMiddleware`) possuem a permissão necessária consultando os modelos `UserSalon`, `UserRole`, `Role` e `RolePermission`.
*   **Agendamentos (`appointment.service.ts`, `availableTimeslot.service.ts`):** Contém a lógica complexa para verificar disponibilidade (considerando horários de trabalho, ausências e agendamentos existentes), criar agendamentos (simples ou recorrentes) e gerenciar status.
*   **Comissões (`commission.service.ts`, `commissionConfig.model.ts`):** Implementa as regras de cálculo de comissão (simples vs. avançada, solo/com assistente/como assistente), provavelmente disparado após a conclusão de uma venda ou serviço.
*   **Validação (`validateRequest.middleware.ts`, `validators/`):** Utiliza Zod para definir esquemas e validar os `req.body`, `req.params` e `req.query` das requisições, garantindo a integridade dos dados antes de chegarem aos serviços.
*   **Filas e Workers (`queues/`, `workers/`):** Tarefas assíncronas como envio de notificações e geração de relatórios são desacopladas usando BullMQ, melhorando a responsividade da API.

**7.4. Segurança**

*   **Helmet:** Utilizado para adicionar cabeçalhos HTTP de segurança.
*   **CORS:** Configurado para controlar o acesso de diferentes origens.
*   **Rate Limiting:** `express-rate-limit` é usado para prevenir ataques de força bruta ou abuso da API.
*   **Validação de Entrada:** Zod é usado extensivamente para validar todos os dados de entrada.
*   **Autenticação/Autorização:** JWT e um sistema RBAC (Role-Based Access Control) detalhado com permissões granulares são implementados.
*   **Hashing de Senha:** Bcryptjs é usado para armazenar senhas de forma segura.

**7.5. Observações Adicionais do Código**

*   **Logging:** Winston é configurado para registrar logs em console e arquivos (`error.log`, `combined.log`), ajudando na depuração e monitoramento.
*   **Swagger:** Integração com Swagger UI para documentação interativa da API, protegida por um token (`swaggerAuth.middleware.ts`).
*   **Soft Delete:** Muitos modelos Sequelize utilizam `paranoid: true`, implementando soft delete (marcando registros como deletados em vez de removê-los fisicamente).
*   **Scripts:** Inclui scripts auxiliares, como `assign-permissions.ts`, para tarefas administrativas.

Esta análise do código-fonte complementa a documentação existente, fornecendo uma visão mais concreta da implementação atual do sistema Glamo.

## 8. Considerações Adicionais

## 8. Considerações Adicionais

Esta seção aborda pontos relevantes observados durante a consolidação, que complementam as seções anteriores:

*   **Deployment:** O projeto está preparado para deploy via Docker (`Dockerfile`, `docker-compose.yml`, `docker-compose.prod.yml`). O `README.md` inclui um checklist básico de deployment, mencionando a necessidade de HTTPS (via proxy reverso como Nginx) e monitoramento de containers.
*   **Segurança:** Além das medidas já mencionadas (HTTPS, JWT, bcrypt, Helmet, CORS, Rate Limit, RBAC, validação Zod), é crucial garantir que os segredos (JWT secrets, senhas de banco de dados, tokens de API externa) sejam gerenciados de forma segura em produção (e.g., usando variáveis de ambiente injetadas ou um serviço de gerenciamento de segredos) e não expostos no código ou em arquivos de configuração versionados.
*   **Monitoramento e Logging:** O uso de Winston para logging é um bom começo (RNF.004.02). Em produção, é recomendável integrar com um sistema centralizado de logs (ELK, Datadog, Sentry) e implementar monitoramento de performance da aplicação (APM), saúde do banco de dados e uso de recursos dos containers para garantir a disponibilidade e identificar gargalos (RNF.004.01).
*   **Testes:** A ausência de menção explícita a testes automatizados (unitários, integração, E2E) nos documentos ou no código exportado é um ponto crítico. A implementação de uma suíte de testes robusta é fundamental para garantir a qualidade, estabilidade e manutenibilidade do sistema a longo prazo.
*   **Integrações (RNF.006):** Os requisitos mencionam integrações com Google Maps, Gateways de Pagamento, Notificações Externas e NF-e. A implementação detalhada dessas integrações (tratamento de erros, retries, webhooks de resposta) não está totalmente visível nos documentos fornecidos e requer atenção especial.
*   **LGPD (RNF.007):** Os requisitos de LGPD (exclusão de dados, exportação, consentimento) precisam ser validados na implementação para garantir a conformidade legal.
*   **Divergências Documentação vs. Código:** Foram notadas algumas divergências entre as definições de tabelas na documentação técnica e os modelos Sequelize no código (campos omitidos ou adicionados). O código-fonte geralmente reflete o estado mais atual, mas é importante alinhar a documentação para evitar inconsistências futuras.
