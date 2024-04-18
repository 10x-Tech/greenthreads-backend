import { 
    CreateMultipartUploadCommand, 
    UploadPartCommand, 
    CompleteMultipartUploadCommand, 
    AbortMultipartUploadCommand 
  } from '@aws-sdk/client-s3';
  import fs from 'fs';
  import { s3Client,BUCKET_NAME } from './awsSetup';

function sleep(ms:number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function uploadPartWithRetry(buffer: Buffer, uploadId: string, partNumber: number, key: string): Promise<any> {

    const params = {
        Bucket: BUCKET_NAME,
        Body: buffer,
        Key: key,
        PartNumber: partNumber,
        UploadId: uploadId,
    };

    try {
        return await s3Client.send(new UploadPartCommand(params));
    } catch (error:any) {
        console.log(`Error uploading part ${partNumber}:`, error.message);
        await sleep(20000); // Retry after 20 seconds
        return uploadPartWithRetry(buffer, uploadId, partNumber, key);
    }
}

export async function uploadedParts(numParts: number, chunkSize: number, file: Buffer, key: string, filePath: string): Promise<{ message: string; code: number }> {

    let MP_UPLOAD_ID;
    try {
        const initResponse = await s3Client.send(new CreateMultipartUploadCommand({ Bucket: BUCKET_NAME, Key: key }));
        const MP_UPLOAD_ID = initResponse.UploadId;
        
        const promise = [];
        const slicedData = [];

        for (let index = 1; index <= numParts; index++) {
            let start = (index - 1) * chunkSize;
            let end = index * chunkSize;
            const slicedFile = (index < numParts) ? file.slice(start, end) : file.slice(start);

            let res = await uploadPartWithRetry(slicedFile, MP_UPLOAD_ID, index, key);
            promise.push(res);
            slicedData.push({ PartNumber: index, buffer: Buffer.from(file.slice(start, end + 1)) });
            console.log('Uploaded part', index);
        }

        const CompletedParts = promise.map(({ ETag }, i) => ({
            ETag,
            PartNumber: i + 1,
        }));

        await s3Client.send(new CompleteMultipartUploadCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            UploadId: MP_UPLOAD_ID,
            MultipartUpload: { Parts: CompletedParts }
        }));

        await sleep(20000); // Additional delay after completion

        fs.unlinkSync(filePath);
        return { message: 'File uploaded successfully', code: 200 };
    } catch (error) {
        console.error('An unexpected error occurred:', error);
        await s3Client.send(new AbortMultipartUploadCommand({ Bucket: BUCKET_NAME, Key: key, UploadId: MP_UPLOAD_ID }));
        fs.unlinkSync(filePath);
        return { message: 'Failed to upload file', code: 500 };
    }
}

