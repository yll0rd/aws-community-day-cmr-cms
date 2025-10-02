import { S3Client } from '@aws-sdk/client-s3';

// Validate that all required environment variables are present
const requiredEnvVars = [
    'AWS_S3_ACCESS_KEY_ID',
    'AWS_S3_SECRET_ACCESS_KEY',
    'AWS_S3_REGION',
    'AWS_S3_BUCKET_NAME'
];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}

// S3 client with explicit configuration
const s3Client = new S3Client({
    region: process.env.AWS_S3_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY!,
    },
    // additional configuration for better error handling
    maxAttempts: 3,
    requestHandler: {
        // request timeout
        requestTimeout: 5000,
    },
});

export { s3Client };