/*
  Warnings:

  - Made the column `productId` on table `skus` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "skus" ALTER COLUMN "productId" SET NOT NULL;
