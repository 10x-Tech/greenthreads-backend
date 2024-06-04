import catchAsync from "@/utils/catchAsync";
import { NextFunction, Request, Response } from "express";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const getAllCategories = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const offset = (page - 1) * limit;
    const query: Prisma.CategoryFindManyArgs = {
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    };

    const [categories, count] = await prisma.$transaction([
      prisma.category.findMany(query),
      prisma.category.count(),
    ]);

    const totalPages = Math.ceil(count / limit);
    res.status(200).json({
      success: true,
      pagination: {
        total: count,
        page: page,
        limit: limit,
        pageCount: totalPages,
      },
      data: categories,
    });
  }
);

export const getSubCategoriesBasedOnParent = catchAsync(
  async (req: Request, res: Response) => {
    const categoryId = req.params.categoryId; // Parse category ID

    const parentCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!parentCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    console.log(parentCategory, "SUBB");

    const subCategories = await prisma.category.findMany({
      where: {
        parentId: categoryId,
      },
    });
    res.status(200).json(subCategories);
  }
);
