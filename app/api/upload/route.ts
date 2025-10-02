import { NextRequest, NextResponse } from 'next/server';
import { uploadToS3 } from '@/lib/s3';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        // Verify authentication
        const authResult = await verifyAuth(request);
        if (!authResult.success) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const directory = formData.get('directory') as string || 'gallery';

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' },
                { status: 400 }
            );
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File size too large. Maximum size is 5MB.' },
                { status: 400 }
            );
        }

        const url = await uploadToS3(file, directory);

        return NextResponse.json({
            url,
            message: 'File uploaded successfully'
        });
    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Upload failed: ' + error.message },
            { status: 500 }
        );
    }
}