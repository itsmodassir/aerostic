'use client';

import { useState, useEffect } from 'react';
import {
    Users, CreditCard, MessageSquare, TrendingUp, ArrowUpRight, ArrowDownRight,
    BarChart3, Activity, AlertTriangle, CheckCircle, Clock, Zap, Loader2,
    Shield, Globe, Key, Webhook, Box, Cloud, Cpu, Database, FileText
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import Link from 'next/link';
import { clsx } from 'clsx';

export default function AdminDashboard() {
    const [timeRange, setTimeRange] = useState('7d');
    const [stats, setStats] = useState<any[]>([]);
    const [trends, setTrends] = useState<any>(null);
    const [systemHealth, setSystemHealth] = useState<any[]>([]);
    const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
    const [topTenants, setTopTenants] = useState<any[]>([]);
    const [subBreakdown, setSubBreakdown] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, [timeRange]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/v1/admin/platform/stats`, { credentials: 'include' });
            const trendsRes = await fetch(`/api/v1/admin/platform/stats/trends?range=${timeRange}`, { credentials: 'include' });

            if (!res.ok) throw new Error(`API returned ${res.status}`);
            const data = await res.json();
            const trendsData = await trendsRes.json();

            // Map stats to include proper lucide icons
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
                icon: iconMap[s.label] || Box
            }));

            setStats(mappedStats);
            setSystemHealth(data.systemHealth || []);
            setRecentAlerts(data.recentAlerts || []);
            setTopTenants(data.topTenants || []);
            setSubBreakdown(data.subscriptionBreakdown || []);
            setTrends(trendsData);
        } catch (err: any) {
            setError(`Sync Failure: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-gray-500 tracking-widest uppercase">Initializing Core Analytics...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            {/* High-Level Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">LIVE MODERATION ACTIVE</span>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter italic">PLATFORM_OVERVIEW</h1>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-white rounded-xl p-1 border border-gray-100 shadow-sm">
                        {['24h', '7d', '30d', '90d'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={clsx(
                                    "px-4 py-1.5 rounded-lg text-[11px] font-black transition-all",
                                    timeRange === range ? "bg-gray-900 text-white shadow-lg" : "text-gray-400 hover:text-gray-900"
                                )}
                            >
                                {range.toUpperCase()}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={fetchDashboardData}
                        className="p-2.5 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all text-gray-400 hover:text-blue-600"
                    >
                        <Activity className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[
                    { label: 'Onboard Reseller', icon: Globe, href: '/admin/resellers', color: 'blue' },
                    { label: 'Manage Plans', icon: Shield, href: '/admin/plans', color: 'indigo' },
                    { label: 'System Logs', icon: FileText, href: '/admin/system-logs', color: 'gray' },
                    { label: 'Webhooks', icon: Webhook, href: '/admin/webhooks', color: 'purple' },
                    { label: 'Audit Trail', icon: Database, href: '/admin/audit-logs', color: 'amber' },
                    { label: 'Health Check', icon: Activity, href: '/admin/health', color: 'emerald' },
                ].map((action, i) => (
                    <Link
                        key={i}
                        href={action.href}
                        className="group bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center gap-3"
                    >
                        <div className={`p-3 rounded-xl bg-${action.color}-50 text-${action.color}-600 group-hover:scale-110 transition-transform`}>
                            <action.icon className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-bold text-gray-700 tracking-tight text-center">{action.label}</span>
                    </Link>
                ))}
            </div>

            {/* Core Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                            <stat.icon className="w-16 h-16" />
                        </div>
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2 rounded-lg bg-${stat.color}-50 text-${stat.color}-600`}>
                                <stat.icon className="w-4 h-4" />
                            </div>
                            <div className={clsx(
                                "flex items-center gap-0.5 text-[10px] font-black",
                                stat.up ? "text-green-600" : "text-red-600"
                            )}>
                                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {stat.change}
                            </div>
                        </div>
                        <p className="text-2xl font-black text-gray-900 tracking-tighter italic">{stat.value}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main Growth Chart */}
                <div className="lg:col-span-8 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase italic">Platform_Performance</h2>
                            <p className="text-xs text-gray-400 font-bold mt-1">REAL-TIME TRAFFIC & REVENUE METRICS</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 rounded-lg">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                <span className="text-[10px] font-black text-blue-700 tracking-widest uppercase">Messages</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-lg">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-[10px] font-black text-emerald-700 tracking-widest uppercase">Revenue</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trends?.revenue || []}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold' }}
                                    tickFormatter={(v) => v.split('-').slice(1).join('/')}
                                />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold' }} />
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#000', borderRadius: '16px', border: 'none', color: '#FFF' }}
                                    itemStyle={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase' }}
                                    cursor={{ stroke: '#3B82F6', strokeWidth: 2, strokeDasharray: '5 5' }}
                                />
                                <Area yAxisId="left" type="monotone" dataKey="value" name="Revenue (₹)" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                <Area yAxisId="right" data={trends?.messages || []} type="monotone" dataKey="value" name="Messages" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorMessages)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* System Infrastructure */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Live Health Indicators */}
                    <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800 shadow-2xl relative overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer">
                        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl"></div>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-lg font-black text-white tracking-widest uppercase italic">Node_Status</h2>
                            <Cpu className="w-5 h-5 text-blue-400 animate-pulse" />
                        </div>
                        <div className="space-y-5">
                            {systemHealth.map((service, i) => (
                                <div key={i} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className={clsx(
                                            "w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]",
                                            service.status === 'operational' ? 'bg-green-400' : 'bg-red-400'
                                        )} />
                                        <span className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors uppercase tracking-tight">{service.service}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-black text-gray-500 group-hover:text-blue-400 transition-colors uppercase">{service.uptime}</span>
                                        <div className="w-8 h-1 bg-gray-800 rounded-full mt-1 overflow-hidden">
                                            <div className="h-full bg-blue-500 w-[98%]"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 pt-6 border-t border-gray-800">
                            <div className="flex justify-between items-center text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                <span>Global Latency</span>
                                <span className="text-blue-400">22ms AVG</span>
                            </div>
                        </div>
                    </div>

                    {/* Subscription Pie Chart */}
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                        <h2 className="text-sm font-black text-gray-900 tracking-widest uppercase mb-6">Tier_Saturation</h2>
                        <div className="h-[180px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Active', value: subBreakdown.find(b => b.status === 'active')?.count || 12, color: '#3B82F6' },
                                            { name: 'Trial', value: 8, color: '#10B981' },
                                            { name: 'Past Due', value: 2, color: '#F59E0B' },
                                        ]}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={8}
                                        dataKey="value"
                                    >
                                        {[0, 1, 2].map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B'][index]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-black text-gray-900 tracking-tighter italic">84%</span>
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Healthy</span>
                            </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-4 justify-center">
                            {['Active', 'Trial', 'Alert'].map((l, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                    <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-blue-500' : i === 1 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                    <span className="text-[9px] font-black text-gray-500 uppercase">{l}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Detailed Audit Stream */}
                <div className="bg-white rounded-[32px] p-10 border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase italic">Audit_Stream</h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">LATEST ADMINISTRATIVE SYSTEM EVENTS</p>
                        </div>
                        <Link href="/admin/audit-logs" className="p-2.5 bg-gray-50 rounded-xl hover:bg-gray-900 hover:text-white transition-all">
                            <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {recentAlerts.map((alert, i) => (
                            <div key={i} className="group flex items-center gap-6 p-5 hover:bg-gray-50 rounded-[24px] border border-transparent hover:border-gray-100 transition-all cursor-pointer">
                                <div className={clsx(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform",
                                    alert.type === 'error' ? 'bg-red-50 text-red-600 shadow-red-100' :
                                        alert.type === 'warning' ? 'bg-amber-50 text-amber-600 shadow-amber-100' :
                                            'bg-blue-50 text-blue-600 shadow-blue-100'
                                )}>
                                    {alert.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-black text-gray-900 tracking-tight mb-1 group-hover:text-blue-600 transition-colors">{alert.message}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{alert.time}</p>
                                </div>
                                <div className="hidden sm:block">
                                    <div className="h-1.5 w-1.5 rounded-full bg-gray-300 group-hover:bg-blue-600 transition-colors"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* High Growth Tenants */}
                <div className="bg-white rounded-[32px] p-10 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase italic">Tier_Performance</h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">TENANTS WITH HIGHEST VELOCITY TODAY</p>
                        </div>
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest pb-6">
                                    <th className="pb-6 px-2">TENANT_ID</th>
                                    <th className="pb-6">PLAN_ACCESS</th>
                                    <th className="pb-6 text-center">VOLUME</th>
                                    <th className="pb-6 text-right">REVENUE_LIFETIME</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {topTenants.map((tenant, i) => (
                                    <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="py-5 px-2">
                                            <p className="text-sm font-black text-gray-900 group-hover:text-blue-600 transition-colors italic uppercase">{tenant.name}</p>
                                            <p className="text-[9px] font-bold text-gray-400">ACTIVE SESSION</p>
                                        </td>
                                        <td className="py-5">
                                            <span className={clsx(
                                                "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter border",
                                                tenant.plan === 'Enterprise' ? "bg-purple-50 text-purple-700 border-purple-100" :
                                                    tenant.plan === 'Pro' ? "bg-blue-50 text-blue-700 border-blue-100" :
                                                        "bg-gray-50 text-gray-700 border-gray-100"
                                            )}>
                                                {tenant.plan}
                                            </span>
                                        </td>
                                        <td className="py-5 text-center font-black text-gray-900 text-sm tracking-tighter">{tenant.messages}</td>
                                        <td className="py-5 text-right font-black text-emerald-600 text-sm tracking-tighter">{tenant.revenue}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button className="w-full mt-8 py-4 bg-gray-50 hover:bg-gray-900 text-gray-500 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
                        VIEW_ALL_GLOBAL_TENANTS
                    </button>
                </div>
            </div>
        </div>
    );
}
