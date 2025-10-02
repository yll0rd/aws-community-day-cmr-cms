import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET() {
    try {
        const years = await db.year.findMany({
            orderBy: { name: 'desc' }
        });

        return NextResponse.json(years);
    } catch (error) {
        console.error('Error fetching years:', error);
        return NextResponse.json(
            { error: 'Failed to fetch years' },
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

        const { name } = await request.json();

        if (!name) {
            return NextResponse.json(
                { error: 'Year name is required' },
                { status: 400 }
            );
        }

        const year = await db.year.create({
            data: { name }
        });

        return NextResponse.json(year, { status: 201 });
    } catch (error) {
        console.error('Error creating year:', error);
        return NextResponse.json(
            { error: 'Failed to create year' },
            { status: 500 }
        );
    }
}