'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import api from '@/lib/api';
import { 
    Plus, Search, Filter, MoreHorizontal, ChevronRight, 
    User, Phone, Mail, Kanban, ArrowRight, X, 
    CheckCircle2, AlertCircle, TrendingUp, Zap, 
    GripHorizontal, RefreshCw, Trophy, Target, ShieldCheck
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import LeadCard from '@/components/crm/LeadCard';

enum ContactStatus {
    NEW = 'NEW',
    CONTACTED = 'CONTACTED',
    QUALIFIED = 'QUALIFIED',
    PROPOSAL = 'PROPOSAL',
    WON = 'WON',
    LOST = 'LOST',
}

interface Contact {
    id: string;
    name: string;
    phoneNumber: string;
    email?: string;
    status: ContactStatus;
    score: number;
    createdAt: string;
    updatedAt?: string;
}

const COLUMNS = [
    { id: ContactStatus.NEW, title: 'Unqualified', color: 'bg-blue-600', text: 'text-blue-600', bg: 'bg-blue-50', icon: Target },
    { id: ContactStatus.CONTACTED, title: 'Engagement', color: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-50', icon: RefreshCw },
    { id: ContactStatus.QUALIFIED, title: 'Vetted', color: 'bg-purple-600', text: 'text-purple-600', bg: 'bg-purple-50', icon: Zap },
    { id: ContactStatus.PROPOSAL, title: 'Negotiation', color: 'bg-indigo-600', text: 'text-indigo-600', bg: 'bg-indigo-50', icon: Mail },
    { id: ContactStatus.WON, title: 'Conversion', color: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50', icon: Trophy },
    { id: ContactStatus.LOST, title: 'Archived', color: 'bg-rose-500', text: 'text-rose-600', bg: 'bg-rose-50', icon: X },
];

export default function LeadsPage() {
    const params = useParams();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [tenantId, setTenantId] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Contact | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [newLead, setNewLead] = useState({ name: '', phoneNumber: '', email: '', status: ContactStatus.NEW });

    const fetchLeads = useCallback(async (tid: string) => {
        if (!tid) return;
        try {
            const res = await api.get('/contacts'); // api handles header via interceptor if cached, or consistent logic
            setContacts(res.data);
        } catch (error) {
            console.error('Failed to fetch leads', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            const workspaceSlug = params.workspaceId as string;
            if (!workspaceSlug) return;

            try {
                const res = await api.get('/auth/workspaces');
                const activeMembership = res.data.find((m: any) => 
                    m.tenant?.slug === workspaceSlug || m.tenant?.id === workspaceSlug
                );

                if (activeMembership?.tenant?.id) {
                    setTenantId(activeMembership.tenant.id);
                    fetchLeads(activeMembership.tenant.id);
                }
            } catch (e) {
                console.error('Failed to init leads page', e);
                setLoading(false);
            }
        };
        init();
    }, [params.workspaceId, fetchLeads]);

    const updateLeadStatus = async (id: string, newStatus: ContactStatus) => {
        // Optimistic update
        setContacts(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
        try {
            await api.patch(`/contacts/${id}`, { status: newStatus });
        } catch (error) {
            console.error('Failed to update status', error);
            fetchLeads(tenantId); // Rollback on error
        }
    };

    const handleAddLead = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/contacts', { ...newLead, tenantId });
            setShowAddModal(false);
            setNewLead({ name: '', phoneNumber: '', email: '', status: ContactStatus.NEW });
            fetchLeads(tenantId);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to add lead. Contact support.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditLead = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLead) return;
        setSubmitting(true);
        try {
            // FIX: Use PATCH as the backend doesn't have a PUT endpoint
            await api.patch(`/contacts/${selectedLead.id}`, { 
                name: selectedLead.name,
                phoneNumber: selectedLead.phoneNumber,
                email: selectedLead.email,
                status: selectedLead.status
            });
            setShowEditModal(false);
            setSelectedLead(null);
            fetchLeads(tenantId);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to update lead');
        } finally {
            setSubmitting(false);
        }
    };

    const getLeadsByStatus = (status: ContactStatus) => {
        return contacts.filter((c) => 
            c.status === status && 
            (c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phoneNumber.includes(searchTerm))
        );
    };

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
                 <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Resolving Revenue Vectors...</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Header Section - Premium */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100">
                            <Kanban size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Pipeline</h1>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                <TrendingUp size={12} className="text-emerald-500" /> Real-time Revenue Intelligence
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Find high-value leads..."
                            className="pl-14 pr-8 py-4 bg-white border-2 border-slate-50 focus:border-indigo-600 focus:bg-white rounded-[24px] outline-none transition-all w-80 font-bold text-sm shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <motion.button 
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowAddModal(true)} 
                        className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[24px] hover:shadow-2xl hover:shadow-slate-200 transition-all shadow-lg font-black text-sm"
                    >
                        <Plus size={22} strokeWidth={3} />
                        Capture Lead
                    </motion.button>
                </div>
            </div>

            {/* Pipeline Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {COLUMNS.map((col, i) => (
                    <motion.div 
                        key={col.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={clsx("p-5 rounded-[32px] border transition-all flex flex-col gap-3", col.bg, "border-transparent shadow-sm")}
                    >
                        <div className="flex items-center justify-between">
                            <div className={clsx("p-2 rounded-xl text-white shadow-lg", col.color)}>
                                <col.icon size={16} strokeWidth={3} />
                            </div>
                            <span className={clsx("text-xl font-black tabular-nums tracking-tighter", col.text)}>
                                {getLeadsByStatus(col.id).length}
                            </span>
                        </div>
                        <p className={clsx("text-[9px] font-black uppercase tracking-widest", col.text)}>{col.title}</p>
                    </motion.div>
                ))}
            </div>

            {/* Kanban Board - Premium Horizontal Flow */}
            <div className="flex-1 overflow-x-auto pb-8 custom-scrollbar">
                <div className="flex gap-8 min-w-max h-full px-1 pt-2">
                    {COLUMNS.map((column, idx) => (
                        <div key={column.id} className="w-[380px] flex flex-col group/column relative">
                            {/* Visual Connecting Gradient Sidebar Area */}
                            <div className="absolute -left-4 top-0 bottom-0 w-px bg-slate-100" />
                            
                            {/* Column Header */}
                            <div className="mb-6 flex items-center justify-between px-4 pb-2 border-b-2 border-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className={clsx(`w-2 h-2 rounded-full`, column.color)} />
                                    <h2 className="font-black text-slate-800 text-[12px] uppercase tracking-[0.2em]">{column.title}</h2>
                                </div>
                                <div className="p-1 px-3 bg-white border border-slate-100 rounded-full shadow-sm text-[10px] font-black text-slate-400">
                                    {getLeadsByStatus(column.id).length}
                                </div>
                            </div>

                            {/* Drop Zone / Column Content */}
                            <div className="flex-1 p-3 space-y-5 overflow-y-auto max-h-[calc(100vh-420px)] rounded-[40px] bg-white border-2 border-slate-50/50 group-hover/column:border-slate-200/50 group-hover/column:bg-slate-50/20 transition-all duration-500 custom-scrollbar-hidden">
                                <AnimatePresence mode="popLayout">
                                    {getLeadsByStatus(column.id).map((lead, leadIdx) => (
                                        <motion.div
                                            key={lead.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9, x: 20 }}
                                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                                        >
                                            <LeadCard 
                                                lead={lead} 
                                                onClick={() => { setSelectedLead(lead); setShowEditModal(true); }}
                                                onMove={(newStatus) => updateLeadStatus(lead.id, newStatus as ContactStatus)}
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {getLeadsByStatus(column.id).length === 0 && (
                                    <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[32px] text-slate-200 gap-4 opacity-50">
                                        <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center">
                                            <GripHorizontal size={24} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Vault Empty</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modals - Refactored to Premium Glassmorphism */}
            <AnimatePresence>
                {(showAddModal || (showEditModal && selectedLead)) && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
                            onClick={() => { setShowAddModal(false); setShowEditModal(false); }} 
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-[48px] shadow-2xl overflow-hidden shadow-indigo-100"
                        >
                            <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">{showAddModal ? 'Capture Lead' : 'Lead Intel'}</h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Universal Customer Entry</p>
                                </div>
                                <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="p-3 hover:bg-white rounded-2xl transition-all text-slate-400 border border-transparent hover:border-slate-100 shadow-sm"><X size={24} strokeWidth={3} /></button>
                            </div>

                            <form onSubmit={showAddModal ? handleAddLead : handleEditLead} className="p-10 space-y-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Identity</label>
                                        <div className="relative group">
                                            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                                            <input
                                                required
                                                type="text"
                                                className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-[24px] outline-none transition-all font-bold text-slate-900"
                                                value={showAddModal ? newLead.name : selectedLead?.name}
                                                onChange={(e) => showAddModal ? setNewLead({ ...newLead, name: e.target.value }) : setSelectedLead({ ...selectedLead!, name: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Vector</label>
                                            <div className="relative group">
                                                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                                                <input
                                                    required
                                                    type="text"
                                                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-[24px] outline-none transition-all font-bold text-slate-900"
                                                    value={showAddModal ? newLead.phoneNumber : selectedLead?.phoneNumber}
                                                    onChange={(e) => showAddModal ? setNewLead({ ...newLead, phoneNumber: e.target.value }) : setSelectedLead({ ...selectedLead!, phoneNumber: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stage Placement</label>
                                            <div className="relative group">
                                                <Kanban className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                                                <select
                                                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-[24px] outline-none transition-all font-bold text-slate-900 appearance-none cursor-pointer"
                                                    value={showAddModal ? newLead.status : selectedLead?.status}
                                                    onChange={(e) => showAddModal ? setNewLead({ ...newLead, status: e.target.value as ContactStatus }) : setSelectedLead({ ...selectedLead!, status: e.target.value as ContactStatus })}
                                                >
                                                    {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Connection (Optional)</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                                            <input
                                                type="email"
                                                className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-[24px] outline-none transition-all font-bold text-slate-900"
                                                value={showAddModal ? newLead.email : selectedLead?.email || ''}
                                                onChange={(e) => showAddModal ? setNewLead({ ...newLead, email: e.target.value }) : setSelectedLead({ ...selectedLead!, email: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 space-y-4">
                                    <button 
                                        type="submit" 
                                        disabled={submitting}
                                        className="w-full h-20 bg-slate-900 text-white rounded-[32px] font-black text-xl hover:shadow-2xl hover:shadow-slate-200 transition-all disabled:opacity-50 flex items-center justify-center gap-4 group"
                                    >
                                        {submitting ? (
                                            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                {showAddModal ? 'Commit New Lead' : 'Synchronize Intel'}
                                                <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" strokeWidth={3} />
                                            </>
                                        )}
                                    </button>
                                    <div className="flex items-center justify-center gap-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] py-2">
                                        <ShieldCheck size={14} className="text-emerald-500" /> AES-256 Encrypted Transfer
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
