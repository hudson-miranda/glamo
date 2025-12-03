# Unificação do Sistema de Categorias

## Resumo

Unificamos os sistemas de categorias separados (ServiceCategory e ProductCategory) em um único modelo Category com um campo discriminador `type`.

## Motivação

### Problema Anterior
- Duas tabelas separadas: `ServiceCategory` e `ProductCategory`
- Duplicação de dados quando categorias serviam ambos
- Gestão duplicada (usuário precisa cadastrar em dois lugares)
- Inconsistência entre módulos

### Solução Implementada
- Um único modelo `Category` com campo `type: CategoryType`
- Enum `CategoryType` com valores: `SERVICE`, `PRODUCT`, `BOTH`
- Migração preservando todos os dados e IDs existentes
- Filtros automáticos nas queries

## Mudanças Realizadas

### 1. Schema (`app/schema.prisma`)

#### Enum Criado
```prisma
enum CategoryType {
  SERVICE
  PRODUCT
  BOTH
}
```

#### Modelo Category Atualizado
```prisma
model Category {
  id          String       @id @default(uuid())
  salonId     String
  name        String
  description String?
  type        CategoryType @default(BOTH)  // ← NOVO
  active      Boolean      @default(true)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  deletedAt   DateTime?
  
  salon       Salon        @relation(fields: [salonId], references: [id])
  services    Service[]
  products    Product[]    // ← NOVO
  
  @@index([salonId])
  @@index([type])           // ← NOVO
  @@index([salonId, type])  // ← NOVO
  @@index([salonId, active])
}
```

#### ProductCategory Deprecado
- Modelo comentado no schema
- Será removido após validação completa

#### Product Atualizado
```prisma
model Product {
  category     Category?  @relation(fields: [categoryId], references: [id])  // Mudou de ProductCategory
  categoryId   String?
  // ... resto do modelo
}
```

### 2. Migração de Dados

Arquivo: `app/migrations/20251202000000_unify_categories/migration.sql`

**Estratégia de Migração:**
1. Cria enum `CategoryType`
2. Adiciona coluna `type` em `Category` com default `BOTH`
3. Insere registros de `ProductCategory` em `Category` preservando IDs
4. Define `type = 'PRODUCT'` para registros migrados
5. Define `type = 'SERVICE'` para registros existentes que só têm serviços
6. Cria índices de performance
7. Comenta DROP TABLE (para validação futura)

**Preservação de Dados:**
- IDs mantidos (Product.categoryId continua válido)
- Nenhum dado perdido
- Foreign keys não precisam ser atualizadas

### 3. Backend Operations

#### Inventory Operations (`app/src/inventory/operations.ts`)

**Mudanças em listProductCategories:**
```typescript
// ANTES
await context.entities.ProductCategory.findMany({ where, ... });

// DEPOIS
await context.entities.Category.findMany({
  where: {
    ...where,
    type: { in: ['PRODUCT', 'BOTH'] },  // ← Filtro por tipo
  },
  ...
});
```

**Mudanças em createProductCategory:**
```typescript
// ANTES
await context.entities.ProductCategory.create({
  data: { salonId, name, description }
});

// DEPOIS
await context.entities.Category.create({
  data: { salonId, name, description, type: 'PRODUCT' }  // ← Define tipo
});
```

**Mudanças em Validações (createProduct, updateProduct):**
```typescript
// ANTES
if (!category || category.salonId !== salonId || category.deletedAt) {
  throw new HttpError(400, 'Product category not found');
}

// DEPOIS
if (!category || category.salonId !== salonId || category.deletedAt || 
    !['PRODUCT', 'BOTH'].includes(category.type)) {  // ← Valida tipo
  throw new HttpError(400, 'Product category not found');
}
```

**Funções Atualizadas:**
- ✅ listProductCategories - filtro por tipo
- ✅ createProductCategory - define tipo PRODUCT
- ✅ updateProductCategory - usa Category
- ✅ deleteProductCategory - usa Category
- ✅ createProduct validação - valida tipo
- ✅ updateProduct validação - valida tipo

#### Service Operations

**categoryOperations.ts:**
```typescript
// listCategories - filtro por tipo SERVICE ou BOTH
await context.entities.Category.findMany({
  where: {
    ...where,
    type: { in: ['SERVICE', 'BOTH'] },
  },
  ...
});

// createCategory - define tipo SERVICE
await context.entities.Category.create({
  data: { ..., type: 'SERVICE' }
});
```

**operations.ts (validações):**
```typescript
// createService e updateService - valida tipo
if (!category || category.salonId !== salonId || category.deletedAt ||
    !['SERVICE', 'BOTH'].includes(category.type)) {
  throw new HttpError(400, 'Invalid category');
}
```

### 4. Wasp Configuration (`app/main.wasp`)

**Mudanças em Entities:**
```wasp
// ANTES
entities: [User, ProductCategory, ...]

// DEPOIS
entities: [User, Category, ...]  // ← Todas as referências atualizadas
```

**Queries/Actions Atualizadas:**
- ✅ listProducts
- ✅ getProduct
- ✅ getLowStockProducts
- ✅ listProductCategories
- ✅ createProduct
- ✅ updateProduct
- ✅ createProductCategory
- ✅ updateProductCategory
- ✅ deleteProductCategory

### 5. Logs

**Antes:**
```typescript
entity: 'ProductCategory'
```

**Depois:**
```typescript
entity: 'Category'
after: { name, type: 'PRODUCT' }  // Inclui tipo nos logs
```

## Compatibilidade

### Frontend
Os componentes React **não precisam de mudanças**:
- `ProductFormModal` - continua usando `listProductCategories`
- `ProductsListPage` - continua usando as mesmas queries
- Backend filtra automaticamente por tipo

### Queries
Mantivemos os nomes das funções:
- `listProductCategories()` - agora retorna Category com type IN ['PRODUCT', 'BOTH']
- `createProductCategory()` - agora cria Category com type='PRODUCT'
- Backward compatible com código existente

## Próximos Passos

### 1. Teste a Migração (OBRIGATÓRIO)
```bash
# Backup do banco
pg_dump glamo > backup_pre_migration.sql

# Execute a migração
cd app
prisma migrate dev --name unify_categories

# Valide os dados
prisma studio
# Verifique:
# - Contagem de registros na tabela Category
# - Tipos distribuídos corretamente (SERVICE, PRODUCT, BOTH)
# - Produtos ainda associados às categorias corretas
```

### 2. Validação Funcional
- [ ] Criar novo produto com categoria existente
- [ ] Criar novo serviço com categoria existente
- [ ] Criar nova categoria de produto (deve ter type=PRODUCT)
- [ ] Criar nova categoria de serviço (deve ter type=SERVICE)
- [ ] Listar produtos - categorias filtradas corretamente
- [ ] Listar serviços - categorias filtradas corretamente

### 3. Atualizar UI de Categorias (Futuro)
Atualizar `/categories` (CategoriesListPage) para:
- Exibir coluna "Tipo" (SERVICE, PRODUCT, BOTH)
- Permitir editar o tipo
- Filtrar por tipo
- Criar categorias com tipo BOTH (padrão)

### 4. Drop ProductCategory (Após Validação)
Quando tudo estiver validado:
```sql
-- Em uma nova migração
DROP TABLE "ProductCategory";
```

## Benefícios

1. **Redução de Duplicação**: Uma categoria para ambos os contextos
2. **UX Melhorada**: Usuário gerencia categorias em um só lugar
3. **Flexibilidade**: Categoria pode servir produtos, serviços ou ambos
4. **Manutenibilidade**: Menos código, menos bugs
5. **Performance**: Índices otimizados por tipo
6. **Consistência**: Mesma categoria em toda a aplicação

## Rollback

Se necessário, os dados de ProductCategory ainda existem na migration SQL (comentados). Para reverter:

1. Restaurar backup do banco
2. Reverter mudanças no schema.prisma
3. Reverter mudanças em operations.ts e main.wasp
4. Executar migração de rollback

## Arquivos Modificados

- ✅ `app/schema.prisma` - Enum, Category model, Product relation
- ✅ `app/migrations/20251202000000_unify_categories/migration.sql` - Script de migração
- ✅ `app/src/inventory/operations.ts` - 11 mudanças (queries, validações, logs)
- ✅ `app/src/services/categoryOperations.ts` - Filtros e tipo SERVICE
- ✅ `app/src/services/operations.ts` - Validações de categoria
- ✅ `app/main.wasp` - 9 entity references atualizadas

## Impacto

### Zero Breaking Changes no Frontend
- APIs mantêm mesmos nomes
- Payloads compatíveis
- Filtros aplicados no backend

### Breaking Changes no Backend
- `ProductCategory` entity não existe mais
- Usar `Category` com filtro de tipo
- Logs agora usam entity: 'Category'

## Autores
- Implementado em: 2024-12-02
- Por: GitHub Copilot + Desenvolvedor
