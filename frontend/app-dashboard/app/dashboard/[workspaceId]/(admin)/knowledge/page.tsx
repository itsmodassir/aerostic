'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
    Globe, Plus, Trash2, FileText, Search, Database,
    Upload, CheckCircle2, AlertCircle, Sparkles, ChevronRight,
    Braces, BookOpen, Clock, Settings, Zap, ArrowRight, Activity, 
    Layers, ShieldCheck, Microscope, Info
} from 'lucide-react';
import api from '@/lib/api';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface KnowledgeBase {
    id: string;
    name: string;
    description: string;
    createdAt: string;
}

export default function KnowledgeBasePage() {
    const params = useParams();
    const workspaceId = params.workspaceId as string;

    const [kbs, setKbs] = useState<KnowledgeBase[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedKbId, setSelectedKbId] = useState<string | null>(null);

    // Create KB state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newKbName, setNewKbName] = useState('');
    const [newKbDesc, setNewKbDesc] = useState('');
    const [creating, setCreating] = useState(false);

    // Ingestion state
    const [ingestText, setIngestText] = useState('');
    const [ingesting, setIngesting] = useState(false);
    const [ingestionResult, setIngestionResult] = useState<any>(null);

    useEffect(() => {
        fetchKbs();
    }, []);

    const fetchKbs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/ai/knowledge-bases');
            if (res.data) {
                setKbs(res.data);
                if (res.data.length > 0 && !selectedKbId) {
                    setSelectedKbId(res.data[0].id);
                }
            }
        } catch (error) {
            console.error('Failed to fetch KBs', error);
            toast.error('Sync failure: Knowledge warehouse');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateKb = async () => {
        if (!newKbName.trim()) return;
        setCreating(true);
        try {
            const res = await api.post('/ai/knowledge-bases', { 
                name: newKbName, 
                description: newKbDesc 
            });
            if (res.data) {
                const newKb = res.data;
                setKbs([...kbs, newKb]);
                setSelectedKbId(newKb.id);
                setShowCreateModal(false);
                setNewKbName('');
                setNewKbDesc('');
                toast.success('Knowledge Vault Generated');
            }
        } catch (error) {
            console.error('Failed to create KB', error);
            toast.error('Generation failure');
        } finally {
            setCreating(false);
        }
    };

    const handleIngest = async () => {
        if (!selectedKbId || !ingestText.trim()) return;
        setIngesting(true);
        setIngestionResult(null);
        try {
            const res = await api.post('/ai/knowledge-bases/ingest', {
                knowledgeBaseId: selectedKbId,
                content: ingestText,
                metadata: { type: 'manual_entry', timestamp: new Date().toISOString() }
            });
            if (res.data) {
                setIngestionResult({ success: true, count: res.data.chunkCount });
                setIngestText('');
                toast.success('Protocol ingested successfully');
            } else {
                setIngestionResult({ success: false, error: 'Failed to process document' });
            }
        } catch (error) {
            setIngestionResult({ success: false, error: 'Connection error' });
            toast.error('Ingestion protocol interrupted');
        } finally {
            setIngesting(false);
        }
    };

    const handleDeleteKb = async (id: string) => {
        if (!confirm('Are you sure you want to purge this intelligence vault?')) return;
        try {
            await api.delete(`/ai/knowledge-bases/${id}`);
            const updated = kbs.filter(k => k.id !== id);
            setKbs(updated);
            if (selectedKbId === id) setSelectedKbId(updated[0]?.id || null);
            toast.success('Vault purged');
        } catch (e) {
            toast.error('Purge failed');
        }
    };

    const selectedKb = kbs.find(k => k.id === selectedKbId);

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-24 animate-in fade-in duration-700">
             {/* Header Section - Aerostic Premium */}
             <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">Knowledge Warehouse v2.5</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter lowercase leading-none">Intelligence Vaults<span className="text-emerald-600">.</span></h1>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-3 flex items-center gap-2">
                         <Microscope size={12} className="text-emerald-500" /> semantic ingestion & retrieval layers
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="group flex items-center gap-3 p-1.5 pr-6 bg-[#0F172A] text-white rounded-[20px] hover:shadow-2xl hover:shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-95"
                    >
                         <div className="w-10 h-10 bg-emerald-600 rounded-[14px] flex items-center justify-center shadow-lg group-hover:rotate-90 transition-transform">
                             <Plus size={20} strokeWidth={3} />
                         </div>
                         <span className="text-xs font-black uppercase tracking-widest ml-1">Generate Vault</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-280px)]">
                {/* Sidebar: List of Vaults - Aerostic Premium */}
                <div className="lg:col-span-4 bg-white rounded-[40px] border-2 border-slate-50 overflow-hidden flex flex-col shadow-sm">
                    <div className="p-8 border-b-2 border-slate-50 bg-slate-50/30">
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-emerald-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search vaults..."
                                className="w-full pl-14 pr-8 py-4 bg-white border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-200 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {loading ? (
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className="h-20 bg-slate-50 rounded-3xl animate-pulse" />
                            ))
                        ) : kbs.map(kb => (
                            <button
                                key={kb.id}
                                onClick={() => setSelectedKbId(kb.id)}
                                className={clsx(
                                    "w-full text-left p-6 rounded-[28px] transition-all group relative border-2",
                                    selectedKbId === kb.id
                                        ? "bg-emerald-50/50 border-emerald-100 shadow-xl shadow-emerald-500/5"
                                        : "hover:bg-slate-50 border-transparent text-slate-400"
                                )}
                            >
                                <div className="flex items-center gap-5">
                                    <div className={clsx(
                                        "w-12 h-12 rounded-[18px] flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110",
                                        selectedKbId === kb.id ? "bg-white text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-300"
                                    )}>
                                        <Database size={24} strokeWidth={2.5} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className={clsx("font-black text-sm lowercase transition-colors", selectedKbId === kb.id ? "text-slate-900" : "group-hover:text-slate-600")}>
                                            {kb.name}
                                        </p>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-0.5 truncate">{kb.description || 'Global Protocol'}</p>
                                    </div>
                                    <ChevronRight size={14} className={clsx("text-emerald-400 group-hover:translate-x-1 transition-all", selectedKbId === kb.id ? "opacity-100" : "opacity-0")} />
                                </div>
                            </button>
                        ))}
                        {kbs.length === 0 && !loading && (
                            <div className="py-20 text-center opacity-40 grayscale group">
                                <BookOpen className="w-16 h-16 text-slate-200 mx-auto mb-6 group-hover:scale-110 transition-transform" />
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest lowercase">no intelligence vectors discovered<span className="text-emerald-500">.</span></h3>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content: Training Lab */}
                <div className="lg:col-span-8 flex flex-col gap-8 overflow-y-auto pr-4 custom-scrollbar">
                    {selectedKb ? (
                        <>
                            {/* Ingestion Section - High Fidelity */}
                            <motion.section 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-[48px] border-2 border-slate-50 overflow-hidden shadow-sm relative group"
                            >
                                <div className="p-8 border-b-2 border-slate-50 bg-slate-50/30 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                         <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 border border-emerald-100 shadow-sm shadow-emerald-500/5">
                                             <Sparkles size={18} strokeWidth={3} />
                                         </div>
                                         <div>
                                             <h3 className="text-xl font-black text-slate-900 tracking-tight lowercase italic">Training_Protocol<span className="text-emerald-600">_</span></h3>
                                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Manual Retrieval Augmented Generation</p>
                                         </div>
                                    </div>
                                    <button 
                                        className="h-10 px-4 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-colors"
                                    >
                                         <Settings size={14} /> Protocol Config
                                    </button>
                                </div>
                                <div className="p-10 space-y-6">
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-loose flex items-center gap-3">
                                        <Info size={14} className="text-emerald-500" />
                                        Engine will automatically chunk document content into vectors for semantic access.
                                    </p>
                                    <div className="relative group/field">
                                        <textarea
                                            value={ingestText}
                                            onChange={(e) => setIngestText(e.target.value)}
                                            className="w-full h-80 p-8 bg-slate-50/50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-[32px] text-base font-bold outline-none transition-all resize-none shadow-inner placeholder:text-slate-200 text-slate-900 leading-relaxed italic"
                                            placeholder="Paste knowledge payload here (FAQs, System Manuals, Product Specs)..."
                                        />
                                        <div className="absolute right-8 bottom-8 flex gap-3">
                                            {ingestionResult && (
                                                <motion.div 
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className={clsx(
                                                        "flex items-center gap-3 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl",
                                                        ingestionResult.success ? "bg-emerald-600 text-white shadow-emerald-500/20" : "bg-rose-600 text-white shadow-rose-500/20"
                                                    )}
                                                >
                                                    {ingestionResult.success ? <CheckCircle2 size={16} strokeWidth={3} /> : <AlertCircle size={16} strokeWidth={3} />}
                                                    {ingestionResult.success ? `${ingestionResult.count} chunks optimized` : 'Ingestion failure'}
                                                </motion.div>
                                            )}
                                            <button
                                                onClick={handleIngest}
                                                disabled={ingesting || !ingestText.trim()}
                                                className="group flex items-center gap-3 p-1.5 pr-8 bg-[#0F172A] text-white rounded-[20px] hover:shadow-2xl hover:shadow-emerald-500/20 transition-all disabled:opacity-50 active:scale-95 translate-y-0 hover:-translate-y-1"
                                            >
                                                <div className="w-12 h-12 bg-emerald-600 rounded-[18px] flex items-center justify-center shadow-lg group-hover:rotate-90 transition-transform">
                                                    {ingesting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Layers size={20} strokeWidth={3} />}
                                                </div>
                                                <div className="flex flex-col items-start translate-y-0.5">
                                                    <span className="text-xs font-black uppercase tracking-widest leading-none">Process Payload</span>
                                                    <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mt-1">Execute Sync_</span>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.section>

                            <motion.section 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white rounded-[40px] border-2 border-slate-50 p-10 flex items-center justify-between shadow-sm"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-indigo-500/20">
                                        <Braces size={28} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-slate-900 lowercase italic">Protocol_Interoperability<span className="text-indigo-600">.</span></h4>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5 opacity-60">Global unique identifier: {selectedKb.id}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-3">
                                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-100">
                                        <Clock size={12} /> Sync {new Date(selectedKb.createdAt).toLocaleDateString()}
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteKb(selectedKb.id)}
                                        className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-700 transition-colors flex items-center gap-2 group"
                                    >
                                        <Trash2 size={12} className="group-hover:scale-110 transition-transform" /> Purge Protocol
                                    </button>
                                </div>
                            </motion.section>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-slate-50/50 border-2 border-dashed border-slate-200/50 rounded-[48px] p-24 text-center">
                            <Database className="w-20 h-20 text-slate-200 mb-8" />
                            <h3 className="text-2xl font-black text-slate-900 lowercase italic">initiate knowledge loop<span className="text-emerald-500">_</span></h3>
                            <p className="text-slate-400 max-w-sm mt-3 text-sm font-medium leading-relaxed italic">
                                Select a knowledge vault from the warehouse or initiate a new intelligence protocol to train your AI agents.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create KB Modal - Aerostic Premium */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
                            onClick={() => setShowCreateModal(false)} 
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-[48px] shadow-2xl p-12 overflow-hidden border-2 border-slate-50"
                        >
                            <div className="flex items-center gap-6 mb-10">
                                <div className="w-16 h-16 bg-emerald-600 rounded-[28px] flex items-center justify-center text-white shadow-xl shadow-emerald-100">
                                    <Globe size={28} strokeWidth={3} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight lowercase">Vault Initialization<span className="text-emerald-600">_</span></h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol configuration warehouse</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Protocol Identifier</label>
                                    <input
                                        type="text"
                                        value={newKbName}
                                        onChange={(e) => setNewKbName(e.target.value)}
                                        className="w-full p-6 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-[24px] text-base font-bold outline-none transition-all shadow-inner placeholder:text-slate-200"
                                        placeholder="e.g. core_pricing_handbook_v1"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Protocol Metadata</label>
                                    <textarea
                                        value={newKbDesc}
                                        onChange={(e) => setNewKbDesc(e.target.value)}
                                        className="w-full p-6 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-[24px] text-base font-bold outline-none transition-all shadow-inner placeholder:text-slate-200 h-32 resize-none leading-relaxed"
                                        placeholder="Vault scope and data sensitivity..."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-10">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-5 bg-slate-50 text-slate-400 rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-100 transition-colors border border-slate-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateKb}
                                    disabled={creating || !newKbName.trim()}
                                    className="flex-1 py-5 bg-[#0F172A] text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-emerald-500/20 transition-all disabled:opacity-50 shadow-lg shadow-slate-200 group relative overflow-hidden"
                                >
                                    <div className="relative z-10 flex items-center justify-center gap-3">
                                        {creating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ShieldCheck size={16} strokeWidth={3} />}
                                        {creating ? 'Synchronizing...' : 'Initialize Vault'}
                                    </div>
                                    <div className="absolute inset-0 bg-emerald-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
