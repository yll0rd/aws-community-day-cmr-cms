import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { uploadToS3, deleteFromS3 } from '@/lib/s3';

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.success) {
            return NextResponse.json(
                { error: authResult.error },
                { status: 401 }
            );
        }

        const formData = await request.formData();

        const name = formData.get('name') as string;
        const title = formData.get('title') as string;
        const bio = formData.get('bio') as string;
        const keyNote = formData.get('keyNote') as string;
        const yearId = formData.get('yearId') as string;
        const file = formData.get('photo') as File;
        const removePhoto = formData.get('removePhoto') as string;

        if (!name || !yearId) {
            return NextResponse.json(
                { error: 'Name and year ID are required' },
                { status: 400 }
            );
        }

        // Get current speaker to check for existing photo
        const currentSpeaker = await db.speaker.findUnique({
            where: { id: params.id }
        });

        let photoUrl = currentSpeaker?.photoUrl;

        // Handle photo removal
        if (removePhoto === 'true' && currentSpeaker?.photoUrl) {
            try {
                // Extract key from URL and delete from S3
                const key = currentSpeaker.photoUrl.replace(`https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/`, '');
                await deleteFromS3(key);
                photoUrl = null;
            } catch (deleteError) {
                console.error('Error deleting old photo:', deleteError);
            }
        }

        // Handle new file upload
        if (file && file.size > 0) {
            try {
                // Delete old photo if exists
                if (currentSpeaker?.photoUrl) {
                    const oldKey = currentSpeaker.photoUrl.replace(`https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/`, '');
                    await deleteFromS3(oldKey);
                }

                // Upload new photo
                photoUrl = await uploadToS3(file, 'speakers');
            } catch (uploadError) {
                console.error('Error uploading speaker photo:', uploadError);
                return NextResponse.json(
                    { error: 'Failed to upload speaker photo' },
                    { status: 500 }
                );
            }
        }

        const speaker = await db.speaker.update({
            where: { id: params.id },
            data: {
                name,
                title: title || null,
                bio: bio || null,
                photoUrl,
                keyNote: keyNote || null,
                yearId
            }
        });

        return NextResponse.json(speaker);
    } catch (error) {
        console.error('Error updating speaker:', error);
        return NextResponse.json(
            { error: 'Failed to update speaker' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.success) {
            return NextResponse.json(
                { error: authResult.error },
                { status: 401 }
            );
        }

        // Get speaker to delete their photo from S3
        const speaker = await db.speaker.findUnique({
            where: { id: params.id }
        });

        // Delete photo from S3 if exists
        if (speaker?.photoUrl) {
            try {
                const key = speaker.photoUrl.replace(`https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/`, '');
                await deleteFromS3(key);
            } catch (deleteError) {
                console.error('Error deleting speaker photo:', deleteError);
            }
        }

        await db.speaker.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ message: 'Speaker deleted successfully' });
    } catch (error) {
        console.error('Error deleting speaker:', error);
        return NextResponse.json(
            { error: 'Failed to delete speaker' },
            { status: 500 }
        );
    }
}