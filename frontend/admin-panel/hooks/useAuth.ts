'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export interface User {
    id: string;
    email: string;
    name: string;
    role: 'super_admin' | 'platform_admin' | 'reseller_admin' | 'tenant_admin' | 'agent' | 'admin' | 'user';
    permissions?: string[];
}

function isAdminRole(role?: string | null) {
    return role === 'super_admin' || role === 'platform_admin' || role === 'admin';
}

const USER_CACHE_KEY = 'user';

function readCachedUser(): User | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(USER_CACHE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(() => {
        const cached = readCachedUser();
        return cached && isAdminRole(cached.role) ? cached : null;
    });
    const [loading, setLoading] = useState(() => {
        const cached = readCachedUser();
        return !(cached && isAdminRole(cached.role));
    });
    const router = useRouter();

    useEffect(() => {
        const cachedUser = readCachedUser();
        if (cachedUser && isAdminRole(cachedUser.role)) {
            setUser(cachedUser);
        }

        const loadUser = async () => {
            try {
                const res = await api.get('/auth/me');
                const userData = res.data;
                
                // Strict Admin Validation
                if (!isAdminRole(userData?.role)) {
                    console.error('[AdminAuth] Unauthorized access attempt by:', userData.email);
                    setUser(null);
                    router.replace('/login');
                    return;
                }

                setUser(userData);
                if (typeof window !== 'undefined') {
                    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(userData));
                }
            } catch (err: any) {
                console.error('[AdminAuth] Auth check failed:', err.message || err);
                const status = err?.response?.status;
                if (status === 401 || status === 403) {
                    setUser(null);
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem(USER_CACHE_KEY);
                    }
                    if (!window.location.pathname.startsWith('/login')) {
                        router.replace('/login');
                    }
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
        if (typeof window !== 'undefined') {
            localStorage.removeItem(USER_CACHE_KEY);
        }
        router.replace('/login');
    };

    return {
        user,
        loading,
        logout,
        isSuperAdmin: user?.role === 'super_admin',
        isAdmin: !!user && isAdminRole(user.role),
        isAuthenticated: !!user,
    };
}
