**📄 DOCUMENTO DE REQUISITOS - SISTEMA GLAMO**

**Requisitos Funcionais (RF) - Usuários, Autenticação e Acesso**

**🔹 RF.001 - Cadastro e Autenticação de Usuários**

- **RF.001.01** O sistema deve permitir o cadastro de usuários com nome, e-mail, senha, telefone e endereço.
- **RF.001.02** O sistema deve validar a unicidade do e-mail.
- **RF.001.03** O sistema deve criptografar a senha dos usuários utilizando algoritmo seguro.
- **RF.001.04** O sistema deve permitir login via e-mail e senha.
- **RF.001.05** O sistema deve permitir recuperação de senha via e-mail.
- **RF.001.06** O sistema deve permitir a autenticação por token (JWT).

**🔹 RF.002 - Atribuição de Papéis e Permissões**

- **RF.002.01** O sistema deve permitir que cada usuário esteja associado a um ou mais salões.
- **RF.002.02** Cada associação usuário ↔ salão deve conter papéis e permissões específicos.
- **RF.002.03** O dono do salão pode criar papéis personalizados com permissões específicas.
- **RF.002.04** O sistema deve controlar o acesso a funcionalidades com base nas permissões atribuídas.
- **RF.002.05** O sistema deve permitir a visualização de todas as permissões do usuário autenticado no salão ativo via endpoint dedicado.

**🔹 RF.003 - Alternância de Salões**

- **RF.003.01** O sistema deve permitir ao usuário alternar entre os salões que participa.
- **RF.003.02** A alternância define o "salão ativo", cujos dados serão exibidos na interface.

**🔹 RF.004 - Notificações**

- **RF.004.01** O sistema deve permitir o envio de notificações aos usuários via painel interno.
- **RF.004.02** As notificações podem ser geradas manualmente ou automaticamente pelo sistema.
- **RF.004.03** O usuário deve poder marcar notificações como lidas.
- **RF.004.04** O sistema deve registrar se a notificação foi gerada pelo sistema (systemGenerated).

**RF.004.05** O sistema deve suportar múltiplos canais de envio de notificação (painel interno, push, e-mail e WhatsApp - futuro).

- **RF.004.06** O sistema deve registrar o canal utilizado para envio da notificação.

**🔹 RF.005 - Logs e Auditoria**

- **RF.005.01** O sistema deve registrar logs de ações administrativas críticas (criação, atualização, exclusão).
- **RF.005.02** Cada log deve conter o usuário responsável, a entidade alterada e os dados antes e depois da ação.
- **RF.005.03** Os logs devem ser imutáveis e disponíveis apenas para administradores com permissão.

**🔹 RF.006 - Gestão de Clientes**

- **RF.006.01** O sistema deve permitir o cadastro de clientes por meio de formulário.
- **RF.006.02** Cada cliente pode estar vinculado a um ou mais salões.
- **RF.006.03** Um cliente pode estar vinculado a um usuário (login próprio) ou ser gerenciado apenas pelo salão.
- **RF.006.04** O sistema deve armazenar nome, telefone, e-mail, data de nascimento e observações.
- **RF.006.05** O sistema deve manter histórico de serviços realizados, vendas, créditos e agendamentos por cliente.

**🔹 RF.007 - Agendamentos de Serviços**

- **RF.007.01** O sistema deve permitir que usuários com permissão agendem atendimentos para clientes.
- **RF.007.02** Um agendamento pode conter um ou mais serviços, com variações e valores personalizados.
- **RF.007.03** Cada serviço pode ser executado com ou sem assistentes.
- **RF.007.04** O sistema deve permitir agendamentos recorrentes com data de fim (repeatUntil).
- **RF.007.05** O sistema deve calcular o tempo total do atendimento baseado na duração dos serviços e auxiliar(es).
- **RF.007.06** O sistema deve impedir agendamentos conflitantes com horários já ocupados.
- **RF.007.07** O sistema deve disponibilizar horários disponíveis por profissional via endpoint /appointments/available-slots.

**🔹 RF.008 - Status e Rastreamento de Agendamentos**

- **RF.008.01** O sistema deve registrar status de agendamentos (ex: agendado, cancelado, finalizado).
- **RF.008.02** Alterações de status devem ser registradas na tabela APPOINTMENT_STATUS_LOGS.
- **RF.008.03** Cada log deve conter o status anterior, novo status, data/hora e usuário responsável.

**🔹 RF.009 - Notificações de Agendamento**

- **RF.009.01** O sistema deve enviar notificações para o cliente e profissional quando o agendamento for criado ou alterado.
- **RF.009.02** O sistema deve permitir lembretes automáticos de agendamento via push, e-mail ou WhatsApp (futuro).
- **RF.009.03** As notificações devem conter o horário, local, serviços e profissional envolvido.
- **RF.009.04** O sistema deve registrar logs de envio e leitura dessas notificações.

**🔹 RF.010 - Gestão de Vouchers**

- **RF.010.01** O sistema deve permitir a criação de vouchers com valor fixo ou percentual de desconto.
- **RF.010.02** Um voucher pode ter validade limitada por data, número de usos ou ambos.
- **RF.010.03** Vouchers podem ser aplicados a agendamentos ou vendas, conforme applicableTo.
- **RF.010.04** O sistema deve atualizar automaticamente o número de vezes que o voucher foi utilizado (usedCount).
- **RF.010.05** Vouchers expirados ou utilizados no limite devem ser marcados como inativos automaticamente.
- **RF.010.06** O sistema deve registrar o histórico de uso de vouchers (quem utilizou, em qual venda/agendamento e quando).

**🔹 RF.011 - Cadastro e Gestão de Produtos**

- **RF.011.01** O sistema deve permitir o cadastro de produtos com nome, descrição, marca, categoria e fornecedor.
- **RF.011.02** O sistema deve armazenar preço de custo, preço de venda, comissão sobre a venda e unidade de medida.
- **RF.011.03** Cada produto deve conter informações de estoque atual, estoque inicial e estoque mínimo.
- **RF.011.04** O sistema deve gerar alertas automáticos para produtos abaixo do estoque mínimo.
- **RF.011.05** Produtos arquivados não devem ser exibidos na tela de venda, mas devem permanecer no histórico.
- **RF.011.06** O sistema deve registrar movimentações de estoque com valores anterior e final (previousQuantity, finalQuantity).

**🔹 RF.012 - Categorias e Marcas**

- **RF.012.01** O sistema deve permitir o cadastro e edição de categorias de produtos.
- **RF.012.02** O sistema deve permitir o cadastro de marcas vinculadas aos produtos.

**🔹 RF.013 - Fornecedores**

- **RF.013.01** O sistema deve permitir o cadastro de fornecedores com nome, e-mail, telefones e CNPJ.
- **RF.013.02** Deve ser possível relacionar cada produto a um fornecedor.
- **RF.013.03** O sistema deve permitir visualizar todos os produtos fornecidos por um mesmo fornecedor.

**🔹 RF.014 - Controle de Estoque**

- **RF.014.01** Toda movimentação de estoque (entrada ou saída) deve ser registrada na tabela STOCK_RECORDS.
- **RF.014.02** O sistema deve registrar tipo de movimentação (entrada, saída, correção), quantidade e motivo.
- **RF.014.03** A movimentação de estoque deve atualizar automaticamente o campo stockQuantity do produto.
- **RF.014.04** O sistema deve permitir corrigir o estoque manualmente com um motivo justificado.

**🔹 RF.015 - Vendas**

- **RF.015.01** O sistema deve permitir registrar vendas com um ou mais produtos, serviços ou pacotes.
- **RF.015.02** A venda deve conter o cliente, o usuário responsável, o valor original, descontos e valor final.
- **RF.015.03** O sistema deve permitir aplicar vouchers em vendas.
- **RF.015.04** Cada item vendido (produto, serviço, pacote) deve ser registrado em sua respectiva tabela: SALE_PRODUCTS, SALE_SERVICES, SALE_PACKAGES.
- **RF.015.05** As vendas devem ser listadas por período, cliente e tipo de item vendido.
- **RF.015.06** O sistema deve suportar cancelamento e reembolso parcial de vendas, com registro do motivo.
- **RF.015.07** O sistema deve permitir reimpressão de comandas com rastreamento das reimpressões (logs)

**🔹 RF.016 - Pagamentos**

- **RF.016.01** O sistema deve permitir registrar pagamentos associados a uma venda.
- **RF.016.02** Um pagamento deve conter: método de pagamento, valor pago e status (aprovado, pendente, recusado).
- **RF.016.03** Os métodos de pagamento devem ser definidos na tabela PAYMENT_METHODS.
- **RF.016.04** O sistema deve permitir múltiplos pagamentos para uma mesma venda (ex: parte Pix, parte dinheiro).
- **RF.016.05** O sistema deve exibir o status de pagamento no detalhe da venda e do agendamento.

**🔹 RF.017 - Créditos de Cliente**

- **RF.017.01** O sistema deve permitir adicionar créditos manuais ao cliente, informando origem e forma de pagamento.
- **RF.017.02** Créditos podem ser aplicados parcial ou integralmente em pagamentos futuros.
- **RF.017.03** O consumo de créditos deve ser registrado na tabela CREDIT_PAYMENTS.
- **RF.017.04** O sistema deve permitir visualizar o saldo de créditos de cada cliente.
- **RF.017.05** O crédito deve ter rastreabilidade de origem, data, profissional e observações.

**🔹 RF.018 - Cálculo de Comissões**

- **RF.018.01** O sistema deve calcular comissões de profissionais com base na configuração do serviço e produto.
- **RF.018.02** Cada serviço pode ter uma regra simples (fixa ou percentual) ou avançada:
  - Comissão sozinha
  - Comissão com assistente
  - Comissão como assistente
- **RF.018.03** O sistema deve registrar a comissão de cada item vendido (serviço ou produto) no momento da venda.
- **RF.018.04** O sistema deve permitir emissão de relatório por período e por profissional com totais de comissão.
- **RF.018.05** O sistema deve permitir configurar se a comissão dos assistentes será subtraída do profissional.
- **RF.018.06** O sistema deve permitir exceções manuais de comissão por campanha ou bonificação específica.

**🔹 RF.019 - Controle de Caixa**

- **RF.019.01** O sistema deve permitir abertura e fechamento de caixa diário por colaborador.
- **RF.019.02** Cada operação (pagamento, sangria, suprimento) deve ser registrada com horário e valor.
- **RF.019.03** O sistema deve calcular automaticamente o saldo final com base nas entradas e saídas.
- **RF.019.04** Deve ser possível imprimir ou exportar o extrato diário do caixa.
- **RF.019.05** A abertura de caixa deve conter o saldo inicial informado.
- **RF.019.06** O sistema deve identificar quem abriu e quem fechou o caixa, e indicar se o fechamento foi conciliado.

🔹 **RF.020 - Relatórios e Dashboards**

- **RF.020.01** O sistema deve permitir visualização de KPIs gerenciais, incluindo:
  - Total de vendas
  - Agendamentos por profissional
  - Clientes recorrentes vs. novos
  - Valor médio por venda
- **RF.020.02** Os relatórios devem ter filtros por período, profissional e tipo de item vendido.
- **RF.020.03** O sistema deve permitir exportar relatórios em PDF, CSV e Excel.

**✅ Requisitos Não-Funcionais (RNF)**

**🔹 RNF.001 - Arquitetura e Escalabilidade**

- **RNF.001.01** O sistema deve ser construído com arquitetura **modular e escalável**, utilizando **Node.js** no backend com **PostgreSQL** como banco de dados relacional e **Redis** para caching.
- **RNF.001.02** O frontend deve ser baseado em **React + Next.js + TailwindCSS + ShadCN UI** (para web) e **Expo + React Native + NativeWind** (para mobile), com APIs REST entre os módulos.
- **RNF.001.03** A aplicação deve ser **dockerizada**, permitindo múltiplas instâncias em ambientes de staging e produção.
- **RNF.001.04** O backend deve ser estruturado com middlewares, controllers e services separados, garantindo manutenibilidade.
- **RNF.001.05** O sistema deve utilizar Redis para cache de sessões, filas de notificação e proteção contra requisições excessivas (rate limit).

**🔹 RNF.002 - Performance**

- **RNF.002.01** O sistema deve suportar pelo menos **500 usuários simultâneos** em seu pico inicial, escalando horizontalmente quando necessário.
- **RNF.002.02** O tempo médio de resposta da API para operações padrão (CRUD simples) deve ser inferior a **300ms**.
- **RNF.002.03** Operações críticas com múltiplas dependências (vendas, fechamento de caixa) devem responder em até **1 segundo**.

**🔹 RNF.003 - Segurança**

- **RNF.003.01** Toda comunicação entre frontend e backend deve ocorrer via HTTPS.
- **RNF.003.02** Senhas de usuários devem ser **criptografadas** utilizando algoritmos fortes como bcrypt.
- **RNF.003.03** O sistema deve implementar **JWT com refresh tokens** para autenticação segura.
- **RNF.003.04** Todas as ações sensíveis devem ser registradas em log com identificação do usuário e timestamp.
- **RNF.003.05** O sistema deve implementar controle de acesso baseado em permissões e papéis customizáveis.
- **RNF.003.06** Deve haver proteção contra **injeção de SQL**, **XSS** e **CSRF** nas interfaces.

**🔹 RNF.004 - Disponibilidade e Tolerância a Falhas**

- **RNF.004.01** O sistema deve estar disponível **24x7**, com mecanismos de retry em operações críticas.
- **RNF.004.02** Logs de erro devem ser registrados com detalhes, incluindo stack trace, em arquivos e serviços externos (ex: LogDNA, Winston).
- **RNF.004.03** O banco de dados deve ter backups automáticos diários e retenção por pelo menos **30 dias**.

**🔹 RNF.005 - Usabilidade e Interface**

- **RNF.005.01** O sistema deve seguir padrões de design responsivo, com usabilidade otimizada para desktop e mobile.
- **RNF.005.02** A interface do sistema deve ser intuitiva e suportar **tema escuro e claro** (dark/light mode).
- **RNF.005.03** Campos de formulário devem conter validações claras e feedback ao usuário em tempo real.
- **RNF.005.04** O sistema deve oferecer acessibilidade mínima com suporte a leitores de tela e atalhos de navegação.

**🔹 RNF.006 - Integrações**

- **RNF.006.01** O sistema deve se integrar com APIs externas como:
  - Google Maps (localização de salões)
  - Gateways de pagamento (ex: Mercado Pago, PagSeguro, Pix)
  - Sistemas de envio de notificações (push/email/SMS via Firebase ou OneSignal)
  - Emissores de Nota Fiscal Eletrônica (NF-e)
- **RNF.006.02** Em caso de falha nas integrações, o sistema deve aplicar retries e fallback para canais alternativos (quando possível).

**🔹 RNF.007 - LGPD e Privacidade**

- **RNF.007.01** O sistema deve garantir a conformidade com a **Lei Geral de Proteção de Dados (LGPD)**.
- **RNF.007.02** O usuário deve poder solicitar a exclusão de seus dados pessoais.
- **RNF.007.03** A política de privacidade e os termos de uso devem ser visíveis na plataforma.
- **RNF.007.04** O sistema deve registrar consentimento explícito do usuário no primeiro acesso.
- **RNF.007.05** O sistema deve permitir exportação de todos os dados pessoais a pedido do titular.