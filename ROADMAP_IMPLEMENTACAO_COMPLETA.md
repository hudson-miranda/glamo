# 🚀 ROADMAP DE IMPLEMENTAÇÃO COMPLETA - SISTEMA GLAMO
## Plano Detalhado para 100% de Funcionalidades

**Data de Início:** 13 de Novembro de 2025  
**Objetivo:** Implementar 100% de todas as funcionalidades pendentes  
**Metodologia:** Desenvolvimento incremental, testado e validado a cada etapa

---

## 📋 ÍNDICE

1. [Visão Geral do Plano](#visão-geral-do-plano)
2. [FASE 1: Bloqueadores Críticos](#fase-1-bloqueadores-críticos)
3. [FASE 2: Funcionalidades Importantes](#fase-2-funcionalidades-importantes)
4. [FASE 3: Melhorias Opcionais](#fase-3-melhorias-opcionais)
5. [FASE 4: Polimento e Otimização](#fase-4-polimento-e-otimização)
6. [Checklist de Validação](#checklist-de-validação)
7. [Estratégia de Testes](#estratégia-de-testes)

---

## 1. VISÃO GERAL DO PLANO

### 🎯 Objetivos Gerais

- ✅ Resolver 2 bloqueadores críticos
- ✅ Implementar 5 funcionalidades importantes
- ✅ Adicionar 4 melhorias opcionais
- ✅ Garantir 0 erros e 100% de estabilidade
- ✅ Sistema totalmente funcional e pronto para produção

### 📊 Métricas de Sucesso

| Métrica | Atual | Meta |
|---------|-------|------|
| Backend Completo | 98% | 100% |
| Frontend Completo | 78% | 100% |
| Rotas Habilitadas | 34/36 | 36/36 |
| Módulos Core | 14/14 | 14/14 |
| Módulos Avançados | 4/7 | 7/7 |
| Sistema Geral | 85% | 100% |

### ⏱️ Estimativa Total

- **Fase 1 (Crítico):** 2 dias
- **Fase 2 (Importante):** 8-10 dias
- **Fase 3 (Opcional):** 10-12 dias
- **Fase 4 (Polimento):** 3-4 dias

**Total: 23-28 dias úteis (5-6 semanas)**

### 🔄 Abordagem Incremental

Cada tarefa seguirá o ciclo:
1. **Planejamento** → Análise detalhada do que será feito
2. **Implementação** → Código incremental e testável
3. **Validação** → Testes e verificação
4. **Commit** → Salvar progresso
5. **Próxima Tarefa** → Mover para próxima etapa

---

## 2. FASE 1: BLOQUEADORES CRÍTICOS

**Prioridade:** 🔴 MÁXIMA  
**Duração Estimada:** 2 dias  
**Objetivo:** Liberar release da versão 1.0

### TAREFA 1.1: Componente UI Tabs + Detalhes de Cliente

**Status:** ❌ BLOQUEADOR CRÍTICO  
**Tempo:** 1 dia (8 horas)  
**Impacto:** ALTO - Funcionalidade essencial

#### Subtarefas

**1.1.1 - Implementar Componente ui/tabs (2h)**
```
Arquivos a criar:
- app/src/components/ui/tabs.tsx

Checklist:
□ Criar componente Tabs baseado em Radix UI
□ Implementar TabsList, TabsTrigger, TabsContent
□ Adicionar estilos do design system
□ Testar componente isoladamente
□ Validar acessibilidade (keyboard navigation)
```

**Implementação:**
```tsx
// app/src/components/ui/tabs.tsx
import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
```

**1.1.2 - Implementar ClientDetailPage (4h)**
```
Arquivos a modificar:
- app/src/client/modules/clients/ClientDetailPage.tsx

Checklist:
□ Importar componente Tabs
□ Criar estrutura de abas (Visão Geral, Notas, Documentos, Histórico)
□ Implementar aba Visão Geral (dados do cliente)
□ Implementar aba Notas (CRUD de notas)
□ Implementar aba Documentos (upload/download)
□ Implementar aba Histórico (timeline)
□ Adicionar navegação breadcrumb
□ Testar todas as abas
```

**Estrutura da Página:**
```tsx
// app/src/client/modules/clients/ClientDetailPage.tsx
import { useParams } from 'react-router-dom';
import { useQuery } from '@wasp/queries';
import { getClient } from '@wasp/queries';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function ClientDetailPage() {
  const { id } = useParams();
  const { data: client, isLoading } = useQuery(getClient, { id: parseInt(id) });

  if (isLoading) return <LoadingSpinner />;
  if (!client) return <NotFound />;

  return (
    <div className="container mx-auto py-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbItem>Clientes</BreadcrumbItem>
        <BreadcrumbItem>{client.name}</BreadcrumbItem>
      </Breadcrumb>

      {/* Header com info principal */}
      <ClientHeader client={client} />

      {/* Tabs */}
      <Tabs defaultValue="overview" className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="notes">Notas</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ClientOverviewTab client={client} />
        </TabsContent>

        <TabsContent value="notes">
          <ClientNotesTab clientId={client.id} />
        </TabsContent>

        <TabsContent value="documents">
          <ClientDocumentsTab clientId={client.id} />
        </TabsContent>

        <TabsContent value="history">
          <ClientHistoryTab clientId={client.id} />
        </TabsContent>

        <TabsContent value="appointments">
          <ClientAppointmentsTab clientId={client.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

**1.1.3 - Criar Componentes de Abas (2h)**
```
Arquivos a criar:
- app/src/client/modules/clients/components/ClientOverviewTab.tsx
- app/src/client/modules/clients/components/ClientNotesTab.tsx
- app/src/client/modules/clients/components/ClientDocumentsTab.tsx
- app/src/client/modules/clients/components/ClientHistoryTab.tsx
- app/src/client/modules/clients/components/ClientAppointmentsTab.tsx

Checklist (para cada aba):
□ Criar componente funcional
□ Integrar com queries/actions do backend
□ Adicionar UI de loading/error
□ Implementar funcionalidades CRUD quando aplicável
□ Testar integração backend-frontend
```

**1.1.4 - Descomentar Rota no main.wasp (5min)**
```
Arquivo: app/main.wasp
Linha: ~1030

Ação:
□ Descomentar rota ClientDetailRoute
□ Salvar arquivo
□ Reiniciar servidor Wasp
□ Validar rota funcionando
```

**Validação Final:**
```
□ Acessar /clients/:id funciona
□ Todas as abas carregam corretamente
□ CRUD de notas funciona
□ Upload/download de documentos funciona
□ Histórico exibe timeline
□ Navegação entre abas suave
□ Sem erros no console
```

---

### TAREFA 1.2: Rotas Financeiras + Integração Menu

**Status:** ❌ BLOQUEADOR CRÍTICO  
**Tempo:** 1 dia (8 horas)  
**Impacto:** MÉDIO-ALTO - Páginas prontas mas inacessíveis

#### Subtarefas

**1.2.1 - Adicionar Rotas no main.wasp (1h)**
```
Arquivo: app/main.wasp

Rotas a adicionar:
□ /financial/dashboard → FinancialDashboardPage
□ /financial/receivables → AccountsReceivablePage
□ /financial/payables → AccountsPayablePage
□ /financial/expenses → ExpensesPage
□ /financial/budgets → BudgetsPage
```

**Código a adicionar:**
```wasp
// ============================================================================
// Módulo Financeiro
// ============================================================================

route FinancialDashboardRoute { path: "/financial/dashboard", to: FinancialDashboardPage }
page FinancialDashboardPage {
  authRequired: true,
  component: import FinancialDashboard from "@src/client/modules/financial/FinancialDashboard"
}

route AccountsReceivableRoute { path: "/financial/receivables", to: AccountsReceivablePage }
page AccountsReceivablePage {
  authRequired: true,
  component: import AccountsReceivable from "@src/client/modules/financial/AccountsReceivablePage"
}

route AccountsPayableRoute { path: "/financial/payables", to: AccountsPayablePage }
page AccountsPayablePage {
  authRequired: true,
  component: import AccountsPayable from "@src/client/modules/financial/AccountsPayablePage"
}

route ExpensesRoute { path: "/financial/expenses", to: ExpensesPage }
page ExpensesPage {
  authRequired: true,
  component: import Expenses from "@src/client/modules/financial/ExpensesPage"
}

route BudgetsRoute { path: "/financial/budgets", to: BudgetsPage }
page BudgetsPage {
  authRequired: true,
  component: import Budgets from "@src/client/modules/financial/BudgetsPage"
}
```

**1.2.2 - Criar Página de Budgets (2h)**
```
Arquivo: app/src/client/modules/financial/BudgetsPage.tsx

Funcionalidades:
□ Listagem de budgets
□ Criar budget com itens
□ Editar budget
□ Deletar budget
□ Visualizar progresso vs planejado
□ Gráficos de comparação
```

**1.2.3 - Criar Página de Categorias Financeiras (1h)**
```
Arquivo: app/src/client/modules/financial/CategoriesPage.tsx

Funcionalidades:
□ Listagem de categorias
□ CRUD de categorias
□ Categorias hierárquicas (opcional)
□ Ícones/cores por categoria
```

**1.2.4 - Integrar Menu de Navegação (2h)**
```
Arquivo: app/src/client/components/Sidebar.tsx (ou equivalente)

Checklist:
□ Adicionar seção "Financeiro" no menu
□ Submenu com links:
  - Dashboard Financeiro
  - Contas a Receber
  - Contas a Pagar
  - Despesas
  - Orçamentos
□ Adicionar ícones
□ Implementar indicador de página ativa
□ Testar navegação
```

**1.2.5 - Melhorar Páginas Existentes (2h)**
```
Páginas a melhorar:
- FinancialDashboard.tsx (90% → 100%)
- AccountsReceivablePage.tsx (80% → 100%)
- AccountsPayablePage.tsx (80% → 100%)
- ExpensesPage.tsx (75% → 100%)

Melhorias:
□ Adicionar filtros avançados
□ Melhorar UX de formulários
□ Adicionar validações
□ Implementar mensagens de sucesso/erro
□ Otimizar performance (memoization)
```

**Validação Final:**
```
□ Todas as 5 rotas funcionam
□ Menu de navegação completo
□ CRUD funcional em todas as páginas
□ Budgets criados e visualizados
□ Categorias gerenciadas
□ Relatórios exibem dados corretos
□ Sem erros no console
```

---

## 3. FASE 2: FUNCIONALIDADES IMPORTANTES

**Prioridade:** 🟡 ALTA  
**Duração Estimada:** 8-10 dias  
**Objetivo:** Diferenciais competitivos importantes

### TAREFA 2.1: Módulo de Campanhas Completo

**Status:** 🔴 BACKEND ONLY (0% Frontend)  
**Tempo:** 3-4 dias  
**Impacto:** MÉDIO - Diferencial competitivo

#### Subtarefas Detalhadas

**2.1.1 - Instalar/Configurar Componentes UI (1h)**
```
Componentes necessários do shadcn/ui:
□ Form (para formulários de campanha)
□ Select (seleção de segmentos)
□ DatePicker (agendamento de campanhas)
□ Badge (status de campanhas)
□ DataTable (listagem de campanhas)
□ Dialog (criação/edição)

Comando:
npx shadcn-ui@latest add form select date-picker badge dialog
```

**2.1.2 - Criar CampaignsListPage (1 dia)**
```
Arquivo: app/src/client/modules/campaigns/CampaignsListPage.tsx

Funcionalidades:
□ Listagem de campanhas com status
□ Filtros (status, tipo, data)
□ Pesquisa por nome
□ Cards com métricas (enviadas, abertas, clicadas)
□ Botão "Nova Campanha"
□ Ações rápidas (editar, duplicar, excluir)
□ Paginação
```

**Estrutura:**
```tsx
export default function CampaignsListPage() {
  const { data: campaigns, isLoading } = useQuery(listCampaigns);

  return (
    <div className="container mx-auto py-6">
      <PageHeader 
        title="Campanhas de Marketing"
        action={
          <Button onClick={() => navigate('/campaigns/new')}>
            <Plus className="mr-2" />
            Nova Campanha
          </Button>
        }
      />

      <CampaignsFilters />
      
      <CampaignsGrid campaigns={campaigns} />
      
      <CampaignsPagination />
    </div>
  );
}
```

**2.1.3 - Criar CreateCampaignPage (1 dia)**
```
Arquivo: app/src/client/modules/campaigns/CreateCampaignPage.tsx

Funcionalidades:
□ Wizard de criação em 4 etapas:
  1. Informações básicas (nome, tipo, objetivo)
  2. Seleção de segmento de clientes
  3. Conteúdo da mensagem (template)
  4. Agendamento e revisão

□ Preview da mensagem
□ Validação em cada etapa
□ Salvar como rascunho
□ Agendar ou enviar imediatamente
```

**Wizard Steps:**
```tsx
const steps = [
  { id: 1, name: 'Informações', component: CampaignBasicInfo },
  { id: 2, name: 'Público', component: CampaignAudience },
  { id: 3, name: 'Conteúdo', component: CampaignContent },
  { id: 4, name: 'Revisão', component: CampaignReview },
];
```

**2.1.4 - Criar CampaignDetailPage (1 dia)**
```
Arquivo: app/src/client/modules/campaigns/CampaignDetailPage.tsx

Funcionalidades:
□ Visualização completa da campanha
□ Métricas detalhadas:
  - Taxa de abertura
  - Taxa de clique
  - Taxa de conversão
  - ROI estimado
□ Lista de destinatários com status individual
□ Gráficos de performance
□ Ações (editar, pausar, reenviar)
```

**2.1.5 - Criar ClientSegmentsPage (0.5 dia)**
```
Arquivo: app/src/client/modules/campaigns/ClientSegmentsPage.tsx

Funcionalidades:
□ Listagem de segmentos
□ Criar segmento com regras:
  - Demográficas (idade, gênero)
  - Comportamentais (última visita, frequência)
  - Transacionais (ticket médio, LTV)
□ Preview de clientes no segmento
□ CRUD de segmentos
```

**2.1.6 - Criar Componentes Reutilizáveis (0.5 dia)**
```
Componentes a criar:
- CampaignCard.tsx (card na listagem)
- CampaignStatusBadge.tsx (badge de status)
- CampaignMetricsCards.tsx (cards de métricas)
- CampaignTemplateSelector.tsx (seletor de templates)
- SegmentRuleBuilder.tsx (construtor de regras)
```

**2.1.7 - Descomentar Rotas no main.wasp (5min)**
```
Arquivo: app/main.wasp
Linhas: ~1270-1290

Ação:
□ Descomentar 4 rotas de campanhas
□ Salvar arquivo
□ Reiniciar servidor
□ Validar rotas
```

**Validação Final:**
```
□ Listagem de campanhas funciona
□ Criação de campanha (wizard) completo
□ Detalhes exibem métricas corretas
□ Segmentos podem ser criados/editados
□ Jobs automáticos funcionando
□ Preview de mensagens correto
□ Sem erros no console
```

---

### TAREFA 2.2: Programa de Fidelidade Completo

**Status:** 🟡 PARCIAL (50%)  
**Tempo:** 2-3 dias  
**Impacto:** MÉDIO - Feature de diferenciação

#### Subtarefas Detalhadas

**2.2.1 - Expandir LoyaltyProgramPage (1 dia)**
```
Arquivo: app/src/client/modules/loyalty/LoyaltyProgramPage.tsx

Funcionalidades a adicionar:
□ CRUD de programas de fidelidade
□ Configuração de regras de acúmulo:
  - Pontos por real gasto
  - Multiplicadores por tipo de serviço
  - Bônus de aniversário
□ Gestão de tiers (níveis):
  - Nome, benefícios, requisitos
  - Cores e ícones
□ Configuração de expiração
```

**Estrutura:**
```tsx
export default function LoyaltyProgramPage() {
  const [activeTab, setActiveTab] = useState('programs');

  return (
    <div className="container mx-auto py-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="programs">Programas</TabsTrigger>
          <TabsTrigger value="tiers">Níveis</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="programs">
          <LoyaltyProgramsTab />
        </TabsContent>

        <TabsContent value="tiers">
          <LoyaltyTiersTab />
        </TabsContent>

        <TabsContent value="transactions">
          <LoyaltyTransactionsTab />
        </TabsContent>

        <TabsContent value="stats">
          <LoyaltyStatsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

**2.2.2 - Criar Interface de Redenção (1 dia)**
```
Arquivo: app/src/client/modules/loyalty/LoyaltyRedemptionPage.tsx

Funcionalidades:
□ Visualização de saldo de pontos do cliente
□ Catálogo de recompensas:
  - Descontos
  - Serviços gratuitos
  - Produtos
□ Resgate de pontos
□ Histórico de resgates
□ Validação de saldo suficiente
```

**2.2.3 - Adicionar Relatórios de Performance (0.5 dia)**
```
Componente: LoyaltyStatsTab.tsx

Métricas:
□ Total de clientes ativos no programa
□ Distribuição por tier
□ Taxa de engajamento
□ ROI do programa
□ Gráficos de evolução
```

**2.2.4 - Integrar com Vendas (0.5 dia)**
```
Arquivos:
- app/src/client/modules/sales/SalesListPage.tsx
- app/src/client/modules/sales/components/SaleForm.tsx

Funcionalidades:
□ Calcular pontos ao fechar venda
□ Mostrar pontos ganhos
□ Permitir usar pontos como desconto
□ Atualizar saldo automaticamente
```

**Validação Final:**
```
□ CRUD de programas funciona
□ Tiers podem ser criados/editados
□ Interface de redenção funcional
□ Integração com vendas funcionando
□ Pontos acumulam automaticamente
□ Relatórios exibem dados corretos
□ Notificações de upgrade de tier
```

---

### TAREFA 2.3: Programa de Indicação Completo

**Status:** 🟡 PARCIAL (50%)  
**Tempo:** 2-3 dias  
**Impacto:** MÉDIO - Feature de diferenciação

#### Subtarefas Detalhadas

**2.3.1 - Expandir ReferralProgramPage (1 dia)**
```
Arquivo: app/src/client/modules/referral/ReferralProgramPage.tsx

Funcionalidades a adicionar:
□ CRUD de programas de indicação
□ Configuração de recompensas:
  - Tipo (desconto, crédito, produto)
  - Valor para indicador
  - Valor para indicado
  - Requisitos de qualificação
□ Configuração de códigos de indicação
□ Regras de compartilhamento
```

**2.3.2 - Criar Leaderboard Visual (1 dia)**
```
Componente: ReferralLeaderboard.tsx

Funcionalidades:
□ Top 10 indicadores do mês
□ Posição do cliente no ranking
□ Indicações qualificadas vs pendentes
□ Recompensas ganhas
□ Animações e gamificação
□ Filtros por período
```

**Exemplo:**
```tsx
export default function ReferralLeaderboard() {
  const { data: leaderboard } = useQuery(getReferralLeaderboard);

  return (
    <Card>
      <CardHeader>
        <CardTitle>🏆 Top Indicadores</CardTitle>
        <CardDescription>Ranking do mês atual</CardDescription>
      </CardHeader>
      <CardContent>
        {leaderboard?.map((entry, index) => (
          <LeaderboardEntry 
            key={entry.clientId}
            rank={index + 1}
            client={entry.client}
            referrals={entry.totalReferrals}
            rewards={entry.totalRewards}
            highlighted={entry.isCurrentUser}
          />
        ))}
      </CardContent>
    </Card>
  );
}
```

**2.3.3 - Adicionar Compartilhamento Social (0.5 dia)**
```
Componente: SocialShareButtons.tsx

Funcionalidades:
□ Gerar link de indicação único
□ Botões de compartilhamento:
  - WhatsApp
  - Facebook
  - Instagram
  - Email
  - Copiar link
□ Tracking de cliques
```

**2.3.4 - Criar Relatórios de Conversão (0.5 dia)**
```
Componente: ReferralStatsTab.tsx

Métricas:
□ Taxa de conversão (cliques → cadastros)
□ Taxa de qualificação (cadastros → vendas)
□ Valor médio por indicação
□ ROI do programa
□ Gráficos de funil
```

**Validação Final:**
```
□ CRUD de programas funciona
□ Leaderboard visual e interativo
□ Compartilhamento social funciona
□ Códigos únicos gerados
□ Tracking de cliques funcional
□ Relatórios de conversão corretos
□ Recompensas creditadas automaticamente
```

---

## 4. FASE 3: MELHORIAS OPCIONAIS

**Prioridade:** 🟢 MÉDIA  
**Duração Estimada:** 10-12 dias  
**Objetivo:** Features especializadas e refinamentos

### TAREFA 3.1: Galeria de Fotos Completa

**Status:** 🟡 PARCIAL (40%)  
**Tempo:** 2-3 dias  
**Impacto:** BAIXO-MÉDIO

#### Subtarefas

**3.1.1 - Implementar Before/After (1 dia)**
```
Componente: BeforeAfterComparison.tsx

Funcionalidades:
□ Slider de comparação antes/depois
□ Zoom nas imagens
□ Lightbox para visualização
□ Metadados (data, serviço, profissional)
□ Compartilhamento
```

**3.1.2 - Sistema de Aprovação (0.5 dia)**
```
Componente: PhotoApprovalPanel.tsx

Funcionalidades:
□ Fila de fotos pendentes
□ Aprovar/rejeitar em lote
□ Motivo de rejeição
□ Notificar profissional
□ Histórico de aprovações
```

**3.1.3 - Galeria por Cliente (0.5 dia)**
```
Integração com ClientDetailPage

Funcionalidades:
□ Aba "Fotos" no perfil do cliente
□ Timeline de fotos
□ Comparações before/after
□ Evolução visual
```

**3.1.4 - Busca Avançada e Filtros (1 dia)**
```
Componente: PhotoFilters.tsx

Filtros:
□ Por cliente
□ Por profissional
□ Por serviço
□ Por data
□ Por aprovação (pendente/aprovado/rejeitado)
□ Por tipo (before/after/normal)
□ Tags
```

**Validação:**
```
□ Before/after funcional
□ Sistema de aprovação funciona
□ Integração com perfil de cliente
□ Busca e filtros operacionais
□ Upload de múltiplas fotos
```

---

### TAREFA 3.2: Anamnese Completa

**Status:** 🟡 PARCIAL (40%)  
**Tempo:** 4-5 dias  
**Impacto:** MÉDIO

#### Subtarefas

**3.2.1 - Form Builder Visual (2 dias)**
```
Componente: AnamnesisFormBuilder.tsx

Funcionalidades:
□ Drag & drop de campos:
  - Texto curto
  - Texto longo
  - Múltipla escolha
  - Checkbox
  - Data
  - Arquivo
□ Configuração de campos:
  - Label
  - Placeholder
  - Obrigatório
  - Validações
□ Preview em tempo real
□ Salvar template
```

**Biblioteca sugerida:** react-hook-form + dnd-kit

**3.2.2 - Interface de Preenchimento (1 dia)**
```
Componente: FillAnamnesisForm.tsx

Funcionalidades:
□ Renderizar formulário dinâmico
□ Validações em tempo real
□ Salvar parcialmente
□ Anexar documentos
□ Navegação entre seções
□ Indicador de progresso
```

**3.2.3 - Assinatura Digital (0.5 dia)**
```
Componente: DigitalSignature.tsx

Funcionalidades:
□ Canvas para assinatura
□ Limpar/refazer
□ Salvar como imagem
□ Timestamp
□ IP do assinante
```

**Biblioteca sugerida:** react-signature-canvas

**3.2.4 - Geração de PDF (1 dia)**
```
Integração com backend (já pronto)

Frontend:
□ Botão "Gerar PDF"
□ Preview antes de gerar
□ Download automático
□ Enviar por email (opcional)
```

**Biblioteca backend:** PDFKit (já implementado)

**3.2.5 - Histórico de Anamneses (0.5 dia)**
```
Componente: AnamnesisHistory.tsx

Funcionalidades:
□ Timeline de anamneses
□ Comparar versões
□ Visualizar mudanças
□ Download de PDFs antigos
```

**Validação:**
```
□ Form builder funcional
□ Formulários podem ser preenchidos
□ Assinatura digital funciona
□ PDF gerado corretamente
□ Histórico exibe versões
□ Integração com cliente
```

---

### TAREFA 3.3: Pagamentos Online - Melhorias

**Status:** 🟡 PARCIAL (60%)  
**Tempo:** 3-4 dias  
**Impacto:** MÉDIO

#### Subtarefas

**3.3.1 - Gestão de Pagamentos no Admin (1 dia)**
```
Arquivo: app/src/admin/dashboards/payments/PaymentsPage.tsx

Funcionalidades:
□ Listagem de transações
□ Filtros (status, período, valor)
□ Detalhes de transação
□ Ações (reembolso, cancelar)
□ Exportar relatório
```

**3.3.2 - Visualização de Transações (1 dia)**
```
Componente: TransactionsList.tsx

Funcionalidades:
□ Tabela com paginação
□ Status visual (aprovado/pendente/falha)
□ Detalhes ao clicar
□ Gráfico de transações por dia
□ Métricas (total, média, taxa de sucesso)
```

**3.3.3 - Interface de Reembolsos (0.5 dia)**
```
Componente: RefundDialog.tsx

Funcionalidades:
□ Selecionar transação
□ Valor do reembolso (total/parcial)
□ Motivo
□ Confirmação
□ Tracking de status
```

**3.3.4 - Portal do Cliente Stripe (0.5 dia)**
```
Integração com Stripe Customer Portal

Funcionalidades:
□ Botão "Gerenciar Assinatura"
□ Redirect para portal Stripe
□ Atualizar forma de pagamento
□ Ver histórico de faturas
```

**3.3.5 - Relatórios de Pagamentos (1 dia)**
```
Componente: PaymentReportsPage.tsx

Relatórios:
□ Receita por período
□ Taxa de conversão checkout
□ Métodos de pagamento mais usados
□ Chargebacks e disputas
□ Gráficos interativos
```

**Validação:**
```
□ Admin pode visualizar transações
□ Reembolsos podem ser processados
□ Portal do cliente funciona
□ Relatórios exibem dados corretos
□ Integração Stripe 100% funcional
```

---

### TAREFA 3.4: Analytics Avançado - Melhorias

**Status:** 🟢 COMPLETO (80% → 100%)  
**Tempo:** 2-3 dias  
**Impacto:** BAIXO

#### Subtarefas

**3.4.1 - Análise de Cohort Visual (1 dia)**
```
Componente: CohortAnalysisChart.tsx

Funcionalidades:
□ Tabela de cohort (mês a mês)
□ Heatmap de retenção
□ Métricas por cohort:
  - Taxa de retenção
  - LTV médio
  - Churn rate
□ Filtros por período
```

**3.4.2 - Exportação de Relatórios (0.5 dia)**
```
Funcionalidade: Exportar para CSV/Excel

Formatos:
□ CSV (compatível com Excel)
□ Excel (.xlsx) com formatação
□ PDF com gráficos
□ Agendamento de relatórios (email)
```

**Biblioteca:** xlsx ou exceljs

**3.4.3 - Gráficos Interativos (1 dia)**
```
Biblioteca: Recharts ou Chart.js

Melhorias:
□ Hover com detalhes
□ Zoom e pan
□ Exportar gráfico como imagem
□ Legendas interativas
□ Tooltips customizados
□ Animações suaves
```

**3.4.4 - Dashboards Customizáveis (0.5 dia)**
```
Funcionalidade: Arrastar widgets

Widgets disponíveis:
□ Métricas de vendas
□ Gráfico de agendamentos
□ Top clientes
□ Churn risk
□ CLV médio
□ Distribuição por serviço
```

**Biblioteca:** react-grid-layout

**Validação:**
```
□ Cohort analysis visual
□ Exportação funciona
□ Gráficos interativos
□ Dashboards customizáveis
□ Performance otimizada
```

---

## 5. FASE 4: POLIMENTO E OTIMIZAÇÃO

**Prioridade:** 🔵 QUALIDADE  
**Duração Estimada:** 3-4 dias  
**Objetivo:** 100% de qualidade e performance

### TAREFA 4.1: Testes Completos

**Tempo:** 1-2 dias

#### Checklist de Testes

**4.1.1 - Testes Funcionais**
```
□ Todas as rotas carregam
□ Todos os formulários submetem
□ Todas as queries retornam dados
□ Todas as actions executam
□ Validações funcionam
□ Mensagens de erro são claras
```

**4.1.2 - Testes de Integração**
```
□ Backend ↔ Frontend comunicam
□ Jobs executam corretamente
□ Webhooks recebem dados
□ Emails são enviados
□ Notificações aparecem
□ Upload de arquivos funciona
```

**4.1.3 - Testes de Performance**
```
□ Tempo de carregamento < 3s
□ Queries otimizadas
□ Componentes memoizados
□ Lazy loading implementado
□ Bundle size otimizado
```

**4.1.4 - Testes de Responsividade**
```
□ Mobile (< 768px)
□ Tablet (768px - 1024px)
□ Desktop (> 1024px)
□ Todas as páginas responsivas
□ Touch gestures funcionam
```

**4.1.5 - Testes de Acessibilidade**
```
□ Navegação por teclado
□ Screen readers compatíveis
□ Contraste adequado
□ Textos alternativos em imagens
□ ARIA labels corretos
```

---

### TAREFA 4.2: Correção de Bugs

**Tempo:** 1 dia

```
□ Revisar console do navegador
□ Corrigir warnings do React
□ Corrigir erros do TypeScript
□ Otimizar re-renders
□ Corrigir memory leaks
□ Validar edge cases
```

---

### TAREFA 4.3: Documentação

**Tempo:** 1 dia

**4.3.1 - Documentação Técnica**
```
□ README.md atualizado
□ Guia de instalação
□ Guia de desenvolvimento
□ Arquitetura do sistema
□ API documentation
```

**4.3.2 - Documentação de Usuário**
```
□ Manual do usuário
□ Tutoriais em vídeo (opcional)
□ FAQs
□ Troubleshooting
□ Release notes
```

**4.3.3 - Comentários no Código**
```
□ Funções complexas documentadas
□ JSDoc em componentes
□ Comentários em lógica de negócio
□ TODOs removidos
```

---

## 6. CHECKLIST DE VALIDAÇÃO

### ✅ Checklist Geral de Release

**Funcionalidades Core:**
```
□ Autenticação 100%
□ Onboarding 100%
□ Clientes 100% (incluindo detalhes)
□ Funcionários 100%
□ Serviços 100%
□ Agendamentos 100%
□ Vendas 100%
□ Inventário 100%
□ Caixa 100%
□ Financeiro 100%
□ Relatórios 100%
□ Agendamento Público 100%
□ Notificações 100%
```

**Funcionalidades Avançadas:**
```
□ Campanhas 100%
□ Fidelidade 100%
□ Indicação 100%
□ Galeria de Fotos 100%
□ Anamnese 100%
□ Pagamentos Online 100%
□ Analytics Avançado 100%
```

**Qualidade:**
```
□ 0 erros no console
□ 0 warnings do TypeScript
□ Performance otimizada
□ Responsivo em todos dispositivos
□ Acessível (WCAG 2.1 AA)
□ SEO otimizado
□ Documentação completa
```

---

## 7. ESTRATÉGIA DE TESTES

### Testes Automatizados

**Unit Tests (Jest + React Testing Library):**
```bash
# Testar componentes isolados
npm run test:unit

Coverage esperado: > 80%
```

**Integration Tests (Playwright):**
```bash
# Testar fluxos completos
npm run test:e2e

Fluxos críticos:
- Login/Signup
- Criar cliente
- Criar agendamento
- Fechar venda
- Criar campanha
```

**Backend Tests:**
```bash
# Testar queries/actions
wasp test
```

### Testes Manuais

**Checklist de Fumaça (Smoke Test):**
```
1. □ Fazer login
2. □ Acessar dashboard
3. □ Criar cliente
4. □ Criar agendamento
5. □ Fechar venda
6. □ Abrir relatório
7. □ Fazer logout
```

**Testes de Regressão:**
```
□ Funcionalidades antigas continuam funcionando
□ Nenhum módulo quebrou com novas alterações
□ Performance não degradou
```

---

## 8. ESTRATÉGIA DE DEPLOY

### Ambientes

**1. Development (Local)**
```
- Desenvolvimento ativo
- Testes iniciais
- Debug
```

**2. Staging (VPS)**
```
- Testes finais
- Validação de integração
- QA
```

**3. Production**
```
- Versão estável
- Monitoramento 24/7
- Backups automáticos
```

### Processo de Deploy

**Checklist:**
```
□ Todos os testes passam
□ Build sem erros
□ Migrations aplicadas
□ Variáveis de ambiente configuradas
□ Backup do banco de dados
□ Monitoramento ativo
□ Rollback plan definido
```

---

## 9. CRONOGRAMA VISUAL

```
Semana 1:
[████████████████████] Fase 1: Bloqueadores (2 dias)

Semana 2-3:
[████████████████████████████████] Fase 2: Importantes (8-10 dias)

Semana 4-5:
[████████████████████████████████████████] Fase 3: Opcionais (10-12 dias)

Semana 6:
[████████████] Fase 4: Polimento (3-4 dias)

TOTAL: 23-28 dias úteis (5-6 semanas)
```

---

## 10. CONCLUSÃO

### Próximos Passos Imediatos

1. **DIA 1:** Implementar componente ui/tabs + ClientDetailPage
2. **DIA 2:** Adicionar rotas financeiras + BudgetsPage
3. **DIA 3-5:** Módulo de Campanhas
4. **DIA 6-7:** Programas de Fidelidade e Indicação
5. **SEMANA 2-3:** Melhorias opcionais
6. **SEMANA 4:** Polimento final

### Critérios de Sucesso

- ✅ **100% das rotas** implementadas e funcionais
- ✅ **0 gaps** críticos ou não-críticos
- ✅ **Sistema estável** sem erros
- ✅ **Performance otimizada**
- ✅ **Documentação completa**
- ✅ **Pronto para produção**

---

**Documento gerado em:** 13 de Novembro de 2025  
**Autor:** Sistema de Planejamento Glamo  
**Versão:** 1.0  
**Status:** PRONTO PARA EXECUÇÃO

🚀 **Vamos começar!**
