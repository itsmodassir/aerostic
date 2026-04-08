import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function resolveBaseDomain(hostname: string, configuredBaseDomain?: string | null) {
    const host = hostname.split(':')[0].toLowerCase();
    const configured = configuredBaseDomain?.trim().toLowerCase();

    if (configured && (host === configured || host.endsWith(`.${configured}`))) {
        return configured;
    }

    const parts = host.split('.');
    if (parts.length >= 2) {
        return parts.slice(-2).join('.');
    }

    return configured || 'aimstore.in';
}

export function proxy(request: NextRequest) {
    const hostname = (request.headers.get('host') || '').split(':')[0].toLowerCase();
    const { pathname, search } = request.nextUrl;
    const baseDomain = resolveBaseDomain(hostname, process.env.NEXT_PUBLIC_BASE_DOMAIN);
    const configuredAppHost = process.env.NEXT_PUBLIC_APP_HOST?.trim().toLowerCase();
    const configuredAdminHost = process.env.NEXT_PUBLIC_ADMIN_HOST?.trim().toLowerCase();
    const appHost =
        configuredAppHost && configuredAppHost.endsWith(baseDomain)
            ? configuredAppHost
            : `app.${baseDomain}`;
    const adminHost =
        configuredAdminHost && configuredAdminHost.endsWith(baseDomain)
            ? configuredAdminHost
            : `admin.${baseDomain}`;
    
    // Resolve preferred tenant from cookies, fallback to 'default'
    const tenantCookie = request.cookies.get('selected_tenant')?.value;
    const activeTenant = tenantCookie || 'default';

    const appPathAliases: Record<string, string> = {
        '/contacts': '/contacts',
        '/inbox': '/inbox',
        '/message': '/inbox',
        '/messages': '/inbox',
        '/campaigns': '/campaigns',
        '/templates': '/templates',
        '/wallet': `/dashboard/${activeTenant}/wallet`,
        '/leads': `/dashboard/${activeTenant}/leads`,
        '/analytics': '/analytics',
        '/automation': '/automation',
        '/automations': '/automations',
        '/ai-agents': '/ai-agents',
        '/ai-agent': '/ai-agents',
        '/agents': '/ai-agents',
        '/scheduler': `/dashboard/${activeTenant}/scheduler`,
        '/referrals': '/referrals',
        '/knowledge-base': '/knowledge-base',
        '/settings/whatsapp': '/settings/whatsapp',
        '/settings/whatsapp/forms': '/settings/whatsapp/forms',
        '/settings/whatsapp/trigger-flow': '/settings/whatsapp/trigger-flow',
        '/settings/whatsapp/flows': '/settings/whatsapp/flows',
        '/trigger-flow': '/settings/whatsapp/trigger-flow',
        '/settings/ai': '/settings/ai',
        '/settings/email': '/settings/email',
        '/settings': '/settings',
        '/billing': '/billing',
        '/profile': `/dashboard/${activeTenant}/profile`,
        '/reseller/clients': `/dashboard/${activeTenant}/reseller/clients`,
        '/reseller/branding': `/dashboard/${activeTenant}/reseller/branding`,
    };
    const appAliasPrefixes: Array<[string, string]> = [
        ['/campaigns/', '/campaigns/'],
        ['/settings/whatsapp/trigger-flow/', '/settings/whatsapp/trigger-flow/'],
        ['/settings/whatsapp/flows/', '/settings/whatsapp/flows/'],
        ['/settings/whatsapp/forms/', '/settings/whatsapp/forms/'],
    ];

    // 0. API Subdomain
    if (hostname.startsWith(`api.${baseDomain}`)) {
        if (!pathname.startsWith('/api')) {
            return NextResponse.rewrite(new URL(`/api${pathname}${search}`, request.url));
        }
        return NextResponse.next();
    }

    // 1. Admin Subdomain
    // [DEPRECATED] Admin logic has been migrated to the standalone 'admin-panel' project.
    // The admin subdomain is now an independent application and should be handled by its own server.
    if (hostname.startsWith(`admin.${baseDomain}`)) {
        return NextResponse.next();
    }

    // 2. App Subdomain (Main Dashboard / Landing for logged in users)
    console.log(`[Proxy] Request: ${hostname}${pathname} | Base: ${baseDomain}`);
    if (hostname === appHost || hostname.startsWith('app.')) {
        // If visiting root on app subdomain, resolve workspace via /dashboard route.
        if (pathname === '/') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        const exactAlias = appPathAliases[pathname];
        if (exactAlias) {
            if (exactAlias === pathname) {
                return NextResponse.next();
            }
            return NextResponse.rewrite(new URL(`${exactAlias}${search}`, request.url));
        }

        for (const [sourcePrefix, targetPrefix] of appAliasPrefixes) {
            if (pathname.startsWith(sourcePrefix)) {
                const suffix = pathname.slice(sourcePrefix.length);
                const targetPath = `${targetPrefix}${suffix}`;
                if (targetPath === pathname) {
                    return NextResponse.next();
                }
                return NextResponse.rewrite(new URL(`${targetPath}${search}`, request.url));
            }
        }

        return NextResponse.next();
    }

    // 3. Marketing Domain (Root)
    if (hostname === baseDomain || hostname === `www.${baseDomain}`) {
        // Redirect explicit admin logic to admin subdomain
        if (pathname.startsWith('/admin')) {
            const strippedPath = pathname.replace('/admin', '') || '/';
            return NextResponse.redirect(new URL(`https://${adminHost}${strippedPath}${search}`, request.url));
        }
        // Redirect user app logic to app subdomain
        if (
            pathname.startsWith('/dashboard') ||
            pathname === '/login' ||
            pathname === '/register' ||
            pathname in appPathAliases ||
            appAliasPrefixes.some(([prefix]) => pathname.startsWith(prefix))
        ) {
            return NextResponse.redirect(new URL(`https://${appHost}${pathname}${search}`, request.url));
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
    const appSubdomain = appHost.endsWith(`.${baseDomain}`) ? appHost.replace(`.${baseDomain}`, '') : null;
    const adminSubdomain = adminHost.endsWith(`.${baseDomain}`) ? adminHost.replace(`.${baseDomain}`, '') : null;
    const reservedSubdomains = ['www', 'app', 'admin', 'api', 'frontend', 'webhook', 'worker'];
    if (appSubdomain) reservedSubdomains.push(appSubdomain);
    if (adminSubdomain) reservedSubdomains.push(adminSubdomain);

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
