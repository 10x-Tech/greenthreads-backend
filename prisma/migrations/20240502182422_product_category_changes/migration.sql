/*
  Warnings:

  - You are about to drop the column `product_id` on the `variation_options` table. All the data in the column will be lost.
  - You are about to drop the column `variation_id` on the `variation_options` table. All the data in the column will be lost.
  - You are about to drop the column `product_id` on the `variations` table. All the data in the column will be lost.
  - You are about to drop the `ProductCategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProductCategory" DROP CONSTRAINT "ProductCategory_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "ProductCategory" DROP CONSTRAINT "ProductCategory_productId_fkey";

-- DropForeignKey
ALTER TABLE "variation_options" DROP CONSTRAINT "variation_options_product_id_fkey";

-- DropForeignKey
ALTER TABLE "variation_options" DROP CONSTRAINT "variation_options_variation_id_fkey";

-- DropForeignKey
ALTER TABLE "variations" DROP CONSTRAINT "variations_product_id_fkey";

-- AlterTable
ALTER TABLE "variation_options" DROP COLUMN "product_id",
DROP COLUMN "variation_id";

-- AlterTable
ALTER TABLE "variations" DROP COLUMN "product_id";

-- DropTable
DROP TABLE "ProductCategory";

-- CreateTable
CREATE TABLE "_ProductVariation" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_VariationToVariationOption" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ProductToCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProductVariation_AB_unique" ON "_ProductVariation"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductVariation_B_index" ON "_ProductVariation"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_VariationToVariationOption_AB_unique" ON "_VariationToVariationOption"("A", "B");

-- CreateIndex
CREATE INDEX "_VariationToVariationOption_B_index" ON "_VariationToVariationOption"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProductToCategory_AB_unique" ON "_ProductToCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductToCategory_B_index" ON "_ProductToCategory"("B");

-- AddForeignKey
ALTER TABLE "_ProductVariation" ADD CONSTRAINT "_ProductVariation_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductVariation" ADD CONSTRAINT "_ProductVariation_B_fkey" FOREIGN KEY ("B") REFERENCES "variations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VariationToVariationOption" ADD CONSTRAINT "_VariationToVariationOption_A_fkey" FOREIGN KEY ("A") REFERENCES "variations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VariationToVariationOption" ADD CONSTRAINT "_VariationToVariationOption_B_fkey" FOREIGN KEY ("B") REFERENCES "variation_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToCategory" ADD CONSTRAINT "_ProductToCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToCategory" ADD CONSTRAINT "_ProductToCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
