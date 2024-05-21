import express, { Router } from "express";
import {
  createCategory,
  getAllCategories,
  getSubCategoriesBasedOnParent,
} from "@/controllers/categoryController";

const router: Router = express.Router();

router.route("/categories").get(getAllCategories).post(createCategory);

router.route("/subcategories/:categoryId").get(getSubCategoriesBasedOnParent);

// router.route("/subcategories").get(getAllSubCategories).post(createSubCategory);

export default router;
