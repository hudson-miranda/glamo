# Glamo Super Evolution Roadmap

## 1. Visão Estratégica
Transformar o Glamo em uma plataforma de gestão e crescimento inteligente para negócios de beleza e estética, ultrapassando o escopo do Belasis ao incorporar automação multicanal, inteligência preditiva, extensibilidade aberta, auditoria enterprise e verticalização acelerada.

## 2. Princípios Orientadores
| Princípio | Descrição |
|-----------|-----------|
| Valor Iterativo | Entregas faseadas com impacto rápido ao usuário final. |
| Arquitetura Extensível | EventBus, Rule Engine, API pública – evitar acoplamentos rígidos. |
| Observabilidade Desde o Início | Logs, auditoria, métricas, status health para futuras SLAs. |
| Segurança & Conformidade | RBAC granular + auditoria + segregação de dados. |
| Inteligência Progressiva | De heurísticas → modelos preditivos → recomendações com feedback. |
| Verticalização Escalável | Presets por segmento (salão, barbearia, clínica) sem bifurcar código-fonte principal. |

## 3. Macro-Fases (12 Meses Planejados)

### Fase 0 (Mês 1) – Fundação & Infra
| Item | Objetivo | Critérios de Sucesso | Dependências |
|------|----------|----------------------|--------------|
| AuditLog Middleware | Registrar toda ação crítica | 100% create/update/delete de domínios principais logados | Prisma & RBAC |
| EventBus Interno | Desacoplar automações | Publicar/consumir eventos Appointment/Sale/Stock | Redis ou in-memory |
| Base Vertical Packs | Estrutura presets JSON | Seleção de perfil no onboarding do salão | Modelagem segmentos |
| Refino RBAC Gaps | Cobrir novas rotas | Sem endpoint crítico sem checagem | Lista de operações |

### Fase 1 (Meses 2-3) – CRM Multicanal & Verticalização
| Item | Objetivo | Critérios |
|------|----------|----------|
| Funis CRM | Estados lead→ativo→retenção→recuperação | CRUD funil + transição automática por eventos |
| Segmentação Dinâmica | Segment builder (atributo+operador+valor) | Criar 5 segmentos distintos + reutilizar em campanhas |
| Automação Mensagens | Workflows (trigger → conditions → actions) | Execução diária sem falhas + painel de histórico |
| Vertical Packs UI | Aplicar presets (serviços, regras default) | Reduzir setup inicial <10 minutos |

### Fase 2 (Meses 4-5) – Promoções & Dashboard Dinâmico
| Item | Objetivo | Critérios |
|------|----------|----------|
| Engine Promoções | Conditions+Actions (desconto %, cashback extra) | Aplicar promo em venda com log + rollback seguro |
| Pricing Dinâmico | Ajuste baseado em demanda/horário | Ocupação horários pico +5% |
| Dashboard Widgets | Layout configurável (Grid) | User adiciona/ remove widgets, persistência OK |
| Métricas Cache | Performance | <300ms resposta em 90% widgets |

### Fase 3 (Meses 6-7) – Mobile MVP & Gamificação
| Item | Objetivo | Critérios |
|------|----------|----------|
| App React Native | Agenda + Notificações + Vendas rápidas | Publicado (TestFlight/Play Store Beta) |
| Push Notifications | Interação rápida | Entrega >95% eventos push |
| Gamificação | Achievements, streaks, pontos | +10% retenção 90 dias em coorte teste |
| Loyalty Integração Gamification | Pontos → Tiers | Elevação tiers 15% mais rápida |

### Fase 4 (Meses 8-9) – AI Assistente & Fiscal
| Item | Objetivo | Critérios |
|------|----------|----------|
| AI Recomendador | Sugestões de reativação & ocupação agenda | Aceitação >25% recomendações |
| Feature Store | Base para modelos | Atualização diária sem quebra |
| NF-e/NFS-e Integração | Emissão fiscal | 90% autorizações sem erro |
| Compliance Center | Termos + Política + Auditoria export | Export CSV audit <5s |

### Fase 5 (Meses 10-11) – Preditivo & Financeiro
| Item | Objetivo | Critérios |
|------|----------|----------|
| Churn Scoring | Classificar risco cliente | Precisão >65% vs validação manual |
| Demand Forecast | Previsão serviços 30d | Erro médio <20% em top 10 serviços |
| Antecipação Recebíveis | Ferramenta financeira | 1º fluxo concluído sem falhas |
| Risk Dashboard | Alertas anômalos | Notificação automática divergências |

### Fase 6 (Mês 12) – Extensibilidade & Portal Dev
| Item | Objetivo | Critérios |
|------|----------|----------|
| API Pública | Endpoints documentados (OpenAPI) | 100% operações core documentadas |
| Webhooks Configuráveis | Eventos (sale.created, appointment.updated...) | Registro e entrega >95% |
| Portal Dev | Chaves + Rate limit | Painel de chave + métricas uso |
| Marketplace Seeds | Estrutura para futuros plugins | POC plugin exemplo publicado |

## 4. Arquitetura Alvo (Resumo)
- **Camada Domínio**: Módulos atuais (services, loyalty, referral...) mantidos.
- **EventBus**: Emissor/Consumidor central (Redis Pub/Sub inicialmente; possibilidade Kafka futura).
- **Rule Engine / Promo Engine**: Abstração Condition/Action; Avaliação no pipeline de venda/agenda.
- **Audit Trail**: Middleware + tabela `AuditLog`; export & filtro.
- **Feature Store (AI)**: Tarefas ETL gerando snapshots diários (`ClientFeatures`, `ServiceDemandFeatures`).
- **Widget Framework**: Registro estático + storage layout por usuário.
- **Vertical Packs**: Arquivos JSON + apply service (seed/override).

## 5. Modelos de Dados Novos (Sugestões)
```
Promotion(id, salonId, name, active, startsAt, endsAt)
PromotionCondition(id, promotionId, field, operator, value)
PromotionAction(id, promotionId, type, valueNumeric, valuePercent)
AuditLog(id, actorId, salonId, resource, action, beforeJson, afterJson, createdAt, ip)
AchievementTemplate(id, code, name, description, trigger, threshold)
AchievementInstance(id, userId, templateId, progress, awardedAt)
ClientChurnScore(id, clientId, salonId, score, calculatedAt)
ClientFeatures(id, clientId, salonId, lastVisitDays, totalSpent, avgTicket, visitsLast90d, updatedAt)
ServiceDemandFeatures(id, serviceId, salonId, weekOfYear, demandIndex, updatedAt)
VerticalPack(id, code, name, description, configJson, createdAt)
WidgetLayout(id, userId, salonId, layoutJson, updatedAt)
WebhookSubscription(id, salonId, eventName, targetUrl, secret, active, createdAt)
```

## 6. Métricas & KPIs por Entrega
| Fase | Métricas Chave |
|------|----------------|
| 0 | % ações logadas, latência EventBus |
| 1 | Reativação clientes, nº segmentos criados |
| 2 | Ticket médio, nº widgets ativos |
| 3 | DAU mobile, retenção gamificada |
| 4 | Aceitação recomendações, taxa NF aprovada |
| 5 | Acurácia churn, volume antecipações |
| 6 | Nº integrações externas, consumo Webhooks |

## 7. Riscos & Mitigações
| Risco | Mitigação |
|-------|-----------|
| Complexidade crescente | Boundaries claros + documentação modular |
| Performance queries | Índices + caching + materialized views |
| Adoção AI baixa | Explicabilidade e feedback loop |
| Segurança Webhooks | Assinatura HMAC + rate limiting |
| Divergência vertical packs | Versionamento + teste snapshot |
| Promoções conflitantes | Prioridade + resolução determinística |

## 8. Estimativas Macro (Esforço Relativo)
| Fase | Esforço (dev-weeks) | Perfis Necessários |
|------|--------------------|--------------------|
| 0 | 3-4 | Backend, DevOps |
| 1 | 6-8 | Fullstack, Backend, UX |
| 2 | 6-7 | Backend, Frontend, Data Eng. |
| 3 | 7-8 | Mobile, Backend, UX |
| 4 | 7-9 | Data/ML, Backend, Fiscal Integr. |
| 5 | 6-8 | Data Scientist, Backend Fintech |
| 6 | 5-6 | Backend API, DevRel |

## 9. Critérios de Aceite por Fase (Exemplos)
- Fase 0: Toda operação crítica escrita no `AuditLog`; nenhum endpoint sem RBAC; eventos publicados.
- Fase 1: Usuário cria funil e vê leads progredindo automaticamente; segmentação usada em campanha.
- Fase 2: Promoção aplicada em venda registrada no log; usuário rearranja widgets e estado persiste.
- Fase 3: App faz login, cria venda rápida e recebe push de confirmação; usuário ganha achievement.
- Fase 4: Recomendações listadas com justificativa; NF gerada e consultável.
- Fase 5: Dashboard mostra clientes em risco; fluxo antecipação concluído.
- Fase 6: Chave API criada, webhook recebe evento assinado, documentação navegável.

## 10. Próximos Passos Imediatos
1. Criar backlog técnico detalhado por story a partir deste roadmap.
2. Priorizar Fase 0 tasks (AuditLog + EventBus). 
3. Especificar contratos de Promo Engine e Segment Builder.
4. Definir provedor NF (pesquisa inicial). 
5. PoC Mobile (lista de agendamentos + login).

## 11. Conclusão
Este roadmap posiciona o Glamo para avançar de uma solução robusta operacional para uma plataforma de crescimento inteligente e extensível. Ao executar as fases com disciplina e medir continuamente impacto, o Glamo evolui além do Belasis em automação, inteligência, experiência vertical e abertura de ecossistema.

---
Documento gerado automaticamente. Atualizar conforme progresso real das entregas.
