-- ============================================================================
-- Migration: RBAC Optimization - From RolePermission to Bitflags
-- ============================================================================
-- This migration converts the existing RBAC system from a normalized
-- RolePermission junction table to an optimized bitflag-based system.
--
-- IMPORTANT: This is a DATA migration, not a schema migration.
-- Run this AFTER running: wasp db migrate-dev
-- ============================================================================

-- Step 1: Add new columns to UserSalon (if not already added by Prisma)
ALTER TABLE "UserSalon" 
ADD COLUMN IF NOT EXISTS "roleTemplate" TEXT,
ADD COLUMN IF NOT EXISTS "primaryPermissions" BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS "secondaryPermissions" BIGINT DEFAULT 0;

-- Step 2: Create RoleTemplate table (if not already created by Prisma)
CREATE TABLE IF NOT EXISTS "RoleTemplate" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "name" TEXT UNIQUE NOT NULL,
  "displayName" TEXT NOT NULL,
  "description" TEXT,
  "isSystem" BOOLEAN DEFAULT true,
  "primaryPermissions" BIGINT NOT NULL,
  "secondaryPermissions" BIGINT NOT NULL
);

-- Step 3: Insert Role Templates with bitflags
-- These bitflags are calculated from the permission mapping
INSERT INTO "RoleTemplate" ("name", "displayName", "description", "isSystem", "primaryPermissions", "secondaryPermissions")
VALUES 
  -- Owner: ALL permissions
  (
    'owner',
    'Proprietário',
    'Acesso total ao sistema',
    true,
    9223372036854775807, -- All 63 bits set (max BigInt positive value)
    4095                  -- All 12 secondary bits set
  ),
  
  -- Manager: Most permissions except salon deletion
  (
    'manager',
    'Gerente',
    'Gerenciamento completo exceto configurações críticas',
    true,
    9151314442816847871, -- All except SALON_DELETE, EMPLOYEES_DELETE
    4095                  -- All secondary permissions
  ),
  
  -- Professional: Core operational permissions
  (
    'professional',
    'Profissional',
    'Atendimento de clientes e gerenciamento de agenda',
    true,
    70368760954880,      -- View/create clients, appointments, services, view sales
    1365                  -- View loyalty, referral, photos (manage), anamnesis, scheduling
  ),
  
  -- Cashier: Financial operations
  (
    'cashier',
    'Caixa',
    'Operações financeiras e vendas',
    true,
    8796093349888,       -- Sales, cash register, financial view
    0                     -- No advanced modules
  ),
  
  -- Assistant: Basic support
  (
    'assistant',
    'Assistente',
    'Suporte básico ao atendimento',
    true,
    549755879424,        -- View clients, appointments, services
    0                     -- No advanced modules
  ),
  
  -- Client: Read-only access
  (
    'client',
    'Cliente',
    'Acesso apenas para visualização',
    true,
    32,                  -- CLIENTS_VIEW only
    0                     -- No advanced modules
  )
ON CONFLICT ("name") DO NOTHING;

-- Step 4: Migrate existing UserSalon to use roleTemplate
-- This maps the old Role names to new RoleTemplate names
UPDATE "UserSalon" us
SET "roleTemplate" = (
  SELECT r."name"
  FROM "UserRole" ur
  JOIN "Role" r ON r."id" = ur."roleId"
  WHERE ur."userSalonId" = us."id"
  LIMIT 1
)
WHERE "roleTemplate" IS NULL;

-- Step 5: Handle users with multiple roles (take the most permissive)
-- Priority: owner > manager > professional > cashier > assistant > client
WITH role_priority AS (
  SELECT 
    us."id" as "userSalonId",
    CASE 
      WHEN bool_or(r."name" = 'owner') THEN 'owner'
      WHEN bool_or(r."name" = 'manager') THEN 'manager'
      WHEN bool_or(r."name" = 'professional') THEN 'professional'
      WHEN bool_or(r."name" = 'cashier') THEN 'cashier'
      WHEN bool_or(r."name" = 'assistant') THEN 'assistant'
      ELSE 'client'
    END as "bestRole"
  FROM "UserSalon" us
  JOIN "UserRole" ur ON ur."userSalonId" = us."id"
  JOIN "Role" r ON r."id" = ur."roleId"
  GROUP BY us."id"
)
UPDATE "UserSalon" us
SET "roleTemplate" = rp."bestRole"
FROM role_priority rp
WHERE us."id" = rp."userSalonId";

-- Step 6: Set default roleTemplate for any remaining users
UPDATE "UserSalon"
SET "roleTemplate" = 'client'
WHERE "roleTemplate" IS NULL;

-- Step 7: Make roleTemplate NOT NULL
ALTER TABLE "UserSalon"
ALTER COLUMN "roleTemplate" SET NOT NULL;

-- Step 8: Create index on roleTemplate
CREATE INDEX IF NOT EXISTS "UserSalon_roleTemplate_idx" ON "UserSalon"("roleTemplate");

-- ============================================================================
-- VERIFICATION QUERIES (Run these to verify the migration)
-- ============================================================================

-- Check RoleTemplate count (should be 6)
-- SELECT COUNT(*) FROM "RoleTemplate";

-- Check that all UserSalon have roleTemplate
-- SELECT COUNT(*) FROM "UserSalon" WHERE "roleTemplate" IS NULL;

-- Check distribution of roles
-- SELECT "roleTemplate", COUNT(*) FROM "UserSalon" GROUP BY "roleTemplate";

-- ============================================================================
-- CLEANUP (Run this ONLY after verifying everything works)
-- ============================================================================

-- IMPORTANT: Do NOT run this immediately!
-- Test the system thoroughly with the new bitflag system first.
-- Once confirmed working, you can drop the old tables:

-- DROP TABLE "UserRole" CASCADE;
-- DROP TABLE "RolePermission" CASCADE;
-- DROP TABLE "Permission" CASCADE;
-- DROP TABLE "Role" CASCADE;

-- ============================================================================
-- ROLLBACK PLAN
-- ============================================================================

-- If something goes wrong, you can rollback by:
-- 1. Restore from backup
-- 2. Or manually recreate the old associations from the roleTemplate field

-- Example rollback query (adjust as needed):
-- INSERT INTO "Role" ("salonId", "name")
-- SELECT DISTINCT us."salonId", us."roleTemplate"
-- FROM "UserSalon" us
-- ON CONFLICT DO NOTHING;

-- INSERT INTO "UserRole" ("userSalonId", "roleId")
-- SELECT us."id", r."id"
-- FROM "UserSalon" us
-- JOIN "Role" r ON r."name" = us."roleTemplate" AND r."salonId" = us."salonId";
