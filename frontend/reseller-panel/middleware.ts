import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const hostname = request.headers.get('host') || '';
    const { pathname, search } = request.nextUrl;

    // 1. Force Auth Guard
    const token = request.cookies.get('access_token');
    const isPublicPath = pathname === '/login' || pathname.startsWith('/_next') || pathname.includes('.');

    if (!token && !isPublicPath) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 2. Identify Tenant context from subdomain
    // If hostname is jake.aimstore.in, the tenant is 'jake'
    const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'aimstore.in';
    const subdomain = hostname.replace(`.${baseDomain}`, '').split(':')[0];

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
