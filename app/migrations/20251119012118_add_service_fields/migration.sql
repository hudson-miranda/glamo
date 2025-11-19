-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "allowOnlineBooking" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "depositAmount" DOUBLE PRECISION,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "instructions" TEXT,
ADD COLUMN     "requiresDeposit" BOOLEAN NOT NULL DEFAULT false;
