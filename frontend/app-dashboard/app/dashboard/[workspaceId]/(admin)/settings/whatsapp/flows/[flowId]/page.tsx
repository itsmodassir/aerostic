'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import Editor from '@monaco-editor/react';
import {
    ArrowLeft, Save, Send, Share2, MoreHorizontal, Settings,
    Smartphone, Workflow, CheckCircle, Clock, XCircle, LayoutTemplate, X, Menu, ChevronRight, AlertCircle,
    ChevronLeft, Loader2, Zap
} from 'lucide-react';

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
    let texts: string[] = [];
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
        <div className="flex flex-col items-center justify-start pt-6 h-full bg-gray-50 overflow-y-auto">
            <div className="relative w-[280px]">
                {/* Phone frame */}
                <div className="relative bg-white rounded-[40px] shadow-2xl border-[8px] border-gray-900 overflow-hidden" style={{ minHeight: 600 }}>
                    {/* Camera notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-b-3xl z-10" />
                    
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
                                    <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
                                        <Zap size={20} className="text-gray-300" />
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-medium">Add form components to see them here</p>
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
            
            <div className="mt-4 px-6 py-3 w-full border-t border-gray-200/60 flex items-center gap-2">
                <Smartphone size={14} className="text-teal-600" />
                <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">Live Preview • Version {parsed?.version || '7.3'}</span>
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
                // Fetch the specific flow (since we don't have a single GET endpoint, we fetch all and find it)
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

    const handleSave = async () => {
        if (jsonError) {
            alert('Cannot save. Please fix JSON errors first.');
            return;
        }
        setSaving(true);
        try {
            const parsed = JSON.parse(jsonContent);
            await api.post(`/whatsapp/flows/${flowId}/assets`, { json: parsed });
            setOriginalJson(jsonContent);
            // Optionally fetch flows again to update updated_at
            const flowsRes = await api.get('/whatsapp/flows');
            const matchedFlow = flowsRes.data.find((f: Flow) => f.id === flowId);
            if (matchedFlow) setFlow(matchedFlow);
            
            alert('Flow JSON saved successfully.');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to save Flow JSON');
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
            router.push(`/dashboard/${workspaceId}/settings/whatsapp/flows`);
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Publishing attempt failed.';
            alert(`${errorMsg}\n\nTip: Ensure your Flow version is "7.3" for API v21.0 in 2026.`);
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
        <div className="h-screen flex flex-col bg-white overflow-hidden">
            {/* Top Toolbar (Meta Style) */}
            <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shrink-0 bg-white z-10">
                <div className="flex items-center gap-3 sm:gap-6">
                    {/* Back button & Breadcrumb */}
                    <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                        <button onClick={() => router.push(`/dashboard/${workspaceId}/settings/whatsapp/flows`)} 
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0">
                            <ChevronLeft size={20} className="text-gray-400" />
                        </button>
                        <div className="flex flex-col overflow-hidden">
                            <div className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-gray-400">
                                <span>WhatsApp Manager</span>
                                <span className="text-gray-300">›</span>
                                <span>Flows</span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 overflow-hidden">
                                <div className="w-6 h-6 bg-teal-600 rounded flex items-center justify-center shadow-sm shrink-0">
                                    <Workflow size={12} className="text-white" />
                                </div>
                                <h1 className="text-sm sm:text-lg font-bold text-gray-900 leading-none truncate">{flow?.name || 'Loading...'}</h1>
                            </div>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-2 border-l border-gray-200 pl-6 h-8">
                        <StatusBadge status={flow?.status} />
                        <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                            • Updated {flow?.updated_at ? new Date(flow.updated_at).toLocaleDateString() : 'recently'}
                            {hasUnsavedChanges && <span className="text-amber-500 ml-1">(Unsaved)</span>}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleSave}
                        disabled={saving || !!jsonError || !hasUnsavedChanges}
                        className="px-3 sm:px-4 py-2 border border-gray-200 text-gray-700 text-xs sm:text-sm font-bold rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors">
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button 
                        onClick={handlePublish}
                        disabled={publishing || hasUnsavedChanges || flow?.status === 'PUBLISHED'}
                        className="px-3 sm:px-4 py-2 bg-[#0866FF] sm:bg-gray-100 text-white sm:text-gray-400 text-xs sm:text-sm font-bold rounded-lg hover:bg-blue-700 sm:hover:bg-gray-200 sm:hover:text-gray-600 transition-colors border border-gray-200 disabled:opacity-50">
                        {publishing ? '...' : 'Publish'}
                    </button>
                    <button className="hidden sm:flex w-9 h-9 items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
                        <Share2 size={16} />
                    </button>
                    <button className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
                        <MoreHorizontal size={16} />
                    </button>
                </div>
            </div>

            {/* Mobile Tab Switcher */}
            <div className="flex sm:hidden border-b border-gray-100 bg-white shrink-0">
                <button
                    onClick={() => setActiveTab('editor')}
                    className={`flex-1 py-3 text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'editor' ? 'text-[#0866FF] border-b-2 border-[#0866FF]' : 'text-gray-400'}`}
                >
                    JSON Editor
                </button>
                <button
                    onClick={() => setActiveTab('preview')}
                    className={`flex-1 py-3 text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'preview' ? 'text-[#0866FF] border-b-2 border-[#0866FF]' : 'text-gray-400'}`}
                >
                    Preview
                </button>
            </div>

            {/* Main Editor Area */}
            <div className="flex flex-1 overflow-hidden">
                
                {/* Left Panel: JSON Editor */}
                <div className={`${activeTab === 'editor' ? 'flex' : 'hidden'} sm:flex flex-1 border-r border-gray-200 flex flex-col bg-white overflow-hidden`}>
                    <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4 shrink-0 bg-white">
                        <span className="font-bold text-sm text-gray-900">Editor</span>
                        <div className="flex items-center gap-2">
                             <span className={`text-[10px] font-bold uppercase tracking-wider ${jsonError ? 'text-red-500' : 'text-green-500'}`}>
                                {jsonError ? 'Invalid JSON' : 'Valid JSON'}
                            </span>
                            <button className="px-3 py-1.5 border border-gray-200 rounded text-xs font-bold text-gray-600 hover:bg-gray-50 shadow-sm">
                                Run
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
                            }}
                        />
                    </div>
                    {/* Editor Footer */}
                    <div className="h-10 border-t border-gray-200 bg-white flex items-center justify-between px-4 shrink-0">
                        <div className="flex items-center gap-6">
                            <span className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                                Errors 
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${jsonError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                    {jsonError ? '1' : '0'}
                                </span>
                            </span>
                            <span className="hidden sm:inline text-xs font-medium text-gray-600">Actions</span>
                            <span className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                                Endpoint <div className="w-2 h-2 rounded-full bg-red-500" />
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Preview */}
                <div className={`${activeTab === 'preview' ? 'flex' : 'hidden'} sm:flex w-full sm:w-[400px] flex flex-col bg-white shrink-0 overflow-hidden`}>
                    <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4 shrink-0 bg-white">
                        <span className="font-bold text-sm text-gray-900">Preview</span>
                        <div className="flex items-center gap-2">
                            <select 
                                value={selectedScreen}
                                onChange={(e) => setSelectedScreen(e.target.value)}
                                className="px-3 py-1.5 border border-gray-200 rounded text-xs font-bold text-gray-700 outline-none max-w-[150px] bg-white hover:border-gray-300 transition-colors cursor-pointer appearance-none shadow-sm pr-8 relative"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                    backgroundPosition: `right 0.5rem center`,
                                    backgroundRepeat: `no-repeat`,
                                    backgroundSize: `1.5em 1.5em`,
                                }}
                            >
                                {screens.length > 0 ? (
                                    screens.map(id => <option key={id} value={id}>{id}</option>)
                                ) : (
                                    <option>No screens found</option>
                                )}
                            </select>
                            <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50 text-gray-600 shadow-sm">
                                <Settings size={14} />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto relative bg-gray-50 p-4 sm:p-0">
                        <div className="sm:scale-95 lg:scale-100 transform origin-top">
                            {jsonError ? (
                                <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                                    <div className="text-red-500 bg-red-50 p-4 rounded-xl border border-red-100 shadow-sm max-w-sm">
                                        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
                                        <h3 className="font-bold text-sm mb-1">Invalid JSON</h3>
                                        <p className="text-xs">{jsonError}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-center py-4">
                                    <FlowLivePreview flowJsonString={jsonContent} selectedScreenId={selectedScreen} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
