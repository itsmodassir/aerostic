'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
                const res = await fetch('/api/v1/auth/me', {
                    credentials: 'include', // 🔑 cookie-based auth
                    cache: 'no-store',
                    headers: {
                        'Pragma': 'no-cache',
                    },
                });

                if (!res.ok) {
                    setUser(null);
                    setLoading(false);
                    // Determine redirect based on subdomain
                    if (window.location.hostname.startsWith('admin.')) {
                        router.push('/admin/login');
                    } else {
                        router.push('/login');
                    }
                    return;
                }

                const data = await res.json();
                console.log('[useAuth] Fetched user:', data);
                setUser(data);
            } catch (err) {
                console.error('Auth check failed', err);
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
            await fetch('/api/v1/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
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
