'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import {
    MessageSquare, Users2, Mail, BarChart3,
    ArrowUpRight, ArrowDownLeft
} from 'lucide-react';

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [recentMsgs, setRecentMsgs] = useState<any[]>([]);
    const [recentCampaigns, setRecentCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                fetchAnalytics(payload.tenantId);
            } catch (e) { }
        }
    }, []);

    const fetchAnalytics = async (tenantId: string) => {
        try {
            const res = await api.get(`/analytics/overview?tenantId=${tenantId}`);
            setStats(res.data.stats);
            setRecentMsgs(res.data.recentMessages);
            setRecentCampaigns(res.data.recentCampaigns);
        } catch (error) {
            console.error('Failed to load analytics', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading dashboard...</div>;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h2>
                <p className="text-gray-500">Overview of your messaging performance.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Contacts"
                    value={stats?.totalContacts || 0}
                    icon={Users2}
                    color="text-blue-600"
                    bg="bg-blue-50"
                />
                <StatCard
                    title="Messages Sent"
                    value={stats?.totalSent || 0}
                    icon={ArrowUpRight}
                    color="text-green-600"
                    bg="bg-green-50"
                />
                <StatCard
                    title="Messages Received"
                    value={stats?.totalReceived || 0}
                    icon={ArrowDownLeft}
                    color="text-purple-600"
                    bg="bg-purple-50"
                />
                <StatCard
                    title="Active Campaigns"
                    value={stats?.activeCampaigns || 0}
                    icon={BarChart3}
                    color="text-orange-600"
                    bg="bg-orange-50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <h3 className="font-bold text-gray-900 mb-4">Recent Messages</h3>
                    <div className="space-y-4">
                        {recentMsgs.length === 0 ? (
                            <p className="text-gray-500 text-sm">No recent messages.</p>
                        ) : (
                            recentMsgs.map((msg) => (
                                <div key={msg.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.direction === 'in' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
                                            {msg.direction === 'in' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{msg.contactName}</p>
                                            <p className="text-xs text-gray-500 capitalize">{msg.status}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {new Date(msg.createdAt).toLocaleTimeString()}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Campaigns */}
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <h3 className="font-bold text-gray-900 mb-4">Recent Campaigns</h3>
                    <div className="space-y-4">
                        {recentCampaigns.length === 0 ? (
                            <p className="text-gray-500 text-sm">No campaigns run yet.</p>
                        ) : (
                            recentCampaigns.map((camp) => (
                                <div key={camp.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{camp.name}</p>
                                        <div className="flex gap-2 text-xs mt-1">
                                            <span className="text-gray-500">Sent: {camp.sentCount}</span>
                                            <span className="text-gray-500">Failed: {camp.failedCount}</span>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${camp.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            camp.status === 'sending' ? 'bg-blue-100 text-blue-700' :
                                                'bg-gray-100 text-gray-500'
                                        }`}>
                                        {camp.status}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color, bg }: any) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg ${bg} ${color} flex items-center justify-center`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
}
