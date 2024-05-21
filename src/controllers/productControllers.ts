import { Request, Response, NextFunction } from "express";
import prisma from "@/lib/prisma";
import csvParser from "csv-parser";
import fs from "fs";
import AppError from "@/utils/AppError";
import catchAsync from "@/utils/catchAsync";
import { generateProductCode, generateSKU, generateSlug } from "@/utils/helper";
import { randomUUID } from "crypto";
import { v4 as uuidv4 } from "uuid";
import { bufferToJSON } from "@/middleware";

function generateSkuId(payload: any): string {
  const { size, color } = payload;
  const uuid = uuidv4(); // Assuming you have a function to generate UUIDs
  const shortUuid = uuid.replace(/-/g, "").substring(0, 6);
  const skuId = `${size.name}-${color.name}-${shortUuid}`;
  return skuId.toUpperCase();
}

//Create A Product
export const createProduct = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req?.auth?.userId;
    if (!userId) {
      return next(new AppError(401, "Unauthenticated"));
    }
    const {
      productName,
      description,
      categoryId,
      subCategoryId,
      subSubCategoryId,
      deliveryRange,
      retailPrice,
      discountPercentage,
      discountedPrice,
      isNextDayDelivery = false,
      shippingInfo,
      productImages = [],
    } = req.body;
    // Extract and parse shipping dimensions (handle potential parsing errors)
    const { width = 0, length = 0, height = 0, weight = 0 } = shippingInfo;
    const parsedDimensions = {
      width: parseInt(width, 10),
      length: parseInt(length, 10),
      height: parseInt(height, 10),
      weight: parseInt(weight, 10),
    };

    // Build category connections (avoid unnecessary array creation)
    const categoriesToConnect = [categoryId, subCategoryId, subSubCategoryId]
      .filter((category) => category?.id)
      .map((category) => ({ id: category.id }));
    const productSlug = generateSlug(productName);
    const productCode = generateProductCode(
      productName,
      categoryId?.name,
      subCategoryId?.name,
      subSubCategoryId?.name
    );
    const previewImage = productImages?.[0]?.url ?? "";
    const newProduct = await prisma.product.create({
      data: {
        sellerId: userId,
        productName,
        productSlug,
        productCode,
        description,
        originalPrice: retailPrice,
        discountPercentage: discountPercentage,
        discountedPrice: discountedPrice,
        categories: {
          connect: categoriesToConnect,
        },
        ...parsedDimensions,
        deliveryRange,
        previewImage,
        isNextDayDelivery,
      },
    });

    await prisma.productInventory.create({
      data: {
        productId: newProduct.id,
        totalStock: 0,
        unitPrice: retailPrice,
        totalPrice: retailPrice,
        isActive: true,
      },
    });

    // Create product images
    if (productImages.length > 0) {
      const imageRecords = productImages.map(
        (image: { url: string; name: string; size: number }) => ({
          productId: newProduct.id,
          url: image.url,
          name: image?.name,
          size: image?.size,
        })
      );

      await prisma.productImage.createMany({
        data: imageRecords,
      });
    }

    res.status(200).json({
      success: true,
      product: newProduct,
    });
  }
);

//CreateUpdateSKUs
export const createOrUpdateSKU = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;
    const { skus = [] } = req.body;
    console.log(skus, "SKUS");

    const existingProduct = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!existingProduct) {
      return next(new AppError(404, "Product Not Found!"));
    }

    const existingProductInventory = await prisma.productInventory.findUnique({
      where: { productId },
    });

    if (!existingProductInventory) {
      return next(new AppError(404, "Product Inventory Not Found!"));
    }

    // Delete existing SKUInventory entries for the product
    await prisma.sKUInventory.deleteMany({
      where: { productInventoryId: existingProductInventory.id },
    });

    // Update or create SKUs
    for (const sku of skus) {
      const { id, title, size, color, availableStock } = sku;
      const skuID = generateSkuId({ size, color });
      //   let updatedOrNewSKU;
      //   if (id) {
      //     const existingSKU = await prisma.sKU.findUnique({
      //       where: { id },
      //     });
      //     if (!existingSKU) {
      //       return next(new AppError(404, "SKU Not Found!"));
      //     }
      //     updatedOrNewSKU = await prisma.sKU.update({
      //       where: { id: existingSKU.id },
      //       data: {
      //         title,
      //         sizeId: size?.id,
      //         colorId: color.id,
      //         availableStock,
      //         productId: existingProduct.id,
      //       },
      //     });
      //   } else {
      //     updatedOrNewSKU = await prisma.sKU.create({
      //       data: {
      //         title,
      //         skuId: randomUUID(),
      //         sizeId,
      //         colorId,
      //         productId,
      //         availableStock,
      //       },
      //     });
      //   }
      const updatedOrNewSKU = await prisma.sKU.upsert({
        where: { id: id ?? "1" },
        update: {
          availableStock,
          productId: existingProduct.id,
        },
        create: {
          title,
          skuId: skuID,
          sizeId: size?.id,
          colorId: color?.id,
          productId,
          availableStock,
        },
      });

      // Create SKUInventory
      await prisma.sKUInventory.create({
        data: {
          productInventoryId: existingProductInventory.id, // Provide the ID of the product inventory
          skuId: updatedOrNewSKU.id, // Use the ID of the created SKU
          availableStock, // Optionally set the initial stock
        },
      });
    }

    // Update total stock in ProductInventory
    const totalStock = skus.reduce(
      (total: number, sku: any) => total + sku.availableStock,
      0
    );

    const totalPrice = totalStock * existingProduct.originalPrice;

    await prisma.productInventory.update({
      where: { id: existingProductInventory.id },
      data: {
        totalStock,
        totalPrice,
      },
    });

    res.status(200).json({ success: true });
  }
);

// Get All Products
export const getAllProducts = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req?.auth?.userId;
    const products = await prisma.product.findMany({
      where: {
        sellerId: userId,
        isDeleted: false,
      },
      include: {
        categories: true,
        productImages: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      data: products,
    });
  }
);

//Get Product By Id
export const getProductById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        skus: true,
        categories: {
          include: {
            children: {
              include: {
                children: true, // Include further nested children if needed
              },
            },
          },
        },
        productInventory: {
          include: {
            skuInventory: true,
          },
        },
        productImages: {
          select: {
            url: true,
            name: true,
            size: true,
          },
        },
      },
    });
    if (product) {
      res.status(200).json({
        success: true,
        data: product,
      });
    } else {
      return next(new AppError(404, "Product Not Found!"));
    }
  }
);

// Update a product
export const updateProduct = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const productId = req.params.productId;
    const {
      productName,
      description,
      categoryId,
      subCategoryId,
      subSubCategoryId,
      productImages,
      deliveryRange,
      retailPrice,
      discountPercentage,
      discountedPrice,
      isNextDayDelivery = false,
      shippingInfo,
    } = req.body;

    const { width = 0, length = 0, height = 0, weight = 0 } = shippingInfo;
    const parsedDimensions = {
      width: parseInt(width, 10),
      length: parseInt(length, 10),
      height: parseInt(height, 10),
      weight: parseInt(weight, 10),
    };

    const existingProduct = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        categories: true,
        productInventory: true,
      },
    });

    if (!existingProduct) {
      return next(new AppError(404, "Product Not Found!"));
    }
    // Build category connections (avoid unnecessary array creation)
    const categoriesToConnect = [categoryId, subCategoryId, subSubCategoryId]
      .filter((category) => category?.id)
      .map((category) => ({ id: category.id }));

    const productSlug = generateSlug(productName);
    const previewImage = productImages?.[0]?.url ?? "";

    try {
      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: {
          productName,
          productSlug,
          description,
          originalPrice: retailPrice,
          discountPercentage: discountPercentage,
          discountedPrice: discountedPrice,
          categories: {
            disconnect: existingProduct.categories.map((category) => ({
              id: category.id,
            })),
            connect: categoriesToConnect,
          },
          ...parsedDimensions,
          deliveryRange,
          previewImage,
          isNextDayDelivery,
        },
        include: {
          categories: true,
        },
      });

      if (productImages.length > 0) {
        await prisma.productImage.deleteMany({
          where: { productId: productId },
        });
        const imageRecords = productImages.map(
          (image: { url: string; name: string; size: number }) => ({
            productId: productId,
            url: image.url,
            name: image?.name,
            size: image?.size,
          })
        );

        await prisma.productImage.createMany({
          data: imageRecords,
        });
      }

      if (existingProduct.productInventory) {
        const updatedProductInventory = {
          totalPrice: existingProduct.productInventory
            ? existingProduct.productInventory?.totalStock * retailPrice
            : retailPrice,
          unitPrice: retailPrice,
        };
        await prisma.productInventory.update({
          where: { id: existingProduct.productInventory.id },
          data: updatedProductInventory,
        });
      }

      res.status(200).json(updatedProduct);
    } catch (error: any) {
      console.error(error);
      return next(new AppError(500, error.message));
    }
  }
);

// Delete a product
export const deleteProduct = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;

    const deletedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        isDeleted: true,
      },
    });
    if (deletedProduct === null) {
      return next(new AppError(404, "Product not found"));
    }

    res
      .status(200)
      .json({ success: true, message: "Product Deleted successfully" });
  }
);

//SKUS
export const getAllSkus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;

    const skus = await prisma.sKU.findMany({
      where: { productId },
      select: {
        id: true,
        skuId: true,
        size: true,
        color: true,
        title: true,
        availableStock: true,
      },
    });

    res.status(200).json({ success: true, data: skus });
  }
);

//Variations
export const getAllVariations = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const sizes = await prisma.size.findMany({});
    const colors = await prisma.color.findMany({});

    res.status(200).json({
      success: true,
      sizes: sizes,
      colors: colors,
    });
  }
);

///////// HELPER FUNCTIONS ????????
