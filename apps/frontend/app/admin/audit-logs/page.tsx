'use client';

import { useState } from 'react';
import {
    FileText, Search, Filter, Download, Calendar, ChevronDown,
    User, Settings, Shield, CreditCard, MessageSquare, Key
} from 'lucide-react';

export default function AdminAuditLogsPage() {
    const [selectedType, setSelectedType] = useState('all');

    const logTypes = [
        { id: 'all', label: 'All Events' },
        { id: 'auth', label: 'Authentication' },
        { id: 'billing', label: 'Billing' },
        { id: 'settings', label: 'Settings' },
        { id: 'api', label: 'API Access' },
        { id: 'admin', label: 'Admin Actions' },
    ];

    const logs = [
        {
            id: 'LOG-001',
            type: 'auth',
            action: 'User Login',
            description: 'Successful login from 103.21.x.x',
            user: 'admin@aerostic.com',
            tenant: 'System',
            timestamp: '30 Jan 2026, 20:45:12',
            severity: 'info'
        },
        {
            id: 'LOG-002',
            type: 'billing',
            action: 'Subscription Upgraded',
            description: 'Plan changed from Growth to Enterprise',
            user: 'john@techstart.in',
            tenant: 'TechStart India',
            timestamp: '30 Jan 2026, 20:32:05',
            severity: 'info'
        },
        {
            id: 'LOG-003',
            type: 'settings',
            action: 'Webhook Updated',
            description: 'Webhook URL changed for message events',
            user: 'dev@retailpro.com',
            tenant: 'RetailPro',
            timestamp: '30 Jan 2026, 19:15:33',
            severity: 'warning'
        },
        {
            id: 'LOG-004',
            type: 'api',
            action: 'API Key Revoked',
            description: 'API Key ak_live_xxx... was revoked',
            user: 'admin@edulearn.ac.in',
            tenant: 'EduLearn',
            timestamp: '30 Jan 2026, 18:45:21',
            severity: 'warning'
        },
        {
            id: 'LOG-005',
            type: 'admin',
            action: 'Tenant Suspended',
            description: 'Tenant suspended for policy violation',
            user: 'admin@aerostic.com',
            tenant: 'SpammerXYZ',
            timestamp: '30 Jan 2026, 17:30:00',
            severity: 'error'
        },
        {
            id: 'LOG-006',
            type: 'auth',
            action: 'Failed Login Attempt',
            description: '5 failed login attempts from 45.33.x.x',
            user: 'unknown',
            tenant: 'System',
            timestamp: '30 Jan 2026, 16:20:45',
            severity: 'error'
        },
        {
            id: 'LOG-007',
            type: 'settings',
            action: 'AI Agent Created',
            description: 'New AI agent "Sales Bot" created',
            user: 'marketing@healthplus.in',
            tenant: 'HealthPlus',
            timestamp: '30 Jan 2026, 15:10:22',
            severity: 'info'
        },
    ];

    const getIcon = (type: string) => {
        switch (type) {
            case 'auth': return <Shield className="w-4 h-4" />;
            case 'billing': return <CreditCard className="w-4 h-4" />;
            case 'settings': return <Settings className="w-4 h-4" />;
            case 'api': return <Key className="w-4 h-4" />;
            case 'admin': return <User className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    const filteredLogs = selectedType === 'all'
        ? logs
        : logs.filter(log => log.type === selectedType);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
                    <p className="text-gray-500">Track all actions and events across the platform</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                        <Calendar className="w-4 h-4" />
                        Last 30 Days
                        <ChevronDown className="w-4 h-4" />
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Download className="w-4 h-4" />
                        Export Logs
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by user, action, or description..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    />
                </div>
                <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-gray-200">
                    {logTypes.map((type) => (
                        <button
                            key={type.id}
                            onClick={() => setSelectedType(type.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedType === type.id
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="text-left text-xs text-gray-500 uppercase bg-gray-50">
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Action</th>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Tenant</th>
                            <th className="px-6 py-4">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredLogs.map((log) => (
                            <tr key={log.id} className="text-sm hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${log.type === 'auth' ? 'bg-blue-100 text-blue-700' :
                                            log.type === 'billing' ? 'bg-green-100 text-green-700' :
                                                log.type === 'settings' ? 'bg-purple-100 text-purple-700' :
                                                    log.type === 'api' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-red-100 text-red-700'
                                        }`}>
                                        {getIcon(log.type)}
                                        {log.type}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div>
                                        <p className="font-medium text-gray-900">{log.action}</p>
                                        <p className="text-xs text-gray-500">{log.description}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{log.user}</td>
                                <td className="px-6 py-4 text-gray-600">{log.tenant}</td>
                                <td className="px-6 py-4 text-gray-500 text-xs">{log.timestamp}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-sm text-gray-500">Showing {filteredLogs.length} of 1,234 logs</p>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Previous</button>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm">1</button>
                        <button className="px-3 py-1 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">2</button>
                        <button className="px-3 py-1 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">3</button>
                        <button className="px-3 py-1 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
