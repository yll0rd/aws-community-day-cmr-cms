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

        const settings = await db.generalSetting.findUnique({
            where: { yearId }
        });

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
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

        const formData = await request.formData();

        // Extract fields
        const rsvpLink = formData.get('rsvpLink') as string;
        const rsvpDeadline = formData.get('rsvpDeadline') as string;
        const eventDate = formData.get('eventDate') as string;
        const maxAttendees = formData.get('maxAttendees') as string;
        const volunteerLink = formData.get('volunteerLink') as string;
        const sponsorLink = formData.get('sponsorLink') as string;
        const speakerLink = formData.get('speakerLink') as string;
        const yearId = formData.get('yearId') as string;

        if (!yearId) {
            return NextResponse.json(
                { error: 'Year ID is required' },
                { status: 400 }
            );
        }

        const settings = await db.generalSetting.create({
            data: {
                rsvpLink: rsvpLink || null,
                rsvpDeadline: rsvpDeadline ? new Date(rsvpDeadline) : null,
                eventDate: eventDate ? new Date(eventDate) : null,
                maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
                volunteerLink: volunteerLink || null,
                sponsorLink: sponsorLink || null,
                speakerLink: speakerLink || null,
                yearId
            }
        });

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error creating settings:', error);
        return NextResponse.json(
            { error: 'Failed to create settings' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.success) {
            return NextResponse.json(
                { error: authResult.error },
                { status: 401 }
            );
        }

        const formData = await request.formData();

        // Extract fields
        const rsvpLink = formData.get('rsvpLink') as string;
        const rsvpDeadline = formData.get('rsvpDeadline') as string;
        const eventDate = formData.get('eventDate') as string;
        const maxAttendees = formData.get('maxAttendees') as string;
        const volunteerLink = formData.get('volunteerLink') as string;
        const sponsorLink = formData.get('sponsorLink') as string;
        const speakerLink = formData.get('speakerLink') as string;
        const yearId = formData.get('yearId') as string;

        if (!yearId) {
            return NextResponse.json(
                { error: 'Year ID is required' },
                { status: 400 }
            );
        }

        const settings = await db.generalSetting.upsert({
            where: { yearId },
            update: {
                rsvpLink: rsvpLink || null,
                rsvpDeadline: rsvpDeadline ? new Date(rsvpDeadline) : null,
                eventDate: eventDate ? new Date(eventDate) : null,
                maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
                volunteerLink: volunteerLink || null,
                sponsorLink: sponsorLink || null,
                speakerLink: speakerLink || null,
            },
            create: {
                rsvpLink: rsvpLink || null,
                rsvpDeadline: rsvpDeadline ? new Date(rsvpDeadline) : null,
                eventDate: eventDate ? new Date(eventDate) : null,
                maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
                volunteerLink: volunteerLink || null,
                sponsorLink: sponsorLink || null,
                speakerLink: speakerLink || null,
                yearId
            }
        });

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json(
            { error: 'Failed to update settings' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.success) {
            return NextResponse.json(
                { error: authResult.error },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const yearId = searchParams.get('yearId');

        if (!yearId) {
            return NextResponse.json(
                { error: 'Year ID is required' },
                { status: 400 }
            );
        }

        await db.generalSetting.delete({
            where: { yearId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting settings:', error);
        return NextResponse.json(
            { error: 'Failed to delete settings' },
            { status: 500 }
        );
    }
}