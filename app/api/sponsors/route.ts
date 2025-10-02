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

        const sponsors = await db.sponsor.findMany({
            where: { yearId },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(sponsors);
    } catch (error) {
        console.error('Error fetching sponsors:', error);
        return NextResponse.json(
            { error: 'Failed to fetch sponsors' },
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
        const website = formData.get('website') as string;
        const type = formData.get('type') as 'GOLD' | 'SILVER' | 'COMMUNITY' | 'COMMUNITY_EXHIBITOR';
        const yearId = formData.get('yearId') as string;
        const file = formData.get('logo') as File;

        if (!name || !type || !yearId) {
            return NextResponse.json(
                { error: 'Name, type, and year ID are required' },
                { status: 400 }
            );
        }

        let logoUrl = '';

        // Handle file upload if provided
        if (file && file.size > 0) {
            try {
                logoUrl = await uploadToS3(file, 'sponsors');
            } catch (uploadError) {
                console.error('Error uploading sponsor logo:', uploadError);
                return NextResponse.json(
                    { error: 'Failed to upload sponsor logo' },
                    { status: 500 }
                );
            }
        }

        const sponsor = await db.sponsor.create({
            data: {
                name,
                website: website || null,
                type,
                logoUrl: logoUrl || null,
                yearId
            }
        });

        return NextResponse.json(sponsor);
    } catch (error) {
        console.error('Error creating sponsor:', error);
        return NextResponse.json(
            { error: 'Failed to create sponsor' },
            { status: 500 }
        );
    }
}