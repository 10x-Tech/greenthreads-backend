import { Request, Response } from "express";
import { sendSuccessResponse } from "../utils";
import fs from "fs";
import { uploadedParts } from "../aws/uploadFileInParts";

export const uploadFile = async (req: Request, res: Response) => {
  try {
    const key = "YOUR_OBJECT_KEY";
    if (req.file) {
      const file = fs.readFileSync(req.file.path);
      const fileSize = req.file.size;
      const chunkSize = 1024 * 1024 * 25;
      const numParts = Math.ceil(fileSize / chunkSize);
      const filePath = req.file.path;

      let response = await uploadedParts(
        numParts,
        chunkSize,
        file,
        key,
        filePath
      );

      return sendSuccessResponse(res, 201, { message: response.message });
    }
  } catch (error) {
    throw error;
  }
};
