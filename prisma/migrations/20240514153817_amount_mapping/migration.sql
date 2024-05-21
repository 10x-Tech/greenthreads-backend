/*
  Warnings:

  - You are about to drop the column `amountDiscount` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `amountSubTotal` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `amountTax` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `amountTotal` on the `OrderItem` table. All the data in the column will be lost.
  - Added the required column `amount_discount` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount_subTotal` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount_tax` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount_total` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "amountDiscount",
DROP COLUMN "amountSubTotal",
DROP COLUMN "amountTax",
DROP COLUMN "amountTotal",
ADD COLUMN     "amount_discount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "amount_subTotal" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "amount_tax" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "amount_total" DOUBLE PRECISION NOT NULL;
