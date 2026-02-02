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
                            stats?.map((s: any, i: number) => (
                                <tr key={i} className="text-sm">
                                    <td className="px-6 py-4 font-medium flex items-center gap-2">
                                        <Server className="w-4 h-4 text-gray-500" />
                                        {s.service}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                                            {s.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{s.uptime}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

