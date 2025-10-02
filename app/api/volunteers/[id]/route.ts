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
        const role = formData.get('role') as string;
        const file = formData.get('photo') as File;
        const removePhoto = formData.get('removePhoto') === 'true';

        if (!name || !role) {
            return NextResponse.json(
                { error: 'Name and role are required' },
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
                photoUrl = await uploadToS3(file, 'volunteers');
            } catch (uploadError) {
                console.error('Error uploading volunteer photo:', uploadError);
                return NextResponse.json(
                    { error: 'Failed to upload volunteer photo' },
                    { status: 500 }
                );
            }
        }

        const updateData: any = {
            name,
            role,
        };

        if (photoUrl !== undefined) {
            updateData.photoUrl = photoUrl;
        }

        const volunteer = await db.volunteer.update({
            where: { id: params.id },
            data: updateData
        });

        return NextResponse.json(volunteer);
    } catch (error) {
        console.error('Error updating volunteer:', error);
        return NextResponse.json(
            { error: 'Failed to update volunteer' },
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

        await db.volunteer.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting volunteer:', error);
        return NextResponse.json(
            { error: 'Failed to delete volunteer' },
            { status: 500 }
        );
    }
}