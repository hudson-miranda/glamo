# Próximos Passos - Unificação de Categorias

## ✅ Completado

1. **Schema Atualizado**
   - Enum `CategoryType` criado (SERVICE, PRODUCT, BOTH)
   - Modelo `Category` atualizado com campo `type`
   - `ProductCategory` deprecado
   - Relação `Product.category` atualizada

2. **Migração SQL Criada**
   - Preserva todos os IDs existentes
   - Migra dados de ProductCategory → Category
   - Define tipos corretamente
   - Cria índices de performance

3. **Backend Operations Atualizadas**
   - Inventory operations com filtro por tipo PRODUCT/BOTH
   - Service operations com filtro por tipo SERVICE/BOTH
   - Todas as validações incluem verificação de tipo
   - Logs atualizados para entity 'Category'

4. **Wasp Config Atualizado**
   - Todas as referências ProductCategory → Category
   - 9 queries/actions atualizadas

5. **Git Commit & Push**
   - Commit criado com descrição detalhada
   - Enviado para GitHub

## 🔄 Pendente - IMPORTANTE

### 1. Executar Migração do Prisma

**ANTES DE EXECUTAR, FAÇA BACKUP DO BANCO!**

```bash
# Navegue até a pasta do app
cd d:\emtwo\glamo\Glamo\app

# Execute a migração
npx prisma migrate dev --name unify_categories

# Ou se estiver usando wasp (quando disponível)
wasp db migrate-dev --name unify_categories
```

### 2. Validar Dados Após Migração

Abra o Prisma Studio e verifique:

```bash
npx prisma studio
```

**Checklist de Validação:**
- [ ] Tabela `Category` tem coluna `type`
- [ ] Registros de produtos têm `type = 'PRODUCT'`
- [ ] Registros de serviços têm `type = 'SERVICE'`
- [ ] Contagem total de categorias está correta
- [ ] Produtos ainda estão associados às categorias corretas
- [ ] Nenhum dado foi perdido

### 3. Atualizar UI de Categorias (CategoriesListPage)

**Arquivo:** `app/src/client/modules/services/CategoriesListPage.tsx`

**Mudanças Necessárias:**

1. Adicionar coluna "Tipo" na tabela:
```tsx
<TableHeader>
  <TableRow>
    <TableHead>Nome</TableHead>
    <TableHead>Tipo</TableHead>  {/* ← NOVO */}
    <TableHead>Descrição</TableHead>
    <TableHead>Serviços</TableHead>
    <TableHead>Status</TableHead>
    <TableHead>Ações</TableHead>
  </TableRow>
</TableHeader>
```

2. Adicionar badge de tipo:
```tsx
<TableCell>
  <Badge variant={
    category.type === 'SERVICE' ? 'default' :
    category.type === 'PRODUCT' ? 'secondary' :
    'outline'
  }>
    {category.type === 'SERVICE' ? 'Serviço' :
     category.type === 'PRODUCT' ? 'Produto' :
     'Ambos'}
  </Badge>
</TableCell>
```

3. Adicionar seletor de tipo no modal de criação/edição:
```tsx
<div className="space-y-2">
  <Label>Tipo</Label>
  <Select
    value={formData.type}
    onValueChange={(value) => setFormData({ ...formData, type: value })}
  >
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="SERVICE">Serviço</SelectItem>
      <SelectItem value="PRODUCT">Produto</SelectItem>
      <SelectItem value="BOTH">Ambos</SelectItem>
    </SelectContent>
  </Select>
</div>
```

4. Adicionar filtro por tipo:
```tsx
const [typeFilter, setTypeFilter] = useState<string>('all');

// No filtro
const filteredCategories = categories.filter(cat => {
  if (typeFilter !== 'all' && cat.type !== typeFilter) return false;
  // ... outros filtros
  return true;
});

// Dropdown de filtro
<Select value={typeFilter} onValueChange={setTypeFilter}>
  <SelectItem value="all">Todos os Tipos</SelectItem>
  <SelectItem value="SERVICE">Serviços</SelectItem>
  <SelectItem value="PRODUCT">Produtos</SelectItem>
  <SelectItem value="BOTH">Ambos</SelectItem>
</Select>
```

### 4. Teste Funcional Completo

**Teste de Produtos:**
- [ ] Listar produtos → categorias devem aparecer (type: PRODUCT ou BOTH)
- [ ] Criar produto com categoria existente
- [ ] Criar nova categoria de produto via quick create
- [ ] Verificar que nova categoria tem `type = 'PRODUCT'`
- [ ] Editar produto e trocar categoria

**Teste de Serviços:**
- [ ] Listar serviços → categorias devem aparecer (type: SERVICE ou BOTH)
- [ ] Criar serviço com categoria existente
- [ ] Criar nova categoria de serviço
- [ ] Verificar que nova categoria tem `type = 'SERVICE'`

**Teste de Categorias:**
- [ ] Acessar `/categories`
- [ ] Listar todas as categorias (deve mostrar todas)
- [ ] Criar categoria com tipo BOTH
- [ ] Verificar que aparece em produtos E serviços
- [ ] Editar categoria e mudar tipo
- [ ] Deletar categoria (validar que não pode se tiver produtos/serviços)

### 5. Limpeza Final (Após Validação)

Quando tudo estiver funcionando perfeitamente:

1. **Remover ProductCategory do Prisma:**

Criar nova migração:
```sql
-- migration.sql
DROP TABLE IF EXISTS "ProductCategory";
```

2. **Limpar código comentado:**
- Remover modelo ProductCategory comentado do schema.prisma
- Atualizar documentação

## 🚨 Troubleshooting

### Erro: Cannot find module 'wasp/client/operations'

**Solução:** Recompilar o Wasp para gerar os tipos atualizados
```bash
wasp clean
wasp start
```

### Erro: Migration failed

**Solução:** Verificar se há foreign keys que impedem a migração
```sql
-- Ver constraints
SELECT constraint_name, table_name 
FROM information_schema.table_constraints 
WHERE table_name = 'ProductCategory';

-- Se necessário, dropar constraint temporariamente
```

### Categorias não aparecem

**Solução:** Verificar filtro de tipo nas queries
```typescript
// Deve ter:
where: {
  ...where,
  type: { in: ['PRODUCT', 'BOTH'] }  // ou ['SERVICE', 'BOTH']
}
```

## 📊 Validação de Dados SQL

Execute estas queries após a migração:

```sql
-- Total de categorias por tipo
SELECT type, COUNT(*) as count
FROM "Category"
GROUP BY type;

-- Categorias de produtos (deve ter todas as antigas de ProductCategory)
SELECT COUNT(*) FROM "Category" WHERE type IN ('PRODUCT', 'BOTH');

-- Categorias de serviços
SELECT COUNT(*) FROM "Category" WHERE type IN ('SERVICE', 'BOTH');

-- Produtos sem categoria válida (deve ser 0)
SELECT p.id, p.name, p."categoryId"
FROM "Product" p
LEFT JOIN "Category" c ON p."categoryId" = c.id
WHERE p."categoryId" IS NOT NULL 
  AND (c.id IS NULL OR c.type NOT IN ('PRODUCT', 'BOTH'));

-- Serviços sem categoria válida (deve ser 0)
SELECT s.id, s.name, s."categoryId"
FROM "Service" s
LEFT JOIN "Category" c ON s."categoryId" = c.id
WHERE s."categoryId" IS NOT NULL 
  AND (c.id IS NULL OR c.type NOT IN ('SERVICE', 'BOTH'));
```

## 📝 Benefícios Esperados

Após implementação completa:

1. ✅ **Redução de duplicação** - 1 categoria ao invés de 2
2. ✅ **UX melhorada** - Gerenciar categorias em um único lugar
3. ✅ **Flexibilidade** - Categorias podem servir produtos, serviços ou ambos
4. ✅ **Consistência** - Mesma categoria em toda aplicação
5. ✅ **Manutenção** - Menos código, menos bugs

## 🎯 Prioridade das Tarefas

1. **P0 - CRÍTICO**: Executar migração e validar dados
2. **P1 - ALTA**: Atualizar UI de categorias (CategoriesListPage)
3. **P2 - MÉDIA**: Testes funcionais completos
4. **P3 - BAIXA**: Limpeza e documentação final

---

**Tempo estimado:** 2-4 horas de trabalho
**Risco:** Baixo (dados preservados, rollback possível)
**Impacto:** Alto (melhoria significativa de UX e arquitetura)
