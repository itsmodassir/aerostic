'use client';

import { useState } from 'react';
import {
    Users, CreditCard, MessageSquare, TrendingUp, ArrowUpRight, ArrowDownRight,
    BarChart3, Activity, AlertTriangle, CheckCircle, Clock, Zap
} from 'lucide-react';

export default function AdminDashboard() {
    const [timeRange, setTimeRange] = useState('7d');

    const stats = [
        {
            label: 'Total Tenants',
            value: '2,547',
            change: '+12.5%',
            up: true,
            icon: Users,
            color: 'blue'
        },
        {
            label: 'Monthly Revenue',
            value: '₹48.5L',
            change: '+23.1%',
            up: true,
            icon: CreditCard,
            color: 'green'
        },
        {
            label: 'Messages Today',
            value: '1.24M',
            change: '+8.2%',
            up: true,
            icon: MessageSquare,
            color: 'purple'
        },
        {
            label: 'AI Conversations',
            value: '156K',
            change: '-2.4%',
            up: false,
            icon: Zap,
            color: 'amber'
        },
    ];

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

    const systemHealth = [
        { service: 'API Gateway', status: 'operational', uptime: '99.99%' },
        { service: 'Database (Primary)', status: 'operational', uptime: '99.97%' },
        { service: 'Redis Cache', status: 'operational', uptime: '100%' },
        { service: 'Meta API Integration', status: 'degraded', uptime: '98.5%' },
        { service: 'AI Service (Gemini)', status: 'operational', uptime: '99.9%' },
    ];

    return (
        <div className="space-y-8">
            {/* Header with Time Range */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
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
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
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
                ))}
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Revenue Chart Placeholder */}
                <div className="col-span-2 bg-white rounded-2xl p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Revenue Trend</h2>
                        <BarChart3 className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                        <div className="text-center">
                            <BarChart3 className="w-12 h-12 text-blue-300 mx-auto mb-2" />
                            <p className="text-gray-500">Revenue chart visualization</p>
                            <p className="text-sm text-gray-400">₹48.5L MRR (+23.1% MoM)</p>
                        </div>
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
