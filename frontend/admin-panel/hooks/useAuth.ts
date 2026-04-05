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
                const userData = res.data;
                
                // Strict Admin Validation
                const isAdmin = userData.role === 'super_admin' || userData.role === 'admin';
                if (!isAdmin) {
                    console.error('[AdminAuth] Unauthorized access attempt by:', userData.email);
                    setUser(null);
                    router.push('https://aimstore.in/login');
                    return;
                }

                setUser(userData);
            } catch (err: any) {
                console.error('[AdminAuth] Auth check failed:', err.message || err);
                setUser(null);
                if (!window.location.pathname.startsWith('/login')) {
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
        router.push('/login');
    };

    return {
        user,
        loading,
        logout,
        isSuperAdmin: user?.role === 'super_admin',
        isAdmin: true, // If authorized, must be admin
        isAuthenticated: !!user,
    };
}
