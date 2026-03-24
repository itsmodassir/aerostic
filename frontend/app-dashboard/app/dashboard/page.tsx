import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DashboardResolverPage() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
        redirect('/login');
    }

    let redirectTo = '/workspaces/new';

    // Server-side workspace resolution
    try {
        // Use BACKEND_URL (as in next.config.ts) or fallback to internal/localhost
        const apiUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_INTERNAL_API_URL || 'http://localhost:3001';
        
        console.log(`[DashboardResolver] Resolving workspace via ${apiUrl}/api/v1/auth/me`);

        // 1. Get User Profile
        const meRes = await fetch(`${apiUrl}/api/v1/auth/me`, {
            headers: { 'Cookie': `access_token=${accessToken}` },
            cache: 'no-store',
        });

        let preferredSlug = null;
        if (meRes.ok) {
            const me = await meRes.json();
            preferredSlug = me.tenantSlug;
        } else {
            console.warn(`[DashboardResolver] /auth/me failed with status ${meRes.status}`);
        }

        if (preferredSlug) {
            console.log(`[DashboardResolver] Redirecting to preferred workspace: ${preferredSlug}`);
            redirectTo = `/dashboard/${preferredSlug}`;
            return;
        }

        // 2. Get Workspaces if no preferred slug
        const wsRes = await fetch(`${apiUrl}/api/v1/auth/workspaces`, {
            headers: { 'Cookie': `access_token=${accessToken}` },
            cache: 'no-store',
        });

        if (wsRes.ok) {
            const workspaces = await wsRes.json();
            const slug = workspaces?.[0]?.tenant?.slug || workspaces?.[0]?.slug;
            if (slug) {
                console.log(`[DashboardResolver] Redirecting to first available workspace: ${slug}`);
                redirectTo = `/dashboard/${slug}`;
                return;
            }
        } else {
            console.warn(`[DashboardResolver] /auth/workspaces failed with status ${wsRes.status}`);
        }

        console.log('[DashboardResolver] No workspaces found, redirecting to new workspace setup');
    } catch (error: any) {
        console.error('[DashboardResolver] Server-side resolution CRITICAL FAILURE:', error.message || error);
        // Fallback to login if all resolution attempts fail
        redirectTo = '/login';
    }

    redirect(redirectTo);
}
