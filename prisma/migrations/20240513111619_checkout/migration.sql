/*
  Warnings:

  - You are about to drop the column `subtotal` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[order_display_id]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `order_display_id` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shipping_address` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "customer" DROP CONSTRAINT "customer_userId_fkey";

-- DropForeignKey
ALTER TABLE "seller" DROP CONSTRAINT "seller_userId_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "subtotal",
ADD COLUMN     "order_display_id" TEXT NOT NULL,
ADD COLUMN     "shipping_address" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "cart" ADD COLUMN     "discount" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "tax" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Invoice" (
    "invoice_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "issue_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_date" TIMESTAMP(3) NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("invoice_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" TEXT NOT NULL,
    "username" TEXT,
    "email" TEXT NOT NULL,
    "profileImg" TEXT,
    "phoneNumber" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "address" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,

    CONSTRAINT "address_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "idx_order_id" ON "Invoice"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phoneNumber_key" ON "users"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Order_order_display_id_key" ON "Order"("order_display_id");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "address_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer" ADD CONSTRAINT "customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller" ADD CONSTRAINT "seller_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
