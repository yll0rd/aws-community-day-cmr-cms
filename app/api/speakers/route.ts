import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const yearId = searchParams.get('yearId');

        if (!yearId) {
            return NextResponse.json(
                { error: 'Year ID is required' },
                { status: 400 }
            );
        }

        const speakers = await db.speaker.findMany({
            where: { yearId },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ speakers });
    } catch (error) {
        console.error('Error fetching speakers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch speakers' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.success) {
            return NextResponse.json(
                { error: authResult.error },
                { status: 401 }
            );
        }

        const { name, title, bio, photoUrl, keyNote, yearId } = await request.json();

        if (!name || !yearId) {
            return NextResponse.json(
                { error: 'Name and year ID are required' },
                { status: 400 }
            );
        }

        const speaker = await db.speaker.create({
            data: {
                name,
                title,
                bio,
                photoUrl,
                keyNote,
                yearId
            }
        });

        return NextResponse.json({ speaker });
    } catch (error) {
        console.error('Error creating speaker:', error);
        return NextResponse.json(
            { error: 'Failed to create speaker' },
            { status: 500 }
        );
    }
}