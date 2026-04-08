'use client';

import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { clsx } from 'clsx';

import { SocketProvider } from '@/context/SocketContext';
import { DashboardProvider, useDashboard } from '@/components/dashboard/DashboardContext';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { useAuth } from '@/hooks/useAuth';
import { getCachedMembership, loadMembership, loadSubscription } from '@/lib/dashboard-bootstrap';

export default function AuthenticatedAppShell({ children }: { children: React.ReactNode }) {
  return (
    <SocketProvider>
      <DashboardProvider>
        <AuthenticatedShell>{children}</AuthenticatedShell>
      </DashboardProvider>
    </SocketProvider>
  );
}

function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, isAdmin } = useAuth();
  const { setMembership, membership, isSidebarCollapsed } = useDashboard();
  const router = useRouter();

  useEffect(() => {
    const cachedMembership = getCachedMembership();
    if (cachedMembership) {
      setMembership(cachedMembership);
    }
  }, [setMembership]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const fetchData = async () => {
      try {
        const membershipPromise = loadMembership().catch(() => null);
        const subscriptionPromise = isAdmin ? Promise.resolve(null) : loadSubscription().catch((error: any) => error);

        const [resolvedMembership, resolvedSubscription] = await Promise.all([
          membershipPromise,
          subscriptionPromise,
        ]);

        if (!cancelled && resolvedMembership) {
          setMembership(resolvedMembership);
        }

        if (isAdmin || cancelled) {
          return;
        }

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
      } catch (error) {
        console.error('[AuthenticatedAppShell] Failed to bootstrap app shell', error);
      }
    };

    void fetchData();

    return () => {
      cancelled = true;
    };
  }, [user, isAdmin, router, setMembership]);

  const brandingStyles = useMemo(() => {
    const primary = membership?.branding?.primaryColor || '#7C3AED';
    return {
      '--primary': primary,
      '--primary-hover': `${primary}CC`,
      '--primary-foreground': '#ffffff',
    } as React.CSSProperties;
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
      <div
        className={clsx(
          'flex flex-col w-full min-h-screen transition-all duration-300',
          isSidebarCollapsed ? 'sm:pl-20' : 'sm:pl-64',
        )}
      >
        <Header user={user} isAdmin={isAdmin} logout={logout} />
        <main className="flex-1 p-4 md:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
