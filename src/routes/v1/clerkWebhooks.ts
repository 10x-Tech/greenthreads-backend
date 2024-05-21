import express from "express";
import * as controller from "@/controllers/clerkWebhookController";
import bodyParser from "body-parser";

const router = express.Router();

// user webhook
router
  .use(bodyParser.raw({ type: "application/json" }))
  .route("/")
  .post(controller.syncUser);

export default router;
