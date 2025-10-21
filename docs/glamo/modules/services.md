### Objetivo

Cadastrar serviços e suas variações, com parâmetros de duração, preço, valores não comissionáveis e vínculo com políticas de comissão.

### Entidades

* **Service**(id, salonId, name, description?, hasVariants, duration, price, costValue, costValueType: FIXED|PERCENT, nonCommissionableValue, nonCommissionableValueType)
* **ServiceVariant**(serviceId, name, duration, price)
* **CommissionConfig**(serviceId, commissionType, baseValueType, baseValue, deductAssistantsFromProfessional: bool, soloValue, soloValueType, withAssistantValue, withAssistantValueType, asAssistantValue, asAssistantValueType)

### Regras de Negócio

1. **Variações:**

   * Se `hasVariants = true`, preço/duração por `ServiceVariant` prevalecem no cálculo.
2. **Valores não comissionáveis:**

   * `nonCommissionableValue` (fixo/%) reduz a base de cálculo da comissão.
3. **Comissão por contexto:**

   * Solo, com assistente, como assistente (percentual ou valor fixo).
   * Se `deductAssistantsFromProfessional = true`, parcela do assistente é abatida do profissional principal.
4. **Integridade:**

   * Não apagar serviço em uso; adotar *soft delete* ou `archivedAt`.

### Queries/Actions

* **Queries**: `listServices`, `getService`, `listServiceVariants`
* **Actions**: `createService`, `updateService`, `archiveService`, `createServiceVariant`, `updateServiceVariant`, `deleteServiceVariant`, `setCommissionConfig`

### Testes

* Cálculo de preço/duração com e sem variantes
* Aplicação de não comissionável
* CommissionConfig compatível com cenários de venda