'use client';

import { useEffect, useState, useRef } from 'react';
import { Bot, Save, Sparkles, UploadCloud, FileText, CheckCircle, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function AiSettingsPage() {
    const [agent, setAgent] = useState({
        isActive: true,
        systemPrompt: "You are a helpful and friendly customer support agent for Aimstors Solution. Answer concisely.",
        intentDetection: false,
        personalizationEnabled: false,
    });

    const [defaultKb, setDefaultKb] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [agentRes, kbRes] = await Promise.all([
                fetch('/api/v1/ai/agent', { credentials: 'include' }),
                fetch('/api/v1/ai/knowledge-bases', { credentials: 'include' })
            ]);

            if (agentRes.ok) {
                const data = await agentRes.json();
                setAgent({
                    isActive: data.isActive ?? data.active ?? true,
                    systemPrompt: data.systemPrompt || '',
                    intentDetection: data.intentDetection || false,
                    personalizationEnabled: data.personalizationEnabled || false,
                });
            }

            if (kbRes.ok) {
                const kbs = await kbRes.json();
                if (kbs.length > 0) {
                    setDefaultKb(kbs[0]);
                } else {
                    const createRes = await fetch('/api/v1/ai/knowledge-bases', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ name: 'Default Knowledge Base', description: 'Main document store' })
                    });
                    if (createRes.ok) setDefaultKb(await createRes.json());
                }
            }
        } catch (error) {
            toast.error("Failed to load AI settings");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/v1/ai/agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    active: agent.isActive,
                    systemPrompt: agent.systemPrompt,
                    intentDetection: agent.intentDetection,
                    personalizationEnabled: agent.personalizationEnabled
                })
            });
            if (res.ok) {
                toast.success('AI Settings Saved Successfully');
            } else {
                toast.error('Failed to save settings');
            }
        } catch (error) {
            toast.error('A network error occurred');
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !defaultKb) return;

        if (file.type !== 'application/pdf' && file.type !== 'text/plain') {
            toast.error('Only PDF and TXT files are supported currently.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('knowledgeBaseId', defaultKb.id);

        setUploading(true);
        const loadingToast = toast.loading('Uploading and parsing document...');

        try {
            const res = await fetch('/api/v1/ai/knowledge-bases/upload', {
                method: 'POST',
                credentials: 'include',
                body: formData // No content-type header, fetch sets multipart/form-data boundary automatically
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(`Successfully indexed ${data.chunkCount} document chunks!`, { id: loadingToast });
                if (fileInputRef.current) fileInputRef.current.value = '';
            } else {
                const err = await res.json();
                toast.error(err.message || 'Failed to upload document', { id: loadingToast });
            }
        } catch (error) {
            toast.error('Network error during upload', { id: loadingToast });
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="text-purple-600 w-6 h-6" />
                    Advanced AI Configuration
                </h1>
                <p className="text-gray-500 text-sm mt-1">Train your AI with custom documents and personalize conversation routing.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Settings Panel */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                            <div>
                                <h3 className="font-bold text-gray-900">Enable AI Agent</h3>
                                <p className="text-sm text-gray-500">Allow AI to automatically reply to inbound messages.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={agent.isActive}
                                    onChange={(e) => setAgent({ ...agent, isActive: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                        </div>

                        <div className="border-t pt-6">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Core System Prompt (Persona)
                            </label>
                            <p className="text-xs text-gray-500 mb-3">
                                Define who the AI is, what its primary goal is, and its tone of voice.
                            </p>
                            <textarea
                                rows={5}
                                className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-purple-500 outline-none leading-relaxed"
                                value={agent.systemPrompt}
                                onChange={(e) => setAgent({ ...agent, systemPrompt: e.target.value })}
                                placeholder="e.g. You are a sales assistant for..."
                            />
                        </div>
                    </div>

                    {/* Advanced Behaviors */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-500" />
                            Advanced Capabilities
                        </h3>

                        <div className="space-y-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="font-semibold text-gray-800">Intent Detection Routing</p>
                                    <p className="text-xs text-gray-500 mt-1 max-w-sm">Use Machine Learning to detect the customer's goal and route them to human agents if intent is complex.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer mt-1">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={agent.intentDetection}
                                        onChange={(e) => setAgent({ ...agent, intentDetection: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                </label>
                            </div>

                            <div className="flex items-start justify-between border-t pt-6">
                                <div>
                                    <p className="font-semibold text-gray-800">Dynamic Personalization</p>
                                    <p className="text-xs text-gray-500 mt-1 max-w-sm">AI will dynamically adapt its language style based on the customer's previous chat history and sentiment.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer mt-1">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={agent.personalizationEnabled}
                                        onChange={(e) => setAgent({ ...agent, personalizationEnabled: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-8 py-3 bg-purple-600 font-bold text-white rounded-xl hover:bg-purple-700 shadow-md active:scale-95 disabled:opacity-70 transition-all"
                        >
                            <Save size={18} />
                            {saving ? 'Saving Changes...' : 'Save Configuration'}
                        </button>
                    </div>
                </div>

                {/* Sidebar: Knowledge Base Training Vault */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-b from-purple-50 to-white p-6 rounded-2xl shadow-sm border border-purple-100">
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                            <Bot className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-purple-900 text-lg mb-2">Training Vault</h3>
                        <p className="text-sm text-purple-700/80 mb-6 leading-relaxed">
                            Upload your business PDFs, product manuals, and FAQ text files. The AI will ingest these and use them for dynamic retrieval-aided generation (RAG).
                        </p>

                        <div
                            className="border-2 border-dashed border-purple-200 bg-white rounded-xl p-6 text-center hover:bg-purple-50/50 transition-colors cursor-pointer group relative"
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept=".pdf,.txt"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                disabled={uploading}
                            />
                            <UploadCloud className="w-8 h-8 text-purple-400 mx-auto mb-3 group-hover:text-purple-600 transition-colors" />
                            <p className="text-sm font-semibold text-gray-700">Click or drag file to upload</p>
                            <p className="text-[10px] text-gray-500 mt-1">PDF or TXT up to 10MB</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <h4 className="font-bold text-gray-900 text-sm mb-4">Indexed Documents</h4>
                        <div className="space-y-3">
                            {/* In a real app, Map over actual uploaded documents */}
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <FileText className="w-5 h-5 text-gray-400 shrink-0" />
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-xs font-semibold text-gray-700 truncate">Default Memory Store</p>
                                    <p className="text-[10px] text-gray-500 mt-0.5">System Native</p>
                                </div>
                                <CheckCircle className="w-4 h-4 text-green-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
