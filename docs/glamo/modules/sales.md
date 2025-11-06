### Objetivo

Gerenciar vendas de serviços/produtos/pacotes, aplicando descontos, créditos, comissões e registrando pagamentos múltiplos.

### Entidades

* **Sale**(id, salonId, clientId?, userId, originalTotal, discountTotal, finalTotal, status: OPEN|PAID|CANCELLED)
* **SaleService**(saleId, serviceId, variantId?, unitPrice, discount, finalPrice)
* **SaleProduct**(saleId, productId, quantity, unitPrice, discount, finalPrice)
* **SalePackage**(saleId, packageId, originalPrice, discount, finalPrice)
* **Payment**(saleId, methodId, userId, amount, status: PENDING|CONFIRMED|FAILED)
* **PaymentMethod**(id, name, type: CASH|CARD|PIX|ONLINE|CREDIT_CLIENT, isOnline: bool)
* **ClientCredit**(clientId, professionalId?, salonId, amount, origin, paymentMethod, date, notes)
* **CreditPayment**(paymentId, creditId, amountUsed)

### Regras de Negócio

1. **Múltiplos Pagamentos:**

   * Permitir n pagamentos somando `finalTotal`.
2. **Créditos de Cliente:**

   * Podem quitar parcial/total; registrar em `CreditPayment`.
3. **Descontos:**

   * Por item e total; validar limites por política do negócio.
4. **Comissões:**

   * Calculadas ao fechar a venda com base nos itens de serviço e nas `CommissionConfig`.
5. **Cancelamento:**

   * Estorna estoque (produtos) e libera ajustes de comissão.

### Queries/Actions

* **Queries**: `listSales(filters)`, `getSale(id)`
* **Actions**: `createSale`, `cancelSale`, `registerPayment`, `listPayments`, `listPaymentMethods`, `applyCredit`, `generateReceipt`, `reprintReceipt`

### Testes

* Pagamentos múltiplos
* Uso parcial de créditos
* Cálculo de comissão por venda
* Cancelamento com estorno