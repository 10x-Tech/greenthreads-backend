/*
  Warnings:

  - You are about to drop the column `status` on the `OrderItem` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "OrderItemStatusNew" AS ENUM ('PENDING', 'SHIPPED', 'DELIVERED');

-- CreateEnum
CREATE TYPE "OrderStatusNew" AS ENUM ('IN_PROGRESS', 'FULLFILLED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "orderStatus" "OrderStatusNew" NOT NULL DEFAULT 'IN_PROGRESS';

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "status",
ADD COLUMN     "deliveryStatus" "OrderItemStatusNew" NOT NULL DEFAULT 'PENDING';

-- DropEnum
DROP TYPE "OrderStatus";
