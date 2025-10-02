import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const yearId = searchParams.get('yearId');

        if (!yearId) {
            return NextResponse.json({ error: 'Year ID is required' }, { status: 400 });
        }

        const agendaItems = await db.agenda.findMany({
            where: { yearId },
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
            orderBy: { startTime: 'asc' },
        });

        return NextResponse.json(agendaItems);
    } catch (error) {
        console.error('Error fetching agenda:', error);
        return NextResponse.json({ error: 'Failed to fetch agenda' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
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
            yearId,
            location,
            type,
            published
        } = await request.json();

        if (!titleEn || !startTime || !endTime || !speakerId || !yearId) {
            return NextResponse.json({ error: 'Required fields are missing' }, { status: 400 });
        }

        // Verify speaker exists
        const speaker = await db.speaker.findUnique({
            where: { id: speakerId }
        });

        if (!speaker) {
            return NextResponse.json({ error: 'Speaker not found' }, { status: 404 });
        }

        // Verify year exists
        const year = await db.year.findUnique({
            where: { id: yearId }
        });

        if (!year) {
            return NextResponse.json({ error: 'Year not found' }, { status: 404 });
        }

        const agendaItem = await db.agenda.create({
            data: {
                titleEn,
                titleFr: titleFr || titleEn,
                descriptionEn: descriptionEn || null,
                descriptionFr: descriptionFr || descriptionEn || null,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                speakerId,
                yearId,
                location: location || null,
                type: type || 'session',
                published: published || false
            },
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

        return NextResponse.json(agendaItem);
    } catch (error) {
        console.error('Error creating agenda item:', error);
        return NextResponse.json({ error: 'Failed to create agenda item' }, { status: 500 });
    }
}