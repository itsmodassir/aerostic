"use client";

import React from 'react';
import Link from 'next/link';
import { 
    MessageSquare, Sparkles, CreditCard, ArrowRight,
    Send, Users2, Bot, Zap, FileText, Workflow, 
    Target, CheckCircle, Eye, MousePointer, TrendingUp,
    Activity, BarChart3, ChevronRight, Plus,
    ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import { clsx } from 'clsx';
import { 
    StatCard, MetricCard, LockedFeatureCard, 
    AIAgentCardPremium, MessageRowPremium, 
    StatusBadge
} from './DashboardComponents';

export default function OverviewTab({ 
    stats, planFeatures, usagePercent, aiUsagePercent, 
    messagesUsed, aiCreditsUsed, recentMsgs, recentCampaigns, 
    userPlan, walletBalance, membership 
}: any) {
    return (
        <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700">
            {/* Usage Metrix */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Messages Hub */}
                <div className="bg-gradient-to-br from-[#1E293B] to-black rounded-[48px] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full -mr-32 -mt-32 opacity-20 blur-[80px]" />
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="w-14 h-14 bg-white/5 rounded-[22px] flex items-center justify-center border border-white/10 group-hover:bg-blue-600 transition-all">
                                    <MessageSquare size={28} className="text-blue-500 group-hover:text-white transition-colors" />
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-emerald-400 px-3 py-1 bg-emerald-400/10 rounded-full">
                                    {Math.floor(100 - usagePercent)}% Available
                                </div>
                            </div>
                            <div>
                                <h3 className="text-4xl sm:text-5xl font-black tracking-tighter leading-none mb-3">
                                    {messagesUsed.toLocaleString()} <span className="text-lg text-white/30 tracking-tight">Handshakes</span>
                                </h3>
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Transmission Quota consumed</p>
                            </div>
                        </div>
                        <div className="mt-12">
                            <div className="w-full bg-white/5 rounded-full h-4 p-1 border border-white/5">
                                <div className="h-full bg-blue-500 rounded-full shadow-lg shadow-blue-500/50" style={{ width: `${usagePercent}%` }} />
                            </div>
                            <div className="flex justify-between items-center mt-4">
                                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.1em]">License Cap: {planFeatures.messagesLimit > 0 ? planFeatures.messagesLimit.toLocaleString() : 'Unlimited'}</p>
                                <Link href="/billing" className="text-[9px] font-black text-blue-400 uppercase tracking-widest hover:text-white transition-colors">Scale Capacity →</Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Credits Hub */}
                <div className="bg-white rounded-[48px] p-8 md:p-10 border-2 border-gray-50 shadow-2xl shadow-gray-200/40 relative overflow-hidden group">
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-50 rounded-full -ml-32 -mb-32 opacity-60 blur-[60px]" />
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="w-14 h-14 bg-purple-50 rounded-[22px] flex items-center justify-center border border-purple-100 group-hover:bg-purple-600 transition-all">
                                    <Sparkles size={28} className="text-purple-600 group-hover:text-white transition-colors" />
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-purple-600 px-3 py-1 bg-purple-50 rounded-full border border-purple-100">
                                    Autonomous Engine
                                </div>
                            </div>
                            <div>
                                <h3 className="text-4xl sm:text-5xl font-black tracking-tighter leading-none mb-3 text-gray-900">
                                    {aiCreditsUsed.toLocaleString()} <span className="text-lg text-gray-300 tracking-tight">Units</span>
                                </h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Compute Resource Allocation</p>
                            </div>
                        </div>
                        <div className="mt-12">
                            <div className="w-full bg-gray-50 rounded-full h-4 p-1 border border-gray-100">
                                <div className="h-full bg-purple-600 rounded-full shadow-lg shadow-purple-200" style={{ width: `${aiUsagePercent}%` }} />
                            </div>
                            <div className="flex justify-between items-center mt-4">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.1em]">Tier Limit: {planFeatures.aiCredits > 0 ? planFeatures.aiCredits.toLocaleString() : 'Unlimited'}</p>
                                <button className="text-[9px] font-black text-purple-600 uppercase tracking-widest hover:text-black transition-colors">Boost Compute →</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Wallet Balance Hub */}
                <Link href="/wallet" className="group">
                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-[48px] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden h-full flex flex-col justify-between hover:shadow-indigo-500/20 hover:-translate-y-1 transition-all">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32 opacity-10 blur-[60px] group-hover:scale-125 transition-transform duration-1000" />
                        
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="w-14 h-14 bg-white/10 rounded-[22px] flex items-center justify-center border border-white/10 group-hover:bg-white group-hover:text-indigo-600 transition-all">
                                    <CreditCard size={28} strokeWidth={2.5} />
                                </div>
                                <div className="p-2 bg-white/10 rounded-xl group-hover:bg-white group-hover:text-indigo-600 transition-all">
                                    <ArrowUpRight size={20} />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-4xl sm:text-5xl font-black tracking-tighter leading-none mb-3">
                                    ₹{walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </h3>
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Operational Liquidity Available</p>
                            </div>
                        </div>
                        
                        <div className="mt-12 pt-8 border-t border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Auto-Refill Security Active</span>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Quick Command Matrix */}
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                {[
                    { icon: Send, label: 'Broadcast', href: '/campaigns', color: 'bg-blue-600 shadow-blue-500/20' },
                    { icon: Users2, label: 'Contact Lab', href: '/contacts', color: 'bg-emerald-600 shadow-emerald-500/20' },
                    { icon: Bot, label: 'AI Synthesis', href: '/ai-agent', color: 'bg-purple-600 shadow-purple-500/20', available: planFeatures.aiAgents > 0 },
                    { icon: Zap, label: 'Automate', href: '/automation', color: 'bg-amber-600 shadow-amber-500/20' },
                    { icon: CreditCard, label: 'Asset Ops', href: '/wallet', color: 'bg-indigo-600 shadow-indigo-500/20' },
                    { icon: FileText, label: 'Protocol Tpl', href: '/templates', color: 'bg-pink-600 shadow-pink-500/20' },
                    { icon: Workflow, label: 'Nexus Flows', href: '/settings/whatsapp/flows', color: 'bg-teal-600 shadow-teal-500/20' },
                ].map((action, i) => (
                    <Link 
                        key={i} 
                        href={action.href} 
                        className={clsx(
                            "group p-6 bg-white border-2 border-gray-50 rounded-[30px] hover:border-black transition-all shadow-xl shadow-gray-200/30 flex flex-col items-center justify-center text-center gap-4 active:scale-95",
                            !action.available && action.available !== undefined && "opacity-40 grayscale pointer-events-none"
                        )}
                    >
                        <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl transition-transform group-hover:scale-110", action.color)}>
                            <action.icon size={24} strokeWidth={2.5} />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors">{action.label}</span>
                    </Link>
                ))}
            </div>

            {/* Core Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Repository" value={stats?.totalContacts || 0} icon={Users2} trend="+12.4%" trendUp={true} color="blue" />
                <StatCard title="Outbound Flux" value={stats?.totalSent || 0} icon={ArrowUpRight} trend="+28.2%" trendUp={true} color="emerald" />
                <StatCard title="Inbound Flow" value={stats?.totalReceived || 0} icon={ArrowDownLeft} trend="+15.8%" trendUp={true} color="purple" />
                <StatCard title="Active Protocols" value={stats?.activeCampaigns || 0} icon={Target} trend="3 Live" trendUp={null} color="amber" />
            </div>

            {/* Telemetry Visuals */}
            {planFeatures.advancedAnalytics ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard title="Deliverability" value="98.5%" icon={CheckCircle} color="emerald" />
                    <MetricCard title="Engagement" value="76.2%" icon={Eye} color="blue" />
                    <MetricCard title="Conversion" value="34.8%" icon={MousePointer} color="purple" />
                    <MetricCard title="Yield Velocity" value="12.4%" icon={TrendingUp} color="amber" />
                </div>
            ) : (
                <LockedFeatureCard
                    title="Advanced Analytics"
                    description="Upgrade to GROWTH LICENSE to decrypt delivery performance, conversion tracking, and behavior analytics."
                    icon={BarChart3}
                    plan="Growth"
                />
            )}

            {/* Session Activity Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Live Stacks */}
                <div className="lg:col-span-2 bg-white rounded-[48px] border-2 border-gray-50 shadow-2xl shadow-gray-200/40 relative overflow-hidden h-full">
                    <div className="p-8 md:p-10 border-b-2 border-gray-50 flex items-center justify-between">
                         <div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Real-Time Packets</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Live individual message flow</p>
                        </div>
                        <Link href="/message" className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90"><ChevronRight size={24} /></Link>
                    </div>
                    <div className="divide-y-2 divide-gray-50 max-h-[520px] overflow-y-auto scrollbar-none">
                        {recentMsgs.length === 0 ? (
                            <div className="p-24 text-center">
                                <Activity size={48} className="text-gray-100 mx-auto mb-6" />
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">No Transmission Detected</p>
                            </div>
                        ) : (
                            recentMsgs.slice(0, 8).map((msg: any, i: number) => (
                                <MessageRowPremium key={i} msg={msg} />
                            ))
                        )}
                    </div>
                </div>

                {/* AI Agents Command Center */}
                <div className="bg-[#0F172A] rounded-[48px] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden h-full">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600 rounded-full blur-[80px] -mr-20 -mt-20 opacity-30" />
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-2xl font-black tracking-tight">Agent Command</h3>
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1">Autonomous Compute Stacks</p>
                            </div>
                            <Link href="/ai-agent" className="p-3 bg-white/5 text-white/40 rounded-xl hover:bg-white hover:text-black transition-all active:scale-90"><Plus size={20} /></Link>
                        </div>
                        
                        <div className="space-y-4 flex-1">
                            <AIAgentCardPremium name="Synapse-X" status="Active" capacity={85} conversations={1234} />
                            <AIAgentCardPremium name="Delta-9" status="Standby" capacity={42} conversations={567} dimmed />
                            
                            {planFeatures.aiAgents <= 1 && (
                                <div className="mt-8 p-10 bg-white/5 border-2 border-dashed border-white/10 rounded-[32px] text-center group cursor-pointer hover:bg-white/10 transition-all">
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white/20 group-hover:scale-110 transition-transform"><Plus size={24} /></div>
                                    <h4 className="text-xs font-black uppercase tracking-widest text-white/40">Spawn Agent Instance</h4>
                                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-tight mt-2 italic">Requires Compute Upgrade</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-12 pt-8 border-t border-white/5">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex flex-col">
                                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Total Capacity</p>
                                    <p className="text-xl font-black tracking-tighter">{stats?.totalAgents || 0} / {planFeatures.aiAgents === -1 ? '∞' : planFeatures.aiAgents}</p>
                                </div>
                                <Sparkles size={24} className="text-purple-500 animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Global Feature Matrix */}
            <div className="flex flex-col md:flex-row items-center gap-6 p-10 bg-gray-50 rounded-[48px] border-2 border-gray-100">
                <div className="p-6 bg-white rounded-[32px] shadow-sm border-2 border-gray-50 shrink-0">
                    <Workflow size={32} className="text-gray-400" />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">Protocol Ecosystem</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Status of integrated sub-systems and developer tools</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto">
                    <StatusBadge label="API 3.0" active={planFeatures.apiAccess} />
                    <StatusBadge label="Webhooks" active={planFeatures.webhooks} />
                    <StatusBadge label="Flows" active={true} />
                    <StatusBadge label="WhiteLabel" active={planFeatures.whiteLabel} />
                </div>
            </div>
        </div>
    );
}
