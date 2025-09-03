import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthUser {
    userId: string;
    email: string;
    role: string;
}

export async function verifyAuth(request: NextRequest): Promise<{
    success: boolean;
    user?: AuthUser;
    error?: string;
}> {
    try {
        const token = request.cookies.get('auth-token')?.value;

        if (!token) {
            return { success: false, error: 'No token provided' };
        }

        const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;

        // Verify user still exists
        const user = await db.user.findUnique({
            where: { id: decoded.userId }
        });

        if (!user) {
            return { success: false, error: 'User not found' };
        }

        return { success: true, user: decoded };
    } catch (error) {
        console.error('Auth verification error:', error);
        return { success: false, error: 'Invalid token' };
    }
}

export function requireAdmin(user: AuthUser): boolean {
    return user.role === 'ADMIN';
}