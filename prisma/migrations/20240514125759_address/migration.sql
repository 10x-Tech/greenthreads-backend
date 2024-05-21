/*
  Warnings:

  - You are about to drop the column `postalCode` on the `address` table. All the data in the column will be lost.
  - You are about to drop the column `street` on the `address` table. All the data in the column will be lost.
  - Added the required column `postal_code` to the `address` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "address" DROP COLUMN "postalCode",
DROP COLUMN "street",
ADD COLUMN     "line1" TEXT,
ADD COLUMN     "line2" TEXT,
ADD COLUMN     "postal_code" TEXT NOT NULL;
