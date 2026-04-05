"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { 
    Plus, Send, Copy, AlertCircle, FileSpreadsheet, Users, UserCheck, 
    ChevronRight, ChevronLeft, Upload, Megaphone, BarChart3, Wallet, 
    X, CheckCircle2, Calendar, Search, Sparkles, Filter, MoreHorizontal, 
    Target, Zap, Activity, ShieldCheck
} from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { clsx } from 'clsx';
import Papa from 'papaparse';
import { motion, AnimatePresence } from 'framer-motion';

interface Campaign {
    id: string;
    name: string;
    status: string;
    sentCount: number;
    failedCount: number;
    deliveredCount: number;
    readCount: number;
    totalCost: number;
    totalContacts: number;
    createdAt: string;
    recipientType: string;
}

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [tenantId, setTenantId] = useState<string>('');
    const params = useParams();

    const [templates, setTemplates] = useState<any[]>([]);
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [templateRate, setTemplateRate] = useState<number>(0.80);
    const [totalContactsCount, setTotalContactsCount] = useState<number>(0);

    // Wizard State
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        templateName: '',
        templateLanguage: 'en_US',
        recipientType: 'ALL', // ALL, CSV, MANUAL
        recipients: [] as any[] // { name, phoneNumber }
    });

    const [csvPreview, setCsvPreview] = useState<any[]>([]);
    const [manualInput, setManualInput] = useState('');

    useEffect(() => {
        const initTenant = async () => {
            const workspaceSlug = params.workspaceId as string;
            if (!workspaceSlug) return;
            try {
                const res = await api.get('/auth/workspaces');
                const memberships = res.data;
                const activeMembership = memberships.find((m: any) => 
                    m.tenant?.slug === workspaceSlug || m.tenant?.id === workspaceSlug
                );
                if (activeMembership && activeMembership.tenant?.id) {
                    const tid = activeMembership.tenant.id;
                    setTenantId(tid);
                    fetchCampaigns(tid);
                    fetchTemplates(tid);
                    fetchWalletAndContacts(tid);
                }
            } catch (e) {
                console.error('Failed to resolve tenant');
            }
        };
        initTenant();
    }, [params.workspaceId]);

    const fetchWalletAndContacts = async (tid: string) => {
        try {
            const [walletRes, contactsRes] = await Promise.all([
                api.get(`/billing/wallet/balance?tenantId=${tid}`),
                api.get(`/contacts?tenantId=${tid}`)
            ]);
            setWalletBalance(walletRes.data.balance || 0);
            if (walletRes.data.templateRate !== undefined) {
                setTemplateRate(walletRes.data.templateRate);
            }
            setTotalContactsCount(contactsRes.data.length || 0);
        } catch (e) {
            console.error('Failed to load wallet or contacts');
        }
    };

    const fetchTemplates = async (tid: string) => {
        try {
            const res = await api.get(`/templates?tenantId=${tid}`);
            setTemplates(res.data.filter((t: any) => 
                t.status?.toUpperCase() === 'APPROVED'
            ));
        } catch (e) { console.error('Failed to load templates'); }
    };

    const fetchCampaigns = async (tid: string) => {
        try {
            const res = await api.get(`/campaigns?tenantId=${tid}`);
            setCampaigns(res.data);
        } catch (error) { console.error('Failed to fetch campaigns', error); }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results: any) => {
                const validRows = results.data.map((row: any) => ({
                    name: row.name || row.Name || 'Valued Customer',
                    phoneNumber: row.phone || row.Phone || row.mobile || row.Mobile || ''
                })).filter((r: any) => r.phoneNumber);

                setCsvPreview(validRows.slice(0, 3)); 
                setFormData({ ...formData, recipients: validRows });
            }
        });
    };

    const handleManualProcess = () => {
        const rows = manualInput.split('\n').filter(r => r.trim());
        const processed = rows.map(r => {
            const [phone, name] = r.split(',').map(s => s.trim());
            return { phoneNumber: phone, name: name || 'Valued Customer' };
        }).filter(r => r.phoneNumber);
        setFormData({ ...formData, recipients: processed });
    };

    const handleLaunch = async () => {
        setLoading(true);
        try {
            const createRes = await api.post('/campaigns', {
                tenantId,
                name: formData.name,
                templateName: formData.templateName,
                templateLanguage: formData.templateLanguage,
                recipientType: formData.recipientType,
                recipients: formData.recipientType !== 'ALL' ? formData.recipients : []
            });
            const campaignId = createRes.data.id;
            await api.post(`/campaigns/${campaignId}/send`, { tenantId });
            setShowModal(false);
            setFormData({
                name: '', templateName: '', templateLanguage: 'en_US',
                recipientType: 'ALL', recipients: []
            });
            setStep(1);
            fetchCampaigns(tenantId);
        } catch (error: any) {
            alert('Launch failed');
        } finally {
            setLoading(false);
        }
    };

    const estimatedContacts = formData.recipientType === 'ALL' ? totalContactsCount : formData.recipients.length;
    const estimatedCost = estimatedContacts * templateRate;
    const canLaunch = walletBalance >= estimatedCost;

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-24 animate-in fade-in duration-700">
            {/* Header Section - Aerostic Premium */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_12px_rgba(59,130,246,0.5)]" />
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">Broadcast Protocol active</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter lowercase leading-none">Campaign Pulse<span className="text-indigo-600">.</span></h1>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-3 flex items-center gap-2">
                         <Sparkles size={12} className="text-indigo-500" /> Mass Communication Engine v2.5
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowModal(true)}
                        className="group flex items-center gap-2 p-1.5 pr-6 bg-[#0F172A] text-white rounded-[20px] hover:shadow-2xl hover:shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95"
                    >
                        <div className="w-10 h-10 bg-indigo-600 rounded-[14px] flex items-center justify-center shadow-lg group-hover:rotate-90 transition-transform">
                            <Plus size={20} strokeWidth={3} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest ml-1">New Broadcast</span>
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid - High Fidelity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Volume', value: campaigns.length, icon: Megaphone, color: 'indigo' },
                    { label: 'Wallet Balance', value: `₹${walletBalance.toFixed(2)}`, icon: Wallet, color: 'emerald' },
                    { label: 'Total Delivered', value: campaigns.reduce((acc, c) => acc + (c.deliveredCount || 0), 0), icon: CheckCircle2, color: 'blue' },
                    { label: 'Global Reads', value: campaigns.reduce((acc, c) => acc + (c.readCount || 0), 0), icon: Activity, color: 'purple' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-[40px] p-8 border-2 border-slate-50 shadow-sm relative overflow-hidden group hover:border-indigo-100 transition-all">
                        <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-5 transition-opacity">
                             <stat.icon size={64} strokeWidth={3} />
                        </div>
                        <div className="flex items-center justify-between mb-6">
                             <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center shadow-inner`}>
                                 <stat.icon size={20} strokeWidth={3} />
                             </div>
                             <div className="w-8 h-1 px-1 flex gap-0.5">
                                 {[1,2,3].map(j => <div key={j} className={`flex-1 rounded-full bg-${stat.color}-200/50`} />)}
                             </div>
                        </div>
                        <div className="text-3xl font-black text-slate-900 tracking-tighter tabular-nums mb-1">{stat.value}</div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Campaigns View Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-4">
                         <h2 className="text-xl font-black text-slate-900 tracking-tight lowercase">Broadcast Log<span className="text-indigo-600">_</span></h2>
                         <div className="h-5 w-px bg-slate-200 hidden sm:block" />
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:block">{campaigns.length} total nodes</span>
                    </div>
                    <div className="flex bg-slate-100 p-1.5 rounded-[18px] border border-slate-200/50">
                        <button className="px-5 py-2 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">History</button>
                        <button className="px-5 py-2 text-slate-400 hover:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Scheduled</button>
                    </div>
                </div>

                {campaigns.length === 0 ? (
                    <div className="py-24 text-center bg-slate-50/50 rounded-[48px] border-2 border-dashed border-slate-200/50">
                        <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200/50 border border-slate-100">
                             <Megaphone className="text-slate-300" size={32} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 lowercase">no broadcast active<span className="text-indigo-500">.</span></h3>
                        <p className="text-slate-400 text-sm max-w-xs mx-auto mt-3 font-medium">Ready to reach your audience at scale? Start your first campaign today.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5">
                         {campaigns.map((camp) => (
                             <motion.div 
                                 key={camp.id} 
                                 initial={{ opacity: 0, y: 10 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 className="bg-white p-8 rounded-[40px] border-2 border-slate-50 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all group relative overflow-hidden"
                             >
                                 <div className="flex flex-col lg:flex-row gap-10 lg:items-center">
                                     {/* Essential Identity */}
                                     <div className="flex-1 min-w-0">
                                         <div className="flex items-start justify-between gap-6">
                                             <div className="min-w-0">
                                                 <h3 className="text-xl font-black text-slate-900 tracking-tight lowercase leading-none mb-4 group-hover:text-indigo-600 transition-colors">{camp.name}</h3>
                                                 <div className="flex flex-wrap items-center gap-3">
                                                     <div className={clsx(
                                                         "flex items-center gap-2 px-3 py-1.5 rounded-[12px] border transition-all",
                                                         camp.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm shadow-emerald-100/50' : 'bg-slate-50 text-slate-400 border-slate-100'
                                                     )}>
                                                         <div className={clsx("w-1.5 h-1.5 rounded-full", camp.status === 'completed' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300')} />
                                                         <span className="text-[10px] font-black uppercase tracking-widest">{camp.status}</span>
                                                     </div>
                                                     <div className="px-3 py-1.5 rounded-[12px] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 flex items-center gap-2">
                                                         <Users size={12} strokeWidth={3} /> {camp.recipientType || 'AUDIENCE'}
                                                     </div>
                                                 </div>
                                             </div>
                                             
                                             <div className="lg:hidden text-right border-l pl-6 border-slate-100 flex flex-col items-end">
                                                  <Target size={14} className="text-indigo-600 mb-1" />
                                                  <div className="text-2xl font-black text-slate-900 tabular-nums leading-none italic">{camp.totalContacts || 0}</div>
                                             </div>
                                         </div>
                                         <div className="mt-8 flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                              <div className="flex items-center gap-2">
                                                  <Calendar size={12} className="text-slate-300" /> 
                                                  {new Date(camp.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                              </div>
                                              <div className="w-1 h-1 bg-slate-200 rounded-full" />
                                              <span>Broadcasting active</span>
                                         </div>
                                     </div>

                                     {/* Performance Fabric */}
                                     <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:border-l lg:pl-10 border-slate-100">
                                         {[
                                             { label: 'Delivered', value: camp.deliveredCount || 0, percent: ((camp.deliveredCount || 0) / Math.max(camp.totalContacts || 1, 1) * 100).toFixed(0), icon: CheckCircle2, color: 'emerald' },
                                             { label: 'Read Rate', value: camp.readCount || 0, percent: ((camp.readCount || 0) / Math.max(camp.totalContacts || 1, 1) * 100).toFixed(0), icon: Zap, color: 'blue' },
                                             { label: 'Failures', value: camp.failedCount || 0, percent: null, icon: AlertCircle, color: 'rose' },
                                             { label: 'Campaign Spend', value: `₹${(camp.totalCost || 0).toFixed(1)}`, percent: null, icon: Wallet, color: 'slate' },
                                         ].map((stat, i) => (
                                             <div key={i} className="min-w-[80px]">
                                                 <div className={clsx("flex items-center gap-1.5 text-sm font-black italic tabular-nums leading-none mb-2", `text-${stat.color}-600`)}>
                                                     {stat.percent ? `${stat.percent}%` : stat.value}
                                                     <stat.icon size={11} strokeWidth={3} />
                                                 </div>
                                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">{stat.label}</p>
                                             </div>
                                         ))}
                                     </div>

                                     {/* High Fidelity Count */}
                                     <div className="hidden lg:flex flex-col items-end border-l pl-10 border-slate-100 min-w-[120px]">
                                          <Target size={20} className="text-indigo-600 mb-2 opacity-20" />
                                          <div className="text-4xl font-black text-slate-900 tabular-nums italic leading-none">{camp.totalContacts || 0}</div>
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Target Nodes</p>
                                     </div>
                                 </div>
                             </motion.div>
                         ))}
                    </div>
                )}
            </div>

            {/* Campaign Launch Wizard - Aerostic Premium Glassmorphism */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 lg:p-12">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-xl" 
                            onClick={() => setShowModal(false)} 
                        />
                        
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 50 }}
                            className="relative w-full max-w-2xl bg-white sm:rounded-[48px] rounded-t-[48px] shadow-2xl border border-white/10 flex flex-col max-h-[90vh] overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="p-8 sm:p-12 pb-6 border-b border-slate-50 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                         <div className="w-8 h-8 bg-indigo-600 rounded-[12px] flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                                             <Megaphone size={16} strokeWidth={3} />
                                         </div>
                                         <h2 className="text-2xl font-black text-slate-900 tracking-tighter lowercase leading-none">Broadcast Orchestrator<span className="text-indigo-600">_</span></h2>
                                    </div>
                                    <div className="flex items-center gap-2 mt-4 ml-0.5">
                                        {[1, 2, 3].map(s => (
                                            <div key={s} className="h-1.5 transition-all duration-500 rounded-full bg-slate-100 overflow-hidden" style={{ width: s === step ? '48px' : '24px' }}>
                                                <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: s <= step ? '100%' : '0%' }} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={() => setShowModal(false)} className="w-12 h-12 flex items-center justify-center hover:bg-slate-50 rounded-full transition-colors text-slate-400"><X size={24} strokeWidth={2.5} /></button>
                            </div>

                            {/* Modal Body - Scoped by Step */}
                            <div className="p-8 sm:p-12 overflow-y-auto flex-1 space-y-10 focus:outline-none">
                                <AnimatePresence mode="wait">
                                    {step === 1 && (
                                        <motion.div 
                                            key="step1"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-8"
                                        >
                                            <div className="space-y-4">
                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Campaign Identity</label>
                                                <input
                                                    required
                                                    className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[24px] px-8 py-5 outline-none transition-all font-black text-slate-900 placeholder:text-slate-200 text-lg shadow-inner"
                                                    placeholder="e.g. spring_collection_2026"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center px-1">
                                                     <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Select Communication Template</label>
                                                     <Link href="/templates" className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline">New Template</Link>
                                                </div>
                                                <div className="relative group">
                                                    <select
                                                        className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[24px] px-8 py-5 outline-none transition-all font-black text-slate-900 appearance-none text-lg shadow-inner cursor-pointer"
                                                        required
                                                        value={formData.templateName}
                                                        onChange={(e) => {
                                                            const t = templates.find(temp => temp.name === e.target.value);
                                                            setFormData({
                                                                ...formData,
                                                                templateName: e.target.value,
                                                                templateLanguage: t?.language || 'en_US'
                                                            });
                                                        }}
                                                    >
                                                        <option value="" disabled>Choose approved vector...</option>
                                                        {templates.map(t => (
                                                            <option key={t.id} value={t.name}>{t.name} ({t.language || 'en_US'})</option>
                                                        ))}
                                                    </select>
                                                    <ChevronRight className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-indigo-600 transition-colors rotate-90" size={18} strokeWidth={3} />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === 2 && (
                                        <motion.div 
                                            key="step2"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-10"
                                        >
                                            <div className="flex p-2 bg-slate-100 rounded-[28px] border border-slate-200 shadow-inner">
                                                {['ALL', 'CSV', 'MANUAL'].map(type => (
                                                    <button
                                                        key={type}
                                                        onClick={() => setFormData({ ...formData, recipientType: type })}
                                                        className={clsx(
                                                            "flex-1 py-4 text-[10px] font-black rounded-[20px] transition-all uppercase tracking-widest",
                                                            formData.recipientType === type ? "bg-[#0F172A] text-white shadow-xl" : "text-slate-400 hover:text-slate-900"
                                                        )}
                                                    >
                                                        {type === 'ALL' ? 'GLOBAL_AUDIENCE' : type}
                                                    </button>
                                                ))}
                                            </div>

                                            {formData.recipientType === 'ALL' && (
                                                <div className="bg-indigo-600 rounded-[40px] p-10 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
                                                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                                                    <div className="flex gap-8 items-center">
                                                        <div className="w-16 h-16 bg-white/10 rounded-[24px] flex items-center justify-center text-white border border-white/20"><Users size={32} /></div>
                                                        <div>
                                                            <h4 className="font-black text-xl tracking-tight leading-none mb-2">Protocol: Entire Database</h4>
                                                            <p className="text-indigo-100 text-xs font-bold leading-relaxed opacity-80 uppercase tracking-widest">Targeting <span className="text-white bg-white/20 px-2 py-0.5 rounded-lg">{totalContactsCount}</span> integrated nodes.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {formData.recipientType === 'CSV' && (
                                                <div className="space-y-6">
                                                    <div className="border-4 border-dashed border-slate-100 rounded-[40px] p-14 text-center hover:bg-slate-50/50 hover:border-indigo-200 transition-all cursor-pointer group relative">
                                                        <input type="file" accept=".csv" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} />
                                                        <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-50 group-hover:scale-110 transition-all border border-slate-100">
                                                            <Upload size={32} className="text-slate-300 group-hover:text-indigo-500" />
                                                        </div>
                                                        <h4 className="font-black text-xl text-slate-900 tracking-tight lowercase">Upload CSV Intelligence_</h4>
                                                        <p className="text-[10px] text-slate-300 mt-2 font-black uppercase tracking-widest">Headers: phone, name (required)</p>
                                                    </div>
                                                    
                                                    {csvPreview.length > 0 && (
                                                        <div className="bg-[#0F172A] rounded-[32px] p-8 border border-white/10 shadow-2xl">
                                                            <div className="flex justify-between items-center mb-6">
                                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Data Sample ({formData.recipients.length} entries)</span>
                                                                <div className="flex gap-1">
                                                                     {[1,2,3].map(j => <div key={j} className="w-1 h-1 bg-indigo-500 rounded-full" />)}
                                                                </div>
                                                            </div>
                                                            <div className="space-y-3">
                                                                {csvPreview.map((r, i) => (
                                                                    <div key={i} className="flex justify-between text-[11px] font-black bg-white/5 p-4 rounded-xl border border-white/5 text-white/80">
                                                                        <span className="lowercase">{r.name}</span>
                                                                        <span className="tabular-nums text-indigo-400">{r.phoneNumber}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {formData.recipientType === 'MANUAL' && (
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center px-1">
                                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Direct Input Injection</label>
                                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">{formData.recipients.length} verified</span>
                                                    </div>
                                                    <textarea
                                                        className="w-full h-56 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[32px] p-8 outline-none transition-all font-black text-sm leading-relaxed shadow-inner placeholder:text-slate-200"
                                                        placeholder="919876543210, John Doe&#10;919988776655, Jane Smith"
                                                        value={manualInput}
                                                        onChange={(e) => setManualInput(e.target.value)}
                                                        onBlur={handleManualProcess}
                                                    />
                                                    <div className="flex items-center gap-2 ml-4">
                                                         <div className="w-1 h-1 bg-indigo-500 rounded-full" />
                                                         <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Format: phone, name (comma separated)</p>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {step === 3 && (
                                        <motion.div 
                                            key="step3"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="space-y-10"
                                        >
                                            <div className="bg-[#0F172A] rounded-[48px] p-10 sm:p-12 text-white shadow-2xl relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[100px] -z-10 group-hover:scale-150 transition-transform duration-1000" />
                                                <div className="flex justify-between items-start mb-10">
                                                    <div>
                                                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 italic mb-3">Protocol: Deployment Ready</div>
                                                        <p className="text-3xl font-black tracking-tighter truncate leading-tight lowercase">{formData.name}</p>
                                                    </div>
                                                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white border border-white/10 shadow-xl"><Megaphone size={28} /></div>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-10 pt-10 border-t border-white/10">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Node Count</p>
                                                        <p className="text-3xl font-black tabular-nums italic text-indigo-400">{estimatedContacts}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Credit Estimation</p>
                                                        <p className="text-3xl font-black tabular-nums italic text-emerald-400">₹{estimatedCost.toFixed(2)}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-10 bg-slate-50/50 rounded-[48px] border-2 border-slate-100 space-y-6">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-3 font-black text-slate-400 uppercase tracking-[0.2em] text-[11px]">
                                                        <Wallet size={16} className="text-indigo-500" /> Current Liquidity
                                                    </div>
                                                    <span className={clsx("text-lg font-black italic tabular-nums", canLaunch ? "text-emerald-600" : "text-rose-500")}>₹{walletBalance.toFixed(2)}</span>
                                                </div>
                                                
                                                {!canLaunch && (
                                                    <div className="p-6 bg-rose-50 border-2 border-rose-100 rounded-[28px] flex gap-5">
                                                        <AlertCircle className="text-rose-500 shrink-0" size={24} />
                                                        <div>
                                                            <h4 className="text-xs font-black text-rose-900 uppercase tracking-widest mb-1">Insufficient Liquidity</h4>
                                                            <p className="text-[10px] font-bold text-rose-800 leading-relaxed uppercase opacity-60">Add balance to clear deployment block.</p>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {canLaunch && (
                                                     <div className="flex items-center gap-4 px-2 py-1">
                                                          <ShieldCheck size={14} className="text-emerald-500" />
                                                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Encryption: AES-256 Protocol active</span>
                                                     </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Modal Footer - High Fidelity */}
                            <div className="p-8 sm:p-12 bg-slate-50/50 border-t border-slate-100 flex gap-4 sticky bottom-0 z-10 backdrop-blur-md">
                                <button
                                    onClick={() => step === 1 ? setShowModal(false) : setStep(step - 1)}
                                    className="px-10 py-5 bg-white border-2 border-slate-100 text-slate-400 font-black rounded-[24px] hover:bg-slate-900 hover:text-white transition-all active:scale-95 text-[11px] uppercase tracking-widest flex items-center justify-center gap-2"
                                >
                                    {step === 1 ? 'Cancel' : <><ChevronLeft size={16} strokeWidth={3} /> Back</>}
                                </button>

                                {step < 3 ? (
                                    <button
                                        onClick={() => setStep(step + 1)}
                                        disabled={step === 1 && (!formData.name || !formData.templateName)}
                                        className="flex-1 px-10 py-5 bg-indigo-600 text-white font-black rounded-[24px] hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-20 text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 group"
                                    >
                                        Access Next Node <ChevronRight size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleLaunch}
                                        disabled={loading || !canLaunch}
                                        className={clsx(
                                            "flex-1 px-10 py-5 text-white font-black rounded-[24px] transition-all active:scale-95 text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 group",
                                            loading || !canLaunch ? "bg-slate-200 cursor-not-allowed shadow-none" : "bg-indigo-600 hover:bg-indigo-700 shadow-2xl shadow-indigo-100"
                                        )}
                                    >
                                        {loading ? 'Orchestrating...' : <><Zap size={18} strokeWidth={3} className="fill-current group-hover:scale-125 transition-transform" /> Initiate Broadcast</>}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
