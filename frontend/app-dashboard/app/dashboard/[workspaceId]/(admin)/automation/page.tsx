'use client';

import { useState, useEffect } from 'react';
import {
    Plus, Zap, Trash2, MoreVertical, ArrowRight, Bot, 
    MessageSquare, Sparkles, Filter, Activity, ShieldCheck, 
    Clock, Workflow, LayoutGrid, Timer, Layers, ChevronRight
} from 'lucide-react';
import api from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

interface WorkflowItem {
    id: string;
    name: string;
    isActive: boolean;
    updatedAt: string;
    nodes: any[];
}

export default function AutomationPage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params.workspaceId as string;
    const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWorkflows = async () => {
            try {
                const res = await api.get('/workflows');
                setWorkflows(res.data);
            } catch (err) {
                console.error('Failed to fetch workflows', err);
            } finally {
                setLoading(false);
            }
        };
        fetchWorkflows();
    }, []);

    const toggleStatus = async (id: string, current: boolean) => {
        try {
            await api.patch(`/workflows/${id}`, { isActive: !current });
            setWorkflows(workflows.map(w => w.id === id ? { ...w, isActive: !current } : w));
            toast.success(`Automation ${!current ? 'Protocol active' : 'Paused'}`);
        } catch (err) {
            toast.error('Failed to update protocol status');
        }
    };

    const deleteWorkflow = async (id: string) => {
        if (!confirm('Are you sure you want to delete this intelligence vector?')) return;
        try {
            await api.delete(`/workflows/${id}`);
            setWorkflows(workflows.filter(w => w.id !== id));
            toast.success('Protocol purged');
        } catch (err) {
            toast.error('Purge failed');
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-24 animate-in fade-in duration-700">
             {/* Header Section - Aerostic Premium */}
             <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_12px_rgba(59,130,246,0.5)]" />
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">Automation Engine v2.5</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter lowercase leading-none">Intelligence Hub<span className="text-blue-600">.</span></h1>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-3 flex items-center gap-2">
                         <Zap size={12} className="text-blue-500" /> Automated Workflow Orchestration
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <Link
                        href="/automation/builder"
                        className="group flex items-center gap-3 p-1.5 pr-6 bg-[#0F172A] text-white rounded-[20px] hover:shadow-2xl hover:shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95"
                    >
                         <div className="w-10 h-10 bg-blue-600 rounded-[14px] flex items-center justify-center shadow-lg group-hover:rotate-90 transition-transform">
                             <Plus size={20} strokeWidth={3} />
                         </div>
                         <span className="text-xs font-black uppercase tracking-widest ml-1">Deploy New Protocol</span>
                    </Link>
                </div>
            </div>

            {/* Template Gallery - High Fidelity */}
            <div className="space-y-6">
                <div className="flex items-center gap-4 px-2">
                     <h2 className="text-sm font-black text-slate-400 tracking-[0.2em] uppercase italic">Rapid_Deployment_Vectors</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { id: 'ai-sales', name: 'AI Sales Assistant', desc: 'Real-time intelligence node for automated deal closure.', icon: Bot, color: 'purple' },
                        { id: 'auto-welcome', name: 'Auto-Welcome', desc: 'Instant engagement vector for inbound customer queries.', icon: MessageSquare, color: 'blue' },
                        { id: 'keyword-router', name: 'Keyword Router', desc: 'Dynamic logical branching based on customer signals.', icon: Zap, color: 'amber' },
                    ].map((tpl, i) => (
                        <Link
                            key={tpl.id}
                            href={`/automation/builder?template=${tpl.id}`}
                            className="bg-white rounded-[40px] p-10 border-2 border-slate-50 shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[80px] -z-10 group-hover:scale-150 transition-transform duration-1000" />
                            <div className={clsx(
                                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 mb-8 border shadow-sm shadow-slate-100",
                                `bg-${tpl.color}-50 text-${tpl.color}-600 border-${tpl.color}-100`
                            )}>
                                <tpl.icon size={28} strokeWidth={2.5} />
                            </div>
                            <h4 className="text-lg font-black text-slate-900 mb-3 tracking-tight group-hover:text-blue-600 transition-colors lowercase italic">{tpl.name}</h4>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed opacity-60">{tpl.desc}</p>
                            <div className="mt-8 pt-8 border-t border-slate-50 flex items-center gap-2 text-blue-600 text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all">
                                Deploy Protocol <ArrowRight size={14} strokeWidth={3} />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Workflows List Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-4">
                         <h2 className="text-xl font-black text-slate-900 tracking-tight lowercase">Active Automations<span className="text-blue-600">_</span></h2>
                         <div className="h-5 w-px bg-slate-200" />
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{workflows.length} vectors active</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="h-28 bg-slate-50 rounded-[40px] animate-pulse" />
                        ))
                    ) : workflows.length === 0 ? (
                        <div className="bg-slate-50/50 border-2 border-dashed border-slate-200/50 rounded-[48px] p-24 text-center flex flex-col items-center">
                            <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center mb-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                                <Zap size={40} className="text-slate-300" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 lowercase italic">initiate intelligence loop<span className="text-blue-500">.</span></h3>
                            <p className="text-slate-400 max-w-sm mt-3 text-sm font-medium leading-relaxed">Automate your customer outcomes with the world's most advanced flow engine.</p>
                            <Link
                                href="/automation/builder"
                                className="mt-10 group flex items-center gap-3 p-1.5 pr-8 bg-[#0F172A] text-white rounded-[24px] hover:shadow-2xl hover:shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95"
                            >
                                <div className="w-12 h-12 bg-blue-600 rounded-[18px] flex items-center justify-center shadow-lg group-hover:rotate-90 transition-transform">
                                     <Plus size={24} strokeWidth={3} />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest ml-1">Access Workflow Builder</span>
                            </Link>
                        </div>
                    ) : workflows.map((workflow) => (
                        <motion.div 
                            key={workflow.id} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border-2 border-slate-50 rounded-[40px] p-8 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 hover:border-blue-100 transition-all group flex items-center justify-between relative overflow-hidden"
                        >
                            <div className="flex items-center gap-10">
                                <div className={clsx(
                                    "w-20 h-20 rounded-[32px] flex items-center justify-center transition-all group-hover:scale-110",
                                    workflow.isActive ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'bg-slate-50 text-slate-300 border-2 border-slate-100'
                                )}>
                                    <Zap size={32} strokeWidth={2.5} className={workflow.isActive ? 'fill-current' : ''} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors lowercase italic">{workflow.name}</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-xl">
                                             <Layers size={12} className="text-blue-500" /> {workflow.nodes.length} logic steps
                                        </div>
                                        <div className="h-4 w-px bg-slate-100" />
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                             <Timer size={12} /> Sync {new Date(workflow.updatedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="flex items-center px-6 py-4 bg-slate-50/50 rounded-[28px] border border-slate-100">
                                    <span className={clsx(
                                        "text-[10px] font-black uppercase tracking-[0.2em] mr-4 transition-colors",
                                        workflow.isActive ? 'text-emerald-500' : 'text-slate-300'
                                    )}>
                                        {workflow.isActive ? 'Active Node' : 'Suspended'}
                                    </span>
                                    <button
                                        onClick={() => toggleStatus(workflow.id, workflow.isActive)}
                                        className={clsx(
                                            "w-12 h-6.5 rounded-full p-1.5 transition-all relative border overflow-hidden shadow-inner",
                                            workflow.isActive ? 'bg-emerald-500 border-emerald-600' : 'bg-slate-200 border-slate-300'
                                        )}
                                    >
                                        <motion.div 
                                            animate={{ x: workflow.isActive ? 22 : 0 }}
                                            className="w-4 h-4 bg-white rounded-full shadow-lg" 
                                        />
                                    </button>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/automation/builder?id=${workflow.id}`}
                                        className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all border border-slate-100"
                                    >
                                        <Workflow size={20} strokeWidth={2.5} />
                                    </Link>
                                    <button
                                        onClick={() => deleteWorkflow(workflow.id)}
                                        className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all border border-slate-100"
                                    >
                                        <Trash2 size={20} strokeWidth={2.5} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
