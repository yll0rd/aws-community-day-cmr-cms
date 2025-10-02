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
        const website = formData.get('website') as string;
        const type = formData.get('type') as 'GOLD' | 'SILVER' | 'COMMUNITY' | 'COMMUNITY_EXHIBITOR';
        const file = formData.get('logo') as File;
        const removeLogo = formData.get('removeLogo') === 'true';

        if (!name || !type) {
            return NextResponse.json(
                { error: 'Name and type are required' },
                { status: 400 }
            );
        }

        let logoUrl: string | null | undefined = undefined;

        // Handle logo removal
        if (removeLogo) {
            logoUrl = null;
        }
        // Handle new file upload
        else if (file && file.size > 0) {
            try {
                logoUrl = await uploadToS3(file, 'sponsors');
            } catch (uploadError) {
                console.error('Error uploading sponsor logo:', uploadError);
                return NextResponse.json(
                    { error: 'Failed to upload sponsor logo' },
                    { status: 500 }
                );
            }
        }

        const updateData: any = {
            name,
            website: website || null,
            type,
        };

        if (logoUrl !== undefined) {
            updateData.logoUrl = logoUrl;
        }

        const sponsor = await db.sponsor.update({
            where: { id: params.id },
            data: updateData
        });

        return NextResponse.json(sponsor);
    } catch (error) {
        console.error('Error updating sponsor:', error);
        return NextResponse.json(
            { error: 'Failed to update sponsor' },
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

        await db.sponsor.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting sponsor:', error);
        return NextResponse.json(
            { error: 'Failed to delete sponsor' },
            { status: 500 }
        );
    }
}