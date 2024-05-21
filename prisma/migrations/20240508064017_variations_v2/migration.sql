/*
  Warnings:

  - You are about to drop the `product_combinations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_stock` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_variation_options` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_variations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `variation_options` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `variations` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('ACTIVE', 'PENDING', 'DELIVERED');

-- DropForeignKey
ALTER TABLE "product_combinations" DROP CONSTRAINT "product_combinations_productId_fkey";

-- DropForeignKey
ALTER TABLE "product_images" DROP CONSTRAINT "product_images_combinationId_fkey";

-- DropForeignKey
ALTER TABLE "product_stock" DROP CONSTRAINT "product_stock_productCombinationId_fkey";

-- DropForeignKey
ALTER TABLE "product_variation_options" DROP CONSTRAINT "product_variation_options_optionId_fkey";

-- DropForeignKey
ALTER TABLE "product_variation_options" DROP CONSTRAINT "product_variation_options_productVariationId_fkey";

-- DropForeignKey
ALTER TABLE "product_variations" DROP CONSTRAINT "product_variations_productId_fkey";

-- DropForeignKey
ALTER TABLE "product_variations" DROP CONSTRAINT "product_variations_variantId_fkey";

-- DropForeignKey
ALTER TABLE "variation_options" DROP CONSTRAINT "variation_options_variation_id_fkey";

-- DropTable
DROP TABLE "product_combinations";

-- DropTable
DROP TABLE "product_stock";

-- DropTable
DROP TABLE "product_variation_options";

-- DropTable
DROP TABLE "product_variations";

-- DropTable
DROP TABLE "variation_options";

-- DropTable
DROP TABLE "variations";

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "productPrice" DOUBLE PRECISION NOT NULL,
    "discountPercentage" DOUBLE PRECISION DEFAULT 0,
    "productImage" TEXT NOT NULL,
    "discountedPrice" DOUBLE PRECISION,
    "quantity" INTEGER NOT NULL,
    "orderId" TEXT NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" "OrderStatus" NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sizes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "sizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "colors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SKU" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "size_id" TEXT,
    "color_id" TEXT,
    "productId" TEXT NOT NULL,
    "availableStock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SKU_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductInventory" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "totalStock" INTEGER NOT NULL DEFAULT 0,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SKUInventory" (
    "id" TEXT NOT NULL,
    "productInventoryId" TEXT NOT NULL,
    "skuId" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SKUInventory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sizes_name_key" ON "sizes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "colors_name_key" ON "colors"("name");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SKU" ADD CONSTRAINT "SKU_size_id_fkey" FOREIGN KEY ("size_id") REFERENCES "sizes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SKU" ADD CONSTRAINT "SKU_color_id_fkey" FOREIGN KEY ("color_id") REFERENCES "colors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SKU" ADD CONSTRAINT "SKU_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductInventory" ADD CONSTRAINT "ProductInventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SKUInventory" ADD CONSTRAINT "SKUInventory_productInventoryId_fkey" FOREIGN KEY ("productInventoryId") REFERENCES "ProductInventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SKUInventory" ADD CONSTRAINT "SKUInventory_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "SKU"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
