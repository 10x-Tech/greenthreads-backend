/*
  Warnings:

  - The primary key for the `Product` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `product_id` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `product_name` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `Option` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OptionValue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Sku` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SkuValue` table. If the table is not empty, all the data it contains will be lost.
  - The required column `productId` was added to the `Product` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `productName` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productSlug` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Option" DROP CONSTRAINT "Option_product_id_fkey";

-- DropForeignKey
ALTER TABLE "OptionValue" DROP CONSTRAINT "OptionValue_product_id_option_id_fkey";

-- DropForeignKey
ALTER TABLE "Sku" DROP CONSTRAINT "Sku_product_id_fkey";

-- DropForeignKey
ALTER TABLE "SkuValue" DROP CONSTRAINT "SkuValue_product_id_option_id_fkey";

-- DropForeignKey
ALTER TABLE "SkuValue" DROP CONSTRAINT "SkuValue_product_id_option_id_value_id_fkey";

-- DropForeignKey
ALTER TABLE "SkuValue" DROP CONSTRAINT "SkuValue_product_id_sku_id_fkey";

-- DropIndex
DROP INDEX "Product_product_name_key";

-- AlterTable
ALTER TABLE "Product" DROP CONSTRAINT "Product_pkey",
DROP COLUMN "product_id",
DROP COLUMN "product_name",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "previewImage" TEXT,
ADD COLUMN     "productId" TEXT NOT NULL,
ADD COLUMN     "productName" TEXT NOT NULL,
ADD COLUMN     "productSlug" TEXT NOT NULL,
ADD COLUMN     "productVariationVariationId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "Product_pkey" PRIMARY KEY ("productId");

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "Option";

-- DropTable
DROP TABLE "OptionValue";

-- DropTable
DROP TABLE "Sku";

-- DropTable
DROP TABLE "SkuValue";

-- CreateTable
CREATE TABLE "ProductVariation" (
    "variationId" TEXT NOT NULL,
    "variationName" TEXT NOT NULL,

    CONSTRAINT "ProductVariation_pkey" PRIMARY KEY ("variationId")
);

-- CreateTable
CREATE TABLE "ProductVariationOption" (
    "optionId" TEXT NOT NULL,
    "optionName" TEXT NOT NULL,
    "variationId" TEXT,

    CONSTRAINT "ProductVariationOption_pkey" PRIMARY KEY ("optionId")
);

-- CreateTable
CREATE TABLE "ProductCombination" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "skuId" TEXT NOT NULL,
    "uniqueCombinationId" TEXT NOT NULL,
    "availableStock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductCombination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductStock" (
    "id" TEXT NOT NULL,
    "totalStock" INTEGER NOT NULL DEFAULT 0,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "productCombinationId" TEXT NOT NULL,

    CONSTRAINT "ProductStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "imageId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productVariationOptionId" TEXT,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("imageId")
);

-- CreateTable
CREATE TABLE "Category" (
    "catId" TEXT NOT NULL,
    "categoryName" TEXT NOT NULL,
    "categoryIcon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("catId")
);

-- CreateTable
CREATE TABLE "SubCategory" (
    "subCatId" TEXT NOT NULL,
    "subCategoryName" TEXT NOT NULL,
    "categoryCatId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubCategory_pkey" PRIMARY KEY ("subCatId")
);

-- CreateTable
CREATE TABLE "_ProductToSubCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ProductToCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariation_variationName_key" ON "ProductVariation"("variationName");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCombination_skuId_key" ON "ProductCombination"("skuId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCombination_uniqueCombinationId_key" ON "ProductCombination"("uniqueCombinationId");

-- CreateIndex
CREATE UNIQUE INDEX "_ProductToSubCategory_AB_unique" ON "_ProductToSubCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductToSubCategory_B_index" ON "_ProductToSubCategory"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProductToCategory_AB_unique" ON "_ProductToCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductToCategory_B_index" ON "_ProductToCategory"("B");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_productVariationVariationId_fkey" FOREIGN KEY ("productVariationVariationId") REFERENCES "ProductVariation"("variationId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariationOption" ADD CONSTRAINT "ProductVariationOption_variationId_fkey" FOREIGN KEY ("variationId") REFERENCES "ProductVariation"("variationId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCombination" ADD CONSTRAINT "ProductCombination_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductStock" ADD CONSTRAINT "ProductStock_productCombinationId_fkey" FOREIGN KEY ("productCombinationId") REFERENCES "ProductCombination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productVariationOptionId_fkey" FOREIGN KEY ("productVariationOptionId") REFERENCES "ProductVariationOption"("optionId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubCategory" ADD CONSTRAINT "SubCategory_categoryCatId_fkey" FOREIGN KEY ("categoryCatId") REFERENCES "Category"("catId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToSubCategory" ADD CONSTRAINT "_ProductToSubCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("productId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToSubCategory" ADD CONSTRAINT "_ProductToSubCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "SubCategory"("subCatId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToCategory" ADD CONSTRAINT "_ProductToCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("catId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToCategory" ADD CONSTRAINT "_ProductToCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("productId") ON DELETE CASCADE ON UPDATE CASCADE;
