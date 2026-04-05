'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
    Users, CreditCard, MessageSquare, TrendingUp, ArrowUpRight, ArrowDownRight,
    BarChart3, Activity, AlertTriangle, CheckCircle, Clock, Zap, Loader2,
    Shield, Globe, Key, Webhook, Box, Cloud, Cpu, Database, FileText,
    ArrowRight, Sparkles, Filter, MoreVertical, LayoutGrid, Timer, Settings
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import Link from 'next/link';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
    const [timeRange, setTimeRange] = useState('7d');
    const [stats, setStats] = useState<any[]>([]);
    const [trends, setTrends] = useState<any>(null);
    const [systemHealth, setSystemHealth] = useState<any[]>([]);
    const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
    const [topTenants, setTopTenants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, [timeRange]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, trendsRes] = await Promise.all([
                api.get(`/admin/platform/stats`),
                api.get(`/admin/platform/stats/trends?range=${timeRange}`)
            ]);

            const data = statsRes.data;
            const trendsData = trendsRes.data;

            const iconMap: Record<string, any> = {
                'Active Tenants': Users,
                'Total Resellers': Globe,
                'MRR': CreditCard,
                'Messages Today': MessageSquare,
                'AI Conversations': Zap,
                'Health Status': Activity
            };

            const mappedStats = data.stats.map((s: any) => ({
                ...s,
                icon: iconMap[s.label] || Box,
                color: s.label.includes('Tenants') ? 'blue' : 
                      s.label.includes('MRR') ? 'emerald' :
                      s.label.includes('Messages') ? 'indigo' :
                      s.label.includes('AI') ? 'purple' : 'slate'
            }));

            setStats(mappedStats);
            setSystemHealth(data.systemHealth || []);
            setRecentAlerts(data.recentAlerts || []);
            setTopTenants(data.topTenants || []);
            setTrends(trendsData);
        } catch (err: any) {
            setError(`Sync Failure: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[500px] gap-6 bg-slate-50/50 rounded-[48px] border-2 border-slate-100/50">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin shadow-2xl shadow-blue-500/20"></div>
            <p className="text-[11px] font-black text-slate-400 tracking-[0.3em] uppercase">Synchronizing Global Intelligence...</p>
        </div>
    );

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-1 text-left">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/40" />
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">Live Infrastructure Node</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter lowercase leading-none">Administration Overview<span className="text-blue-600">.</span></h1>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-3 flex items-center gap-2">
                        <Activity size={12} className="text-blue-500" /> Platform Governance Suite v2.5
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-white/80 backdrop-blur-xl rounded-[20px] p-1.5 border border-slate-100 shadow-xl shadow-slate-200/50">
                        {['24h', '7d', '30d', '90d'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={clsx(
                                    "px-6 py-2.5 rounded-[14px] text-[10px] font-black transition-all uppercase tracking-widest",
                                    timeRange === range ? "bg-slate-900 text-white shadow-xl" : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                                )}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Platform Command Panel */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {[
                    { label: 'Onboard Reseller', icon: Globe, href: '/resellers', color: 'bg-blue-600', shadow: 'shadow-blue-500/20' },
                    { label: 'Manage Plans', icon: Shield, href: '/plans', color: 'bg-indigo-600', shadow: 'shadow-indigo-500/20' },
                    { label: 'System Webhooks', icon: Webhook, href: '/webhooks', color: 'bg-purple-600', shadow: 'shadow-purple-500/20' },
                    { label: 'Audit Trail', icon: Database, href: '/audit-logs', color: 'bg-amber-500', shadow: 'shadow-amber-500/20' },
                    { label: 'Security Risk', icon: AlertTriangle, href: '/health', color: 'bg-rose-500', shadow: 'shadow-rose-500/20' },
                    { label: 'Core Config', icon: Settings, href: '/system', color: 'bg-slate-900', shadow: 'shadow-slate-500/20' },
                ].map((action, i) => (
                    <Link
                        key={i}
                        href={action.href}
                        className="group bg-white rounded-[32px] p-6 border border-slate-50 shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all flex flex-col items-center gap-4 relative overflow-hidden"
                    >
                        <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110", action.color, action.shadow)}>
                            <action.icon size={24} strokeWidth={2.5} />
                        </div>
                        <span className="text-[11px] font-black text-slate-900 tracking-tight text-center uppercase tracking-widest">{action.label}</span>
                    </Link>
                ))}
            </div>

            {/* Core Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                {stats.map((stat, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[40px] p-8 border-2 border-slate-50 shadow-sm transition-all text-left"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <stat.icon size={18} strokeWidth={3} />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-slate-900 tracking-tighter tabular-nums mb-1">{stat.value}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 bg-white rounded-[48px] p-10 border-2 border-slate-50 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between mb-12">
                        <div className="text-left">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                <BarChart3 className="text-blue-600" />
                                Growth Projections_
                            </h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 ml-9">High-Fidelity Revenue vs Volume</p>
                        </div>
                    </div>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trends?.revenue || []}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94A3B8', fontWeight: 900 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94A3B8', fontWeight: 900 }} />
                                <Tooltip />
                                <Area type="monotone" dataKey="value" name="Revenue" stroke="#10B981" strokeWidth={4} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8 text-left">
                    <div className="bg-[#0F172A] rounded-[48px] p-10 shadow-2xl relative overflow-hidden">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-lg font-black text-white tracking-widest uppercase italic">Node_Status</h2>
                            <Cpu className="text-blue-500 animate-pulse" size={24} />
                        </div>
                        <div className="space-y-6">
                            {systemHealth.map((service, i) => (
                                <div key={i} className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-black text-slate-300 uppercase tracking-tight">{service.service}</span>
                                        <span className={clsx("w-2 h-2 rounded-full", service.status === 'operational' ? 'bg-emerald-400' : 'bg-rose-400')} />
                                    </div>
                                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div className={clsx("h-full", service.status === 'operational' ? 'bg-blue-500 w-[90%]' : 'bg-rose-500 w-[40%]')} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
