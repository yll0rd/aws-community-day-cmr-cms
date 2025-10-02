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

        const speakers = await db.speaker.findMany({
            where: { yearId },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(speakers);
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

        const formData = await request.formData();

        // Extract text fields
        const name = formData.get('name') as string;
        const title = formData.get('title') as string;
        const bio = formData.get('bio') as string;
        const keyNote = formData.get('keyNote') as string;
        const yearId = formData.get('yearId') as string;
        const file = formData.get('photo') as File;

        if (!name || !yearId) {
            return NextResponse.json(
                { error: 'Name and year ID are required' },
                { status: 400 }
            );
        }

        let photoUrl = '';

        // Handle file upload if provided
        if (file && file.size > 0) {
            try {
                photoUrl = await uploadToS3(file, 'speakers');
            } catch (uploadError) {
                console.error('Error uploading speaker photo:', uploadError);
                return NextResponse.json(
                    { error: 'Failed to upload speaker photo' },
                    { status: 500 }
                );
            }
        }

        const speaker = await db.speaker.create({
            data: {
                name,
                title: title || null,
                bio: bio || null,
                photoUrl: photoUrl || null,
                keyNote: keyNote || null,
                yearId
            }
        });

        return NextResponse.json(speaker);
    } catch (error) {
        console.error('Error creating speaker:', error);
        return NextResponse.json(
            { error: 'Failed to create speaker' },
            { status: 500 }
        );
    }
}