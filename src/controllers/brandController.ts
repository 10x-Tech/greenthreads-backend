import catchAsync from "@/utils/catchAsync";
import { NextFunction, Request, Response } from "express";
import prisma from "@/lib/prisma";
import AppError from "@/utils/AppError";

export const getAllBrands = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const brands = await prisma.brand.findMany();
    res.status(200).json(brands);
  }
);

export const createBrand = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, description, media } = req.body;
    const brand = await prisma.brand.create({
      data: {
        name,
        description,
        media,
      },
    });

    res.status(200).json(brand);
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
