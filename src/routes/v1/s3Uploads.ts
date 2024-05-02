import express from "express";
import { uploadFile } from "@/controllers/s3Controller";
import multer from "multer";
const upload = multer({ dest: "src/uploads/" });

const router = express.Router();

// user webhook
// router.post("/s3-upload", uploadFile);
router.get("/s3-upload", uploadFile);


export default router;
