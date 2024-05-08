import express, { Router, Request, Response } from "express";
import {
  createProduct,
  getAllProducts,
  createVariation,
  getVariations,
  updateVariation,
  deleteVariation,
  // bulkUpload,
  getProductById,
  updateProduct,
  deleteProduct,
} from "@/controllers/productController";
import multer from "multer";
import { checkAuth } from "@/middleware";
const router: Router = express.Router();
const upload = multer({ dest: "src/uploads/" });

// VARIATIONS

// router.use(checkAuth);
// Get
router.route("/variations").get(getVariations).post(createVariation);

// Update
router.route("/variations/:id").patch(updateVariation).delete(deleteVariation);

// PRODUCTS

// router.post("/bulk-upload", upload.single("file"), bulkUpload);
router.route("/").get(getAllProducts).post(createProduct);

router
  .route("/:productId")
  .get(getProductById)
  .patch(updateProduct)
  .delete(deleteProduct);

export default router;
