'use client';

import React from 'react';
import { SocketProvider } from '@/context/SocketContext';
import { DashboardProvider, useDashboard } from '@/components/dashboard/DashboardContext';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import api from '@/lib/api';
import { clsx } from 'clsx';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <SocketProvider>
            <DashboardProvider>
                <AppShell>{children}</AppShell>
            </DashboardProvider>
        </SocketProvider>
    );
}

function AppShell({ children }: { children: React.ReactNode }) {
    const { user, loading, logout, isAdmin } = useAuth();
    const { setMembership, membership, isSidebarCollapsed } = useDashboard();
    const router = useRouter();

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            try {
                const memResponse = await api.get('/auth/membership');
                if (memResponse.status === 200) setMembership(memResponse.data);
                if (!isAdmin) {
                    try {
                        const subResponse = await api.get('/billing/subscription');
                        const valid = ['trial', 'active'];
                        if (!subResponse.data || !valid.includes(subResponse.data.status)) router.push('/onboarding');
                    } catch (err: any) {
                        if (err.response?.status === 401 || err.response?.status === 404) router.push('/onboarding');
                    }
                }
            } catch {}
        };
        fetchData();
    }, [user, isAdmin, router, setMembership]);

    const brandingStyles = useMemo(() => {
        const primary = membership?.branding?.primaryColor || '#7C3AED';
        return { '--primary': primary, '--primary-hover': `${primary}CC`, '--primary-foreground': '#ffffff' } as React.CSSProperties;
    }, [membership]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="flex h-screen bg-muted/40 font-sans" style={brandingStyles}>
            <Sidebar user={user} isAdmin={isAdmin} />
            <div className={clsx(
                'flex flex-col w-full min-h-screen transition-all duration-300',
                isSidebarCollapsed ? 'sm:pl-20' : 'sm:pl-64'
            )}>
                <Header user={user} isAdmin={isAdmin} logout={logout} />
                <main className="flex-1 p-4 md:p-8 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
