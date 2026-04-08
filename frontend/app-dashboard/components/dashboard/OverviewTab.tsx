"use client";

import React from 'react';
import Link from 'next/link';
import { 
    MessageSquare, Sparkles, CreditCard, Send, Users2, Bot, Zap, 
    FileText, Workflow, Target, CheckCircle, Eye, MousePointer, 
    TrendingUp, Activity, BarChart3, ChevronRight, Plus,
    ArrowUpRight, ArrowDownLeft, Lock, LayoutDashboard
} from 'lucide-react';
import { clsx } from 'clsx';

// ─── Compact Stat Card ────────────────────────────────────────────────────────
// ─── Compact Stat Card ────────────────────────────────────────────────────────
function StatCard({ title, value, icon: Icon, trend, trendUp, color }: any) {
    const colorMap: Record<string, string> = {
        blue: 'bg-blue-50/50 text-blue-600 border-blue-100/50 shadow-blue-100/20',
        emerald: 'bg-emerald-50/50 text-emerald-600 border-emerald-100/50 shadow-emerald-100/20',
        purple: 'bg-purple-50/50 text-purple-600 border-purple-100/50 shadow-purple-100/20',
        amber: 'bg-amber-50/50 text-amber-600 border-amber-100/50 shadow-amber-100/20',
        indigo: 'bg-indigo-50/50 text-indigo-600 border-indigo-100/50 shadow-indigo-100/20',
    };
    
    return (
        <div className="bg-white rounded-[24px] border border-gray-100 p-5 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full blur-3xl -mr-12 -mt-12 opacity-50 group-hover:bg-blue-50 transition-colors" />
            
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={clsx(
                    "w-10 h-10 rounded-xl flex items-center justify-center border-2 shadow-lg transition-transform group-hover:scale-110 duration-300", 
                    colorMap[color] || colorMap.blue
                )}>
                    <Icon size={18} strokeWidth={2.5} />
                </div>
                {trend && (
                    <div className={clsx(
                        "flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm",
                        trendUp === true ? "text-emerald-700 bg-emerald-50 border border-emerald-100" :
                        trendUp === false ? "text-red-700 bg-red-50 border border-red-100" : 
                        "text-gray-600 bg-gray-50 border border-gray-100"
                    )}>
                        {trendUp === true && <ArrowUpRight size={10} strokeWidth={3} />}
                        {trendUp === false && <ArrowDownLeft size={10} strokeWidth={3} />}
                        {trend}
                    </div>
                )}
            </div>
            
            <div className="relative z-10">
                <p className="text-3xl font-black text-gray-900 tracking-tighter leading-none mb-1.5 group-hover:text-blue-600 transition-colors">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{title}</p>
            </div>
        </div>
    );
}

// ─── Usage Bar ────────────────────────────────────────────────────────────────
function UsageBar({ label, used, limit, percent, color, icon: Icon, linkHref, linkLabel }: any) {
    const barColor: Record<string, string> = {
        blue: 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]',
        purple: 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]',
        indigo: 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]',
    };
    return (
        <div className="bg-white rounded-[24px] border border-gray-100 p-5 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={clsx(
                        "p-1.5 rounded-lg",
                        color === 'blue' ? 'bg-blue-50 text-blue-500' :
                        color === 'purple' ? 'bg-purple-50 text-purple-500' : 'bg-indigo-50 text-indigo-500'
                    )}>
                        <Icon size={14} strokeWidth={3} />
                    </div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
                </div>
                <span className="text-[10px] font-black text-gray-900 tracking-tight">
                    {used.toLocaleString()} <span className="text-gray-300">/</span> {limit > 0 ? limit.toLocaleString() : '∞'}
                </span>
            </div>
            <div className="w-full bg-gray-100/50 rounded-full h-2 mb-3 overflow-hidden">
                <div
                    className={clsx("h-2 rounded-full transition-all duration-700 ease-out", barColor[color] || barColor.blue)}
                    style={{ width: `${Math.max(2, percent)}%` }}
                />
            </div>
            <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-gray-400">{Math.round(100 - percent)}% available</span>
                {linkHref && (
                    <Link href={linkHref} className="text-[10px] font-black text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wider flex items-center gap-1 group">
                        {linkLabel} 
                        <ArrowUpRight size={10} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                )}
            </div>
        </div>
    );
}

// ─── Quick Action Button ──────────────────────────────────────────────────────
function QuickAction({ icon: Icon, label, href, color, disabled }: any) {
    const colorMap: Record<string, string> = {
        blue: 'bg-blue-600 shadow-blue-200',
        emerald: 'bg-emerald-500 shadow-emerald-200',
        purple: 'bg-violet-600 shadow-purple-200',
        amber: 'bg-amber-500 shadow-amber-200',
        indigo: 'bg-indigo-600 shadow-indigo-200',
        pink: 'bg-pink-600 shadow-pink-200',
        teal: 'bg-teal-500 shadow-teal-200',
    };
    return (
        <Link
            href={disabled ? '#' : href}
            className={clsx(
                "group flex flex-col items-center gap-2 p-3 bg-white rounded-[20px] border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300 text-center h-full",
                disabled && "opacity-40 pointer-events-none grayscale"
            )}
        >
            <div className={clsx(
                "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg transition-all duration-500 group-hover:rotate-12", 
                colorMap[color] || colorMap.blue
            )}>
                <Icon size={18} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black text-gray-400 group-hover:text-blue-600 uppercase tracking-wide transition-colors leading-tight truncate w-full">
                {label}
            </span>
        </Link>
    );
}

// ─── Message Row ──────────────────────────────────────────────────────────────
function MessageRow({ msg }: { msg: any }) {
    const statusColor: Record<string, string> = {
        read: 'text-blue-600 bg-blue-50 border-blue-100',
        delivered: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        sent: 'text-gray-500 bg-gray-50 border-gray-100',
        failed: 'text-red-500 bg-red-50 border-red-100',
    };
    return (
        <div className="flex items-center gap-4 py-3 px-4 hover:bg-gray-50/80 rounded-2xl transition-all group cursor-pointer border border-transparent hover:border-gray-100">
            <div className={clsx(
                "w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300",
                msg.direction === 'in' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
            )}>
                {msg.direction === 'in' ? <ArrowDownLeft size={16} strokeWidth={3} /> : <ArrowUpRight size={16} strokeWidth={3} />}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[13px] font-black text-gray-900 truncate tracking-tight">{msg.contactName || 'Unknown Contact'}</p>
                <p className="text-[11px] text-gray-400 truncate font-medium">
                    {typeof msg.content?.body === 'string' 
                        ? msg.content.body 
                        : msg.content?.text || '—'}
                </p>
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className={clsx(
                    "text-[9px] font-black uppercase px-2 py-0.5 rounded-full border shadow-sm", 
                    statusColor[msg.status] || statusColor.sent
                )}>
                    {msg.status}
                </span>
                <span className="text-[10px] font-bold text-gray-300 tabular-nums">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        </div>
    );
}

// ─── Campaign Row ─────────────────────────────────────────────────────────────
function CampaignRow({ campaign }: { campaign: any }) {
    const statusColor: Record<string, string> = {
        sent: 'text-emerald-600 bg-emerald-50 border-emerald-200',
        sending: 'text-blue-600 bg-blue-50 border-blue-200',
        draft: 'text-amber-600 bg-amber-50 border-amber-200',
        failed: 'text-red-500 bg-red-50 border-red-200',
    };
    return (
        <div className="flex items-center gap-4 py-3 px-4 hover:bg-gray-50/80 rounded-2xl transition-all border border-transparent hover:border-gray-100 group">
            <div className="w-10 h-10 rounded-[14px] bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100 shadow-sm group-hover:rotate-6 transition-transform">
                <Send size={16} className="text-indigo-600" strokeWidth={3} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[13px] font-black text-gray-900 truncate tracking-tight">{campaign.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                    <Users2 size={10} className="text-gray-300" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{campaign.totalContacts || 0} Recipients</p>
                </div>
            </div>
            <span className={clsx(
                "text-[9px] font-black uppercase px-2 py-1 rounded-lg border shadow-sm", 
                statusColor[campaign.status] || statusColor.draft
            )}>
                {campaign.status}
            </span>
        </div>
    );
}

// ─── Feature Status Badge ─────────────────────────────────────────────────────
function FeatureBadge({ label, active }: { label: string; active: boolean }) {
    return (
        <div className={clsx(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide border",
            active
                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                : "bg-gray-50 text-gray-400 border-gray-100"
        )}>
            <div className={clsx("w-1.5 h-1.5 rounded-full", active ? "bg-emerald-500" : "bg-gray-300")} />
            {label}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function OverviewTab({ 
    stats, planFeatures, usagePercent, aiUsagePercent, 
    messagesUsed, aiCreditsUsed, recentMsgs, recentCampaigns, 
    userPlan, walletBalance, membership, workspaceId
}: any) {
    const base = workspaceId ? `/dashboard/${workspaceId}` : '';

    return (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Row 1: Core Stats — 4 compact cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard title="Total Contacts" value={stats?.totalContacts || 0} icon={Users2} trend="+12.4%" trendUp={true} color="blue" />
                <StatCard title="Messages Sent" value={stats?.totalSent || 0} icon={ArrowUpRight} trend="+28.2%" trendUp={true} color="emerald" />
                <StatCard title="Received" value={stats?.totalReceived || 0} icon={ArrowDownLeft} trend="+15.8%" trendUp={true} color="purple" />
                <StatCard title="Active Campaigns" value={stats?.activeCampaigns || 0} icon={Target} trend={`${stats?.activeCampaigns || 0} live`} trendUp={null} color="amber" />
            </div>

            {/* Row 2: Usage Bars + Wallet */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <UsageBar
                    label="Messages"
                    used={messagesUsed}
                    limit={planFeatures.messagesLimit}
                    percent={usagePercent}
                    color="blue"
                    icon={MessageSquare}
                    linkHref={`${base}/billing`}
                    linkLabel="Upgrade"
                />
                <UsageBar
                    label="AI Credits"
                    used={aiCreditsUsed}
                    limit={planFeatures.aiCredits}
                    percent={aiUsagePercent}
                    color="purple"
                    icon={Sparkles}
                    linkHref={`${base}/billing`}
                    linkLabel="Boost"
                />
                {/* Wallet Card */}
                <Link href={`${base}/wallet`} className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl p-4 shadow-sm hover:shadow-lg hover:shadow-indigo-200 transition-all group">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
                            <CreditCard size={15} className="text-white" strokeWidth={2.5} />
                        </div>
                        <ArrowUpRight size={14} className="text-white/50 group-hover:text-white transition-colors" />
                    </div>
                    <p className="text-xl font-black text-white tracking-tight leading-none mb-1">
                        ₹{walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px] font-semibold text-white/50 uppercase tracking-widest">Wallet Balance</p>
                    <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/10">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-[9px] font-black text-white/50 uppercase tracking-wide">Auto-refill Active</span>
                    </div>
                </Link>
            </div>

            {/* Row 3: Quick Actions */}
            <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Quick Actions</p>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    <QuickAction icon={Send} label="Campaigns" href="/campaigns" color="blue" />
                    <QuickAction icon={Users2} label="Contacts" href="/contacts" color="emerald" />
                    <QuickAction icon={Bot} label="AI Agent" href="/ai-agents" color="purple" disabled={planFeatures.aiAgents <= 0} />
                    <QuickAction icon={Zap} label="Automate" href="/automation" color="amber" />
                    <QuickAction icon={CreditCard} label="Wallet" href={`${base}/wallet`} color="indigo" />
                    <QuickAction icon={FileText} label="Templates" href="/templates" color="pink" />
                    <QuickAction icon={Workflow} label="Flows" href="/settings/whatsapp/flows" color="teal" />
                </div>
            </div>

            {/* Row 4: Activity Feed + Campaigns + Agents */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                
                {/* Recent Messages */}
                <div className="lg:col-span-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                        <div>
                            <h3 className="text-xs font-black text-gray-900">Recent Messages</h3>
                            <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">Live feed</p>
                        </div>
                        <Link href="/inbox" className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                            <ChevronRight size={14} />
                        </Link>
                    </div>
                    <div className="p-2 max-h-[220px] overflow-y-auto scrollbar-none">
                        {recentMsgs.length === 0 ? (
                            <div className="flex flex-col items-center py-8 text-center">
                                <Activity size={24} className="text-gray-200 mb-2" />
                                <p className="text-[10px] text-gray-300 font-semibold uppercase tracking-widest">No messages yet</p>
                            </div>
                        ) : (
                            recentMsgs.slice(0, 6).map((msg: any, i: number) => (
                                <MessageRow key={i} msg={msg} />
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Campaigns */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                        <div>
                            <h3 className="text-xs font-black text-gray-900">Campaigns</h3>
                            <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">Recent broadcasts</p>
                        </div>
                        <Link href="/campaigns" className="flex items-center gap-1 text-[10px] font-black text-blue-600 hover:underline">
                            <Plus size={12} /> New
                        </Link>
                    </div>
                    <div className="p-2 max-h-[220px] overflow-y-auto scrollbar-none">
                        {recentCampaigns.length === 0 ? (
                            <div className="flex flex-col items-center py-8 text-center">
                                <Send size={24} className="text-gray-200 mb-2" />
                                <p className="text-[10px] text-gray-300 font-semibold uppercase tracking-widest">No campaigns yet</p>
                                <Link href="/campaigns" className="mt-3 text-[10px] font-black text-blue-600 hover:underline">Create one →</Link>
                            </div>
                        ) : (
                            recentCampaigns.slice(0, 5).map((c: any, i: number) => (
                                <CampaignRow key={i} campaign={c} />
                            ))
                        )}
                    </div>
                </div>

                {/* Features + Metrics panel */}
                <div className="space-y-3">
                    {/* Metrics row */}
                    {planFeatures.advancedAnalytics ? (
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Performance</p>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Deliverability', value: '98.5%', icon: CheckCircle, color: 'text-emerald-500' },
                                    { label: 'Engagement', value: '76.2%', icon: Eye, color: 'text-blue-500' },
                                    { label: 'Conversion', value: '34.8%', icon: MousePointer, color: 'text-purple-500' },
                                    { label: 'Growth', value: '+12.4%', icon: TrendingUp, color: 'text-amber-500' },
                                ].map((m, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <m.icon size={13} className={m.color} strokeWidth={2.5} />
                                        <div>
                                            <p className="text-sm font-black text-gray-900 leading-none">{m.value}</p>
                                            <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">{m.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 border-dashed p-4 text-center">
                            <Lock size={16} className="text-gray-300 mx-auto mb-2" />
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Analytics Locked</p>
                            <p className="text-[9px] text-gray-400 mt-1 mb-2">Upgrade to Growth for advanced metrics</p>
                            <Link href={`${base}/billing`} className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-wide">Upgrade Plan →</Link>
                        </div>
                    )}

                    {/* Platform status */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Platform Status</p>
                        <div className="flex flex-wrap gap-2">
                            <FeatureBadge label="API" active={planFeatures.apiAccess} />
                            <FeatureBadge label="Webhooks" active={planFeatures.webhooks} />
                            <FeatureBadge label="Flows" active={true} />
                            <FeatureBadge label="WhiteLabel" active={planFeatures.whiteLabel} />
                        </div>
                    </div>

                    {/* AI Agents mini panel */}
                    <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-xl p-4 text-white shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h4 className="text-xs font-black">AI Agents</h4>
                                <p className="text-[9px] text-white/40 font-semibold uppercase tracking-wide">Autonomous stacks</p>
                            </div>
                            <Link href="/ai-agents" className="p-1 bg-white/5 text-white/40 hover:bg-white/10 hover:text-white rounded-lg transition-all">
                                <Plus size={13} />
                            </Link>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xl font-black tracking-tighter">
                                    {stats?.totalAgents || 0}
                                    <span className="text-white/30 text-sm"> / {planFeatures.aiAgents === -1 ? '∞' : planFeatures.aiAgents}</span>
                                </p>
                                <p className="text-[9px] text-white/40 uppercase tracking-widest font-semibold">Active agents</p>
                            </div>
                            <Sparkles size={20} className="text-purple-400 animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
