'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';

import { SocketProvider } from '@/context/SocketContext';
import { DashboardProvider, useDashboard } from '@/components/dashboard/DashboardContext';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import {
    ensureWorkspaceContext,
    getCachedMembership,
    loadMembership,
    loadSubscription,
} from '@/lib/dashboard-bootstrap';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SocketProvider>
            <DashboardProvider>
                <DashboardShell>{children}</DashboardShell>
            </DashboardProvider>
        </SocketProvider>
    );
}

function DashboardShell({ children }: { children: React.ReactNode }) {
    const { user, loading, logout, isAdmin } = useAuth();
    const { setMembership, membership, isSidebarCollapsed } = useDashboard();
    const router = useRouter();
    const pathname = usePathname();
    const [workspaceReady, setWorkspaceReady] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const syncWorkspaceContext = async () => {
            const match = pathname.match(/^\/dashboard\/([^/]+)/);
            const workspaceSlug = match?.[1];

            if (!workspaceSlug || !user) {
                if (!cancelled) setWorkspaceReady(true);
                return;
            }

            try {
                await ensureWorkspaceContext(workspaceSlug);
            } catch (error) {
                console.warn('[DashboardLayout] Failed to sync workspace context', error);
            } finally {
                if (!cancelled) setWorkspaceReady(true);
            }
        };

        setWorkspaceReady(false);
        void syncWorkspaceContext();

        return () => {
            cancelled = true;
        };
    }, [pathname, user]);

    // 1. Initial Data Fetch (Isolated & Cached)
    useEffect(() => {
        if (!user || !workspaceReady) return;

        const cachedMembership = getCachedMembership();
        if (cachedMembership) {
            setMembership(cachedMembership);
        }

        const fetchData = async () => {
            try {
                const membershipPromise = loadMembership().catch(() => null);
                const subscriptionPromise = isAdmin ? Promise.resolve(null) : loadSubscription().catch((error: any) => error);

                const [resolvedMembership, resolvedSubscription] = await Promise.all([
                    membershipPromise,
                    subscriptionPromise,
                ]);

                if (resolvedMembership) {
                    setMembership(resolvedMembership);
                }

                if (!isAdmin) {
                    if (resolvedSubscription instanceof Error) {
                        const status = (resolvedSubscription as any)?.response?.status;
                        if (status === 401 || status === 404) {
                            router.push('/onboarding');
                        }
                        return;
                    }

                    const validStatuses = ['trial', 'active'];
                    if (!resolvedSubscription || !validStatuses.includes(resolvedSubscription.status)) {
                        router.push('/onboarding');
                    }
                }
            } catch (error) {
                console.error('Failed to fetch dashboard initialization data:', error);
            }
        };

        fetchData();
    }, [user, isAdmin, router, setMembership, workspaceReady]);

    // 2. Memoized Branding Styles
    const brandingStyles = useMemo(() => {
        const primary = membership?.branding?.primaryColor || '#7C3AED';
        return {
            '--primary': primary,
            '--primary-hover': `${primary}CC`,
            '--primary-foreground': '#ffffff'
        } as React.CSSProperties;
    }, [membership]);

    if (loading || !workspaceReady) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="flex h-screen bg-muted/40 font-sans" style={brandingStyles}>
            <Sidebar user={user} isAdmin={isAdmin} />

            <div className={clsx(
                "flex flex-col w-full min-h-screen transition-all duration-300",
                isSidebarCollapsed ? "sm:pl-20" : "sm:pl-64"
            )}>
                <Header user={user} isAdmin={isAdmin} logout={logout} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
