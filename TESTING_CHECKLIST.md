# 🧪 Checklist de Testes - Módulos Avançados

## 📋 Testes de Navegação

### Sidebar
- [ ] Item "Advanced Scheduling" aparece no menu
- [ ] Item "Loyalty Program" aparece no menu
- [ ] Item "Referral Program" aparece no menu
- [ ] Item "Photo Gallery" aparece no menu
- [ ] Item "Anamnesis Forms" aparece no menu
- [ ] Item "Advanced Analytics" aparece no menu
- [ ] Ícones estão corretos (Clock, Gift, UserPlus, Camera, FileText, TrendingUp)
- [ ] Clicar em cada item navega corretamente

### Rotas Diretas
- [ ] `/scheduling/advanced` carrega sem erros
- [ ] `/programs/loyalty` carrega sem erros
- [ ] `/programs/referral` carrega sem erros
- [ ] `/gallery/photos` carrega sem erros
- [ ] `/forms/anamnesis` carrega sem erros
- [ ] `/analytics/advanced` carrega sem erros

---

## 🎨 Testes de UI/UX

### Advanced Scheduling Page
- [ ] Header com título e botões aparece
- [ ] 4 cards de estatísticas renderizam
- [ ] Sistema de tabs funciona (Calendário/Bloqueios/Lista de Espera)
- [ ] CalendarView renderiza corretamente
- [ ] Lista de bloqueios exibe dados (se houver)
- [ ] Lista de espera exibe dados (se houver)
- [ ] EmptyStates aparecem quando não há dados
- [ ] Loading states funcionam

### Loyalty Program Page
- [ ] Header com título e botões aparece
- [ ] 4 cards de KPIs renderizam
- [ ] Lista de programas exibe corretamente
- [ ] Badges de status (Ativo/Inativo) funcionam
- [ ] Badge VIP Tiers aparece quando habilitado
- [ ] Ícone Crown aparece em programas VIP
- [ ] EmptyState aparece quando não há programas
- [ ] Loading states funcionam

### Referral Program Page
- [ ] Header com título e botões aparece
- [ ] Seletor de período (Semana/Mês/Todo) funciona
- [ ] 4 cards de estatísticas renderizam
- [ ] Lista de programas exibe corretamente
- [ ] Leaderboard Top 10 renderiza
- [ ] Ranking visual (ouro/prata/bronze) aparece
- [ ] EmptyStates aparecem quando não há dados
- [ ] Loading states funcionam

### Photo Gallery Page
- [ ] Página carrega sem erros
- [ ] Interface está funcional

### Anamnesis Forms Page
- [ ] Página carrega sem erros
- [ ] Interface está funcional

### Advanced Analytics Page
- [ ] Página carrega sem erros
- [ ] Dashboard renderiza
- [ ] Gráficos/métricas aparecem

---

## 🔧 Testes Funcionais

### Context Integration
- [ ] useSalonContext retorna activeSalonId
- [ ] Queries são executadas apenas quando há activeSalonId
- [ ] EmptyState aparece se não houver salão selecionado

### Queries e Data Fetching

#### Loyalty
- [ ] listLoyaltyPrograms retorna dados
- [ ] getLoyaltyProgramStats retorna estatísticas
- [ ] Dados são exibidos corretamente na UI
- [ ] Loading states funcionam durante fetch

#### Referral
- [ ] listReferralPrograms retorna dados
- [ ] getReferralStats retorna estatísticas por período
- [ ] getReferralLeaderboard retorna top 10
- [ ] Filtro de período altera os dados
- [ ] Dados são exibidos corretamente na UI

#### Scheduling
- [ ] listTimeBlocks retorna bloqueios
- [ ] listWaitingList retorna lista de espera
- [ ] Dados são filtrados por data
- [ ] CalendarView recebe dados corretamente

### Actions (quando implementadas)
- [ ] Criar novo programa de fidelidade
- [ ] Editar programa existente
- [ ] Criar programa de indicação
- [ ] Registrar nova indicação
- [ ] Criar bloqueio de horário
- [ ] Adicionar à lista de espera

---

## 🤖 Testes de Jobs Automáticos

### Background Jobs
- [ ] processExpiredCashback executa às 2h
- [ ] calculateDailyMetrics executa à 1h
- [ ] checkTierUpgrades executa às 3h
- [ ] sendBirthdayCampaigns está configurado
- [ ] sendReactivationCampaigns está configurado
- [ ] sendAppointmentReminders está configurado
- [ ] sendFollowUpMessages está configurado

### Verificar Logs
```bash
# Monitorar execução de jobs
wasp db studio
# Verificar tabela de jobs do PgBoss
```

---

## 💾 Testes de Database

### Schema
- [ ] Todas as migrations foram aplicadas
- [ ] Tabelas existem no banco:
  - [ ] Client (com campos expandidos)
  - [ ] ClientTag, ClientNote, ClientDocument, ClientHistory
  - [ ] TimeBlock, WaitingList, BookingConfig
  - [ ] CommunicationLog, MarketingCampaign, ClientSegment
  - [ ] LoyaltyProgram, ClientLoyaltyBalance, LoyaltyTransaction, LoyaltyTier
  - [ ] ReferralProgram, Referral
  - [ ] ClientPhoto, AnamnesisForm, ClientAnamnesis
  - [ ] ClientMetrics, SalonAnalytics

### Data Operations
- [ ] Insert operations funcionam
- [ ] Update operations funcionam
- [ ] Delete operations funcionam
- [ ] Relacionamentos estão corretos
- [ ] Constraints são respeitadas

---

## 🔐 Testes de Permissões

### RBAC
- [ ] can_view_clients permite acessar Loyalty/Referral/Photos/Anamnesis
- [ ] can_view_appointments permite acessar Advanced Scheduling
- [ ] can_view_reports permite acessar Advanced Analytics
- [ ] Usuários sem permissão não veem itens no menu
- [ ] Rotas diretas respeitam permissões

---

## 🎯 Testes de Performance

### Loading Times
- [ ] Páginas carregam em menos de 2 segundos
- [ ] Queries são otimizadas (incluem apenas campos necessários)
- [ ] Não há n+1 queries
- [ ] Paginação funciona corretamente

### Responsividade
- [ ] Layout funciona em desktop (1920x1080)
- [ ] Layout funciona em tablet (768x1024)
- [ ] Layout funciona em mobile (375x667)
- [ ] Sidebar colapsa corretamente
- [ ] Cards se reorganizam em grid responsivo

---

## ⚠️ Testes de Erro

### Error Handling
- [ ] Erro de rede mostra mensagem apropriada
- [ ] Erro 404 redireciona para página de erro
- [ ] Erro 500 mostra mensagem de erro
- [ ] Loading infinito não acontece
- [ ] Retry funciona após erro

### Edge Cases
- [ ] Dados vazios mostram EmptyState
- [ ] Dados null não quebram a aplicação
- [ ] Valores undefined são tratados
- [ ] Arrays vazios são renderizados corretamente

---

## 🧩 Testes de Integração

### Fluxo Completo - Loyalty
1. [ ] Criar programa de fidelidade
2. [ ] Ativar programa
3. [ ] Adicionar cliente ao programa
4. [ ] Emitir cashback
5. [ ] Cliente resgatar cashback
6. [ ] Ver estatísticas atualizadas

### Fluxo Completo - Referral
1. [ ] Criar programa de indicação
2. [ ] Cliente indicar amigo
3. [ ] Amigo fazer primeira compra
4. [ ] Indicação ser qualificada
5. [ ] Recompensas serem emitidas
6. [ ] Ver no leaderboard

### Fluxo Completo - Scheduling
1. [ ] Criar bloqueio de horário
2. [ ] Verificar indisponibilidade no calendário
3. [ ] Adicionar cliente à lista de espera
4. [ ] Horário ficar disponível
5. [ ] Notificar cliente da lista de espera
6. [ ] Agendar atendimento

---

## 📊 Métricas de Sucesso

### Checklist Geral
- [ ] 0 erros de compilação
- [ ] 0 erros de runtime
- [ ] 100% das rotas funcionais
- [ ] 100% das queries retornando dados
- [ ] 100% dos componentes renderizando
- [ ] 100% dos jobs configurados
- [ ] Design system consistente
- [ ] UX fluida e intuitiva

### Problemas Conhecidos
- [ ] Nenhum problema crítico identificado
- [ ] Pequenos ajustes de UI necessários: _______
- [ ] Melhorias de performance possíveis: _______
- [ ] Features adicionais desejadas: _______

---

## 🚀 Próximas Etapas

Após completar todos os testes acima:

1. **Documentar Issues Encontradas**
   - Criar lista de bugs
   - Priorizar correções
   - Estimar tempo de fix

2. **Implementar Melhorias**
   - Modals de criação/edição
   - Validações de formulário
   - Filtros avançados
   - Exportação de relatórios

3. **Otimizações**
   - Cache de queries
   - Lazy loading de componentes
   - Compressão de imagens
   - Minificação de assets

4. **Documentação**
   - Guia do usuário
   - Documentação técnica
   - Video tutorials
   - FAQ

---

## 📝 Notas de Teste

**Ambiente:**
- Sistema Operacional: _______
- Browser: _______
- Versão do Node: _______
- Versão do Wasp: 0.18.0

**Testador:** _______
**Data:** _______

**Observações Gerais:**
_______________________________________
_______________________________________
_______________________________________

**Bugs Encontrados:**
_______________________________________
_______________________________________
_______________________________________

**Sugestões de Melhoria:**
_______________________________________
_______________________________________
_______________________________________

---

**✅ Checklist concluído! Sistema pronto para produção quando todos os itens estiverem marcados.**
