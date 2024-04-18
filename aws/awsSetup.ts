const { S3Client } = require('@aws-sdk/client-s3');

export const BUCKET_NAME = 'fistbucketfourall';

export const s3Client = new S3Client({
    region: "ap-south-1",
    credentials: {
        accessKeyId: "AKIASHIPHR3IKVD7TKPK",
        secretAccessKey: "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",
    },
});

