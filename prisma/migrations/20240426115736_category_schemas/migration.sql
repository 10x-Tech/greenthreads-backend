/*
  Warnings:

  - The primary key for the `Category` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `catId` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `categoryIcon` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `categoryName` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the `SubCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ProductToCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ProductToSubCategory` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `left` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `right` to the `Category` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SubCategory" DROP CONSTRAINT "SubCategory_categoryCatId_fkey";

-- DropForeignKey
ALTER TABLE "_ProductToCategory" DROP CONSTRAINT "_ProductToCategory_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProductToCategory" DROP CONSTRAINT "_ProductToCategory_B_fkey";

-- DropForeignKey
ALTER TABLE "_ProductToSubCategory" DROP CONSTRAINT "_ProductToSubCategory_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProductToSubCategory" DROP CONSTRAINT "_ProductToSubCategory_B_fkey";

-- AlterTable
ALTER TABLE "Category" DROP CONSTRAINT "Category_pkey",
DROP COLUMN "catId",
DROP COLUMN "categoryIcon",
DROP COLUMN "categoryName",
DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "left" INTEGER NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "parentId" INTEGER,
ADD COLUMN     "right" INTEGER NOT NULL,
ADD CONSTRAINT "Category_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "SubCategory";

-- DropTable
DROP TABLE "_ProductToCategory";

-- DropTable
DROP TABLE "_ProductToSubCategory";

-- CreateTable
CREATE TABLE "ProductCategory" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;
