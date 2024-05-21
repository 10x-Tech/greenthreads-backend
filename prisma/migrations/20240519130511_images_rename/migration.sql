/*
  Warnings:

  - The `size` column on the `product_images` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "product_images" DROP COLUMN "size",
ADD COLUMN     "size" INTEGER;
