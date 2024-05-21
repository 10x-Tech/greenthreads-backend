import express, { Router } from "express";
import {
  getAllBrands,
  createBrand,
  getBrandById,
} from "@/controllers/brandController";

const router: Router = express.Router();

router.route("/").get(getAllBrands).post(createBrand);

router.route("/:brandId").get(getBrandById);

// router.route("/subcategories").get(getAllSubCategories).post(createSubCategory);

export default router;
