/*
  Warnings:

  - You are about to drop the `_ProductVariationCombination` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ProductVariationCombination" DROP CONSTRAINT "_ProductVariationCombination_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProductVariationCombination" DROP CONSTRAINT "_ProductVariationCombination_B_fkey";

-- AlterTable
ALTER TABLE "product_combinations" ADD COLUMN     "variationDetails" JSONB;

-- DropTable
DROP TABLE "_ProductVariationCombination";
