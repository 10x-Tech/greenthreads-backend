/*
  Warnings:

  - A unique constraint covering the columns `[productId,size_id,color_id]` on the table `skus` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "skus_size_id_color_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "skus_productId_size_id_color_id_key" ON "skus"("productId", "size_id", "color_id");
