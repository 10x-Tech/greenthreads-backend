/*
  Warnings:

  - Made the column `unitPrice` on table `CartItem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `totalPrice` on table `CartItem` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "CartItem" ALTER COLUMN "unitPrice" SET NOT NULL,
ALTER COLUMN "totalPrice" SET NOT NULL;
