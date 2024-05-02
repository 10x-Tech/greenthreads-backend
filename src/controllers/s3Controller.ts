import { Request, Response } from "express";
import { sendSuccessResponse } from "../utils";
import fs from "fs";
import { uploadedParts } from "@/aws/uploadFileInParts";
import catchAsync from "@/utils/catchAsync";
import multer from "multer";
import { s3Client } from "@/aws/awsSetup";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
const upload = multer({ dest: "src/uploads/" });

export const uploadFile = catchAsync(async (req: Request, res: Response) => {
  const url = await generateUploadURL();
  if (url) {
    res.status(200).json({
      url,
    });
  }
});

export const getObjectURL = async () => {
  const key = "YOUR_OBJECT_KEY";
  const command = new GetObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: key,
  });

  const url = await getSignedUrl(s3Client, command);
  return url;
};

export const generateUploadURL = async () => {
  const key = "YOUR_OBJECT_KEY";
  console.log(process.env.BUCKET_NAME, "BUCKET");
  const command = new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: key,
  });

  const uploadUrl = await getSignedUrl(s3Client, command);
  return uploadUrl;
};
