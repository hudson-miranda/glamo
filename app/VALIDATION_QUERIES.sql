-- Validação da Migração de Categorias Unificadas
-- Execute estas queries no Prisma Studio ou psql para validar os dados

-- 1. Verificar se a coluna 'type' foi adicionada
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'Category' 
  AND column_name = 'type';

-- 2. Contagem de categorias por tipo
SELECT 
    type,
    COUNT(*) as total,
    COUNT(CASE WHEN active = true THEN 1 END) as ativas,
    COUNT(CASE WHEN active = false THEN 1 END) as inativas,
    COUNT(CASE WHEN "deletedAt" IS NOT NULL THEN 1 END) as deletadas
FROM "Category"
GROUP BY type
ORDER BY type;

-- 3. Verificar se há produtos vinculados a categorias
SELECT 
    c.type,
    c.name as categoria,
    COUNT(p.id) as total_produtos
FROM "Category" c
LEFT JOIN "Product" p ON p."categoryId" = c.id
WHERE c.type IN ('PRODUCT', 'BOTH')
GROUP BY c.id, c.type, c.name
HAVING COUNT(p.id) > 0
ORDER BY COUNT(p.id) DESC;

-- 4. Verificar se há serviços vinculados a categorias
SELECT 
    c.type,
    c.name as categoria,
    COUNT(s.id) as total_servicos
FROM "Category" c
LEFT JOIN "Service" s ON s."categoryId" = c.id
WHERE c.type IN ('SERVICE', 'BOTH')
GROUP BY c.id, c.type, c.name
HAVING COUNT(s.id) > 0
ORDER BY COUNT(s.id) DESC;

-- 5. Verificar produtos com categorias inválidas (NÃO DEVE RETORNAR NADA)
SELECT 
    p.id as produto_id,
    p.name as produto_nome,
    p."categoryId",
    c.type as categoria_tipo
FROM "Product" p
LEFT JOIN "Category" c ON p."categoryId" = c.id
WHERE p."categoryId" IS NOT NULL 
  AND (c.id IS NULL OR c.type NOT IN ('PRODUCT', 'BOTH'));

-- 6. Verificar serviços com categorias inválidas (NÃO DEVE RETORNAR NADA)
SELECT 
    s.id as servico_id,
    s.name as servico_nome,
    s."categoryId",
    c.type as categoria_tipo
FROM "Service" s
LEFT JOIN "Category" c ON s."categoryId" = c.id
WHERE s."categoryId" IS NOT NULL 
  AND (c.id IS NULL OR c.type NOT IN ('SERVICE', 'BOTH'));

-- 7. Verificar se a tabela ProductCategory ainda existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'ProductCategory'
) as product_category_exists;

-- 8. Listar todas as categorias com suas associações
SELECT 
    c.id,
    c.name,
    c.type,
    c.active,
    c."salonId",
    COUNT(DISTINCT s.id) as total_servicos,
    COUNT(DISTINCT p.id) as total_produtos
FROM "Category" c
LEFT JOIN "Service" s ON s."categoryId" = c.id AND s."deletedAt" IS NULL
LEFT JOIN "Product" p ON p."categoryId" = c.id AND p."deletedAt" IS NULL
WHERE c."deletedAt" IS NULL
GROUP BY c.id, c.name, c.type, c.active, c."salonId"
ORDER BY c.type, c.name;

-- 9. Verificar índices criados na tabela Category
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'Category'
ORDER BY indexname;

-- 10. Estatísticas gerais
SELECT 
    'Total de Categorias' as metrica,
    COUNT(*) as valor
FROM "Category"
WHERE "deletedAt" IS NULL

UNION ALL

SELECT 
    'Categorias SERVICE',
    COUNT(*)
FROM "Category"
WHERE type = 'SERVICE' AND "deletedAt" IS NULL

UNION ALL

SELECT 
    'Categorias PRODUCT',
    COUNT(*)
FROM "Category"
WHERE type = 'PRODUCT' AND "deletedAt" IS NULL

UNION ALL

SELECT 
    'Categorias BOTH',
    COUNT(*)
FROM "Category"
WHERE type = 'BOTH' AND "deletedAt" IS NULL

UNION ALL

SELECT 
    'Total de Produtos',
    COUNT(*)
FROM "Product"
WHERE "deletedAt" IS NULL

UNION ALL

SELECT 
    'Produtos com Categoria',
    COUNT(*)
FROM "Product"
WHERE "categoryId" IS NOT NULL AND "deletedAt" IS NULL

UNION ALL

SELECT 
    'Total de Serviços',
    COUNT(*)
FROM "Service"
WHERE "deletedAt" IS NULL

UNION ALL

SELECT 
    'Serviços com Categoria',
    COUNT(*)
FROM "Service"
WHERE "categoryId" IS NOT NULL AND "deletedAt" IS NULL;
