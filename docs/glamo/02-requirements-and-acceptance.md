### Requisitos Funcionais (prioritários)

1. CRUD de clientes com histórico e busca.
2. Agenda diária/semanal com múltiplos serviços e assistentes.
3. Evitar conflitos de horário por profissional/sala.
4. Registro e cancelamento de agendamentos.
5. Serviços com variações e políticas de comissão.
6. Cálculo de comissão (solo, com assistente, como assistente).
7. Venda de produtos e serviços com descontos e créditos.
8. Múltiplos métodos de pagamento (dinheiro, Pix, cartão, crédito cliente).
9. Controle de estoque e alertas de baixo nível.
10. Abertura e fechamento de caixa com conciliação.
11. Relatórios de vendas, comissões, estoque e caixa.
12. RBAC contextual por salão (roles e permissões).

### Requisitos Não Funcionais

* Multi-tenant seguro (isolamento por salão).
* Autenticação via Auth Wasp.
* PostgreSQL + Prisma.
* Resiliência e logs com auditoria.
* Performance < 300ms em ações principais.

### Critérios de Aceitação (exemplo)

* **Dado** que um profissional possui um agendamento às 10h,
  **Quando** outro cliente tenta agendar o mesmo horário,
  **Então** o sistema deve rejeitar e exibir mensagem de conflito.

* **Dado** que um serviço tem comissão de 40% solo e 30% com assistente,
  **Quando** a venda é feita com assistente,
  **Então** o profissional recebe 30% e o assistente 10% (configurável).