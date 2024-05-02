/*
  Warnings:

  - You are about to drop the column `productVariationId` on the `Product` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_productVariationId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "productVariationId";

-- CreateTable
CREATE TABLE "_ProductToProductVariation" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProductToProductVariation_AB_unique" ON "_ProductToProductVariation"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductToProductVariation_B_index" ON "_ProductToProductVariation"("B");

-- AddForeignKey
ALTER TABLE "_ProductToProductVariation" ADD CONSTRAINT "_ProductToProductVariation_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("productId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToProductVariation" ADD CONSTRAINT "_ProductToProductVariation_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductVariation"("variationId") ON DELETE CASCADE ON UPDATE CASCADE;
