'use client';

import { useState } from 'react';
import {
    Key, Search, Filter, Plus, Copy, Eye, EyeOff, Trash2,
    MoreVertical, CheckCircle, XCircle, Clock
} from 'lucide-react';

export default function AdminApiKeysPage() {
    const [showKey, setShowKey] = useState<string | null>(null);

    const apiKeys = [
        {
            id: '1',
            name: 'Production API Key',
            tenant: 'TechStart India',
            key: 'ak_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            status: 'active',
            created: '15 Jan 2026',
            lastUsed: '30 Jan 2026, 20:45',
            requests: '1.2M'
        },
        {
            id: '2',
            name: 'Staging Key',
            tenant: 'RetailPro',
            key: 'ak_test_yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy',
            status: 'active',
            created: '10 Jan 2026',
            lastUsed: '30 Jan 2026, 18:30',
            requests: '45K'
        },
        {
            id: '3',
            name: 'Mobile App Integration',
            tenant: 'EduLearn',
            key: 'ak_live_zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz',
            status: 'revoked',
            created: '5 Jan 2026',
            lastUsed: '25 Jan 2026, 12:00',
            requests: '890K'
        },
        {
            id: '4',
            name: 'CRM Integration',
            tenant: 'HealthPlus',
            key: 'ak_live_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            status: 'active',
            created: '20 Dec 2025',
            lastUsed: '30 Jan 2026, 19:15',
            requests: '2.3M'
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
                    <p className="text-gray-500">Manage API keys across all tenants</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by tenant or key..."
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                        <Filter className="w-4 h-4" />
                        Filter
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <p className="text-sm text-gray-500">Total API Keys</p>
                    <p className="text-3xl font-bold text-gray-900">4,521</p>
                    <p className="text-sm text-green-600 mt-1">+234 this month</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <p className="text-sm text-gray-500">Active Keys</p>
                    <p className="text-3xl font-bold text-green-600">4,312</p>
                    <p className="text-sm text-gray-500 mt-1">95.4% of total</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <p className="text-sm text-gray-500">API Calls Today</p>
                    <p className="text-3xl font-bold text-blue-600">12.4M</p>
                    <p className="text-sm text-green-600 mt-1">+8.2% vs yesterday</p>
                </div>
            </div>

            {/* Keys Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="text-left text-xs text-gray-500 uppercase bg-gray-50">
                            <th className="px-6 py-4">Key Name</th>
                            <th className="px-6 py-4">Tenant</th>
                            <th className="px-6 py-4">API Key</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Requests</th>
                            <th className="px-6 py-4">Last Used</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {apiKeys.map((key) => (
                            <tr key={key.id} className="text-sm">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Key className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <span className="font-medium text-gray-900">{key.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{key.tenant}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                                            {showKey === key.id ? key.key : `${key.key.slice(0, 12)}...`}
                                        </code>
                                        <button
                                            onClick={() => setShowKey(showKey === key.id ? null : key.id)}
                                            className="p-1 hover:bg-gray-100 rounded"
                                        >
                                            {showKey === key.id ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                                        </button>
                                        <button className="p-1 hover:bg-gray-100 rounded">
                                            <Copy className="w-4 h-4 text-gray-400" />
                                        </button>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${key.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {key.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                        {key.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{key.requests}</td>
                                <td className="px-6 py-4 text-xs text-gray-500">{key.lastUsed}</td>
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
