import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';

// Ensure we're using Node.js runtime for crypto operations
export const runtime = "nodejs";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Find user in database
        const user = await db.user.findUnique({
            where: { email }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Get the current event year (latest year by creation date)
        const currentYear = await db.year.findFirst({
            orderBy: {
                name: 'desc'
            }
        });

        // Generate JWT token with year information
        const tokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            currentYearId: currentYear?.id || null,
            currentYearName: currentYear?.name || null
        };

        const token = jwt.sign(
            tokenPayload,
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Return user data without password and include year details
        const { password: _password, ...userWithoutPassword } = user;
        void _password;

        const responseData = {
            user: userWithoutPassword,
            token,
            currentYear: currentYear ? {
                id: currentYear.id,
                name: currentYear.name,
                createdAt: currentYear.createdAt
            } : null
        };

        const response = NextResponse.json(responseData);

        // Set HTTP-only cookie
        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 // 7 days
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}