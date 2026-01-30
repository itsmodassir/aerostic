'use client';

import { useState } from 'react';
import {
    AlertTriangle, Bell, CheckCircle, XCircle, Clock, Filter,
    Settings, Mail, MessageSquare, Plus, Trash2
} from 'lucide-react';

export default function AdminAlertsPage() {
    const [filter, setFilter] = useState('all');

    const alerts = [
        {
            id: 1,
            type: 'critical',
            title: 'High API Error Rate',
            description: 'Error rate exceeded 5% threshold on message endpoint',
            source: 'API Gateway',
            time: '5 min ago',
            acknowledged: false
        },
        {
            id: 2,
            type: 'warning',
            title: 'Meta API Latency Spike',
            description: 'Response time increased to 450ms (threshold: 300ms)',
            source: 'WhatsApp Integration',
            time: '15 min ago',
            acknowledged: false
        },
        {
            id: 3,
            type: 'warning',
            title: 'Database Connection Pool',
            description: '85% of connection pool in use (threshold: 80%)',
            source: 'PostgreSQL',
            time: '1 hour ago',
            acknowledged: true
        },
        {
            id: 4,
            type: 'info',
            title: 'New Enterprise Signup',
            description: 'TechCorp India upgraded to Enterprise plan',
            source: 'Billing',
            time: '2 hours ago',
            acknowledged: true
        },
        {
            id: 5,
            type: 'resolved',
            title: 'Queue Backlog Cleared',
            description: 'Message queue backlog resolved automatically',
            source: 'Bull Queue',
            time: '3 hours ago',
            acknowledged: true
        },
    ];

    const alertRules = [
        { name: 'API Error Rate > 5%', channel: 'Email + Slack', status: 'active' },
        { name: 'Response Time > 300ms', channel: 'Slack', status: 'active' },
        { name: 'DB Connections > 80%', channel: 'Email', status: 'active' },
        { name: 'Payment Failure', channel: 'Email + SMS', status: 'active' },
        { name: 'New Enterprise Signup', channel: 'Email', status: 'active' },
    ];

    const filteredAlerts = filter === 'all'
        ? alerts
        : alerts.filter(a => a.type === filter);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Alerts & Notifications</h1>
                    <p className="text-gray-500">Monitor and configure system alerts</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Settings className="w-4 h-4" />
                    Configure Alerts
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-6">
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <XCircle className="w-5 h-5 text-red-600" />
                        <span className="text-sm font-medium text-red-700">Critical</span>
                    </div>
                    <p className="text-3xl font-bold text-red-600">1</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        <span className="text-sm font-medium text-amber-700">Warnings</span>
                    </div>
                    <p className="text-3xl font-bold text-amber-600">2</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Bell className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">Info</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-600">1</p>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-700">Resolved</span>
                    </div>
                    <p className="text-3xl font-bold text-green-600">1</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Active Alerts */}
                <div className="col-span-2 bg-white rounded-2xl border border-gray-100">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">Active Alerts</h2>
                        <div className="flex items-center gap-2">
                            {['all', 'critical', 'warning', 'info'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium ${filter === f ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'
                                        }`}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {filteredAlerts.map((alert) => (
                            <div key={alert.id} className={`px-6 py-4 ${!alert.acknowledged ? 'bg-yellow-50/50' : ''}`}>
                                <div className="flex items-start gap-4">
                                    <div className={`p-2 rounded-lg ${alert.type === 'critical' ? 'bg-red-100' :
                                            alert.type === 'warning' ? 'bg-amber-100' :
                                                alert.type === 'info' ? 'bg-blue-100' :
                                                    'bg-green-100'
                                        }`}>
                                        {alert.type === 'critical' ? <XCircle className="w-5 h-5 text-red-600" /> :
                                            alert.type === 'warning' ? <AlertTriangle className="w-5 h-5 text-amber-600" /> :
                                                alert.type === 'info' ? <Bell className="w-5 h-5 text-blue-600" /> :
                                                    <CheckCircle className="w-5 h-5 text-green-600" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium text-gray-900">{alert.title}</h3>
                                            {!alert.acknowledged && (
                                                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">New</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">{alert.description}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                            <span>{alert.source}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {alert.time}</span>
                                        </div>
                                    </div>
                                    {!alert.acknowledged && (
                                        <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg">
                                            Acknowledge
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Alert Rules */}
                <div className="bg-white rounded-2xl border border-gray-100">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">Alert Rules</h2>
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {alertRules.map((rule, i) => (
                            <div key={i} className="px-6 py-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{rule.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {rule.channel.includes('Email') && <Mail className="w-3 h-3 text-gray-400" />}
                                        {rule.channel.includes('Slack') && <MessageSquare className="w-3 h-3 text-gray-400" />}
                                        <span className="text-xs text-gray-400">{rule.channel}</span>
                                    </div>
                                </div>
                                <div className="w-10 h-5 bg-green-500 rounded-full relative cursor-pointer">
                                    <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
