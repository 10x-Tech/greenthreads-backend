import catchAsync from "@/utils/catchAsync";
import { NextFunction, Request, Response } from "express";
import prisma from "@/lib/prisma";
import AppError from "@/utils/AppError";

export const createBrand = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, description, brandImg, id } = req.body;
    const sellerId = req.auth.userId as string;

    const brand = await prisma.brand.upsert({
      where: { id: id ?? "1" },
      update: {
        name,
        description,
        media: brandImg,
      },
      create: {
        name,
        description,
        media: brandImg,
        sellerId,
        // seller: {
        //   connect: {
        //     externalId: sellerId,
        //   },
        // },
      },
    });

    res.status(200).json(brand);
  }
);

export const getBrandBySeller = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const sellerId = req.auth.userId as string;
    const brand = await prisma.brand.findUnique({
      where: {
        sellerId,
      },
    });
    if (!brand) {
      return next(new AppError(404, "Brand Not Found!"));
    }

    res.status(200).json({
      success: true,
      data: brand,
    });
  }
);
export const getBrandById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const brand = await prisma.brand.findUnique({
      where: {
        id,
      },
    });
    if (!brand) {
      return next(new AppError(404, "Brand Not Found!"));
    }

    res.status(200).json(brand);
  }
);
