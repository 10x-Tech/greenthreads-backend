import catchAsync from "@/utils/catchAsync";
import { NextFunction, Request, Response } from "express";
import prisma from "@/lib/prisma";
import AppError from "@/utils/AppError";

export const getCurrentDayData = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const sellerId = req.auth.userId as string;
    try {
      // Get the start of the current day
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      // Get the end of the current day
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      // Query to count today's orders
      const orderCount = await prisma.order.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
          orderItems: {
            some: {
              sellerId: sellerId,
            },
          },
        },
      });

      // Query to sum today's revenue
      const totalRevenue = await prisma.payments.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          sellerId: sellerId,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      // Format the response
      const analytics = {
        todayOrders: orderCount,
        todayRevenue: totalRevenue._sum.amount || 0,
      };

      res.json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      console.error(error);
      return next(
        new AppError(500, "An error occurred while fetching analytics data")
      );
    }
  }
);
