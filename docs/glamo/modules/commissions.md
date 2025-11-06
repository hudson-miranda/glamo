### Objetivo

Definir e calcular comissões por serviço/variação considerando papéis (profissional/assistente), valores não comissionáveis e regras do negócio.

### Engine de Cálculo (função pura)

`computeCommissionForSaleItems(items, commissionConfigs, options)`

* **Entrada**: lista de itens de venda (serviços com flags indicando solo/assistente), configs por serviço, opções de arredondamento/política.
* **Saída**: breakdown por colaborador e por item com totais.

### Regras

1. Base de cálculo = `itemPrice - nonCommissionable` (fixo/%)
2. Solo/Com Assistente/Como Assistente aplicam valores/percentuais específicos
3. Dedução do assistente do profissional principal (se habilitado)
4. Arredondamento bancário (half-to-even) por padrão

### Casos de Teste-chave

* 100% solo, 50/50 com assistente, e 30/10 (prof/assist) via configs
* Não comissionável excedendo o preço (tratar como zero base)
* Várias combinações por venda