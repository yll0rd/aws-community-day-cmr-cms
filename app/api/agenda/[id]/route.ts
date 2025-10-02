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
            return NextResponse.json({ error: authResult.error }, { status: 401 });
        }

        const {
            titleEn,
            titleFr,
            descriptionEn,
            descriptionFr,
            startTime,
            endTime,
            speakerId,
            location,
            type,
            published
        } = await request.json();

        if (!params.id) {
            return NextResponse.json({ error: 'Agenda ID is required' }, { status: 400 });
        }

        // If speaker is being updated, verify it exists
        if (speakerId) {
            const speaker = await db.speaker.findUnique({
                where: { id: speakerId }
            });
            if (!speaker) {
                return NextResponse.json({ error: 'Speaker not found' }, { status: 404 });
            }
        }

        const updateData: any = {};
        if (titleEn !== undefined) updateData.titleEn = titleEn;
        if (titleFr !== undefined) updateData.titleFr = titleFr;
        if (descriptionEn !== undefined) updateData.descriptionEn = descriptionEn;
        if (descriptionFr !== undefined) updateData.descriptionFr = descriptionFr;
        if (startTime !== undefined) updateData.startTime = new Date(startTime);
        if (endTime !== undefined) updateData.endTime = new Date(endTime);
        if (speakerId !== undefined) updateData.speakerId = speakerId;
        if (location !== undefined) updateData.location = location;
        if (type !== undefined) updateData.type = type;
        if (published !== undefined) updateData.published = published;

        const updatedAgenda = await db.agenda.update({
            where: { id: params.id },
            data: updateData,
            include: {
                speaker: {
                    select: {
                        id: true,
                        name: true,
                        title: true,
                        photoUrl: true
                    }
                }
            },
        });

        return NextResponse.json(updatedAgenda);
    } catch (error) {
        console.error('Error updating agenda:', error);
        return NextResponse.json({ error: 'Failed to update agenda' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.success) {
            return NextResponse.json({ error: authResult.error }, { status: 401 });
        }

        if (!params.id) {
            return NextResponse.json({ error: 'Agenda ID is required' }, { status: 400 });
        }

        await db.agenda.delete({ where: { id: params.id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting agenda:', error);
        return NextResponse.json({ error: 'Failed to delete agenda' }, { status: 500 });
    }
}