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

        const contactInfo = await db.contactInfo.findUnique({
            where: { yearId }
        });

        return NextResponse.json(contactInfo);
    } catch (error) {
        console.error('Error fetching contact info:', error);
        return NextResponse.json(
            { error: 'Failed to fetch contact info' },
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
        const email = formData.get('email') as string;
        const phone = formData.get('phone') as string;
        const address = formData.get('address') as string;
        const twitterLink = formData.get('twitterLink') as string;
        const facebookLink = formData.get('facebookLink') as string;
        const instagramLink = formData.get('instagramLink') as string;
        const linkedinLink = formData.get('linkedinLink') as string;
        const yearId = formData.get('yearId') as string;

        if (!email || !yearId) {
            return NextResponse.json(
                { error: 'Email and year ID are required' },
                { status: 400 }
            );
        }

        const contactInfo = await db.contactInfo.create({
            data: {
                email,
                phone: phone || null,
                address: address || null,
                twitterLink: twitterLink || null,
                facebookLink: facebookLink || null,
                instagramLink: instagramLink || null,
                linkedinLink: linkedinLink || null,
                yearId
            }
        });

        return NextResponse.json(contactInfo);
    } catch (error) {
        console.error('Error creating contact info:', error);
        return NextResponse.json(
            { error: 'Failed to create contact info' },
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
        const email = formData.get('email') as string;
        const phone = formData.get('phone') as string;
        const address = formData.get('address') as string;
        const twitterLink = formData.get('twitterLink') as string;
        const facebookLink = formData.get('facebookLink') as string;
        const instagramLink = formData.get('instagramLink') as string;
        const linkedinLink = formData.get('linkedinLink') as string;
        const yearId = formData.get('yearId') as string;

        if (!email || !yearId) {
            return NextResponse.json(
                { error: 'Email and year ID are required' },
                { status: 400 }
            );
        }

        const contactInfo = await db.contactInfo.upsert({
            where: { yearId },
            update: {
                email,
                phone: phone || null,
                address: address || null,
                twitterLink: twitterLink || null,
                facebookLink: facebookLink || null,
                instagramLink: instagramLink || null,
                linkedinLink: linkedinLink || null,
            },
            create: {
                email,
                phone: phone || null,
                address: address || null,
                twitterLink: twitterLink || null,
                facebookLink: facebookLink || null,
                instagramLink: instagramLink || null,
                linkedinLink: linkedinLink || null,
                yearId
            }
        });

        return NextResponse.json(contactInfo);
    } catch (error) {
        console.error('Error updating contact info:', error);
        return NextResponse.json(
            { error: 'Failed to update contact info' },
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

        await db.contactInfo.delete({
            where: { yearId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting contact info:', error);
        return NextResponse.json(
            { error: 'Failed to delete contact info' },
            { status: 500 }
        );
    }
}