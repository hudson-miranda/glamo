-- CreateEnum: CategoryType
CREATE TYPE "CategoryType" AS ENUM ('SERVICE', 'PRODUCT', 'BOTH');

-- AlterTable: Add type column to Category with default BOTH
ALTER TABLE "Category" ADD COLUMN "type" "CategoryType" NOT NULL DEFAULT 'BOTH';

-- AlterTable: Add products relation to Category
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "products" TEXT[];

-- Step 1: Migrate data from ProductCategory to Category
-- Insert ProductCategory records into Category if they don't exist
INSERT INTO "Category" (id, "createdAt", "updatedAt", "salonId", name, description, type, active, "deletedAt")
SELECT 
  id,
  "createdAt",
  "updatedAt",
  "salonId",
  name,
  description,
  'PRODUCT'::"CategoryType" as type,
  true as active,
  "deletedAt"
FROM "ProductCategory"
ON CONFLICT (id) DO NOTHING;

-- Step 2: Update existing Category records to type SERVICE if they only have services
UPDATE "Category"
SET type = 'SERVICE'::"CategoryType"
WHERE type = 'BOTH'::"CategoryType"
  AND id IN (
    SELECT DISTINCT "categoryId"
    FROM "Service"
    WHERE "categoryId" IS NOT NULL
  )
  AND id NOT IN (
    SELECT id FROM "ProductCategory"
  );

-- Step 3: Update Product.categoryId to point to unified Category
-- Products already reference the correct ID since we preserved IDs from ProductCategory

-- Step 4: Drop ProductCategory table (after confirming data migration)
-- Note: This will be done after validation
-- DROP TABLE IF EXISTS "ProductCategory";

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "Category_type_idx" ON "Category"("type");
CREATE INDEX IF NOT EXISTS "Category_salonId_type_idx" ON "Category"("salonId", "type");
CREATE INDEX IF NOT EXISTS "Category_salonId_active_idx" ON "Category"("salonId", "active");
