# 🚀 ROADMAP: GLAMO - SUPER EVOLUÇÃO DO BELASIS

**Objetivo:** Tornar o Glamo superior ao Belasis em todos os aspectos  
**Visão:** "Assim como Belasis é uma evolução do Salão99, Glamo será uma super evolução do Belasis"  
**Data:** 19 de Novembro de 2025

---

## 📋 SUMÁRIO EXECUTIVO

### Estratégia de Implementação

Este roadmap está dividido em **4 Fases Prioritárias** baseadas em:
- **Impacto Competitivo** (o quanto afeta posicionamento no mercado)
- **Esforço Técnico** (complexidade e tempo de implementação)
- **Dependências** (o que precisa ser feito antes)
- **ROI** (retorno sobre investimento)

### Visão Geral das Fases

- **FASE 0 (CRÍTICA):** WhatsApp + Pagamentos Online - 8-10 semanas
- **FASE 1 (IMPORTANTE):** Anamneses + Promoções + Metas - 6-8 semanas
- **FASE 2 (OTIMIZAÇÕES):** CRM WhatsApp + NF + Melhorias - 8-10 semanas
- **FASE 3 (EXPANSÃO):** App White Label + Avaliações - 6-8 semanas

**Tempo Total Estimado:** 28-36 semanas (~7-9 meses)

---

## 🔴 FASE 0: GAPS CRÍTICOS (Prioridade Máxima)

**Objetivo:** Implementar features sem as quais o Glamo NÃO consegue competir  
**Duração:** 8-10 semanas  
**Impacto:** CRÍTICO - Sem isso, Glamo está inviável competitivamente

### 1. Integração WhatsApp Business API ⭐⭐⭐⭐⭐

**Status Belasis:** ✅ Completo com automação total  
**Status Glamo:** ❌ Não implementado  
**Impacto:** 🔴 CRÍTICO - WhatsApp é canal #1 no Brasil  
**Esforço:** 🔴 ALTO (4-5 semanas)

#### Requisitos de Implementação

**1.1 Backend Infrastructure**
- [ ] Criar módulo `src/whatsapp/`
- [ ] Integração com WhatsApp Business API oficial
- [ ] Webhook handler para mensagens recebidas
- [ ] Queue system para envio (Bull/BullMQ)
- [ ] Rate limiting (80 msg/seg Cloud API)
- [ ] Template management (criar, aprovar, usar)
- [ ] Message tracking e delivery status
- [ ] Error handling e retry logic

**Arquivos a criar:**
```
src/whatsapp/
├── whatsappConfig.ts          # Configuração API
├── whatsappClient.ts          # Cliente WhatsApp
├── webhookHandler.ts          # Receber mensagens
├── messageQueue.ts            # Fila de envio
├── templateManager.ts         # Gestão de templates
├── deliveryTracker.ts         # Rastreamento
└── operations.ts              # Operações Wasp
```

**1.2 Message Templates**
- [ ] Template: Confirmação de agendamento
- [ ] Template: Lembrete 24h antes
- [ ] Template: Lembrete 1h antes
- [ ] Template: Mensagem de aniversário
- [ ] Template: Cliente inativo (15/30/60/90 dias)
- [ ] Template: Promoção personalizada
- [ ] Template: Cobrança pendente
- [ ] Template: Agradecimento pós-atendimento
- [ ] Template: Solicitação de avaliação
- [ ] Interface para criar novos templates

**1.3 Automation Engine**
- [ ] Job: Enviar aniversários (diário 9h)
- [ ] Job: Enviar lembretes agendamentos (a cada hora)
- [ ] Job: Enviar reativação inativos (semanal seg 10h)
- [ ] Job: Enviar cobranças pendentes (diário 10h)
- [ ] Job: Enviar promoções (configurável)
- [ ] Job: Solicitar avaliações (1 dia após atendimento)
- [ ] Configurações: Ligar/desligar cada automação
- [ ] Configurações: Horários de envio
- [ ] Configurações: Segmentação de público

**1.4 Frontend**
- [ ] Dashboard WhatsApp (visão geral)
- [ ] Configuração de conta WhatsApp Business
- [ ] Gestão de templates
- [ ] Histórico de mensagens enviadas
- [ ] Relatório de entregas/leituras
- [ ] Configurações de automações
- [ ] Preview de templates antes de enviar
- [ ] Teste de envio (número específico)

**1.5 Integração com Módulos Existentes**
- [ ] `appointments`: Enviar confirmações e lembretes
- [ ] `clients`: Aniversários, inativos, segmentação
- [ ] `campaigns`: Usar WhatsApp como canal
- [ ] `sales`: Cobranças, agradecimentos
- [ ] `notifications`: WhatsApp como notification channel

**Tecnologias:**
- WhatsApp Business API (Cloud API ou On-Premise)
- Bull/BullMQ para filas
- Redis para cache
- Twilio/360Dialog como provedor (alternativas)

**Estimativa:** 4-5 semanas (1 dev sênior)

**Custos Mensais Estimados:**
- WhatsApp Cloud API: ~R$ 0,05-0,15 por mensagem
- Provedor (Twilio/360Dialog): R$ 200-500/mês base
- Infraestrutura (Redis, queue): R$ 100-200/mês

**Entregável:** Sistema completo de WhatsApp Marketing com automações

---

### 2. Gateway de Pagamento Online Integrado ⭐⭐⭐⭐⭐

**Status Belasis:** ✅ Belasis Pay (conta digital completa)  
**Status Glamo:** ⚠️ Stripe básico (sem integração com agendamento)  
**Impacto:** 🔴 CRÍTICO - Pagamento online reduz cancelamentos  
**Esforço:** 🟡 MÉDIO/ALTO (3-4 semanas)

#### Requisitos de Implementação

**2.1 Backend - Payment Gateway**

**Opção A: Integração Stripe Checkout Completa** (RECOMENDADO)
- [ ] Criar módulo `src/payment/`
- [ ] Stripe Checkout Session para agendamentos
- [ ] Webhook handler (payment_intent.succeeded)
- [ ] Link payment com appointment
- [ ] Automatic confirmation após pagamento
- [ ] Refund logic (cancelamentos)
- [ ] Payment tracking e reconciliation
- [ ] Multi-payment methods (cartão, PIX, boleto)

**Opção B: Mercado Pago** (Alternativa mais BR)
- [ ] Integração MP Checkout Pro
- [ ] Webhooks MP
- [ ] PIX imediato
- [ ] Parcelamento

**Opção C: Gateway Próprio** (FUTURO - Fase 4)
- [ ] Requer licença financeira
- [ ] Integração com adquirentes (Stone, Cielo, etc)
- [ ] Compliance PCI-DSS
- [ ] **NÃO PRIORITÁRIO AGORA**

**2.2 Integração com Agendamento Online**
- [ ] `src/booking/publicOperations.ts`: Adicionar payment step
- [ ] `createPublicBooking`: Accept payment_intent_id
- [ ] Appointment status: PENDING_PAYMENT
- [ ] Appointment auto-confirm on payment
- [ ] Appointment auto-cancel on payment_failed (30min)
- [ ] Email/WhatsApp confirmation com payment details

**2.3 Frontend - Booking Flow**
- [ ] Step 1: Escolher serviço/profissional
- [ ] Step 2: Escolher data/hora
- [ ] Step 3: Dados do cliente
- [ ] **Step 4: Pagamento (NOVO)**
- [ ] Stripe Elements integration
- [ ] PIX QR Code (MP ou Stripe)
- [ ] Boleto (MP)
- [ ] Loading states
- [ ] Success page com confirmação
- [ ] Failed page com retry

**2.4 Admin Dashboard**
- [ ] Configuração de gateway (chaves API)
- [ ] Configuração de preços (taxas, markup)
- [ ] Relatório de pagamentos online
- [ ] Reconciliação (payments vs appointments)
- [ ] Refund management
- [ ] Payout tracking

**2.5 Schema Changes**
```prisma
model Appointment {
  // ... existing fields
  requiresPayment    Boolean  @default(false)
  paymentStatus      PaymentStatus?
  paymentIntentId    String?
  paidAmount         Decimal?
  paidAt             DateTime?
}

enum PaymentStatus {
  PENDING
  PROCESSING
  SUCCEEDED
  FAILED
  REFUNDED
  PARTIALLY_REFUNDED
}

model OnlinePayment {
  id                 Int      @id @default(autoincrement())
  appointmentId      Int      @unique
  appointment        Appointment @relation(...)
  gateway            String   // stripe, mercadopago
  paymentIntentId    String   @unique
  amount             Decimal
  currency           String   @default("BRL")
  status             PaymentStatus
  paymentMethod      String?  // card, pix, boleto
  createdAt          DateTime @default(now())
  paidAt             DateTime?
  refundedAt         DateTime?
  refundAmount       Decimal?
}
```

**Tecnologias:**
- Stripe (recomendado - API melhor)
- Mercado Pago (alternativa BR com PIX)
- Webhooks para confirmações
- Redis para locks (prevent double payment)

**Estimativa:** 3-4 semanas (1 dev sênior)

**Custos Mensais:**
- Stripe: 3,99% + R$ 0,39 por transação (BR)
- Mercado Pago: 4,99% por transação
- Infraestrutura: Incluído no backend existente

**Entregável:** Agendamento online com pagamento integrado

---

### 3. CRM WhatsApp Web Extension (Chrome) ⭐⭐⭐⭐

**Status Belasis:** ✅ Extensão Chrome completa  
**Status Glamo:** ❌ Não implementado  
**Impacto:** 🔴 ALTO - Agiliza workflow dos atendentes  
**Esforço:** 🟡 MÉDIO (2-3 semanas)

#### Requisitos de Implementação

**3.1 Chrome Extension Structure**
```
extension/
├── manifest.json              # Chrome extension config
├── background.js              # Service worker
├── content-script.js          # Inject into WhatsApp Web
├── popup.html/js              # Extension popup
├── sidebar.html/js            # Sidebar injected
└── icons/                     # Extension icons
```

**3.2 Core Features**
- [ ] **Manifest V3** (latest Chrome standard)
- [ ] Inject sidebar into WhatsApp Web
- [ ] Detect selected contact (phone number)
- [ ] API call to Glamo backend (get client by phone)
- [ ] Display client info in sidebar:
  - Nome, email, foto
  - Próximos agendamentos
  - Último atendimento
  - Histórico de vendas (resumo)
  - Saldo cashback/loyalty
  - Notas/observações
- [ ] Quick actions:
  - Criar novo agendamento
  - Ver histórico completo
  - Adicionar nota
  - Ver fotos (antes/depois)
- [ ] Import contact to Glamo (se não existe)
- [ ] Auto-save interactions no sistema

**3.3 Backend API**
- [ ] Endpoint: `GET /api/crm/client-by-phone/:phone`
- [ ] Endpoint: `GET /api/crm/client-quick-info/:clientId`
- [ ] Endpoint: `POST /api/crm/quick-appointment`
- [ ] Endpoint: `POST /api/crm/import-contact`
- [ ] Endpoint: `POST /api/crm/add-note`
- [ ] Authentication: Extension API key (per salon)
- [ ] CORS configuration para extension

**3.4 Security**
- [ ] Extension API key (não user password)
- [ ] Salon-scoped access
- [ ] Rate limiting
- [ ] Audit log de actions via extension

**3.5 Distribution**
- [ ] Publish to Chrome Web Store
- [ ] Setup instructions in Glamo admin
- [ ] Generate API key per salon
- [ ] Tutorial video

**Tecnologias:**
- Chrome Extension Manifest V3
- JavaScript (ou TypeScript compilado)
- React (para sidebar UI - opcional)
- Chrome Storage API
- Message Passing API

**Estimativa:** 2-3 semanas (1 dev frontend)

**Custos:**
- Chrome Web Store: $5 USD one-time
- Manutenção: Incluído

**Entregável:** Extensão Chrome publicada na Web Store

---

### FASE 0 - Resumo de Entregas

| Item | Esforço | Impacto | Custo Mensal |
|---|---|---|---|
| WhatsApp API | 4-5 sem | 🔴 CRÍTICO | R$ 300-700 |
| Gateway Pagamento | 3-4 sem | 🔴 CRÍTICO | Taxa transação |
| Extension Chrome | 2-3 sem | 🔴 ALTO | R$ 0 |
| **TOTAL FASE 0** | **9-12 sem** | **GAME CHANGER** | **R$ 300-700** |

**ROI Esperado:**
- Redução de cancelamentos: 10-15% (pagamento confirma)
- Aumento de agendamentos: 15-20% (WhatsApp automação)
- Produtividade atendentes: +30% (extension Chrome)
- **Payback:** 3-4 meses

---

## 🟡 FASE 1: GAPS IMPORTANTES (Alta Prioridade)

**Objetivo:** Features importantes que melhoram competitividade  
**Duração:** 6-8 semanas  
**Impacto:** ALTO - Diferenciação no mercado

### 4. Sistema de Anamneses Digitais com Assinaturas ⭐⭐⭐⭐

**Status Belasis:** ✅ Completo com assinatura digital  
**Status Glamo:** ⚠️ Documents básico  
**Impacto:** 🟡 ALTO - Essencial para clínicas de estética  
**Esforço:** 🟡 MÉDIO (3-4 semanas)

#### Requisitos de Implementação

**4.1 Backend - Anamnese System**
- [ ] Criar módulo `src/anamnese/`
- [ ] Anamnese Templates (modelo customizável)
- [ ] Form builder (campos dinâmicos):
  - Text, Textarea, Number, Date
  - Select, Radio, Checkbox
  - File upload (fotos, documentos)
  - Signature field
- [ ] Anamnese Instances (preenchidas por cliente)
- [ ] PDF Generator (anamnese preenchida)
- [ ] Signature capture e storage
- [ ] Link anamnese com Client
- [ ] Histórico de anamneses por cliente

**4.2 Schema**
```prisma
model AnamneseTemplate {
  id          Int      @id @default(autoincrement())
  salonId     Int
  salon       Salon    @relation(...)
  name        String
  description String?
  fields      Json     // Array de field definitions
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  instances   AnamneseInstance[]
}

model AnamneseInstance {
  id          Int      @id @default(autoincrement())
  templateId  Int
  template    AnamneseTemplate @relation(...)
  clientId    Int
  client      Client   @relation(...)
  appointmentId Int?
  appointment Appointment? @relation(...)
  responses   Json     // { fieldId: value }
  signatureUrl String?
  signedAt    DateTime?
  signedBy    String?
  pdfUrl      String?
  createdAt   DateTime @default(now())
  completedAt DateTime?
}
```

**4.3 Frontend - Template Builder**
- [ ] Drag-and-drop form builder
- [ ] Field types library
- [ ] Conditional logic (show field if X)
- [ ] Preview mode
- [ ] Save templates

**4.4 Frontend - Client Filling**
- [ ] Public link para preencher anamnese
- [ ] Mobile-friendly form
- [ ] Signature capture (canvas)
- [ ] Photo upload
- [ ] Save progress (partial fill)
- [ ] Success page

**4.5 Frontend - Admin View**
- [ ] List anamneses por cliente
- [ ] View filled anamnese (read-only)
- [ ] Download PDF
- [ ] Send via WhatsApp (integration Fase 0)
- [ ] Resend for signature

**4.6 Integração WhatsApp (depende Fase 0)**
- [ ] Template: "Por favor, preencha sua anamnese"
- [ ] Link único por cliente/appointment
- [ ] Lembrete se não preenchida (24h antes)
- [ ] Notificação quando completada

**Tecnologias:**
- React Hook Form para form builder
- Canvas API para signature
- PDFKit ou Puppeteer para PDF generation
- S3/CloudFlare R2 para storage

**Estimativa:** 3-4 semanas (1 dev fullstack)

**Custos Mensais:**
- Storage (S3/R2): R$ 20-50/mês
- PDF generation: Incluído no backend

**Entregável:** Sistema completo de anamneses digitais

---

### 5. Sistema de Promoções por Dia da Semana ⭐⭐⭐

**Status Belasis:** ✅ Completo  
**Status Glamo:** ❌ Não implementado  
**Impacto:** 🟡 MÉDIO - Aumenta vendas em dias fracos  
**Esforço:** 🟢 BAIXO (1-2 semanas)

#### Requisitos de Implementação

**5.1 Backend**
```prisma
model Promotion {
  id          Int      @id @default(autoincrement())
  salonId     Int
  salon       Salon    @relation(...)
  name        String
  description String?
  type        PromotionType // PERCENTAGE, FIXED_AMOUNT
  value       Decimal
  
  // Aplicação
  applyTo     PromotionApplyTo // SERVICE, PRODUCT, BOTH
  serviceIds  Int[]    // Specific services (empty = all)
  productIds  Int[]    // Specific products (empty = all)
  
  // Regras de tempo
  daysOfWeek  Int[]    // 0=Dom, 1=Seg, ..., 6=Sab
  startTime   String?  // "09:00"
  endTime     String?  // "12:00"
  startDate   DateTime?
  endDate     DateTime?
  
  // Restrições
  minPurchase Decimal?
  maxDiscount Decimal?
  usageLimit  Int?     // Total uses
  usageCount  Int      @default(0)
  
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
}

enum PromotionType {
  PERCENTAGE
  FIXED_AMOUNT
}

enum PromotionApplyTo {
  SERVICE
  PRODUCT
  BOTH
}
```

**5.2 Backend Logic**
- [ ] Check active promotions on sale creation
- [ ] Auto-apply best promotion (highest discount)
- [ ] Increment usage count
- [ ] Validate rules (day, time, min purchase)
- [ ] Override manual discounts

**5.3 Frontend - Admin**
- [ ] Create/Edit promotion form
- [ ] Select days of week (checkboxes)
- [ ] Time range picker
- [ ] Service/Product multi-select
- [ ] Preview discount calculation
- [ ] List promotions (active/inactive)
- [ ] Analytics: Usage per promotion

**5.4 Frontend - Sale**
- [ ] Show applicable promotions at checkout
- [ ] Auto-select best promotion
- [ ] Show discount breakdown
- [ ] "Promotion applied" badge

**5.5 Frontend - Public Booking**
- [ ] Show promotions on booking page
- [ ] Highlight discounted services
- [ ] "Promoção ativa" badge

**Estimativa:** 1-2 semanas (1 dev fullstack)

**Custos:** R$ 0 (feature pura)

**Entregável:** Sistema de promoções com regras de dia/hora

---

### 6. Sistema de Metas por Profissional ⭐⭐⭐

**Status Belasis:** ✅ Completo  
**Status Glamo:** ❌ Não implementado  
**Impacto:** 🟡 MÉDIO - Motivação de equipe  
**Esforço:** 🟢 BAIXO/MÉDIO (2 semanas)

#### Requisitos de Implementação

**6.1 Backend**
```prisma
model Goal {
  id          Int      @id @default(autoincrement())
  salonId     Int
  salon       Salon    @relation(...)
  name        String
  description String?
  
  // Target
  type        GoalType // REVENUE, SERVICE_COUNT, PRODUCT_COUNT, CLIENT_COUNT
  targetValue Decimal
  
  // Scope
  scope       GoalScope // INDIVIDUAL, GROUP, SALON
  employeeIds Int[]    // If INDIVIDUAL or GROUP
  
  // Service/Product specific
  serviceIds  Int[]    // Empty = all
  productIds  Int[]    // Empty = all
  
  // Time period
  period      GoalPeriod // DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY
  startDate   DateTime
  endDate     DateTime
  
  // Reward
  rewardType  RewardType? // PERCENTAGE, FIXED_AMOUNT, POINTS
  rewardValue Decimal?
  
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
}

model GoalProgress {
  id          Int      @id @default(autoincrement())
  goalId      Int
  goal        Goal     @relation(...)
  employeeId  Int?
  employee    Employee? @relation(...)
  currentValue Decimal @default(0)
  lastUpdatedAt DateTime @default(now())
  completedAt DateTime?
}

enum GoalType {
  REVENUE        // Faturamento
  SERVICE_COUNT  // Qtd serviços
  PRODUCT_COUNT  // Qtd produtos
  CLIENT_COUNT   // Novos clientes
}

enum GoalScope {
  INDIVIDUAL  // Por profissional
  GROUP       // Grupo de profissionais
  SALON       // Todo salão
}

enum GoalPeriod {
  DAILY
  WEEKLY
  MONTHLY
  QUARTERLY
  YEARLY
}

enum RewardType {
  PERCENTAGE
  FIXED_AMOUNT
  POINTS
}
```

**6.2 Backend Logic**
- [ ] Calculate progress on every sale
- [ ] Job: Daily goal progress update (aggregate)
- [ ] Auto-complete goal when target reached
- [ ] Auto-create rewards (commission, points)
- [ ] Reset goals on period end
- [ ] Historical tracking

**6.3 Frontend - Admin**
- [ ] Create/Edit goal form
- [ ] Select employees (multi-select)
- [ ] Date range picker
- [ ] Target value input with type
- [ ] Reward configuration
- [ ] Goal templates (pre-defined common goals)

**6.4 Frontend - Dashboard**
- [ ] Goals overview (all active)
- [ ] Progress bars per goal
- [ ] Leaderboard (if group goal)
- [ ] Completed goals (history)
- [ ] Employee view: "My Goals"

**6.5 Notifications Integration**
- [ ] Notify employee when goal 50% complete
- [ ] Notify employee when goal 90% complete
- [ ] Notify employee when goal completed
- [ ] Notify manager when any goal completed

**Estimativa:** 2 semanas (1 dev fullstack)

**Custos:** R$ 0 (feature pura)

**Entregável:** Sistema de metas com tracking e rewards

---

### FASE 1 - Resumo de Entregas

| Item | Esforço | Impacto | Custo Mensal |
|---|---|---|---|
| Anamneses Digitais | 3-4 sem | 🟡 ALTO | R$ 20-50 |
| Promoções | 1-2 sem | 🟡 MÉDIO | R$ 0 |
| Metas | 2 sem | 🟡 MÉDIO | R$ 0 |
| **TOTAL FASE 1** | **6-8 sem** | **IMPORTANTE** | **R$ 20-50** |

---

## 🟢 FASE 2: OTIMIZAÇÕES E MELHORIAS (Média Prioridade)

**Objetivo:** Polimento e features complementares  
**Duração:** 8-10 semanas  
**Impacto:** MÉDIO - Melhora experiência e eficiência

### 7. Emissor Automático de Notas Fiscais ⭐⭐⭐

**Status Belasis:** ✅ Integrado  
**Status Glamo:** ⚠️ Campos fiscais existem, mas sem emissão  
**Impacto:** 🟡 MÉDIO - Importante para empresas formalizadas  
**Esforço:** 🟡 MÉDIO (3-4 semanas)

#### Requisitos

**7.1 Integração com NFSe/NFCe**
- [ ] Integrar com Focus NFe ou Enotas
- [ ] Configuração de certificado digital
- [ ] Emissão automática pós-venda
- [ ] XML e DANFE storage
- [ ] Cancelamento de NF
- [ ] Envio por email automático

**7.2 Schema**
```prisma
model FiscalNote {
  id          Int      @id @default(autoincrement())
  saleId      Int      @unique
  sale        Sale     @relation(...)
  type        FiscalNoteType // NFSE, NFCE
  number      String
  series      String?
  xmlUrl      String
  pdfUrl      String
  authKey     String?  // Chave de autorização
  status      FiscalNoteStatus
  issuedAt    DateTime?
  canceledAt  DateTime?
  cancelReason String?
  createdAt   DateTime @default(now())
}

enum FiscalNoteType {
  NFSE  // Serviços
  NFCE  // Cupom eletrônico
}

enum FiscalNoteStatus {
  DRAFT
  PROCESSING
  ISSUED
  CANCELED
  ERROR
}
```

**Tecnologias:**
- Focus NFe API ou Enotas
- PDF storage (S3/R2)

**Estimativa:** 3-4 semanas

**Custos Mensais:**
- Focus NFe: R$ 59-199/mês (plano)
- Certificado digital: R$ 150-300/ano

---

### 8. Histórico de Fotos no CRM ⭐⭐

**Esforço:** 🟢 BAIXO (1 semana)

#### Requisitos
- [ ] Aba "Fotos" no CRM do cliente
- [ ] Upload múltiplo de fotos
- [ ] Tags: "Antes", "Depois", "Durante"
- [ ] Date picker para cada foto
- [ ] Galeria com filtros
- [ ] Comparação lado a lado (antes/depois)
- [ ] Download de fotos

**Estimativa:** 1 semana

---

### 9. Gestão de Gorjetas Dedicada ⭐⭐

**Esforço:** 🟢 BAIXO (1 semana)

#### Requisitos
- [ ] Payment method "Gorjeta" com tracking
- [ ] Distribuição de gorjetas:
  - Por profissional
  - Divisão igual
  - % customizado
- [ ] Relatório de gorjetas por período
- [ ] Gorjetas no contracheque

**Estimativa:** 1 semana

---

### 10. Dashboard Financeiro Visual ⭐⭐⭐

**Esforço:** 🟡 MÉDIO (2-3 semanas)

#### Requisitos
- [ ] Gráficos de faturamento (Recharts)
- [ ] Cash flow timeline
- [ ] Despesas por categoria (pie chart)
- [ ] Contas a receber/pagar timeline
- [ ] KPIs cards (receita, despesas, lucro)
- [ ] Comparação período anterior

**Estimativa:** 2-3 semanas

---

### 11. Melhorias no Sistema de Avaliações ⭐⭐

**Esforço:** 🟢 BAIXO (1 semana)

#### Requisitos
- [ ] Solicitar avaliação 1 dia após atendimento (WhatsApp)
- [ ] Link público para avaliar
- [ ] Rating 1-5 estrelas + comentário
- [ ] Dashboard de avaliações
- [ ] Badge "Top Rated" para profissionais
- [ ] Integração com Google Reviews (link)

**Estimativa:** 1 semana

---

### FASE 2 - Resumo

| Item | Esforço | Custo Mensal |
|---|---|---|
| Emissor NF | 3-4 sem | R$ 60-200 |
| Fotos CRM | 1 sem | R$ 0 |
| Gorjetas | 1 sem | R$ 0 |
| Dashboard Visual | 2-3 sem | R$ 0 |
| Avaliações | 1 sem | R$ 0 |
| **TOTAL FASE 2** | **8-10 sem** | **R$ 60-200** |

---

## 🌟 FASE 3: EXPANSÃO E DIFERENCIAÇÃO (Baixa/Média Prioridade)

**Objetivo:** Features de diferenciação premium  
**Duração:** 6-8 semanas  
**Impacto:** MÉDIO - Premium features

### 12. Aplicativo Móvel White Label ⭐⭐⭐

**Esforço:** 🔴 ALTO (4-6 semanas)

#### Requisitos
- [ ] React Native app
- [ ] Telas: Login, Agenda, Serviços, Carrinho, Pagamento
- [ ] Push notifications
- [ ] Sistema de personalização:
  - Upload logo
  - Escolher cores (theme)
  - Nome do app
- [ ] Build automation (Expo EAS ou Fastlane)
- [ ] Publicação App Store / Google Play
- [ ] Dashboard: "Gerar meu app"

**Tecnologias:**
- React Native + Expo
- EAS Build para automação
- CodePush para updates OTA

**Estimativa:** 4-6 semanas

**Custos Mensais:**
- Expo EAS: $99/mês
- Apple Developer: $99/ano
- Google Play: $25 one-time
- **Total:** ~R$ 600/mês

---

### 13. Emissão de Boletos ⭐

**Esforço:** 🟢 BAIXO (1 semana)

#### Requisitos
- [ ] Integração com Banco (Bradesco, Santander via API)
- [ ] Ou integração com gateway (Mercado Pago, PagSeguro)
- [ ] Gerar boleto para contas a receber
- [ ] Webhook de confirmação de pagamento
- [ ] Download PDF do boleto

**Estimativa:** 1 semana

---

### FASE 3 - Resumo

| Item | Esforço | Custo Mensal |
|---|---|---|
| App White Label | 4-6 sem | R$ 600 |
| Boletos | 1 sem | Taxa transação |
| **TOTAL FASE 3** | **5-7 sem** | **R$ 600** |

---

## 📊 RESUMO GERAL DO ROADMAP

### Timeline Completo

| Fase | Duração | Items | Impacto | Custo Mensal | Status |
|---|---|---|---|---|---|
| **FASE 0** | 8-10 sem | WhatsApp, Pagamento, CRM Extension | 🔴 CRÍTICO | R$ 300-700 | ⚠️ URGENTE |
| **FASE 1** | 6-8 sem | Anamneses, Promoções, Metas | 🟡 ALTO | R$ 20-50 | ⏳ Importante |
| **FASE 2** | 8-10 sem | NF, Fotos, Gorjetas, Dashboard, Avaliações | 🟡 MÉDIO | R$ 60-200 | 🟢 Otimização |
| **FASE 3** | 6-8 sem | App White Label, Boletos | 🟡 MÉDIO | R$ 600 | 🌟 Premium |
| **TOTAL** | **28-36 sem** | **15 items** | - | **R$ 980-1550** | **7-9 meses** |

### Investimento Total Estimado

**Desenvolvimento (assumindo 2 devs fullstack):**
- 28-36 semanas
- 2 devs × R$ 15.000/mês × 7-9 meses = **R$ 210.000 - R$ 270.000**

**Custos Mensais Recorrentes:**
- Fase 0: R$ 300-700 (WhatsApp + infra)
- Fase 1: R$ 20-50 (storage anamneses)
- Fase 2: R$ 60-200 (NF)
- Fase 3: R$ 600 (app white label)
- **Total:** R$ 980-1550/mês

**ROI Esperado:**
- Redução cancelamentos: 10-15% = +R$ 5.000-10.000/mês (por salão médio)
- Aumento agendamentos: 15-20% = +R$ 10.000-20.000/mês
- Retenção melhorada: +10% = +R$ 3.000-5.000/mês
- **Total por salão:** +R$ 18.000-35.000/mês
- **Com 10 salões:** +R$ 180.000-350.000/mês
- **Payback:** 1-2 meses (com 10 salões)

---

## 🎯 PLANO DE EXECUÇÃO RECOMENDADO

### Mês 1-2 (FASE 0.1): WhatsApp API

**Semana 1-2:**
- [ ] Setup WhatsApp Business API (conta, verificação)
- [ ] Backend: whatsappClient, webhooks, queue
- [ ] Template management básico

**Semana 3-4:**
- [ ] Automation engine (jobs)
- [ ] Frontend: Dashboard WhatsApp
- [ ] Testes com clientes beta

**Entrega:** WhatsApp Marketing funcionando

---

### Mês 2-3 (FASE 0.2): Pagamento Online

**Semana 5-6:**
- [ ] Integração Stripe Checkout
- [ ] Schema changes (Appointment payment)
- [ ] Backend: payment operations

**Semana 7-8:**
- [ ] Frontend: Payment step no booking
- [ ] Webhooks e confirmações
- [ ] Testes com pagamentos reais

**Entrega:** Agendamento com pagamento online

---

### Mês 3 (FASE 0.3): Extension Chrome

**Semana 9-10:**
- [ ] Chrome extension development
- [ ] Backend API para extension
- [ ] Publish na Chrome Web Store

**Entrega:** Extensão CRM WhatsApp Web

---

### Mês 4-5 (FASE 1): Anamneses + Promoções + Metas

**Semana 11-14:**
- [ ] Anamneses digitais (3-4 semanas)

**Semana 15-16:**
- [ ] Promoções (1-2 semanas)

**Semana 17-18:**
- [ ] Metas (2 semanas)

**Entrega:** 3 módulos avançados completos

---

### Mês 6-7 (FASE 2): Otimizações

**Semana 19-22:**
- [ ] Emissor NF (3-4 semanas)

**Semana 23-24:**
- [ ] Fotos CRM, Gorjetas, Avaliações (3 semanas paralelo)

**Semana 25-27:**
- [ ] Dashboard Financeiro Visual (2-3 semanas)

**Entrega:** Sistema polido e completo

---

### Mês 8-9 (FASE 3): Premium Features

**Semana 28-33:**
- [ ] App White Label (4-6 semanas)

**Semana 34:**
- [ ] Boletos (1 semana)

**Entrega:** Features premium

---

## 🚦 INDICADORES DE SUCESSO (KPIs)

### Após FASE 0 (CRÍTICA):
- [ ] 80%+ agendamentos online usam pagamento
- [ ] Cancelamentos reduzidos em 10-15%
- [ ] 50%+ mensagens automáticas via WhatsApp
- [ ] 70%+ atendentes usam extension Chrome
- [ ] NPS salões: 8+ (satisfação)

### Após FASE 1:
- [ ] 60%+ clínicas usam anamneses
- [ ] 40%+ salões criam promoções
- [ ] 80%+ salões definem metas
- [ ] Vendas em dias fracos: +15-20%

### Após FASE 2:
- [ ] 50%+ empresas emitem NF automático
- [ ] 90%+ clientes têm fotos no histórico
- [ ] Gorjetas rastreadas: 100%
- [ ] Dashboard visualizado: 5x/dia (média)

### Após FASE 3:
- [ ] 20%+ salões com app white label
- [ ] Boletos: 10%+ pagamentos

---

## ⚠️ RISCOS E MITIGAÇÕES

### Riscos Técnicos

**1. WhatsApp API Instabilidade**
- Risco: WhatsApp pode bloquear ou limitar envios
- Mitigação: Usar provedor oficial (Twilio/360Dialog), seguir best practices, rate limiting

**2. Pagamento Online Fraudes**
- Risco: Chargebacks, fraudes
- Mitigação: Usar Stripe Radar (anti-fraude), exigir confirmação 3DS, policies claras

**3. Extension Chrome Rejeitada**
- Risco: Google rejeitar publicação
- Mitigação: Seguir guidelines rigorosamente, manifest V3, privacy policy clara

### Riscos de Negócio

**4. Belasis Lançar Novidades**
- Risco: Belasis se mover mais rápido
- Mitigação: Execution acelerada, foco em qualidade superior

**5. Custo WhatsApp Alto**
- Risco: Mensagens custam dinheiro
- Mitigação: Repassar custo ao cliente (add-on), otimizar templates

**6. Adoção Baixa**
- Risco: Clientes não usarem features
- Mitigação: Onboarding completo, tutoriais, suporte dedicado

---

## 💡 RECOMENDAÇÕES ESTRATÉGICAS

### 1. Execution Acelerada
- **Contratar 2 devs sênior** para execução paralela
- **Fase 0 é URGENTE** - Sem WhatsApp e pagamento, Glamo perde market share
- **MVP rápido** - Ship fast, iterate

### 2. Pricing Strategy
- **Base Plan:** Incluir TUDO da Fase 0 e 1 (não separar add-ons como Belasis)
- **Premium Plan:** Fase 2 e 3 (NF, App White Label)
- **Vantagem:** Glamo mais completo no plano base (vs Belasis que cobra add-ons)

### 3. Marketing Positioning
- "Glamo: O Belasis do futuro"
- "Tudo que o Belasis tem + Loyalty avançado + RBAC + Muito mais"
- Destacar arquitetura moderna, segurança, escalabilidade

### 4. Go-to-Market
- **Beta gratuito** para 10-20 salões durante Fase 0-1
- **Case studies** de sucesso
- **Partnership** com influencers do setor
- **Migração assistida** de Belasis/Salão99

### 5. Diferenciação
- Glamo deve ser **10x melhor** em:
  - UX/UI (mais moderno)
  - Performance (mais rápido)
  - Features avançadas (Loyalty, RBAC, Gamification)
  - Suporte (chatbot + atendimento)

---

## 📝 PRÓXIMOS PASSOS IMEDIATOS

### Esta Semana:
1. ✅ **Review este roadmap** com stakeholders
2. ⏳ **Aprovar budget** de R$ 210-270k desenvolvimento
3. ⏳ **Contratar 2 devs sênior** (fullstack, exp. WhatsApp API)
4. ⏳ **Setup WhatsApp Business Account** (processo 2-3 dias)
5. ⏳ **Escolher payment gateway** (Stripe ou Mercado Pago)

### Próximas 2 Semanas:
6. ⏳ **Kickoff Fase 0** - WhatsApp API
7. ⏳ **Setup infra** (Redis queue, S3 storage)
8. ⏳ **Design templates** WhatsApp (8 templates iniciais)
9. ⏳ **Design payment flow** (Figma mockups)
10. ⏳ **Setup staging environment** para testes

### Próximo Mês:
11. ⏳ **Beta WhatsApp** com 5 salões
12. ⏳ **Beta Payment** com 3 salões
13. ⏳ **Iterar baseado em feedback**
14. ⏳ **Preparar launch Fase 0**

---

## ✅ CONCLUSÃO

Este roadmap transforma o Glamo de um sistema **equiparado** ao Belasis em um sistema **superior** em 7-9 meses.

**Fases Críticas:**
- **FASE 0 (2-3 meses):** WhatsApp + Pagamento + Extension = **GAME CHANGER**
- Sem Fase 0, Glamo não compete

**Investment:**
- R$ 210-270k desenvolvimento
- R$ 980-1550/mês custos recorrentes
- **ROI:** 1-2 meses com 10+ salões

**Outcome:**
- Glamo se torna **líder de mercado**
- Sistema mais moderno, completo e escalável
- Base para crescimento exponencial

---

**Próxima Ação:** Aprovar roadmap e iniciar Fase 0 IMEDIATAMENTE

**Documento criado em:** 19/11/2025  
**Autor:** Análise Estratégica Glamo  
**Status:** ⏳ AGUARDANDO APROVAÇÃO
