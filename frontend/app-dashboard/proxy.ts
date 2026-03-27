import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function toCanonicalAppPath(pathname: string): string | null {
    const match = pathname.match(/^\/dashboard\/[^/]+(?:\/(.*))?$/);
    if (!match) return null;

    const rest = match[1];
    if (!rest) return null;

    const normalized = rest.replace(/^\/+/, '');

    if (normalized === 'inbox') return '/message';
    if (normalized === 'agents') return '/ai-agent';
    if (normalized === 'knowledge') return '/knowledge-base';
    if (normalized === 'billing') return '/billing';
    if (normalized === 'profile') return '/profile';

    return `/${normalized}`;
}

export function proxy(request: NextRequest) {
    const hostname = request.headers.get('host') || '';
    const { pathname, search } = request.nextUrl;
    const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'aimstore.in';
    
    // Resolve preferred tenant from cookies, fallback to 'default'
    const tenantCookie = request.cookies.get('selected_tenant')?.value;
    const activeTenant = tenantCookie || 'default';

    const appPathAliases: Record<string, string> = {
        '/contacts': `/dashboard/${activeTenant}/contacts`,
        '/message': `/dashboard/${activeTenant}/inbox`,
        '/messages': `/dashboard/${activeTenant}/inbox`,
        '/campaigns': `/dashboard/${activeTenant}/campaigns`,
        '/templates': `/dashboard/${activeTenant}/templates`,
        '/wallet': `/dashboard/${activeTenant}/wallet`,
        '/leads': `/dashboard/${activeTenant}/leads`,
        '/analytics': `/dashboard/${activeTenant}/analytics`,
        '/automation': `/dashboard/${activeTenant}/automation`,
        '/ai-agent': `/dashboard/${activeTenant}/agents`,
        '/agents': `/dashboard/${activeTenant}/agents`,
        '/scheduler': `/dashboard/${activeTenant}/scheduler`,
        '/referrals': `/dashboard/${activeTenant}/referrals`,
        '/knowledge-base': `/dashboard/${activeTenant}/knowledge`,
        '/settings/whatsapp': `/dashboard/${activeTenant}/settings/whatsapp`,
        '/settings/whatsapp/forms': `/dashboard/${activeTenant}/settings/whatsapp/forms`,
        '/settings/whatsapp/trigger-flow': `/dashboard/${activeTenant}/settings/whatsapp/trigger-flow`,
        '/settings/whatsapp/flows': `/dashboard/${activeTenant}/settings/whatsapp/flows`,
        '/trigger-flow': `/dashboard/${activeTenant}/settings/whatsapp/trigger-flow`,
        '/settings/ai': `/dashboard/${activeTenant}/settings/ai`,
        '/settings/email': `/dashboard/${activeTenant}/settings/email`,
        '/settings': `/dashboard/${activeTenant}/settings/whatsapp`,
        '/billing': `/dashboard/${activeTenant}/billing`,
        '/profile': `/dashboard/${activeTenant}/profile`,
        '/reseller/clients': `/dashboard/${activeTenant}/reseller/clients`,
        '/reseller/branding': `/dashboard/${activeTenant}/reseller/branding`,
    };
    const appAliasPrefixes: Array<[string, string]> = [
        ['/automation/', `/dashboard/${activeTenant}/automation/`],
        ['/ai-agent/', `/dashboard/${activeTenant}/agents/`],
        ['/campaigns/', `/dashboard/${activeTenant}/campaigns/`],
        ['/settings/whatsapp/trigger-flow/', `/dashboard/${activeTenant}/settings/whatsapp/trigger-flow/`],
        ['/settings/whatsapp/flows/', `/dashboard/${activeTenant}/settings/whatsapp/flows/`],
        ['/settings/whatsapp/forms/', `/dashboard/${activeTenant}/settings/whatsapp/forms/`],
    ];

    // 0. API Subdomain
    if (hostname.startsWith(`api.${baseDomain}`)) {
        if (!pathname.startsWith('/api')) {
            return NextResponse.rewrite(new URL(`/api${pathname}${search}`, request.url));
        }
        return NextResponse.next();
    }

    // 1. Admin Subdomain
    if (hostname.startsWith(`admin.${baseDomain}`)) {
        if (!pathname.startsWith('/admin')) {
            return NextResponse.rewrite(new URL(`/admin${pathname === '/' ? '' : pathname}${search}`, request.url));
        }
        return NextResponse.next();
    }

    // 2. App Subdomain (Main Dashboard / Landing for logged in users)
    console.log(`[Proxy] Request: ${hostname}${pathname} | Base: ${baseDomain}`);
    if (hostname.startsWith('app.')) {
        const canonicalPath = toCanonicalAppPath(pathname);
        if (canonicalPath && canonicalPath !== pathname) {
            return NextResponse.redirect(new URL(`${canonicalPath}${search}`, request.url));
        }

        // If visiting root on app subdomain, resolve workspace via /dashboard route.
        if (pathname === '/') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        const exactAlias = appPathAliases[pathname];
        if (exactAlias) {
            return NextResponse.rewrite(new URL(`${exactAlias}${search}`, request.url));
        }

        for (const [sourcePrefix, targetPrefix] of appAliasPrefixes) {
            if (pathname.startsWith(sourcePrefix)) {
                const suffix = pathname.slice(sourcePrefix.length);
                return NextResponse.rewrite(new URL(`${targetPrefix}${suffix}${search}`, request.url));
            }
        }

        return NextResponse.next();
    }

    // 3. Marketing Domain (Root)
    if (hostname === baseDomain || hostname === `www.${baseDomain}`) {
        // Redirect explicit admin logic to admin subdomain
        if (pathname.startsWith('/admin')) {
            const strippedPath = pathname.replace('/admin', '') || '/';
            return NextResponse.redirect(new URL(`https://admin.${baseDomain}${strippedPath}${search}`, request.url));
        }
        // Redirect user app logic to app subdomain
        if (
            pathname.startsWith('/dashboard') ||
            pathname === '/login' ||
            pathname === '/register' ||
            pathname in appPathAliases ||
            appAliasPrefixes.some(([prefix]) => pathname.startsWith(prefix))
        ) {
            return NextResponse.redirect(new URL(`https://app.${baseDomain}${pathname}${search}`, request.url));
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
