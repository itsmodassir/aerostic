'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: string[];
    redirectTo?: string;
}

export default function RoleGuard({
    children,
    allowedRoles,
    redirectTo = '/dashboard'
}: RoleGuardProps) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!user || !allowedRoles.includes(user.role))) {
            router.push(redirectTo);
        }
    }, [user, loading, allowedRoles, router, redirectTo]);

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user || !allowedRoles.includes(user.role)) {
        return null; // or a customized unauthorized UI
    }

    return <>{children}</>;
}
