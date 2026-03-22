'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value?: string | null): value is string {
    return !!value && UUID_V4_REGEX.test(value);
}

type AuthMeResponse = {
    tenantId?: string | null;
    tenantSlug?: string | null;
};

type WorkspaceMembership = {
    tenant?: {
        id?: string;
        slug?: string;
    };
};

export default function DashboardResolverClient() {
    const router = useRouter();

    useEffect(() => {
        const resolveWorkspace = async () => {
            try {
                let preferredTenantId: string | null = null;
                let preferredTenantSlug: string | null = null;

                const meRes = await fetch('/api/v1/auth/me', {
                    credentials: 'include',
                    cache: 'no-store',
                });

                if (meRes.ok) {
                    const me = (await meRes.json()) as AuthMeResponse;
                    if (isUuid(me?.tenantId)) {
                        preferredTenantId = me.tenantId;
                        localStorage.setItem('x-tenant-id', me.tenantId);
                    }
                    if (me?.tenantSlug) {
                        preferredTenantSlug = me.tenantSlug;
                    }
                }

                if (preferredTenantSlug) {
                    router.replace(`/dashboard/${preferredTenantSlug}`);
                    return;
                }

                const res = await fetch('/api/v1/auth/workspaces', {
                    credentials: 'include',
                    cache: 'no-store',
                });

                if (!res.ok) {
                    router.replace('/login');
                    return;
                }

                const workspaces = (await res.json()) as WorkspaceMembership[];
                const preferredWorkspace =
                    workspaces?.find((w) => w?.tenant?.id === preferredTenantId) ||
                    workspaces?.find((w) => !!w?.tenant?.slug) ||
                    workspaces?.[0];

                const slug = preferredWorkspace?.tenant?.slug;
                const id = preferredWorkspace?.tenant?.id;

                if (isUuid(id)) {
                    localStorage.setItem('x-tenant-id', id);
                }

                if (slug || id) {
                    router.replace(`/dashboard/${slug || id}`);
                    return;
                }

                router.replace('/workspaces/new');
            } catch (_error) {
                router.replace('/login');
            }
        };

        resolveWorkspace();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-gray-600 text-sm">Opening your dashboard...</p>
            </div>
        </div>
    );
}
