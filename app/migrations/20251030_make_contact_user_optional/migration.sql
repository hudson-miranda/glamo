-- CreateEnum
CREATE TYPE "ContactMessageStatus" AS ENUM ('NEW', 'READ', 'REPLIED', 'ARCHIVED');

-- AlterTable: Make userId optional and add new fields
ALTER TABLE "ContactFormMessage" 
  DROP CONSTRAINT IF EXISTS "ContactFormMessage_userId_fkey",
  ALTER COLUMN "userId" DROP NOT NULL,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "name" TEXT,
  ADD COLUMN "email" TEXT,
  ADD COLUMN "message" TEXT,
  ADD COLUMN "status" "ContactMessageStatus" NOT NULL DEFAULT 'NEW';

-- Data migration: Move content to message field for existing records
UPDATE "ContactFormMessage" SET 
  "message" = COALESCE("content", ''),
  "name" = COALESCE((SELECT "name" FROM "User" WHERE "User"."id" = "ContactFormMessage"."userId"), 'Unknown'),
  "email" = COALESCE((SELECT "email" FROM "User" WHERE "User"."id" = "ContactFormMessage"."userId"), 'unknown@example.com')
WHERE "message" IS NULL;

-- Make name, email, message NOT NULL after data migration
ALTER TABLE "ContactFormMessage"
  ALTER COLUMN "name" SET NOT NULL,
  ALTER COLUMN "email" SET NOT NULL,
  ALTER COLUMN "message" SET NOT NULL;

-- Drop old columns
ALTER TABLE "ContactFormMessage"
  DROP COLUMN IF EXISTS "content",
  DROP COLUMN IF EXISTS "isRead",
  DROP COLUMN IF EXISTS "repliedAt";

-- Re-add foreign key constraint with onDelete: SetNull
ALTER TABLE "ContactFormMessage" ADD CONSTRAINT "ContactFormMessage_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "ContactFormMessage_status_idx" ON "ContactFormMessage"("status");

-- CreateIndex
CREATE INDEX "ContactFormMessage_createdAt_idx" ON "ContactFormMessage"("createdAt");
