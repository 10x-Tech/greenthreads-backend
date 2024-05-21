/*
  Warnings:

  - You are about to drop the `Customer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Vendor` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_userId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_seller_id_fkey";

-- DropForeignKey
ALTER TABLE "Vendor" DROP CONSTRAINT "Vendor_userId_fkey";

-- DropTable
DROP TABLE "Customer";

-- DropTable
DROP TABLE "Vendor";

-- CreateTable
CREATE TABLE "customer" (
    "customer_id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "address" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("customer_id")
);

-- CreateTable
CREATE TABLE "seller" (
    "seller_id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "address" TEXT,
    "role" "VendorRole" NOT NULL DEFAULT 'SELLER',
    "userId" TEXT NOT NULL,

    CONSTRAINT "seller_pkey" PRIMARY KEY ("seller_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customer_userId_key" ON "customer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "seller_userId_key" ON "seller"("userId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "seller"("seller_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer" ADD CONSTRAINT "customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller" ADD CONSTRAINT "seller_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
