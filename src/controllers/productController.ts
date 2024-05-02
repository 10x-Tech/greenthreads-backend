import { Request, Response, NextFunction } from "express";
import prisma from "@/lib/prisma";
import csvParser from "csv-parser";
import {
  Product,
  ProductVariation,
  ProductVariationOption,
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
      select: {
        id: true,
        productName: true,
        description: true,
        deliveryRange: true,
        isActive: true,
        isNextDayDelivery: true,
        createdAt: true,
        updatedAt: true,
        categories: {
          // select: {
          //   category: {
          //     select: {
          //       id: true,
          //       name: true,
          //       description: true,
          //       parentId: true,
          //     },
          //   },
          // },

          include: {
            category: {
              include: {
                children: {
                  include: {
                    children: true,
                  },
                },
              },
            },
          },
        },
        ProductVariation: {
          select: {
            id: true,
            Variant: {
              select: {
                id: true,
                name: true,
              },
            },
            options: {
              select: {
                id: true,
                VariationOption: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        ProductCombination: {
          select: {
            id: true,
            skuId: true,
            availableStock: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
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
        ProductImage: true,
        ProductCombination: true,
      },
    });

    res.status(200).json(products);
  }
);

//Create A Product
export const createProduct = catchAsync(async (req: Request, res: Response) => {
  const {
    productName,
    productSlug,
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
  } = req.body;
  try {
    const newProduct = await prisma.product.create({
      data: {
        productName,
        productSlug: "",
        description,
        // variations: { create: variations },
        deliveryRange,
        previewImage,
        isNextDayDelivery,
      },
      include: {
        ProductVariation: true,
        ProductCombination: true,
        categories: true,
      },
    });

    await createProductCategory({
      categoryId: categoryId.id,
      subCategoryId: subCategoryId.id,
      subSubCategoryId: subSubCategoryId.id,
      productId: newProduct.id,
    });

    await createProductVariations({
      productId: newProduct.id,
      variations: variations,
    });

    await createProductCombinations({
      productId: newProduct.id,
      combinations,
    });
    res.status(200).json(newProduct);
  } catch (error) {
    console.log(error);
  }
});

// export const createProductVariations = async ({
//   productId,
//   variations,
// }: {
//   productId: string;
//   variations: any[];
// }) => {
//   const createdVariations = [];

//   try {
//     for (const variation of variations) {
//       const { variationName, options } = variation;

//       const createdVariation: ProductVariation =
//         await prisma.productVariation.create({
//           data: {
//             variationName,
//             options: {
//               create: options.map((option: any) => ({
//                 optionName: option.optionName,
//               })),
//             },
//             products: { connect: { productId } },
//           },
//           include: {
//             options: true,
//           },
//         });

//       createdVariations.push(createdVariation);
//     }

//     console.log("Created product variations:", createdVariations);
//     return createdVariations;
//   } catch (error) {
//     console.error("Error creating product variations:", error);
//     throw error;
//   }
// };

// const createProductVariations = async ({
//   variationData,
//   productId,
// }: {
//   variationData: any;
//   productId: string;
// }) => {
//   try {
//     const variations = [];

//     for (const item of variationData) {
//       const variation = await prisma.productVariation.create({
//         data: {
//           // variationName: item.type,
//           options: {
//             create: item.options.map((option: any) => ({
//               optionName: option.value,
//             })),
//           },
//           products: {
//             connect: { id: productId },
//           },
//         },
//         include: {
//           options: true,
//         },
//       });

//       variations.push(variation);
//     }

//     return variations;
//   } catch (error) {
//     console.log(error);
//   }
// };

async function createProductVariations({
  productId,
  variations,
}: {
  productId: string;
  variations: any[];
}) {
  // await prisma.product.create({
  //   data: {
  //     ProductVariation: {
  //       create: variations.map((variant) => ({
  //         Variant: {
  //           connect: { id: variant.variantId },
  //         },
  //       })),
  //     },
  //   },
  // });
  await prisma.product.create({
    data: {
      variations: {
        create: variations.map((variant) => ({
          VariationOptions: {
            create: variant.options.map((opt) => ({
              connect: {
                id: opt.id,
                variationId: variant.variantId,
              },
            })),
          },
        })),
      },
    },
  });
  // const productVariations = await Promise.all(
  //   variations.map(async (variation) => {
  //     // Create ProductVariation for each variation
  //     const productVariation = await prisma.productVariation.create({
  //       data: {
  //         productId,
  //         variantId: variation.variantId,
  //       },
  //     });
  //     // {
  //     //   variantId:'asdf',
  //     //   name:'Size',
  //     //   options:[{
  //     //     optionId:'asdf',
  //     //     name:"small"
  //     //   }]
  //     // }
  //     // Create ProductVariationOptions for each option
  //     const productVariationOptions = await Promise.all(
  //       variation.options.map(async (option: any) => {
  //         return prisma.productVariationOption.create({
  //           data: {
  //             productVariationId: productVariation.id,
  //             optionId: option.value,
  //           },
  //         });
  //       })
  //     );

  //     return productVariation;
  //   })
  // );

  return productVariations;
}

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

export const createProductCategory = async ({
  categoryId,
  subCategoryId,
  subSubCategoryId,
  productId,
}: any) => {
  try {
    const categoryIds: string[] = [
      categoryId,
      subCategoryId,
      subSubCategoryId,
    ].filter(Boolean);

    categoryIds.forEach(async (categoryId) => {
      try {
        await prisma.productCategory.create({
          data: {
            categoryId,
            productId,
          },
        });
      } catch (error) {
        console.error("Error creating ProductCategory entry:", error);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

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
      const createdVariation = await prisma.variations.create({
        data: {
          name,
          VariationOptions: {
            createMany: {
              data: variationOptions.map((option: any) => ({
                name: option.name,
              })),
            },
          },
        },
        include: { VariationOptions: true }, // Include related options
      });

      res.status(201).json(createdVariation);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

export const getVariations = catchAsync(async (req: Request, res: Response) => {
  try {
    const variations = await prisma.variations.findMany({
      include: { VariationOptions: true }, // Include related options
    });
    res.status(200).json(variations);
  } catch (error) {
    console.log(error);
  }
});
export const updateVariation = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, variationOptions } = req.body;

    const existingVariation = await prisma.variations.findUnique({
      where: { id },
    });

    if (!existingVariation) {
      return new AppError(404, "Variation not found");
    }

    // Validate data (consider using a validation library like Joi)
    if (!name || !variationOptions || variationOptions.length === 0) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const updatedVariation = await prisma.variations.update({
      where: { id },
      data: {
        name,
        VariationOptions: {
          deleteMany: {}, // Delete existing options
          createMany: {
            data: variationOptions.map((option: any) => ({ name: option })),
          },
        },
      },
      include: { VariationOptions: true }, // Include related options
    });

    res.json(updatedVariation);
  }
);

export const deleteVariation = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const deletedVariation = await prisma.variations.delete({
      where: { id },
      include: { VariationOptions: true }, // Include related options
    });

    if (!deletedVariation) {
      return new AppError(404, "Variation not found");
    }

    res.json(deletedVariation);
  }
);
