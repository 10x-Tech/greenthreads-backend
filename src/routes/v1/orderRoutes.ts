import express, { Router } from "express";
import * as orderControllers from "@/controllers/orderController";
import { auth } from "@/middleware";
const router: Router = express.Router();

router.use(auth);

// // Route to create a new order
// router.post("/orders", createOrder);

// // Route to retrieve all orders
router.get("/", orderControllers.getOrdersBySellerId);

// // Route to retrieve a specific order by ID
router.get("/:orderId", orderControllers.getOrderById);

router.post("/update-status", orderControllers.updateOrderItemStatus);

export default router;
