import { PutObjectCommand } from '@aws-sdk/client-s3';
import {s3Client} from "@/lib/s3";

const BUCKET_NAME = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME as string;

export async function uploadToS3(
    file: File,
    folder: string = 'gallery'
): Promise<string> {
    try {
        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExtension = file.name.split('.').pop();
        const fileName = `${folder}/${timestamp}-${randomString}.${fileExtension}`;

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to S3
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileName,
            Body: buffer,
            ContentType: file.type,
            ACL: 'public-read', // Make the file publicly accessible
        });

        await s3Client.send(command);

        // Return the public URL
        const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_S3_REGION}.amazonaws.com/${fileName}`;
        return fileUrl;
    } catch (error) {
        console.error('Error uploading to S3:', error);
        throw new Error('Failed to upload image to S3');
    }
}

export async function deleteFromS3(fileUrl: string): Promise<void> {
    try {
        // Extract the key from the URL
        const url = new URL(fileUrl);
        const key = url.pathname.substring(1); // Remove leading slash

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });

        await s3Client.send(command);
    } catch (error) {
        console.error('Error deleting from S3:', error);
        throw new Error('Failed to delete image from S3');
    }
}