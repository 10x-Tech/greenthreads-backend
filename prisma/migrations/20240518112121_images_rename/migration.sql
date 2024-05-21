/*
  Warnings:

  - You are about to drop the column `combinationId` on the `product_images` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "product_images" DROP COLUMN "combinationId",
ADD COLUMN     "url" TEXT;
