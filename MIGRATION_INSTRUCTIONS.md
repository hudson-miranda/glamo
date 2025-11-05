# 🗄️ Instruções para Migration do Banco de Dados

## 📋 O que foi alterado no Schema

O arquivo `app/schema.prisma` foi modificado para incluir:

### 1. Novo Enum: `InviteStatus`
```prisma
enum InviteStatus {
  PENDING
  ACCEPTED
  REJECTED
  EXPIRED
}
```

### 2. Novo Model: `SalonInvite`
```prisma
model SalonInvite {
  id          String       @id @default(uuid())
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  salonId     String
  email       String
  roleId      String
  invitedBy   String
  status      InviteStatus @default(PENDING)
  expiresAt   DateTime
  acceptedAt  DateTime?
  rejectedAt  DateTime?
  
  salon    Salon @relation("InvitesSent", fields: [salonId], references: [id], onDelete: Cascade)
  role     Role  @relation(fields: [roleId], references: [id], onDelete: Cascade)
  inviter  User  @relation(fields: [invitedBy], references: [id], onDelete: Cascade)
  
  @@unique([salonId, email])
  @@index([email])
  @@index([status])
}
```

### 3. Relações Adicionadas:
- **User model:** `sentInvites SalonInvite[]`
- **Salon model:** `invitesSent SalonInvite[] @relation("InvitesSent")`
- **Role model:** `invites SalonInvite[]`

---

## ⚙️ Como Executar a Migration

### Passo 1: Navegue até a pasta do app

```bash
cd app
```

### Passo 2: Execute o comando de migration

```bash
wasp db migrate-dev
```

### Passo 3: Quando o Wasp perguntar o nome da migration

Digite:
```
add_salon_invites
```

### Passo 4: Aguarde a migration completar

O Wasp irá:
1. Analisar as mudanças no schema
2. Gerar o arquivo SQL de migration
3. Aplicar a migration no banco de dados
4. Gerar os tipos TypeScript atualizados

---

## ✅ Output Esperado

Você deve ver algo como:

```
🐝 --- Running database migration generator...

Prisma schema loaded from schema.prisma

✔ Enter a name for the new migration: · add_salon_invites

Applying migration `20251104XXXXXX_add_salon_invites`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20251104XXXXXX_add_salon_invites/
    └─ migration.sql

✔ Generated Prisma Client (5.x.x) to ./node_modules/@prisma/client

Everything is now in sync.
```

---

## 🗂️ Arquivo de Migration Gerado

Um novo arquivo SQL será criado em:
```
app/migrations/20251104XXXXXX_add_salon_invites/migration.sql
```

Ele conterá comandos SQL como:

```sql
-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateTable
CREATE TABLE "SalonInvite" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "salonId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "invitedBy" TEXT NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),

    CONSTRAINT "SalonInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SalonInvite_email_idx" ON "SalonInvite"("email");

-- CreateIndex
CREATE INDEX "SalonInvite_status_idx" ON "SalonInvite"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SalonInvite_salonId_email_key" ON "SalonInvite"("salonId", "email");

-- AddForeignKey
ALTER TABLE "SalonInvite" ADD CONSTRAINT "SalonInvite_salonId_fkey" 
    FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalonInvite" ADD CONSTRAINT "SalonInvite_roleId_fkey" 
    FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalonInvite" ADD CONSTRAINT "SalonInvite_invitedBy_fkey" 
    FOREIGN KEY ("invitedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

---

## ⚠️ Possíveis Problemas e Soluções

### Problema 1: "Migration failed - table already exists"

**Causa:** Você já tinha uma tabela `SalonInvite` de tentativa anterior.

**Solução 1 (Desenvolvimento - Sem Dados Importantes):**
```bash
wasp db reset
wasp db migrate-dev
```
⚠️ **ATENÇÃO:** Isso apagará TODOS os dados do banco!

**Solução 2 (Desenvolvimento - Preservar Dados):**
```bash
wasp db studio
# Abra o Prisma Studio e delete manualmente a tabela SalonInvite
# Depois execute:
wasp db migrate-dev
```

---

### Problema 2: "Error: P1001 - Can't reach database server"

**Causa:** Banco de dados não está rodando.

**Solução:**
```bash
# Certifique-se que está na pasta app
cd app

# Inicie o Wasp (ele starta o DB automaticamente)
wasp start
```

Abra outro terminal e rode:
```bash
cd app
wasp db migrate-dev
```

---

### Problema 3: "Error: P3009 - migrate found failed migrations"

**Causa:** Migration anterior falhou e está em estado inconsistente.

**Solução:**
```bash
# Ver detalhes da migration falhada
wasp db migrate status

# Resetar migrations (CUIDADO: apaga dados)
wasp db reset

# Rodar migration novamente
wasp db migrate-dev
```

---

### Problema 4: "Error: Foreign key constraint fails"

**Causa:** Dados existentes conflitam com novas constraints.

**Solução (Desenvolvimento):**
```bash
# Resetar banco
wasp db reset

# Rodar seeds novamente
wasp db seed

# Rodar migration
wasp db migrate-dev
```

---

## 🔍 Verificar se Migration Funcionou

### Opção 1: Usar Prisma Studio

```bash
cd app
wasp db studio
```

Isso abre interface visual. Verifique:
- ✅ Tabela `SalonInvite` existe
- ✅ Enum `InviteStatus` existe
- ✅ Relações com `Salon`, `User` e `Role` estão criadas

### Opção 2: Via SQL direto

```bash
cd app
wasp db execute "SELECT * FROM pg_tables WHERE tablename = 'SalonInvite';"
```

Deve retornar 1 linha se tabela existe.

---

## 🎯 Checklist Pós-Migration

Depois que a migration rodar com sucesso:

- [ ] Nenhum erro apareceu no terminal
- [ ] Arquivo migration.sql foi criado em `app/migrations/`
- [ ] Tabela `SalonInvite` existe no banco
- [ ] Enum `InviteStatus` foi criado
- [ ] Prisma Client foi regenerado
- [ ] Você pode ver a tabela no `wasp db studio`

---

## ✅ Próximo Passo

Após a migration rodar com sucesso:

1. ✅ Migration executada
2. 🧪 Iniciar testes (veja `ONBOARDING_TESTS_GUIDE.md`)
3. 🚀 Se testes passarem, sistema está pronto!

---

## 📝 Notas Importantes

1. **Desenvolvimento vs Produção:**
   - Em desenvolvimento: pode usar `wasp db reset` tranquilamente
   - Em produção: NUNCA use `reset`, crie migrations incrementais

2. **Backup:**
   - Antes de qualquer migration em produção, faça backup do banco

3. **Seeds:**
   - Após `wasp db reset`, rode `wasp db seed` para recriar dados iniciais

4. **Conflitos de Migration:**
   - Se trabalhar em equipe, sempre puxe últimas migrations antes de criar novas
   - Use `wasp db migrate resolve` para resolver conflitos

---

## 🆘 Se Precisar de Ajuda

Se encontrar erro que não está listado aqui:

1. Copie a mensagem de erro completa
2. Copie o conteúdo do terminal
3. Me avise e eu te ajudo a resolver! 🚀
