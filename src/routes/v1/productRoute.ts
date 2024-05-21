import express, { Router } from "express";
import {
  createProduct,
  getProductById,
  createOrUpdateSKU,
  updateProduct,
  getAllProducts,
  getAllVariations,
  getAllSkus,
  deleteProduct,
} from "@/controllers/productControllers";
import { auth } from "@/middleware";
const router: Router = express.Router();

// PRODUCTS
router.route("/get-variations").get(getAllVariations);

router.use(auth);
router.route("/").get(getAllProducts).post(createProduct);
router
  .route("/:productId")
  .get(getProductById)
  .patch(updateProduct)
  .delete(deleteProduct);

router.route("/:productId/skus").get(getAllSkus);
router.route("/:productId/skus/addEdit").post(createOrUpdateSKU);

export default router;
