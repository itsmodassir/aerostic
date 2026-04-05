'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Bell, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function AdminAlertsPage() {
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/v1/admin/platform/alerts`, {
                credentials: 'include'
            });
            if (!res.ok) {
                setAlerts([]);
                return;
            }
            const data = await res.json();
            setAlerts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch alerts', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Alerts & Notifications</h1>
                    <p className="text-gray-500">System generated alerts</p>
                </div>
            </div>

            {/* Alerts List */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">Active Alerts</h2>
                </div>
                <div className="divide-y divide-gray-50">
                    {loading ? (
                        <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" /></div>
                    ) : alerts.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                            <CheckCircle className="w-12 h-12 text-green-500 mb-2" />
                            <p>No active alerts. System is healthy.</p>
                        </div>
                    ) : (
                        alerts.map((alert) => (
                            <div key={alert.id} className="px-6 py-4 bg-red-50/10">
                                <div className="flex items-start gap-4">
                                    <div className={`p-2 rounded-lg ${alert.type === 'critical' ? 'bg-red-100' : 'bg-amber-100'}`}>
                                        {alert.type === 'critical' ? <XCircle className="w-5 h-5 text-red-600" /> : <AlertTriangle className="w-5 h-5 text-amber-600" />}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900">{alert.title}</h3>
                                        <p className="text-sm text-gray-500 mt-1">{alert.description}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                            <span>{alert.source}</span>
                                            <span>•</span>
                                            <span>{alert.time}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

