import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const hostname = request.headers.get('host') || '';
    const { pathname } = request.nextUrl;

    // Define domains
    // In local dev, we might use localhost:3000, so we need to handle that.
    // Production: admin.aerostic.com
    const isAdminSubdomain = hostname.startsWith('admin.');
    const isAppSubdomain = hostname.startsWith('app.');
    const marketingRoutes = ['/pricing', '/features', '/about', '/contact', '/support', '/privacy', '/terms', '/refund', '/careers', '/docs'];

    // 1. Admin Subdomain (admin.aerostic.com)
    if (isAdminSubdomain) {
        // Redirect marketing routes to main domain
        if (marketingRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
            return NextResponse.redirect(`https://aerostic.com${pathname}`);
        }
        // Redirect user routes to app subdomain
        if (pathname.startsWith('/dashboard') || pathname === '/register') {
            return NextResponse.redirect(`https://app.aerostic.com${pathname}`);
        }

        // Special case: /login on admin subdomain should follow the rewrite
        if (pathname === '/login') {
            return NextResponse.rewrite(new URL('/admin/login', request.url));
        }

        // Rewrite root to admin folder
        if (pathname === '/') {
            return NextResponse.rewrite(new URL('/admin', request.url));
        }

        return NextResponse.next();
    }

    // 2. App Subdomain (app.aerostic.com)
    if (isAppSubdomain) {
        // Redirect marketing routes to main domain
        if (marketingRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
            return NextResponse.redirect(`https://aerostic.com${pathname}`);
        }
        // Redirect admin routes to admin subdomain
        if (pathname.startsWith('/admin')) {
            return NextResponse.redirect(`https://admin.aerostic.com${pathname}`);
        }

        // If they visit root '/' on app subdomain, send to dashboard
        if (pathname === '/') {
            return NextResponse.rewrite(new URL('/dashboard', request.url));
        }

        return NextResponse.next();
    }

    // 3. Main Domain (aerostic.com)
    // In production, we want to ensure everything else redirects TO their respective subdomains
    if (!hostname.includes('localhost')) {
        if (pathname.startsWith('/admin')) {
            return NextResponse.redirect(`https://admin.aerostic.com${pathname}`);
        }
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/meta') || pathname === '/login' || pathname === '/register') {
            return NextResponse.redirect(`https://app.aerostic.com${pathname}`);
        }
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
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|.*\\.ico).*)',
    ],
};
