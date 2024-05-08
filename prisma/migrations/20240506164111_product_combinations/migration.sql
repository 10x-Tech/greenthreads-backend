-- AlterTable
ALTER TABLE "product_combinations" ADD COLUMN     "productVariationId" TEXT;

-- AddForeignKey
ALTER TABLE "product_combinations" ADD CONSTRAINT "product_combinations_productVariationId_fkey" FOREIGN KEY ("productVariationId") REFERENCES "product_variations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
