import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const hostname = request.headers.get('host') || '';
    const { pathname } = request.nextUrl;

    // Define domains
    // In local dev, we might use localhost:3000, so we need to handle that.
    // Production: admin.aerostic.com
    const isAdminSubdomain = hostname.startsWith('admin.');

    // 1. If accessing via admin subdomain
    if (isAdminSubdomain) {
        // If they visit root '/', rewrite to '/admin' (the dashboard)
        if (pathname === '/') {
            return NextResponse.rewrite(new URL('/admin', request.url));
        }

        // Allow access to /admin routes and static assets
        // If they are strictly on admin subdomain, we might want to prevent access to non-admin pages?
        // For now, let's just ensure /admin/login serves correctly.
        return NextResponse.next();
    }

    // 2. If accessing via main domain (app.aerostic.com or aerostic.com)
    // Redirect any /admin request to admin.aerostic.com
    if (pathname.startsWith('/admin')) {
        const adminHost = hostname.replace(/^(app\.|www\.)?/, 'admin.');
        // If we are on localhost, this replacement might be tricky.
        // Let's assume prod for the redirect logic, or handle localhost explicitly.

        if (hostname.includes('localhost')) {
            // Development mode: skip redirecting to admin.localhost for simplicity unless configured
            return NextResponse.next();
        }

        const url = new URL(request.url);
        url.hostname = 'admin.aerostic.com'; // Enforce production admin domain
        url.protocol = 'https'; // Enforce HTTPS
        url.port = ''; // Remove internal port (e.g. 3000)
        url.pathname = pathname; // Keep the path
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg).*)',
    ],
};
