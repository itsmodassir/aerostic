'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import Editor from '@monaco-editor/react';
import {
    ArrowLeft, Save, Send, Share2, MoreHorizontal, Settings,
    Smartphone, Workflow, CheckCircle, Clock, XCircle, LayoutTemplate, X, Menu, ChevronRight, AlertCircle,
    ChevronLeft, Loader2, Zap, Code, RefreshCw
} from 'lucide-react';

import WhatsAppFlowBuilder from './components/WhatsAppFlowBuilder';
import { WhatsAppFlowJSON } from './components/types';

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
        REJECTED: { label: 'Rejected', class: 'bg-red-50 text-red-700 border-red-100', icon: XCircle },
    };
    const s = map[status] || { label: status, class: 'bg-gray-100 text-gray-500 border-gray-200', icon: Clock };
    const Icon = s.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${s.class}`}>
            <Icon size={10} />
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
        <div className="flex flex-col items-center justify-start pt-6 h-full bg-slate-50 overflow-y-auto">
            <div className="relative w-[280px]">
                {/* Phone frame */}
                <div className="relative bg-white rounded-[40px] shadow-2xl border-[8px] border-slate-900 overflow-hidden" style={{ minHeight: 600 }}>
                    {/* Camera notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-900 rounded-b-3xl z-10" />
                    
                    {/* WhatsApp chat header */}
                    <div className="bg-[#128C7E] pt-8 pb-3 px-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ArrowLeft size={16} className="text-white" />
                            <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
                                <div className="w-4 h-4 rounded-full bg-white/60" />
                            </div>
                            <span className="text-white text-sm font-bold">Business</span>
                        </div>
                        <MoreHorizontal size={18} className="text-white" />
                    </div>

                    {/* Chat Bubble */}
                    <div className="bg-[#ECE5DD] p-3 flex flex-col items-start min-h-[50px]">
                         <div className="bg-white rounded-r-xl rounded-bl-xl p-3 shadow-sm max-w-[85%] mt-2">
                             <p className="text-xs text-gray-800 mb-1">Interactive Flow</p>
                             <button className="w-full mt-2 py-2 bg-gray-100 text-[#075E54] font-bold text-xs rounded-lg flex items-center justify-center gap-2">
                                <LayoutTemplate size={14} /> Open Form
                             </button>
                         </div>
                    </div>

                    {/* Flow Modal Overlay (simulating opened flow) */}
                    <div className="absolute inset-x-0 bottom-0 bg-white h-full rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col z-20 transition-transform">
                        {/* Modal Header */}
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <X size={20} className="text-gray-500" />
                                <h3 className="text-sm font-bold text-gray-900 truncate max-w-[180px]">{title}</h3>
                            </div>
                            <MoreHorizontal size={20} className="text-gray-500" />
                        </div>
                        
                        {/* Modal Content */}
                        <div className="p-4 flex-1 overflow-y-auto w-full space-y-4">
                            {/* Main Image */}
                            {(imageSrc || formImages[0]) && (
                                <div className="w-full h-40 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                                    <img src={imageSrc || formImages[0]} alt="Flow content" className="w-full h-full object-cover" onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Y2FlYmYiIGZvbnQtc2l6ZT0iMTIiPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
                                    }} />
                                </div>
                            )}

                            {/* Texts */}
                            {[...texts, ...formTexts].map((text, i) => (
                                <p key={i} className={`text-sm ${i===0 && !imageSrc ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{text}</p>
                            ))}
                            
                            {/* Inputs */}
                            {inputs.length > 0 ? (
                                <div className="space-y-4 mt-4">
                                    {inputs.map((input, i) => (
                                        <div key={i} className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{input.label || input.name || 'Input field'}</label>
                                            <div className="flex items-center justify-between px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50">
                                                <span className="text-xs text-gray-400 italic">Select option...</span>
                                                <ChevronRight size={14} className="text-gray-300" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-40 text-center space-y-2">
                                    <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center">
                                        <Zap size={20} className="text-slate-300" />
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium">Add form components to see them here</p>
                                </div>
                            )}

                        </div>
                        {/* Footer */}
                        <div className="p-4 border-t border-gray-100">
                             <button className="w-full py-3 bg-[#0866FF] text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-200">
                                {formChildren.find(c => c.type === 'Footer')?.label || 'Continue'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-4 px-6 py-3 w-full border-t border-slate-200/60 flex items-center gap-2">
                <Smartphone size={14} className="text-teal-600" />
                <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">Live Preview • Version {parsed?.version || '7.3'}</span>
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
            
            // alert('Flow saved successfully.');
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
            router.push('/settings/whatsapp/flows');
        } catch (err: any) {
            const metaError = err.response?.data?.message || err.response?.data?.error?.message || 'Publishing attempt failed.';
            const message = `Meta API Error: ${metaError}\n\nTip: Ensure all Screen IDs are unique and alphanumeric. Flow Version should be "7.3" for current standards.`;
            alert(message);
        } finally {
            setPublishing(false);
        }

    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-[#0866FF] border-t-blue-200 rounded-full animate-spin" />
            </div>
        );
    }

    const hasUnsavedChanges = jsonContent !== originalJson;

    return (
        <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
            {/* Top Toolbar (Aerostic Premium Style) */}
            <div className="h-16 border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 bg-white z-20 shadow-sm relative">
                <div className="flex items-center gap-3 sm:gap-6">
                    {/* Back button & Breadcrumb */}
                    <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                        <button onClick={() => router.push('/settings/whatsapp/flows')} 
                            className="p-2 hover:bg-slate-100 rounded-xl transition-all border border-transparent hover:border-slate-200 group">
                            <ChevronLeft size={20} className="text-slate-400 group-hover:text-slate-600" />
                        </button>
                        <div className="flex flex-col overflow-hidden">
                            <div className="hidden sm:flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                <span>WhatsApp Manager</span>
                                <span className="text-slate-300">›</span>
                                <span>Automation Flows</span>
                            </div>
                            <div className="flex items-center gap-3 mt-0.5 overflow-hidden">
                                <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-100 shrink-0">
                                    <Workflow size={12} className="text-white" />
                                </div>
                                <h1 className="text-sm sm:text-base font-black text-slate-900 leading-none truncate tracking-tight">{flow?.name || 'Untitled Flow'}</h1>
                                <StatusBadge status={flow?.status} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden lg:flex items-center gap-2 mr-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-6 border-l border-slate-200">
                        {saving ? (
                            <div className="flex items-center gap-2 text-blue-500">
                                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                <span>Saving changes...</span>
                            </div>
                        ) : hasUnsavedChanges ? (
                            <span className="text-amber-500">Unsaved changes</span>
                        ) : (
                            <span className="text-teal-500 flex items-center gap-1.5">
                                <CheckCircle size={12} />
                                Changes synced
                            </span>
                        )}
                    </div>
                    
                    <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                        <button 
                            onClick={() => setViewMode('designer')}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'designer' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Designer
                        </button>
                        <button 
                            onClick={() => setViewMode('json')}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'json' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            JSON
                        </button>
                    </div>

                    <div className="h-8 w-px bg-slate-200 mx-1" />

                    <button 
                        onClick={() => handlePublish()}
                        disabled={publishing || hasUnsavedChanges || flow?.status === 'PUBLISHED'}
                        className="px-4 py-2 bg-teal-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-all shadow-lg shadow-teal-100 border border-teal-700/10 flex items-center gap-2"
                    >
                        {publishing ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                        <span>Publish</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            {viewMode === 'designer' ? (
                <div className="flex-1 flex overflow-hidden">
                    <WhatsAppFlowBuilder 
                        flowData={JSON.parse(jsonContent)}
                        onSave={(updated) => handleSave(updated)}
                        onToggleCode={() => setViewMode('json')}
                    />
                    
                    {/* Live Preview (Conditional Overlay or Sidebar) */}
                    {activeTab === 'preview' && (
                        <div className="w-[400px] border-l border-slate-200 bg-white flex flex-col shrink-0">
                            <div className="h-12 border-b border-slate-100 flex items-center justify-between px-4 shrink-0">
                                <span className="font-black text-[10px] text-slate-900 uppercase tracking-widest">Phone Preview</span>
                                <select 
                                    value={selectedScreen}
                                    onChange={(e) => setSelectedScreen(e.target.value)}
                                    className="text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none"
                                >
                                    {screens.map(id => <option key={id} value={id}>{id}</option>)}
                                </select>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <FlowLivePreview flowJsonString={jsonContent} selectedScreenId={selectedScreen} />
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex-1 flex overflow-hidden">
                    {/* JSON Editor View */}
                    <div className="flex-1 flex flex-col bg-white overflow-hidden border-r border-slate-200">
                        <div className="h-12 border-b border-slate-100 flex items-center justify-between px-4 shrink-0 bg-white">
                            <div className="flex items-center gap-3">
                                <Code size={14} className="text-blue-500" />
                                <span className="font-black text-[10px] text-slate-900 uppercase tracking-widest">JSON Source</span>
                            </div>
                            <div className="flex items-center gap-3">
                                 <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${jsonError ? 'bg-red-50 text-red-500' : 'bg-teal-50 text-teal-500'}`}>
                                    {jsonError ? 'Invalid Format' : 'Valid JSON'}
                                </span>
                                <button 
                                    onClick={() => handleSave()}
                                    disabled={saving || !!jsonError || !hasUnsavedChanges}
                                    className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all disabled:opacity-50"
                                >
                                    Save JSON
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 w-full bg-[#1e1e1e] relative">
                            <Editor
                                height="100%"
                                defaultLanguage="json"
                                theme="vs-dark"
                                value={jsonContent}
                                onChange={handleEditorChange}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 13,
                                    lineNumbers: 'on',
                                    scrollBeyondLastLine: false,
                                    wordWrap: 'on',
                                    tabSize: 2,
                                    padding: { top: 20 }
                                }}
                            />
                            {jsonError && (
                                <div className="absolute bottom-4 left-4 right-4 bg-red-500/10 backdrop-blur-md border border-red-500/20 p-3 rounded-xl flex items-start gap-3 z-30">
                                    <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-red-200 font-medium leading-relaxed">{jsonError}</p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Side Preview in JSON Mode */}
                    <div className="w-[400px] bg-white flex flex-col shrink-0">
                        <div className="h-12 border-b border-slate-100 flex items-center justify-between px-4 shrink-0">
                            <span className="font-black text-[10px] text-slate-900 uppercase tracking-widest">Live Preview</span>
                            <div className="flex items-center gap-2">
                                <Smartphone size={12} className="text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-400">v7.3</span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <FlowLivePreview flowJsonString={jsonContent} selectedScreenId={selectedScreen} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

