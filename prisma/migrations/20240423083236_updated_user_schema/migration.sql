/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `firstName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - The required column `user_id` was added to the `User` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- CreateEnum
CREATE TYPE "VendorRole" AS ENUM ('ADMIN', 'SELLER');

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "firstName",
DROP COLUMN "id",
DROP COLUMN "lastName",
DROP COLUMN "password",
DROP COLUMN "role",
ADD COLUMN     "user_id" TEXT NOT NULL,
ALTER COLUMN "phoneNumber" DROP NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("user_id");

-- DropEnum
DROP TYPE "USERROLE";

-- CreateTable
CREATE TABLE "Customer" (
    "customer_id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "address" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("customer_id")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "vendor_id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "address" TEXT,
    "role" "VendorRole" NOT NULL DEFAULT 'SELLER',
    "userId" TEXT NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("vendor_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_userId_key" ON "Customer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_userId_key" ON "Vendor"("userId");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
