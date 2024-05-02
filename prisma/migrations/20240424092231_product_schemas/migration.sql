/*
  Warnings:

  - You are about to drop the column `uniqueCombinationId` on the `ProductCombination` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ProductCombination_uniqueCombinationId_key";

-- AlterTable
ALTER TABLE "ProductCombination" DROP COLUMN "uniqueCombinationId";
