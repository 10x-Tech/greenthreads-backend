import { Request, Response, NextFunction } from "express";
import prisma from "@/lib/prisma";
import AppError from "@/utils/AppError";
import catchAsync from "@/utils/catchAsync";
import {
  generateProductCode,
  generateSkuId,
  generateSlug,
} from "@/utils/helper";
import { Prisma } from "@prisma/client";
import xlsx from "xlsx";
import bulkUploadQueue from "@/Queue/queue";
import axios from "axios";

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
    const brandInfo = await prisma.brand.findUnique({
      where: {
        sellerId: userId,
      },
    });

    if (!brandInfo) {
      return next(
        new AppError(401, "Brand Not Found! Create One If not exist")
      );
    }

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
        brandId: brandInfo.id,
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

    const existingProduct = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        brand: {
          select: {
            name: true,
          },
        },
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
      const skuID = generateSkuId({
        brandName: existingProduct.brand?.name as string,
        size,
        color,
      });
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
    const search = req.query.search?.toString(); // Get search query parameter
    const status = req.query.status?.toString(); // Get status query parameter
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const offset = (page - 1) * limit;

    const query: Prisma.ProductFindManyArgs = {
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
      skip: offset,
      take: limit,
    };

    if (search) {
      // Add search filter using OR operator for multiple fields
      query.where = {
        ...query.where,
        OR: [
          { productName: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { categories: { some: { name: { contains: search } } } },
          { Brand: { name: { contains: search } } },
        ],
      };
    }

    // Apply the status filter if provided
    if (status === "active") {
      query.where = {
        ...query.where,
        isActive: true,
      };
    } else if (status === "inactive") {
      query.where = {
        ...query.where,
        isActive: false,
      };
    }

    const [products, count] = await prisma.$transaction([
      prisma.product.findMany(query),
      prisma.product.count({ where: query.where }),
    ]);

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      success: true,
      pagination: {
        total: count,
        page: page,
        limit: limit,
        pageCount: totalPages,
      },
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

export const bulkUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("bulkUpload REACHED");
  try {
    const userId = req?.auth?.userId;
    if (!userId) {
      return next(new AppError(401, "Unauthenticated"));
    }

    const fileUrl = req.body.fileUrl;
    if (!fileUrl) {
      return next(new AppError(400, "No file URL provided"));
    }

    // Download the file from the provided URL
    const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data);

    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet);

    // Add the rows and userId to the queue
    const queue = bulkUploadQueue.getQueue();
    if (!queue) {
      return next(new AppError(500, "Queue not initialized"));
    }

    await queue.add("bulkUpload", { rows, userId });

    res.status(202).json({ success: true, message: "File is being processed" });
  } catch (error) {
    next(error);
  }
};
