import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const hostname = request.headers.get('host') || '';
    const { pathname, search } = request.nextUrl;
    const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'aerostic.com';

    // 1. Admin Subdomain
    if (hostname.startsWith(`admin.${baseDomain}`)) {
        if (pathname === '/login') {
            return NextResponse.rewrite(new URL('/admin/login', request.url));
        }
        if (pathname === '/') {
            return NextResponse.redirect(new URL('/admin', request.url));
        }
        return NextResponse.next();
    }

    // 2. App Subdomain (Main Dashboard / Landing for logged in users)
    if (hostname.startsWith(`app.${baseDomain}`)) {
        // If visiting root on app subdomain, redirect to a default dashboard or login
        if (pathname === '/') {
            return NextResponse.redirect(new URL('/dashboard/default', request.url));
        }
        return NextResponse.next();
    }

    // 3. Marketing Domain (Root)
    if (hostname === baseDomain || hostname === `www.${baseDomain}`) {
        // Redirect explicit dashboard/admin access attempts to correct subdomains
        if (pathname.startsWith('/admin')) {
            return NextResponse.redirect(new URL(`https://admin.${baseDomain}${pathname}${search}`, request.url));
        }
        if (pathname.startsWith('/dashboard')) {
            return NextResponse.redirect(new URL(`https://app.${baseDomain}/dashboard/default`, request.url));
        }
        if (pathname === '/login' || pathname === '/register') {
            return NextResponse.redirect(new URL(`https://app.${baseDomain}${pathname}`, request.url));
        }
        return NextResponse.next();
    }

    // 4. Tenant Subdomains (Wildcard)
    // e.g. tenant.aerostic.com
    const isLocal = hostname.includes('localhost');
    const tenantSubdomain = hostname.replace(`.${baseDomain}`, '');
    const reservedSubdomains = ['www', 'app', 'admin', 'api'];

    if (!reservedSubdomains.includes(tenantSubdomain) && !isLocal) {
        // Rewrite all requests to /dashboard/[slug]/[path]
        // This makes "tenant.aerostic.com/settings" -> "/dashboard/tenant/settings"

        // Prevent double-rewriting if internal routing is already happening
        if (!pathname.startsWith('/dashboard')) {
            return NextResponse.rewrite(new URL(`/dashboard/${tenantSubdomain}${pathname}${search}`, request.url));
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
