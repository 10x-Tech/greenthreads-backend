/*
  Warnings:

  - You are about to drop the column `status` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `totalPrice` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `unitPrice` on the `OrderItem` table. All the data in the column will be lost.
  - Added the required column `amountDiscount` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amountSubTotal` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amountTax` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amountTotal` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit_amount` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "status";

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "totalPrice",
DROP COLUMN "unitPrice",
ADD COLUMN     "amountDiscount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "amountSubTotal" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "amountTax" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "amountTotal" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "sellerId" TEXT,
ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "unit_amount" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "productImage" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "seller"("id") ON DELETE SET NULL ON UPDATE CASCADE;
