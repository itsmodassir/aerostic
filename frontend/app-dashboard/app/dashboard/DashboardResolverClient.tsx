'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardResolverClient() {
    const router = useRouter();

    useEffect(() => {
        const resolveWorkspace = async () => {
            try {
                const res = await fetch('/api/v1/auth/workspaces', {
                    credentials: 'include',
                    cache: 'no-store',
                });

                if (!res.ok) {
                    router.replace('/login');
                    return;
                }

                const workspaces = await res.json();
                const firstWorkspace =
                    workspaces?.find((w: any) => w?.tenant?.slug)?.tenant?.slug ||
                    workspaces?.[0]?.tenant?.id;

                if (firstWorkspace) {
                    router.replace(`/dashboard/${firstWorkspace}`);
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
