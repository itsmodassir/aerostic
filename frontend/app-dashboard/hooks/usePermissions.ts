'use client';

import { useAuth } from './useAuth';
import { useState, useEffect } from 'react';

export function usePermissions() {
    const { user } = useAuth();
    const [permissions, setPermissions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPermissions = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch('/api/v1/auth/membership', {
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    setPermissions(data.permissions || []);
                }
            } catch (error) {
                console.error('Failed to fetch permissions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPermissions();
    }, [user]);

    const can = (permission: string) => {
        if (user?.role === 'super_admin') return true;
        return permissions.includes(permission);
    };

    const hasAny = (perms: string[]) => {
        if (user?.role === 'super_admin') return true;
        return perms.some(p => permissions.includes(p));
    };

    const hasAll = (perms: string[]) => {
        if (user?.role === 'super_admin') return true;
        return perms.every(p => permissions.includes(p));
    };

    return {
        permissions,
        loading,
        can,
        hasAny,
        hasAll
    };
}
