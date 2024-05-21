import express from "express";
import * as controllers from "@/controllers/orderController";
import bodyParser from "body-parser";
const router = express.Router();

router.get("/checkout-session/:cartId", controllers.getCheckoutSession);

router.post(
  "/",
  bodyParser.raw({ type: "application/json" }),
  controllers.webhoookCheckout
);

export default router;
