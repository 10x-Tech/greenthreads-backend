import catchAsync from "@/utils/catchAsync";
import { NextFunction, Request, Response } from "express";
import prisma from "@/lib/prisma";
import AppError from "@/utils/AppError";

export const createCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body, "BODYY");
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

function findSubcategories(categories: any, parentCategory: any) {
  const subcategories = [];

  for (const category of categories) {
    if (
      category.id !== parentCategory.id && // Exclude the parent itself
      category.left > parentCategory.left &&
      category.right < parentCategory.right
    ) {
      subcategories.push(category);
    }
  }

  return subcategories;
}

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

    // const subcategories = await prisma.category.findMany({
    //   where: {
    //     left: { gt: parentCategory?.left }, // Greater than category's left value
    //     right: { lt: parentCategory?.right }, // Less than category's right value
    //   },
    // });

    const subCategories = await prisma.category.findMany({
      where: {
        parentId: categoryId,
      },
    });
    res.status(200).json(subCategories);
  }
);

// export const createSubCategory = catchAsync(
//   async (req: Request, res: Response) => {
//     const { subCategoryName, categoryId } = req.body;
//     const subcategory = await prisma.subCategory.create({
//       data: {
//         subCategoryName,
//         Category: { connect: { catId: categoryId } },
//       },
//     });
//     res.status(200).json(subcategory);
//   }
// );

// export const getAllSubCategories = catchAsync(
//   async (req: Request, res: Response) => {
//     const subcategories = await prisma.subCategory.findMany();
//     res.status(200).json(subcategories);
//   }
// );
