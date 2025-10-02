import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

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

        const { imageUrl, caption, category, yearId } = await request.json();

        if (!imageUrl || !yearId) {
            return NextResponse.json(
                { error: 'Image URL and year ID are required' },
                { status: 400 }
            );
        }

        // Validate that the year exists
        const yearExists = await db.year.findUnique({
            where: { id: yearId }
        });

        if (!yearExists) {
            return NextResponse.json(
                { error: 'Invalid year ID' },
                { status: 400 }
            );
        }

        const image = await db.galleryImage.update({
            where: { id: params.id },
            data: {
                imageUrl,
                caption,
                category,
                yearId,
            },
            include: {
                year: true,
            },
        });

        return NextResponse.json(image);
    } catch (error) {
        console.error('Error updating gallery image:', error);
        return NextResponse.json(
            { error: 'Failed to update gallery image' },
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

        await db.galleryImage.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Error deleting gallery image:', error);
        return NextResponse.json(
            { error: 'Failed to delete gallery image' },
            { status: 500 }
        );
    }
}