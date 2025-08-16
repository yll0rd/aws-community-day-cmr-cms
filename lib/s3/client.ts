import { S3Client } from '@aws-sdk/client-s3';;

const REGION = process.env.NEXT_PUBLIC_AWS_S3_REGION as string;
const ACCESS_KEY_ID = process.env.NEXT_PUBLIC_AWS_S3_ACCESS_ID as string;
const SECRET_ACCESS_KEY = process.env.NEXT_PUBLIC_AWS_S3_SECRET_KEY as string;

export const s3Client = new S3Client({
    region: REGION,
    credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY
    },
});