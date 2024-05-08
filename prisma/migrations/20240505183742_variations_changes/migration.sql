-- CreateTable
CREATE TABLE "_ProductToVariationOptions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProductToVariationOptions_AB_unique" ON "_ProductToVariationOptions"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductToVariationOptions_B_index" ON "_ProductToVariationOptions"("B");

-- AddForeignKey
ALTER TABLE "_ProductToVariationOptions" ADD CONSTRAINT "_ProductToVariationOptions_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToVariationOptions" ADD CONSTRAINT "_ProductToVariationOptions_B_fkey" FOREIGN KEY ("B") REFERENCES "variation_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;
