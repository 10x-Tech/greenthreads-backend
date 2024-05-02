/*
  Warnings:

  - You are about to drop the `ProductVariation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductVariationOption` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProductVariation" DROP CONSTRAINT "ProductVariation_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductVariation" DROP CONSTRAINT "ProductVariation_variantId_fkey";

-- DropForeignKey
ALTER TABLE "ProductVariationOption" DROP CONSTRAINT "ProductVariationOption_optionId_fkey";

-- DropForeignKey
ALTER TABLE "ProductVariationOption" DROP CONSTRAINT "ProductVariationOption_productVariationId_fkey";

-- AlterTable
ALTER TABLE "VariationOptions" ADD COLUMN     "productId" TEXT;

-- AlterTable
ALTER TABLE "Variations" ADD COLUMN     "productId" TEXT;

-- DropTable
DROP TABLE "ProductVariation";

-- DropTable
DROP TABLE "ProductVariationOption";

-- AddForeignKey
ALTER TABLE "Variations" ADD CONSTRAINT "Variations_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariationOptions" ADD CONSTRAINT "VariationOptions_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
