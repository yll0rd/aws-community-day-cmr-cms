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

        const { name, title, bio, photoUrl, keyNote } = await request.json();

        const speaker = await db.speaker.update({
            where: { id: params.id },
            data: {
                name,
                title,
                bio,
                photoUrl,
                keyNote
            }
        });

        return NextResponse.json({ speaker });
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