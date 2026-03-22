"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
    LayoutDashboard, Code, Users, Settings, 
    Lock, Sparkles, UserPlus, Zap
} from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';

// Modular Components
import OverviewTab from '@/components/dashboard/OverviewTab';
import DeveloperTab from '@/components/dashboard/DeveloperTab';
import TeamTab from '@/components/dashboard/TeamTab';
import SettingsTab from '@/components/dashboard/SettingsTab';
import PartnerDashboardView from '@/components/dashboard/PartnerDashboardView';
import { resolveWorkspaceId } from '@/components/dashboard/DashboardComponents';

export default function DashboardPage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = resolveWorkspaceId(params?.workspaceId as string | string[] | undefined);
    
    // UI State
    const [activeTab, setActiveTab] = useState<'overview' | 'developer' | 'team' | 'settings'>('overview');
    const [loading, setLoading] = useState(true);
    
    // Data State
    const [user, setUser] = useState<any>(null);
    const [membership, setMembership] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [recentMsgs, setRecentMsgs] = useState<any[]>([]);
    const [recentCampaigns, setRecentCampaigns] = useState<any[]>([]);
    const [userPlan, setUserPlan] = useState<'starter' | 'growth' | 'enterprise'>('starter');
    const [walletBalance, setWalletBalance] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }
        fetchDashboardData();
    }, [workspaceId]);

    const normalizePlan = (planName: string) => {
        const name = planName?.toLowerCase() || '';
        if (name.includes('professional') || name.includes('growth')) return 'growth';
        if (name.includes('agency') || name.includes('enterprise')) return 'enterprise';
        return 'starter';
    };

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Parallel fetch for core data
            const [userRes, msgRes, campaignRes, walletRes] = await Promise.all([
                fetch('/api/v1/users/me', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
                fetch('/api/v1/messages/recent', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
                fetch('/api/v1/campaigns/recent', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
                fetch('/api/v1/billing/wallet-balance', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
            ]);

            if (userRes.ok) {
                const userData = await userRes.json();
                setUser(userData);
                const member = userData.memberships?.find((m: any) => m.workspaceId === workspaceId);
                setMembership(member);
                setUserPlan(normalizePlan(member?.planName || 'Starter'));

                // Fetch context-aware stats
                if (member?.tenantType === 'reseller') {
                    const res = await fetch('/api/v1/admin/reseller-stats', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
                    if (res.ok) setStats(await res.json());
                } else {
                    const res = await fetch('/api/v1/analytics/overview', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
                    if (res.ok) setStats(await res.json());
                }
            }

            if (msgRes.ok) setRecentMsgs(await msgRes.json());
            if (campaignRes.ok) setRecentCampaigns(await campaignRes.json());
            if (walletRes.ok) {
                const wData = await walletRes.json();
                setWalletBalance(wData.balance || 0);
            }

        } catch (error) {
            console.error('Fatal Telemetry Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const planFeatures = {
        name: userPlan.toUpperCase(),
        messagesLimit: userPlan === 'enterprise' ? -1 : userPlan === 'growth' ? 50000 : 5000,
        aiCredits: userPlan === 'enterprise' ? -1 : userPlan === 'growth' ? 10000 : 500,
        aiAgents: userPlan === 'enterprise' ? 10 : userPlan === 'growth' ? 3 : 1,
        apiAccess: userPlan !== 'starter',
        webhooks: userPlan === 'enterprise',
        advancedAnalytics: userPlan !== 'starter',
        whiteLabel: userPlan === 'enterprise',
        price: userPlan === 'enterprise' ? 14999 : userPlan === 'growth' ? 4999 : 1499
    };

    const usagePercent = Math.min(100, (stats?.totalSent || 0) / (planFeatures.messagesLimit > 0 ? planFeatures.messagesLimit : 1000000) * 100);
    const aiUsagePercent = Math.min(100, (stats?.aiCreditsUsed || 0) / (planFeatures.aiCredits > 0 ? planFeatures.aiCredits : 1000000) * 100);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white">
                <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 border-4 border-blue-50 rounded-full" />
                    <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Zap className="text-blue-600 animate-pulse" size={32} strokeWidth={3} />
                    </div>
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] animate-pulse">Initializing Nexus Protocol</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-24 overflow-x-hidden">
            {/* Header / Welcome Area */}
            <div className="max-w-[1600px] mx-auto px-6 md:px-12 pt-12 md:pt-20 mb-16">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
                                System Status: Operational
                            </span>
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">U</div>
                                ))}
                                <div className="w-8 h-8 rounded-full border-2 border-white bg-black flex items-center justify-center text-[10px] font-bold text-white">+2</div>
                            </div>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black text-gray-900 tracking-tighter leading-none">
                            Good Morning, <br />
                            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                {user?.name?.split(' ')[0] || 'Commander'}
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl font-bold text-gray-400 max-w-2xl leading-relaxed uppercase tracking-tighter">Your workspace is synchronized. Current throughput is peaking at <span className="text-black">1.2k req/s</span>.</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                         <button onClick={fetchDashboardData} className="p-5 bg-gray-50 text-gray-400 rounded-[28px] hover:bg-black hover:text-white transition-all active:scale-90 shadow-sm border-2 border-transparent">
                            <Zap size={28} />
                         </button>
                         <Link href="/settings/whatsapp" className="px-8 py-5 bg-blue-600 text-white rounded-[32px] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-black transition-all active:scale-95 shadow-2xl shadow-blue-100 flex items-center gap-3">
                            <Sparkles size={18} strokeWidth={3} />
                            Deploy New Protocol
                         </Link>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="mt-16 relative">
                     <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mask-fade-right">
                        {[
                            { id: 'overview', label: 'Primary Overview', icon: LayoutDashboard },
                            { id: 'developer', label: 'Developer Protocols', icon: Code, locked: !planFeatures.apiAccess },
                            { id: 'team', label: 'Team Command', icon: Users },
                            { id: 'settings', label: 'Global Config', icon: Settings },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={clsx(
                                    "px-8 py-5 rounded-[28px] flex items-center gap-4 transition-all whitespace-nowrap group shrink-0",
                                    activeTab === tab.id 
                                        ? "bg-black text-white shadow-2xl" 
                                        : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                                )}
                            >
                                <tab.icon size={20} strokeWidth={activeTab === tab.id ? 2.5 : 2} className={clsx("transition-transform", activeTab === tab.id && "scale-110")} />
                                <span className={clsx("text-sm font-black uppercase tracking-widest", activeTab === tab.id ? "opacity-100" : "opacity-60")}>
                                    {tab.label}
                                </span>
                                {tab.locked && (
                                    <Lock size={14} className="group-hover:text-blue-500 transition-colors" />
                                )}
                            </button>
                        ))}
                     </div>
                     <div className="absolute right-0 top-0 bottom-4 w-20 bg-gradient-to-l from-white to-transparent pointer-events-none" />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-[1600px] mx-auto px-6 md:px-12">
                {membership?.tenantType === 'reseller' && activeTab === 'overview' ? (
                    <PartnerDashboardView 
                        stats={stats} 
                        workspaceId={workspaceId}
                    />
                ) : (
                    <>
                        {activeTab === 'overview' && (
                            <OverviewTab
                                stats={stats}
                                planFeatures={planFeatures}
                                usagePercent={usagePercent}
                                aiUsagePercent={aiUsagePercent}
                                messagesUsed={stats?.totalSent || 0}
                                aiCreditsUsed={stats?.aiCreditsUsed || 0}
                                recentMsgs={recentMsgs}
                                recentCampaigns={recentCampaigns}
                                userPlan={userPlan}
                                walletBalance={walletBalance}
                                membership={membership}
                            />
                        )}
                        {activeTab === 'developer' && <DeveloperTab planFeatures={planFeatures} />}
                        {activeTab === 'team' && <TeamTab planFeatures={planFeatures} />}
                        {activeTab === 'settings' && <SettingsTab planFeatures={planFeatures} userPlan={userPlan} membership={membership} />}
                    </>
                )}
            </div>
        </div>
    );
}
