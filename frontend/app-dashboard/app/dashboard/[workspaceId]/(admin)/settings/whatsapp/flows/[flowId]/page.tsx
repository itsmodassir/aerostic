'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import Editor from '@monaco-editor/react';
import {
    ArrowLeft, Save, Send, Share2, MoreHorizontal, Settings,
    Smartphone, Workflow, CheckCircle, Clock, XCircle, LayoutTemplate, X, Menu, ChevronRight, AlertCircle,
    ChevronLeft, Loader2, Zap, Code, RefreshCw
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

import WhatsAppFlowBuilder from './components/WhatsAppFlowBuilder';
import { WhatsAppFlowJSON } from './components/types';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface Flow {
    id: string;
    name: string;
    status: string;
    updated_at: string;
    categories?: string[];
}

function StatusBadge({ status }: { status?: string }) {
    if (!status) return null;
    const map: Record<string, { label: string; class: string; icon: any }> = {
        PUBLISHED: { label: 'Published', class: 'bg-green-50 text-green-700 border-green-100', icon: CheckCircle },
        APPROVED: { label: 'Approved', class: 'bg-green-50 text-green-700 border-green-100', icon: CheckCircle },
        DRAFT: { label: 'Draft', class: 'bg-amber-50 text-amber-700 border-amber-100', icon: Clock },
        PENDING: { label: 'Pending', class: 'bg-blue-50 text-blue-700 border-blue-100', icon: Clock },
        REJECTED: { label: 'Rejected', class: 'bg-rose-50 text-rose-700 border-rose-100', icon: XCircle },
    };
    const s = map[status] || { label: status, class: 'bg-slate-100 text-slate-500 border-slate-200', icon: Clock };
    const Icon = s.icon;
    return (
        <span className={clsx("inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider", s.class)}>
            <Icon size={10} strokeWidth={3} />
            {s.label}
        </span>
    );
}

// Live Phone Preview Component parsing flow JSON
function FlowLivePreview({ flowJsonString, selectedScreenId }: { flowJsonString: string, selectedScreenId: string }) {
    let parsed: any = null;
    try {
        parsed = JSON.parse(flowJsonString);
    } catch (e) { }

    const screen = parsed?.screens?.find((s: any) => s.id === selectedScreenId) || parsed?.screens?.[0] || {};
    const title = screen.title || 'Flow Preview';
    
    // Find form elements if any
    let formChildren: any[] = [];
    const texts: string[] = [];
    let imageSrc: string | null = null;
    
    const extractContent = (children: any[]) => {
        if (!children) return;
        children.forEach(c => {
            if (c.type === 'Form') {
                formChildren = c.children || [];
            } else if (c.type === 'TextHeading' || c.type === 'TextBody' || c.type === 'TextSubheading') {
                texts.push(c.text);
            } else if (c.type === 'Image') {
                imageSrc = c.src;
            } else if (c.children) {
                extractContent(c.children);
            }
        });
    };

    if (screen.layout?.children) {
        extractContent(screen.layout.children);
    }
    
    // If we have a form, let's extract inputs
    const inputs = formChildren.filter(c => c.type === 'TextInput' || c.type === 'Dropdown' || c.type === 'CheckboxGroup' || c.type === 'RadioButtonsGroup' || c.type === 'DatePicker' || c.type === 'OptIn');
    const formTexts = formChildren.filter(c => c.type === 'TextHeading' || c.type === 'TextBody' || c.type === 'TextSubheading').map(c => c.text);
    const formImages = formChildren.filter(c => c.type === 'Image').map(c => c.src);

    return (
        <div className="flex flex-col items-center justify-start pt-8 pb-32 h-full bg-slate-50/50 overflow-y-auto custom-scrollbar">
            <div className="relative w-[280px]">
                {/* Phone frame */}
                <div className="relative bg-white rounded-[48px] shadow-2xl border-[10px] border-slate-900 overflow-hidden" style={{ minHeight: 580 }}>
                    {/* Camera notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-900 rounded-b-3xl z-10" />
                    
                    {/* WhatsApp chat header */}
                    <div className="bg-[#075E54] pt-8 pb-3 px-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ArrowLeft size={16} className="text-white" />
                            <div className="w-8 h-8 rounded-full bg-slate-200/20 flex items-center justify-center">
                                <div className="w-4 h-4 rounded-full bg-white/40" />
                            </div>
                            <span className="text-white text-xs font-bold tracking-tight">Business</span>
                        </div>
                        <MoreHorizontal size={18} className="text-white opacity-60" />
                    </div>

                    {/* Chat Bubble Interface */}
                    <div className="bg-[#E5DDD5] p-3 flex flex-col items-start min-h-[50px] relative h-full">
                         {/* Background watermark */}
                         <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                              style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")' }} />
                         
                         <div className="bg-white rounded-r-2xl rounded-bl-2xl p-3 shadow-md max-w-[90%] mt-2 relative z-10">
                             <div className="flex items-center gap-2 mb-2">
                                <Workflow size={12} className="text-teal-600" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Interactive Flow</p>
                             </div>
                             <p className="text-[11px] text-slate-700 leading-relaxed mb-3">Hi! Please tap below to complete the secure form.</p>
                             <button className="w-full py-2.5 bg-slate-50 text-teal-700 font-black text-[10px] uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 border border-slate-100 hover:bg-slate-100 transition-colors">
                                <LayoutTemplate size={14} strokeWidth={2.5} /> Open Form
                             </button>
                         </div>
                    </div>

                    {/* Flow Modal Overlay (simulating opened flow) */}
                    <div className="absolute inset-x-0 bottom-0 bg-white h-full rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] flex flex-col z-20 transition-transform">
                        {/* Modal Header */}
                        <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
                            <div className="flex items-center gap-3">
                                <X size={18} className="text-slate-400" />
                                <h3 className="text-xs font-black text-slate-900 truncate max-w-[150px] tracking-tight">{title}</h3>
                            </div>
                            <MoreHorizontal size={18} className="text-slate-300" />
                        </div>
                        
                        {/* Modal Content */}
                        <div className="p-5 flex-1 overflow-y-auto w-full space-y-5 custom-scrollbar">
                            {/* Main Image */}
                            {(imageSrc || formImages[0]) && (
                                <div className="w-full h-44 bg-slate-50 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-100">
                                    <img src={imageSrc || formImages[0]} alt="Flow content" className="w-full h-full object-cover" onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjhmYWZjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNjYmQ1ZTEiIGZvbnQtc2l6ZT0iMTIiPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
                                    }} />
                                </div>
                            )}

                            {/* Texts */}
                            <div className="space-y-2">
                                {[...texts, ...formTexts].map((text, i) => (
                                    <p key={i} className={clsx("text-xs leading-relaxed", i === 0 && !imageSrc ? 'font-black text-slate-900 text-sm' : 'text-slate-500 font-medium')}>
                                        {text}
                                    </p>
                                ))}
                            </div>
                            
                            {/* Inputs */}
                            {inputs.length > 0 ? (
                                <div className="space-y-5 mt-6">
                                    {inputs.map((input, i) => (
                                        <div key={i} className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{input.label || input.name || 'Input field'}</label>
                                            <div className="flex items-center justify-between px-4 py-3 border border-slate-100 rounded-2xl bg-slate-50/50 group hover:border-blue-200 transition-colors cursor-pointer">
                                                <span className="text-[11px] text-slate-400 font-medium italic">Select option...</span>
                                                <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-400 transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 opacity-30">
                                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                                        <Zap size={24} className="text-slate-400" />
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Awaiting components</p>
                                </div>
                            )}

                        </div>
                        {/* Footer */}
                        <div className="p-5 border-t border-slate-50 bg-white/50 backdrop-blur-md">
                             <button className="w-full py-4 bg-blue-600 text-white text-[11px] font-black uppercase tracking-[0.1em] rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-[0.98]">
                                {formChildren.find(c => c.type === 'Footer')?.label || 'Continue'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-8 px-6 py-4 w-full border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Smartphone size={14} className="text-blue-500" />
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Environment: Meta Sandbox</span>
                </div>
                <span className="text-[10px] text-slate-500 font-black">v{parsed?.version || '7.3'}</span>
            </div>
        </div>
    );
}

export default function FlowEditorPage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params.workspaceId as string;
    const flowId = params.flowId as string;

    const [flow, setFlow] = useState<Flow | null>(null);
    const [jsonContent, setJsonContent] = useState<string>('{}');
    const [originalJson, setOriginalJson] = useState<string>('{}');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [jsonError, setJsonError] = useState<string | null>(null);
    const [publishing, setPublishing] = useState(false);
    const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
    const [selectedScreen, setSelectedScreen] = useState<string>('');
    const [viewMode, setViewMode] = useState<'designer' | 'json'>('designer');

    // Derived screens list
    const [screens, setScreens] = useState<string[]>([]);

    useEffect(() => {
        try {
            const parsed = JSON.parse(jsonContent);
            if (parsed.screens && Array.isArray(parsed.screens)) {
                const ids = parsed.screens.map((s: any) => s.id);
                setScreens(ids);
                if (!selectedScreen || !ids.includes(selectedScreen)) {
                    setSelectedScreen(ids[0] || '');
                }
            }
        } catch (e) {}
    }, [jsonContent]);

    useEffect(() => {
        const fetchFlowData = async () => {
            try {
                // Fetch the specific flow
                const flowsRes = await api.get('/whatsapp/flows');
                const matchedFlow = flowsRes.data.find((f: Flow) => f.id === flowId);
                if (matchedFlow) setFlow(matchedFlow);

                // Fetch assets for this flow
                const assetsRes = await api.get(`/whatsapp/flows/${flowId}/assets`);
                const formattedJson = JSON.stringify(assetsRes.data, null, 2);
                setJsonContent(formattedJson);
                setOriginalJson(formattedJson);
            } catch (err: any) {
                console.error('Failed to load flow data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchFlowData();
    }, [flowId]);

    const handleEditorChange = (value: string | undefined) => {
        if (!value) return;
        setJsonContent(value);
        try {
            JSON.parse(value);
            setJsonError(null);
        } catch (e: any) {
            setJsonError(e.message);
        }
    };

    const handleSave = async (updatedFlow?: WhatsAppFlowJSON) => {
        const contentToSave = updatedFlow ? JSON.stringify(updatedFlow, null, 2) : jsonContent;
        
        if (jsonError && !updatedFlow) {
            alert('Cannot save. Please fix JSON errors first.');
            return;
        }

        setSaving(true);
        try {
            const parsed = JSON.parse(contentToSave);
            await api.post(`/whatsapp/flows/${flowId}/assets`, { json: parsed });
            setJsonContent(contentToSave);
            setOriginalJson(contentToSave);
            
            // Optionally fetch flows again to update updated_at
            const flowsRes = await api.get('/whatsapp/flows');
            const matchedFlow = flowsRes.data.find((f: Flow) => f.id === flowId);
            if (matchedFlow) setFlow(matchedFlow);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to save Flow');
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = async () => {
        if (jsonContent !== originalJson) {
            alert('Please Save your changes before publishing.');
            return;
        }

        try {
            const parsed = JSON.parse(jsonContent);
            const version = parseFloat(parsed.version);
            if (version < 7.3) {
                if (!confirm(`Warning: Flow version "${parsed.version}" is below the recommended 7.3. Versions below 5.0 are frozen and may be rejected. Proceed anyway?`)) {
                    return;
                }
            }
        } catch (e) {}

        setPublishing(true);
        try {
            await api.post(`/whatsapp/flows/${flowId}/publish`);
            alert('Flow submitted to Meta for validation and publishing!');
            // Refresh flow data
            const flowsRes = await api.get('/whatsapp/flows');
            const matchedFlow = flowsRes.data.find((f: Flow) => f.id === flowId);
            if (matchedFlow) setFlow(matchedFlow);
        } catch (err: any) {
            const metaError = err.response?.data?.message || err.response?.data?.error?.message || 'Publishing attempt failed.';
            alert(`Meta API Error: ${metaError}`);
        } finally {
            setPublishing(false);
        }
    };

    const handleUnpublish = async () => {
        if (!confirm('Are you sure you want to unpublish (deprecate) this flow? This will retire the flow on Meta and it cannot be easily undone.')) {
            return;
        }

        setPublishing(true);
        try {
            await api.post(`/whatsapp/flows/${flowId}/unpublish`);
            alert('Flow has been deprecated (unpublished) on Meta.');
            // Refresh flow data
            const flowsRes = await api.get('/whatsapp/flows');
            const matchedFlow = flowsRes.data.find((f: Flow) => f.id === flowId);
            if (matchedFlow) setFlow(matchedFlow);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to unpublish Flow');
        } finally {
            setPublishing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-slate-100 rounded-full" />
                    <div className="absolute inset-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
                <div className="flex flex-col items-center">
                    <p className="text-lg font-black text-slate-900 tracking-tight">Synchronizing Assets</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Connecting to Meta Graph API</p>
                </div>
            </div>
        );
    }

    const hasUnsavedChanges = jsonContent !== originalJson;
    
    let safeFlowData = {};
    try {
        safeFlowData = JSON.parse(jsonContent);
    } catch (e) {
        try {
            safeFlowData = JSON.parse(originalJson);
        } catch (e2) {}
    }

    return (
        <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
            {/* Top Toolbar */}
            <div className="h-20 border-b border-slate-200 flex items-center justify-between px-6 shrink-0 bg-white z-20 shadow-sm relative">
                <div className="flex items-center gap-6">
                    <button onClick={() => router.push('/settings/whatsapp/flows')} 
                        className="p-3 hover:bg-slate-50 rounded-2xl transition-all border border-slate-100 group">
                        <ChevronLeft size={20} className="text-slate-400 group-hover:text-slate-900" />
                    </button>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                            <span>Meta Platform</span>
                            <span className="text-slate-200">/</span>
                            <span>Flow Architect</span>
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                            <h1 className="text-xl font-black text-slate-900 leading-none tracking-tight">{flow?.name || 'Untitled Flow'}</h1>
                            <StatusBadge status={flow?.status} />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Real-time Status Indicator */}
                    <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 mr-4">
                        {saving ? (
                            <div className="flex items-center gap-2 text-blue-600">
                                <Loader2 size={14} className="animate-spin" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Auto-saving...</span>
                            </div>
                        ) : hasUnsavedChanges ? (
                            <div className="flex items-center gap-2 text-amber-500">
                                <AlertCircle size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Unsaved edits</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-emerald-500">
                                <CheckCircle size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Sync healthy</span>
                            </div>
                        )}
                    </div>

                    {/* View Controls */}
                    <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                        <button 
                            onClick={() => setViewMode('designer')}
                            className={clsx(
                                "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                viewMode === 'designer' ? "bg-white text-blue-600 shadow-md shadow-blue-500/5" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            Designer
                        </button>
                        <button 
                            onClick={() => setViewMode('json')}
                            className={clsx(
                                "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                viewMode === 'json' ? "bg-white text-blue-600 shadow-md shadow-blue-500/5" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            Source
                        </button>
                    </div>

                    {viewMode === 'designer' && (
                        <button 
                            onClick={() => setActiveTab(activeTab === 'preview' ? 'editor' : 'preview')}
                            className={clsx(
                                "flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                                activeTab === 'preview' ? "bg-indigo-600 border-indigo-700 text-white shadow-lg shadow-indigo-100" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                            )}
                        >
                            <Smartphone size={16} strokeWidth={3} />
                            Preview
                        </button>
                    )}

                    <div className="h-10 w-px bg-slate-100 mx-2" />

                    {/* Lifecycle Controls */}
                    {['PUBLISHED', 'DEPRECATED', 'APPROVED', 'LIVE'].includes(flow?.status || '') ? (
                        <button 
                            onClick={handleUnpublish}
                            disabled={publishing || flow?.status === 'DEPRECATED'}
                            className="px-6 py-3 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-[0.1em] rounded-2xl hover:bg-rose-100 disabled:opacity-50 transition-all border border-rose-100 flex items-center gap-2"
                        >
                            {publishing ? <RefreshCw size={14} className="animate-spin" /> : <XCircle size={14} strokeWidth={3} />}
                            Unpublish
                        </button>
                    ) : (
                        <button 
                            onClick={handlePublish}
                            disabled={publishing || hasUnsavedChanges}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-[10px] font-black uppercase tracking-[0.1em] rounded-2xl hover:shadow-xl hover:shadow-blue-200 disabled:opacity-50 transition-all border border-blue-700/10 flex items-center gap-2 shadow-lg shadow-blue-100"
                        >
                            {publishing ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} strokeWidth={3} />}
                            Go Live
                        </button>
                    )}
                </div>
            </div>

            {/* Main Editor Surface */}
            <div className="flex-1 flex overflow-hidden">
                {viewMode === 'designer' ? (
                    <div className="flex-1 flex overflow-hidden">
                        <div className="flex-1 relative">
                            <ErrorBoundary name="DesignerSurface">
                                <WhatsAppFlowBuilder 
                                    flowData={safeFlowData as any}
                                    onSave={handleSave}
                                    onToggleCode={() => setViewMode('json')}
                                />
                            </ErrorBoundary>
                        </div>
                        
                        <AnimatePresence>
                            {activeTab === 'preview' && (
                                <motion.div 
                                    initial={{ x: 420 }}
                                    animate={{ x: 0 }}
                                    exit={{ x: 420 }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                    className="w-[420px] border-l border-slate-100 bg-white flex flex-col shrink-0 z-10 shadow-2xl overflow-hidden"
                                >
                                    <div className="h-14 border-b border-slate-50 flex items-center justify-between px-6 shrink-0 bg-slate-50/20">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-[10px]">P</div>
                                            <span className="font-black text-[10px] text-slate-900 uppercase tracking-widest">Real-time Preview</span>
                                        </div>
                                        <select 
                                            value={selectedScreen}
                                            onChange={(e) => setSelectedScreen(e.target.value)}
                                            className="text-[10px] font-black text-slate-600 bg-white border border-slate-200 rounded-xl px-3 py-1.5 outline-none focus:border-blue-500 transition-colors"
                                        >
                                            {screens.map(id => <option key={id} value={id}>{id}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <ErrorBoundary name="PhonePreview">
                                            <FlowLivePreview flowJsonString={jsonContent} selectedScreenId={selectedScreen} />
                                        </ErrorBoundary>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="flex-1 flex overflow-hidden">
                        <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden">
                            <div className="h-14 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 bg-[#252526]">
                                <div className="flex items-center gap-3">
                                    <Code size={16} className="text-blue-400" />
                                    <span className="font-black text-[10px] text-slate-400 uppercase tracking-widest">JSON Manifest</span>
                                </div>
                                <div className="flex items-center gap-4">
                                     <span className={clsx(
                                         "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                                         jsonError ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"
                                     )}>
                                        {jsonError ? 'Syntax Error' : 'Valid Schema'}
                                    </span>
                                    <button 
                                        onClick={() => handleSave()}
                                        disabled={saving || !!jsonError || !hasUnsavedChanges}
                                        className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                                    >
                                        Push Changes
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 relative">
                                <Editor
                                    height="100%"
                                    defaultLanguage="json"
                                    theme="vs-dark"
                                    value={jsonContent}
                                    onChange={handleEditorChange}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                        lineNumbers: 'on',
                                        scrollBeyondLastLine: false,
                                        wordWrap: 'on',
                                        tabSize: 2,
                                        padding: { top: 20 },
                                        fontFamily: 'JetBrains Mono, monospace'
                                    }}
                                />
                                {jsonError && (
                                    <div className="absolute bottom-6 left-6 right-6 bg-rose-500/10 backdrop-blur-md border border-rose-500/20 p-4 rounded-2xl flex items-start gap-3 z-30">
                                        <AlertCircle size={20} className="text-rose-500 shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-[10px] text-rose-300 font-black uppercase tracking-widest mb-1">JSON Validation Error</p>
                                            <p className="text-xs text-rose-200/80 font-medium leading-relaxed">{jsonError}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Static Preview in Source Mode */}
                        <div className="w-[420px] bg-white flex flex-col shrink-0 border-l border-slate-100">
                            <div className="h-14 border-b border-slate-50 flex items-center justify-between px-6 shrink-0 bg-slate-50/20">
                                <span className="font-black text-[10px] text-slate-900 uppercase tracking-widest">Static Preview</span>
                                <div className="flex items-center gap-2">
                                    <Smartphone size={14} className="text-slate-400" />
                                    <span className="text-[10px] font-black text-slate-400">MANIFEST V7.3</span>
                                </div>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <ErrorBoundary name="SourcePreview">
                                    <FlowLivePreview flowJsonString={jsonContent} selectedScreenId={selectedScreen} />
                                </ErrorBoundary>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
