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

    const images = await db.galleryImage.findMany({
      where: { yearId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ images });
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

    const image = await db.galleryImage.create({
      data: {
        imageUrl,
        caption,
        category,
        yearId
      }
    });

    return NextResponse.json({ image });
  } catch (error) {
    console.error('Error creating gallery image:', error);
    return NextResponse.json(
      { error: 'Failed to create gallery image' },
      { status: 500 }
    );
  }
}