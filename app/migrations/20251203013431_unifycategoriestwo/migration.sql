/*
  Warnings:

  - You are about to drop the column `products` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the `ProductCategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "ProductCategory" DROP CONSTRAINT "ProductCategory_salonId_fkey";

-- DropIndex
DROP INDEX "Category_salonId_active_idx";

-- DropIndex
DROP INDEX "Category_salonId_type_idx";

-- DropIndex
DROP INDEX "Category_type_idx";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "products";

-- DropTable
DROP TABLE "ProductCategory";

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
