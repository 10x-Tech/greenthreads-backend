import express from "express";
import * as controller from "@/controllers/webhooks";

const router = express.Router();

// user webhook
router.post("/", controller.syncUser);

export default router;
