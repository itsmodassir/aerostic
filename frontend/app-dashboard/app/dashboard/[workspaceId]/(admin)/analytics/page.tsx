'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import {
    TrendingUp, MessageSquare, Users, Bot, Zap,
    ArrowUpRight, ArrowDownRight, Activity, Calendar
} from 'lucide-react';

interface AnalyticsData {
    stats: {
        totalSent: number;
        totalReceived: number;
        totalContacts: number;
        totalAgents: number;
        aiCreditsUsed: number;
        activeCampaigns: number;
        statusBreakdown: Record<string, number>;
    };
    dailyStats: Array<{
        date: string;
        sent: number;
        received: number;
    }>;
    recentCampaigns: any[];
    recentMessages: any[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get('/analytics/overview');
                setData(res.data);
            } catch (err) {
                console.error('Failed to fetch analytics', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!data) return <div>Failed to load analytics.</div>;

    const stats = [
        { label: 'Total Messages', value: data.stats.totalSent + data.stats.totalReceived, icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Contacts', value: data.stats.totalContacts, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'AI Responses', value: data.stats.aiCreditsUsed, icon: Bot, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Active Campaigns', value: data.stats.activeCampaigns, icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    const pieData = Object.entries(data.stats.statusBreakdown).map(([name, value]) => ({ name, value }));

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                    <p className="text-gray-500">Messaging performance and engagement metrics.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm font-medium text-gray-600 shadow-sm">
                    <Calendar size={16} />
                    <span>Last 7 Days</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <div className="flex items-center text-green-600 text-sm font-medium">
                                <TrendingUp size={16} className="mr-1" />
                                12%
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">{stat.value.toLocaleString()}</h3>
                        <p className="text-sm font-medium text-gray-500 mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Volume Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Message Volume</h3>
                            <p className="text-sm text-gray-500">Inbound vs Outbound messages</p>
                        </div>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.dailyStats}>
                                <defs>
                                    <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="sent" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSent)" />
                                <Area type="monotone" dataKey="received" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorReceived)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Breakdown */}
                <div className="bg-white p-6 rounded-2xl border shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Delivery Status</h3>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-3 mt-4">
                        {pieData.map((item, index) => (
                            <div key={item.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    <span className="text-gray-600 capitalize">{item.name}</span>
                                </div>
                                <span className="font-semibold text-gray-900">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="p-6 border-b">
                    <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                </div>
                <div className="divide-y">
                    {data.recentMessages.map((msg) => (
                        <div key={msg.id} className="p-4 hover:bg-gray-50 flex items-center justify-between transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-full ${msg.direction === 'in' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                    <Activity size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {msg.direction === 'in' ? 'Received from' : 'Sent to'} {msg.contactName}
                                    </p>
                                    <p className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${msg.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                    msg.status === 'read' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                {msg.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

