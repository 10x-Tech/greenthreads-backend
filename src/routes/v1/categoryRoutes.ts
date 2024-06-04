import express, { Router } from "express";
import {
  getAllCategories,
  getSubCategoriesBasedOnParent,
} from "@/controllers/categoryController";
import { auth } from "@/middleware";

const router: Router = express.Router();

router.route("/").get(getAllCategories);

router.route("/subcategories/:categoryId").get(getSubCategoriesBasedOnParent);

export default router;
