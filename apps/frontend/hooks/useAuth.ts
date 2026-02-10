'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
    id: string;
    email: string;
    name: string;
    globalRole: 'super_admin' | 'user';
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const loadUser = async () => {
            try {
                const res = await fetch('/api/auth/me', {
                    credentials: 'include', // 🔑 cookie-based auth
                });

                if (!res.ok) {
                    setUser(null);
                    setLoading(false);
                    return;
                }

                const data = await res.json();
                setUser(data);
            } catch (err) {
                console.error('Auth check failed', err);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
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
        isSuperAdmin: user?.globalRole === 'super_admin',
        isAuthenticated: !!user,
    };
}
