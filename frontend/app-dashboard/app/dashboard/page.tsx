import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DashboardResolverPage() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
        redirect('/login');
    }

    // Server-side workspace resolution
    try {
        const apiUrl = process.env.NEXT_PUBLIC_INTERNAL_API_URL || 'http://localhost:3001';
        
        // 1. Get User Profile
        const meRes = await fetch(`${apiUrl}/api/v1/auth/me`, {
            headers: { 'Cookie': `access_token=${accessToken}` },
        });

        let preferredSlug = null;
        if (meRes.ok) {
            const me = await meRes.json();
            preferredSlug = me.tenantSlug;
        }

        if (preferredSlug) {
            return redirect(`/dashboard/${preferredSlug}`);
        }

        // 2. Get Workspaces if no preferred slug
        const wsRes = await fetch(`${apiUrl}/api/v1/auth/workspaces`, {
            headers: { 'Cookie': `access_token=${accessToken}` },
        });

        if (wsRes.ok) {
            const workspaces = await wsRes.json();
            const slug = workspaces?.[0]?.tenant?.slug || workspaces?.[0]?.slug;
            if (slug) {
                return redirect(`/dashboard/${slug}`);
            }
        }

        redirect('/workspaces/new');
    } catch (error) {
        console.error('[DashboardResolver] Server-side resolution failed:', error);
        // Fallback to client-side resolver if server fetch fails (e.g. during local dev without internal API access)
        // But in production this should work.
        redirect('/login');
    }
}
