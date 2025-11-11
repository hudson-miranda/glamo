/*
  Warnings:

  - Added the required column `roleTemplate` to the `SalonInvite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roleTemplate` to the `UserSalon` table without a default value. This is not possible if the table is not empty.

*/
-- Step 1: Create RoleTemplate table first
CREATE TABLE "RoleTemplate" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT true,
    "primaryPermissions" BIGINT NOT NULL,
    "secondaryPermissions" BIGINT NOT NULL,

    CONSTRAINT "RoleTemplate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RoleTemplate_name_key" ON "RoleTemplate"("name");
CREATE INDEX "RoleTemplate_isSystem_idx" ON "RoleTemplate"("isSystem");

-- Step 2: Insert RoleTemplates (from seed data)
-- Note: primaryPermissions uses (2^58 - 1) = 288230376151711743 for all 58 primary permissions
-- secondaryPermissions uses (2^12 - 1) = 4095 for all 12 secondary permissions
INSERT INTO "RoleTemplate" ("id", "name", "displayName", "description", "isSystem", "primaryPermissions", "secondaryPermissions", "createdAt", "updatedAt")
VALUES
  ('owner-template', 'owner', 'Proprietário', 'Acesso total ao sistema', true, 288230376151711743, 4095, NOW(), NOW()),
  ('manager-template', 'manager', 'Gerente', 'Acesso administrativo completo', true, 288230376151711743, 4095, NOW(), NOW()),
  ('professional-template', 'professional', 'Profissional', 'Acesso operacional', true, 288230376151711743, 4095, NOW(), NOW()),
  ('cashier-template', 'cashier', 'Caixa', 'Acesso financeiro e vendas', true, 1099511627775, 0, NOW(), NOW()),
  ('assistant-template', 'assistant', 'Assistente', 'Acesso somente leitura', true, 72057594037927935, 0, NOW(), NOW()),
  ('client-template', 'client', 'Cliente', 'Acesso de cliente', true, 35184372088832, 0, NOW(), NOW());

-- Step 3: DropForeignKey
ALTER TABLE "SalonInvite" DROP CONSTRAINT "SalonInvite_roleId_fkey";

-- Step 4: Add columns with default values
ALTER TABLE "SalonInvite" 
  ADD COLUMN "roleTemplate" TEXT NOT NULL DEFAULT 'professional',
  ALTER COLUMN "roleId" DROP NOT NULL;

ALTER TABLE "UserSalon" 
  ADD COLUMN "primaryPermissions" BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN "roleTemplate" TEXT NOT NULL DEFAULT 'owner',
  ADD COLUMN "secondaryPermissions" BIGINT NOT NULL DEFAULT 0;

-- Step 5: Populate roleTemplate from existing data
-- SIMPLIFIED: For development, all existing UserSalon get 'owner' (already set as default)
-- SIMPLIFIED: For SalonInvite, keep 'professional' (already set as default)
-- In production, you would migrate from UserRole/Role tables here

-- Step 6: Calculate and set permission bitflags based on roleTemplate
UPDATE "UserSalon" us
SET 
  "primaryPermissions" = rt."primaryPermissions",
  "secondaryPermissions" = rt."secondaryPermissions"
FROM "RoleTemplate" rt
WHERE us."roleTemplate" = rt.name;

-- Step 7: Remove default values (make columns truly required)
ALTER TABLE "SalonInvite" ALTER COLUMN "roleTemplate" DROP DEFAULT;
ALTER TABLE "UserSalon" ALTER COLUMN "roleTemplate" DROP DEFAULT;

-- Step 8: Create indexes
CREATE INDEX "UserSalon_roleTemplate_idx" ON "UserSalon"("roleTemplate");

-- AddForeignKey
ALTER TABLE "SalonInvite" ADD CONSTRAINT "SalonInvite_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;
