'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import {
    BarChart3, TrendingUp, TrendingDown, Users,
    MessageSquare, CheckCircle, Clock, ArrowUpRight,
    ArrowDownLeft, Activity, Target, Zap,
    ChevronRight, Calendar, Filter, Download,
    Search, MoreHorizontal, AlertCircle, Bot,
    Eye, MousePointer
} from 'lucide-react';
import { clsx } from 'clsx';

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
const GRADIENTS = [
    { start: '#3b82f6', end: '#2563eb' },
    { start: '#10b981', end: '#059669' },
    { start: '#f59e0b', end: '#d97706' },
    { start: '#8b5cf6', end: '#7c3aed' },
];

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/analytics/overview');
            setData(res.data);
        } catch (err: any) {
            const status = err?.response?.status;
            if (status === 401 || status === 403) {
                setError('auth');
            } else {
                setError(err?.response?.data?.message || 'Failed to connect to analytics engine.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAnalytics(); }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Synchronizing Data...</p>
                </div>
            </div>
        );
    }

    if (error || !data) return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] p-8 text-center bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
            <AlertCircle size={48} className="text-gray-300 mb-4" />
            <h3 className="text-xl font-black text-gray-900 tracking-tight">
                {error === 'auth' ? 'Session Expired' : 'Telemetry Offline'}
            </h3>
            <p className="text-sm font-bold text-gray-400 max-w-xs mt-2 uppercase tracking-widest leading-loose">
                {error === 'auth'
                    ? 'Your session has expired. Please refresh the page and log in again.'
                    : error || 'Failed to establish connection with the analytics engine.'}
            </p>
            <button
                onClick={fetchAnalytics}
                className="mt-6 px-6 py-3 bg-blue-600 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-black transition-all active:scale-95"
            >
                Retry
            </button>
        </div>
    );

    const stats = [
        { label: 'Total Volume', value: data.stats.totalSent + data.stats.totalReceived, icon: MessageSquare, color: 'blue', trend: '+14%', trendUp: true },
        { label: 'Reach', value: data.stats.totalContacts, icon: Users, color: 'emerald', trend: '+8%', trendUp: true },
        { label: 'AI Synthesis', value: data.stats.aiCreditsUsed, icon: Bot, color: 'purple', trend: 'Optimal', trendUp: null },
        { label: 'Active Ops', value: data.stats.activeCampaigns, icon: Zap, color: 'amber', trend: '3 Live', trendUp: null },
    ];

    const pieData = Object.entries(data.stats.statusBreakdown).map(([name, value]) => ({ name, value }));

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-8">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight sm:text-5xl">Insight <span className="text-blue-600 italic">Engine</span></h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mt-3 ml-1">Real-time Telemetry & Performance</p>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white border-2 border-gray-50 rounded-[24px] text-xs font-black text-gray-600 shadow-xl shadow-gray-200/50 group hover:border-blue-500 transition-all cursor-pointer">
                    <Calendar size={18} className="text-blue-600 group-hover:scale-110 transition-transform" />
                    <span className="uppercase tracking-widest mr-4 ml-1">Historical Range: Last 7 Days</span>
                    <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-600 transition-colors" />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {stats.map((stat, idx) => (
                    <div key={stat.label} className={clsx(
                        "bg-white p-8 rounded-[36px] border-2 border-gray-50 shadow-xl shadow-gray-200/30 group hover:border-blue-500 hover:-translate-y-1 transition-all duration-300",
                        `delay-[${idx * 100}ms]`
                    )}>
                        <div className="flex items-center justify-between mb-6">
                            <div className={clsx(
                                "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all group-hover:scale-110",
                                stat.color === 'blue' ? "bg-blue-50 text-blue-600" :
                                stat.color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
                                stat.color === 'purple' ? "bg-purple-50 text-purple-600" : "bg-amber-50 text-amber-600"
                            )}>
                                <stat.icon size={28} strokeWidth={2.5} />
                            </div>
                            {stat.trend && (
                                <div className={clsx(
                                    "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm",
                                    stat.trendUp === true ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : 
                                    stat.trendUp === false ? "bg-red-50 text-red-600 border border-red-100" : "bg-gray-50 text-gray-500 border border-gray-100"
                                )}>
                                    {stat.trendUp === true && <TrendingUp size={12} />}
                                    {stat.trend}
                                </div>
                            )}
                        </div>
                        <h3 className="text-4xl font-black text-gray-900 tracking-tighter mb-1">{stat.value.toLocaleString()}</h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                {/* Volume Chart */}
                <div className="lg:col-span-2 bg-white p-8 md:p-10 rounded-[48px] border-2 border-gray-50 shadow-2xl shadow-gray-200/40 group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[100px] -mr-32 -mt-32 opacity-40" />
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Transmission Volume</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Inbound vs Outbound Telemetry</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-xl">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-700">Outbound</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-xl">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700">Inbound</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-[350px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.dailyStats}>
                                    <defs>
                                        <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" strokeWidth={1} />
                                    <XAxis 
                                        dataKey="date" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 800 }} 
                                        dy={15} 
                                        tickFormatter={(val: string) => val.toUpperCase()} 
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 800 }} 
                                        dx={-10}
                                    />
                                    <Tooltip
                                        contentStyle={{ 
                                            backgroundColor: '#fff', 
                                            borderRadius: '24px', 
                                            border: 'none', 
                                            boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
                                            padding: '16px' 
                                        }}
                                        itemStyle={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                                    />
                                    <Area type="monotone" dataKey="sent" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorSent)" />
                                    <Area type="monotone" dataKey="received" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorReceived)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Status Breakdown */}
                <div className="bg-white p-8 md:p-10 rounded-[48px] border-2 border-gray-50 shadow-2xl shadow-gray-200/40 group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-purple-50 rounded-full blur-[80px] -ml-16 -mt-16 opacity-30" />
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="mb-10">
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Delivery Matrix</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Endpoint Fulfillment Reliability</p>
                        </div>
                        <div className="h-[280px] w-full flex-1">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={75}
                                        outerRadius={105}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="outline-none hover:opacity-80 transition-opacity cursor-pointer" />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                         contentStyle={{ 
                                            backgroundColor: '#fff', 
                                            borderRadius: '20px', 
                                            border: 'none', 
                                            boxShadow: '0 10px 30px -10px rgb(0 0 0 / 0.2)',
                                            padding: '12px' 
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-8">
                            {pieData.map((item, index) => (
                                <div key={item.name} className="flex flex-col p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-all">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 truncate">{item.name}</span>
                                    </div>
                                    <span className="text-xl font-black text-gray-900 tracking-tighter">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity Table (Premium Redesign) */}
            <div className="bg-white rounded-[48px] border-2 border-gray-50 shadow-2xl shadow-gray-200/40 overflow-hidden">
                <div className="p-8 md:p-10 border-b-2 border-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Live Telemetry Stacks</h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Real-time individual message status</p>
                    </div>
                    <button className="px-6 py-3 bg-gray-50 text-gray-400 font-black text-[10px] uppercase tracking-widest rounded-2xl border-2 border-transparent hover:border-blue-500 hover:text-blue-600 hover:bg-white transition-all active:scale-95 shadow-sm">Export Payload</button>
                </div>
                <div className="divide-y-2 divide-gray-50">
                    {data.recentMessages.map((msg, idx) => (
                        <div key={msg.id} className="p-6 md:p-8 hover:bg-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-all group active:bg-blue-50/30">
                            <div className="flex items-center gap-6 flex-1 min-w-0">
                                <div className={clsx(
                                    "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform",
                                    msg.direction === 'in' ? "bg-blue-500 text-white shadow-blue-100" : "bg-emerald-500 text-white shadow-emerald-100"
                                )}>
                                    <Activity size={24} strokeWidth={2.5} />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-3 mb-1.5">
                                        <p className="text-lg font-black text-gray-900 truncate tracking-tight">
                                            {msg.direction === 'in' ? 'Inbound Packet' : 'Outbound Pulse'}
                                        </p>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 bg-white px-2 py-1 rounded-lg border border-gray-100">Handshake</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="text-xs font-bold text-gray-500 flex items-center gap-1.5 uppercase tracking-tight">
                                            <Users size={12} className="text-blue-500" /> {msg.contactName}
                                        </p>
                                        <p className="text-[10px] font-black text-gray-300 flex items-center gap-1.5 uppercase tracking-[0.1em]">
                                            <Calendar size={12} /> {new Date(msg.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                <div className={clsx(
                                    "px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm",
                                    msg.status === 'read' ? "bg-blue-50 text-blue-600 border-blue-100 shadow-blue-50" :
                                    msg.status === 'delivered' ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-50" :
                                    msg.status === 'failed' ? "bg-red-50 text-red-600 border-red-100 shadow-red-50" : "bg-gray-100 text-gray-400 border-gray-200"
                                )}>
                                    {msg.status}
                                </div>
                                <div className="p-3 bg-white text-gray-300 rounded-xl group-hover:text-blue-600 group-hover:bg-blue-50 transition-all cursor-pointer">
                                    <ChevronRight size={20} strokeWidth={3} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {data.recentMessages.length === 0 && (
                    <div className="p-20 text-center flex flex-col items-center">
                        <Activity size={64} className="text-gray-100 mb-6" />
                        <h4 className="text-xl font-black text-gray-900 tracking-tight">Silent Channels</h4>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 max-w-xs leading-loose">No active telemetry packets detected in the recent session cycle.</p>
                    </div>
                )}
            </div>

            {/* Metric Secondary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
                {[
                    { label: 'Transmission Success', val: '98.5%', icon: CheckCircle, color: 'text-emerald-500' },
                    { label: 'Engagement Index', val: '76.2%', icon: Eye, color: 'text-blue-500' },
                    { label: 'Conversion Velocity', val: '34.8%', icon: MousePointer, color: 'text-purple-500' },
                    { label: 'System Throttling', val: '0.0%', icon: BarChart3, color: 'text-amber-500' }
                ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-6 bg-white border-2 border-gray-50 rounded-[32px] shadow-lg shadow-gray-200/20 hover:border-blue-500 transition-all group">
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><item.icon size={22} className={item.color} strokeWidth={2.5}/></div>
                        <div>
                            <p className="text-xl font-black text-gray-900 tracking-tighter leading-none mb-1">{item.val}</p>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{item.label}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
