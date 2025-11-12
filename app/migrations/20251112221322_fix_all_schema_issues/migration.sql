/*
  Warnings:

  - You are about to drop the column `roleId` on the `SalonInvite` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[bookingSlug]` on the table `BookingConfig` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripePaymentIntentId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeCheckoutId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "DepositType" AS ENUM ('FIXED', 'PERCENTAGE');

-- CreateEnum
CREATE TYPE "FeeType" AS ENUM ('FIXED', 'PERCENTAGE');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('FULL', 'DEPOSIT', 'REMAINING');

-- CreateEnum
CREATE TYPE "FinancialCategoryType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'PARTIALLY_PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BudgetStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'CANCELLED';

-- DropForeignKey
ALTER TABLE "SalonInvite" DROP CONSTRAINT "SalonInvite_roleId_fkey";

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "remainingAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "requiresPayment" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "totalPaid" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "BookingConfig" ADD COLUMN     "acceptFullPayment" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "acceptOnlineDeposit" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "allowCancellation" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "autoApproveBookings" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "bookingPageBanner" TEXT,
ADD COLUMN     "bookingPageDescription" TEXT,
ADD COLUMN     "bookingPageLogo" TEXT,
ADD COLUMN     "bookingPagePrimaryColor" TEXT NOT NULL DEFAULT '#00FF94',
ADD COLUMN     "bookingPageTheme" TEXT NOT NULL DEFAULT 'dark',
ADD COLUMN     "bookingPageTitle" TEXT,
ADD COLUMN     "bookingSlug" TEXT,
ADD COLUMN     "bookingTermsText" TEXT,
ADD COLUMN     "cancellationDeadlineHours" INTEGER NOT NULL DEFAULT 24,
ADD COLUMN     "cancellationFeeAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "cancellationFeeType" "FeeType" DEFAULT 'PERCENTAGE',
ADD COLUMN     "collectClientEmail" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "collectClientNotes" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "collectClientPhone" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "depositAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "depositType" "DepositType" NOT NULL DEFAULT 'PERCENTAGE',
ADD COLUMN     "enableOnlineBooking" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "enableProfessionalChoice" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "enableServiceSelection" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "minDepositAmount" DOUBLE PRECISION NOT NULL DEFAULT 10,
ADD COLUMN     "refundDeposit" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "requireClientRegistration" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requireOnlinePayment" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requireTermsAcceptance" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sendConfirmationEmail" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sendConfirmationSMS" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showProfessionalPhotos" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showServicePrices" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "acceptsOnlineBooking" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "profilePhoto" TEXT,
ADD COLUMN     "role" TEXT,
ADD COLUMN     "specialties" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "appointmentId" TEXT,
ADD COLUMN     "depositAmount" DOUBLE PRECISION,
ADD COLUMN     "isRefunded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "refundAmount" DOUBLE PRECISION,
ADD COLUMN     "refundReason" TEXT,
ADD COLUMN     "refundedAt" TIMESTAMP(3),
ADD COLUMN     "remainingAmount" DOUBLE PRECISION,
ADD COLUMN     "stripeCheckoutId" TEXT,
ADD COLUMN     "stripePaymentIntentId" TEXT,
ADD COLUMN     "type" "PaymentType" NOT NULL DEFAULT 'FULL',
ALTER COLUMN "saleId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SalonInvite" DROP COLUMN "roleId";

-- CreateTable
CREATE TABLE "FinancialCategory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "salonId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "FinancialCategoryType" NOT NULL,
    "parentId" TEXT,
    "color" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "FinancialCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountReceivable" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "salonId" TEXT NOT NULL,
    "clientId" TEXT,
    "categoryId" TEXT,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "receivedDate" TIMESTAMP(3),
    "status" "AccountStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "saleId" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AccountReceivable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountPayable" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "salonId" TEXT NOT NULL,
    "supplierId" TEXT,
    "categoryId" TEXT,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidDate" TIMESTAMP(3),
    "status" "AccountStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AccountPayable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "salonId" TEXT NOT NULL,
    "categoryId" TEXT,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "expenseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMethod" TEXT,
    "notes" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "salonId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalPlanned" DOUBLE PRECISION NOT NULL,
    "status" "BudgetStatus" NOT NULL DEFAULT 'ACTIVE',
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetItem" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "budgetId" TEXT NOT NULL,
    "categoryId" TEXT,
    "description" TEXT NOT NULL,
    "plannedAmount" DOUBLE PRECISION NOT NULL,
    "actualAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "BudgetItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FinancialCategory_salonId_idx" ON "FinancialCategory"("salonId");

-- CreateIndex
CREATE INDEX "FinancialCategory_type_idx" ON "FinancialCategory"("type");

-- CreateIndex
CREATE INDEX "AccountReceivable_salonId_idx" ON "AccountReceivable"("salonId");

-- CreateIndex
CREATE INDEX "AccountReceivable_status_idx" ON "AccountReceivable"("status");

-- CreateIndex
CREATE INDEX "AccountReceivable_dueDate_idx" ON "AccountReceivable"("dueDate");

-- CreateIndex
CREATE INDEX "AccountPayable_salonId_idx" ON "AccountPayable"("salonId");

-- CreateIndex
CREATE INDEX "AccountPayable_status_idx" ON "AccountPayable"("status");

-- CreateIndex
CREATE INDEX "AccountPayable_dueDate_idx" ON "AccountPayable"("dueDate");

-- CreateIndex
CREATE INDEX "Expense_salonId_idx" ON "Expense"("salonId");

-- CreateIndex
CREATE INDEX "Expense_expenseDate_idx" ON "Expense"("expenseDate");

-- CreateIndex
CREATE INDEX "Budget_salonId_idx" ON "Budget"("salonId");

-- CreateIndex
CREATE INDEX "Budget_status_idx" ON "Budget"("status");

-- CreateIndex
CREATE INDEX "BudgetItem_budgetId_idx" ON "BudgetItem"("budgetId");

-- CreateIndex
CREATE UNIQUE INDEX "BookingConfig_bookingSlug_key" ON "BookingConfig"("bookingSlug");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripePaymentIntentId_key" ON "Payment"("stripePaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripeCheckoutId_key" ON "Payment"("stripeCheckoutId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialCategory" ADD CONSTRAINT "FinancialCategory_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialCategory" ADD CONSTRAINT "FinancialCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "FinancialCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountReceivable" ADD CONSTRAINT "AccountReceivable_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountReceivable" ADD CONSTRAINT "AccountReceivable_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountReceivable" ADD CONSTRAINT "AccountReceivable_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FinancialCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountReceivable" ADD CONSTRAINT "AccountReceivable_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountPayable" ADD CONSTRAINT "AccountPayable_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountPayable" ADD CONSTRAINT "AccountPayable_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountPayable" ADD CONSTRAINT "AccountPayable_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FinancialCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FinancialCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetItem" ADD CONSTRAINT "BudgetItem_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetItem" ADD CONSTRAINT "BudgetItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FinancialCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
