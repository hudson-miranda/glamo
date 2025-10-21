### Objetivo

Relatórios de vendas, comissões, estoque e caixa com filtros por intervalo e exportação.

### Regras

* Paginação e limites para performance
* Exportações assíncronas via job quando grandes

### Queries/Actions

* **Queries**: `salesReport`, `commissionReport`, `inventoryReport`, `cashReport`
* **Actions**: `exportReport`

### Testes

* Totais por período e por colaborador
* Export grande disparando job