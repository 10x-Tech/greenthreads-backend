import express, { Router } from "express";
import * as analyticsController from "@/controllers/analytics";
import { auth } from "@/middleware";
const router: Router = express.Router();

router.use(auth);

// // Route to retrieve all orders
router.get("/today", analyticsController.getCurrentDayData);

export default router;
