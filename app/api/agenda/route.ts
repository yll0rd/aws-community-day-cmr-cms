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

    const agendaItems = await db.agenda.findMany({
      where: { yearId },
      include: {
        speaker: true
      },
      orderBy: { startTime: 'asc' }
    });

    return NextResponse.json({ agendaItems });
  } catch (error) {
    console.error('Error fetching agenda:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agenda' },
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

    const { title, description, startTime, endTime, speakerId, yearId } = await request.json();

    if (!title || !startTime || !endTime || !speakerId || !yearId) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    const agendaItem = await db.agenda.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        speakerId,
        yearId
      },
      include: {
        speaker: true
      }
    });

    return NextResponse.json({ agendaItem });
  } catch (error) {
    console.error('Error creating agenda item:', error);
    return NextResponse.json(
      { error: 'Failed to create agenda item' },
      { status: 500 }
    );
  }
}