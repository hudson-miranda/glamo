### Objetivo

Controlar produtos, estoque, alertas e rastreabilidade completa de movimentos.

### Entidades

* **Product**(id, salonId, categoryId?, brandId?, supplierId?, costPrice, salePrice, stockQuantity, initialStock, minimumStock, saleCommissionValue, saleCommissionType, unitOfMeasure)
* **StockRecord**(productId, movementType: IN|OUT|ADJUST, quantity, reason?, previousQuantity, finalQuantity, createdAt)

### Regras

1. **Movimentação Atômica:**

   * Atualizar `stockQuantity` junto com `StockRecord` em transação.
2. **Mínimo em Estoque:**

   * Notificar quando `stockQuantity <= minimumStock`.
3. **Proibição de negativos:**

   * Bloquear saídas que gerem estoque negativo (exceto se política permitir).

### Queries/Actions

* **Queries**: `listProducts`, `getProduct`, `listLowStock`
* **Actions**: `createProduct`, `updateProduct`, `archiveProduct`, `recordStockMovement`

### Testes

* Movimento IN/OUT/ADJUST
* Alerta de mínimo
* Concorrência em múltiplas saídas