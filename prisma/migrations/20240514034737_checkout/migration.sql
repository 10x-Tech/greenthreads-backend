/*
  Warnings:

  - You are about to drop the column `discountPercentage` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `discountedPrice` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `productPrice` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `customer` table. All the data in the column will be lost.
  - Added the required column `currency` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `metaData` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentIntentId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentMethod` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subTotal` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPrice` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitPrice` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('paid', 'unpaid');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "billing_address" JSONB,
ADD COLUMN     "currency" TEXT NOT NULL,
ADD COLUMN     "metaData" JSONB NOT NULL,
ADD COLUMN     "paymentIntentId" TEXT NOT NULL,
ADD COLUMN     "paymentMethod" TEXT NOT NULL,
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'unpaid',
ADD COLUMN     "subTotal" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "discountPercentage",
DROP COLUMN "discountedPrice",
DROP COLUMN "productPrice",
ADD COLUMN     "totalPrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "unitPrice" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "customer" DROP COLUMN "address";
