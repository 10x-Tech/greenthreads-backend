-- CreateTable
CREATE TABLE "Seller" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Seller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "collectionName" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "productImages" TEXT[],
    "productName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "materialUsed" TEXT NOT NULL,
    "color" TEXT[],
    "sizesAvailable" TEXT[],
    "suggestedRRPInGBP" DOUBLE PRECISION NOT NULL,
    "wholesalePriceInGBP" DOUBLE PRECISION NOT NULL,
    "care" TEXT,
    "sellerId" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE SET NULL ON UPDATE CASCADE;
