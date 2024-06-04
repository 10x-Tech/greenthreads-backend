import express, { Router } from "express";
import * as adminControllers from "@/controllers/adminController";
import { auth, authorizeRoles } from "@/middleware";
import { VendorRole } from "@prisma/client";
const router: Router = express.Router();

router.use(auth, authorizeRoles(VendorRole.ADMIN));

// // Route to retrieve all orders
router.get("/sellers/get-all", adminControllers.getAllSellerList);

router.get("/customers/get-all", adminControllers.getAllCustomerList);

router.get("/orders/get-all", adminControllers.getAllOrderList);

router.get("/orders/:orderId", adminControllers.getOrderDetails);

router.get("/payments/get-all", adminControllers.getAllPayments);

router.get("/brands/get-all", adminControllers.getAllBrands);

router.get("/revenue-info", adminControllers.getRevenueInfo);

router.post("/categories/create", adminControllers.createCategory);

export default router;
