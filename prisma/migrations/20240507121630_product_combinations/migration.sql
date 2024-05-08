/*
  Warnings:

  - You are about to drop the column `productVariationId` on the `product_combinations` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "product_combinations" DROP CONSTRAINT "product_combinations_productVariationId_fkey";

-- AlterTable
ALTER TABLE "product_combinations" DROP COLUMN "productVariationId";

-- CreateTable
CREATE TABLE "_ProductVariationCombination" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProductVariationCombination_AB_unique" ON "_ProductVariationCombination"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductVariationCombination_B_index" ON "_ProductVariationCombination"("B");

-- AddForeignKey
ALTER TABLE "_ProductVariationCombination" ADD CONSTRAINT "_ProductVariationCombination_A_fkey" FOREIGN KEY ("A") REFERENCES "product_combinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductVariationCombination" ADD CONSTRAINT "_ProductVariationCombination_B_fkey" FOREIGN KEY ("B") REFERENCES "product_variations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
