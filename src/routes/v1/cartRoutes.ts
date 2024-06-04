import express, { Router } from "express";
import {
  addToCart,
  getCartItems,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
  getCartSummary,
} from "@/controllers/cartController";
const router: Router = express.Router();

router.route("/:customerId/items").get(getCartItems);
router
  .route("/item/:cartItemId")
  .patch(updateCartItemQuantity)
  .delete(removeCartItem);

router.route("/:customerId/clear").delete(clearCart);

router.route("/:customerId/add-item").post(addToCart);

router.route("/:customerId/cart-summary").get(getCartSummary);

export default router;
