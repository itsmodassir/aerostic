'use client';

import './globals.css';
import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard, Users, CreditCard, DollarSign, BarChart3, Settings, Shield,
    FileText, Activity, Bell, Database, Globe, Key, Webhook,
    MessageSquare, AlertTriangle, Server, LogOut, Menu, X, 
    ArrowUpRight, ShieldCheck, Zap, Box, BrainCircuit, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading: authLoading, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [stats, setStats] = useState<any[]>([]);

    const fetchStats = async () => {
        if (pathname === '/login') return;
        try {
            const res = await api.get('/admin/platform/stats');
            setStats(res.data.stats || []);
        } catch (error) {
            console.error('Failed to sync admin metrics');
        }
    };

    useEffect(() => {
        if (user && pathname !== '/login') {
            fetchStats();
        }
    }, [user, pathname]);

    const navigation = useMemo(() => [
        { group: 'Overview', items: [
            { name: 'Dashboard', href: '/', icon: LayoutDashboard },
            { name: 'Pillars of Intel', href: '/pillars', icon: BrainCircuit },
            { name: 'Analytics', href: '/analytics', icon: BarChart3 },
            { name: 'System Health', href: '/health', icon: Activity },
        ]},
        { group: 'Operations', items: [
            { name: 'Tenants', href: '/tenants', icon: Users },
            { name: 'Resellers', href: '/resellers', icon: Globe },
            { name: 'Inbox', href: '/inbox', icon: MessageSquare },
        ]},
        { group: 'Monetization', items: [
            { name: 'Billing & Plans', href: '/billing', icon: DollarSign },
            { name: 'Pricing Tiers', href: '/billing/pricing', icon: CreditCard },
            { name: 'Wallets', href: '/wallets', icon: Zap },
        ]},
        { group: 'Technical', items: [
            { name: 'API Keys', href: '/api-keys', icon: Key },
            { name: 'Webhooks', href: '/webhooks', icon: Webhook },
            { name: 'System Logs', href: '/system-logs', icon: FileText },
            { name: 'Audit Logs', href: '/audit-logs', icon: Database },
        ]}
    ], []);

    if (pathname === '/login') return <>{children}</>;

    if (authLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 gap-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-2xl shadow-blue-500/20" />
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Authenticating Admin Access...</p>
            </div>
        );
    }

    if (!user) return null;

    const getStat = (label: string) => {
        return stats?.find((s: any) => s.label === label)?.value || '...';
    };

    return (
        <html lang="en">
            <body className="antialiased">
                <div className="min-h-screen bg-[#F8FAFC] flex relative overflow-x-hidden selection:bg-blue-600 selection:text-white">
                    <aside className={clsx(
                        "w-[280px] bg-[#0F172A] fixed h-full z-50 transition-all duration-500 lg:translate-x-0 border-r border-white/5",
                        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    )}>
                        <div className="p-8 pb-10">
                            <Link href="/" className="flex items-center gap-3 group">
                                <div className="w-10 h-10 bg-blue-600 rounded-[14px] flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                                     <ShieldCheck className="text-white" size={24} />
                                </div>
                                <div className="text-left">
                                     <h4 className="text-white font-black tracking-tight leading-none text-xl lowercase">aerostic<span className="text-blue-500">.</span></h4>
                                     <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mt-1.5">Admin Protocol v2.5</p>
                                </div>
                            </Link>
                        </div>

                        <nav className="px-5 space-y-8 h-[calc(100vh-320px)] overflow-y-auto no-scrollbar pb-10">
                            {navigation.map((group) => (
                                <div key={group.group} className="space-y-2">
                                     <p className="px-4 text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-3">{group.group}</p>
                                     {group.items.map((item) => {
                                         const isActive = pathname === item.href;
                                         return (
                                             <Link
                                                 key={item.name}
                                                 href={item.href}
                                                 className={clsx(
                                                     "flex items-center gap-3.5 px-4 py-3 rounded-[16px] transition-all group relative",
                                                     isActive 
                                                         ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20" 
                                                         : "text-white/40 hover:text-white hover:bg-white/5"
                                                 )}
                                             >
                                                 <item.icon size={18} className={clsx(isActive ? "text-white" : "text-white/20 group-hover:text-white/60 transition-colors")} />
                                                 <span className="text-sm font-bold tracking-tight">{item.name}</span>
                                             </Link>
                                         );
                                     })}
                                </div>
                            ))}
                        </nav>

                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0F172A] to-transparent">
                            <div className="bg-white/5 rounded-[24px] p-5 border border-white/5 backdrop-blur-xl">
                                <div className="flex items-center justify-between mb-4">
                                     <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Network Pulse</p>
                                     <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-left">
                                        <span className="text-[10px] font-bold text-white/30 lowercase">tenants.active</span>
                                        <span className="text-[11px] font-black text-blue-400 tabular-nums">{getStat('Active Tenants')}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-left">
                                        <span className="text-[10px] font-bold text-white/30 lowercase">load.cpu</span>
                                        <span className="text-[11px] font-black text-white tabular-nums">14%</span>
                                    </div>
                                </div>
                                <button onClick={logout} className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 text-[9px] font-black text-white/60 hover:text-white uppercase tracking-widest">
                                     <LogOut size={12} /> Exit Portal
                                </button>
                            </div>
                        </div>
                    </aside>

                    <main className="flex-1 lg:ml-[280px] min-w-0 w-full relative">
                        <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-10 flex items-center justify-between sticky top-0 z-40">
                            <div className="flex items-center gap-6">
                                <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 bg-slate-50 rounded-[14px] text-slate-900 border border-slate-100">
                                     <Menu size={20} />
                                </button>
                                <div className="text-left">
                                     <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none lowercase">Admin Console<span className="text-blue-600">_</span></h2>
                                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                         <BrainCircuit size={10} className="text-blue-500" /> Platform Orchestration Engine
                                     </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button className="w-12 h-12 bg-slate-50 hover:bg-slate-100 rounded-[14px] border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all relative">
                                     <Bell size={20} />
                                     <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                                </button>
                                <div className="h-10 w-px bg-slate-100 mx-2 hidden sm:block" />
                                <div className="flex items-center gap-3">
                                     <div className="text-right hidden sm:block">
                                         <p className="text-xs font-black text-slate-900 leading-none">{user?.name}</p>
                                         <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest mt-1">Platform Moderator</p>
                                     </div>
                                     <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[16px] flex items-center justify-center text-white font-black text-lg shadow-xl shadow-blue-100">
                                         {user?.name?.charAt(0)}
                                     </div>
                                </div>
                            </div>
                        </header>

                        <div className="p-10 transition-all duration-700">
                            {children}
                        </div>
                    </main>

                    <AnimatePresence>
                        {isSidebarOpen && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-md lg:hidden"
                                onClick={() => setIsSidebarOpen(false)}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </body>
        </html>
    );
}
