/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Brand` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sellerId]` on the table `Brand` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sellerId` to the `Brand` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "sellerId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_key" ON "Brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_sellerId_key" ON "Brand"("sellerId");

-- CreateIndex
CREATE INDEX "Brand_sellerId_idx" ON "Brand"("sellerId");

-- CreateIndex
CREATE INDEX "Brand_name_idx" ON "Brand"("name");

-- AddForeignKey
ALTER TABLE "Brand" ADD CONSTRAINT "Brand_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "seller"("externalId") ON DELETE RESTRICT ON UPDATE CASCADE;
