/*
  Warnings:

  - The primary key for the `ProductCategory` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "ProductCategory" DROP CONSTRAINT "ProductCategory_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ProductCategory_id_seq";
