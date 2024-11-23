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
  bulkUpload,
} from "@/controllers/productControllers";
import { auth, authorizeRoles } from "@/middleware";
import { VendorRole } from "@prisma/client";
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() });

const router: Router = express.Router();

// PRODUCTS
router.route("/get-variations").get(getAllVariations);

router.use(auth, authorizeRoles(VendorRole.SELLER));
router.route("/").get(getAllProducts).post(createProduct);
router.route("/bulk-upload").post(bulkUpload);

router
  .route("/:productId")
  .get(getProductById)
  .patch(updateProduct)
  .delete(deleteProduct);

router.route("/:productId/skus").get(getAllSkus);
router.route("/:productId/skus/addEdit").post(createOrUpdateSKU);

export default router;
