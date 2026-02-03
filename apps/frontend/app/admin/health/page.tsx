'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, RefreshCw, Loader2, Server, Database, Globe } from 'lucide-react';

export default function AdminHealthPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHealth();
    }, []);

    const fetchHealth = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/admin/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setStats(data.systemHealth || []);
        } catch (error) {
            console.error('Failed to fetch health', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
                    <p className="text-gray-500">Monitor infrastructure status</p>
                </div>
                <button onClick={fetchHealth} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            {/* Status Card */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-4">
                    <CheckCircle className="w-12 h-12" />
                    <div>
                        <h2 className="text-2xl font-bold">System Operational</h2>
                        <p className="text-green-100">Core services are running normally</p>
                    </div>
                </div>
            </div>

            {/* Service List */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="text-left text-xs text-gray-500 uppercase bg-gray-50">
                            <th className="px-6 py-4">Service</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Uptime</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan={3} className="text-center py-8"><Loader2 className="animate-spin w-6 h-6 mx-auto text-blue-600" /></td></tr>
                        ) : (
                            stats?.map((s: any, i: number) => {
                                const isOperational = s.status === 'operational';
                                const isWarning = s.status === 'not_configured';

                                return (
                                    <tr key={i} className="text-sm transition-colors hover:bg-gray-50/50">
                                        <td className="px-6 py-4 font-semibold flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${isOperational ? 'bg-blue-50 text-blue-600' :
                                                    isWarning ? 'bg-yellow-50 text-yellow-600' :
                                                        'bg-red-50 text-red-600'
                                                }`}>
                                                {s.service.includes('Database') ? <Database className="w-4 h-4" /> :
                                                    s.service.includes('API') ? <Globe className="w-4 h-4" /> :
                                                        <Server className="w-4 h-4" />}
                                            </div>
                                            {s.service}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize shadow-sm border ${isOperational ? 'bg-green-50 text-green-700 border-green-100' :
                                                    isWarning ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                                        'bg-red-50 text-red-700 border-red-100'
                                                }`}>
                                                {s.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-500">{s.uptime}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

