'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { 
    RefreshCw, Search, CheckCircle2, XCircle, Clock, Plus, 
    AlertCircle, FileText, Workflow, Link2, Sparkles, Filter, 
    MoreVertical, ArrowRight, ShieldCheck, Zap, Layers, Globe, Activity
} from 'lucide-react';
import CreateTemplateModal from './CreateTemplateModal';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

interface Template {
    id: string;
    name: string;
    status: string;
    category: string;
    language: string;
    components: any[];
    rejectionReason?: string;
}

const LANGUAGES: Record<string, string> = {
    en_US: 'English (US)', en_GB: 'English (UK)', hi: 'Hindi', ar: 'Arabic',
    es: 'Spanish', fr: 'French', de: 'German', pt_BR: 'Portuguese (BR)',
    id: 'Indonesian', ja: 'Japanese', ko: 'Korean', zh_CN: 'Chinese (Simplified)',
};

const LIBRARY_TEMPLATES = [
    { name: 'welcome_message', category: 'MARKETING', body: 'Hello {{1}}, welcome to {{2}}! We are excited to have you on board.', description: 'Warm welcome message for new customers.', icon: Sparkles },
    { name: 'special_offer', category: 'MARKETING', body: 'Exclusive Deal! 🌟 Get {{1}}% off on all {{2}} products. Use code {{3}} at checkout. Offer valid until {{4}}.', description: 'Promote a limited-time festive or seasonal offer.', icon: Zap },
    { name: 'abandoned_cart_recovery', category: 'MARKETING', body: 'Hi {{1}}, you left items in your cart. Complete your purchase now and get {{2}}% off! Click here: {{3}}', description: 'Recover lost sales.', icon: RefreshCw },
    { name: 'order_confirmation', category: 'UTILITY', body: 'Thank you for your order! 📦 Your order #{{1}} for {{2}} has been confirmed and will be shipped shortly.', description: 'Confirm a new order.', icon: CheckCircle2 },
    { name: 'shipping_update', category: 'UTILITY', body: 'Good news! 🚚 Your order #{{1}} has been shipped. Track your package here: {{2}}', description: 'Notify customers when their order ships.', icon: Globe },
    { name: 'appointment_reminder', category: 'UTILITY', body: 'Reminder: You have an appointment with us on {{1}} at {{2}}. Reply YES to confirm or NO to reschedule.', description: 'Remind customers of upcoming appointments.', icon: Clock },
    { name: 'feedback_request', category: 'UTILITY', body: 'Hi {{1}}, we hope you enjoyed your {{2}}. Would you mind rating your experience? It takes just a moment: {{3}}', description: 'Collect customer feedback.', icon: Activity },
    { name: 'auth_code', category: 'AUTHENTICATION', body: '{{1}} is your verification code. For your security, do not share this code.', description: 'Send a one-time password for login.', icon: ShieldCheck },
];

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [tenantId, setTenantId] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [view, setView] = useState<'mine' | 'library'>('mine');
    const [selectedLibraryTemplate, setSelectedLibraryTemplate] = useState<any>(null);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [search, setSearch] = useState('');

    const filteredTemplates = templates.filter(t => {
        const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
        const matchesSearch = !search || t.name.toLowerCase().includes(search.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    useEffect(() => {
        const init = async () => {
            try {
                const res = await api.get('/auth/me');
                if (res.data?.tenantId) {
                    setTenantId(res.data.tenantId);
                    fetchTemplates(res.data.tenantId);
                }
            } catch (e) {}
        };
        init();
    }, []);

    const fetchTemplates = async (tid: string) => {
        setLoading(true);
        try {
            const res = await api.get(`/templates?tenantId=${tid}`);
            setTemplates(res.data);
        } catch {} finally { setLoading(false); }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            await api.post('/templates/sync', { tenantId });
            await fetchTemplates(tenantId);
        } catch {} finally { setSyncing(false); }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-24 animate-in fade-in duration-700">
             {/* Header Section - Aerostic Premium */}
             <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse shadow-[0_0_12px_rgba(168,85,247,0.5)]" />
                        <span className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em] bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">Meta Sync protocol active</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter lowercase leading-none">Template Vector<span className="text-purple-600">.</span></h1>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-3 flex items-center gap-2">
                         <Layers size={12} className="text-purple-500" /> Communication Orchestration v2.5
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleSync} 
                        disabled={syncing}
                        className="group h-12 px-6 bg-white border-2 border-slate-50 text-slate-500 font-black rounded-[20px] hover:bg-slate-900 hover:text-white transition-all text-[11px] uppercase tracking-widest flex items-center gap-3 shadow-sm active:scale-95 disabled:opacity-30"
                    >
                        <RefreshCw size={16} strokeWidth={3} className={syncing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'} />
                        {syncing ? 'Syncing...' : 'Sync Meta'}
                    </button>
                    <button 
                        onClick={() => { setSelectedLibraryTemplate(null); setIsCreateModalOpen(true); }}
                        className="group flex items-center gap-3 p-1.5 pr-6 bg-[#0F172A] text-white rounded-[20px] hover:shadow-2xl hover:shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-95"
                    >
                         <div className="w-10 h-10 bg-purple-600 rounded-[14px] flex items-center justify-center shadow-lg group-hover:rotate-90 transition-transform">
                             <Plus size={20} strokeWidth={3} />
                         </div>
                         <span className="text-xs font-black uppercase tracking-widest ml-1">Generate Template</span>
                    </button>
                </div>
            </div>

            {/* Stats Bar - High Fidelity */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Vectors', count: templates.length, color: 'slate' },
                    { label: 'Approved', count: templates.filter(t => t.status === 'APPROVED').length, color: 'emerald' },
                    { label: 'Pending', count: templates.filter(t => t.status === 'PENDING').length, color: 'amber' },
                    { label: 'Rejected', count: templates.filter(t => t.status === 'REJECTED').length, color: 'rose' },
                ].map(s => (
                    <div key={s.label} className={clsx(
                        "p-6 rounded-[32px] border-2 shadow-sm transition-all relative overflow-hidden group",
                        s.color === 'slate' ? 'bg-white border-slate-50' : 
                        s.color === 'emerald' ? 'bg-emerald-50/30 border-emerald-50' :
                        s.color === 'amber' ? 'bg-amber-50/30 border-amber-50' : 'bg-rose-50/30 border-rose-50'
                    )}>
                        <div className={clsx(
                             "w-1.5 h-6 absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full transition-transform group-hover:scale-y-150",
                             `bg-${s.color}-500/40`
                        )} />
                        <div className="text-3xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">{s.count}</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* View Selection Hooks */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-[24px] border border-slate-200/50 w-fit">
                {[{ key: 'mine', label: 'My Templates', icon: FileText }, { key: 'library', label: 'Global Library', icon: Globe }].map(tab => (
                    <button 
                        key={tab.key} 
                        onClick={() => setView(tab.key as any)}
                        className={clsx(
                            "px-6 py-3 rounded-[18px] text-[10px] font-black transition-all flex items-center gap-2.5 uppercase tracking-widest",
                            view === tab.key ? 'bg-white shadow-xl text-slate-900 border border-slate-100' : 'text-slate-400 hover:text-slate-600'
                        )}
                    >
                        <tab.icon size={14} className={view === tab.key ? 'text-purple-600' : 'text-slate-300'} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <CreateTemplateModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => { setView('mine'); fetchTemplates(tenantId); }}
                tenantId={tenantId}
                initialData={selectedLibraryTemplate}
            />

            {view === 'mine' && (
                <div className="space-y-8">
                    {/* Filter Orchestrator */}
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                        <div className="relative flex-1 group">
                            <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-purple-500 transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Search template identity..."
                                value={search} onChange={e => setSearch(e.target.value)}
                                className="w-full pl-14 pr-8 py-5 bg-white border-2 border-slate-50 rounded-[28px] focus:border-purple-200 outline-none transition-all font-black text-slate-900 placeholder:text-slate-200 shadow-sm" 
                            />
                        </div>
                        <div className="flex gap-2 p-1.5 bg-slate-50 rounded-[24px] border border-slate-100">
                            {['ALL', 'APPROVED', 'PENDING', 'REJECTED'].map(s => (
                                <button 
                                    key={s} 
                                    onClick={() => setStatusFilter(s)}
                                    className={clsx(
                                        "px-5 py-3 text-[9px] font-black rounded-[18px] transition-all uppercase tracking-widest shrink-0",
                                        statusFilter === s ? 'bg-[#0F172A] text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'
                                    )}
                                >
                                    {s === 'ALL' ? 'All nodes' : s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Template High-Density Table */}
                    {loading ? (
                        <div className="text-center py-32 bg-slate-50/50 rounded-[48px] border-2 border-dashed border-slate-200/50 flex flex-col items-center gap-6">
                             <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin shadow-2xl" />
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Synchronizing Template Clusters...</p>
                        </div>
                    ) : filteredTemplates.length === 0 ? (
                        <div className="py-32 text-center bg-slate-50/50 rounded-[48px] border-2 border-dashed border-slate-200/50">
                            <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200/50 border border-slate-100">
                                 <FileText className="text-slate-300" size={32} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 lowercase">no templates discovered<span className="text-purple-500">.</span></h3>
                        </div>
                    ) : (
                        <div className="bg-white border-2 border-slate-50 rounded-[48px] overflow-hidden shadow-sm relative group overflow-x-auto">
                            <div className="min-w-[900px]">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/50 border-b-2 border-slate-50">
                                        <tr>
                                            {['Vector Identity', 'Protocol Type', 'Native Language', 'Governance Status', 'Last Sync', 'Actions'].map(h => (
                                                <th key={h} className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 font-black text-slate-900 text-sm">
                                        {filteredTemplates.map(tpl => {
                                            const hasFlow = tpl.components?.some((c: any) => c.type === 'BUTTONS' && c.buttons?.some((b: any) => b.type === 'FLOW'));
                                            return (
                                                <tr key={tpl.id} className="hover:bg-slate-50/30 transition-all group/row">
                                                    <td className="px-10 py-8">
                                                        <div className="flex items-center gap-5">
                                                            <div className={clsx(
                                                                "w-14 h-14 rounded-[20px] flex items-center justify-center transition-transform group-hover/row:scale-110",
                                                                hasFlow ? 'bg-purple-50 text-purple-600 shadow-xl shadow-purple-100/50' : 'bg-slate-50 text-slate-300'
                                                            )}>
                                                                {hasFlow ? <Workflow size={24} strokeWidth={2.5} /> : <FileText size={24} strokeWidth={2.5} />}
                                                            </div>
                                                            <div>
                                                                <div className="text-base font-black tracking-tight group-hover/row:text-purple-600 transition-colors lowercase italic">{tpl.name}</div>
                                                                {hasFlow && <div className="text-[9px] text-purple-500 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                                                                     <div className="w-1 h-1 bg-purple-500 rounded-full" /> Intelligence Loop active
                                                                </div>}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8">
                                                        <span className={clsx(
                                                            "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                                                            tpl.category === 'MARKETING' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-50 text-slate-400 border-slate-200'
                                                        )}>
                                                            {tpl.category}
                                                        </span>
                                                    </td>
                                                    <td className="px-10 py-8 font-bold text-slate-500 uppercase tracking-tight tabular-nums opacity-60">
                                                        {LANGUAGES[tpl.language] || tpl.language}
                                                    </td>
                                                    <td className="px-10 py-8">
                                                         <StatusBadge status={tpl.status} />
                                                    </td>
                                                    <td className="px-10 py-8 text-[10px] text-slate-300 uppercase font-black tracking-widest tabular-nums">
                                                        Mar 24, 2026
                                                    </td>
                                                    <td className="px-10 py-8">
                                                        <div className="flex items-center justify-end gap-3 translate-x-2 opacity-0 group-hover/row:opacity-100 group-hover/row:translate-x-0 transition-all">
                                                            {tpl.status === 'APPROVED' && (
                                                                <Link
                                                                    href={`/automation/builder?id=new&templateName=${encodeURIComponent(tpl.name)}&templateLanguage=${encodeURIComponent(tpl.language || 'en_US')}&triggerType=template_reply`}
                                                                    className="px-5 py-2.5 rounded-xl border-2 border-indigo-50 bg-white text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
                                                                >
                                                                    Connect Logic
                                                                </Link>
                                                            )}
                                                            <button className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-all border border-slate-100">
                                                                 <MoreHorizontal size={18} strokeWidth={3} />
                                                            </button>
                                                        </div>
                                                        {tpl.status === 'REJECTED' && tpl.rejectionReason && (
                                                            <div className="flex items-center gap-2 text-[9px] text-rose-500 font-black uppercase tracking-widest max-w-[180px] text-right justify-end group-hover/row:opacity-0 transition-opacity">
                                                                <AlertCircle size={10} className="shrink-0" />
                                                                <span className="truncate">{tpl.rejectionReason}</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {view === 'library' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                     {LIBRARY_TEMPLATES.map((tpl, i) => (
                         <motion.div 
                            key={tpl.name}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white border-2 border-slate-50 rounded-[40px] overflow-hidden flex flex-col hover:border-purple-200 hover:shadow-2xl hover:shadow-purple-500/5 transition-all group relative"
                         >
                            <div className="p-8 border-b border-slate-50">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-purple-50 group-hover:text-purple-600 group-hover:scale-110 transition-all">
                                         <tpl.icon size={24} strokeWidth={2.5} />
                                    </div>
                                    <span className={clsx(
                                        "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border",
                                        tpl.category === 'MARKETING' ? 'bg-purple-50 text-purple-700 border-purple-100 shadow-sm' : 'bg-slate-50 text-slate-400 border-slate-200'
                                    )}>{tpl.category}</span>
                                </div>
                                <h3 className="text-lg font-black text-slate-900 tracking-tight lowercase truncate mb-2">{tpl.name.split('_').join(' ')}</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest line-clamp-1 leading-relaxed opacity-60 italic">{tpl.description}</p>
                            </div>
                            <div className="p-8 flex-1 bg-slate-50/50">
                                <div className="bg-white rounded-[24px] p-6 text-sm text-slate-600 border-2 border-slate-100/50 line-clamp-4 text-xs leading-relaxed italic shadow-inner">
                                    "{tpl.body}"
                                </div>
                            </div>
                            <div className="p-8">
                                <button 
                                    onClick={() => { setSelectedLibraryTemplate({ name: tpl.name, category: tpl.category, body: tpl.body, language: 'en_US' }); setIsCreateModalOpen(true); }}
                                    className="w-full py-4 bg-[#0F172A] text-white font-black rounded-[20px] hover:shadow-2xl hover:shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-95 text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 group/btn"
                                >
                                    Access Protocol <ArrowRight size={14} strokeWidth={3} className="group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </div>
                         </motion.div>
                     ))}
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'APPROVED') return (
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[12px] text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-widest shadow-sm">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Approved
        </span>
    );
    if (status === 'REJECTED') return (
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[12px] text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-100 uppercase tracking-widest shadow-sm">
             <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
             Rejected
        </span>
    );
    return (
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[12px] text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-widest shadow-sm">
             <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" />
             {status}
        </span>
    );
}
