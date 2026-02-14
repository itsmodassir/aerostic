'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Gift, Share2, Users, CreditCard, Copy, ExternalLink, CheckCircle2, Clock } from 'lucide-react';
import { useParams } from 'next/navigation';

interface Referral {
    id: string;
    code: string;
    status: string;
    rewardStatus: string;
    rewardAmount: number;
    referrer: { name: string };
    referee?: { name: string };
    createdAt: string;
}

export default function ReferralsPage() {
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const params = useParams();

    const referralStats = {
        total: referrals.length,
        pending: referrals.filter(r => r.status === 'PENDING').length,
        earned: referrals.reduce((acc, r) => acc + (r.rewardStatus === 'PAID' ? Number(r.rewardAmount) : 0), 0),
        potential: referrals.reduce((acc, r) => acc + (r.rewardStatus === 'UNPAID' ? Number(r.rewardAmount) : 0), 0),
    };

    useEffect(() => {
        const fetchReferrals = async () => {
            const workspaceSlug = params.workspaceId as string;
            if (!workspaceSlug) return;

            try {
                const res = await api.get('/auth/workspaces');
                const activeMembership = res.data.find((m: any) => m.tenant?.slug === workspaceSlug);

                if (activeMembership?.tenant?.id) {
                    const tid = activeMembership.tenant.id;
                    const referralsRes = await api.get(`/referrals?tenantId=${tid}`);
                    setReferrals(referralsRes.data);
                }
            } catch (e) {
                console.error('Failed to fetch referrals', e);
            } finally {
                setLoading(false);
            }
        };
        fetchReferrals();
    }, [params.workspaceId]);

    const copyCode = () => {
        navigator.clipboard.writeText('AERO-REF-2026');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Referral Program</h1>
                    <p className="text-sm text-gray-500">Invite friends and earn rewards for every successful signup.</p>
                </div>
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Share2 size={18} />
                    Invite Friends
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Referrals', value: referralStats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Pending', value: referralStats.pending, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                    { label: 'Rewards Earned', value: `$${referralStats.earned}`, icon: Gift, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Potential Rewards', value: `$${referralStats.potential}`, icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-xl border shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-500">{stat.label}</span>
                            <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Referral Code Card */}
                <div className="lg:col-span-1 bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-xl text-white shadow-lg h-fit">
                    <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
                        Your Referral Code <Gift size={20} />
                    </h2>
                    <p className="text-blue-100 text-sm mb-6">Share this code with your network. They get 10% off, and you get $50 credit.</p>

                    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg flex items-center justify-between border border-white/20">
                        <code className="text-xl font-mono font-bold">AERO-REF-2026</code>
                        <button onClick={copyCode} className="p-2 hover:bg-white/20 rounded-md transition-colors">
                            {copied ? <CheckCircle2 size={20} className="text-green-400" /> : <Copy size={20} />}
                        </button>
                    </div>

                    <div className="mt-8 space-y-4">
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold">1</div>
                            <span>Share your unique link</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold">2</div>
                            <span>They sign up for a plan</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold">3</div>
                            <span>You earn rewards</span>
                        </div>
                    </div>
                </div>

                {/* History Table */}
                <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm overflow-hidden">
                    <div className="p-5 border-b bg-gray-50/50 flex items-center justify-between">
                        <h2 className="font-bold text-gray-900">Referral History</h2>
                        <button className="text-sm text-blue-600 hover:underline flex items-center gap-1">View All <ExternalLink size={14} /></button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white border-b text-xs uppercase text-gray-500">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">User</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold">Reward</th>
                                    <th className="px-6 py-4 font-semibold">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {loading ? (
                                    <tr><td colSpan={4} className="p-12 text-center text-gray-500">Loading...</td></tr>
                                ) : referrals.length === 0 ? (
                                    <tr><td colSpan={4} className="p-12 text-center text-gray-400">No referrals yet. Start sharing your code!</td></tr>
                                ) : (
                                    referrals.map((ref) => (
                                        <tr key={ref.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-900">{ref.referee?.name || 'In Progress'}</div>
                                                <div className="text-xs text-gray-500">{ref.code}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${ref.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                        ref.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {ref.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-900">${ref.rewardAmount}</div>
                                                <div className={`text-[10px] font-medium ${ref.rewardStatus === 'PAID' ? 'text-green-600' : 'text-gray-400'}`}>
                                                    {ref.rewardStatus}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(ref.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
