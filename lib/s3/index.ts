import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from './client';

const BUCKET_NAME = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME as string;
const REGION = process.env.NEXT_PUBLIC_AWS_S3_REGION as string;

const uploadToS3 = async (file: File, directoryPath="") => {
    try {
        const fileArrayBuffer = await file.arrayBuffer();
        const params = {
            Bucket: BUCKET_NAME,
            Key: directoryPath ? `${directoryPath}/${file.name}` : file.name,
            Body: new Uint8Array(fileArrayBuffer),
            ContentType: file.type,
        };

        const command = new PutObjectCommand(params);
        await s3Client.send(command);

        return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${file.name}`;
    } catch (error) {
        console.error('Error uploading file to S3:', error);
        throw error;
    }
};

const deleteFromS3 = async (filePath: string) => {
    try {
        const input = { // DeleteObjectRequest
            Bucket: BUCKET_NAME, // required
            Key: filePath, // required
        };
        const command = new DeleteObjectCommand(input);
        await s3Client.send(command);
    } catch (error) {
        console.error('Error deleting file from S3:', error);
        throw error;
    }

};

export { uploadToS3, deleteFromS3 };
export * from './client'; // Export the S3 client for use in other modules