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

        const venue = await db.venue.findUnique({
            where: { yearId }
        });

        return NextResponse.json(venue);
    } catch (error) {
        console.error('Error fetching venue:', error);
        return NextResponse.json(
            { error: 'Failed to fetch venue' },
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
        const address = formData.get('address') as string;
        const city = formData.get('city') as string;
        const region = formData.get('region') as string;
        const description = formData.get('description') as string;
        const latitude = parseFloat(formData.get('latitude') as string);
        const longitude = parseFloat(formData.get('longitude') as string);
        const mapUrl = formData.get('mapUrl') as string;
        const capacity = formData.get('capacity') ? parseInt(formData.get('capacity') as string) : null;
        const website = formData.get('website') as string;
        const contactInfo = formData.get('contactInfo') as string;
        const yearId = formData.get('yearId') as string;

        // Handle multiple image files
        const imageFiles = formData.getAll('images') as File[];
        const uploadedImages: string[] = [];

        if (!name || !city || !region || !yearId) {
            return NextResponse.json(
                { error: 'Name, city, region, and year ID are required' },
                { status: 400 }
            );
        }

        // Upload images to S3
        for (const file of imageFiles) {
            if (file.size > 0) {
                try {
                    const imageUrl = await uploadToS3(file, 'venue');
                    uploadedImages.push(imageUrl);
                } catch (uploadError) {
                    console.error('Error uploading venue image:', uploadError);
                    return NextResponse.json(
                        { error: 'Failed to upload venue images' },
                        { status: 500 }
                    );
                }
            }
        }

        const venue = await db.venue.create({
            data: {
                name,
                address: address || null,
                city,
                region,
                description: description || null,
                latitude,
                longitude,
                mapUrl: mapUrl || null,
                capacity,
                website: website || null,
                contactInfo: contactInfo || null,
                images: uploadedImages,
                yearId
            }
        });

        return NextResponse.json(venue);
    } catch (error) {
        console.error('Error creating venue:', error);
        return NextResponse.json(
            { error: 'Failed to create venue' },
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

        // Extract text fields
        const name = formData.get('name') as string;
        const address = formData.get('address') as string;
        const city = formData.get('city') as string;
        const region = formData.get('region') as string;
        const description = formData.get('description') as string;
        const latitude = parseFloat(formData.get('latitude') as string);
        const longitude = parseFloat(formData.get('longitude') as string);
        const mapUrl = formData.get('mapUrl') as string;
        const capacity = formData.get('capacity') ? parseInt(formData.get('capacity') as string) : null;
        const website = formData.get('website') as string;
        const contactInfo = formData.get('contactInfo') as string;
        const yearId = formData.get('yearId') as string;

        // Handle image updates
        const imageFiles = formData.getAll('images') as File[];
        const uploadedImages: string[] = [];
        const existingImages = formData.get('existingImages') as string;
        const imagesToKeep = existingImages ? JSON.parse(existingImages) as string[] : [];

        if (!name || !city || !region || !yearId) {
            return NextResponse.json(
                { error: 'Name, city, region, and year ID are required' },
                { status: 400 }
            );
        }

        // Upload new images to S3
        for (const file of imageFiles) {
            if (file.size > 0) {
                try {
                    const imageUrl = await uploadToS3(file, 'venue');
                    uploadedImages.push(imageUrl);
                } catch (uploadError) {
                    console.error('Error uploading venue image:', uploadError);
                    return NextResponse.json(
                        { error: 'Failed to upload venue images' },
                        { status: 500 }
                    );
                }
            }
        }

        // Combine existing and new images
        const allImages = [...imagesToKeep, ...uploadedImages];

        const venue = await db.venue.upsert({
            where: { yearId },
            update: {
                name,
                address: address || null,
                city,
                region,
                description: description || null,
                latitude,
                longitude,
                mapUrl: mapUrl || null,
                capacity,
                website: website || null,
                contactInfo: contactInfo || null,
                images: allImages,
            },
            create: {
                name,
                address: address || null,
                city,
                region,
                description: description || null,
                latitude,
                longitude,
                mapUrl: mapUrl || null,
                capacity,
                website: website || null,
                contactInfo: contactInfo || null,
                images: allImages,
                yearId
            }
        });

        return NextResponse.json(venue);
    } catch (error) {
        console.error('Error updating venue:', error);
        return NextResponse.json(
            { error: 'Failed to update venue' },
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

        await db.venue.delete({
            where: { yearId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting venue:', error);
        return NextResponse.json(
            { error: 'Failed to delete venue' },
            { status: 500 }
        );
    }
}