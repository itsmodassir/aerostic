import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const hostname = request.headers.get('host') || '';
    const { pathname, search } = request.nextUrl;
    const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'aimstore.in';

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
    // e.g. tenant.aimstore.in
    const isLocal = hostname.includes('localhost') || hostname.includes('127.0.0.1');

    // Safety: only process subdomains of the base domain
    if (!hostname.endsWith(baseDomain) && !isLocal) {
        return NextResponse.next();
    }

    const tenantSubdomain = hostname.replace(`.${baseDomain}`, '').split(':')[0]; // Remove port if present
    const reservedSubdomains = ['www', 'app', 'admin', 'api', 'frontend', 'webhook', 'worker'];

    if (tenantSubdomain && !reservedSubdomains.includes(tenantSubdomain) && !isLocal) {
        // Exclude authentication and system paths from wildcard rewrite
        const excludedPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/auth', '/api', '/_next', '/favicon.ico'];
        if (excludedPaths.some(path => pathname.startsWith(path))) {
            return NextResponse.next();
        }

        // 1. Root landing page: tenant.aimstore.in/ -> /landing/[tenant]
        if (pathname === '/') {
            return NextResponse.rewrite(new URL(`/landing/${tenantSubdomain}${search}`, request.url));
        }

        // 2. Client Dashboard: tenant.aimstore.in/user/dashboard -> /dashboard/[tenant]/user
        if (pathname.startsWith('/user/dashboard')) {
            const clientPath = pathname.replace('/user/dashboard', '') || '/';
            return NextResponse.rewrite(new URL(`/dashboard/${tenantSubdomain}/user${clientPath}${search}`, request.url));
        }

        // 3. Partner Console: tenant.aimstore.in/dashboard -> /dashboard/[tenant]
        if (pathname.startsWith('/dashboard')) {
            const partnerPath = pathname.replace('/dashboard', '') || '/';
            return NextResponse.rewrite(new URL(`/dashboard/${tenantSubdomain}${partnerPath}${search}`, request.url));
        }

        // Default fallback (compatibility)
        const rewriteUrl = new URL(`/dashboard/${tenantSubdomain}${pathname}${search}`, request.url);
        return NextResponse.rewrite(rewriteUrl);
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
