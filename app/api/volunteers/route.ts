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

        const volunteers = await db.volunteer.findMany({
            where: { yearId },
            orderBy: [
                { role: 'asc' },
                { createdAt: 'desc' }
            ]
        });

        return NextResponse.json(volunteers);
    } catch (error) {
        console.error('Error fetching volunteers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch volunteers' },
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
        const role = formData.get('role') as string;
        const yearId = formData.get('yearId') as string;
        const file = formData.get('photo') as File;

        if (!name || !role || !yearId) {
            return NextResponse.json(
                { error: 'Name, role, and year ID are required' },
                { status: 400 }
            );
        }

        let photoUrl = '';

        // Handle file upload if provided
        if (file && file.size > 0) {
            try {
                photoUrl = await uploadToS3(file, 'volunteers');
            } catch (uploadError) {
                console.error('Error uploading volunteer photo:', uploadError);
                return NextResponse.json(
                    { error: 'Failed to upload volunteer photo' },
                    { status: 500 }
                );
            }
        }

        const volunteer = await db.volunteer.create({
            data: {
                name,
                role,
                photoUrl: photoUrl || null,
                yearId
            }
        });

        return NextResponse.json(volunteer);
    } catch (error) {
        console.error('Error creating volunteer:', error);
        return NextResponse.json(
            { error: 'Failed to create volunteer' },
            { status: 500 }
        );
    }
}