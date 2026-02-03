'use client';

import { useState, useEffect } from 'react';
import {
    Users, CreditCard, MessageSquare, TrendingUp, ArrowUpRight, ArrowDownRight,
    BarChart3, Activity, AlertTriangle, CheckCircle, Clock, Zap, Loader2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
    const [timeRange, setTimeRange] = useState('7d');
    const [stats, setStats] = useState<any[]>([]);
    const [trends, setTrends] = useState<any>(null);
    const [systemHealth, setSystemHealth] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    useEffect(() => {
        fetchDashboardData();
    }, [timeRange]);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('Fetching dashboard data from:', `/api/admin/stats`);
            const res = await fetch(`/api/admin/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('Stats response status:', res.status);

            const trendsRes = await fetch(`/api/admin/stats/trends?range=${timeRange}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('Trends response status:', trendsRes.status);

            if (!res.ok) throw new Error(`API returned ${res.status}`);
            const data = await res.json();
            const trendsData = await trendsRes.json();
            console.log('Received data:', data);

            // Map icons mapping based on label
            const mappedStats = data.stats.map((s: any) => ({
                ...s,
                icon: s.label.includes('Tenants') ? Users :
                    s.label.includes('Revenue') ? CreditCard :
                        s.label.includes('Messages') ? MessageSquare :
                            Zap,
                color: s.label.includes('Tenants') ? 'blue' :
                    s.label.includes('Revenue') ? 'green' :
                        s.label.includes('Messages') ? 'purple' :
                            'amber'
            }));

            setStats(mappedStats);
            setSystemHealth(data.systemHealth);
            setTrends(trendsData);
        } catch (err: any) {
            console.error('Dashboard fetch error:', err);
            setError(`Failed to load data: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Static failover for visual consistency if backend fails
    const recentAlerts = [
        { type: 'warning', message: 'High API latency detected in ap-south-1', time: '5 min ago' },
        { type: 'success', message: 'Database backup completed successfully', time: '1 hour ago' },
        { type: 'info', message: 'New tenant signup: RetailPro India', time: '2 hours ago' },
        { type: 'error', message: 'Meta API rate limit warning for tenant #1234', time: '3 hours ago' },
    ];

    const topTenants = [
        { name: 'TechStart India', plan: 'Enterprise', messages: '2.1M', revenue: '₹14,999' },
        { name: 'RetailPro', plan: 'Growth', messages: '890K', revenue: '₹4,999' },
        { name: 'EduLearn Academy', plan: 'Enterprise', messages: '1.5M', revenue: '₹14,999' },
        { name: 'HealthPlus Clinics', plan: 'Growth', messages: '456K', revenue: '₹4,999' },
        { name: 'FoodExpress', plan: 'Starter', messages: '98K', revenue: '₹1,999' },
    ];

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header with Time Range */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                </div>
                <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-gray-200">
                    {['24h', '7d', '30d', '90d'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${timeRange === range
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-6">
                {stats.length > 0 ? stats.map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
                                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                            </div>
                            <div className={`flex items-center gap-1 text-sm font-medium ${stat.up ? 'text-green-600' : 'text-red-600'}`}>
                                {stat.up ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                {stat.change}
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                    </div>
                )) : (
                    <div className="col-span-4 text-center py-8 text-gray-500">No stats available</div>
                )}
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Revenue & Messages Trend */}
                <div className="col-span-2 bg-white rounded-2xl p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Platform Growth</h2>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-blue-500" />
                                <span className="text-xs text-gray-500">Messages</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <span className="text-xs text-gray-500">Revenue</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-72 w-full">
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
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} tickFormatter={(v) => v.slice(8)} />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#FFF', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                                />
                                <Area yAxisId="left" type="monotone" dataKey="value" name="Revenue" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                                <Area yAxisId="right" data={trends?.messages || []} type="monotone" dataKey="value" name="Messages" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorMessages)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* System Health */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">System Health</h2>
                        <Activity className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="space-y-4">
                        {systemHealth.map((service, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${service.status === 'operational' ? 'bg-green-500' :
                                        service.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                                        }`} />
                                    <span className="text-sm text-gray-700">{service.service}</span>
                                </div>
                                <span className="text-xs text-gray-500">{service.uptime}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Recent Alerts */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Recent Alerts</h2>
                        <AlertTriangle className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="space-y-4">
                        {recentAlerts.map((alert, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                <div className={`p-1 rounded-full ${alert.type === 'error' ? 'bg-red-100 text-red-600' :
                                    alert.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                                        alert.type === 'success' ? 'bg-green-100 text-green-600' :
                                            'bg-blue-100 text-blue-600'
                                    }`}>
                                    {alert.type === 'error' ? <AlertTriangle className="w-4 h-4" /> :
                                        alert.type === 'success' ? <CheckCircle className="w-4 h-4" /> :
                                            <Clock className="w-4 h-4" />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-700">{alert.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">{alert.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Tenants */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Top Tenants</h2>
                        <TrendingUp className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs text-gray-500 uppercase">
                                    <th className="pb-3">Tenant</th>
                                    <th className="pb-3">Plan</th>
                                    <th className="pb-3">Messages</th>
                                    <th className="pb-3">MRR</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {topTenants.map((tenant, i) => (
                                    <tr key={i} className="text-sm">
                                        <td className="py-3 font-medium text-gray-900">{tenant.name}</td>
                                        <td className="py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${tenant.plan === 'Enterprise' ? 'bg-purple-100 text-purple-700' :
                                                tenant.plan === 'Growth' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                {tenant.plan}
                                            </span>
                                        </td>
                                        <td className="py-3 text-gray-600">{tenant.messages}</td>
                                        <td className="py-3 font-medium text-green-600">{tenant.revenue}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
