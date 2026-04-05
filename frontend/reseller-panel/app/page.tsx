'use client';

import Link from 'next/link';
import { 
    Users2, Gem, Target, Zap, Globe, ShieldCheck, 
    TrendingUp, ArrowRight, Plus, Activity, Layers, 
    Workflow, MessageSquare, Target as TargetIcon, 
    PieChart, Sparkles, Filter, MoreHorizontal
} from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import Layout from '@/components/Layout';

const STATS = [
    { label: 'Ecosystem Scale', value: '1,240', sub: '+12% this month', icon: Users2, color: 'blue' },
    { label: 'Network GTV', value: '₹4.2M', sub: 'Last 30 Days', icon: Zap, color: 'amber' },
    { label: 'Active Licenses', value: '890', sub: '92% Utilization', icon: ShieldCheck, color: 'emerald' },
    { label: 'Accrued Partner Commission', value: '₹145K', sub: 'Payable Apr 15', icon: Gem, color: 'purple' },
];

const RECENT_CLIENTS = [
    { name: 'Quantum Digital', industry: 'Retail', status: 'ACTIVE', volume: '450K msg', time: '2m ago' },
    { name: 'Skyline Ventures', industry: 'SaaS', status: 'ONBOARDING', volume: '12K msg', time: '1h ago' },
    { name: 'Apex Logistics', industry: 'Logistics', status: 'SUSPENDED', volume: '0 msg', time: '1d ago' },
];

export default function ResellerOverview() {
    return (
        <Layout>
            <div className="space-y-12 animate-in fade-in duration-700">
             {/* Hero Section - Aerostic Premium */}
             <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="space-y-2">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter lowercase leading-none">Partner Analytics Hub<span className="text-indigo-600">.</span></h2>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                         <Target size={12} className="text-indigo-500" /> global distributed intelligence metrics
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="px-6 py-3 bg-white border-2 border-slate-50 text-slate-500 font-black rounded-2xl hover:bg-slate-900 hover:text-white transition-all text-[10px] uppercase tracking-widest shadow-sm">
                         Download Monthly Audit_
                    </button>
                    <Link 
                        href="/clients/new"
                        className="group flex items-center gap-2 px-6 py-3 bg-[#0F172A] text-white rounded-2xl shadow-xl shadow-indigo-500/10 hover:scale-[1.02] transition-all"
                    >
                         <Plus size={16} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Provision New Client</span>
                    </Link>
                </div>
            </div>

            {/* Stats Orchestrator */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {STATS.map((s, i) => (
                    <motion.div 
                        key={s.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={clsx(
                             "p-8 rounded-[40px] bg-white border-2 border-slate-50 shadow-sm relative overflow-hidden group hover:border-indigo-100 transition-all",
                             s.color === 'blue' ? 'hover:shadow-blue-500/5' : 
                             s.color === 'amber' ? 'hover:shadow-amber-500/5' :
                             s.color === 'emerald' ? 'hover:shadow-emerald-500/5' : 'hover:shadow-purple-500/5'
                        )}
                    >
                        <div className={clsx(
                             "w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110",
                             s.color === 'blue' ? 'bg-blue-50 text-blue-600' : 
                             s.color === 'amber' ? 'bg-amber-50 text-amber-600' :
                             s.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'
                        )}>
                             <s.icon size={24} strokeWidth={2.5} />
                        </div>
                        <div className="text-3xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">{s.value}</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{s.label}</div>
                        <div className={clsx(
                             "text-[9px] font-black uppercase tracking-widest mt-4 flex items-center gap-2",
                             s.color === 'blue' ? 'text-blue-500' : 'text-slate-300'
                        )}>
                             {s.sub} <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Client Ecosystem View */}
                <div className="lg:col-span-2 bg-white rounded-[48px] border-2 border-slate-50 overflow-hidden shadow-sm relative group">
                    <div className="p-10 border-b-2 border-slate-50 bg-slate-50/30 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                             <div className="p-3 bg-white rounded-2xl text-slate-900 border border-slate-100 shadow-sm">
                                  <Users2 size={24} strokeWidth={2.5} />
                             </div>
                             <div>
                                 <h3 className="text-xl font-black text-slate-900 lowercase italic">Distributor_Ecosystem<span className="text-indigo-600">.</span></h3>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Real-time Client Synchronization</p>
                             </div>
                         </div>
                         <div className="flex gap-2 p-1.5 bg-white rounded-2xl border border-slate-50 shadow-sm">
                            {['ALL', 'ACTIVE', 'SYNCING'].map(tab => (
                                <button key={tab} className="px-4 py-2 text-[8px] font-black rounded-xl hover:bg-slate-50 transition-all uppercase tracking-widest">{tab}</button>
                            ))}
                         </div>
                    </div>
                    <div className="p-2 overflow-x-auto">
                        <table className="w-full text-left min-w-[700px]">
                            <thead className="bg-slate-50/30 border-b border-slate-50">
                                <tr>
                                    {['Workspace Identity', 'Status Protocol', 'Flow Volume', 'Sync Activity', ''].map(h => (
                                        <th key={h} className="px-8 py-5 text-[9px] font-black text-slate-400 tracking-widest uppercase">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {RECENT_CLIENTS.map((c, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-all group/row">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                 <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 font-black text-xs group-hover/row:scale-110 transition-transform">{c.name[0]}</div>
                                                 <div>
                                                     <p className="text-sm font-black text-slate-900 lowercase italic">{c.name}</p>
                                                     <p className="text-[9px] font-black text-slate-400 uppercase mt-0.5 tracking-widest">{c.industry}</p>
                                                 </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                             <span className={clsx(
                                                 "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                                                 c.status === 'ACTIVE' ? "bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm shadow-emerald-500/5" :
                                                 c.status === 'ONBOARDING' ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-rose-50 text-rose-700 border-rose-100"
                                             )}>
                                                  {c.status === 'ACTIVE' && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block mr-2 animate-pulse" />}
                                                  {c.status}
                                             </span>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-black text-slate-600 tabular-nums">
                                            {c.volume}
                                        </td>
                                        <td className="px-8 py-6 text-[10px] font-black text-slate-300 uppercase tracking-widest italic">
                                            {c.time}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                             <button className="p-2.5 bg-slate-50 text-slate-300 rounded-xl hover:bg-slate-900 hover:text-white transition-all opacity-0 group-hover/row:opacity-100">
                                                  <ArrowRight size={18} strokeWidth={3} />
                                             </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Logic Lab */}
                <div className="space-y-8">
                     <div className="bg-indigo-600 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden group">
                         <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 blur-[80px] -z-10 group-hover:scale-150 transition-transform duration-1000" />
                         <Sparkles className="text-indigo-300 opacity-40 mb-6 group-hover:scale-125 transition-transform" size={40} strokeWidth={1} />
                         <h4 className="text-2xl font-black tracking-tighter leading-tight mb-4">Master Distribution Protocol v2<span className="text-indigo-400">_</span></h4>
                         <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] leading-relaxed mb-8">
                              Deploy white-label intelligence and custom logic nodes across all distributed client ecosystems instantly.
                         </p>
                         <button className="w-full h-16 bg-white text-indigo-600 rounded-[28px] font-black text-[10px] uppercase tracking-widest hover:shadow-2xl active:scale-95 transition-all">
                              Configure Logic Vector_
                         </button>
                     </div>

                     <div className="bg-white rounded-[40px] border-2 border-slate-50 p-10 shadow-sm relative overflow-hidden group">
                         <div className="flex items-center gap-4 mb-8">
                              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm shadow-emerald-500/5">
                                   <TrendingUp size={24} strokeWidth={2.5} />
                              </div>
                              <div>
                                  <h4 className="text-base font-black text-slate-900 lowercase italic leading-none">Growth_Logic</h4>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Ecosystem Expansion metrics</p>
                              </div>
                         </div>
                         <div className="space-y-6">
                            {[
                                { label: 'Top Converting Niche', val: 'Retail (Global)', icon: TargetIcon },
                                { label: 'Expansion Rate', val: '+4.5% DoD', icon: Activity },
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-slate-50">
                                     <div className="flex items-center gap-3">
                                          <item.icon size={16} className="text-indigo-500" />
                                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                                     </div>
                                     <span className="text-xs font-black text-slate-900 italic lowercase">{item.val}</span>
                                </div>
                            ))}
                         </div>
                     </div>
                </div>
            </div>
            </div>
        </Layout>
    );
}
