"use client";

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
    Users, Globe, CreditCard, Shield, 
    ChevronRight, ArrowUpRight, Plus,
    BarChart3, Activity, Briefcase, Zap
} from 'lucide-react';
import { clsx } from 'clsx';
import { StatCard, resolveWorkspaceId } from './DashboardComponents';

export default function PartnerDashboardView({ stats, workspaceId: propWorkspaceId }: any) {
    const params = useParams();
    const workspaceId = propWorkspaceId || resolveWorkspaceId(params?.workspaceId as string | string[] | undefined);

    return (
        <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700 pb-20">
            {/* Partner Hero */}
            <div className="bg-[#0F172A] rounded-[48px] p-10 md:p-14 text-white relative overflow-hidden shadow-2xl border-2 border-white/5">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[120px] opacity-10 -mr-64 -mt-64" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20 mb-6">
                            <Shield size={12} className="text-blue-400" />
                            <span className="text-[9px] font-black uppercase tracking-[.3em] text-blue-400">Authorized Partner Node</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none mb-4">Partner Console</h2>
                        <p className="text-sm font-bold text-white/40 uppercase tracking-widest max-w-lg leading-relaxed">Multi-tenant infrastructure command center for {workspaceId} Registry.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                        <div className="p-8 bg-white text-black rounded-[32px] shadow-xl text-center flex flex-col items-center">
                            <Users size={24} className="text-blue-600 mb-3" />
                            <p className="text-3xl font-black tracking-tighter">{stats?.totalTenants || 0}</p>
                            <p className="text-[8px] font-black uppercase tracking-[.2em] text-gray-400 mt-1">Acrid Nodes</p>
                        </div>
                        <div className="p-8 bg-blue-600 text-white rounded-[32px] shadow-xl text-center flex flex-col items-center">
                            <Briefcase size={24} className="text-white mb-3" />
                            <p className="text-3xl font-black tracking-tighter">Gold</p>
                            <p className="text-[8px] font-black uppercase tracking-[.2em] text-blue-200 mt-1">Tier Level</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Partner Actions Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Provision Tenant', icon: Plus, color: 'bg-blue-600' },
                    { label: 'Resource Allocation', icon: Zap, color: 'bg-amber-600' },
                    { label: 'Global Registry', icon: Globe, color: 'bg-emerald-600' },
                    { label: 'Billing Nexus', icon: CreditCard, color: 'bg-indigo-600' },
                ].map((action, i) => (
                    <button key={i} className="group p-8 bg-white border-2 border-gray-50 rounded-[40px] shadow-xl shadow-gray-200/40 hover:border-black transition-all flex flex-col items-center gap-6 active:scale-95">
                        <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110", action.color)}>
                            <action.icon size={28} strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors">{action.label}</span>
                    </button>
                ))}
            </div>

            {/* Core Partner Telemetry */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard title="Aggregate Flux" value={stats?.totalSent || 0} icon={ArrowUpRight} trend="+45% vs LY" trendUp={true} color="blue" />
                <StatCard title="Active Protocols" value={stats?.activeTenants || 0} icon={Activity} trend="98% Uptime" trendUp={null} color="emerald" />
                <StatCard title="Resource Conversion" value="₹124.5k" icon={BarChart3} trend="+12.2%" trendUp={true} color="purple" />
            </div>

            {/* Client Repository Matrix */}
            <div className="bg-white rounded-[48px] border-2 border-gray-50 shadow-2xl shadow-gray-200/40 relative overflow-hidden">
                <div className="p-8 md:p-10 border-b-2 border-gray-50 flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <Users size={24} className="text-blue-600" />
                            Tenant Registry
                        </h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Multi-tenant node management and oversight</p>
                    </div>
                    <button className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-black hover:text-white transition-all active:scale-95 shadow-sm">
                        <Activity size={24} />
                    </button>
                </div>
                
                <div className="p-8 md:p-10 text-center flex flex-col items-center justify-center min-h-[400px]">
                    <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center text-gray-200 mb-6 border-2 border-gray-100"><Briefcase size={32} /></div>
                    <h4 className="text-xl font-black text-gray-900 tracking-tight uppercase">Registry Empty</h4>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-3 max-w-sm leading-loose text-center">No provisioned tenants found in the current registry shard. Begin deployment by creating your first node.</p>
                    <button className="mt-10 px-8 py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all active:scale-95 shadow-xl shadow-gray-200">
                        Provision Multi-Tenant Node
                    </button>
                </div>
            </div>
        </div>
    );
}
