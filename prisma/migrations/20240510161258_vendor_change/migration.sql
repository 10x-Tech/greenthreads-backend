/*
  Warnings:

  - You are about to drop the column `externalId` on the `User` table. All the data in the column will be lost.
  - The primary key for the `customer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `customer_id` on the `customer` table. All the data in the column will be lost.
  - The primary key for the `seller` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `seller_id` on the `seller` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[externalId]` on the table `customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[externalId]` on the table `seller` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `externalId` to the `customer` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `customer` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `externalId` to the `seller` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `seller` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_seller_id_fkey";

-- DropIndex
DROP INDEX "User_externalId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "externalId";

-- AlterTable
ALTER TABLE "customer" DROP CONSTRAINT "customer_pkey",
DROP COLUMN "customer_id",
ADD COLUMN     "externalId" TEXT NOT NULL,
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "customer_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "seller" DROP CONSTRAINT "seller_pkey",
DROP COLUMN "seller_id",
ADD COLUMN     "externalId" TEXT NOT NULL,
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "seller_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "customer_externalId_key" ON "customer"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "seller_externalId_key" ON "seller"("externalId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "seller"("externalId") ON DELETE SET NULL ON UPDATE CASCADE;
