// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Public routes that don't require authentication
    const publicRoutes = ['/', '/login'];

    // API routes that don't require authentication
    const publicApiRoutes = ['/api/auth/login', '/api/auth/me'];

    // Check if the route is public
    if (publicRoutes.includes(pathname) || publicApiRoutes.includes(pathname)) {
        return NextResponse.next();
    }

    // Check for authentication token (just check if it exists)
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
        // Redirect to login for protected routes
        if (pathname.startsWith('/api/')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Token exists, let the request continue
    // The actual token verification will happen in the API routes
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|public).*)',
    ],
};