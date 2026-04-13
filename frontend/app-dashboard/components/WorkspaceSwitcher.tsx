'use client';

import React, { useState, useEffect, useRef, memo, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronDown, Plus, Check, Building2, LogOut, Crown } from 'lucide-react';
import { clsx } from 'clsx';
import Link from 'next/link';
import { persistWorkspaceMemberships, setActiveWorkspaceContext } from '@/lib/workspace-context';
import { loadWorkspaces } from '@/lib/dashboard-bootstrap';

interface Workspace {
    id: string;
    name: string;
    slug: string;
    role: 'owner' | 'admin' | 'agent' | 'viewer';
}

export const WorkspaceSwitcher = memo(function WorkspaceSwitcher({ isCollapsed }: { isCollapsed?: boolean }) {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const params = useParams();
    
    const currentWorkspaceId = useMemo(() => {
        const raw = params?.workspaceId;
        return Array.isArray(raw) ? raw[0] : raw;
    }, [params?.workspaceId]);

    useEffect(() => {
        const fetchWorkspaces = async () => {
            try {
                const data = await loadWorkspaces();
                persistWorkspaceMemberships(data);
                const flatWorkspaces = (Array.isArray(data) ? data : []).map((w: any) => ({
                    id: w.tenant?.id || w.id,
                    name: w.tenant?.name || w.name,
                    slug: w.tenant?.slug || w.slug,
                    role: w.role
                }));
                setWorkspaces(flatWorkspaces);
            } catch (error) {
                console.error('Failed to fetch workspaces:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchWorkspaces();
    }, []);

    const activeWorkspace = useMemo(() => 
        workspaces.find(w => w.slug === currentWorkspaceId || w.id === currentWorkspaceId) || workspaces[0]
    , [workspaces, currentWorkspaceId]);

    const switchWorkspace = (workspace: Workspace) => {
        setActiveWorkspaceContext({ id: workspace.id, slug: workspace.slug });
        router.push(`/dashboard/${workspace.slug}`);
        setOpen(false);
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

    if (loading) return <div className="h-11 w-full animate-pulse rounded-2xl bg-muted" />;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setOpen(!open)}
                className={clsx(
                    "flex w-full items-center border bg-background text-sm font-medium shadow-sm transition-all hover:bg-muted",
                    isCollapsed ? "justify-center rounded-xl p-2 sm:rounded-lg" : "gap-3 rounded-2xl px-3 py-2.5 sm:rounded-lg sm:py-2"
                )}
            >
                <div className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs uppercase shrink-0">
                    {(activeWorkspace?.name || 'A')[0]}
                </div>
                {!isCollapsed && (
                    <>
                        <span className="truncate flex-1 text-left">
                            {activeWorkspace?.name || 'Select Workspace'}
                        </span>
                        <ChevronDown className={clsx("w-4 h-4 text-muted-foreground transition-transform", open && "rotate-180")} />
                    </>
                )}
            </button>

            {open && (
                <div className="absolute left-0 top-full z-50 mt-2 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-background py-2 shadow-xl animate-in fade-in zoom-in duration-200 sm:w-64 sm:rounded-xl">
                    <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Authorized Protocols
                    </div>
                    <div className="px-2 mb-2">
                        <Link 
                            href="/reseller"
                            className="flex items-center gap-3 w-full px-3 py-4 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all group"
                            onClick={() => setOpen(false)}
                        >
                            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white shrink-0 group-hover:rotate-12 transition-transform">
                                <Crown className="w-4 h-4" strokeWidth={3} />
                            </div>
                            <div className="flex-1 text-left overflow-hidden">
                                <p className="text-[10px] font-black uppercase tracking-widest leading-none">Partner Hub</p>
                                <p className="text-[9px] font-black text-white/50 uppercase tracking-[0.2em] mt-1 shrink-0 italic">Distributor Protocol_</p>
                            </div>
                        </Link>
                    </div>

                    <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-t">
                        Active Ecosystems
                    </div>

                    <div className="max-h-64 overflow-y-auto mt-1">
                        {workspaces.map((w) => (
                            <button
                                key={w.id}
                                onClick={() => switchWorkspace(w)}
                                className={clsx(
                                    "flex items-center gap-3 w-full px-3 py-3 text-sm hover:bg-muted transition-colors group",
                                    (w.id === currentWorkspaceId || w.slug === currentWorkspaceId) && "bg-indigo-50/50 font-medium"
                                )}
                            >
                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100 group-hover:bg-white group-hover:text-indigo-500 transition-all">
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <div className="flex-1 text-left overflow-hidden">
                                    <p className="truncate text-slate-900 font-bold lowercase italic">{w.name}</p>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{w.role}</p>
                                </div>
                                {(w.id === currentWorkspaceId || w.slug === currentWorkspaceId) && (
                                    <Check className="w-4 h-4 text-indigo-500" strokeWidth={3} />
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
                    </div>
                </div>
            )}
        </div>
    );
});
