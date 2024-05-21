/*
  Warnings:

  - You are about to drop the column `orderStatus` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "orderStatus",
ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'IN_PROGRESS';
