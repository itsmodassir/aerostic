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
    tenantId?: string | null;
    tenantSlug?: string | null;
    tenantName?: string | null;
    tenantType?: string | null;
}

const USER_CACHE_KEY = 'user';
const USER_CACHE_META_KEY = 'user_meta';
const USER_CACHE_TTL_MS = 5 * 60 * 1000;

let userRequest: Promise<User | null> | null = null;

function readCachedUser(): User | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(USER_CACHE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function readUserFetchedAt(): number | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(USER_CACHE_META_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return typeof parsed?.fetchedAt === 'number' ? parsed.fetchedAt : null;
    } catch {
        return null;
    }
}

function isCachedUserFresh() {
    const fetchedAt = readUserFetchedAt();
    return !!fetchedAt && Date.now() - fetchedAt < USER_CACHE_TTL_MS;
}

function persistUser(user: User | null) {
    if (typeof window === 'undefined') return;

    if (!user) {
        localStorage.removeItem(USER_CACHE_KEY);
        localStorage.removeItem(USER_CACHE_META_KEY);
        return;
    }

    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
    localStorage.setItem(USER_CACHE_META_KEY, JSON.stringify({ fetchedAt: Date.now() }));
}

async function fetchCurrentUser(force = false): Promise<User | null> {
    if (!force && isCachedUserFresh()) {
        return readCachedUser();
    }

    if (!userRequest) {
        userRequest = api
            .get('/auth/me')
            .then((res) => {
                const nextUser = res.data;
                persistUser(nextUser);
                return nextUser;
            })
            .finally(() => {
                userRequest = null;
            });
    }

    return userRequest;
}

function getLoginPath() {
    if (typeof window !== 'undefined' && window.location.hostname.startsWith('admin.')) {
        return '/admin/login';
    }
    return '/login';
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(() => readCachedUser());
    const [loading, setLoading] = useState(() => !readCachedUser());
    const router = useRouter();

    useEffect(() => {
        const cachedUser = readCachedUser();
        if (cachedUser) {
            setUser(cachedUser);
            setLoading(false);
        }

        const loadUser = async () => {
            try {
                const nextUser = await fetchCurrentUser();
                if (!nextUser) {
                    setUser(null);
                    setLoading(false);
                    return;
                }
                setUser(nextUser);
            } catch (err: any) {
                console.error('[useAuth] Auth check failed:', err.message || err);
                const status = err?.response?.status;

                if (status === 401 || status === 403) {
                    setUser(null);
                    persistUser(null);

                    const hasCachedUser = !!cachedUser;
                    if (!hasCachedUser) {
                        router.replace(getLoginPath());
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
        persistUser(null);
        router.replace(getLoginPath());
    };

    return {
        user,
        loading,
        logout,
        isSuperAdmin: user?.role === 'super_admin',
        isAdmin: user?.role === 'super_admin' || user?.role === 'platform_admin' || user?.role === 'admin',
        isAuthenticated: !!user,
    };
}
