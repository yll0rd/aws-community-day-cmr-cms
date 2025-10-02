import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { uploadToS3 } from '@/lib/s3';

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

        // Extract text fields
        const name = formData.get('name') as string;
        const affiliation = formData.get('affiliation') as string;
        const role = formData.get('role') as string;
        const file = formData.get('photo') as File;
        const removePhoto = formData.get('removePhoto') === 'true';

        if (!name || !affiliation || !role) {
            return NextResponse.json(
                { error: 'Name, affiliation, and role are required' },
                { status: 400 }
            );
        }

        let photoUrl: string | null | undefined = undefined;

        // Handle photo removal
        if (removePhoto) {
            photoUrl = null;
        }
        // Handle new file upload
        else if (file && file.size > 0) {
            try {
                photoUrl = await uploadToS3(file, 'organizers');
            } catch (uploadError) {
                console.error('Error uploading organizer photo:', uploadError);
                return NextResponse.json(
                    { error: 'Failed to upload organizer photo' },
                    { status: 500 }
                );
            }
        }

        const updateData: any = {
            name,
            affiliation,
            role,
        };

        if (photoUrl !== undefined) {
            updateData.photoUrl = photoUrl;
        }

        const organizer = await db.organizer.update({
            where: { id: params.id },
            data: updateData
        });

        return NextResponse.json(organizer);
    } catch (error) {
        console.error('Error updating organizer:', error);
        return NextResponse.json(
            { error: 'Failed to update organizer' },
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

        await db.organizer.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting organizer:', error);
        return NextResponse.json(
            { error: 'Failed to delete organizer' },
            { status: 500 }
        );
    }
}