/*
  Warnings:

  - You are about to drop the column `productVariationVariationId` on the `Product` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "DeliveryRange" AS ENUM ('ONE_TO_THREE_DAYS', 'THREE_TO_FIVE_DAYS', 'FIVE_TO_SEVEN_DAYS', 'SEVEN_TO_TEN_DAYS', 'TEN_TO_FOURTEEN_DAYS');

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_productVariationVariationId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "productVariationVariationId",
ADD COLUMN     "deliveryRange" "DeliveryRange" NOT NULL DEFAULT 'ONE_TO_THREE_DAYS',
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isNextDayDelivery" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "productVariationId" TEXT;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_productVariationId_fkey" FOREIGN KEY ("productVariationId") REFERENCES "ProductVariation"("variationId") ON DELETE SET NULL ON UPDATE CASCADE;
