/*
  Warnings:

  - The primary key for the `Product` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `available` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `care` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `collectionName` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `color` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `discountedPrice` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `is_deleted` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `materialUsed` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `productImages` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `productName` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `sellerId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `sizesAvailable` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `sku` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `suggestedRRPInGBP` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `wholesalePriceInGBP` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `Seller` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SubSku` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[product_name]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - The required column `product_id` was added to the `Product` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `product_name` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_sellerId_fkey";

-- DropForeignKey
ALTER TABLE "SubSku" DROP CONSTRAINT "SubSku_productId_fkey";

-- DropIndex
DROP INDEX "Product_sku_key";

-- AlterTable
ALTER TABLE "Product" DROP CONSTRAINT "Product_pkey",
DROP COLUMN "available",
DROP COLUMN "care",
DROP COLUMN "category",
DROP COLUMN "collectionName",
DROP COLUMN "color",
DROP COLUMN "created_at",
DROP COLUMN "description",
DROP COLUMN "discountedPrice",
DROP COLUMN "id",
DROP COLUMN "is_deleted",
DROP COLUMN "materialUsed",
DROP COLUMN "productImages",
DROP COLUMN "productName",
DROP COLUMN "sellerId",
DROP COLUMN "sizesAvailable",
DROP COLUMN "sku",
DROP COLUMN "status",
DROP COLUMN "suggestedRRPInGBP",
DROP COLUMN "updated_at",
DROP COLUMN "wholesalePriceInGBP",
ADD COLUMN     "product_id" TEXT NOT NULL,
ADD COLUMN     "product_name" TEXT NOT NULL,
ADD CONSTRAINT "Product_pkey" PRIMARY KEY ("product_id");

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "username" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "mobile" DROP NOT NULL;

-- DropTable
DROP TABLE "Seller";

-- DropTable
DROP TABLE "SubSku";

-- CreateTable
CREATE TABLE "Option" (
    "option_id" TEXT NOT NULL,
    "option_name" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,

    CONSTRAINT "Option_pkey" PRIMARY KEY ("product_id","option_id")
);

-- CreateTable
CREATE TABLE "OptionValue" (
    "product_id" TEXT NOT NULL,
    "value_id" TEXT NOT NULL,
    "value_name" TEXT NOT NULL,
    "option_id" TEXT NOT NULL,

    CONSTRAINT "OptionValue_pkey" PRIMARY KEY ("product_id","option_id","value_id")
);

-- CreateTable
CREATE TABLE "Sku" (
    "product_id" TEXT NOT NULL,
    "sku_id" INTEGER NOT NULL,

    CONSTRAINT "Sku_pkey" PRIMARY KEY ("product_id","sku_id")
);

-- CreateTable
CREATE TABLE "SkuValue" (
    "product_id" TEXT NOT NULL,
    "sku_id" INTEGER NOT NULL,
    "option_id" TEXT NOT NULL,
    "value_id" TEXT NOT NULL,

    CONSTRAINT "SkuValue_pkey" PRIMARY KEY ("product_id","sku_id","option_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Option_product_id_option_name_key" ON "Option"("product_id", "option_name");

-- CreateIndex
CREATE UNIQUE INDEX "OptionValue_product_id_option_id_value_name_key" ON "OptionValue"("product_id", "option_id", "value_name");

-- CreateIndex
CREATE UNIQUE INDEX "Sku_sku_id_key" ON "Sku"("sku_id");

-- CreateIndex
CREATE UNIQUE INDEX "SkuValue_product_id_sku_id_option_id_key" ON "SkuValue"("product_id", "sku_id", "option_id");

-- CreateIndex
CREATE UNIQUE INDEX "Product_product_name_key" ON "Product"("product_name");

-- AddForeignKey
ALTER TABLE "Option" ADD CONSTRAINT "Option_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OptionValue" ADD CONSTRAINT "OptionValue_product_id_option_id_fkey" FOREIGN KEY ("product_id", "option_id") REFERENCES "Option"("product_id", "option_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sku" ADD CONSTRAINT "Sku_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkuValue" ADD CONSTRAINT "SkuValue_product_id_sku_id_fkey" FOREIGN KEY ("product_id", "sku_id") REFERENCES "Sku"("product_id", "sku_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkuValue" ADD CONSTRAINT "SkuValue_product_id_option_id_fkey" FOREIGN KEY ("product_id", "option_id") REFERENCES "Option"("product_id", "option_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkuValue" ADD CONSTRAINT "SkuValue_product_id_option_id_value_id_fkey" FOREIGN KEY ("product_id", "option_id", "value_id") REFERENCES "OptionValue"("product_id", "option_id", "value_id") ON DELETE RESTRICT ON UPDATE CASCADE;
