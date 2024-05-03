import { Request, Response, NextFunction } from "express";
import prisma from "@/lib/prisma";
import csvParser from "csv-parser";
import {
  Product,
  // ProductVariation,
  // ProductVariationOption,
} from "@prisma/client";
import fs from "fs";
import AppError from "@/utils/AppError";
import catchAsync from "@/utils/catchAsync";
import { v4 as uuidv4 } from "uuid";

// async function parseCSV(file: Express.Multer.File): Promise<ProductData[]> {
//   const results: ProductData[] = [];

//   return new Promise((resolve, reject) => {
//     fs.createReadStream(file.path)
//       .pipe(csvParser())
//       .on("data", (data) => {
//         const subSkus: SubSkuData[] = [];
//         for (let i = 1; i <= 3; i++) {
//           const size = data[`size_${i}`];
//           const stock = Number(data[`stock_${i}`]);
//           const originalPrice = Number(data[`original_price_${i}`]);
//           const productImages = data[`images_${i}`].split("|").filter(Boolean);

//           if (size && stock && originalPrice) {
//             subSkus.push({
//               size,
//               stock,
//               originalPrice,
//               productImages,
//             });
//           }
//         }

//         results.push({
//           productName: data.name,
//           description: data.description,
//           status: data.status,
//           originalPrice: Number(data.original_price),
//           category: data.category,
//           discountedPrice: Number(data.discounted_price),
//           productImages: data.images.split("|").filter(Boolean),
//           subSkus,
//           collectionName: data?.collectionName,
//           suggestedRRPInGBP: data?.suggestedRRPInGBP,
//           wholesalePriceInGBP: data?.wholesalePriceInGBP,
//           materialUsed: data?.materialUsed,
//           sku: data?.sku,
//         });
//       })
//       .on("end", () => {
//         resolve(results);
//       })
//       .on("error", (error) => {
//         reject(error);
//       });
//   });
// }

// export const bulkUpload = catchAsync(
//   async (req: Request, res: Response): Promise<void> => {
//     console.log("REQUESTFILE", req.file);
//     if (!req.file) {
//       res.status(400).json({ message: "No file uploaded" });
//       return;
//     }

//     const productsData = await parseCSV(req.file);

//     for (const productData of productsData) {
//       console.log(productData, "PRODUCTDATA");
//       await createProduct(productData);
//     }

//     res.status(201).json({ message: "Bulk upload successful" });
//   }
// );

//GET PRODUCT BY ID
export const getProductById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        variations: {
          include: {
            variationOptions: true, // Include variation options
          },
        },
        categories: {
          include: {
            children: {
              include: {
                children: true, // Include further nested children if needed
              },
            },
            products: true, // Include products associated with each category
          },
        },
        combinations: true, // Include combinations
      },
      // include: {
      //   categories: {
      //     include: {
      //       category: {
      //         include: {
      //           children: {
      //             include: {
      //               children: true,
      //             },
      //           },
      //         },
      //       },
      //     },
      //   },
      // },
    });

    if (product) {
      res.status(200).json(product);
    }
  }
);

export const getAllProducts = catchAsync(
  async (req: Request, res: Response) => {
    const products = await prisma.product.findMany({
      include: {
        categories: true,
        productImages: true,
        combinations: true,
      },
    });

    res.status(200).json(products);
  }
);

//Create A Product
export const createProduct = catchAsync(async (req: Request, res: Response) => {
  const {
    productName,
    productSlug = "",
    description,
    categoryId,
    subCategoryId,
    subSubCategoryId,
    previewImage = "",
    variations,
    deliveryRange,
    retailPrice,
    discountPercentage,
    discountedPrice,
    isNextDayDelivery = false,
    combinations,
    shippingInfo,
  } = req.body;
  const { width, length, height, weight } = shippingInfo;
  try {
    const newProduct = await prisma.product.create({
      data: {
        productName,
        productSlug,
        description,
        originalPrice: retailPrice,
        discountPercentage: discountPercentage,
        discountedPrice: discountedPrice,
        categories: {
          connect: [
            { id: categoryId.id },
            { id: subCategoryId.id },
            { id: subSubCategoryId.id },
          ],
        },
        variations: {
          connectOrCreate: variations.map((variant: any) => ({
            where: { name: variant.variantName }, // Match existing variations by name
            create: {
              name: variant.variantName,
              variationOptions: {
                create: variant.options.map((opt: any) => ({
                  name: opt.label,
                })),
              },
            },
          })),
        },
        width,
        height,
        length,
        weight,
        deliveryRange,
        previewImage,
        isNextDayDelivery,
      },
      include: {
        variations: {
          include: {
            variationOptions: true,
          },
        },
        combinations: true,
        categories: true,
      },
    });

    await createProductCombinations({
      productId: newProduct.id,
      combinations,
    });
    res.status(200).json(newProduct);
  } catch (error: any) {
    console.log(error);
    return new AppError(500, error.message);
  }
});

export const createProductCombinations = async ({
  productId,
  combinations,
}: {
  productId: string;
  combinations: any[];
}) => {
  try {
    const productCombinations = [];

    for (const combination of combinations) {
      const { stock } = combination;

      const skuId = generateSkuId(combination);
      const createdCombination = await prisma.productCombination.create({
        data: {
          skuId: skuId,
          availableStock: stock,
          productId: productId,
        },
      });

      productCombinations.push(createdCombination);
    }

    return productCombinations;
  } catch (error) {
    console.log(error);
  }
};

// Update a product
export const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const { productId } = req.params;
  const { productName, productSlug, description, categories, previewImage } =
    req.body;

  const updatedProduct = await prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      productName,
      productSlug,
      description,
      categories: { set: categories },
      previewImage,
    },
  });

  if (updatedProduct) {
    res.status(200).json(updatedProduct);
  } else {
    res.status(404).json({ message: "Product not found" });
  }
});

// Delete a product
export const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const { productId } = req.params;

  const deletedProduct = await prisma.product.delete({
    where: {
      id: productId,
    },
  });

  if (deletedProduct) {
    res.status(200).json(deletedProduct);
  } else {
    res.status(404).json({ message: "Product not found" });
  }
});

function generateSkuId(combination: any) {
  const skuAttributes = Object.values(combination).join("_");
  const uuid = uuidv4();
  const shortUuid = uuid.replace(/-/g, "").substring(0, 6);
  const skuId = `${skuAttributes}_${shortUuid}`;
  return skuId.toUpperCase();
}

// // async function createProductCombinations({
// //   productId,
// //   variationOptions,
// //   availableStock,
// //   unitPrice,
// // }: {
// //   productId: string;
// //   variationOptions: ProductVariationOption[];
// //   availableStock: number;
// //   unitPrice: number;
// // }) {
// //   try {
// //     const combinations: ProductVariationOption[][] =
// //       generateCombinations(variationOptions);
// //     console.log(combinations, "COMBINATIONS");
// //     // Iterate through each combination and create ProductCombination entries
// //     for (const combination of combinations) {
// //       // Create ProductCombination entry
// //       const productCombination = await prisma.productCombination.create({
// //         data: {
// //           productId,
// //           skuId: generateSkuId(combination),
// //           availableStock,
// //         },
// //       });

// //       await prisma.productStock.create({
// //         data: {
// //           totalStock: availableStock,
// //           unitPrice,
// //           productCombinationId: productCombination.id,
// //           totalPrice: unitPrice * availableStock,
// //         },
// //       });

// //       console.log(`Created ProductCombination: ${productCombination.id}`);
// //     }

// //     console.log("All product combinations created successfully.");
// //   } catch (error) {
// //     console.error("Error creating product combinations:", error);
// //     throw error;
// //   }
// // }

// // Helper function to generate all combinations of variation options
// function generateCombinations(
//   variationOptions: ProductVariationOption[]
// ): ProductVariationOption[][] {
//   const result: ProductVariationOption[][] = [[]];

//   for (const option of variationOptions) {
//     const currentCombinations = [...result];

//     for (const combination of currentCombinations) {
//       result.push([...combination, option]);
//     }
//   }

//   return result.slice(1); // Remove the empty combination [[]] at the beginning
// }

//CATEGORY

// export const createProductCategory = async ({
//   categoryId,
//   subCategoryId,
//   subSubCategoryId,
//   productId,
// }: any) => {
//   try {
//     const categoryIds: string[] = [
//       categoryId,
//       subCategoryId,
//       subSubCategoryId,
//     ].filter(Boolean);

//     categoryIds.forEach(async (categoryId) => {
//       try {
//         await prisma.productCategory.create({
//           data: {
//             categoryId,
//             productId,
//           },
//         });
//       } catch (error) {
//         console.error("Error creating ProductCategory entry:", error);
//       }
//     });
//   } catch (error) {
//     console.log(error);
//   }
// };

// VARIATIONS
export const createVariation = catchAsync(
  async (req: Request, res: Response) => {
    try {
      const { name, variationOptions } = req.body;

      // Validate data (consider using a validation library like Joi)
      if (!name || !variationOptions || variationOptions.length === 0) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Efficiently create Variation and VariationOptions in one transaction
      const createdVariation = await prisma.variation.create({
        data: {
          name,
          variationOptions: {
            create: variationOptions.map((option: any) => ({
              name: option.name,
            })),
          },
        },
        include: { variationOptions: true }, // Include related options
      });

      res.status(201).json(createdVariation);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

export const getVariations = async (req: Request, res: Response) => {
  try {
    const variations = await prisma.variation.findMany({
      include: { variationOptions: true }, // Include related options
    });
    res.status(200).json(variations);
  } catch (error) {
    console.log(error, "ERROR");
  }
};
export const updateVariation = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, variationOptions } = req.body;

    const existingVariation = await prisma.variation.findUnique({
      where: { id },
    });

    if (!existingVariation) {
      return new AppError(404, "Variation not found");
    }

    if (!name || !variationOptions || variationOptions.length === 0) {
      return new AppError(400, "Missing required fields");
    }

    const updatedVariation = await prisma.variation.update({
      where: { id },
      data: {
        name,
      },
      include: { variationOptions: true }, // Include related variationOptions for response
    });

    await Promise.all(
      variationOptions.map(async (option: any) => {
        await prisma.variationOption.upsert({
          where: { id: option.id },
          update: { name: option.name },
          create: { name: option.name, variationId: id },
        });
      })
    );
    res.status(200).json(updatedVariation);
  }
);

export const deleteVariation = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const deletedVariation = await prisma.variation.delete({
      where: { id },
      include: { variationOptions: true }, // Include related options
    });

    if (!deletedVariation) {
      return new AppError(404, "Variation not found");
    }

    res.json(deletedVariation);
  }
);
