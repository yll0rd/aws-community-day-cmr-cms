// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Public routes that don't require authentication
    const publicRoutes = ['/', '/login'];

    // Auth-related API routes that are always public
    const authApiRoutes = ['/api/auth/login', '/api/auth/me'];

    // Check if it's a public page or auth API route
    if (publicRoutes.includes(pathname) || authApiRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Allow public access to ALL GET requests (read operations)
    if (pathname.startsWith('/api/') && request.method === 'GET') {
        return NextResponse.next();
    }

    // Check for authentication token (for non-GET API requests and protected pages)
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
        if (pathname.startsWith('/api/')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|public).*)',
    ],
};