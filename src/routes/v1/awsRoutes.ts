import express from "express";
import * as controller from "../../controllers/aws";

const router = express.Router();

// create products
router.post("/file_upload", controller.uploadFile);

export default router;
