/*
  Warnings:

  - You are about to drop the column `stock` on the `sku_inventory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "sku_inventory" DROP COLUMN "stock",
ADD COLUMN     "availableStock" INTEGER NOT NULL DEFAULT 0;
