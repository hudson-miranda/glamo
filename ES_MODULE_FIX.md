# Correção - Erro de ES Module no seed.ts

## Problema

Ao executar `wasp start`, o servidor crashava com erro:

```
ReferenceError: require is not defined in ES module scope
```

**Causa:** O arquivo `rbac/seed.ts` continha código CommonJS (`require.main`) em um ambiente ES Module.

---

## Correções Aplicadas

### 1. ✅ Removido bloco CommonJS

**Arquivo:** `app/src/rbac/seed.ts`

**Removido:**
```typescript
if (require.main === module) {
  seedRbacPermissionsAndRoles()
    .then(() => { ... })
    .catch(() => { ... })
    .finally(() => { ... });
}
```

Esse bloco era para executar o seed standalone, mas não é compatível com ES modules.

---

### 2. ✅ Refatorado função `seedRbacPermissionsAndRoles`

Agora cria sua própria instância do Prisma e faz disconnect:

```typescript
export async function seedRbacPermissionsAndRoles() {
  const prisma = new PrismaClient();
  
  try {
    // ... seed logic
  } catch (error) {
    console.error('❌ Error seeding RBAC:', error);
    throw error;
  } finally {
    await prisma.$disconnect();  // ✅ cleanup
  }
}
```

---

### 3. ✅ Refatorado `createDefaultRolesForSalon`

Agora aceita `entities` opcional (do Wasp context):

```typescript
export async function createDefaultRolesForSalon(
  salonId: string, 
  entities?: any  // ✅ novo parâmetro
) {
  const db = entities || new PrismaClient();
  const shouldDisconnect = !entities;
  
  try {
    // Usa db.Role (entities) ou db.role (prisma) dinamicamente
    const role = await (entities ? db.Role : db.role).upsert({ ... });
    // ...
  } finally {
    if (shouldDisconnect && !entities) {
      await (db as PrismaClient).$disconnect();
    }
  }
}
```

**Comportamento:**
- Se chamada **COM** `entities` (de operações Wasp): usa context.entities
- Se chamada **SEM** `entities` (standalone): cria PrismaClient próprio

---

### 4. ✅ Refatorado `assignOwnerRole`

Mesma lógica que `createDefaultRolesForSalon`:

```typescript
export async function assignOwnerRole(
  userId: string, 
  salonId: string, 
  entities?: any  // ✅ novo parâmetro
) {
  const db = entities || new PrismaClient();
  const shouldDisconnect = !entities;
  
  try {
    // Usa db.UserSalon (entities) ou db.userSalon (prisma)
    const userSalon = await (entities ? db.UserSalon : db.userSalon).upsert({ ... });
    // ...
  } finally {
    if (shouldDisconnect && !entities) {
      await (db as PrismaClient).$disconnect();
    }
  }
}
```

---

### 5. ✅ Atualizado `salon/operations.ts`

Agora passa `context.entities` para as funções:

```typescript
// Create default roles for this salon
await createDefaultRolesForSalon(salon.id, context.entities);  // ✅

// Assign owner role to user
await assignOwnerRole(context.user.id, salon.id, context.entities);  // ✅
```

---

## Arquivos Modificados

1. ✅ `app/src/rbac/seed.ts`
   - Removido bloco `if (require.main === module)`
   - Adicionado parâmetro `entities?` em funções
   - Adicionada lógica dual (entities vs prisma)
   - Adicionado cleanup (`$disconnect`) em `finally`

2. ✅ `app/src/salon/operations.ts`
   - Atualizado chamadas para passar `context.entities`

---

## Por Que Funciona Agora

1. **Seed standalone** (`wasp db seed`):
   - Chama `seedRbacPermissionsAndRoles()` sem parâmetros
   - Função cria PrismaClient próprio
   - Faz disconnect ao terminar

2. **Operações Wasp** (`createSalon`):
   - Chamam `createDefaultRolesForSalon(salonId, context.entities)`
   - Funções usam `context.entities` do Wasp
   - Wasp gerencia conexão automaticamente

3. **Compatibilidade ES Module**:
   - Não usa mais `require.main`
   - Apenas imports ES6
   - Compatível com `"type": "module"` do package.json

---

## Próximo Passo

Execute novamente:

```bash
cd app
wasp start
```

O servidor deve iniciar sem erros agora! ✅

Depois tente criar novo usuário para testar o fluxo de signup. 🚀
