**📘 DOCUMENTAÇÃO TÉCNICA - SISTEMA GLAMO**

**Parte 1: Visão Geral + Estrutura de Usuários e Acesso**

**🔹 1. Objetivo do Sistema**

O **Glamo** é um sistema SaaS de gestão para salões de beleza, projetado para otimizar operações administrativas, comerciais e operacionais. A plataforma permite o gerenciamento de agendamentos, serviços, produtos, vendas, comissões, usuários, permissões, controle de caixa, relatórios gerenciais e integração com múltiplos canais de comunicação e APIs externas..

**🔹 2. Modelagem Técnica: Seção de Usuários**

**📄 Tabela: USERS**

**Descrição**: Armazena informações de todos os usuários do sistema (clientes, profissionais e proprietários).

| **Campo** | **Tipo** | **Descrição** |
| --- | --- | --- |
| id  | int (PK) | Identificador único do usuário. |
| name | string | Nome completo do usuário. |
| email | string | E-mail de login e contato. |
| password | string | Hash da senha do usuário. |
| phone | string | Telefone principal. |
| phone2 | string | Telefone secundário. |
| phoneType | string | Tipo do telefone principal (Ex: celular, fixo). |
| phoneType2 | string | Tipo do telefone secundário. |
| address | string | Endereço do usuário. |
| adressNumber | string | Número do endereço. |
| complement | string | Complemento do endereço. |
| city | string | Cidade. |
| state | string | Estado. |
| zipCode | string | CEP. |
| birthDate | datetime | Data de nascimento. |
| activeSalonId | string | Último salão selecionado. |
| createdAt | datetime | Registro de criação. |
| updatedAt | datetime | Última atualização. |
| deletedAt | datetime | Data de exclusão lógica (soft delete). |

**📄 Tabela: USER_SALONS**

**Descrição**: Relacionamento entre usuários e salões, indicando sua participação e permissões.

| **Campo** | **Tipo** | **Descrição** |
| --- | --- | --- |
| id  | int (PK) | Identificador único. |
| userId | int (FK) | Referência ao usuário. |
| salonId | int (FK) | Referência ao salão. |
| isActive | boolean | Indica se o relacionamento está ativo (salão ativo). |
| createdAt | datetime | Data de criação do vínculo. |
| updatedAt | datetime | Última atualização. |
| deletedAt | datetime | Data de exclusão lógica. |

**📄 Tabela: ROLES**

**Descrição**: Papéis personalizados que podem ser criados por salão.

| **Campo** | **Tipo** | **Descrição** |
| --- | --- | --- |
| id  | int (PK) | Identificador único do papel. |
| salonId | int (FK) | Salão ao qual o papel pertence. |
| name | string | Nome do papel (Ex: Caixa, Assistente). |
| createdAt | datetime | Data de criação. |
| updatedAt | datetime | Última atualização. |
| deletedAt | datetime | Soft delete do papel. |

**📄 Tabela: PERMISSIONS**

**Descrição**: Permissões atômicas do sistema (CRUD em módulos).

| **Campo** | **Tipo** | **Descrição** |
| --- | --- | --- |
| id  | int (PK) | Identificador único da permissão. |
| name | string | Nome da permissão (Ex: view_dashboard). |
| description | string | Descrição legível da permissão. |
| createdAt | datetime | Data de criação. |

**📄 Tabela: ROLE_PERMISSIONS**

**Descrição**: Associações entre papéis e permissões.

| **Campo** | **Tipo** | **Descrição** |
| --- | --- | --- |
| id  | int (PK) | Identificador único. |
| roleId | int (FK) | Papel relacionado. |
| permissionId | int (FK) | Permissão associada. |
| createdAt | datetime | Data de criação da associação. |

**📄 Tabela: USER_ROLES**

**Descrição**: Liga papéis aos usuários dentro de um salão.

| **Campo** | **Tipo** | **Descrição** |
| --- | --- | --- |
| id  | int (PK) | Identificador único. |
| userSalonId | int (FK) | Referência ao vínculo USER_SALONS. |
| roleId | int (FK) | Papel atribuído. |
| createdAt | datetime | Data da atribuição. |

📄 **Tabela: LOGS**

| **Campo** | **Tipo** | **Descrição** |
| --- | --- | --- |
| id  | int (PK) | Identificador único. |
| userId | int (FK) | Usuário que realizou a ação. |
| entity | string | Entidade afetada (ex: appointment). |
| entityId | string | ID da entidade. |
| action | string | Ação executada (create, update, delete). |
| before | json | Estado anterior. |
| after | json | Estado posterior. |
| ipAddress | string | IP de origem da ação. |
| userAgent | string | Navegador/dispositivo utilizado. |
| createdAt | datetime | Data/hora da ação. |

**🔹 3. Modelagem Técnica: Seção de Clientes e Pagamentos**

**📄 Tabela: CLIENTS**

**Descrição**: Armazena informações dos clientes de cada salão, podendo ou não estar vinculados a um usuário.

| **Campo** | **Tipo** | **Descrição** |
| --- | --- | --- |
| id  | int (PK) | Identificador único do cliente. |
| salonId | int (FK) | Salão ao qual o cliente está vinculado. |
| userId | int (FK) | Usuário relacionado, se houver (opcional). |
| name | string | Nome do cliente. |
| email | string | E-mail para contato. |
| phone | string | Telefone do cliente. |
| observations | string | Anotações internas sobre o cliente. |
| createdAt | datetime | Data de criação do cliente. |
| updatedAt | datetime | Última atualização. |
| deletedAt | datetime | Exclusão lógica. |

**📄 Tabela: CLIENT_CREDITS**

**Descrição**: Armazena valores em crédito associados aos clientes, profissionais e salões.

| **Campo** | **Tipo** | **Descrição** |
| --- | --- | --- |
| id  | int (PK) | Identificador único do crédito. |
| clientId | int (FK) | Cliente relacionado. |
| professionalId | int (FK) | Profissional associado (origem do crédito). |
| salonId | int (FK) | Salão relacionado. |
| amount | float | Valor total do crédito. |
| origin | string | Origem do crédito (bônus, devolução, etc.). |
| paymentMethod | string | Forma como o crédito foi adquirido. |
| date | datetime | Data de registro do crédito. |
| notes | string | Observações adicionais. |
| createdAt | datetime | Data de criação. |
| updatedAt | datetime | Última modificação. |

**📄 Tabela: PAYMENTS**

**Descrição**: Detalha os pagamentos efetuados, vinculados a vendas ou uso de créditos.

| **Campo** | **Tipo** | **Descrição** |
| --- | --- | --- |
| id  | int (PK) | Identificador único do pagamento. |
| userId | int (FK) | Usuário que processou o pagamento. |
| saleId | int (FK) | Venda associada ao pagamento. |
| methodId | int (FK) | Método de pagamento utilizado. |
| amount | float | Valor pago. |
| status | string | Status do pagamento (aprovado, pendente, etc.). |
| createdAt | datetime | Data do pagamento. |

**📄 Tabela: PAYMENT_METHODS**

**Descrição**: Tabela auxiliar que define os métodos de pagamento disponíveis.

| **Campo** | **Tipo** | **Descrição** |
| --- | --- | --- |
| id  | int (PK) | Identificador único do método. |
| name | string | Nome do método (Pix, Dinheiro, Cartão, etc). |
| type | string | Tipo categórico (online, físico). |
| isOnline | boolean | Define se o método é digital. |

**📄 Tabela: CREDIT_PAYMENTS**

**Descrição**: Controla o uso de créditos em pagamentos realizados.

| **Campo** | **Tipo** | **Descrição** |
| --- | --- | --- |
| id  | int (PK) | Identificador único. |
| paymentId | int (FK) | Pagamento relacionado. |
| creditId | int (FK) | Crédito utilizado. |
| amountUsed | float | Valor do crédito consumido. |
| createdAt | datetime | Data de uso. |

**🔹 4. Modelagem Técnica: Serviços e Comissionamento**

**📄 Tabela: SERVICES**

**Descrição**: Tabela principal de serviços oferecidos em cada salão.

| **Campo** | **Tipo** | **Descrição** |
| --- | --- | --- |
| id  | int (PK) | Identificador único do serviço. |
| salonId | int (FK) | Salão que oferece o serviço. |
| createdByUserId | int (FK) | Usuário que criou o serviço. |
| updatedByUserId | int (FK) | Último usuário que editou o serviço. |
| serviceRoomId | int (FK) | Sala onde o serviço é realizado. |
| name | string | Nome do serviço. |
| description | string | Descrição do serviço. |
| hasVariants | boolean | Define se o serviço tem variações. |
| duration | int | Tempo padrão estimado em minutos. |
| price | float | Preço base do serviço. |
| costValue | float | Custo para execução. |
| costValueType | string | Tipo de custo (fixo, percentual). |
| nonCommissionableValue | float | Parte do valor não comissionável. |
| nonCommissionableValueType | string | Tipo (fixo ou percentual). |
| cardColor | string | Cor para exibição do card. |
| createdAt | datetime | Data de criação. |
| updatedAt | datetime | Última atualização. |
| deletedAt | datetime | Soft delete. |

**📄 Tabela: SERVICE_VARIANTS**

**Descrição**: Variações possíveis de um serviço, com preços e tempos personalizados.

| **Campo** | **Tipo** | **Descrição** |
| --- | --- | --- |
| id  | int (PK) | Identificador único da variante. |
| serviceId | int (FK) | Serviço relacionado. |
| name | string | Nome da variação. |
| description | string | Descrição da variação. |
| duration | int | Duração estimada. |
| price | float | Preço da variação. |
| costValue | float | Custo associado. |
| costValueType | string | Tipo de custo. |
| nonCommissionableValue | float | Parte do valor não comissionável. |
| nonCommissionableValueType | string | Tipo (fixo ou percentual). |
| createdAt | datetime | Data de criação. |
| updatedAt | datetime | Última atualização. |
| deletedAt | datetime | Soft delete. |

**📄 Tabela: COMMISSION_CONFIGS**

**Descrição**: Configurações avançadas de comissão por serviço.

| **Campo** | **Tipo** | **Descrição** |
| --- | --- | --- |
| id  | int (PK) | Identificador único da configuração. |
| serviceId | int (FK) | Serviço vinculado. |
| commissionType | string | Tipo de comissão (simples, avançada). |
| baseValueType | string | Tipo do valor base (fixo ou percentual). |
| baseValue | float | Valor base. |
| deductAssistantsFromProfessional | boolean | Se o valor dos assistentes será descontado. |
| soloValue | float | Comissão ao executar sozinho. |
| soloValueType | string | Tipo do valor. |
| withAssistantValue | float | Comissão com assistente. |
| withAssistantValueType | string | Tipo. |
| asAssistantValue | float | Comissão ao atuar como assistente. |
| asAssistantValueType | string | Tipo. |
| createdAt | datetime | Data de criação. |
| updatedAt | datetime | Última atualização. |

**📄 Tabela: SERVICE_CATEGORIES**

**Descrição**: Categorias organizacionais para agrupar serviços.

| **Campo** | **Tipo** | **Descrição** |
| --- | --- | --- |
| id  | int (PK) | Identificador da categoria. |
| serviceId | int (FK) | Serviço relacionado. |
| name | string | Nome da categoria. |
| color | string | Cor para exibição visual. |
| createdAt | datetime | Data de criação. |
| updatedAt | datetime | Última atualização. |

**🔹 5. Modelagem Técnica: Pacotes de Serviços**

**📄 Tabela: PACKAGES**

**Descrição**: Representa pacotes de serviços promocionais.

| **Campo** | **Tipo** | **Descrição** |
| --- | --- | --- |
| id  | int (PK) | Identificador único. |
| salonId | int (FK) | Salão que oferece o pacote. |
| createdByUserId | int (FK) | Criador. |
| updatedByUserId | int (FK) | Último modificador. |
| name | string | Nome do pacote. |
| description | string | Descrição detalhada. |
| totalPrice | float | Preço final do pacote. |
| validityType | string | Tipo de validade (dias, semanas, meses). |
| validityValue | int | Valor da validade (ex: 30 dias). |
| isArchived | boolean | Define se o pacote está ativo. |
| createdAt | datetime | Data de criação. |
| updatedAt | datetime | Última modificação. |
| deletedAt | datetime | Soft delete. |

**📄 Tabela: PACKAGE_SERVICES**

**Descrição**: Relacionamento entre pacotes e os serviços contidos.

| **Campo** | **Tipo** | **Descrição** |
| --- | --- | --- |
| id  | int (PK) | Identificador único. |
| packageId | int (FK) | Pacote ao qual pertence. |
| serviceId | int (FK) | Serviço incluído no pacote. |
| customUnitPrice | float | Preço especial unitário no pacote. |
| quantity | int | Quantidade de vezes que o serviço aparece. |
| createdAt | datetime | Data de criação. |
| updatedAt | datetime | Última modificação. |

**🔹 6. Modelagem Técnica: Produtos e Inventário**

**📄 Tabela: PRODUCTS**

**Descrição**: Tabela de produtos comercializados no salão.

| **Campo** | **Tipo** | **Descrição** |
| --- | --- | --- |
| id  | int (PK) | Identificador único do produto. |
| salonId | int (FK) | Salão ao qual o produto pertence. |
| categoryId | int (FK) | Categoria do produto. |
| brandId | int (FK) | Marca do produto. |
| supplierId | int (FK) | Fornecedor vinculado. |
| createdByUserId | int (FK) | Usuário que criou. |
| updatedByUserId | int (FK) | Último usuário que editou. |
| name | string | Nome do produto. |
| costPrice | float | Valor de custo. |
| salePrice | float | Valor de venda. |
| stockQuantity | int | Quantidade atual em estoque. |
| initialStock | int | Estoque inicial (base para controle). |
| minimumStock | int | Estoque mínimo antes de alertar necessidade de reposição. |
| saleCommissionValue | float | Comissão sobre venda. |
| saleCommissionType | string | Tipo da comissão (fixa ou percentual). |
| unitOfMeasure | string | Unidade (ex: ml, g, unidade). |
| quantityPerPackage | int | Quantidade por embalagem. |
| barcode | string | Código de barras. |
| sku | string | SKU interno. |
| isArchived | boolean | Produto desativado para vendas. |
| createdAt | datetime | Data de criação. |
| updatedAt | datetime | Última atualização. |
| deletedAt | datetime | Exclusão lógica. |

**📄 Tabela: PRODUCT_CATEGORIES**

**Descrição**: Agrupamento dos produtos por categoria.

| **Campo** | **Tipo** | **Descrição** |
| --- | --- | --- |
| id  | int (PK) | Identificador único. |
| salonId | int (FK) | Salão vinculado. |
| name | string | Nome da categoria. |
| description | string | Descrição da categoria. |
| createdAt | datetime | Data de criação. |
| updatedAt | datetime | Última modificação. |
| deletedAt | datetime | Soft delete. |

**📄 Tabela: PRODUCT_BRANDS**

**Descrição**: Marcas disponíveis para os produtos.

| **Campo** | **Tipo** | **Descrição** |
| --- | --- | --- |
| id  | int (PK) | Identificador único. |
| salonId | int (FK) | Salão vinculado. |
| name | string | Nome da marca. |
| description | string | Descrição. |
| createdAt | datetime | Criação. |
| updatedAt | datetime | Última alteração. |
| deletedAt | datetime | Exclusão lógica. |

**📄 Tabela: SUPPLIERS**

**Descrição**: Informações de fornecedores vinculados aos produtos.

| **Campo** | **Tipo** | **Descrição** |
| --- | --- | --- |
| id  | int (PK) | Identificador único. |
| salonId | int (FK) | Salão relacionado. |
| name | string | Nome do fornecedor. |
| description | string | Descrição adicional. |
| email | string | E-mail de contato. |
| phoneType | string | Tipo de telefone principal. |
| phone | string | Número principal. |
| phoneType2 | string | Tipo de telefone secundário. |
| phone2 | string | Número secundário. |
| contactName | string | Nome do contato direto. |
| cnpj | string | CNPJ do fornecedor. |
| address | string | Endereço. |
| adressNumber | string | Número. |
| complement | string | Complemento. |
| city | string | Cidade. |
| state | string | Estado. |
| zipCode | string | CEP. |
| createdAt | datetime | Criação. |
| updatedAt | datetime | Atualização. |
| deletedAt | datetime | Soft delete. |

**📄 Tabela: STOCK_RECORDS**

**Descrição**: Movimentações de estoque (entrada/saída).

| **Campo** | **Tipo** | **Descrição** |
| --- | --- | --- |
| id  | int (PK) | Identificador único. |
| productId | int (FK) | Produto relacionado. |
| movementType | string | Tipo da movimentação (entrada, saída). |
| quantity | int | Quantidade movimentada. |
| reason | string | Justificativa ou observação da movimentação. |
| date | datetime | Data de efetivação da movimentação. |
| createdAt | datetime | Criação do registro. |
| updatedAt | datetime | Última atualização. |

**🔹 7. Modelagem Técnica: Agendamentos**

**📄 Tabela: APPOINTMENTS**

**Descrição**: Armazena os atendimentos agendados entre cliente e profissional.

| **Campo** | **Tipo** | **Descrição** |
| --- | --- | --- |
| id  | int (PK) | Identificador único do agendamento. |
| salonId | int (FK) | Salão onde será realizado o atendimento. |
| clientId | int (FK) | Cliente que agendou. |
| professionalId | int (FK) | Profissional responsável. |
| voucherId | int (FK) | Voucher aplicado (se houver). |
| date | datetime | Data do agendamento. |
| startTime | time | Horário de início. |
| status | string | Status atual (confirmado, cancelado, etc.). |
| paymentStatus | string | Status do pagamento (pago, pendente, etc.). |
| notes | string | Observações internas. |
| createdAt | datetime | Criação do registro. |
| updatedAt | datetime | Última modificação. |
| deletedAt | datetime | Exclusão lógica. |

**📄 Tabela: APPOINTMENT_STATUS_LOGS**

**Descrição**: Histórico de alterações de status do agendamento.

| **Campo** | **Tipo** | **Descrição** |
| --- | --- | --- |
| id  | int (PK) | Identificador único. |
| appointmentId | int (FK) | Agendamento relacionado. |
| updatedByUserId | int (FK) | Usuário que realizou a mudança. |
| fromStatus | string | Status anterior. |
| toStatus | string | Status atualizado. |
| changedAt | datetime | Data/hora da modificação. |

**📄 Tabela: APPOINTMENT_SERVICES**

**Descrição**: Serviços associados ao agendamento (um ou mais por agendamento).

| **Campo** | **Tipo** | **Descrição** |
| --- | --- | --- |
| id  | int (PK) | Identificador único. |
| appointmentId | int (FK) | Agendamento relacionado. |
| serviceId | int (FK) | Serviço realizado. |
| variantId | int (FK) | Variante do serviço (se houver). |
| customPrice | float | Preço customizado. |
| customDuration | int | Duração customizada. |
| discountType | string | Tipo de desconto aplicado. |
| discountValue | float | Valor do desconto. |
| createdAt | datetime | Criação. |
| updatedAt | datetime | Atualização. |

**📄 Tabela: APPOINTMENT_ASSISTANTS**

**Descrição**: Profissionais auxiliares em um agendamento.

| **Campo** | **Tipo** | **Descrição** |
| --- | --- | --- |
| id  | int (PK) | Identificador único. |
| appointmentId | int (FK) | Referência ao agendamento. |
| userId | int (FK) | Assistente envolvido. |
| createdAt | datetime | Criação do registro. |

**📄 Tabela: APPOINTMENT_REPETITIONS**

**Descrição**: Informações sobre a recorrência do agendamento.

| **Campo** | **Tipo** | **Descrição** |
| --- | --- | --- |
| id  | int (PK) | Identificador da repetição. |
| appointmentId | int (FK) | Agendamento pai. |
| intervalValue | int | Número do intervalo. |
| intervalUnit | string | Unidade de tempo (dias, semanas). |
| repeatUntil | date | Data limite da repetição. |
| createdAt | datetime | Criação do registro. |

**🔹 8. Modelagem Técnica: Vouchers**

**📄 Tabela: VOUCHERS**

**Descrição**: Cupons promocionais aplicáveis em vendas e agendamentos.

| **Campo** | **Tipo** | **Descrição** |
| --- | --- | --- |
| id  | int (PK) | Identificador único do voucher. |
| userId | int (FK) | Criador do voucher. |
| code | string | Código do voucher. |
| discountValue | float | Valor fixo de desconto. |
| discountPercentage | float | Percentual de desconto. |
| discountType | string | Tipo de desconto (fixo ou percentual). |
| applicableTo | string | Tipo de entidade (serviço, produto, etc). |
| applicableEntityId | int (FK) | ID da entidade específica. |
| usageLimit | int | Quantidade máxima de utilizações. |
| usedCount | int | Quantas vezes foi utilizado. |
| expirationDate | datetime | Data de expiração. |
| issueDate | datetime | Data de emissão. |
| status | string | Ativo, expirado, cancelado. |
| createdAt | datetime | Data de criação. |
| updatedAt | datetime | Última modificação. |
| deletedAt | datetime | Soft delete. |

**🔹 9. Modelagem Técnica: Vendas**

**📄 Tabela: SALES**

**Descrição**: Registro principal de transações realizadas no sistema.

| **Campo** | **Tipo** | **Descrição** |
| --- | --- | --- |
| id  | int (PK) | Identificador da venda. |
| clientId | int (FK) | Cliente que realizou a compra. |
| employeeId | int (FK) | Profissional que efetuou a venda. |
| voucherId | int (FK) | Voucher aplicado (se houver). |
| createdByUserId | int (FK) | Usuário que registrou a venda. |
| updatedByUserId | int (FK) | Último usuário que modificou a venda. |
| originalTotal | float | Valor bruto da venda. |
| discountApplied | float | Valor total de descontos aplicados. |
| finalTotal | float | Valor final da venda após descontos. |
| date | datetime | Data da venda. |
| createdAt | datetime | Data de criação do registro. |
| updatedAt | datetime | Última modificação. |
| deletedAt | datetime | Soft delete. |

**🔹 10. Itens de Venda**

**📄 Tabela: SALE_SERVICES**

**Descrição**: Serviços vendidos em uma transação.

| **Campo** | **Tipo** | **Descrição** |
| --- | --- | --- |
| id  | int (PK) | Identificador único. |
| saleId | int (FK) | Venda relacionada. |
| serviceId | int (FK) | Serviço vendido. |
| variantId | int (FK) | Variante específica (se aplicável). |
| unitPrice | float | Preço unitário. |
| discount | float | Valor do desconto. |
| finalPrice | float | Preço final com desconto. |
| createdAt | datetime | Criação do registro. |

**📄 Tabela: SALE_PRODUCTS**

**Descrição**: Produtos vendidos em uma transação.

| **Campo** | **Tipo** | **Descrição** |
| --- | --- | --- |
| id  | int (PK) | Identificador único. |
| saleId | int (FK) | Venda associada. |
| productId | int (FK) | Produto vendido. |
| quantity | int | Quantidade. |
| unitPrice | float | Preço por unidade. |
| discount | float | Desconto aplicado. |
| finalPrice | float | Preço final com desconto. |
| createdAt | datetime | Criação do registro. |

**📄 Tabela: SALE_PACKAGES**

**Descrição**: Pacotes vendidos em uma transação.

| **Campo** | **Tipo** | **Descrição** |
| --- | --- | --- |
| id  | int (PK) | Identificador único. |
| saleId | int (FK) | Venda associada. |
| packageId | int (FK) | Pacote vendido. |
| originalPrice | float | Preço cheio. |
| discount | float | Desconto aplicado. |
| finalPrice | float | Preço final com desconto. |
| createdAt | datetime | Criação do registro. |

**🔹 11. ERD**

erDiagram

&nbsp;   USERS ||--o{ USER_SALONS : "participates in"

&nbsp;   USERS ||--o{ CLIENTS : "linked (optional)"

&nbsp;   USERS ||--o{ AVAILABLE_TIMESLOTS : "sets"

&nbsp;   USERS ||--o{ NOTIFICATIONS : "receives"

&nbsp;   USERS ||--o{ PAYMENTS : "makes"

&nbsp;   USERS ||--o{ SALES : "buys"

&nbsp;   USERS ||--o{ LOGS : "performs"

&nbsp;   USERS {

&nbsp;       int id PK

&nbsp;       string name

&nbsp;       string email

&nbsp;       string password

&nbsp;       string phone

&nbsp;       string phone2

&nbsp;       string phoneType

&nbsp;       string phoneType2

&nbsp;       string address

&nbsp;       string adressNumber

&nbsp;       string complement

&nbsp;       string city

&nbsp;       string state

&nbsp;       string zipCode

&nbsp;       datetime birthDate

&nbsp;       string activeSalonId

&nbsp;       datetime createdAt

&nbsp;       datetime updatedAt

&nbsp;       datetime deletedAt

&nbsp;   }

&nbsp;   USER_SALONS ||--o{ USER_ROLES : "has roles"

&nbsp;   USER_SALONS {

&nbsp;       int id PK

&nbsp;       int userId FK

&nbsp;       int salonId FK

&nbsp;       string\[\] rolesInSalon

&nbsp;       string\[\] permmissionsInSalon

&nbsp;       boolean isActive

&nbsp;       datetime createdAt

&nbsp;       datetime updatedAt

&nbsp;       datetime deletedAt

&nbsp;   }

&nbsp;   ROLES ||--o{ USER_ROLES : "assigned to"

&nbsp;   ROLES ||--o{ ROLE_PERMISSIONS : "has permissions"

&nbsp;   ROLES {

&nbsp;       int id PK

&nbsp;       int salonId FK

&nbsp;       string name

&nbsp;       datetime createdAt

&nbsp;       datetime updatedAt

&nbsp;       datetime deletedAt

&nbsp;   }

&nbsp;   PERMISSIONS ||--o{ ROLE_PERMISSIONS : "part of"

&nbsp;   PERMISSIONS {

&nbsp;       int id PK

&nbsp;       string name

&nbsp;       string description

&nbsp;       datetime createdAt

&nbsp;   }

&nbsp;   ROLE_PERMISSIONS ||--|| ROLES : "linked to"

&nbsp;   ROLE_PERMISSIONS ||--|| PERMISSIONS : "linked to"

&nbsp;   ROLE_PERMISSIONS {

&nbsp;       int id PK

&nbsp;       int roleId FK

&nbsp;       int permissionId FK

&nbsp;       datetime createdAt

&nbsp;   }

&nbsp;   USER_ROLES ||--|| USER_SALONS : "in context of"

&nbsp;   USER_ROLES ||--|| ROLES : "is role"

&nbsp;   USER_ROLES {

&nbsp;       int id PK

&nbsp;       int userSalonId FK

&nbsp;       int roleId FK

&nbsp;       datetime createdAt

&nbsp;   }

&nbsp;   LOGS {

&nbsp;       int id PK

&nbsp;       int userId FK

&nbsp;       string entity

&nbsp;       string entityId

&nbsp;       string action

&nbsp;       json before

&nbsp;       json after

&nbsp;       datetime createdAt

&nbsp;   }

&nbsp;   SALONS ||--o{ USER_SALONS : "has users"

&nbsp;   SALONS ||--o{ SERVICES : "offers"

&nbsp;   SALONS ||--o{ PRODUCTS : "sells"

&nbsp;   SALONS ||--o{ PACKAGES : "provides"

&nbsp;   SALONS ||--o{ AVAILABLE_TIMESLOTS : "sets"

&nbsp;   SALONS ||--o{ NOTIFICATIONS : "sends"

&nbsp;   SALONS ||--o{ SERVICE_ROOMS : "has rooms"

&nbsp;   SALONS {

&nbsp;       int id PK

&nbsp;       string name

&nbsp;       string description

&nbsp;       string cnpj

&nbsp;       string address

&nbsp;       string adressNumber

&nbsp;       string complement

&nbsp;       string city

&nbsp;       string state

&nbsp;       string zipCode

&nbsp;       string phoneType

&nbsp;       string phone

&nbsp;       string phoneType2

&nbsp;       string phone2

&nbsp;       string email

&nbsp;       string\[\] targetAudience

&nbsp;       string siteUrl

&nbsp;       string facebookUrl

&nbsp;       string instagramUrl

&nbsp;       datetime createdAt

&nbsp;       datetime updatedAt

&nbsp;       datetime deletedAt

&nbsp;   }

&nbsp;   AVAILABLE_TIMESLOTS ||--|| USERS : "belongs to"

&nbsp;   AVAILABLE_TIMESLOTS ||--|| SALONS : "defined at"

&nbsp;   AVAILABLE_TIMESLOTS {

&nbsp;       int id PK

&nbsp;       int userId FK

&nbsp;       int salonId FK

&nbsp;       string weekday

&nbsp;       time startTime

&nbsp;       time endTime

&nbsp;       boolean isAvailable

&nbsp;       datetime createdAt

&nbsp;       datetime updatedAt

&nbsp;   }

&nbsp;   NOTIFICATIONS ||--|| USERS : "sent to"

&nbsp;   NOTIFICATIONS ||--|| SALONS : "contextual to"

&nbsp;   NOTIFICATIONS {

&nbsp;       int id PK

&nbsp;       int userId FK

&nbsp;       int salonId FK

&nbsp;       string title

&nbsp;       string message

&nbsp;       string type

&nbsp;       boolean systemGenerated

&nbsp;       boolean read

&nbsp;       datetime createdAt

&nbsp;   }

&nbsp;   SERVICE_ROOMS {

&nbsp;       int id PK

&nbsp;       int salonId FK

&nbsp;       string name

&nbsp;       string description

&nbsp;       datetime createdAt

&nbsp;       datetime updatedAt

&nbsp;       datetime deletedAt

&nbsp;   }

&nbsp;   CLIENTS ||--|| USERS : "optional"

&nbsp;   CLIENTS ||--o{ CLIENT_CREDITS : "receives"

&nbsp;   CLIENTS ||--o{ APPOINTMENTS : "schedules"

&nbsp;   CLIENTS ||--o{ SALES : "generates"

&nbsp;   CLIENTS {

&nbsp;       int id PK

&nbsp;       int salonId FK

&nbsp;       int userId FK

&nbsp;       string name

&nbsp;       string email

&nbsp;       string phone

&nbsp;       string observations

&nbsp;       datetime createdAt

&nbsp;       datetime updatedAt

&nbsp;       datetime deletedAt

&nbsp;   }

&nbsp;   CLIENT_CREDITS ||--o{ CREDIT_PAYMENTS : "used in"

&nbsp;   CLIENT_CREDITS {

&nbsp;       int id PK

&nbsp;       int clientId FK

&nbsp;       int professionalId FK

&nbsp;       int salonId FK

&nbsp;       float amount

&nbsp;       string origin

&nbsp;       string paymentMethod

&nbsp;       datetime date

&nbsp;       string notes

&nbsp;       datetime createdAt

&nbsp;       datetime updatedAt

&nbsp;   }

&nbsp;   PAYMENTS ||--o{ CREDIT_PAYMENTS : "consumes credits"

&nbsp;   PAYMENTS ||--|| USERS : "made by"

&nbsp;   PAYMENTS ||--|| SALES : "for sale"

&nbsp;   PAYMENTS ||--|| PAYMENT_METHODS : "uses method"

&nbsp;   PAYMENTS {

&nbsp;       int id PK

&nbsp;       int userId FK

&nbsp;       int saleId FK

&nbsp;       int methodId FK

&nbsp;       float amount

&nbsp;       string status

&nbsp;       datetime createdAt

&nbsp;   }

&nbsp;   PAYMENT_METHODS {

&nbsp;       int id PK

&nbsp;       string name

&nbsp;       string type

&nbsp;       boolean isOnline

&nbsp;   }

&nbsp;   CREDIT_PAYMENTS {

&nbsp;       int id PK

&nbsp;       int paymentId FK

&nbsp;       int creditId FK

&nbsp;       float amountUsed

&nbsp;       datetime createdAt

&nbsp;   }

&nbsp;   SERVICES ||--o{ SERVICE_CATEGORIES : "categorized as"

&nbsp;   SERVICES ||--o{ SALE_SERVICES : "sold in"

&nbsp;   SERVICES ||--o{ SERVICE_VARIANTS : "has variants"

&nbsp;   SERVICES ||--|| COMMISSION_CONFIGS : "commission rule"

&nbsp;   SERVICES ||--|| USERS : "created by"

&nbsp;   SERVICES ||--|| SERVICE_ROOMS : "performed in"

&nbsp;   SERVICES {

&nbsp;       int id PK

&nbsp;       int salonId FK

&nbsp;       int createdByUserId FK

&nbsp;       int updatedByUserId FK

&nbsp;       int serviceRoomId FK

&nbsp;       string name

&nbsp;       string description

&nbsp;       boolean hasVariants

&nbsp;       int duration

&nbsp;       float price

&nbsp;       float costValue

&nbsp;       string costValueType

&nbsp;       float nonCommissionableValue

&nbsp;       string nonCommissionableValueType

&nbsp;       string cardColor

&nbsp;       datetime createdAt

&nbsp;       datetime updatedAt

&nbsp;       datetime deletedAt

&nbsp;   }

&nbsp;   SERVICE_VARIANTS {

&nbsp;       int id PK

&nbsp;       int serviceId FK

&nbsp;       string name

&nbsp;       string description

&nbsp;       int duration

&nbsp;       float price

&nbsp;       float costValue

&nbsp;       string costValueType

&nbsp;       float nonCommissionableValue

&nbsp;       string nonCommissionableValueType

&nbsp;       datetime createdAt

&nbsp;       datetime updatedAt

&nbsp;       datetime deletedAt

&nbsp;   }

&nbsp;   COMMISSION_CONFIGS {

&nbsp;       int id PK

&nbsp;       int serviceId FK

&nbsp;       string commissionType

&nbsp;       string baseValueType

&nbsp;       float baseValue

&nbsp;       boolean deductAssistantsFromProfessional

&nbsp;       float soloValue

&nbsp;       string soloValueType

&nbsp;       float withAssistantValue

&nbsp;       string withAssistantValueType

&nbsp;       float asAssistantValue

&nbsp;       string asAssistantValueType

&nbsp;       datetime createdAt

&nbsp;       datetime updatedAt

&nbsp;   }

&nbsp;   SERVICE_CATEGORIES {

&nbsp;       int id PK

&nbsp;       int serviceId FK

&nbsp;       string name

&nbsp;       string color

&nbsp;       datetime createdAt

&nbsp;       datetime updatedAt

&nbsp;   }

&nbsp;   PACKAGES ||--o{ PACKAGE_SERVICES : "includes"

&nbsp;   PACKAGES ||--|| USERS : "created by"

&nbsp;   PACKAGES {

&nbsp;       int id PK

&nbsp;       int salonId FK

&nbsp;       int createdByUserId FK

&nbsp;       int updatedByUserId FK

&nbsp;       string name

&nbsp;       string description

&nbsp;       float totalPrice

&nbsp;       string validityType

&nbsp;       int validityValue

&nbsp;       boolean isArchived

&nbsp;       datetime createdAt

&nbsp;       datetime updatedAt

&nbsp;       datetime deletedAt

&nbsp;   }

&nbsp;   PACKAGE_SERVICES ||--|| SERVICES : "linked"

&nbsp;   PACKAGE_SERVICES ||--|| PACKAGES : "belongs to"

&nbsp;   PACKAGE_SERVICES {

&nbsp;       int id PK

&nbsp;       int packageId FK

&nbsp;       int serviceId FK

&nbsp;       float customUnitPrice

&nbsp;       int quantity

&nbsp;       datetime createdAt

&nbsp;       datetime updatedAt

&nbsp;   }

&nbsp;   PRODUCTS ||--|| PRODUCT_CATEGORIES : "category"

&nbsp;   PRODUCTS ||--|| PRODUCT_BRANDS : "brand"

&nbsp;   PRODUCTS ||--|| SUPPLIERS : "supplier"

&nbsp;   PRODUCTS ||--o{ STOCK_RECORDS : "movements"

&nbsp;   PRODUCTS ||--|| USERS : "created by"

&nbsp;   PRODUCTS {

&nbsp;       int id PK

&nbsp;       int salonId FK

&nbsp;       int categoryId FK

&nbsp;       int brandId FK

&nbsp;       int supplierId FK

&nbsp;       int createdByUserId FK

&nbsp;       int updatedByUserId FK

&nbsp;       string name

&nbsp;       float costPrice

&nbsp;       float salePrice

&nbsp;       int stockQuantity

&nbsp;       int initialStock

&nbsp;       int minimumStock

&nbsp;       float saleCommissionValue

&nbsp;       string saleCommissionType

&nbsp;       string unitOfMeasure

&nbsp;       int quantityPerPackage

&nbsp;       string barcode

&nbsp;       string sku

&nbsp;       boolean isArchived

&nbsp;       datetime createdAt

&nbsp;       datetime updatedAt

&nbsp;       datetime deletedAt

&nbsp;   }

&nbsp;   PRODUCT_CATEGORIES {

&nbsp;       int id PK

&nbsp;       int salonId FK

&nbsp;       string name

&nbsp;       string description

&nbsp;       datetime createdAt

&nbsp;       datetime updatedAt

&nbsp;       datetime deletedAt

&nbsp;   }

&nbsp;   PRODUCT_BRANDS {

&nbsp;       int id PK

&nbsp;       int salonId FK

&nbsp;       string name

&nbsp;       string description

&nbsp;       datetime createdAt

&nbsp;       datetime updatedAt

&nbsp;       datetime deletedAt

&nbsp;   }

&nbsp;   SUPPLIERS {

&nbsp;       int id PK

&nbsp;       int salonId FK

&nbsp;       string name

&nbsp;       string description

&nbsp;       string email

&nbsp;       string phoneType

&nbsp;       string phone

&nbsp;       string phoneType2

&nbsp;       string phone2

&nbsp;       string contactName

&nbsp;       string cnpj

&nbsp;       string address

&nbsp;       string adressNumber

&nbsp;       string complement

&nbsp;       string city

&nbsp;       string state

&nbsp;       string zipCode

&nbsp;       datetime createdAt

&nbsp;       datetime updatedAt

&nbsp;       datetime deletedAt

&nbsp;   }

&nbsp;   STOCK_RECORDS ||--|| PRODUCTS : "related to"

&nbsp;   STOCK_RECORDS {

&nbsp;       int id PK

&nbsp;       int productId FK

&nbsp;       string movementType

&nbsp;       int quantity

&nbsp;       string reason

&nbsp;       datetime date

&nbsp;       datetime createdAt

&nbsp;       datetime updatedAt

&nbsp;   }

&nbsp;   APPOINTMENTS ||--|| CLIENTS : "by"

&nbsp;   APPOINTMENTS ||--|| USERS : "professional"

&nbsp;   APPOINTMENTS ||--|| SALONS : "at"

&nbsp;   APPOINTMENTS ||--|| VOUCHERS : "uses"

&nbsp;   APPOINTMENTS ||--o{ APPOINTMENT_SERVICES : "includes"

&nbsp;   APPOINTMENTS ||--o{ APPOINTMENT_ASSISTANTS : "has assistants"

&nbsp;   APPOINTMENTS ||--|| APPOINTMENT_REPETITIONS : "recurs with"

&nbsp;   APPOINTMENTS ||--o{ APPOINTMENT_STATUS_LOGS : "status history"

&nbsp;   APPOINTMENTS {

&nbsp;       int id PK

&nbsp;       int salonId FK

&nbsp;       int clientId FK

&nbsp;       int professionalId FK

&nbsp;       int voucherId FK

&nbsp;       datetime date

&nbsp;       time startTime

&nbsp;       string status

&nbsp;       string paymentStatus

&nbsp;       string notes

&nbsp;       datetime createdAt

&nbsp;       datetime updatedAt

&nbsp;       datetime deletedAt

&nbsp;   }

&nbsp;   APPOINTMENT_STATUS_LOGS {

&nbsp;       int id PK

&nbsp;       int appointmentId FK

&nbsp;       int updatedByUserId FK

&nbsp;       string fromStatus

&nbsp;       string toStatus

&nbsp;       datetime changedAt

&nbsp;   }

&nbsp;   APPOINTMENT_SERVICES ||--|| SERVICES : "of"

&nbsp;   APPOINTMENT_SERVICES {

&nbsp;       int id PK

&nbsp;       int appointmentId FK

&nbsp;       int serviceId FK

&nbsp;       int variantId FK

&nbsp;       float customPrice

&nbsp;       int customDuration

&nbsp;       string discountType

&nbsp;       float discountValue

&nbsp;       datetime createdAt

&nbsp;       datetime updatedAt

&nbsp;   }

&nbsp;   APPOINTMENT_ASSISTANTS ||--|| USERS : "assistant"

&nbsp;   APPOINTMENT_ASSISTANTS {

&nbsp;       int id PK

&nbsp;       int appointmentId FK

&nbsp;       int userId FK

&nbsp;       datetime createdAt

&nbsp;   }

&nbsp;   APPOINTMENT_REPETITIONS {

&nbsp;       int id PK

&nbsp;       int appointmentId FK

&nbsp;       int intervalValue

&nbsp;       string intervalUnit

&nbsp;       date repeatUntil

&nbsp;       datetime createdAt

&nbsp;   }

&nbsp;   VOUCHERS ||--o{ APPOINTMENTS : "used in"

&nbsp;   VOUCHERS ||--o{ SALES : "used in"

&nbsp;   VOUCHERS {

&nbsp;       int id PK

&nbsp;       int userId FK

&nbsp;       string code

&nbsp;       float discountValue

&nbsp;       float discountPercentage

&nbsp;       string discountType

&nbsp;       string applicableTo

&nbsp;       int applicableEntityId FK

&nbsp;       int usageLimit

&nbsp;       int usedCount

&nbsp;       datetime expirationDate

&nbsp;       datetime issueDate

&nbsp;       string status

&nbsp;       datetime createdAt

&nbsp;       datetime updatedAt

&nbsp;       datetime deletedAt

&nbsp;   }

&nbsp;   SALES ||--o{ SALE_SERVICES : "includes services"

&nbsp;   SALES ||--o{ SALE_PRODUCTS : "includes products"

&nbsp;   SALES ||--o{ SALE_PACKAGES : "includes packages"

&nbsp;   SALES ||--|| USERS : "handled by employee"

&nbsp;   SALES ||--|| CLIENTS : "by client"

&nbsp;   SALES ||--|| VOUCHERS : "discounted by"

&nbsp;   SALES ||--|| USERS : "created by"

&nbsp;   SALES {

&nbsp;       int id PK

&nbsp;       int clientId FK

&nbsp;       int employeeId FK

&nbsp;       int voucherId FK

&nbsp;       int createdByUserId FK

&nbsp;       int updatedByUserId FK

&nbsp;       float originalTotal

&nbsp;       float discountApplied

&nbsp;       float finalTotal

&nbsp;       datetime date

&nbsp;       datetime createdAt

&nbsp;       datetime updatedAt

&nbsp;       datetime deletedAt

&nbsp;   }

&nbsp;   SALE_SERVICES {

&nbsp;       int id PK

&nbsp;       int saleId FK

&nbsp;       int serviceId FK

&nbsp;       int variantId FK

&nbsp;       float unitPrice

&nbsp;       float discount

&nbsp;       float finalPrice

&nbsp;       datetime createdAt

&nbsp;   }

&nbsp;   SALE_PRODUCTS {

&nbsp;       int id PK

&nbsp;       int saleId FK

&nbsp;       int productId FK

&nbsp;       int quantity

&nbsp;       float unitPrice

&nbsp;       float discount

&nbsp;       float finalPrice

&nbsp;       datetime createdAt

&nbsp;   }

&nbsp;   SALE_PACKAGES {

&nbsp;       int id PK

&nbsp;       int saleId FK

&nbsp;       int packageId FK

&nbsp;       float originalPrice

&nbsp;       float discount

&nbsp;       float finalPrice

&nbsp;       datetime createdAt

&nbsp;   }