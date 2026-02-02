'use client';

import { useState, useEffect } from 'react';
import {
    Key, Search, Filter, Plus, Copy, Eye, EyeOff, Trash2,
    MoreVertical, CheckCircle, XCircle, Clock, Loader2
} from 'lucide-react';

interface ApiKey {
    id: string;
    name: string;
    tenantName: string;
    key: string;
    status: string;
    createdAt: string;
    lastUsed: string;
    requests: string;
}

export default function AdminApiKeysPage() {
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showKey, setShowKey] = useState<string | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    useEffect(() => {
        fetchApiKeys();
    }, []);

    const fetchApiKeys = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/admin/api-keys`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setApiKeys(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const filteredKeys = apiKeys.filter(k =>
        k.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>;

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
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        />
                    </div>
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
                            <th className="px-6 py-4">Requests Today</th>
                            <th className="px-6 py-4">Last Used</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredKeys.length > 0 ? filteredKeys.map((key) => (
                            <tr key={key.id} className="text-sm">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Key className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <span className="font-medium text-gray-900">{key.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{key.tenantName}</td>
                                <td className="px-6 py-4">
                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                                        {key.key}
                                    </code>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${key.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {key.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                        {key.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{key.requests}</td>
                                <td className="px-6 py-4 text-xs text-gray-500">
                                    {key.lastUsed ? new Date(key.lastUsed).toLocaleString() : 'Never'}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No API keys found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
