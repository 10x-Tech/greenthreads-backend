import catchAsync from "@/utils/catchAsync";
import { NextFunction, Request, Response } from "express";
import prisma from "@/lib/prisma";
import AppError from "@/utils/AppError";
import { OrderStatus, Prisma, VendorRole } from "@prisma/client";
import { formatPeriodicRevenue } from "@/utils/helper";

export const getAllSellerList = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { search, page = 1, limit = 10 } = req.query;
    const query: Prisma.VendorFindManyArgs = {
      where: {
        role: {
          not: VendorRole.ADMIN,
        },
        user: {
          isActive: true,
        },
      },
      include: {
        user: true,
      },
    };

    if (search) {
      query.where = {
        ...query.where,
        OR: [
          {
            fullName: {
              contains: search.toString(),
            },
          },
        ],
      };
    }

    const [sellers, count] = await prisma.$transaction([
      prisma.vendor.findMany(query),
      prisma.vendor.count({ where: query.where }),
    ]);

    const totalPages = Math.ceil(count / Number(limit));

    res.status(200).json({
      success: true,
      pagination: {
        total: count,
        page: page,
        limit: limit,
        pageCount: totalPages,
      },
      data: sellers,
    });
  }
);

export const getAllCustomerList = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { search, page = 1, limit = 10 } = req.query;
    const query: Prisma.CustomerFindManyArgs = {
      where: {
        user: {
          isActive: true,
        },
      },
      include: {
        user: true,
      },
    };

    if (search) {
      query.where = {
        ...query.where,
        OR: [
          {
            fullName: {
              contains: search.toString(),
              mode: "insensitive",
            },
          },
          {
            user: {
              is: {
                email: {
                  contains: search.toString(),
                  mode: "insensitive",
                },
              },
            },
          },
        ],
      };
    }

    const [customers, count] = await prisma.$transaction([
      prisma.customer.findMany(query),
      prisma.customer.count({ where: query.where }),
    ]);

    const totalPages = Math.ceil(count / Number(limit));

    res.status(200).json({
      success: true,
      pagination: {
        total: count,
        page: page,
        limit: limit,
        pageCount: totalPages,
      },
      data: customers,
    });
  }
);

export const getAllOrderList = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const rawStatus = req.query.status?.toString() ?? "";
    const search = req.query.search?.toString();
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const offset = (page - 1) * limit;
    const from = req.query.from?.toString();
    const to = req.query.to?.toString();

    const statusArray = validateOrderStatus(rawStatus);

    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;

    const query: Prisma.OrderFindManyArgs = {
      include: {
        orderItems: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
      where: {
        ...(fromDate && toDate && { createdAt: { gte: fromDate, lt: toDate } }),
        ...(statusArray.length > 0 && { status: { in: statusArray } }),
        ...(search && {
          OR: [
            { customerDetails: { path: ["name"], string_contains: search } },
            { customerDetails: { path: ["email"], string_contains: search } },
          ],
        }),
      },
    };

    const [orders, count] = await prisma.$transaction([
      prisma.order.findMany(query),
      prisma.order.count({ where: query.where }),
    ]);

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      success: true,
      pagination: {
        total: count,
        page,
        limit,
        pageCount: totalPages,
      },
      data: orders,
    });
  }
);

export const getOrderDetails = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: true,
      },
    });

    if (!order) {
      return next(new AppError(404, "Order Not Found!"));
    }

    res.status(200).json({
      success: true,
      data: {
        ...order,
      },
    });
  }
);

export const getAllPayments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { search, from, to, page = 1, limit = 10 }: any = req.query;

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
      where: {
        ...whereClause,
      },
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

export const getRevenueInfo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let { duration }: any = req.query;

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
        currentYear
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
);

export const getAllCategories = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const categories = await prisma.category.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    res.status(200).json({
      success: true,
      categories: categories,
    });
  }
);

export const getAllBrands = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const brands = await prisma.brand.findMany({});
    res.status(200).json({
      success: true,
      data: brands,
    });
  }
);

export const createCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, description, categoryImg, categorySlug, parentId } =
        req.body;

      if (parentId) {
        const parentCategory = await prisma.category.findUnique({
          where: {
            id: parentId,
          },
        });

        if (!parentCategory) {
          return next(new AppError(404, "Parent Category Not Found!"));
        }
      }

      const newCategory = await prisma.category.create({
        data: {
          name,
          description,
          categoryImg,
          categorySlug,
          parentId,
        },
        include: {
          children: true,
        },
      });

      res.status(200).json({
        success: true,
        data: newCategory,
      });
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

//HELER FUNCTIOS
function validateOrderStatus(statusString: string): OrderStatus[] | [] {
  if (!statusString) {
    return []; // No status provided, don't filter
  }

  const statusArray = statusString.split(",").map((str) => str.trim());

  // Validate each status against the OrderStatus enum
  const validStatuses: OrderStatus[] = [];
  for (const status of statusArray) {
    if (Object.values(OrderStatus).includes(status as OrderStatus)) {
      validStatuses.push(status as OrderStatus);
    } else {
      return [];
    }
  }

  return validStatuses;
}
