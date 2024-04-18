import express from "express";
import * as controller from "../controllers/products";

const router = express.Router();

// get all products for seller
router.get("/", controller.getProductsBySellerId);

// create products
router.post("/", controller.createProducts);

export default router;
