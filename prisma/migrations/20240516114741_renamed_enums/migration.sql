/*
  Warnings:

  - The `orderStatus` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `deliveryStatus` column on the `OrderItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "OrderItemStatus" AS ENUM ('PENDING', 'SHIPPED', 'DELIVERED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('IN_PROGRESS', 'FULLFILLED');

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "orderStatus",
ADD COLUMN     "orderStatus" "OrderStatus" NOT NULL DEFAULT 'IN_PROGRESS';

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "deliveryStatus",
ADD COLUMN     "deliveryStatus" "OrderItemStatus" NOT NULL DEFAULT 'PENDING';

-- DropEnum
DROP TYPE "OrderItemStatusNew";

-- DropEnum
DROP TYPE "OrderStatusNew";
