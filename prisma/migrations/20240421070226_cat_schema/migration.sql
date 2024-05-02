-- CreateEnum
CREATE TYPE "USERROLE" AS ENUM ('ADMIN', 'SELLER');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "category" TEXT,
ADD COLUMN     "discountedPrice" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "USERROLE" NOT NULL DEFAULT 'SELLER';
