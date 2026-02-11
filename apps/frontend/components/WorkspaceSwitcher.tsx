'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronDown, Plus, Check, Building2, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import Link from 'next/link';

interface Workspace {
    id: string;
    name: string;
    slug: string;
    role: 'owner' | 'admin' | 'agent' | 'viewer';
}

export function WorkspaceSwitcher() {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const params = useParams();

    const currentWorkspaceId = params?.workspaceId as string;

    useEffect(() => {
        const fetchWorkspaces = async () => {
            try {
                // Ensure backend returns flat structure or map it here if needed
                const response = await fetch('/api/v1/auth/workspaces', {
                    credentials: 'include'
                });
                if (response.ok) {
                    const data = await response.json();
                    // Adapter if backend still returns nested tenant object
                    const flatWorkspaces = data.map((w: any) => ({
                        id: w.tenant?.id || w.id,
                        name: w.tenant?.name || w.name,
                        slug: w.tenant?.slug || w.slug,
                        role: w.role
                    }));
                    setWorkspaces(flatWorkspaces);
                }
            } catch (error) {
                console.error('Failed to fetch workspaces:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchWorkspaces();
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/api/v1/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
            router.push('/login');
        } catch (error) {
            console.error('Logout failed', error);
            router.push('/login');
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const activeWorkspace = workspaces.find(w => w.id === currentWorkspaceId) || workspaces[0];

    // 2. Optimized Switcher Logic
    const switchWorkspace = (id: string) => {
        router.push(`/dashboard/${id}`);
        setOpen(false);
    };

    if (loading) return <div className="h-10 w-48 bg-muted animate-pulse rounded-lg" />;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg border bg-background hover:bg-muted font-medium text-sm transition-all shadow-sm w-full max-w-[240px]"
            >
                <div className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs uppercase">
                    {(activeWorkspace?.name || 'A')[0]}
                </div>
                <span className="truncate flex-1 text-left">
                    {activeWorkspace?.name || 'Select Workspace'}
                </span>
                <ChevronDown className={clsx("w-4 h-4 text-muted-foreground transition-transform", open && "rotate-180")} />
            </button>

            {open && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-background rounded-xl shadow-xl border border-border z-50 py-2 overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Your Workspaces
                    </div>

                    <div className="max-h-64 overflow-y-auto mt-1">
                        {workspaces.map((w) => (
                            <button
                                key={w.id}
                                onClick={() => switchWorkspace(w.id)}
                                className={clsx(
                                    "flex items-center gap-3 w-full px-3 py-2 text-sm hover:bg-muted transition-colors",
                                    w.id === currentWorkspaceId && "bg-muted/50 font-medium"
                                )}
                            >
                                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-muted-foreground">
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <div className="flex-1 text-left overflow-hidden">
                                    <p className="truncate text-foreground">{w.name}</p>
                                    <p className="text-[10px] text-muted-foreground capitalize">{w.role}</p>
                                </div>
                                {w.id === currentWorkspaceId && (
                                    <Check className="w-4 h-4 text-primary" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="border-t border-border mt-2 pt-2 px-2">
                        <Link
                            href="/workspaces/new"
                            className="flex items-center gap-3 w-full px-3 py-2 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors font-medium mb-1"
                            onClick={() => setOpen(false)}
                        >
                            <Plus className="w-4 h-4" />
                            Create New Workspace
                        </Link>
                        <button
                            onClick={() => {
                                setOpen(false);
                                handleLogout();
                            }}
                            className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Log out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
