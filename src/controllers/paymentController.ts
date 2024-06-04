import catchAsync from "@/utils/catchAsync";
import { NextFunction, Request, Response } from "express";
import prisma from "@/lib/prisma";
import AppError from "@/utils/AppError";
import { Prisma, VendorRole } from "@prisma/client";

// export const getAllPayments = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const sellerId = req?.auth?.userId as string;
//     const { duration, search }: any = req.query;

//     // Get start and end dates based on duration
//     const { startDate, endDate } = getStartAndEndDates(duration);

//     // Handle default behavior (all payments) and filtering
//     let whereClause: Prisma.PaymentsWhereInput = { sellerId };
//     if (duration && duration !== "all") {
//       const { startDate, endDate } = getStartAndEndDates(duration);
//       whereClause.date = {
//         gte: startDate,
//         lt: endDate,
//       };
//     }

//     if (search) {
//       whereClause = {
//         ...whereClause,
//         orderItem: {
//           is: {
//             order: {
//               is: {
//                 customerDetails: {
//                   path: ["name"],
//                   string_contains: search,
//                 },
//               },
//             },
//           },
//         },
//       };
//     }

//     const query: Prisma.PaymentsFindManyArgs = {
//       where: whereClause,
//       include: {
//         orderItem: {
//           include: {
//             order: {
//               select: {
//                 customerDetails: true,
//                 createdAt: true,
//               },
//             },
//           },
//         },
//       },
//       orderBy: { date: "desc" },
//     };

//     try {
//       const totalRevenue = await prisma.payments.aggregate({
//         _sum: {
//           amount: true,
//         },
//         where: {
//           sellerId: sellerId,
//           date: {
//             gte: startDate,
//             lt: endDate,
//           },
//         },
//       });

//       const [payments, count] = await prisma.$transaction([
//         prisma.payments.findMany(query),
//         prisma.payments.count({ where: query.where }),
//       ]);

//       if (!payments.length) {
//         return next(new AppError(404, "No payments Found!"));
//       }

//       res.status(200).json({
//         success: true,
//         pagination: {
//           total: count,
//         },
//         data: {
//           payments,
//           totalRevenue: totalRevenue._sum.amount || 0,
//         },
//       });
//     } catch (error) {
//       console.error(error);
//       return next(
//         new AppError(500, "An error occurred while fetching payments data")
//       );
//     }
//   }
// );

export const getAllPayments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { duration, search, from, to, page = 1, limit = 10 }: any = req.query;

    // Get start and end dates based on duration
    // const { startDate, endDate } = getStartAndEndDates(duration);

    // Convert the date strings to Date objects
    const fromDay = from ? new Date(from) : undefined;
    const toDay = to ? new Date(to) : undefined;

    // Initialize where clause based on role
    let whereClause: Prisma.PaymentsWhereInput = {};

    // Filter by duration if specified
    if (fromDay && toDay) {
      whereClause.date = {
        gte: fromDay,
        lt: toDay,
      };
    }

    // Filter by search if specified
    if (search) {
      whereClause = {
        ...whereClause,
        orderItem: {
          is: {
            order: {
              is: {
                OR: [
                  {
                    customerDetails: {
                      path: ["name"],
                      string_contains: search,
                    },
                  },
                  {
                    customerDetails: {
                      path: ["email"],
                      string_contains: search,
                    },
                  },
                ],
              },
            },
          },
        },
      };
    }

    // Pagination parameters
    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;

    const query: Prisma.PaymentsFindManyArgs = {
      where: whereClause,
      include: {
        orderItem: {
          include: {
            order: {
              select: {
                customerDetails: true,
                createdAt: true,
              },
            },
          },
        },
      },
      orderBy: { date: "desc" },
      skip,
      take,
    };

    try {
      // Execute queries in parallel
      const [payments, count, totalRevenue] = await Promise.all([
        prisma.payments.findMany(query),
        prisma.payments.count({ where: whereClause }),
        prisma.payments.aggregate({
          _sum: { amount: true },
          where: { date: whereClause.date },
        }),
      ]);

      const totalPages = Math.ceil(count / take);

      res.status(200).json({
        success: true,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: take,
          pageCount: totalPages,
        },
        data: {
          payments,
          totalRevenue: totalRevenue._sum.amount || 0,
        },
      });
    } catch (error) {
      console.error(error);
      return next(
        new AppError(500, "An error occurred while fetching payments data")
      );
    }
  }
);
export const getPaymentsBySeller = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const sellerId = req?.auth?.userId as string;
    const { duration, search, page = 1, limit = 10 }: any = req.query;

    // Get start and end dates based on duration
    const { startDate, endDate } = getStartAndEndDates(duration);

    // Initialize where clause based on role
    let whereClause: Prisma.PaymentsWhereInput = { sellerId };

    // Filter by duration if specified
    if (duration && duration !== "all") {
      whereClause.date = {
        gte: startDate,
        lt: endDate,
      };
    }

    // Filter by search if specified
    if (search) {
      whereClause = {
        ...whereClause,
        orderItem: {
          is: {
            order: {
              is: {
                OR: [
                  {
                    customerDetails: {
                      path: ["name"],
                      string_contains: search,
                    },
                  },
                  {
                    customerDetails: {
                      path: ["email"],
                      string_contains: search,
                    },
                  },
                ],
              },
            },
          },
        },
      };
    }

    // Pagination parameters
    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;

    const query: Prisma.PaymentsFindManyArgs = {
      where: whereClause,
      include: {
        orderItem: {
          include: {
            order: {
              select: {
                customerDetails: true,
                createdAt: true,
              },
            },
          },
        },
      },
      orderBy: { date: "desc" },
      skip,
      take,
    };

    try {
      // Execute queries in parallel
      const [payments, count, totalRevenue] = await Promise.all([
        prisma.payments.findMany(query),
        prisma.payments.count({ where: whereClause }),
        prisma.payments.aggregate({
          _sum: { amount: true },
          where: { sellerId, date: whereClause.date },
        }),
      ]);

      if (!payments.length) {
        return next(new AppError(404, "No payments Found!"));
      }

      const totalPages = Math.ceil(count / take);

      res.status(200).json({
        success: true,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: take,
          pageCount: totalPages,
        },
        data: {
          payments,
          totalRevenue: totalRevenue._sum.amount || 0,
        },
      });
    } catch (error) {
      console.error(error);
      return next(
        new AppError(500, "An error occurred while fetching payments data")
      );
    }
  }
);

export const getTotalRevenue = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const sellerId = req?.auth?.userId as string;
    const role = req?.auth.sessionClaims.metadata.role;

    let whereClause = {};

    if (role === VendorRole.SELLER) {
      whereClause = { sellerId };
    }

    const totalRevenue = await prisma.payments.aggregate({
      _sum: {
        amount: true,
      },
      where: whereClause,
    });

    res.status(200).json({ totalRevenue: totalRevenue._sum.amount || 0 });
  }
);

export const getRevenueInfo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let { duration }: any = req.query;
    const sellerId = req.auth.userId;
    const role = req.auth.sessionClaims.metadata.role;

    // Set default value for duration if not provided
    if (
      !duration ||
      !["yearly", "monthly", "weekly"].includes(duration as string)
    ) {
      duration = "monthly";
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Initialize where clause based on role
    let whereClause: any = {};
    switch (role) {
      case VendorRole.SELLER: {
        whereClause = { sellerId };

        try {
          const orderItems = await prisma.orderItem.findMany({
            where: whereClause,
            include: { order: true },
            orderBy: { order: { createdAt: "desc" } }, // Order by order creation date descending to get recent sales
          });

          // Calculate total revenue (Total Sales in this context)
          const totalRevenue = await prisma.orderItem.aggregate({
            _sum: {
              amountTotal: true,
            },
            where: whereClause,
          });

          // Calculate total sales for the current month
          const totalSalesOfMonth = await prisma.order.count({
            where: {
              createdAt: {
                gte: new Date(currentYear, currentMonth, 1),
                lt: new Date(currentYear, currentMonth + 1, 1),
              },
              orderItems: {
                some: {
                  sellerId: sellerId,
                },
              },
            },
          });

          // Get the most recent 5 sales for the current seller or all sellers if ADMIN
          const recentSales = orderItems.slice(0, 5).map((orderItem) => ({
            date: orderItem.order.createdAt,
            amount: orderItem.amountTotal,
            orderId: orderItem.orderId,
            productName: orderItem.productName,
            customerDetails: orderItem.order.customerDetails,
          }));

          // Format the periodic revenue data (requires additional processing)
          const formattedRevenue = formatPeriodicRevenue(
            orderItems,
            duration,
            currentYear,
            VendorRole.SELLER
          );

          res.json({
            success: true,
            data: {
              periodicRevenue: formattedRevenue,
              totalRevenue: totalRevenue._sum.amountTotal || 0,
              totalSalesOfMonth,
              recentSales,
            },
          });
        } catch (error) {
          console.error(error);
          res
            .status(500)
            .json({ error: "An error occurred while fetching revenue data" });
        }
      }
      case VendorRole.ADMIN: {
        console.log(role, "SSFS");
        try {
          const orders = await prisma.order.findMany({
            orderBy: { createdAt: "desc" }, // Order by order creation date descending to get recent sales
          });

          // Calculate total revenue (Total Sales in this context)
          const totalRevenue = await prisma.order.aggregate({
            _sum: {
              amountTotal: true,
            },
          });

          // Calculate total sales for the current month
          const totalSalesOfMonth = await prisma.order.count({
            where: {
              createdAt: {
                gte: new Date(currentYear, currentMonth, 1),
                lt: new Date(currentYear, currentMonth + 1, 1),
              },
            },
          });

          // Get the most recent 5 sales for the current seller or all sellers if ADMIN
          const recentSales = orders.slice(0, 5).map((order) => ({
            date: order.createdAt,
            amount: order.amountTotal,
            orderId: order.id,
            customerDetails: order.customerDetails,
          }));
          const formattedRevenue = formatPeriodicRevenue(
            orders,
            duration,
            currentYear,
            VendorRole.ADMIN
          );

          res.status(200).json({
            success: true,
            data: {
              periodicRevenue: formattedRevenue,
              totalRevenue: totalRevenue._sum.amountTotal || 0,
              totalSalesOfMonth,
              recentSales,
            },
          });
        } catch (error) {
          console.error(error);
          res
            .status(500)
            .json({ error: "An error occurred while fetching revenue data" });
        }
      }
      default: {
        res
          .status(500)
          .json({ error: "An error occurred while fetching revenue data" });
      }
    }
  }
);
// Helper function to format date keys
const formatDateKey = (date: Date, duration: string): string => {
  const year = date.getFullYear();
  const month = date.toLocaleString("default", { month: "short" }); // Get month name in short format (e.g., Jan, Feb)
  const week = getStartOfWeek(date);

  switch (duration) {
    case "yearly":
      return year.toString();
    case "monthly":
      return `${month}`;
    default:
      return "";
  }
};

// Helper function to get the start of the week (Monday)
const getStartOfWeek = (date: Date) => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  result.setDate(diff);
  return result;
};

const formatPeriodicRevenue = (
  orderItems: any[],
  duration: string,
  currentYear: number,
  role: VendorRole
) => {
  let periods: Date[] = [];

  if (duration === "yearly") {
    // Initialize periods for the last 5 years
    periods = Array.from(
      { length: 5 },
      (_, i) => new Date(currentYear - i, 0, 1)
    );
  } else if (duration === "monthly") {
    // Initialize periods for all 12 months of the current year
    periods = Array.from({ length: 12 }, (_, i) => new Date(currentYear, i, 1));
  }

  const revenue = periods.reduce((acc: any, period) => {
    const key = formatDateKey(period, duration);
    acc[key] = 0; // Initialize revenue for each period to 0
    return acc;
  }, {});

  // Accumulate actual revenue from order items
  for (const orderItem of orderItems) {
    const orderDate =
      role === VendorRole.SELLER
        ? new Date(orderItem.order.createdAt)
        : new Date(orderItem.createdAt);
    const key = formatDateKey(orderDate, duration);

    // Add order item total amount to revenue for the corresponding period
    if (revenue[key] !== undefined) {
      revenue[key] += orderItem.amountTotal;
    }
  }

  // Format the revenue data into the desired response format
  return Object.keys(revenue).map((key) => ({
    name: key,
    total: revenue[key],
  }));
};

const getStartAndEndDates = (duration: string) => {
  const currentDate = new Date();
  let startDate: Date;
  let endDate: Date = currentDate;

  switch (duration) {
    case "yearly":
      startDate = new Date(currentDate.getFullYear(), 0, 1); // Start of the current year
      break;
    case "monthly":
      startDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      ); // Start of the current month
      break;
    case "weekly":
      startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - currentDate.getDay()); // Start of the current week (Sunday)
      break;
    default:
      startDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      ); // Default to monthly if no valid duration is provided
  }

  return { startDate, endDate };
};
