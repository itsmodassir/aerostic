'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { 
    ArrowLeft, Workflow, RefreshCw, ExternalLink, 
    AlertCircle, Search, Clock, CheckCircle, FileText,
    Plus, X, Loader2
} from 'lucide-react';

interface Flow {
    id: string;
    name: string;
    status: 'DRAFT' | 'PUBLISHED' | 'DEPRECATED' | 'BLOCKED';
    updated_at: string;
}

const FLOW_CATEGORIES = [
    { value: 'SIGN_UP', label: 'Sign up' },
    { value: 'SIGN_IN', label: 'Log in' },
    { value: 'APPOINTMENT_BOOKING', label: 'Appointment booking' },
    { value: 'LEAD_GENERATION', label: 'Lead generation' },
    { value: 'SHOPPING', label: 'Shopping' },
    { value: 'CONTACT_US', label: 'Contact us' },
    { value: 'CUSTOMER_SUPPORT', label: 'Customer support' },
    { value: 'SURVEY', label: 'Survey' },
    { value: 'OTHER', label: 'Other' },
];

const TEMPLATES = {
    WITHOUT_ENDPOINT: [
        { id: 'default', label: 'Default', description: "Hello World template" },
        { id: 'purchase_interest', label: 'Collect purchase interest', description: "Collect interest for items" },
        { id: 'feedback', label: 'Get feedback', description: "Simple feedback form" },
        { id: 'survey', label: 'Send a survey', description: "Multi-question survey" },
        { id: 'support', label: 'Customer support', description: "Support ticket capture" },
    ],
    WITH_ENDPOINT: [
        { id: 'loan', label: 'Get leads for a pre-approved loan / credit card', endpoint_needed: true },
        { id: 'insurance', label: 'Provide insurance quote', endpoint_needed: true },
        { id: 'personal_offer', label: 'Capture interest for a personalized offer', endpoint_needed: true },
        { id: 'auth', label: 'Account Sign in / Sign up', endpoint_needed: true },
        { id: 'appointment', label: 'Appointment booking', endpoint_needed: true },
    ]
};

export default function WhatsAppFlowsPage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params.workspaceId as string;
    
    const [flows, setFlows] = useState<Flow[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Create Flow Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newFlowName, setNewFlowName] = useState('');
    const [newFlowCategory, setNewFlowCategory] = useState('CUSTOMER_SUPPORT');
    const [templateType, setTemplateType] = useState<'WITHOUT_ENDPOINT' | 'WITH_ENDPOINT'>('WITHOUT_ENDPOINT');
    const [selectedTemplate, setSelectedTemplate] = useState('default');
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState('');

    const fetchFlows = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/whatsapp/flows');
            setFlows(res.data || []);
        } catch (err: any) {
            console.error('Failed to fetch flows:', err);
            setError(err.response?.data?.message || 'Failed to load WhatsApp Flows');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFlows();
    }, [workspaceId]);

    const handleSync = async () => {
        setSyncing(true);
        await fetchFlows();
        setSyncing(false);
    };

    const handleCreateFlow = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFlowName.trim()) return;

        setIsCreating(true);
        setCreateError('');
        try {
            const res = await api.post('/whatsapp/flows', {
                name: newFlowName,
                categories: [newFlowCategory]
            });
            
            // Successfully created
            setIsCreateModalOpen(false);
            setNewFlowName('');
            await fetchFlows(); // Refresh list
            
            // Optionally redirect to builder
            if (res.data?.id) {
                window.open(`https://business.facebook.com/wa/manage/flows/${res.data.id}/builder`, '_blank');
            }
        } catch (err: any) {
            console.error('Failed to create flow:', err);
            setCreateError(err.response?.data?.message || 'Failed to create WhatsApp Flow. Please check your Meta configuration.');
        } finally {
            setIsCreating(false);
        }
    };

    const filteredFlows = flows.filter(f => 
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.id.includes(searchTerm)
    );

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'PUBLISHED':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'DRAFT':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'DEPRECATED':
                return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'BLOCKED':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="max-w-6xl space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Workflow className="text-purple-600" />
                            WhatsApp Flows
                        </h1>
                        <p className="text-gray-500 text-sm mt-0.5">Manage your advanced conversational forms and interactive screens.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                        onClick={handleSync}
                        disabled={syncing || loading}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
                        Sync from Meta
                    </button>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition-all shadow-md shadow-purple-100"
                    >
                        <Plus size={16} />
                        Create Flow
                    </button>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
                <AlertCircle className="text-blue-600 shrink-0" size={20} />
                <div className="text-sm text-blue-800 leading-relaxed">
                    <p className="font-bold">About WhatsApp Flows</p>
                    <p className="mt-1">
                        Flows allow you to build rich, multi-screen interactions like appointment booking, lead generation forms, and customer surveys directly inside WhatsApp. 
                        Once published, you can reference these Flow IDs in your message templates.
                    </p>
                </div>
            </div>

            {/* Search & Stats */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search flows..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    />
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                    <span>Total: {flows.length}</span>
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                    <span>Published: {flows.filter(f => f.status === 'PUBLISHED').length}</span>
                </div>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse border border-gray-200" />
                    ))}
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-12 text-center">
                    <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Connection Issue</h3>
                    <p className="text-red-700 max-w-md mx-auto mb-6">{error}</p>
                    <button
                        onClick={fetchFlows}
                        className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all"
                    >
                        Try Again
                    </button>
                </div>
            ) : filteredFlows.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center">
                    <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Workflow size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No WhatsApp Flows Found</h3>
                    <p className="text-gray-500 max-sm mx-auto text-lg leading-relaxed mb-8">
                        You haven't created any flows yet. Start building advanced conversational forms directly from here.
                    </p>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-200"
                    >
                        Create your first Flow <Plus size={20} />
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFlows.map((flow) => (
                        <div 
                            key={flow.id}
                            className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-purple-300 transition-all group flex flex-col"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                    <FileText size={24} />
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusStyles(flow.status)}`}>
                                    {flow.status}
                                </span>
                            </div>
                            
                            <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-purple-600 transition-colors">{flow.name}</h3>
                            <code className="text-[10px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded w-fit mb-4">ID: {flow.id}</code>
                            
                            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                    <Clock size={12} />
                                    <span>{new Date(flow.updated_at).toLocaleDateString()}</span>
                                </div>
                                <a
                                    href={`https://business.facebook.com/wa/manage/flows/${flow.id}/builder`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                                    title="Open Builder"
                                >
                                    <ExternalLink size={18} />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Flow Modal (Meta Style) */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-[#f0f2f5] w-full max-w-6xl h-[90vh] rounded-[32px] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col border border-gray-200 animate-in zoom-in-95 duration-300">
                        {/* Meta Nav Bar */}
                        <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg">
                                    <Workflow size={18} />
                                </div>
                                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">WhatsApp Manager &gt; <span className="text-gray-400 font-medium tracking-normal">Create Flow</span></h2>
                            </div>
                            <button 
                                onClick={() => setIsCreateModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="flex-1 flex overflow-hidden">
                            {/* Left Form Area */}
                            <div className="flex-[1.5] overflow-y-auto p-10 space-y-8 border-r border-gray-200 scrollbar-none">
                                {/* Name Section */}
                                <div className="p-8 bg-white rounded-3xl border border-gray-200 shadow-sm space-y-6 animate-in slide-in-from-left-4 duration-500">
                                    <div className="flex items-center justify-between">
                                        <label className="text-lg font-bold text-gray-900">Name</label>
                                        <span className="text-xs font-bold text-gray-400">{newFlowName.length}/200</span>
                                    </div>
                                    <input
                                        required
                                        type="text"
                                        maxLength={200}
                                        placeholder="Enter name"
                                        value={newFlowName}
                                        onChange={(e) => setNewFlowName(e.target.value)}
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base focus:ring-[3px] focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all placeholder:text-gray-300 font-bold text-gray-800"
                                    />
                                </div>

                                {/* Categories Section */}
                                <div className="p-8 bg-white rounded-3xl border border-gray-200 shadow-sm space-y-6 animate-in slide-in-from-left-4 delay-100 duration-500">
                                    <label className="text-lg font-bold text-gray-900 block">Categories</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {FLOW_CATEGORIES.map(cat => (
                                            <button
                                                key={cat.value}
                                                type="button"
                                                onClick={() => setNewFlowCategory(cat.value)}
                                                className={`px-4 py-3.5 rounded-xl border-2 text-sm font-bold transition-all text-left flex items-center justify-between ${
                                                    newFlowCategory === cat.value 
                                                    ? 'bg-purple-600 text-white border-purple-600 scale-[1.02] shadow-xl shadow-purple-100' 
                                                    : 'bg-white text-gray-600 border-gray-100 hover:border-purple-200 hover:bg-gray-50'
                                                }`}
                                            >
                                                {cat.label}
                                                {newFlowCategory === cat.value && <CheckCircle size={14} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Template Section */}
                                <div className="p-8 bg-white rounded-3xl border border-gray-200 shadow-sm space-y-6 animate-in slide-in-from-left-4 delay-200 duration-500">
                                    <label className="text-lg font-bold text-gray-900 block">Template</label>
                                    
                                    {/* Tabs */}
                                    <div className="flex p-1.5 bg-gray-100 rounded-2xl w-fit">
                                        <button
                                            type="button"
                                            onClick={() => setTemplateType('WITHOUT_ENDPOINT')}
                                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                                templateType === 'WITHOUT_ENDPOINT' 
                                                ? 'bg-white text-purple-600 shadow-md' 
                                                : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                        >
                                            Without Endpoint
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setTemplateType('WITH_ENDPOINT')}
                                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                                templateType === 'WITH_ENDPOINT' 
                                                ? 'bg-white text-purple-600 shadow-md' 
                                                : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                        >
                                            With Endpoint
                                        </button>
                                    </div>

                                    {/* Options */}
                                    <div className="space-y-3">
                                        {TEMPLATES[templateType].map(tpl => (
                                            <label 
                                                key={tpl.id}
                                                className={`flex items-center gap-4 px-6 py-4 rounded-2xl border-2 cursor-pointer transition-all ${
                                                    selectedTemplate === tpl.id 
                                                    ? 'bg-blue-50/50 border-purple-600 ring-4 ring-purple-600/5' 
                                                    : 'bg-white border-gray-50 hover:border-gray-100 text-gray-600'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="template"
                                                    value={tpl.id}
                                                    checked={selectedTemplate === tpl.id}
                                                    onChange={() => setSelectedTemplate(tpl.id)}
                                                    className="w-5 h-5 text-purple-600 border-gray-300 focus:ring-purple-500 focus:ring-offset-0"
                                                />
                                                <div className="flex flex-col">
                                                    <span className={`text-sm font-bold ${selectedTemplate === tpl.id ? 'text-gray-900' : 'text-gray-600'}`}>{tpl.label}</span>
                                                    {('endpoint_needed' in tpl) && tpl.endpoint_needed && <span className="text-[10px] uppercase font-black text-gray-400 mt-1 tracking-wider">Endpoint template available</span>}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Preview Area */}
                            <div className="flex-1 bg-white p-6 lg:p-12 flex flex-col items-center justify-center space-y-8 relative overflow-hidden min-h-[500px]">
                                <div className="absolute top-6 left-8 lg:top-10 lg:left-10">
                                    <label className="text-xl font-black text-gray-900 tracking-tight">Flow Preview</label>
                                </div>
                                
                                <div className="absolute top-6 right-8 lg:top-10 lg:right-10">
                                    <button className="p-3 hover:bg-gray-100 rounded-2xl text-gray-400 transition-colors"><RefreshCw size={22} /></button>
                                </div>

                                {/* Phone Mockup Container with Scaling */}
                                <div className="relative transform scale-[0.7] sm:scale-[0.85] lg:scale-100 transition-transform duration-500 origin-center">
                                    <div className="w-[300px] h-[600px] bg-white rounded-[56px] border-[10px] border-[#1c1e21] shadow-[0_32px_128px_-12px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col relative animate-in zoom-in-90 slide-in-from-bottom-12 duration-1000">
                                        {/* Speaker/Notch */}
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 bg-[#1c1e21] w-32 rounded-b-2xl z-20" />
                                        
                                        {/* App Bar */}
                                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white mt-4">
                                            <X size={18} className="text-gray-400" />
                                            <span className="text-[13px] font-black text-gray-800">Welcome</span>
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                        </div>

                                        {/* Content */}
                                        <div className="p-8 flex-1 flex flex-col bg-white">
                                            <h4 className="text-[24px] font-[1000] text-gray-900 leading-[1.2] tracking-tight break-words">
                                                {newFlowName || 'Hello World'}
                                            </h4>
                                            <p className="text-sm text-gray-500 mt-4 font-bold leading-relaxed">
                                                Category: <span className="text-purple-600 uppercase tracking-tighter text-[10px] ml-1">
                                                    {FLOW_CATEGORIES.find(c => c.value === newFlowCategory)?.label || 'General'}
                                                </span>
                                            </p>
                                            <div className="w-12 h-1 bg-gray-100 rounded-full mt-6" />
                                            
                                            <p className="text-xs text-gray-400 mt-6 font-medium leading-relaxed">
                                                This is a live preview of how your flow will appear to customers in WhatsApp.
                                            </p>
                                            
                                            <div className="mt-auto space-y-5">
                                                <button disabled className="w-full h-12 bg-[#1fb381] rounded-2xl flex items-center justify-center text-white font-[1000] text-[13px] shadow-2xl shadow-green-200 uppercase tracking-widest opacity-90">
                                                    Complete
                                                </button>
                                                <p className="text-[10px] text-center text-gray-400 font-bold leading-normal">
                                                    Managed by the business. <br/>
                                                    <span className="text-blue-600 underline cursor-pointer">Learn more</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full max-w-sm p-4 bg-[#f0f2f5] border border-gray-200 rounded-2xl text-[10px] text-gray-500 leading-relaxed font-bold animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 text-center">
                                    Preview is indicative. Actual appearance may vary based on OS and WhatsApp version.
                                </div>
                            </div>
                        </div>

                        {/* Footer Controls */}
                        <div className="h-28 bg-white border-t border-gray-200 flex items-center justify-between px-16 shrink-0">
                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(false)}
                                className="px-10 py-4 border-2 border-gray-200 rounded-2xl text-base font-[1000] text-gray-500 hover:bg-gray-50 transition-all active:scale-95"
                            >
                                Discard
                            </button>
                            
                            <div className="flex items-center gap-6">
                                {createError && <span className="text-sm text-red-500 font-black animate-in fade-in duration-300">⚠️ {createError}</span>}
                                <button
                                    onClick={handleCreateFlow}
                                    disabled={isCreating || !newFlowName.trim()}
                                    className="px-14 py-4 bg-[#42b72a] text-white rounded-2xl text-base font-[1000] transition-all hover:bg-[#36a420] hover:shadow-2xl hover:shadow-green-200 disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-green-100"
                                >
                                    {isCreating ? <Loader2 size={20} className="animate-spin" /> : 'Create'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

