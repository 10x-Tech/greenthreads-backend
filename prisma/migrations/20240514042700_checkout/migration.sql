/*
  Warnings:

  - You are about to drop the column `billing_address` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `shipping_address` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `subTotal` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Order` table. All the data in the column will be lost.
  - Added the required column `customerDetails` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shipping_details` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shipping_subtotal` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shipping_total` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalDetails` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productDesc` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variationDetails` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "billing_address",
DROP COLUMN "shipping_address",
DROP COLUMN "subTotal",
DROP COLUMN "totalAmount",
DROP COLUMN "userId",
ADD COLUMN     "billing_details" JSONB,
ADD COLUMN     "customerDetails" JSONB NOT NULL,
ADD COLUMN     "customerId" TEXT NOT NULL,
ADD COLUMN     "shipping_details" JSONB NOT NULL,
ADD COLUMN     "shipping_subtotal" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "shipping_total" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "totalDetails" JSONB NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "productDesc" TEXT NOT NULL,
ADD COLUMN     "variationDetails" JSONB NOT NULL;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
