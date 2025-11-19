/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Service` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CommissionConfig" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "deductFrom" TEXT NOT NULL DEFAULT 'ESTABLISHMENT',
ADD COLUMN     "employeeId" TEXT,
ALTER COLUMN "serviceId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "imageUrl",
ADD COLUMN     "advanceBookingTime" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "cashbackActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "cashbackValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "cashbackValueType" "ValueType" NOT NULL DEFAULT 'FIXED',
ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "cnae" TEXT,
ADD COLUMN     "commissionValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "commissionValueType" "ValueType" NOT NULL DEFAULT 'PERCENT',
ADD COLUMN     "imagePath" TEXT,
ADD COLUMN     "isFavorite" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "municipalServiceCode" TEXT,
ADD COLUMN     "priceType" TEXT NOT NULL DEFAULT 'FIXED',
ADD COLUMN     "returnActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "returnDays" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "returnMessage" TEXT,
ADD COLUMN     "serviceListItem" TEXT;

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "salonId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceCareMessage" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "serviceId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "timeValue" INTEGER NOT NULL,
    "timeUnit" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ServiceCareMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceEmployeeCustomization" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "serviceId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "price" DOUBLE PRECISION,
    "duration" INTEGER,
    "costValue" DOUBLE PRECISION,
    "costValueType" "ValueType",
    "allowOnlineBooking" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ServiceEmployeeCustomization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceProductConsumption" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "serviceId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ServiceProductConsumption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceEmployeeCustomization_serviceId_employeeId_key" ON "ServiceEmployeeCustomization"("serviceId", "employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceProductConsumption_serviceId_productId_key" ON "ServiceProductConsumption"("serviceId", "productId");

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceCareMessage" ADD CONSTRAINT "ServiceCareMessage_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceEmployeeCustomization" ADD CONSTRAINT "ServiceEmployeeCustomization_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceEmployeeCustomization" ADD CONSTRAINT "ServiceEmployeeCustomization_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceProductConsumption" ADD CONSTRAINT "ServiceProductConsumption_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceProductConsumption" ADD CONSTRAINT "ServiceProductConsumption_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionConfig" ADD CONSTRAINT "CommissionConfig_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
