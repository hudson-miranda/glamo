# Glamo vs Belasis – Gap Analysis

## 1. Objetivo
Mapear de forma estruturada tudo que o Belasis (referência avançada) oferece em termos de produto, plataforma e ecossistema, confrontando com o que o Glamo já implementou. Evidenciar lacunas (gaps) e oportunidades de evolução para que o Glamo se torne uma "super evolução" do Belasis.

## 2. Metodologia
1. Inventário dos módulos e operações existentes no `app/src` (Wasp + Prisma + lógica de domínio).
2. Definição de uma taxonomia macro inspirada nos artefatos, páginas e conteúdos do Belasis (produtos, recursos, páginas institucionais, materiais educativos, verticais de mercado, automações, integrações, financeiro, inteligência, etc.).
3. Classificação das capacidades do Glamo nas categorias: `Implementado`, `Parcial`, `Faltante`.
4. Priorização preliminar (Impacto vs Esforço) para orientar roadmap.

## 3. Taxonomia de Referência
| Categoria | Subdomínios | Exemplos Belasis | Papel Estratégico |
|-----------|-------------|------------------|-------------------|
| Core Platform | Usuários, RBAC, Multi-Salão, Autenticação | Acesso seguro, perfis | Fundamentos operacionais |
| Vertical Solutions | Salão, Esmalteria, Barbearia, Clínica Estética, Lash | Páginas e segmentação | Aderência por nicho |
| Services & Operations | Cadastro, Customização por profissional, Consumo de produtos, Comissões | Gestão de oferta de serviços | Monetização e eficiência |
| Scheduling & Agenda | Agendamentos, Recorrência, Disponibilidade, Conflitos, Lista de espera | Sistema de agendamento online | Retenção e fluxo operacional |
| Marketing & CRM | Notificações, Mensagens automatizadas, Funis, Segmentação | CRM WhatsApp, Automação | Engajamento e crescimento |
| Loyalty & Gamificação | Programas, Tiers, Cashback, Expiração, Achievements | Retenção, incentivo | Aumento LTV |
| Referral & Growth | Programas de indicação, códigos, tracking, leaderboard | Crescimento orgânico | Aquisição custo reduzido |
| Inventory & Supply | Produtos, Categorias, Marcas, Fornecedores, Movimentações | Controle de insumos | Margem e previsibilidade |
| Sales & POS | Vendas, Créditos, Fechamento, Cancelamentos | PDV virtual/interno | Receita e registro |
| Payments & Finance | Integrações, Métricas, Transações, Refunds | Belasis Pay | Expansão financeira |
| Reports & BI | Relatórios de vendas, comissões, estoque, financeiro, agendamentos | Painéis gerenciais | Decisão baseada em dados |
| Analytics Avançado | Métricas evoluídas, previsões, segmentação profunda | Insights preditivos | Diferenciação competitiva |
| Telemedicina / Saúde | Formulários clínicos, anamneses, prontuários | Versão para clínicas | Nova vertical |
| Document & Compliance | Políticas, Termos, Auditoria, Fiscal | Conformidade e confiança | Segurança jurídica |
| Mobile & Apps | Aplicativos iOS/Android | Acesso omnichannel | Adoção e conveniência |
| Corporate & Institucional | Sobre nós, Carreiras, Revenda, Status, Planos & Preços | Presença institucional forte | Conversão e credibilidade |
| Educação & Conteúdo | Base de conhecimento, artigos, tutoriais, materiais | Wiki, Blog Recursos | Autoridade e suporte |
| AI & Assistência | Assistente inteligente, recomendações | Automação e insight | Escalabilidade operacional |
| Extensibilidade | API Pública, Webhooks, Portal Dev | Integrações de terceiros | Ecosistema e retenção |

## 4. Inventário Sintético das Capacidades Atuais do Glamo
- Services: CRUD serviços, variantes (UI removida), comissões configuráveis, customizações por funcionário, mensagens de cuidado (pre/post), consumo de produtos.
- Scheduling: CRUD agendamentos, recorrência, cálculo de disponibilidade, detecção de conflitos, utilidades de recorrência, lista de espera (estrutura presente).
- Loyalty: Programas, tiers, ajustes de saldo, cashback, resgate, transações, estatísticas.
- Referral: Programas, indicação, tracking de clique, qualificação, leaderboard, estatísticas.
- Inventory: Produtos, categorias, marcas, fornecedores, movimentações de estoque, low stock alert.
- Sales: Vendas, créditos de cliente, fechamento, cancelamento, atualização.
- Reports: Relatórios de vendas, comissões, estoque, agendamentos, financeiro.
- Notifications: Lista, criação, marcação como lida, marcar todas.
- Payments: Pagamentos (Stripe/LemonSqueezy), métricas de pagamento, transações, webhooks.
- RBAC: Permissões granularizadas, seeds, testes.
- Employees/Salon/User: Gestão de funcionários, convites, templates de email, preferências de usuário.
- CareMessages / ProductConsumption / EmployeeCustomization: Camadas especializadas de serviço.
- Scripts seeds: Dados iniciais.
- Telemedicina (menções, estrutura parcial – precisa consolidação).
- Demo AI (protótipo – sem features produtivas). 

## 5. Gap Matrix (Resumo)
Legenda: I=Implementado, P=Parcial, F=Faltante

| Feature / Domínio | Status | Observações |
|-------------------|--------|-------------|
| Multi-Vertical Packs (salão/esmalteria/barbearia/estética/lash) | P | Estrutura genérica sem presets específicos |
| CRM Multicanal (funis, segmentação dinâmica, jornadas) | P | Mensagens pre/post + notificações básicas; sem funis/dinâmica |
| Motor de Promoções & Pricing Dinâmico | F | Não há condition/action engine |
| Auditoria Unificada (multi-módulo) | P | Movimentações isoladas; sem trilha centralizada |
| App Mobile iOS/Android | F | Não implementado |
| Gamificação Avançada (achievements/streaks) | P | Loyalty tiers e cashback presentes |
| Assistente AI Operacional | F | Apenas demo; sem recomendações acionáveis |
| Preditivo (churn, demanda, LTV) | F | Nenhuma modelagem atual |
| Emissão Fiscal (NF-e / NFS-e) | P | Campos básicos; sem integração fornecedora |
| Motor de Regras (rule engine low-code) | F | Lógica rígida em código |
| Portal API Pública / Webhooks configuráveis | F | Operações internas apenas |
| Dashboard Dinâmico (widgets configuráveis) | P | Relatórios estáticos; sem montagem livre |
| Gestão de Campanhas (cross-sell, combos, sazonal) | P | Sem módulo estruturado; usar care messages manualmente |
| Produtos Financeiros (antecipação, carteira) | F | Integrações gateway apenas |
| Vertical Clínica (prontuário/anamnese estruturado) | P | Base textual em docs – funções não consolidadas |
| Marketplace / Revenda / Parcerias | F | Ausente |
| Segurança Avançada (rate limiting, fraude) | F | Não evidenciado |
| Observabilidade (status público, incident log) | F | Sem página/status feed |
| Base de Conhecimento In-app | F | Documentos internos apenas |
| Segmentação Inventário (Curva ABC, previsão ruptura) | P | Low stock alert apenas |
| Conversão Omni-channel (marketplace integr.) | F | Não presente |
| Gestão Completa de Formulários Médicos (workflow) | P | Estrutura parcial |

## 6. Priorização (Impacto vs Esforço)
| Prioridade | Feature | Justificativa |
|------------|--------|---------------|
| P1 | CRM Multicanal + Funis | Aumenta retenção e conversão imediata |
| P1 | Auditoria Unificada | Conformidade e confiança enterprise |
| P1 | Vertical Packs | Reduz tempo de onboarding e amplia mercado |
| P2 | Engine Promoções | Incremento de receita e engajamento |
| P2 | Dashboard Dinâmico | Empowerment gerencial, upsell post implementação |
| P2 | Mobile MVP | Experiência contínua / acessibilidade |
| P3 | Assistente AI + Regras Dinâmicas | Diferencial competitivo e automação |
| P3 | Emissão Fiscal Integrada | Expansão para segmentos com exigência legal |
| P3 | Gamificação Avançada | Aumento de frequência e fidelização |
| P4 | Preditivo & Produtos Financeiros | Estratégia de valor agregado e monetização |
| P5 | Portal Dev & Marketplace | Escalar ecossistema e retenção longa |

## 7. Impactos Esperados
| Área | Impacto Quantitativo | Indicador |
|------|----------------------|-----------|
| CRM Multicanal | +15–25% reativação clientes inativos | % clientes reativados mês |
| Promoções Engine | +8–12% ticket médio | Ticket médio vs baseline |
| Dashboard Dinâmico | -40% tempo análise gerencial | Horas/mês time gestor |
| Mobile | +20% uso diário | DAU / MAU ratio |
| Auditoria | <2% incidentes sem rastreio | % ações sem log |
| AI Assistente | +10% ocupação slots ociosos | % horários vagos convertidos |
| Gamificação | +12% retenção 90 dias | Retenção cohort |
| Fiscal Integrado | +100% adoção segmento clínico | Nº clínicas ativas |
| Preditivo | -15% churn alto risco | Churn clientes score>limite |

## 8. Riscos & Mitigações
| Risco | Mitigação |
|-------|-----------|
| Escopo inflacionado | Roadmap faseado + critérios de saída claros |
| Performance relatórios | Cache + materialized views |
| Complexidade AI | Iniciar com heurísticas → evoluir para modelos |
| Adoção Mobile lenta | MVP focado em agenda + notificações |
| Compliance fiscal complexo | Parceria provedor especializado |
| Segurança de dados | Endurecer RBAC + auditoria desde Fase 0 |
| Difusão de regras ad-hoc | Criar rule-engine central desde fase P3 |

## 9. Recomendações Técnicas Chave
- Introduzir EventBus interno (ex: Redis Pub/Sub) para desacoplar automações (agendamento, notificações, loyalty).
- Criar `AuditLog` (resource, action, diff, actor, timestamp, salonId, ip) + middleware.
- Engine de Promoções: Tabelas `Promotion`, `Condition`, `Action`, pipeline aplicado em checkout/venda.
- Dashboard: Modelo `Widget` + registry de componentes + layout persistido.
- AI: ETL para features simples; iniciar com recomendação baseada em regras (tempo desde última visita).
- Fiscal: Serviço assíncrono com retries + status (PENDING, AUTHORIZED, ERROR).

## 10. Conclusão
O Glamo já possui base robusta superior a soluções básicas e se aproxima em diversos aspectos do Belasis. Para superar, precisa focar em: automação de CRM multicanal, vertical packs, engine de promoções, auditoria corporativa, experiência móvel, inteligência (AI/preditivo) e extensibilidade. A priorização proposta entrega valor real progressivo e prepara terreno para diferenciação escalável.

---
Documento gerado automaticamente. Atualize conforme novas migrações ou módulos forem integrados.
