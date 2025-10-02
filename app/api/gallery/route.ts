import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const yearId = searchParams.get('yearId');
        const category = searchParams.get('category');

        const where: any = {};
        if (yearId) where.yearId = yearId;
        if (category) where.category = category;

        const images = await db.galleryImage.findMany({
            where,
            include: {
                year: true,
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(images);
    } catch (error) {
        console.error('Error fetching gallery images:', error);
        return NextResponse.json(
            { error: 'Failed to fetch gallery images' },
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

        const { imageUrl, caption, category, yearId } = await request.json();

        if (!imageUrl || !yearId) {
            return NextResponse.json(
                { error: 'Image URL and year ID are required' },
                { status: 400 }
            );
        }

        // Validate that the year exists
        const yearExists = await db.year.findUnique({
            where: { id: yearId }
        });

        if (!yearExists) {
            return NextResponse.json(
                { error: 'Invalid year ID' },
                { status: 400 }
            );
        }

        // Create the gallery image
        const image = await db.galleryImage.create({
            data: {
                imageUrl,
                caption: caption || null,
                category: category || null,
                yearId,
            },
            include: {
                year: true,
            },
        });

        return NextResponse.json(image, { status: 201 });
    } catch (error) {
        console.error('Error creating gallery image:', error);
        return NextResponse.json(
            { error: 'Failed to create gallery image' },
            { status: 500 }
        );
    }
}