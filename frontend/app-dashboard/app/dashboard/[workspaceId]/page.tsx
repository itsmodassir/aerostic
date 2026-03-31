"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
    LayoutDashboard, Code, Users, Settings, 
    Lock, RefreshCw, Zap, Plus
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
import api from '@/lib/api';

export default function DashboardPage() {
    const params = useParams();
    const workspaceId = resolveWorkspaceId(params?.workspaceId as string | string[] | undefined);
    
    // UI State
    const [activeTab, setActiveTab] = useState<'overview' | 'developer' | 'team' | 'settings'>('overview');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // Data State
    const [user, setUser] = useState<any>(null);
    const [membership, setMembership] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [recentMsgs, setRecentMsgs] = useState<any[]>([]);
    const [recentCampaigns, setRecentCampaigns] = useState<any[]>([]);
    const [userPlan, setUserPlan] = useState<'starter' | 'growth' | 'enterprise'>('starter');
    const [walletBalance, setWalletBalance] = useState(0);

    useEffect(() => {
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
            const [userRes, msgRes, campaignRes, walletRes] = await Promise.allSettled([
                api.get('/users/me'),
                api.get('/messages/recent'),
                api.get('/campaigns/recent'),
                api.get('/billing/wallet-balance')
            ]);

            if (userRes.status === 'fulfilled' && userRes.value.status === 200) {
                const userData = userRes.value.data;
                setUser(userData);
                const member = userData.memberships?.find((m: any) => m.workspaceId === workspaceId);
                setMembership(member);
                setUserPlan(normalizePlan(member?.planName || 'Starter'));
                try {
                    if (member?.tenantType === 'reseller') {
                        const res = await api.get('/admin/reseller-stats');
                        if (res.status === 200) setStats(res.data);
                    } else {
                        const res = await api.get('/analytics/overview');
                        if (res.status === 200) setStats(res.data);
                    }
                } catch { /* non-fatal */ }
            }

            if (msgRes.status === 'fulfilled' && msgRes.value.status === 200) setRecentMsgs(msgRes.value.data);
            if (campaignRes.status === 'fulfilled' && campaignRes.value.status === 200) setRecentCampaigns(campaignRes.value.data);
            if (walletRes.status === 'fulfilled' && walletRes.value.status === 200) {
                setWalletBalance(walletRes.value.data?.balance || 0);
            }
        } catch (error) {
            console.error('Dashboard Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchDashboardData();
        setRefreshing(false);
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

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
                <p className="text-xs font-semibold text-gray-400">Loading dashboard...</p>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'developer', label: 'Developer', icon: Code, locked: !planFeatures.apiAccess },
        { id: 'team', label: 'Team', icon: Users },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gray-50/30">
            {/* Compact Header */}
            <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4">
                <div className="max-w-[1400px] mx-auto">
                    {/* Top row: greeting + actions */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-100 shrink-0">
                                {user?.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{greeting}</p>
                                <h1 className="text-base font-black text-gray-900 tracking-tight leading-none truncate">
                                    {user?.name || 'Commander'} 
                                    <span className="ml-2 text-[10px] font-bold text-gray-400 hidden sm:inline">— {workspaceId?.slice(0, 8)}...</span>
                                </h1>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[9px] font-black text-emerald-700 uppercase tracking-wide">Operational</span>
                            </div>
                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 uppercase tracking-wide">
                                {planFeatures.name}
                            </span>
                            <div className="flex items-center gap-2 ml-auto sm:ml-0">
                                <button
                                    onClick={handleRefresh}
                                    disabled={refreshing}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-gray-100 shrink-0"
                                >
                                    <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                                </button>
                                <Link
                                    href={`/dashboard/${workspaceId}/campaigns`}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-black hover:bg-blue-700 transition-all shadow-sm shadow-blue-200 shrink-0 uppercase tracking-wider"
                                >
                                    <Plus size={12} strokeWidth={3} />
                                    New Campaign
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Tab Navigation — scrollable on mobile */}
                    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                        <div className="flex items-center gap-1 min-w-max pb-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={clsx(
                                        "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all shrink-0",
                                        activeTab === tab.id
                                            ? "bg-gray-900 text-white shadow-md shadow-gray-200 scale-[1.02]"
                                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-transparent"
                                    )}
                                >
                                    <tab.icon size={13} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                                    <span>{tab.label}</span>
                                    {tab.locked && <Lock size={10} className="opacity-50" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1400px] mx-auto px-6 py-6">
                {membership?.tenantType === 'reseller' && activeTab === 'overview' ? (
                    <PartnerDashboardView stats={stats} workspaceId={workspaceId} />
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
                                workspaceId={workspaceId}
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
