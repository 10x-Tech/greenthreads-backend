/*
  Warnings:

  - You are about to drop the `_ProductToVariationOptions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ProductVariation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ProductToVariationOptions" DROP CONSTRAINT "_ProductToVariationOptions_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProductToVariationOptions" DROP CONSTRAINT "_ProductToVariationOptions_B_fkey";

-- DropForeignKey
ALTER TABLE "_ProductVariation" DROP CONSTRAINT "_ProductVariation_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProductVariation" DROP CONSTRAINT "_ProductVariation_B_fkey";

-- DropTable
DROP TABLE "_ProductToVariationOptions";

-- DropTable
DROP TABLE "_ProductVariation";

-- CreateTable
CREATE TABLE "product_variations" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "product_variations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variation_options" (
    "id" TEXT NOT NULL,
    "productVariationId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,

    CONSTRAINT "product_variation_options_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "product_variations" ADD CONSTRAINT "product_variations_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "variations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variations" ADD CONSTRAINT "product_variations_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variation_options" ADD CONSTRAINT "product_variation_options_productVariationId_fkey" FOREIGN KEY ("productVariationId") REFERENCES "product_variations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variation_options" ADD CONSTRAINT "product_variation_options_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "variation_options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
