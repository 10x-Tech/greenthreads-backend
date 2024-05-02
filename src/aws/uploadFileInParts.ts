import {
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import fs from "fs";
import { s3Client, BUCKET_NAME } from "./awsSetup";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function uploadPartWithRetry(
  buffer: Buffer,
  uploadId: string,
  partNumber: number,
  key: string
): Promise<any> {
  const params = {
    Bucket: BUCKET_NAME,
    Body: buffer,
    Key: key,
    PartNumber: partNumber,
    UploadId: uploadId,
  };

  try {
    return await s3Client.send(new UploadPartCommand(params));
  } catch (error: any) {
    console.log(`Error uploading part ${partNumber}:`, error.message);
    await sleep(20000); // Retry after 20 seconds
    return uploadPartWithRetry(buffer, uploadId, partNumber, key);
  }
}

/**
 * @param numParts The number of parts the file will be split into.
 * @param chunkSize The size of each chunk in bytes.
 * @param file The buffer containing the file data.
 * @param key The key (filename) under which the file will be stored in S3.
 * @param filePath The path to the temporary file on the server's disk.
 * @returns A promise containing a message indicating success or failure and a status code.
 */
export async function uploadedParts(
  numParts: number,
  chunkSize: number,
  file: Buffer,
  key: string,
  filePath: string
): Promise<{ message: string; code: number; data?: any }> {
  let MP_UPLOAD_ID;
  try {
    // Step 1: Initiate Multipart Upload
    const initResponse = await s3Client.send(
      new CreateMultipartUploadCommand({ Bucket: BUCKET_NAME, Key: key })
    );
    const MP_UPLOAD_ID = initResponse.UploadId;

    const promise = []; // Array to store promises for individual part uploads
    const slicedData = []; // Array to store sliced data

    // Step 2: Split File into Chunks and Upload Each Part
    for (let index = 1; index <= numParts; index++) {
      let start = (index - 1) * chunkSize;
      let end = index * chunkSize;
      const slicedFile =
        index < numParts ? file.slice(start, end) : file.slice(start);

      // Upload each part and push the result into the promises array
      let res = await uploadPartWithRetry(slicedFile, MP_UPLOAD_ID, index, key);
      promise.push(res);

      // Store sliced data for later use
      slicedData.push({
        PartNumber: index,
        buffer: Buffer.from(file.slice(start, end + 1)),
      });
      console.log("Uploaded part", index);
    }

    // Step 3: Complete Multipart Upload
    const CompletedParts = promise.map(({ ETag }, i) => ({
      ETag,
      PartNumber: i + 1,
    }));

    // Send command to complete multipart upload
    const s3Response = await s3Client.send(
      new CompleteMultipartUploadCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        UploadId: MP_UPLOAD_ID,
        MultipartUpload: { Parts: CompletedParts },
      })
    );

    await sleep(20000); // Additional delay after completion

    // Step 4: Clean Up - Delete temporary file from disk
    fs.unlinkSync(filePath);
    return {
      message: "File uploaded successfully",
      code: 200,
      data: s3Response,
    };
  } catch (error) {
    console.error("An unexpected error occurred:", error);

    // Abort multipart upload on error
    await s3Client.send(
      new AbortMultipartUploadCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        UploadId: MP_UPLOAD_ID,
      })
    );

    // Clean up - Delete temporary file from disk
    fs.unlinkSync(filePath);

    return { message: "Failed to upload file", code: 500 };
  }
}
