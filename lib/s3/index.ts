import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from './client';

const BUCKET_NAME = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME as string;
const REGION = process.env.NEXT_PUBLIC_AWS_S3_REGION as string;

const uploadToS3 = async (file: File, directoryPath = "") => {
    try {
        const fileArrayBuffer = await file.arrayBuffer();

        // Generate a unique filename to avoid conflicts
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExtension = file.name.split('.').pop();
        const uniqueFilename = `${timestamp}_${randomString}.${fileExtension}`;

        const key = directoryPath ? `${directoryPath}/${uniqueFilename}` : uniqueFilename;

        const params = {
            Bucket: BUCKET_NAME,
            Key: key,
            Body: new Uint8Array(fileArrayBuffer),
            ContentType: file.type,
        };

        const command = new PutObjectCommand(params);
        await s3Client.send(command);

        // Return the full URL with the correct key
        return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;
    } catch (error) {
        console.error('Error uploading file to S3:', error);
        throw error;
    }
};

const deleteFromS3 = async (filePath: string) => {
    try {
        // Extract the key from the full URL if provided
        const key = filePath.replace(`https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/`, '');

        const input = {
            Bucket: BUCKET_NAME,
            Key: key,
        };
        const command = new DeleteObjectCommand(input);
        await s3Client.send(command);
    } catch (error) {
        console.error('Error deleting file from S3:', error);
        throw error;
    }
};

export { uploadToS3, deleteFromS3 };