-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "SubSku" (
    "id" TEXT NOT NULL,
    "stock" INTEGER NOT NULL,
    "originalPrice" DOUBLE PRECISION NOT NULL,
    "size" TEXT NOT NULL,
    "productImages" TEXT[],
    "productId" TEXT NOT NULL,

    CONSTRAINT "SubSku_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "profileImg" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_mobile_key" ON "User"("mobile");

-- AddForeignKey
ALTER TABLE "SubSku" ADD CONSTRAINT "SubSku_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
