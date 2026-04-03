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
function StatCard({ title, value, icon: Icon, trend, trendUp, color }: any) {
    const colorMap: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    };
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md hover:border-gray-200 transition-all group">
            <div className="flex items-center justify-between mb-3">
                <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center border", colorMap[color] || colorMap.blue)}>
                    <Icon size={15} strokeWidth={2.5} />
                </div>
                {trend && (
                    <span className={clsx(
                        "text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full",
                        trendUp === true ? "text-emerald-600 bg-emerald-50" :
                        trendUp === false ? "text-red-500 bg-red-50" : "text-gray-500 bg-gray-50"
                    )}>
                        {trend}
                    </span>
                )}
            </div>
            <p className="text-2xl font-black text-gray-900 tracking-tighter leading-none mb-1">
                {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{title}</p>
        </div>
    );
}

// ─── Usage Bar ────────────────────────────────────────────────────────────────
function UsageBar({ label, used, limit, percent, color, icon: Icon, linkHref, linkLabel }: any) {
    const barColor: Record<string, string> = {
        blue: 'bg-blue-500',
        purple: 'bg-purple-500',
        indigo: 'bg-indigo-500',
    };
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Icon size={14} className={
                        color === 'blue' ? 'text-blue-500' :
                        color === 'purple' ? 'text-purple-500' : 'text-indigo-500'
                    } strokeWidth={2.5} />
                    <span className="text-xs font-bold text-gray-700">{label}</span>
                </div>
                <span className="text-[10px] font-black text-gray-400">{used.toLocaleString()} / {limit > 0 ? limit.toLocaleString() : '∞'}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                <div
                    className={clsx("h-1.5 rounded-full transition-all", barColor[color] || barColor.blue)}
                    style={{ width: `${Math.max(2, percent)}%` }}
                />
            </div>
            <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400">{Math.round(100 - percent)}% remaining</span>
                {linkHref && (
                    <Link href={linkHref} className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-wide">
                        {linkLabel} →
                    </Link>
                )}
            </div>
        </div>
    );
}

// ─── Quick Action Button ──────────────────────────────────────────────────────
function QuickAction({ icon: Icon, label, href, color, disabled }: any) {
    const colorMap: Record<string, string> = {
        blue: 'bg-blue-600',
        emerald: 'bg-emerald-500',
        purple: 'bg-violet-600',
        amber: 'bg-amber-500',
        indigo: 'bg-indigo-600',
        pink: 'bg-pink-600',
        teal: 'bg-teal-500',
    };
    return (
        <Link
            href={disabled ? '#' : href}
            className={clsx(
                "group flex flex-col items-center gap-1.5 p-2 sm:p-3 bg-white rounded-xl border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all text-center h-full",
                disabled && "opacity-40 pointer-events-none grayscale"
            )}
        >
            <div className={clsx("w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform", colorMap[color] || colorMap.blue)}>
                <Icon size={14} sm={16} strokeWidth={2.5} />
            </div>
            <span className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-tight sm:tracking-wide group-hover:text-gray-800 leading-tight truncate w-full">{label}</span>
        </Link>
    );
}

// ─── Message Row ──────────────────────────────────────────────────────────────
function MessageRow({ msg }: { msg: any }) {
    const statusColor: Record<string, string> = {
        read: 'text-blue-600 bg-blue-50',
        delivered: 'text-emerald-600 bg-emerald-50',
        sent: 'text-gray-500 bg-gray-50',
        failed: 'text-red-500 bg-red-50',
    };
    return (
        <div className="flex items-center gap-3 py-2.5 px-3 hover:bg-gray-50 rounded-lg transition-colors group">
            <div className={clsx(
                "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                msg.direction === 'in' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
            )}>
                {msg.direction === 'in' ? <ArrowDownLeft size={13} strokeWidth={2.5} /> : <ArrowUpRight size={13} strokeWidth={2.5} />}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{msg.contactName || 'Unknown'}</p>
                <p className="text-[10px] text-gray-400 truncate">
                    {typeof msg.content?.body === 'string' 
                        ? msg.content.body.slice(0, 40) 
                        : msg.content?.text || '—'}
                </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <span className={clsx("text-[9px] font-black uppercase px-2 py-0.5 rounded-full", statusColor[msg.status] || statusColor.sent)}>
                    {msg.status}
                </span>
                <span className="text-[9px] text-gray-300">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
        </div>
    );
}

// ─── Campaign Row ─────────────────────────────────────────────────────────────
function CampaignRow({ campaign }: { campaign: any }) {
    const statusColor: Record<string, string> = {
        sent: 'text-emerald-600 bg-emerald-50',
        sending: 'text-blue-600 bg-blue-50',
        draft: 'text-amber-600 bg-amber-50',
        failed: 'text-red-500 bg-red-50',
    };
    return (
        <div className="flex items-center gap-3 py-2.5 px-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                <Send size={13} className="text-indigo-600" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{campaign.name}</p>
                <p className="text-[10px] text-gray-400">{campaign.totalContacts || 0} contacts</p>
            </div>
            <span className={clsx("text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0", statusColor[campaign.status] || statusColor.draft)}>
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
                    <QuickAction icon={Send} label="Campaigns" href={`${base}/campaigns`} color="blue" />
                    <QuickAction icon={Users2} label="Contacts" href={`${base}/contacts`} color="emerald" />
                    <QuickAction icon={Bot} label="AI Agent" href={`${base}/agents`} color="purple" disabled={planFeatures.aiAgents <= 0} />
                    <QuickAction icon={Zap} label="Automate" href={`${base}/automation`} color="amber" />
                    <QuickAction icon={CreditCard} label="Wallet" href={`${base}/wallet`} color="indigo" />
                    <QuickAction icon={FileText} label="Templates" href={`${base}/templates`} color="pink" />
                    <QuickAction icon={Workflow} label="Flows" href={`${base}/settings/whatsapp/flows`} color="teal" />
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
                        <Link href={`${base}/inbox`} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
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
                        <Link href={`${base}/campaigns`} className="flex items-center gap-1 text-[10px] font-black text-blue-600 hover:underline">
                            <Plus size={12} /> New
                        </Link>
                    </div>
                    <div className="p-2 max-h-[220px] overflow-y-auto scrollbar-none">
                        {recentCampaigns.length === 0 ? (
                            <div className="flex flex-col items-center py-8 text-center">
                                <Send size={24} className="text-gray-200 mb-2" />
                                <p className="text-[10px] text-gray-300 font-semibold uppercase tracking-widest">No campaigns yet</p>
                                <Link href={`${base}/campaigns`} className="mt-3 text-[10px] font-black text-blue-600 hover:underline">Create one →</Link>
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
                            <Link href={`${base}/agents`} className="p-1 bg-white/5 text-white/40 hover:bg-white/10 hover:text-white rounded-lg transition-all">
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
