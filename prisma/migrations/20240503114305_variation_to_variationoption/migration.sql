/*
  Warnings:

  - The primary key for the `Vendor` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `vendor_id` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the `ProductCombination` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductStock` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_VariationToVariationOption` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `height` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `length` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalPrice` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weight` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `width` to the `Product` table without a default value. This is not possible if the table is not empty.
  - The required column `seller_id` was added to the `Vendor` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `variation_id` to the `variation_options` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProductCombination" DROP CONSTRAINT "ProductCombination_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductImage" DROP CONSTRAINT "ProductImage_combinationId_fkey";

-- DropForeignKey
ALTER TABLE "ProductImage" DROP CONSTRAINT "ProductImage_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductStock" DROP CONSTRAINT "ProductStock_productCombinationId_fkey";

-- DropForeignKey
ALTER TABLE "_VariationToVariationOption" DROP CONSTRAINT "_VariationToVariationOption_A_fkey";

-- DropForeignKey
ALTER TABLE "_VariationToVariationOption" DROP CONSTRAINT "_VariationToVariationOption_B_fkey";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "discountPercentage" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "discountedPrice" DOUBLE PRECISION,
ADD COLUMN     "height" INTEGER NOT NULL,
ADD COLUMN     "length" INTEGER NOT NULL,
ADD COLUMN     "originalPrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "sellerId" TEXT,
ADD COLUMN     "weight" INTEGER NOT NULL,
ADD COLUMN     "width" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Vendor" DROP CONSTRAINT "Vendor_pkey",
DROP COLUMN "vendor_id",
ADD COLUMN     "seller_id" TEXT NOT NULL,
ADD CONSTRAINT "Vendor_pkey" PRIMARY KEY ("seller_id");

-- AlterTable
ALTER TABLE "variation_options" ADD COLUMN     "variation_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "ProductCombination";

-- DropTable
DROP TABLE "ProductImage";

-- DropTable
DROP TABLE "ProductStock";

-- DropTable
DROP TABLE "_VariationToVariationOption";

-- CreateTable
CREATE TABLE "product_combinations" (
    "id" TEXT NOT NULL,
    "skuId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "availableStock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_combinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_stock" (
    "id" TEXT NOT NULL,
    "totalStock" INTEGER NOT NULL DEFAULT 0,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "productCombinationId" TEXT NOT NULL,

    CONSTRAINT "product_stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_images" (
    "id" TEXT NOT NULL,
    "productId" TEXT,
    "combinationId" TEXT,
    "imageUrl" TEXT NOT NULL,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_combinations_skuId_key" ON "product_combinations"("skuId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Vendor"("seller_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variation_options" ADD CONSTRAINT "variation_options_variation_id_fkey" FOREIGN KEY ("variation_id") REFERENCES "variations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_combinations" ADD CONSTRAINT "product_combinations_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_stock" ADD CONSTRAINT "product_stock_productCombinationId_fkey" FOREIGN KEY ("productCombinationId") REFERENCES "product_combinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_combinationId_fkey" FOREIGN KEY ("combinationId") REFERENCES "product_combinations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
