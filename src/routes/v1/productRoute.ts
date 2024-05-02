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
  // updateProduct,
  // deleteProduct,
} from "@/controllers/productController";
import multer from "multer";
const router: Router = express.Router();
const upload = multer({ dest: "src/uploads/" });

//bulk upload
// router.post("/bulk-upload", upload.single("file"), bulkUpload);

// Get all products
router.get("/", getAllProducts);

// Get all products
router.route("/add").post(createProduct);

// Get product by ID
router.get("/:id", getProductById);

// // Update product
// router.put("/:id", updateProduct);

// // Delete product
// router.delete("/:id", deleteProduct);

// Variations

// Create
router.route("/create-variation").post(createVariation);

// Get
router.route("/variations").get(getVariations);

// update
router.route("/variations/:id").patch(updateVariation).delete(deleteVariation);

export default router;
