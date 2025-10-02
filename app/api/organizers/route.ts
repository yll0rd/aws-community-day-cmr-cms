import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { uploadToS3 } from '@/lib/s3';

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

        const organizers = await db.organizer.findMany({
            where: { yearId },
            orderBy: [
                { role: 'asc' },
                { createdAt: 'desc' }
            ]
        });

        return NextResponse.json(organizers);
    } catch (error) {
        console.error('Error fetching organizers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch organizers' },
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

        // Extract text fields
        const name = formData.get('name') as string;
        const affiliation = formData.get('affiliation') as string;
        const role = formData.get('role') as string;
        const yearId = formData.get('yearId') as string;
        const file = formData.get('photo') as File;

        if (!name || !affiliation || !role || !yearId) {
            return NextResponse.json(
                { error: 'Name, affiliation, role, and year ID are required' },
                { status: 400 }
            );
        }

        let photoUrl = '';

        // Handle file upload if provided
        if (file && file.size > 0) {
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

        const organizer = await db.organizer.create({
            data: {
                name,
                affiliation,
                role,
                photoUrl: photoUrl || null,
                yearId
            }
        });

        return NextResponse.json(organizer);
    } catch (error) {
        console.error('Error creating organizer:', error);
        return NextResponse.json(
            { error: 'Failed to create organizer' },
            { status: 500 }
        );
    }
}