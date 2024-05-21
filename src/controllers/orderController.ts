import { NextFunction, Request, Response } from "express";
import prisma from "@/lib/prisma";
import AppError from "@/utils/AppError";
import catchAsync from "@/utils/catchAsync";
import { OrderItemStatus, OrderStatus, Prisma } from "@prisma/client";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export const getCheckoutSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { cartId } = req.params;
  const { userId } = req?.body;

  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      cartItems: {
        include: {
          sku: {
            include: {
              product: {
                select: {
                  productName: true,
                  description: true,
                  originalPrice: true,
                  discountedPrice: true,
                  discountPercentage: true,
                },
              },
            },
          },
        },
      },
      customer: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!cartId || !cart) {
    return next(new AppError(401, "Cart Not Found"));
  }

  const lineItems = cart.cartItems.map((item) => ({
    price_data: {
      currency: "inr",
      product_data: {
        name: item.sku.product.productName,
        description: item.sku.product?.description ?? "",
        images: [
          "https://images.unsplash.com/photo-1618677603286-0ec56cb6e1b5",
          "https://images.unsplash.com/photo-1578021127722-1f1ff95b429e",
        ],
      },
      unit_amount: item.unitPrice * 100,
    },
    quantity: item.quantity,
  }));

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      currency: "inr",
      success_url: `${process.env.CLIENT_URL}/payment/success`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
      customer_email: cart.customer?.user.email,
      client_reference_id: cart.customer.externalId,
      line_items: lineItems,
      shipping_address_collection: {
        allowed_countries: ["IN"],
      },
      metadata: {
        cartId: cartId,
      },
    });
    res.status(200).json(session);
  } catch (error: any) {
    return next(new AppError(500, error.message));
  }
};

export const webhoookCheckout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Event;
    try {
      event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err: any) {
      return next(new AppError(400, `Webhook Error: ${err.message}`));
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        // Save an order in your database, marked as 'awaiting payment'
        createOrder(session);

        // Check if the order is paid (for example, from a card payment)
        //
        // A delayed notification payment will have an `unpaid` status, as
        // you're still waiting for funds to be transferred from the customer's
        // account.
        if (session.payment_status === "paid") {
          fulfillOrder(session);
        }

        break;
      }

      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object;

        // Fulfill the purchase...
        fulfillOrder(session);

        break;
      }

      case "checkout.session.async_payment_failed": {
        const session = event.data.object;

        // Send an email to the customer asking them to retry their order
        emailCustomerAboutFailedPayment(session);

        break;
      }
    }
    res.status(200).json({
      success: true,
    });
  }
);

const fulfillOrder = (session: any) => {
  // TODO: fill me in
  //   console.log("Fulfilling order", session);
};

const createOrder = async (session: any) => {
  console.log("SESSION__", session);

  const cart = await prisma.cart.findUnique({
    where: { customerId: session.client_reference_id },
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
    throw new AppError(404, "Cart Not Found");
  }

  const shippingDetails: Prisma.JsonObject = session.shipping_details;
  const billingDetails: Prisma.JsonObject = session.shipping_details;
  const customerDetails: Prisma.JsonObject = session.customer_details;

  const orderItemsData = cart?.cartItems.map((orderItem: any) => ({
    product: { connect: { id: orderItem.sku.product.id } },
    variationDetails: {
      color: orderItem.sku.color.name,
      size: orderItem.sku.size.name,
    } as Prisma.JsonObject,
    productName: orderItem.sku.product.productName,
    productDesc: orderItem.sku.product.description ?? "",
    quantity: orderItem?.quantity,
    amountSubTotal: orderItem?.totalPrice,
    amountTotal: orderItem?.totalPrice,
    amountTax: 0,
    amountDiscount:
      orderItem?.totalPrice -
      orderItem.sku.product.discountedPrice * orderItem?.quantity,
    unitAmount: orderItem?.unitPrice,
    seller: {
      connect: { externalId: orderItem.sku.product.sellerId },
    },
  }));

  const order = await prisma.order.create({
    data: {
      orderDisplayId: session.id,
      customer: {
        connect: { externalId: session.client_reference_id },
      },
      orderItems: {
        create: orderItemsData,
      },
      amountSubTotal: session.amount_subtotal / 100, // Convert amount from cents to currency
      amountTotal: session.amount_total / 100, // Convert amount from cents to currency
      shippingDetails,
      billingDetails,
      paymentStatus: session.payment_status, // Assuming the payment status is already paid
      paymentIntentId: session?.payment_intent,
      paymentMethod: session.payment_method_types?.[0] ?? "card",
      metaData: {},
      currency: session.currency,
      customerDetails,
      totalDetails: session.total_details,
      status: OrderStatus["IN_PROGRESS"],
    },
  });

  // 2.TODO Notify User Order Successfully Created

  // 3.TODO Notify Seller About Order

  // 4.Update the Inventory
  await prisma.$transaction(async (prismaInstance) => {
    const transactionTasks = cart.cartItems.map(async (orderItem: any) => {
      // Update SKU available stock
      await prismaInstance.sKU.update({
        where: { id: orderItem.skuId },
        data: {
          availableStock: {
            decrement: orderItem.quantity,
          },
        },
      });

      // Update SKU inventory
      await prismaInstance.sKUInventory.update({
        where: { skuId: orderItem.skuId },
        data: {
          availableStock: {
            decrement: orderItem.quantity,
          },
        },
      });

      // Update ProductInventory
      const productInventory = await prismaInstance.productInventory.update({
        where: { productId: orderItem.sku.product.id },
        data: {
          totalStock: {
            decrement: orderItem.quantity,
          },
        },
        include: { product: true },
      });

      // Calculate and update totalPrice
      const newTotalPrice =
        productInventory.totalStock * productInventory.product.originalPrice;
      await prismaInstance.productInventory.update({
        where: { productId: orderItem.sku.product.id },
        data: {
          totalPrice: newTotalPrice,
        },
      });
    });

    await Promise.all(transactionTasks);
  });
  // 5.Remove Cart
};

const emailCustomerAboutFailedPayment = (session: any) => {
  // TODO: fill me in
  console.log("Emailing customer", session);
};

export const getOrdersBySellerId = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const sellerId = req?.auth?.userId;
    // const sellerId = req.params;
    const rawStatus = req.query.status?.toString(); // Handle potential undefined status
    const statusArray: OrderItemStatus[] = [];
    if (rawStatus) {
      statusArray.push(
        ...rawStatus
          .split(",")
          .map((str) => str.trim() as OrderItemStatus)
          .filter(Boolean)
      );
    }

    if (!sellerId) {
      return next(new AppError(401, "Unauthenticated!"));
    }

    const query: Prisma.OrderItemFindManyArgs = {
      where: {
        sellerId: sellerId,
      },
      include: {
        order: true,
      },
      orderBy: {
        order: {
          createdAt: "desc",
        },
      },
    };

    if (rawStatus) {
      query.where = {
        ...query.where,
        deliveryStatus: {
          in: statusArray as OrderItemStatus[],
        },
      };
    }

    const [orderItems, count] = await prisma.$transaction([
      prisma.orderItem.findMany(query),
      prisma.orderItem.count({ where: query.where }),
    ]);

    res.status(200).json({
      success: true,
      pagination: {
        total: count,
      },
      data: orderItems,
    });
  }
);

export const getOrderById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { orderId } = req.params;
    const sellerId = req?.auth?.userId;
    // const { sellerId } = req.query;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          where: { sellerId },
        },
      },
    });

    // Calculate total amount across all order items using Prisma's sum aggregation function
    const { totalAmount, subTotal } = await prisma.orderItem
      .aggregate({
        where: { AND: [{ sellerId }, { orderId }] },
        _sum: {
          amountTotal: true,
          amountSubTotal: true,
        },
      })
      .then((result) => {
        return {
          totalAmount: result._sum.amountTotal,
          subTotal: result._sum.amountSubTotal,
        };
      });

    if (!order) {
      return next(new AppError(404, "Order Not Found!"));
    }

    res.status(200).json({
      success: true,
      data: {
        ...order,
        orderItems: {
          totalAmount,
          subTotal,
          items: order.orderItems,
        },
      },
    });
  }
);

export const updateOrderItemStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { status: newStatus, orderItemId } = req.body;

    // Validate if the new status is one of the valid enum values
    if (!Object.values(OrderItemStatus).includes(newStatus)) {
      return next(new AppError(400, "Invalid order status"));
    }
    // Find the order with the given ID
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: {
        order: {
          include: {
            orderItems: true,
          },
        },
      },
    });

    if (!orderItem) {
      return next(new AppError(404, "Order not found"));
    }

    // Check if the new status is a valid transition
    if (
      !isValidTransition(orderItem.deliveryStatus as OrderItemStatus, newStatus)
    ) {
      return next(new AppError(400, "Invalid status transition"));
    }
    // Update the order status
    const updatedOrderItem = await prisma.orderItem.update({
      where: { id: orderItem.id },
      data: { deliveryStatus: newStatus },
      include: {
        order: {
          include: {
            orderItems: true,
          },
        },
      },
    });

    // Check if all order items of the order are delivered
    const allItemsDelivered = updatedOrderItem.order.orderItems.every(
      (item) => item.deliveryStatus === "DELIVERED"
    );

    if (allItemsDelivered) {
      // Update order status to 'FULFILLED' if all items are delivered
      await prisma.order.update({
        where: { id: orderItem.order.id },
        data: { status: OrderStatus["FULFILLED"] },
      });
    }

    res.json({
      success: true,
      message: "Order status updated successfully",
      data: updatedOrderItem,
    });
  }
);

type EventType =
  | "checkout.session.completed"
  | "checkout.session.async_payment_succeeded"
  | "checkout.session.async_payment_failed"
  | "checkout.session.expired";

type Event = {
  data: Record<string, any>;
  object: "event";
  type: EventType;
};

// HELPER FUNCTIONS //
function isValidTransition(
  currentStatus: OrderItemStatus,
  newStatus: OrderItemStatus
) {
  const validTransitions: {
    [key: string]: OrderItemStatus[];
  } = {
    PENDING: ["SHIPPED"],
    SHIPPED: ["DELIVERED"],
  };

  return (
    validTransitions[currentStatus] &&
    validTransitions[currentStatus].includes(newStatus)
  );
}
