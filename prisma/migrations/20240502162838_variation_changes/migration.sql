/*
  Warnings:

  - You are about to drop the `VariationOptions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Variations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "VariationOptions" DROP CONSTRAINT "VariationOptions_productId_fkey";

-- DropForeignKey
ALTER TABLE "VariationOptions" DROP CONSTRAINT "VariationOptions_variationId_fkey";

-- DropForeignKey
ALTER TABLE "Variations" DROP CONSTRAINT "Variations_productId_fkey";

-- DropTable
DROP TABLE "VariationOptions";

-- DropTable
DROP TABLE "Variations";

-- CreateTable
CREATE TABLE "variations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "product_id" TEXT,

    CONSTRAINT "variations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variation_options" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "variation_id" TEXT,
    "product_id" TEXT,

    CONSTRAINT "variation_options_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "variations_name_key" ON "variations"("name");

-- AddForeignKey
ALTER TABLE "variations" ADD CONSTRAINT "variations_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variation_options" ADD CONSTRAINT "variation_options_variation_id_fkey" FOREIGN KEY ("variation_id") REFERENCES "variations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variation_options" ADD CONSTRAINT "variation_options_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
