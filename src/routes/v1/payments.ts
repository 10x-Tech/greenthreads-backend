import express, { Router } from "express";
import * as paymentController from "@/controllers/paymentController";
import { auth, authorizeRoles } from "@/middleware";
import { VendorRole } from "@prisma/client";
const router: Router = express.Router();

router.use(auth);
const allowedRoles = Object.values(VendorRole);

router.get(
  "/",
  authorizeRoles(VendorRole.SELLER),
  paymentController.getPaymentsBySeller
);

router.get(
  "/revenue",
  authorizeRoles(...allowedRoles),
  paymentController.getRevenueInfo
);

export default router;
