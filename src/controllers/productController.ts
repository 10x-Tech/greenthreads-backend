// import { Request, Response, NextFunction } from "express";
// import prisma from "@/lib/prisma";
// import csvParser from "csv-parser";
// import {
//   Product,
//   // ProductVariation,
//   // ProductVariationOption,
// } from "@prisma/client";
// import fs from "fs";
// import AppError from "@/utils/AppError";
// import catchAsync from "@/utils/catchAsync";
// import { v4 as uuidv4 } from "uuid";
// import { generateProductCode, generateSKU, generateSlug } from "@/utils/helper";

// // async function parseCSV(file: Express.Multer.File): Promise<ProductData[]> {
// //   const results: ProductData[] = [];

// //   return new Promise((resolve, reject) => {
// //     fs.createReadStream(file.path)
// //       .pipe(csvParser())
// //       .on("data", (data) => {
// //         const subSkus: SubSkuData[] = [];
// //         for (let i = 1; i <= 3; i++) {
// //           const size = data[`size_${i}`];
// //           const stock = Number(data[`stock_${i}`]);
// //           const originalPrice = Number(data[`original_price_${i}`]);
// //           const productImages = data[`images_${i}`].split("|").filter(Boolean);

// //           if (size && stock && originalPrice) {
// //             subSkus.push({
// //               size,
// //               stock,
// //               originalPrice,
// //               productImages,
// //             });
// //           }
// //         }

// //         results.push({
// //           productName: data.name,
// //           description: data.description,
// //           status: data.status,
// //           originalPrice: Number(data.original_price),
// //           category: data.category,
// //           discountedPrice: Number(data.discounted_price),
// //           productImages: data.images.split("|").filter(Boolean),
// //           subSkus,
// //           collectionName: data?.collectionName,
// //           suggestedRRPInGBP: data?.suggestedRRPInGBP,
// //           wholesalePriceInGBP: data?.wholesalePriceInGBP,
// //           materialUsed: data?.materialUsed,
// //           sku: data?.sku,
// //         });
// //       })
// //       .on("end", () => {
// //         resolve(results);
// //       })
// //       .on("error", (error) => {
// //         reject(error);
// //       });
// //   });
// // }

// // export const bulkUpload = catchAsync(
// //   async (req: Request, res: Response): Promise<void> => {
// //     console.log("REQUESTFILE", req.file);
// //     if (!req.file) {
// //       res.status(400).json({ message: "No file uploaded" });
// //       return;
// //     }

// //     const productsData = await parseCSV(req.file);

// //     for (const productData of productsData) {
// //       console.log(productData, "PRODUCTDATA");
// //       await createProduct(productData);
// //     }

// //     res.status(201).json({ message: "Bulk upload successful" });
// //   }
// // );

// //GET PRODUCT BY ID
// export const getProductById = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const { productId } = req.params;

//     const product = await prisma.product.findUnique({
//       where: {
//         id: productId,
//       },
//       include: {
//         variations: {
//           select: {
//             id: true,
//             variantId: true,
//             variation: {
//               select: {
//                 name: true,
//                 id: true,
//               },
//             },
//             options: {
//               select: {
//                 id: true,
//                 variationOptions: {
//                   select: {
//                     name: true,
//                     id: true,
//                   },
//                 },
//               },
//             },
//           },
//         },
//         categories: {
//           include: {
//             children: {
//               include: {
//                 children: true, // Include further nested children if needed
//               },
//             },
//           },
//         },
//         combinations: {}, // Include combinations
//       },
//     });
//     if (product) {
//       const variations = product.variations.map((variant) => ({
//         id: variant.id,
//         variantId: variant.variantId,
//         variantName: variant.variation.name,
//         variationOptions: variant.options.map((option) => ({
//           id: option.variationOptions.id,
//           name: option.variationOptions.name,
//         })),
//       }));

//       const productDetails = {
//         ...product,
//         variations,
//       };
//       res.status(200).json({
//         success: true,
//         product: productDetails,
//       });
//     } else {
//       return next(new AppError(404, "Product Not Found!"));
//     }
//   }
// );

// export const getAllProducts = catchAsync(
//   async (req: Request, res: Response) => {
//     const products = await prisma.product.findMany({
//       where: { isDeleted: false },
//       include: {
//         categories: true,
//         productImages: true,
//         combinations: true,
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     res.status(200).json({
//       success: true,
//       data: products,
//     });
//   }
// );

// //Create A Product
// export const createProduct = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const {
//       productName,
//       description,
//       categoryId,
//       subCategoryId,
//       subSubCategoryId,
//       previewImage = "",
//       variations,
//       deliveryRange,
//       retailPrice,
//       discountPercentage,
//       discountedPrice,
//       isNextDayDelivery = false,
//       combinations,
//       shippingInfo,
//     } = req.body;
//     // Extract and parse shipping dimensions (handle potential parsing errors)
//     const { width = 0, length = 0, height = 0, weight = 0 } = shippingInfo;
//     const parsedDimensions = {
//       width: parseInt(width, 10),
//       length: parseInt(length, 10),
//       height: parseInt(height, 10),
//       weight: parseInt(weight, 10),
//     };

//     // Build category connections (avoid unnecessary array creation)
//     const categoriesToConnect = [categoryId, subCategoryId, subSubCategoryId]
//       .filter((category) => category?.id)
//       .map((category) => ({ id: category.id }));
//     const productSlug = generateSlug(productName);
//     const productCode = generateProductCode(
//       productName,
//       categoryId?.name,
//       subCategoryId?.name,
//       subSubCategoryId?.name
//     );

//     const newProduct = await prisma.product.create({
//       data: {
//         productName,
//         productSlug,
//         productCode,
//         description,
//         originalPrice: retailPrice,
//         discountPercentage: discountPercentage,
//         discountedPrice: discountedPrice,
//         categories: {
//           connect: categoriesToConnect,
//         },
//         ...parsedDimensions,
//         deliveryRange,
//         previewImage,
//         isNextDayDelivery,
//       },
//       include: {
//         variations: {
//           include: {
//             options: true,
//           },
//         },
//         combinations: true,
//         categories: true,
//       },
//     });

//     const variationIDs = await createProductVariatins({
//       productId: newProduct.id,
//       variations,
//     });

//     await createProductCombinations({
//       productId: newProduct.id,
//       productPrice: retailPrice,
//       variationIDs,
//       combinations,
//     });
//     res.status(200).json({
//       success: true,
//       product: newProduct,
//     });
//   }
// );

// const createProductVariatins = async ({
//   productId,
//   variations,
// }: {
//   productId: string;
//   variations: any;
// }) => {
//   const createdVariationIds = []; // Array to store IDs of created variations

//   try {
//     for (const variation of variations) {
//       const { variantName, variantId, variationOptions } = variation;

//       // Create product variation
//       const createdVariation = await prisma.productVariation.create({
//         data: {
//           productId: productId,
//           variantId: variantId,
//         },
//       });
//       createdVariationIds.push(createdVariation.id); // Push the ID of the created variation

//       // Create options for the variation
//       for (const option of variationOptions) {
//         await prisma.productVariationOption.create({
//           data: {
//             productVariationId: createdVariation.id,
//             optionId: option.id,
//           },
//         });
//       }
//     }
//     return createdVariationIds;
//   } catch (error) {
//     console.error("Error creating variations:", error);
//     throw new Error("Failed to create variations");
//   }
// };

// const updateProductVariatins = async ({
//   productId,
//   variations,
// }: {
//   productId: string;
//   variations: any;
// }) => {
//   try {
//     for (const variation of variations) {
//       const { id, variationOptions } = variation;

//       // Check if the variation already exists for the product
//       const existingVariation = await prisma.productVariation.findFirst({
//         where: {
//           id,
//           productId,
//         },
//         include: {
//           variation: true,
//           options: true,
//         },
//       });

//       if (existingVariation) {
//         // If the variation exists, update its options
//         const existingOptions = await prisma.productVariationOption.findMany({
//           where: {
//             productVariationId: existingVariation.id,
//           },
//         });

//         // Delete existing options
//         await prisma.productVariationOption.deleteMany({
//           where: {
//             productVariationId: existingVariation.id,
//           },
//         });

//         // Create new options
//         for (const option of variationOptions) {
//           await prisma.create({
//             data: {
//               productVariationId: existingVariation.id,
//               optionId: option.id,
//             },
//           });
//         }
//       } else {
//         throw new AppError(404, "Variation Not Found!");
//       }
//     }
//   } catch (error) {
//     console.error("Error updating variations:", error);
//     throw new AppError(500, "Something went wrong");
//   }
// };

// // Update a product
// export const updateProduct = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const productId = req.params.productId;
//     const {
//       productName,
//       description,
//       categoryId,
//       subCategoryId,
//       subSubCategoryId,
//       previewImage = "",
//       variations,
//       deliveryRange,
//       retailPrice,
//       discountPercentage,
//       discountedPrice,
//       isNextDayDelivery = false,
//       combinations,
//       shippingInfo,
//     } = req.body;

//     const { width = 0, length = 0, height = 0, weight = 0 } = shippingInfo;
//     const parsedDimensions = {
//       width: parseInt(width, 10),
//       length: parseInt(length, 10),
//       height: parseInt(height, 10),
//       weight: parseInt(weight, 10),
//     };

//     const existingProduct = await prisma.product.findUnique({
//       where: {
//         id: productId,
//       },
//       include: {
//         categories: true,
//         variations: {
//           include: {
//             options: true,
//           },
//         },
//       },
//     });

//     if (!existingProduct) {
//       return next(new AppError(404, "Product Not Found!"));
//     }
//     // Build category connections (avoid unnecessary array creation)
//     const categoriesToConnect = [categoryId, subCategoryId, subSubCategoryId]
//       .filter((category) => category?.id)
//       .map((category) => ({ id: category.id }));

//     const productSlug = generateSlug(productName);

//     try {
//       const updatedProduct = await prisma.product.update({
//         where: { id: productId },
//         data: {
//           productName,
//           productSlug,
//           description,
//           originalPrice: retailPrice,
//           discountPercentage: discountPercentage,
//           discountedPrice: discountedPrice,
//           categories: {
//             disconnect: existingProduct.categories.map((category) => ({
//               id: category.id,
//             })),
//             connect: categoriesToConnect,
//           },
//           ...parsedDimensions,
//           deliveryRange,
//           previewImage,
//           isNextDayDelivery,
//         },
//         include: {
//           variations: {
//             include: {
//               options: true,
//             },
//           },
//           combinations: true,
//           categories: true,
//         },
//       });

//       await updateProductVariatins({
//         productId,
//         variations,
//       });

//       await updateProductCombinations({
//         productId,
//         productPrice: retailPrice,
//         combinations,
//       });

//       res.status(200).json(updatedProduct);
//     } catch (error: any) {
//       console.error(error);
//       return next(new AppError(500, error.message));
//     }
//   }
// );

// export const createProductCombinations = async ({
//   productId,
//   productPrice,
//   variationIDs,
//   combinations,
// }: {
//   productId: string;
//   productPrice: Number;
//   combinations: any[];
//   variationIDs: any[];
// }) => {
//   try {
//     const productCombinations = [];
//     let totalStock = 0;
//     for (const combination of combinations) {
//       const { availableStock, ...variationDetails } = combination;
//       totalStock += availableStock;
//       const skuId = generateSkuId(combination);

//       // Create an array to store variation IDs for this combination
//       const variationIdsObj = [];

//       // Iterate through the created variation IDs and connect them to the combination
//       for (const variationId of variationIDs) {
//         variationIdsObj.push({ id: variationId });
//       }
//       const createdCombination = await prisma.productCombination.create({
//         data: {
//           skuId: skuId,
//           availableStock,
//           productId: productId,
//           variationDetails: variationDetails,
//         },
//       });
//       console.log(totalStock, "STOCK_TOTAL");
//       await createProductStock({
//         totalStock,
//         unitPrice: productPrice,
//         productCombinationId: createdCombination.id,
//       });
//       productCombinations.push(createdCombination);
//     }

//     return productCombinations;
//   } catch (error) {
//     console.log(error);
//   }
// };

// export const updateProductCombinations = async ({
//   productId,
//   productPrice,
//   combinations,
// }: {
//   productId: string;
//   productPrice: Number;
//   combinations: {
//     id: string;
//     productId: string;
//     availableStock: number;
//     skuId: string;
//   }[];
// }) => {
//   try {
//     let totalStock = 0;
//     for (const combination of combinations) {
//       const { id, availableStock } = combination;
//       totalStock += availableStock;

//       const existingCombination = await prisma.productCombination.findFirst({
//         where: {
//           productId,
//           id,
//         },
//       });
//       if (existingCombination) {
//         // If the combination exists, update its stock
//         await prisma.productCombination.update({
//           where: {
//             id,
//           },
//           data: {
//             availableStock: availableStock,
//           },
//         });

//         await updateProductStock({
//           totalStock,
//           unitPrice: productPrice,
//           productCombinationId: existingCombination.id,
//         });
//       } else {
//         throw new AppError(404, "combination not found");
//       }
//     }
//   } catch (error) {
//     console.error(error);
//     // Handle errors appropriately
//     throw new AppError(500, "Failed to update product combinations");
//   }
// };

// async function createProductStock({
//   totalStock,
//   unitPrice,
//   productCombinationId,
// }: any) {
//   try {
//     // Calculate total price based on total stock and unit price
//     const totalPrice = totalStock * unitPrice;

//     // Create the product stock entry
//     const productStock = await prisma.productStock.create({
//       data: {
//         totalStock,
//         unitPrice,
//         totalPrice,
//         productCombinationId,
//       },
//     });

//     return productStock;
//   } catch (error) {
//     console.error("Error creating product stock:", error);
//     throw error;
//   }
// }

// async function updateProductStock({
//   totalStock,
//   unitPrice,
//   productCombinationId,
// }: any) {
//   try {
//     // Calculate total price based on total stock and unit price
//     const totalPrice = totalStock * unitPrice;

//     // Check if product stock entry exists for the given product combination
//     const existingProductStock = await prisma.productStock.findFirst({
//       where: {
//         productCombinationId,
//       },
//     });

//     if (existingProductStock) {
//       // If product stock entry exists, update its details
//       await prisma.productStock.update({
//         where: {
//           id: existingProductStock.id,
//         },
//         data: {
//           totalStock,
//           unitPrice,
//           totalPrice,
//         },
//       });
//     } else {
//       // If product stock entry doesn't exist, create it
//       await createProductStock({
//         totalStock,
//         unitPrice,
//         productCombinationId,
//       });
//     }
//   } catch (error) {
//     console.error("Error updating product stock:", error);
//     throw error;
//   }
// }

// // Delete a product
// export const deleteProduct = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const { productId } = req.params;

//     const deletedProduct = await prisma.product.update({
//       where: { id: productId },
//       data: {
//         isDeleted: true,
//       },
//     });
//     if (deletedProduct === null) {
//       return next(new AppError(404, "Product not found"));
//     }

//     res
//       .status(200)
//       .json({ success: true, message: "Product Deleted successfully" });
//   }
// );

// function generateSkuId(combination: any) {
//   const skuAttributes = Object.values(combination).join("_");
//   const uuid = uuidv4();
//   const shortUuid = uuid.replace(/-/g, "").substring(0, 6);
//   const skuId = `${skuAttributes}_${shortUuid}`;
//   return skuId.toUpperCase();
// }

// // // async function createProductCombinations({
// // //   productId,
// // //   variationOptions,
// // //   availableStock,
// // //   unitPrice,
// // // }: {
// // //   productId: string;
// // //   variationOptions: ProductVariationOption[];
// // //   availableStock: number;
// // //   unitPrice: number;
// // // }) {
// // //   try {
// // //     const combinations: ProductVariationOption[][] =
// // //       generateCombinations(variationOptions);
// // //     console.log(combinations, "COMBINATIONS");
// // //     // Iterate through each combination and create ProductCombination entries
// // //     for (const combination of combinations) {
// // //       // Create ProductCombination entry
// // //       const productCombination = await prisma.productCombination.create({
// // //         data: {
// // //           productId,
// // //           skuId: generateSkuId(combination),
// // //           availableStock,
// // //         },
// // //       });

// // //       await prisma.productStock.create({
// // //         data: {
// // //           totalStock: availableStock,
// // //           unitPrice,
// // //           productCombinationId: productCombination.id,
// // //           totalPrice: unitPrice * availableStock,
// // //         },
// // //       });

// // //       console.log(`Created ProductCombination: ${productCombination.id}`);
// // //     }

// // //     console.log("All product combinations created successfully.");
// // //   } catch (error) {
// // //     console.error("Error creating product combinations:", error);
// // //     throw error;
// // //   }
// // // }

// // // Helper function to generate all combinations of variation options
// // function generateCombinations(
// //   variationOptions: ProductVariationOption[]
// // ): ProductVariationOption[][] {
// //   const result: ProductVariationOption[][] = [[]];

// //   for (const option of variationOptions) {
// //     const currentCombinations = [...result];

// //     for (const combination of currentCombinations) {
// //       result.push([...combination, option]);
// //     }
// //   }

// //   return result.slice(1); // Remove the empty combination [[]] at the beginning
// // }

// //CATEGORY

// // export const createProductCategory = async ({
// //   categoryId,
// //   subCategoryId,
// //   subSubCategoryId,
// //   productId,
// // }: any) => {
// //   try {
// //     const categoryIds: string[] = [
// //       categoryId,
// //       subCategoryId,
// //       subSubCategoryId,
// //     ].filter(Boolean);

// //     categoryIds.forEach(async (categoryId) => {
// //       try {
// //         await prisma.productCategory.create({
// //           data: {
// //             categoryId,
// //             productId,
// //           },
// //         });
// //       } catch (error) {
// //         console.error("Error creating ProductCategory entry:", error);
// //       }
// //     });
// //   } catch (error) {
// //     console.log(error);
// //   }
// // };

// // VARIATIONS
// export const createVariation = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { name, variationOptions } = req.body;

//       // Validate data (consider using a validation library like Joi)
//       if (!name || !variationOptions || variationOptions.length === 0) {
//         return res.status(400).json({ error: "Missing required fields" });
//       }

//       // Efficiently create Variation and VariationOptions in one transaction
//       const createdVariation = await prisma.variation.create({
//         data: {
//           name,
//           variationOptions: {
//             create: variationOptions.map((option: any) => ({
//               name: option.name,
//             })),
//           },
//         },
//         include: { variationOptions: true }, // Include related options
//       });
//       res.status(201).json(createdVariation);
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "Internal Server Error" });
//     }
//   }
// );

// export const getVariations = async (req: Request, res: Response) => {
//   try {
//     const variations = await prisma.variation.findMany({
//       include: { variationOptions: true },
//     });
//     res.status(200).json(variations);
//   } catch (error) {
//     console.log(error, "ERROR");
//   }
// };

// export const updateVariation = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const { id } = req.params;
//     const { name, variationOptions } = req.body;

//     try {
//       const existingVariation = await prisma.variation.findUnique({
//         where: { id },
//       });

//       if (!existingVariation) {
//         return new AppError(404, "Variation not found");
//       }

//       if (!name || !variationOptions || variationOptions.length === 0) {
//         return new AppError(400, "Missing required fields");
//       }

//       await prisma.variation.update({
//         where: { id },
//         data: {
//           name,
//         },
//         include: { variationOptions: true }, // Include related variationOptions for response
//       });

//       await Promise.all(
//         variationOptions.map(async (option: any) => {
//           if (option.id) {
//             await prisma.variationOption.upsert({
//               where: { id: option.id },
//               update: { name: option.name, variationId: id },
//               create: { name: option.name, variationId: id },
//             });
//           } else {
//             await prisma.variationOption.create({
//               data: { name: option.name, variationId: id },
//             });
//           }
//         })
//       );
//       res.status(200).json({ success: true });
//     } catch (error) {
//       console.log(error);
//     }
//   }
// );

// export const deleteVariation = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const { id } = req.params;

//     const variation = await prisma.variation.findUnique({
//       where: { id },
//       include: { variationOptions: true },
//     });
//     if (!variation) {
//       return new AppError(404, "Variation not found");
//     }

//     // Delete all associated variation options first
//     await prisma.variationOption.deleteMany({
//       where: { variationId: id },
//     });

//     await prisma.variation.delete({
//       where: { id: id },
//     });

//     res.status(200).json({ success: true });
//   }
// );

// //Create
// export const createProductSkus = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const { productId } = req.params;
//     const { skus = [] } = req.body;

//     const existingProduct = await prisma.product.findUnique({
//       where: {
//         id: productId,
//       },
//     });

//     if (!existingProduct) {
//       return next(new AppError(404, "Product Not Found!"));
//     }

//     const existingProductInventory =
//       await prisma.productInventory.findFirstOrThrow({
//         where: { productId },
//       });

//     if (!existingProductInventory) {
//       // If no ProductInventory entry exists, create a new one
//       await prisma.productInventory.create({
//         data: {
//           productId,
//           totalStock: 0,
//           unitPrice: existingProduct.originalPrice,
//           totalPrice: existingProduct.originalPrice,
//           isActive: true,
//         },
//       });
//     }

//     for (const sku of skus) {
//       const { title, sizeId, colorId, availableStock } = sku;

//       const createdSku = await prisma.sKU.create({
//         data: {
//           title,
//           sizeId: sizeId,
//           colorId,
//           productId,
//           availableStock,
//         },
//       });

//       // Create SKUInventory
//       await prisma.sKUInventory.create({
//         data: {
//           productInventoryId: existingProductInventory.id, // Provide the ID of the product inventory
//           skuId: createdSku.id, // Use the ID of the created SKU
//           stock: availableStock, // Optionally set the initial stock
//         },
//       });

//       // Create or update ProductInventory entry
//       const totalStock = skus.reduce(
//         (total: number, sku: any) => total + sku.availableStock,
//         0
//       );

//       const totalPrice = totalStock * existingProduct.originalPrice;

//       // If a ProductInventory entry exists, update it
//       await prisma.productInventory.update({
//         where: { id: existingProductInventory.id },
//         data: {
//           totalStock: {
//             increment: totalStock,
//           },
//           totalPrice: totalPrice,
//         },
//       });
//     }

//     res.status(200).json({ success: true });
//   }
// );
