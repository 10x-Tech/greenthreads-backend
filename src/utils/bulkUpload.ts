import prisma from "@/lib/prisma";
import { generateSkuId } from "@/utils/helper";
import AppError from "@/utils/AppError";

export const createSkus = async (
  tx: any,
  newProduct: any,
  brandName: string,
  variations: any[]
) => {
  for (const variation of variations) {
    const { size, color, availableStock } = variation;
    const sizeId = await getSizeId(size);
    const colorId = await getColorId(color);

    const skuID = generateSkuId({
      brandName,
      size,
      color,
    });

    const newSKU = await tx.sKU.create({
      data: {
        title: `${size}-${color}`,
        skuId: skuID,
        sizeId,
        colorId,
        productId: newProduct.id,
        availableStock,
      },
    });

    // Create SKUInventory
    await tx.sKUInventory.create({
      data: {
        productInventoryId: newProduct.productInventory.id,
        skuId: newSKU.id,
        availableStock,
      },
    });

    // Update total stock in ProductInventory
    const totalStock = availableStock;
    const totalPrice = totalStock * newProduct.originalPrice;

    await tx.productInventory.update({
      where: { id: newProduct.productInventory.id },
      data: {
        totalStock: { increment: totalStock },
        totalPrice: { increment: totalPrice },
      },
    });
  }
};

export const validateRow = (row: any) => {
  const requiredFields = [
    "ProductName",
    "ProductDescription",
    "ProductPrice",
    // "DiscountPercentage",
    "IsNextDayDelivery",
    "DeliveryRange",
    "Category",
    // "SubCategory",
    // "SubSubCategory",
    // "Size",
    // "Color",
  ];

  for (const field of requiredFields) {
    if (!row[field]) {
      throw new AppError(400, `Missing required field: ${field}`);
    }
  }
};

export const getSizeId = async (sizeName: string) => {
  let size = await prisma.size.findUnique({
    where: { name: sizeName },
  });
  if (!size) {
    size = await prisma.size.create({ data: { name: sizeName } });
  }
  return size.id;
};

export const getColorId = async (colorName: string) => {
  let color = await prisma.color.findUnique({ where: { name: colorName } });
  if (!color) {
    color = await prisma.color.create({ data: { name: colorName } });
  }
  return color.id;
};
