/*
  Warnings:

  - The primary key for the `Product` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `productId` on the `Product` table. All the data in the column will be lost.
  - The primary key for the `ProductImage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `imageId` on the `ProductImage` table. All the data in the column will be lost.
  - You are about to drop the column `productVariationOptionId` on the `ProductImage` table. All the data in the column will be lost.
  - The primary key for the `ProductVariation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `variationId` on the `ProductVariation` table. All the data in the column will be lost.
  - You are about to drop the column `variationName` on the `ProductVariation` table. All the data in the column will be lost.
  - The primary key for the `ProductVariationOption` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `optionId` on the `ProductVariationOption` table. All the data in the column will be lost.
  - You are about to drop the `_ProductToProductVariation` table. If the table is not empty, all the data it contains will be lost.
  - The required column `id` was added to the `Product` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `ProductImage` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `ProductVariation` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `ProductVariationOption` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "ProductCategory" DROP CONSTRAINT "ProductCategory_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductCombination" DROP CONSTRAINT "ProductCombination_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductImage" DROP CONSTRAINT "ProductImage_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductImage" DROP CONSTRAINT "ProductImage_productVariationOptionId_fkey";

-- DropForeignKey
ALTER TABLE "ProductVariationOption" DROP CONSTRAINT "ProductVariationOption_variationId_fkey";

-- DropForeignKey
ALTER TABLE "_ProductToProductVariation" DROP CONSTRAINT "_ProductToProductVariation_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProductToProductVariation" DROP CONSTRAINT "_ProductToProductVariation_B_fkey";

-- DropIndex
DROP INDEX "ProductVariation_variationName_key";

-- AlterTable
ALTER TABLE "Product" DROP CONSTRAINT "Product_pkey",
DROP COLUMN "productId",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "productVariationId" TEXT,
ADD CONSTRAINT "Product_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ProductImage" DROP CONSTRAINT "ProductImage_pkey",
DROP COLUMN "imageId",
DROP COLUMN "productVariationOptionId",
ADD COLUMN     "combinationId" TEXT,
ADD COLUMN     "id" TEXT NOT NULL,
ALTER COLUMN "productId" DROP NOT NULL,
ADD CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ProductVariation" DROP CONSTRAINT "ProductVariation_pkey",
DROP COLUMN "variationId",
DROP COLUMN "variationName",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "ProductVariation_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ProductVariationOption" DROP CONSTRAINT "ProductVariationOption_pkey",
DROP COLUMN "optionId",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "ProductVariationOption_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "_ProductToProductVariation";

-- CreateTable
CREATE TABLE "Variations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Variations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VariationOptions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "variationId" TEXT,

    CONSTRAINT "VariationOptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Variations_name_key" ON "Variations"("name");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_productVariationId_fkey" FOREIGN KEY ("productVariationId") REFERENCES "ProductVariation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariationOptions" ADD CONSTRAINT "VariationOptions_variationId_fkey" FOREIGN KEY ("variationId") REFERENCES "Variations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariationOption" ADD CONSTRAINT "ProductVariationOption_variationId_fkey" FOREIGN KEY ("variationId") REFERENCES "ProductVariation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCombination" ADD CONSTRAINT "ProductCombination_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_combinationId_fkey" FOREIGN KEY ("combinationId") REFERENCES "ProductCombination"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
