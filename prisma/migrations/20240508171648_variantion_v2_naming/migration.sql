/*
  Warnings:

  - You are about to drop the `ProductInventory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SKU` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SKUInventory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProductInventory" DROP CONSTRAINT "ProductInventory_productId_fkey";

-- DropForeignKey
ALTER TABLE "SKU" DROP CONSTRAINT "SKU_color_id_fkey";

-- DropForeignKey
ALTER TABLE "SKU" DROP CONSTRAINT "SKU_productId_fkey";

-- DropForeignKey
ALTER TABLE "SKU" DROP CONSTRAINT "SKU_size_id_fkey";

-- DropForeignKey
ALTER TABLE "SKUInventory" DROP CONSTRAINT "SKUInventory_productInventoryId_fkey";

-- DropForeignKey
ALTER TABLE "SKUInventory" DROP CONSTRAINT "SKUInventory_skuId_fkey";

-- DropTable
DROP TABLE "ProductInventory";

-- DropTable
DROP TABLE "SKU";

-- DropTable
DROP TABLE "SKUInventory";

-- CreateTable
CREATE TABLE "skus" (
    "id" TEXT NOT NULL,
    "skuId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "size_id" TEXT,
    "color_id" TEXT,
    "productId" TEXT,
    "availableStock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_inventory" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "totalStock" INTEGER NOT NULL DEFAULT 0,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sku_inventory" (
    "id" TEXT NOT NULL,
    "productInventoryId" TEXT NOT NULL,
    "skuId" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "sku_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "skus_skuId_key" ON "skus"("skuId");

-- CreateIndex
CREATE UNIQUE INDEX "skus_productId_key" ON "skus"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "skus_size_id_color_id_key" ON "skus"("size_id", "color_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_inventory_productId_key" ON "product_inventory"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "sku_inventory_skuId_key" ON "sku_inventory"("skuId");

-- AddForeignKey
ALTER TABLE "skus" ADD CONSTRAINT "skus_size_id_fkey" FOREIGN KEY ("size_id") REFERENCES "sizes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skus" ADD CONSTRAINT "skus_color_id_fkey" FOREIGN KEY ("color_id") REFERENCES "colors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skus" ADD CONSTRAINT "skus_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_inventory" ADD CONSTRAINT "product_inventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sku_inventory" ADD CONSTRAINT "sku_inventory_productInventoryId_fkey" FOREIGN KEY ("productInventoryId") REFERENCES "product_inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sku_inventory" ADD CONSTRAINT "sku_inventory_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "skus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
