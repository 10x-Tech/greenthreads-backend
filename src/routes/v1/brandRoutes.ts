import express, { Router } from "express";
import {
  createBrand,
  getBrandById,
  getBrandBySeller,
} from "@/controllers/brandController";
import { auth, authorizeRoles } from "@/middleware";
import { VendorRole } from "@prisma/client";

const router: Router = express.Router();

router.use(auth);

router.route("/").get(authorizeRoles(VendorRole.SELLER), getBrandBySeller);

router.route("/").post(authorizeRoles(VendorRole.SELLER), createBrand);

router.route("/:brandId").get(authorizeRoles(VendorRole.SELLER), getBrandById);
export default router;
