'use client';

import { useState } from 'react';
import {
    MessageSquare, Search, Filter, Download, Calendar, ChevronDown,
    CheckCircle, XCircle, Clock, Eye, MoreVertical
} from 'lucide-react';

export default function AdminMessagesPage() {
    const [filter, setFilter] = useState('all');

    const messageStats = [
        { label: 'Total Messages', value: '12.4M', change: '+18%' },
        { label: 'Delivered', value: '12.1M', change: '97.6%' },
        { label: 'Read', value: '8.9M', change: '73.5%' },
        { label: 'Failed', value: '234K', change: '1.9%' },
    ];

    const messages = [
        {
            id: 'MSG-001',
            tenant: 'TechStart India',
            from: '+91 98765 43210',
            to: '+91 87654 32109',
            type: 'template',
            status: 'delivered',
            timestamp: '30 Jan 2026, 20:45:12'
        },
        {
            id: 'MSG-002',
            tenant: 'RetailPro',
            from: '+91 12345 67890',
            to: '+91 09876 54321',
            type: 'text',
            status: 'read',
            timestamp: '30 Jan 2026, 20:44:55'
        },
        {
            id: 'MSG-003',
            tenant: 'EduLearn',
            from: '+91 55555 55555',
            to: '+91 66666 66666',
            type: 'media',
            status: 'failed',
            timestamp: '30 Jan 2026, 20:44:30'
        },
        {
            id: 'MSG-004',
            tenant: 'HealthPlus',
            from: '+91 77777 77777',
            to: '+91 88888 88888',
            type: 'template',
            status: 'pending',
            timestamp: '30 Jan 2026, 20:44:10'
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Message Logs</h1>
                    <p className="text-gray-500">Monitor all messages across tenants</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                        <Calendar className="w-4 h-4" />
                        Last 24 Hours
                        <ChevronDown className="w-4 h-4" />
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-6">
                {messageStats.map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
                        <p className="text-sm text-gray-500">{stat.label}</p>
                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                        <p className={`text-sm mt-1 ${stat.label === 'Failed' ? 'text-red-600' : 'text-green-600'}`}>
                            {stat.change}
                        </p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by phone, tenant, or message ID..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'delivered', 'read', 'failed', 'pending'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === f
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Messages Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="text-left text-xs text-gray-500 uppercase bg-gray-50">
                            <th className="px-6 py-4">Message ID</th>
                            <th className="px-6 py-4">Tenant</th>
                            <th className="px-6 py-4">From</th>
                            <th className="px-6 py-4">To</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Timestamp</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {messages.map((msg) => (
                            <tr key={msg.id} className="text-sm">
                                <td className="px-6 py-4 font-mono text-gray-600">{msg.id}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">{msg.tenant}</td>
                                <td className="px-6 py-4 font-mono text-gray-600 text-xs">{msg.from}</td>
                                <td className="px-6 py-4 font-mono text-gray-600 text-xs">{msg.to}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${msg.type === 'template' ? 'bg-purple-100 text-purple-700' :
                                            msg.type === 'media' ? 'bg-blue-100 text-blue-700' :
                                                'bg-gray-100 text-gray-700'
                                        }`}>
                                        {msg.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${msg.status === 'delivered' ? 'bg-blue-100 text-blue-700' :
                                            msg.status === 'read' ? 'bg-green-100 text-green-700' :
                                                msg.status === 'failed' ? 'bg-red-100 text-red-700' :
                                                    'bg-amber-100 text-amber-700'
                                        }`}>
                                        {msg.status === 'delivered' ? <CheckCircle className="w-3 h-3" /> :
                                            msg.status === 'read' ? <Eye className="w-3 h-3" /> :
                                                msg.status === 'failed' ? <XCircle className="w-3 h-3" /> :
                                                    <Clock className="w-3 h-3" />}
                                        {msg.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-500">{msg.timestamp}</td>
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
