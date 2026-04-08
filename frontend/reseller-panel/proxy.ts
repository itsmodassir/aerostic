import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { resolveBaseDomain } from './lib/host';

export function proxy(request: NextRequest) {
    const hostname = (request.headers.get('host') || '').split(':')[0].toLowerCase();
    const { pathname } = request.nextUrl;

    // 1. Force Auth Guard
    const token = request.cookies.get('access_token');
    const isPublicPath = pathname === '/login' || pathname.startsWith('/_next') || pathname.includes('.');

    if (token && pathname === '/login') {
        return NextResponse.redirect(new URL('/', request.url));
    }

    if (!token && !isPublicPath) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 2. Identify Tenant context from subdomain
    // If hostname is jake.aimstore.in, the tenant is 'jake'
    const baseDomain = resolveBaseDomain(hostname, process.env.NEXT_PUBLIC_BASE_DOMAIN);
    const subdomain = hostname.endsWith(`.${baseDomain}`)
        ? hostname.replace(`.${baseDomain}`, '')
        : '';

    // If it's a reseller subdomain (not 'app' or 'admin'), 
    // we should ensure the user has access to this specific reseller context.
    // For now, we'll just pass it through as a header for the API to consume.
    const response = NextResponse.next();
    if (subdomain && subdomain !== 'app' && subdomain !== 'admin') {
        response.headers.set('x-reseller-context', subdomain);
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
