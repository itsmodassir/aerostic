"use client";

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
    Lock, ChevronRight, Activity, Users, Calendar, 
    ArrowDownLeft, ArrowUpRight, BarChart3, Bot, 
    MoreVertical, CheckCircle, XCircle
} from 'lucide-react';
import { clsx } from 'clsx';

export function resolveWorkspaceId(value: string | string[] | undefined): string {
    if (Array.isArray(value)) return value[0] || 'default';
    return value || 'default';
}

export function StatCard({ title, value, icon: Icon, trend, trendUp, color }: any) {
    const colorMap: any = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', hover: 'hover:border-blue-500' },
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', hover: 'hover:border-emerald-500' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-600', hover: 'hover:border-purple-500' },
        amber: { bg: 'bg-amber-50', text: 'text-amber-600', hover: 'hover:border-amber-500' }
    };
    const c = colorMap[color] || colorMap.blue;

    return (
        <div className={clsx("bg-white p-8 rounded-[40px] border-2 border-gray-50 shadow-xl shadow-gray-200/30 transition-all duration-300 group active:scale-95", c.hover)}>
            <div className="flex items-start justify-between mb-8">
                <div className={clsx("w-16 h-16 rounded-[24px] flex items-center justify-center shadow-lg transition-transform group-hover:scale-110", c.bg, c.text)}>
                    <Icon size={32} strokeWidth={2.5} />
                </div>
                {trend && (
                    <div className={clsx(
                        "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm",
                        trendUp === true ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        trendUp === false ? "bg-red-50 text-red-600 border-red-100" : "bg-gray-50 text-gray-400 border-gray-100"
                    )}>
                        {trend}
                    </div>
                )}
            </div>
            <h4 className="text-4xl font-black text-gray-900 tracking-tighter leading-none mb-1.5">{value.toLocaleString()}</h4>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{title}</p>
        </div>
    );
}

export function MetricCard({ title, value, icon: Icon, color }: any) {
    const colorMap: any = {
        blue: 'blue',
        emerald: 'emerald',
        purple: 'purple',
        amber: 'amber'
    };
    const cName = colorMap[color] || 'blue';

    return (
        <div className="flex items-center gap-6 p-8 bg-white border-2 border-gray-50 rounded-[40px] shadow-lg shadow-gray-200/20 hover:border-black transition-all group cursor-pointer active:scale-95">
             <div className={clsx(
                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110",
                cName === 'blue' ? "bg-blue-50 text-blue-600" :
                cName === 'emerald' ? "bg-emerald-50 text-emerald-600" :
                cName === 'purple' ? "bg-purple-50 text-purple-600" : "bg-amber-50 text-amber-600"
            )}>
                 <Icon size={28} strokeWidth={2.5} />
             </div>
             <div>
                <p className="text-2xl font-black text-gray-900 tracking-tighter leading-none mb-1">{value}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</p>
             </div>
        </div>
    );
}

export function LockedFeatureCard({ title, description, icon: Icon, plan }: any) {
    const params = useParams();
    const workspaceId = resolveWorkspaceId(params?.workspaceId as string | string[] | undefined);
    
    return (
        <div className="bg-gray-50/50 p-12 rounded-[48px] border-2 border-dashed border-gray-200 text-center relative overflow-hidden group">
            <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-gray-300 border-2 border-gray-50 mb-6 shadow-sm group-hover:scale-110 transition-transform">
                     {Icon ? <Icon size={32} /> : <Lock size={32} />}
                </div>
                <h4 className="text-xl font-black text-gray-900 tracking-tight uppercase">{title} Encrypted</h4>
                <p className="text-xs font-bold text-gray-400 max-w-sm mt-3 uppercase tracking-widest leading-loose">{description}</p>
                <Link href={`/dashboard/${workspaceId}/billing`} className="mt-8 px-8 py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all active:scale-95 shadow-xl shadow-gray-200 text-center inline-block">
                    Upgrade to {plan} License
                </Link>
            </div>
        </div>
    );
}

export function AIAgentCardPremium({ name, status, capacity, conversations, dimmed }: any) {
    return (
        <div className={clsx(
            "p-6 rounded-[32px] border-2 transition-all group cursor-pointer",
            dimmed ? "bg-white/5 border-transparent opacity-40 hover:opacity-70" : "bg-white/10 border-white/5 hover:border-purple-500 hover:bg-white/20 shadow-xl shadow-black/20"
        )}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><Bot size={24} /></div>
                    <div>
                        <h4 className="text-sm font-black tracking-tight uppercase">{name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className={clsx("w-1 h-1 rounded-full", status === 'Active' ? "bg-emerald-400" : "bg-amber-400")} />
                            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{status}</span>
                        </div>
                    </div>
                </div>
                <MoreVertical size={16} className="text-white/20" />
            </div>
            
            <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Efficiency</span>
                    <span className="text-[10px] font-black text-purple-400">{capacity}%</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${capacity}%` }} />
                </div>
                <div className="flex justify-between items-center px-1 pt-1">
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Resolutions</span>
                    <span className="text-[10px] font-black text-white/60 tracking-tight">{conversations.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
}

export function MessageRowPremium({ msg }: { msg: any }) {
    return (
        <div className="p-6 md:p-8 hover:bg-blue-50/30 transition-all group flex items-center justify-between gap-6 cursor-pointer border-l-4 border-transparent hover:border-blue-500">
            <div className="flex items-center gap-6 min-w-0">
                <div className={clsx(
                    "w-16 h-16 rounded-[22px] flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform",
                    msg.direction === 'in' ? "bg-emerald-500 text-white shadow-emerald-100" : "bg-blue-500 text-white shadow-blue-100"
                )}>
                    <Activity size={24} strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                     <div className="flex items-center gap-3 mb-1.5 min-w-0">
                        <p className="text-lg font-black text-gray-900 truncate tracking-tight uppercase leading-none">
                            {msg.contactName || 'Unknown Contact'}
                        </p>
                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100 shrink-0">Handshake</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <p className="text-[9px] font-black text-gray-400 flex items-center gap-1.5 uppercase tracking-widest">
                            {msg.direction === 'in' ? 'Recv' : 'Sent'} <span className="h-1 w-1 bg-gray-200 rounded-full" /> {new Date(msg.createdAt).toLocaleTimeString()}
                        </p>
                        <p className="text-[9px] font-bold text-gray-300 truncate max-w-[150px] uppercase tracking-tighter italic">"{msg.content || 'System Pulse'}"</p>
                    </div>
                </div>
            </div>
            <div className={clsx(
                "px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm shrink-0",
                msg.status === 'read' ? "bg-blue-50 text-blue-600 border-blue-100 shadow-blue-50" :
                msg.status === 'delivered' ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-50" :
                msg.status === 'failed' ? "bg-red-50 text-red-600 border-red-100 shadow-red-50" : "bg-gray-100 text-gray-400 border-gray-200"
            )}>
                {msg.status}
            </div>
        </div>
    );
}

export function StatusBadge({ label, active }: { label: string, active: boolean }) {
    return (
        <div className={clsx(
            "px-4 py-3 rounded-2xl flex items-center justify-center gap-3 border-2 transition-all",
            active ? "bg-white border-emerald-500/10 text-emerald-600 shadow-sm" : "bg-gray-100 border-transparent text-gray-300"
        )}>
            <div className={clsx("w-1.5 h-1.5 rounded-full shadow-sm", active ? "bg-emerald-500 animate-pulse" : "bg-gray-300")} />
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        </div>
    );
}
