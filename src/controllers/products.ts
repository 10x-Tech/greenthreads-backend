// import prisma from "../lib/prisma";
// import { Request, Response } from "express";
// import { sendSuccessResponse } from "../utils";

// export const createProducts = async (req: Request, res: Response) => {
//   const { products } = req.body;
//   const sellerId = "ABC123";

//   try {
//     // Create products
//     const createdProducts = await Promise.all(
//       products.map(async (product: any) => {
//         const {
//           collectionName,
//           sku,
//           productImages,
//           productName,
//           description,
//           materialUsed,
//           color,
//           sizesAvailable,
//           suggestedRRPInGBP,
//           wholesalePriceInGBP,
//           care,
//         } = product;

//         return prisma.product.create({
//           data: {
//             collectionName,
//             sku,
//             productImages,
//             productName,
//             description,
//             materialUsed,
//             color,
//             sizesAvailable,
//             suggestedRRPInGBP,
//             wholesalePriceInGBP,
//             care,
//             sellerId,
//           },
//         });
//       })
//     );

//     return sendSuccessResponse(res, 201, createdProducts);
//   } catch (error) {
//     throw error;
//   }
// };

// export const getProductsBySellerId = async (req: Request, res: Response) => {
//   //const { sellerId } =  req.auth.userId;
//   const sellerId = "ABC123";

//   try {
//     // Retrieve products by sellerId
//     const products = await prisma.product.findMany({
//       where: {
//         sellerId: sellerId,
//       },
//     });

//     return sendSuccessResponse(res, 200, products);
//   } catch (error) {
//     console.log(error, "-------------");
//     throw error;
//   }
// };
