'use client';

import { useState } from 'react';
import {
    BarChart3, TrendingUp, Users, MessageSquare, Bot, Zap,
    ArrowUpRight, ArrowDownRight, Calendar, ChevronDown
} from 'lucide-react';

export default function AdminAnalyticsPage() {
    const [timeRange, setTimeRange] = useState('7d');

    const metrics = [
        {
            label: 'Total Messages',
            value: '12.4M',
            change: '+18.2%',
            up: true,
            breakdown: { sent: '10.2M', delivered: '9.8M', read: '7.1M' }
        },
        {
            label: 'Active Tenants',
            value: '2,147',
            change: '+5.3%',
            up: true,
            breakdown: { daily: '1,456', weekly: '2,089', monthly: '2,147' }
        },
        {
            label: 'AI Conversations',
            value: '892K',
            change: '+32.1%',
            up: true,
            breakdown: { resolved: '847K', handoff: '45K', pending: '2.3K' }
        },
        {
            label: 'API Calls',
            value: '45.2M',
            change: '-2.4%',
            up: false,
            breakdown: { messages: '38M', webhooks: '5.2M', other: '2M' }
        },
    ];

    const channelPerformance = [
        { channel: 'WhatsApp Business', messages: '8.4M', deliveryRate: '98.2%', responseRate: '67%' },
        { channel: 'WhatsApp Cloud', messages: '4M', deliveryRate: '97.8%', responseRate: '72%' },
    ];

    const topFeatures = [
        { feature: 'Bulk Campaigns', usage: 78, trend: '+12%' },
        { feature: 'AI Chatbots', usage: 65, trend: '+28%' },
        { feature: 'Template Builder', usage: 54, trend: '+8%' },
        { feature: 'Automation Rules', usage: 42, trend: '+15%' },
        { feature: 'Team Inbox', usage: 38, trend: '+5%' },
    ];

    const geoDistribution = [
        { region: 'Maharashtra', tenants: 456, messages: '3.2M', percentage: 26 },
        { region: 'Delhi NCR', tenants: 389, messages: '2.8M', percentage: 22 },
        { region: 'Karnataka', tenants: 312, messages: '2.1M', percentage: 17 },
        { region: 'Tamil Nadu', tenants: 245, messages: '1.6M', percentage: 13 },
        { region: 'Gujarat', tenants: 198, messages: '1.2M', percentage: 10 },
        { region: 'Others', tenants: 547, messages: '1.5M', percentage: 12 },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
                    <p className="text-gray-500">Monitor platform performance and usage metrics</p>
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

            {/* Key Metrics */}
            <div className="grid grid-cols-4 gap-6">
                {metrics.map((metric, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm text-gray-500">{metric.label}</p>
                            <div className={`flex items-center gap-1 text-sm font-medium ${metric.up ? 'text-green-600' : 'text-red-600'}`}>
                                {metric.up ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                {metric.change}
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mb-4">{metric.value}</p>
                        <div className="space-y-2 border-t border-gray-100 pt-4">
                            {Object.entries(metric.breakdown).map(([key, val]) => (
                                <div key={key} className="flex justify-between text-sm">
                                    <span className="text-gray-500 capitalize">{key}</span>
                                    <span className="text-gray-700 font-medium">{val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Feature Usage */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Feature Usage</h2>
                    <div className="space-y-4">
                        {topFeatures.map((feature, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="w-36 text-sm font-medium text-gray-700">{feature.feature}</div>
                                <div className="flex-1">
                                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                            style={{ width: `${feature.usage}%` }}
                                        />
                                    </div>
                                </div>
                                <span className="text-sm font-medium text-green-600">{feature.trend}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Geographic Distribution */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Geographic Distribution (India)</h2>
                    <div className="space-y-4">
                        {geoDistribution.map((region, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="w-28 text-sm font-medium text-gray-700">{region.region}</div>
                                <div className="flex-1">
                                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                                            style={{ width: `${region.percentage}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">{region.tenants}</p>
                                    <p className="text-xs text-gray-500">{region.messages}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Channel Performance */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Channel Performance</h2>
                <table className="w-full">
                    <thead>
                        <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-100">
                            <th className="pb-4">Channel</th>
                            <th className="pb-4">Messages</th>
                            <th className="pb-4">Delivery Rate</th>
                            <th className="pb-4">Response Rate</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {channelPerformance.map((channel, i) => (
                            <tr key={i} className="text-sm">
                                <td className="py-4 font-medium text-gray-900">{channel.channel}</td>
                                <td className="py-4 text-gray-700">{channel.messages}</td>
                                <td className="py-4">
                                    <span className="text-green-600 font-medium">{channel.deliveryRate}</span>
                                </td>
                                <td className="py-4">
                                    <span className="text-blue-600 font-medium">{channel.responseRate}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
