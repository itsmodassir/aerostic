'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export interface User {
    id: string;
    email: string;
    name: string;
    role: 'super_admin' | 'admin' | 'user';
    permissions?: string[];
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const loadUser = async () => {
            try {
                const res = await api.get('/auth/me');
                console.log('[useAuth] Fetched user:', res.data);
                setUser(res.data);
            } catch (err: any) {
                console.error('[useAuth] Auth check failed:', err.message || err);
                setUser(null);
                if (window.location.hostname.startsWith('admin.')) {
                    router.push('/admin/login');
                } else {
                    router.push('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, [router]);

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (e) {
            console.error('Logout failed', e);
        }

        setUser(null);
        if (window.location.hostname.startsWith('admin.')) {
            router.push('/admin/login');
        } else {
            router.push('/login');
        }
    };

    return {
        user,
        loading,
        logout,
        isSuperAdmin: user?.role === 'super_admin',
        isAdmin: user?.role === 'super_admin' || user?.role === 'admin',
        isAuthenticated: !!user,
    };
}
