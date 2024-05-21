import catchAsync from "@/utils/catchAsync";
import { NextFunction, Request, Response } from "express";
import prisma from "@/lib/prisma";
import AppError from "@/utils/AppError";

// export const addToCart = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       //TO DO -- Replace customeId when CustomerInterface Ready
//       //   const customerId = req.auth.userId;
//       const { customerId } = req.params;

//       const { skuId, quantity } = req.body;

//       // Check if customerId and skuId are provided
//       if (!customerId || !skuId || !quantity) {
//         return next(new AppError(400, "Missing required fields"));
//       }
//       const result = await prisma.$transaction(async (prisma) => {
//         // Fetch the SKU with product details
//         const sku = await prisma.sKU.findUnique({
//           where: { id: skuId },
//           include: { product: true },
//         });
//         if (!sku) {
//           return next(new AppError(404, "SKU not found"));
//         }

//         // Calculate unit price and total price
//         const unitPrice =
//           sku.product.discountedPrice ?? sku.product.originalPrice;
//         const totalPrice = unitPrice * quantity;

//         // Find or create the cart for the customer
//         let cart = await prisma.cart.findUnique({ where: { customerId } });
//         if (!cart) {
//           cart = await prisma.cart.create({ data: { customerId } });
//         }

//         // Find the existing cart item, if any
//         let cartItem = await prisma.cartItem.findFirst({
//           where: { cartId: cart.id, skuId },
//         });

//         // Calculate total quantity including the current payload and previous cart item quantity
//         let totalQuantity = quantity;
//         if (cartItem) {
//           totalQuantity += cartItem.quantity;
//         }

//         // Check if the total quantity exceeds the available stock for the SKU
//         if (totalQuantity > sku.availableStock) {
//           throw new AppError(400, "Insufficient Stock");
//         }

//         // Create or update the cart item
//         if (cartItem) {
//           // If the item already exists in the cart, update the quantity
//           cartItem = await prisma.cartItem.update({
//             where: { id: cartItem.id },
//             data: {
//               quantity: totalQuantity,
//               unitPrice: unitPrice,
//               totalPrice: totalPrice,
//             },
//           });
//         } else {
//           // Otherwise, create a new cart item
//           cartItem = await prisma.cartItem.create({
//             data: {
//               cartId: cart.id,
//               skuId,
//               quantity: totalQuantity,
//               unitPrice: unitPrice,
//               totalPrice: totalPrice,
//             },
//           });
//         }

//         // Calculate total amount of the cart
//         const cartItems = await prisma.cartItem.findMany({
//           where: { cartId: cart.id },
//           select: { totalPrice: true },
//         });
//         const totalAmount = cartItems.reduce(
//           (acc, item) => acc + item.totalPrice,
//           0
//         );

//         // Update the cart's totalAmount
//         await prisma.cart.update({
//           where: { id: cart.id },
//           data: { totalAmount: totalAmount },
//         });

//         return cartItem;
//       });

//       res
//         .status(200)
//         .json({ message: "Item added to cart successfully", result });

//       res.status(200).json({ message: "Item added to cart successfully" });
//     } catch (error) {
//       console.log(error, "ERRO");
//       return next(new AppError(500, "Internal server error"));
//     }
//   }
// );

export const addToCart = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { customerId } = req.params;
    const { skuId, quantity } = req.body;

    try {
      // Check if customerId and skuId are provided
      if (!customerId || !skuId || !quantity) {
        return next(new AppError(400, "Missing required fields"));
      }

      // Start the transaction
      const result = await prisma.$transaction(
        async (prisma) => {
          // Fetch the SKU with product details
          const sku = await prisma.sKU.findUnique({
            where: { id: skuId },
            include: {
              product: {
                select: {
                  discountedPrice: true,
                  originalPrice: true,
                },
              },
            },
          });
          if (!sku) {
            throw new AppError(404, "SKU not found");
          }

          // Calculate unit price and total price
          const unitPrice =
            sku.product.discountedPrice ?? sku.product.originalPrice;
          const totalPrice = unitPrice * quantity;

          // Find or create the cart for the customer
          let cart = await prisma.cart.findFirst({ where: { customerId } });
          if (!cart) {
            cart = await prisma.cart.create({ data: { customerId } });
          }

          // Find the existing cart item, if any
          let cartItem = await prisma.cartItem.findFirst({
            where: { cartId: cart.id, skuId },
          });

          // Calculate total quantity including the current payload and previous cart item quantity
          let totalQuantity = quantity;
          if (cartItem) {
            totalQuantity += cartItem.quantity;
          }

          // Check if the total quantity exceeds the available stock for the SKU
          if (totalQuantity > sku.availableStock) {
            throw new AppError(400, "Insufficient Stock");
          }

          // Create or update the cart item
          if (cartItem) {
            // If the item already exists in the cart, update the quantity
            cartItem = await prisma.cartItem.update({
              where: { id: cartItem.id },
              data: {
                quantity: totalQuantity,
                unitPrice: unitPrice,
                totalPrice: totalPrice,
              },
            });
          } else {
            // Otherwise, create a new cart item
            cartItem = await prisma.cartItem.create({
              data: {
                cartId: cart.id,
                skuId,
                quantity: totalQuantity,
                unitPrice: unitPrice,
                totalPrice: totalPrice,
              },
            });
          }

          // Calculate total amount of the cart
          const cartItems = await prisma.cartItem.findMany({
            where: { cartId: cart.id },
            select: { totalPrice: true },
          });
          const totalAmount = cartItems.reduce(
            (acc, item) => acc + item.totalPrice,
            0
          );

          // Update the cart's totalAmount
          await prisma.cart.update({
            where: { id: cart.id },
            data: { totalAmount: totalAmount },
          });

          // Return the cart item
          return cartItem;
        },
        {
          maxWait: 10000,
          timeout: 10000, // default: 5000
        }
      );

      res
        .status(200)
        .json({ message: "Item added to cart successfully", result });
    } catch (error) {
      return next(new AppError(500, "Internal server error"));
    }
  }
);

export const getCartItems = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // const customerId = req?.auth?.userId ?? "";
    const { customerId } = req.params;
    const cartItems = await prisma.cartItem.findMany({
      where: { cart: { customerId } },
      include: { sku: true },
    });
    res.status(200).json(cartItems);
  }
);

export const updateCartItemQuantity = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { cartItemId } = req.params;
    const { quantity } = req.body;

    // Fetch the cart item
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        sku: {
          select: {
            availableStock: true,
          },
        },
      },
    });
    if (!cartItem) {
      return next(new AppError(404, "Cart item not found"));
    }

    // Check if the total quantity exceeds the available stock for the SKU
    if (quantity > cartItem.sku.availableStock) {
      return next(new AppError(400, "Insuffiecient Stock"));
    }

    const totalPrice = cartItem?.unitPrice * quantity;
    const updatedCartItem = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity, totalPrice },
    });

    // Calculate total amount of the cart
    await updateCartTotalAmount(cartItem.cartId);

    res.status(200).json(updatedCartItem);
  }
);

export const removeCartItem = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { cartItemId } = req.params;
    const cartItem = await prisma.cartItem.delete({
      where: { id: cartItemId },
    });
    // Calculate total amount of the cart
    await updateCartTotalAmount(cartItem.cartId);

    res.status(200).json({ message: "Cart item removed successfully" });
  }
);

export const clearCart = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // const customerId = req?.auth?.userId ?? "";
    const { customerId } = req.params;
    await prisma.cartItem.deleteMany({ where: { cart: { customerId } } });

    await prisma.cart.deleteMany({ where: { customerId } });

    res.status(200).json({ message: "Cart cleared successfully" });
  }
);

export const getCartSummary = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { customerId } = req.params;
    const cart = await prisma.cart.findUnique({
      where: { customerId },
      include: {
        cartItems: {
          include: {
            sku: {
              select: {
                product: {
                  select: {
                    id: true,
                    productName: true,
                    description: true,
                    discountedPrice: true,
                    originalPrice: true,
                    discountPercentage: true,
                    sellerId: true,
                  },
                },
                color: true,
                size: true,
                availableStock: true,
              },
            },
          },
        },
      },
    });
    if (!cart) {
      return next(new AppError(404, "Cart Not Found!"));
    }
    res.status(200).json({
      success: true,
      data: cart,
    });
  }
);

// HELPER FUNCTIONS //
async function updateCartTotalAmount(cartId: string) {
  const cartItems = await prisma.cartItem.findMany({
    where: { cartId },
    select: { totalPrice: true },
  });

  const totalAmount = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);

  await prisma.cart.update({
    where: { id: cartId },
    data: { totalAmount },
  });
}
