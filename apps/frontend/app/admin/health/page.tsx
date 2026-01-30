'use client';

import { useState } from 'react';
import {
    Activity, Server, Database, Globe, Zap, CheckCircle, AlertTriangle,
    XCircle, RefreshCw, Clock, TrendingUp, ArrowUpRight
} from 'lucide-react';

export default function AdminHealthPage() {
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1500);
    };

    const services = [
        {
            name: 'API Gateway',
            status: 'operational',
            uptime: '99.99%',
            latency: '45ms',
            lastCheck: '30 sec ago',
            details: 'All endpoints responding normally'
        },
        {
            name: 'PostgreSQL Primary',
            status: 'operational',
            uptime: '99.97%',
            latency: '12ms',
            lastCheck: '30 sec ago',
            details: 'Connections: 142/500, Queries/sec: 1,234'
        },
        {
            name: 'PostgreSQL Replica',
            status: 'operational',
            uptime: '99.95%',
            latency: '8ms',
            lastCheck: '30 sec ago',
            details: 'Replication lag: 45ms'
        },
        {
            name: 'Redis Cache',
            status: 'operational',
            uptime: '100%',
            latency: '2ms',
            lastCheck: '30 sec ago',
            details: 'Memory: 3.2GB/8GB, Hit rate: 98.7%'
        },
        {
            name: 'Bull Queue (Jobs)',
            status: 'operational',
            uptime: '99.98%',
            latency: 'N/A',
            lastCheck: '30 sec ago',
            details: 'Active jobs: 234, Waiting: 12, Completed: 1.2M'
        },
        {
            name: 'Meta WhatsApp API',
            status: 'degraded',
            uptime: '98.5%',
            latency: '320ms',
            lastCheck: '30 sec ago',
            details: 'Higher than normal latency observed'
        },
        {
            name: 'Google Gemini API',
            status: 'operational',
            uptime: '99.9%',
            latency: '180ms',
            lastCheck: '30 sec ago',
            details: 'Rate limit: 15,000/min, Used: 8,234/min'
        },
        {
            name: 'Razorpay Gateway',
            status: 'operational',
            uptime: '99.99%',
            latency: '95ms',
            lastCheck: '30 sec ago',
            details: 'Payment success rate: 99.2%'
        },
    ];

    const systemMetrics = [
        { label: 'CPU Usage', value: '42%', max: 100, color: 'blue' },
        { label: 'Memory Usage', value: '68%', max: 100, color: 'purple' },
        { label: 'Disk Usage', value: '34%', max: 100, color: 'green' },
        { label: 'Network I/O', value: '2.4 Gbps', max: null, color: 'amber' },
    ];

    const recentIncidents = [
        { date: 'Jan 28, 2026', title: 'Meta API Degradation', duration: '45 min', status: 'resolved' },
        { date: 'Jan 15, 2026', title: 'Database Failover', duration: '5 min', status: 'resolved' },
        { date: 'Jan 10, 2026', title: 'Scheduled Maintenance', duration: '2 hours', status: 'completed' },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
                    <p className="text-gray-500">Monitor infrastructure and service status</p>
                </div>
                <button
                    onClick={handleRefresh}
                    className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${refreshing ? 'opacity-75' : ''}`}
                    disabled={refreshing}
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Refreshing...' : 'Refresh Status'}
                </button>
            </div>

            {/* Overall Status */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-4">
                    <CheckCircle className="w-12 h-12" />
                    <div>
                        <h2 className="text-2xl font-bold">All Systems Operational</h2>
                        <p className="text-green-100">7 of 8 services running normally • 1 degraded</p>
                    </div>
                </div>
            </div>

            {/* System Metrics */}
            <div className="grid grid-cols-4 gap-6">
                {systemMetrics.map((metric, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
                        <p className="text-sm text-gray-500 mb-2">{metric.label}</p>
                        <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                        {metric.max && (
                            <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full bg-${metric.color}-500 rounded-full`}
                                    style={{ width: metric.value }}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Services Status */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">Service Status</h2>
                </div>
                <table className="w-full">
                    <thead>
                        <tr className="text-left text-xs text-gray-500 uppercase bg-gray-50">
                            <th className="px-6 py-4">Service</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Uptime</th>
                            <th className="px-6 py-4">Latency</th>
                            <th className="px-6 py-4">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {services.map((service, i) => (
                            <tr key={i} className="text-sm">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${service.name.includes('Database') ? 'bg-purple-100' :
                                                service.name.includes('Redis') ? 'bg-red-100' :
                                                    service.name.includes('API') ? 'bg-blue-100' :
                                                        'bg-gray-100'
                                            }`}>
                                            {service.name.includes('Database') ? <Database className="w-4 h-4 text-purple-600" /> :
                                                service.name.includes('Redis') ? <Zap className="w-4 h-4 text-red-600" /> :
                                                    service.name.includes('API') ? <Globe className="w-4 h-4 text-blue-600" /> :
                                                        <Server className="w-4 h-4 text-gray-600" />}
                                        </div>
                                        <span className="font-medium text-gray-900">{service.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${service.status === 'operational' ? 'bg-green-100 text-green-700' :
                                            service.status === 'degraded' ? 'bg-amber-100 text-amber-700' :
                                                'bg-red-100 text-red-700'
                                        }`}>
                                        {service.status === 'operational' ? <CheckCircle className="w-3 h-3" /> :
                                            service.status === 'degraded' ? <AlertTriangle className="w-3 h-3" /> :
                                                <XCircle className="w-3 h-3" />}
                                        {service.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{service.uptime}</td>
                                <td className="px-6 py-4 text-gray-600">{service.latency}</td>
                                <td className="px-6 py-4 text-xs text-gray-500">{service.details}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Recent Incidents */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Incidents</h2>
                <div className="space-y-4">
                    {recentIncidents.map((incident, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className="text-sm text-gray-500">{incident.date}</div>
                                <div className="font-medium text-gray-900">{incident.title}</div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-500">{incident.duration}</span>
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                    {incident.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
