'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
    Globe, Plus, Trash2, FileText, Search, Database,
    Upload, CheckCircle, AlertCircle, Sparkles, ChevronRight,
    Braces, BookOpen, Clock, Settings
} from 'lucide-react';
import { clsx } from 'clsx';

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
        try {
            const res = await fetch('/api/v1/ai/knowledge-bases');
            if (res.ok) {
                const data = await res.json();
                setKbs(data);
                if (data.length > 0 && !selectedKbId) {
                    setSelectedKbId(data[0].id);
                }
            }
        } catch (error) {
            console.error('Failed to fetch KBs', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateKb = async () => {
        if (!newKbName.trim()) return;
        setCreating(true);
        try {
            const res = await fetch('/api/v1/ai/knowledge-bases', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newKbName, description: newKbDesc }),
            });
            if (res.ok) {
                const newKb = await res.json();
                setKbs([...kbs, newKb]);
                setSelectedKbId(newKb.id);
                setShowCreateModal(false);
                setNewKbName('');
                setNewKbDesc('');
            }
        } catch (error) {
            console.error('Failed to create KB', error);
        } finally {
            setCreating(false);
        }
    };

    const handleIngest = async () => {
        if (!selectedKbId || !ingestText.trim()) return;
        setIngesting(true);
        setIngestionResult(null);
        try {
            const res = await fetch('/api/v1/ai/knowledge-bases/ingest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    knowledgeBaseId: selectedKbId,
                    content: ingestText,
                    metadata: { type: 'manual_entry', timestamp: new Date().toISOString() }
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setIngestionResult({ success: true, count: data.chunkCount });
                setIngestText('');
            } else {
                setIngestionResult({ success: false, error: 'Failed to process document' });
            }
        } catch (error) {
            setIngestionResult({ success: false, error: 'Connection error' });
        } finally {
            setIngesting(false);
        }
    };

    const selectedKb = kbs.find(k => k.id === selectedKbId);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
                    <p className="text-sm text-gray-500">Train your AI with company documents and FAQs</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    New Vault
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-250px)]">
                {/* Sidebar: List of KBs */}
                <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
                    <div className="p-4 border-b bg-gray-50/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search vaults..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {kbs.map(kb => (
                            <button
                                key={kb.id}
                                onClick={() => setSelectedKbId(kb.id)}
                                className={clsx(
                                    "w-full text-left p-3 rounded-xl transition-all group relative",
                                    selectedKbId === kb.id
                                        ? "bg-blue-50 border-blue-100 ring-1 ring-blue-200"
                                        : "hover:bg-gray-50 border-transparent"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={clsx(
                                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                                        selectedKbId === kb.id ? "bg-white text-blue-600 shadow-sm" : "bg-gray-100 text-gray-500"
                                    )}>
                                        <Database size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className={clsx("font-bold text-sm truncate", selectedKbId === kb.id ? "text-blue-900" : "text-gray-700")}>
                                            {kb.name}
                                        </p>
                                        <p className="text-[10px] text-gray-500 truncate">{kb.description || 'No description'}</p>
                                    </div>
                                    <ChevronRight size={14} className={clsx("ml-auto text-gray-400", selectedKbId === kb.id ? "opacity-100" : "opacity-0")} />
                                </div>
                            </button>
                        ))}
                        {kbs.length === 0 && (
                            <div className="p-10 text-center">
                                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm text-gray-500">No knowledge bases yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content: Ingestion & Chunks */}
                <div className="lg:col-span-8 flex flex-col gap-6 overflow-y-auto pr-2">
                    {selectedKb ? (
                        <>
                            {/* Ingestion Section */}
                            <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                                <div className="p-4 border-b bg-gray-50/50 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Upload size={18} className="text-blue-600" />
                                        <h3 className="font-bold text-gray-800">Add Knowledge</h3>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    <p className="text-xs text-gray-500 italic">
                                        Paste document text below. Our engine will automatically chunk the content and generate AI embeddings for semantic retrieval.
                                    </p>
                                    <textarea
                                        value={ingestText}
                                        onChange={(e) => setIngestText(e.target.value)}
                                        className="w-full h-64 p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none resize-none font-sans"
                                        placeholder="e.g. Aimstors Solution Pricing Plan: Starter costs $29/mo, includes 1000 messages. Growth costs $99/mo..."
                                    />
                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex items-center gap-4">
                                            {ingestionResult && (
                                                <div className={clsx(
                                                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold animate-in fade-in zoom-in",
                                                    ingestionResult.success ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
                                                )}>
                                                    {ingestionResult.success ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                                                    {ingestionResult.success ? `Successfully ingested ${ingestionResult.count} chunks` : ingestionResult.error}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={handleIngest}
                                            disabled={ingesting || !ingestText.trim()}
                                            className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-black transition-all disabled:opacity-50"
                                        >
                                            {ingesting ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <Sparkles size={16} />
                                            )}
                                            {ingesting ? 'Processing...' : 'Ingest Document'}
                                        </button>
                                    </div>
                                </div>
                            </section>

                            <section className="bg-white rounded-2xl border border-gray-200 p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-50 rounded-xl">
                                        <Braces size={24} className="text-purple-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Workflow Integration</h4>
                                        <p className="text-xs text-gray-500 uppercase tracking-widest font-mono mt-1">ID: {selectedKb.id}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600 mb-1">Created {new Date(selectedKb.createdAt).toLocaleDateString()}</p>
                                    <button className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 ml-auto">
                                        <Trash2 size={12} />
                                        Delete Vault
                                    </button>
                                </div>
                            </section>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-gray-50/50 border border-dashed border-gray-300 rounded-2xl p-10 text-center">
                            <Database className="w-16 h-16 text-gray-300 mb-4" />
                            <h3 className="text-xl font-bold text-gray-700">Select a Knowledge Vault</h3>
                            <p className="text-gray-500 max-w-sm mt-2">
                                Choose a knowledge base from the left or create a new one to start training your AI with company-specific data.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create KB Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                                    <Globe className="text-blue-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">New Vault</h3>
                                    <p className="text-sm text-gray-500">Create a repository for your data</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Vault Name</label>
                                    <input
                                        type="text"
                                        value={newKbName}
                                        onChange={(e) => setNewKbName(e.target.value)}
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                        placeholder="e.g. Company Handbook"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Description</label>
                                    <textarea
                                        value={newKbDesc}
                                        onChange={(e) => setNewKbDesc(e.target.value)}
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none resize-none h-24"
                                        placeholder="What kind of information lives here?"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateKb}
                                    disabled={creating || !newKbName.trim()}
                                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-lg shadow-blue-500/20"
                                >
                                    {creating ? 'Creating...' : 'Create Vault'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
