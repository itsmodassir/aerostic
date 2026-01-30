'use client';

import { useState } from 'react';
import {
    Webhook, Search, Plus, CheckCircle, XCircle, Clock,
    MoreVertical, RefreshCw, ExternalLink
} from 'lucide-react';

export default function AdminWebhooksPage() {
    const webhooks = [
        {
            id: '1',
            url: 'https://api.techstart.in/webhooks/aerostic',
            tenant: 'TechStart India',
            events: ['message.received', 'message.sent', 'message.delivered'],
            status: 'active',
            lastDelivery: '30 Jan 2026, 20:48',
            successRate: '99.8%'
        },
        {
            id: '2',
            url: 'https://hooks.retailpro.com/wa',
            tenant: 'RetailPro',
            events: ['message.received', 'lead.created'],
            status: 'active',
            lastDelivery: '30 Jan 2026, 20:45',
            successRate: '98.5%'
        },
        {
            id: '3',
            url: 'https://crm.edulearn.ac.in/webhook',
            tenant: 'EduLearn',
            events: ['message.received'],
            status: 'failing',
            lastDelivery: '30 Jan 2026, 18:00',
            successRate: '45.2%'
        },
        {
            id: '4',
            url: 'https://healthplus.in/api/whatsapp/hook',
            tenant: 'HealthPlus',
            events: ['message.received', 'message.sent', 'lead.created', 'lead.updated'],
            status: 'active',
            lastDelivery: '30 Jan 2026, 20:42',
            successRate: '100%'
        },
    ];

    const eventStats = [
        { event: 'message.received', count: '2.4M', success: '99.2%' },
        { event: 'message.sent', count: '1.8M', success: '99.5%' },
        { event: 'message.delivered', count: '1.7M', success: '99.8%' },
        { event: 'lead.created', count: '45K', success: '98.9%' },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Webhooks</h1>
                    <p className="text-gray-500">Monitor webhook endpoints across all tenants</p>
                </div>
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search webhooks..."
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <p className="text-sm text-gray-500">Total Webhooks</p>
                    <p className="text-3xl font-bold text-gray-900">1,234</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <p className="text-sm text-gray-500">Active</p>
                    <p className="text-3xl font-bold text-green-600">1,189</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <p className="text-sm text-gray-500">Failing</p>
                    <p className="text-3xl font-bold text-red-600">45</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <p className="text-sm text-gray-500">Deliveries Today</p>
                    <p className="text-3xl font-bold text-blue-600">5.9M</p>
                </div>
            </div>

            {/* Event Stats */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Event Delivery Stats</h2>
                <div className="grid grid-cols-4 gap-4">
                    {eventStats.map((stat, i) => (
                        <div key={i} className="p-4 bg-gray-50 rounded-xl">
                            <code className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{stat.event}</code>
                            <p className="text-2xl font-bold text-gray-900 mt-2">{stat.count}</p>
                            <p className="text-sm text-green-600">{stat.success} success</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Webhooks Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="text-left text-xs text-gray-500 uppercase bg-gray-50">
                            <th className="px-6 py-4">Endpoint</th>
                            <th className="px-6 py-4">Tenant</th>
                            <th className="px-6 py-4">Events</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Success Rate</th>
                            <th className="px-6 py-4">Last Delivery</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {webhooks.map((webhook) => (
                            <tr key={webhook.id} className="text-sm">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${webhook.status === 'active' ? 'bg-green-100' : 'bg-red-100'}`}>
                                            <Webhook className={`w-4 h-4 ${webhook.status === 'active' ? 'text-green-600' : 'text-red-600'}`} />
                                        </div>
                                        <div>
                                            <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono truncate max-w-xs block">
                                                {webhook.url}
                                            </code>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{webhook.tenant}</td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        {webhook.events.slice(0, 2).map((event, i) => (
                                            <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                                {event}
                                            </span>
                                        ))}
                                        {webhook.events.length > 2 && (
                                            <span className="text-xs text-gray-400">+{webhook.events.length - 2}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${webhook.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {webhook.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                        {webhook.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`font-medium ${parseFloat(webhook.successRate) >= 95 ? 'text-green-600' :
                                            parseFloat(webhook.successRate) >= 80 ? 'text-amber-600' : 'text-red-600'
                                        }`}>
                                        {webhook.successRate}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-500">{webhook.lastDelivery}</td>
                                <td className="px-6 py-4">
                                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                                        <MoreVertical className="w-4 h-4 text-gray-400" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
