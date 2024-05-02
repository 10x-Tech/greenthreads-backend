/*
  Warnings:

  - You are about to drop the column `productVariationId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `optionName` on the `ProductVariationOption` table. All the data in the column will be lost.
  - You are about to drop the column `variationId` on the `ProductVariationOption` table. All the data in the column will be lost.
  - Added the required column `productId` to the `ProductVariation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variantId` to the `ProductVariation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `optionId` to the `ProductVariationOption` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prodcutVariationId` to the `ProductVariationOption` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_productVariationId_fkey";

-- DropForeignKey
ALTER TABLE "ProductVariationOption" DROP CONSTRAINT "ProductVariationOption_variationId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "productVariationId";

-- AlterTable
ALTER TABLE "ProductVariation" ADD COLUMN     "productId" TEXT NOT NULL,
ADD COLUMN     "variantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ProductVariationOption" DROP COLUMN "optionName",
DROP COLUMN "variationId",
ADD COLUMN     "optionId" TEXT NOT NULL,
ADD COLUMN     "prodcutVariationId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ProductVariation" ADD CONSTRAINT "ProductVariation_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariation" ADD CONSTRAINT "ProductVariation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariationOption" ADD CONSTRAINT "ProductVariationOption_prodcutVariationId_fkey" FOREIGN KEY ("prodcutVariationId") REFERENCES "ProductVariation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariationOption" ADD CONSTRAINT "ProductVariationOption_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "VariationOptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
