'use client';

import { useState, useEffect } from 'react';
import { Webhook, Search, Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function AdminWebhooksPage() {
    const [webhooks, setWebhooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, active: 0, failing: 0 });

    useEffect(() => {
        fetchWebhooks();
    }, []);

    const fetchWebhooks = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/admin/webhooks`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setWebhooks(data.webhooks || []);
            setStats(data.stats || { total: 0, active: 0, failing: 0 });
        } catch (error) {
            console.error('Failed to fetch webhooks', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Webhooks</h1>
                    <p className="text-gray-500">Monitor webhook endpoints across all tenants</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <p className="text-sm text-gray-500">Total Webhooks</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <p className="text-sm text-gray-500">Active</p>
                    <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <p className="text-sm text-gray-500">Failing</p>
                    <p className="text-3xl font-bold text-red-600">{stats.failing}</p>
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
                            <th className="px-6 py-4">Last Delivery</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-8"><Loader2 className="animate-spin w-6 h-6 mx-auto text-blue-600" /></td></tr>
                        ) : webhooks.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-8 text-gray-500">No webhooks found</td></tr>
                        ) : (
                            webhooks.map((webhook) => (
                                <tr key={webhook.id} className="text-sm">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${webhook.status === 'active' ? 'bg-green-100' : 'bg-red-100'}`}>
                                                <Webhook className={`w-4 h-4 ${webhook.status === 'active' ? 'text-green-600' : 'text-red-600'}`} />
                                            </div>
                                            <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono truncate max-w-xs block">
                                                {webhook.url}
                                            </code>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{webhook.tenant}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {webhook.events?.slice(0, 2).map((event: string, i: number) => (
                                                <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                                    {event}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${webhook.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {webhook.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                            {webhook.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-500">
                                        {webhook.lastDelivery ? new Date(webhook.lastDelivery).toLocaleString() : 'Never'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
