import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { uploadToS3 } from '@/lib/s3';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.success) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Only admins can access user details
        if (authResult?.user?.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        const user = await db.user.findUnique({
            where: { id: params.id },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.success) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Only admins can update users
        if (authResult?.user?.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        const formData = await request.formData();

        // Extract fields
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const role = formData.get('role') as 'ADMIN' | 'EDITOR';
        const file = formData.get('avatar') as File;
        const removeAvatar = formData.get('removeAvatar') === 'true';

        if (!name || !email || !role) {
            return NextResponse.json(
                { error: 'Name, email, and role are required' },
                { status: 400 }
            );
        }

        // Check if user exists
        const existingUser = await db.user.findUnique({
            where: { id: params.id }
        });

        if (!existingUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Check if email is already taken by another user
        const emailUser = await db.user.findUnique({
            where: { email }
        });

        if (emailUser && emailUser.id !== params.id) {
            return NextResponse.json(
                { error: 'Email already taken by another user' },
                { status: 400 }
            );
        }

        let avatarUrl: string | null | undefined = undefined;

        // Handle avatar removal
        if (removeAvatar) {
            avatarUrl = null;
        }
        // Handle new avatar upload
        else if (file && file.size > 0) {
            try {
                avatarUrl = await uploadToS3(file, 'avatars');
            } catch (uploadError) {
                console.error('Error uploading avatar:', uploadError);
                return NextResponse.json(
                    { error: 'Failed to upload avatar' },
                    { status: 500 }
                );
            }
        }

        const updateData: any = {
            name,
            email,
            role
        };

        if (avatarUrl !== undefined) {
            updateData.avatar = avatarUrl;
        }

        // Update password if provided
        if (password) {
            updateData.password = await bcrypt.hash(password, 12);
        }

        const user = await db.user.update({
            where: { id: params.id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.success) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Only admins can delete users
        if (authResult?.user?.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        // Prevent self-deletion
        if (authResult.user?.id === params.id) {
            return NextResponse.json(
                { error: 'Cannot delete your own account' },
                { status: 400 }
            );
        }

        const user = await db.user.findUnique({
            where: { id: params.id }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        await db.user.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json(
            { error: 'Failed to delete user' },
            { status: 500 }
        );
    }
}