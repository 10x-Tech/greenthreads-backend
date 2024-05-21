import catchAsync from "@/utils/catchAsync";
import { NextFunction, Request, Response } from "express";
import prisma from "@/lib/prisma";
import AppError from "@/utils/AppError";

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

      res.status(200).json(newCategory);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ error: "Internal server error" });
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
