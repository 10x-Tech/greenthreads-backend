/*
  Warnings:

  - You are about to drop the column `prodcutVariationId` on the `ProductVariationOption` table. All the data in the column will be lost.
  - Added the required column `productVariationId` to the `ProductVariationOption` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProductVariationOption" DROP CONSTRAINT "ProductVariationOption_prodcutVariationId_fkey";

-- AlterTable
ALTER TABLE "ProductVariationOption" DROP COLUMN "prodcutVariationId",
ADD COLUMN     "productVariationId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ProductVariationOption" ADD CONSTRAINT "ProductVariationOption_productVariationId_fkey" FOREIGN KEY ("productVariationId") REFERENCES "ProductVariation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
