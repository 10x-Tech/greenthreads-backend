import express, { Router } from "express";
import {
  createProduct,
  getProductById,
  createOrUpdateSKU,
  updateProduct,
  getAllProducts,
  getAllVariations,
  getAllSkus,
} from "@/controllers/productControllersV2";
import { auth } from "@/middleware";
const router: Router = express.Router();

// PRODUCTS
router.route("/get-variations").get(getAllVariations);

router.use(auth);

router.route("/:productId/skus/addEdit").post(createOrUpdateSKU);
router.route("/").get(getAllProducts).post(createProduct);

// router
//   .route("/:productId")
//   .get(getProductById)
//   .patch(updateProduct)
//   .delete(deleteProduct);

router.route("/:productId/skus").get(getAllSkus);

router.route("/:productId").get(getProductById).patch(updateProduct);

export default router;
