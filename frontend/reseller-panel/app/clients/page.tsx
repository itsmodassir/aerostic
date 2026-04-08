'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Users2, Plus, Search, Filter, MoreVertical,
    Building2, Mail, CreditCard, ExternalLink,
    Shield, CheckCircle2, XCircle, ChevronRight,
    Rocket, Zap, History, DollarSign, ArrowLeft,
    User, Lock, AlertCircle, ShieldCheck, Activity,
    Layers, Sparkles, MoreHorizontal, ArrowRight, Globe
} from 'lucide-react';
import api from '@/lib/api';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Layout from '@/components/Layout';

export default function ResellerClientsPage() {
    const router = useRouter();
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showOnboardModal, setShowOnboardModal] = useState(false);
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);

    // Initial Data Fetch
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setShowOnboardModal(params.get('action') === 'new');
        setShowCreditModal(params.get('action') === 'credits');
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [clientsRes, statsRes] = await Promise.all([
                api.get('/reseller/clients'),
                api.get('/reseller/stats')
            ]);
            if (clientsRes.data) setClients(clientsRes.data);
            if (statsRes.data) setStats(statsRes.data);
        } catch (error) {
            console.error('Failed to fetch clients', error);
            toast.error('Sync failure: Portfolio data unavailable');
        } finally {
            setLoading(false);
        }
    };

    const [onboarding, setOnboarding] = useState(false);
    const [onboardForm, setOnboardForm] = useState({
        name: '',
        ownerName: '',
        ownerEmail: '',
        password: ''
    });

    const handleOnboard = async (e: React.FormEvent) => {
        e.preventDefault();
        setOnboarding(true);
        const toastId = toast.loading('Architecting Client Ecosystem...');
        try {
            const res = await api.post('/reseller/client', onboardForm);
            if (res.status === 200 || res.status === 201) {
                setShowOnboardModal(false);
                fetchData();
                setOnboardForm({ name: '', ownerName: '', ownerEmail: '', password: '' });
                toast.success('Workspace Provisioned Successfully', { id: toastId });
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Provisioning sequence interrupted', { id: toastId });
        } finally {
            setOnboarding(false);
        }
    };

    const [allocating, setAllocating] = useState(false);
    const [creditAmount, setCreditAmount] = useState(0);

    const handleAllocate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClient) return;
        setAllocating(true);
        const toastId = toast.loading('Transferring Global Credits...');
        try {
            await api.post('/reseller/allocate-credits', {
                targetTenantId: selectedClient.id,
                amount: creditAmount
            });
            setShowCreditModal(false);
            setCreditAmount(0);
            fetchData();
            toast.success('Vector Balance Updated', { id: toastId });
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Transfer protocol failed', { id: toastId });
        } finally {
            setAllocating(false);
        }
    };

    return (
        <Layout>
            <div className="space-y-12 animate-in fade-in duration-700">
            {/* Header Section - Aerostic Premium */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_12px_rgba(99,102,241,0.5)]" />
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">Distributor Portfolio v1.2</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter lowercase leading-none">Portfolio Management<span className="text-indigo-600">.</span></h1>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-3 flex items-center gap-2 italic">
                         <Building2 size={12} className="text-indigo-500" /> orchestrate and monitor client ecosystems
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end mr-4 group cursor-default">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2 group-hover:text-indigo-500 transition-colors">Global Available Credits_</p>
                         <p className="text-2xl font-black text-slate-900 tracking-tight leading-none tabular-nums">{stats?.availableCredits?.toLocaleString() || 0}</p>
                    </div>
                    <button 
                        onClick={() => setShowOnboardModal(true)}
                        className="group flex items-center gap-2 p-1.5 pr-8 bg-[#0F172A] text-white rounded-[20px] hover:shadow-2xl hover:shadow-indigo-500/20 transition-all active:scale-95 translate-y-0 hover:-translate-y-1"
                    >
                         <div className="w-12 h-12 bg-indigo-600 rounded-[18px] flex items-center justify-center shadow-lg group-hover:rotate-90 transition-transform">
                             <Plus size={20} strokeWidth={3} />
                         </div>
                         <div className="flex flex-col items-start translate-y-0.5">
                             <span className="text-xs font-black uppercase tracking-widest leading-none">Provision Client</span>
                             <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mt-1 shrink-0 italic">Launch Workspace_</span>
                         </div>
                    </button>
                </div>
            </div>

            {/* Client List Orchestrator */}
            <div className="bg-white rounded-[48px] border-2 border-slate-50 overflow-hidden shadow-sm relative group">
                <div className="p-10 border-b-2 border-slate-50 bg-slate-50/30 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                         <div className="p-3 bg-white rounded-2xl text-slate-900 border border-slate-100 shadow-sm transition-transform group-hover:scale-110">
                              <ShieldCheck size={24} strokeWidth={2.5} />
                         </div>
                         <div>
                             <h3 className="text-xl font-black text-slate-900 lowercase italic">Ecosystem_Library<span className="text-indigo-600">.</span></h3>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Authorized distributed workspaces</p>
                         </div>
                     </div>
                     <div className="relative group/search">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-hover/search:text-indigo-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search portfolios..."
                            className="w-80 pl-14 pr-8 py-4 bg-white border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-200 outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[900px]">
                        <thead className="bg-slate-50/30 border-b border-slate-50">
                            <tr>
                                {['Client Identity', 'Credit Balance', 'Status Protocol', 'Deploy Date', ''].map(h => (
                                    <th key={h} className="px-10 py-6 text-[10px] font-black text-slate-400 tracking-widest uppercase italic">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-10 py-8 bg-slate-50/20" />
                                    </tr>
                                ))
                            ) : clients.map((client) => (
                                <tr key={client.id} className="group/row hover:bg-slate-50/50 transition-all">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 bg-indigo-600 rounded-[20px] flex items-center justify-center text-white font-black text-xl shadow-xl shadow-indigo-100 group-hover/row:scale-110 transition-transform">
                                                {client.name[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-base font-black text-slate-900 leading-none italic lowercase">{client.name}</p>
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                                                     <Globe size={10} /> {client.slug}.aerostic.io
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col">
                                            <span className="text-base font-black text-slate-900 tabular-nums">{(client.resellerCredits || 0).toLocaleString()}</span>
                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mt-1 shrink-0 italic underline decoration-indigo-200">global credits_</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className={clsx(
                                            "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm transition-all group-hover/row:scale-105",
                                            client.status === 'active' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"
                                        )}>
                                            <div className={clsx("w-1.5 h-1.5 rounded-full animate-pulse", client.status === 'active' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-amber-500")} />
                                            {client.status}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                                        {new Date(client.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => {
                                                    setSelectedClient(client);
                                                    setShowCreditModal(true);
                                                }}
                                                className="w-10 h-10 bg-white text-indigo-600 rounded-xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-sm border border-slate-100"
                                                title="Allocate Global Credits"
                                            >
                                                <Zap size={18} strokeWidth={3} />
                                            </button>
                                            <button className="w-10 h-10 bg-white text-slate-400 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-all shadow-sm border border-slate-100">
                                                <MoreHorizontal size={18} strokeWidth={3} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {!loading && clients.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-10 py-32 text-center group/empty">
                                        <div className="flex flex-col items-center">
                                            <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mb-8 border-2 border-dashed border-slate-200 group-hover/empty:scale-105 transition-transform duration-500">
                                                <Building2 className="w-12 h-12 text-slate-200" />
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-900 lowercase italic tracking-tight">no authorized ecosystems<span className="text-indigo-500">_</span></h3>
                                            <p className="text-slate-400 max-w-sm mt-3 text-sm font-medium leading-relaxed italic mb-10">Start expanding your global distributed network by provisioning your first client workspace today.</p>
                                            <button
                                                onClick={() => setShowOnboardModal(true)}
                                                className="px-10 py-5 bg-[#0F172A] text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:shadow-2xl hover:shadow-indigo-500/10 active:scale-95 transition-all shadow-lg shadow-slate-200"
                                            >
                                                Initialize First Node_
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Ingestion Wizard - Aerostic Premium */}
            <AnimatePresence>
                {showOnboardModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
                            onClick={() => setShowOnboardModal(false)} 
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl bg-white rounded-[48px] shadow-2xl p-12 overflow-hidden border-2 border-slate-50"
                        >
                            <div className="flex items-center gap-8 mb-12">
                                <div className="w-20 h-20 bg-indigo-600 rounded-[28px] flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                                    <Rocket size={32} strokeWidth={3} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight lowercase">Ecosystem Provisioning<span className="text-indigo-600">_</span></h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Define core distributed node parameters</p>
                                </div>
                            </div>

                            <form onSubmit={handleOnboard} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Identity</label>
                                        <div className="relative group">
                                            <Building2 size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                                            <input
                                                required
                                                type="text"
                                                value={onboardForm.name}
                                                onChange={(e) => setOnboardForm({ ...onboardForm, name: e.target.value })}
                                                className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[24px] text-base font-bold outline-none transition-all shadow-inner placeholder:text-slate-200"
                                                placeholder="Quantum Digital v1"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admin Identity</label>
                                        <div className="relative group">
                                            <User size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                                            <input
                                                required
                                                type="text"
                                                value={onboardForm.ownerName}
                                                onChange={(e) => setOnboardForm({ ...onboardForm, ownerName: e.target.value })}
                                                className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[24px] text-base font-bold outline-none transition-all shadow-inner placeholder:text-slate-200"
                                                placeholder="Syed Modassir"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3 md:col-span-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Connectivity Endpoint (Email)</label>
                                        <div className="relative group">
                                            <Mail size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                                            <input
                                                required
                                                type="email"
                                                value={onboardForm.ownerEmail}
                                                onChange={(e) => setOnboardForm({ ...onboardForm, ownerEmail: e.target.value })}
                                                className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[24px] text-base font-bold outline-none transition-all shadow-inner placeholder:text-slate-200"
                                                placeholder="deploy@quantum.digital"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3 md:col-span-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Protocol (Password)</label>
                                        <div className="relative group">
                                            <Lock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                                            <input
                                                type="password"
                                                value={onboardForm.password}
                                                onChange={(e) => setOnboardForm({ ...onboardForm, password: e.target.value })}
                                                className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[24px] text-base font-bold outline-none transition-all shadow-inner placeholder:text-slate-200"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1 italic mt-2">Leave blank to use global distributed secure key_</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-10">
                                    <button
                                        type="button"
                                        onClick={() => setShowOnboardModal(false)}
                                        className="flex-1 py-5 bg-slate-50 text-slate-400 rounded-[28px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-100 transition-colors border border-slate-100"
                                    >
                                        Cancel Protocol
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={onboarding}
                                        className="flex-[2] py-5 bg-[#0F172A] text-white rounded-[28px] font-black text-[10px] uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-indigo-500/20 active:scale-95 transition-all shadow-lg shadow-slate-200 group relative overflow-hidden"
                                    >
                                        <div className="relative z-10 flex items-center justify-center gap-4">
                                            {onboarding ? <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : <ShieldCheck size={20} strokeWidth={3} />}
                                            {onboarding ? 'Synchronizing Ecosystem...' : 'Finalize Provisioning_'}
                                        </div>
                                        <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Vector Allocation Lab - Aerostic Premium */}
            <AnimatePresence>
                {showCreditModal && selectedClient && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
                            onClick={() => setShowCreditModal(false)} 
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-[48px] shadow-2xl p-12 overflow-hidden border-2 border-slate-50"
                        >
                            <div className="flex items-center gap-6 mb-10">
                                <div className="w-16 h-16 bg-emerald-600 rounded-[28px] flex items-center justify-center text-white shadow-xl shadow-emerald-100 animate-pulse">
                                    <Zap size={28} strokeWidth={3} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight lowercase">Vector Allocation Lab<span className="text-emerald-600">_</span></h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Global distributed credit synchronization</p>
                                </div>
                            </div>

                            <div className="p-8 bg-emerald-50/50 rounded-[32px] border border-emerald-100 mb-10 relative overflow-hidden group">
                                <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500 blur-[60px] opacity-10 group-hover:opacity-30 transition-opacity" />
                                <div className="relative z-10">
                                     <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Target Node Identity</p>
                                     <p className="text-2xl font-black text-slate-900 tracking-tight leading-none italic lowercase">{selectedClient.name}</p>
                                     <div className="mt-6 flex items-center justify-between">
                                          <div>
                                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Current Balance</p>
                                              <p className="text-lg font-black text-slate-900 tabular-nums lowercase">{(selectedClient.resellerCredits || 0).toLocaleString()} <span className="text-[10px]">vectors</span></p>
                                          </div>
                                          <ArrowRight className="text-slate-200" size={24} />
                                          <div className="text-right">
                                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Post-Sync Estimate</p>
                                              <p className="text-lg font-black text-emerald-600 tabular-nums lowercase">{(selectedClient.resellerCredits + creditAmount).toLocaleString()} <span className="text-[10px]">vectors</span></p>
                                          </div>
                                     </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sync Volume (Credits)</label>
                                    <div className="relative group">
                                        <DollarSign size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-600 transition-colors" />
                                        <input
                                            type="number"
                                            value={creditAmount}
                                            onChange={(e) => setCreditAmount(parseInt(e.target.value) || 0)}
                                            className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-emerald-600 focus:bg-white rounded-[24px] text-base font-bold outline-none transition-all shadow-inner placeholder:text-slate-200"
                                            placeholder="e.g. 5000"
                                        />
                                    </div>
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1 italic">Authorized Distributor Balance: <span className="text-slate-900 tabular-nums">{stats?.availableCredits?.toLocaleString()}</span></p>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-10">
                                <button onClick={() => setShowCreditModal(false)} className="flex-1 py-5 bg-slate-50 text-slate-400 rounded-[28px] font-black text-[10px] uppercase tracking-[0.2em] border border-slate-100 hover:bg-slate-100 transition-colors">Cancel Sync</button>
                                <button
                                    onClick={handleAllocate}
                                    disabled={allocating || creditAmount <= 0 || creditAmount > stats?.availableCredits}
                                    className="flex-[2] py-5 bg-[#0F172A] text-white rounded-[28px] font-black text-[10px] uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-emerald-500/20 active:scale-95 transition-all shadow-lg shadow-slate-200 group relative overflow-hidden"
                                >
                                    <div className="relative z-10 flex items-center justify-center gap-4">
                                        {allocating ? <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : <Activity size={20} strokeWidth={3} />}
                                        {allocating ? 'Executing Sync...' : 'Execute Vector Transfer_'}
                                    </div>
                                    <div className="absolute inset-0 bg-emerald-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            </div>
        </Layout>
    );
}
