'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import {
    RefreshCw, AlertCircle, Search, Plus, X, Loader2,
    Trash2, Send, Download, Upload, Play, Edit3, ExternalLink,
    MoreVertical, CheckCircle, Clock, XCircle, Workflow, ChevronRight
} from 'lucide-react';

interface Flow {
    id: string;
    name: string;
    status: 'DRAFT' | 'PUBLISHED' | 'DEPRECATED' | 'BLOCKED' | 'APPROVED' | 'PENDING' | 'REJECTED';
    updated_at: string;
    categories?: string[];
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

const WITHOUT_ENDPOINT_TEMPLATES = [
    { id: 'default', label: 'Default' },
    { id: 'purchase_interest', label: 'Collect purchase interest' },
    { id: 'feedback', label: 'Get feedback' },
    { id: 'survey', label: 'Send a survey' },
    { id: 'support', label: 'Customer support' },
];

const WITH_ENDPOINT_TEMPLATES = [
    { id: 'loan', label: 'Get leads for a pre-approved loan / credit card' },
    { id: 'insurance', label: 'Provide insurance quote' },
    { id: 'personal_offer', label: 'Capture interest for a personalized offer' },
    { id: 'auth', label: 'Account Sign in / Sign up' },
    { id: 'appointment', label: 'Appointment booking' },
];

// Matching the exact preview text from Meta's screenshots per template
const PREVIEW_CONTENT: Record<string, { title: string; body: string; category?: string }> = {
    default: { title: 'Hello World', body: "Let's start building things!" },
    purchase_interest: { title: 'Purchase Interest', body: 'Tell us what you are interested in purchasing.' },
    feedback: { title: 'Feedback', body: 'How would you rate your overall experience?', category: 'CUSTOMER SUPPORT' },
    survey: { title: 'Survey', body: 'Please complete our short survey to help us improve.' },
    support: { title: 'Support', body: 'Describe your issue and our team will reach out to you.' },
    loan: { title: 'Pre-Approved Loan', body: 'Complete this form to check your loan eligibility.' },
    insurance: { title: 'Insurance Quote', body: 'Get a personalized insurance quote in minutes.' },
    personal_offer: { title: 'Personal Offer', body: 'Tell us more to receive a personalized offer.' },
    auth: { title: 'Sign In', body: 'Welcome back! Sign in to continue.' },
    appointment: { title: 'Book Appointment', body: 'Select a time that works best for you.' },
};

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; class: string; icon: any }> = {
        PUBLISHED: { label: 'Published', class: 'bg-green-50 text-green-700 border-green-100', icon: CheckCircle },
        APPROVED: { label: 'Approved', class: 'bg-green-50 text-green-700 border-green-100', icon: CheckCircle },
        DRAFT: { label: 'Draft', class: 'bg-amber-50 text-amber-700 border-amber-100', icon: Clock },
        PENDING: { label: 'Pending', class: 'bg-blue-50 text-blue-700 border-blue-100', icon: Clock },
        REJECTED: { label: 'Rejected', class: 'bg-red-50 text-red-700 border-red-100', icon: XCircle },
        BLOCKED: { label: 'Blocked', class: 'bg-red-50 text-red-700 border-red-100', icon: XCircle },
        DEPRECATED: { label: 'Deprecated', class: 'bg-gray-100 text-gray-500 border-gray-200', icon: Clock },
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

// Phone Preview Component
function FlowPhonePreview({ template }: { template: string }) {
    const preview = PREVIEW_CONTENT[template] || PREVIEW_CONTENT.default;
    return (
        <div className="flex flex-col items-center justify-start pt-8 h-full bg-gray-50">
            <div className="relative w-56">
                {/* Phone frame */}
                <div className="relative bg-white rounded-[40px] shadow-2xl border-[6px] border-gray-900 overflow-hidden" style={{ minHeight: 480 }}>
                    {/* Camera notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-900 rounded-b-2xl z-10" />
                    {/* WhatsApp chat header */}
                    <div className="bg-[#128C7E] pt-7 pb-3 px-4 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-white/30 flex items-center justify-center">
                            <div className="w-4 h-4 rounded-full bg-white/60" />
                        </div>
                        <span className="text-white text-xs font-bold">Business</span>
                    </div>
                    {/* Flow card content */}
                    <div className="bg-[#ECE5DD] p-3 min-h-[360px] flex flex-col">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                            {preview.category && (
                                <p className="text-[8px] font-bold text-teal-600 uppercase tracking-widest mb-2">{preview.category}</p>
                            )}
                            <h3 className="text-sm font-black text-gray-900 mb-2">{preview.title}</h3>
                            <div className="w-8 h-0.5 bg-gray-200 mb-2" />
                            <p className="text-[10px] text-gray-500 leading-relaxed mb-6">{preview.body}</p>
                            <button className="w-full py-3 bg-[#25D366] text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                                COMPLETE
                            </button>
                            <p className="text-center text-[8px] text-gray-400 mt-2">
                                Managed by the business.{' '}
                                <span className="text-teal-500 underline">Learn more</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function WhatsAppFlowsPage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params.workspaceId as string;

    const [flows, setFlows] = useState<Flow[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Create Flow state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newFlowName, setNewFlowName] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [templateType, setTemplateType] = useState<'WITHOUT_ENDPOINT' | 'WITH_ENDPOINT'>('WITHOUT_ENDPOINT');
    const [selectedTemplate, setSelectedTemplate] = useState('default');
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState('');

    // Edit state
    const [editingFlow, setEditingFlow] = useState<Flow | null>(null);
    const [editName, setEditName] = useState('');
    const [isImporting, setIsImporting] = useState<string | null>(null);

    const fetchFlows = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/whatsapp/flows');
            setFlows(res.data || []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load WhatsApp Flows');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchFlows(); }, [workspaceId]);

    // Close menu on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setActiveMenu(null);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const toggleCategory = (val: string) => {
        setSelectedCategories(prev =>
            prev.includes(val) ? prev.filter(c => c !== val) : [...prev, val]
        );
    };

    const handleCreateFlow = async () => {
        if (!newFlowName.trim()) return;
        setIsCreating(true);
        setCreateError('');
        try {
            await api.post('/whatsapp/flows', {
                name: newFlowName,
                categories: selectedCategories.length > 0 ? selectedCategories : ['OTHER']
            });
            setIsCreateModalOpen(false);
            setNewFlowName('');
            setSelectedCategories([]);
            setSelectedTemplate('default');
            setTemplateType('WITHOUT_ENDPOINT');
            await fetchFlows();
        } catch (err: any) {
            setCreateError(err.response?.data?.message || 'Failed to create flow. Check your Meta configuration.');
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (flowId: string) => {
        if (!confirm('Delete this flow permanently from Meta?')) return;
        try {
            await api.delete(`/whatsapp/flows/${flowId}`);
            await fetchFlows();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete flow');
        }
    };

    const handlePublish = async (flowId: string) => {
        try {
            await api.post(`/whatsapp/flows/${flowId}/publish`);
            await fetchFlows();
            alert('Flow submitted to Meta for approval!');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to publish. Ensure the flow has a valid JSON asset.');
        }
    };

    const handleExport = async (flowId: string, flowName: string) => {
        try {
            const res = await api.get(`/whatsapp/flows/${flowId}/assets`);
            const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${flowName.replace(/\s+/g, '_')}_flow.json`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            alert('Failed to export flow JSON');
        }
    };

    const handleImport = async (flowId: string, file: File) => {
        setIsImporting(flowId);
        try {
            const text = await file.text();
            const json = JSON.parse(text);
            await api.post(`/whatsapp/flows/${flowId}/assets`, { json });
            await fetchFlows();
            alert('Flow JSON imported successfully!');
        } catch {
            alert('Invalid JSON file or upload failed');
        } finally {
            setIsImporting(null);
        }
    };

    const handleUpdateMetadata = async () => {
        if (!editingFlow || !editName.trim()) return;
        try {
            await api.post(`/whatsapp/flows/${editingFlow.id}/assets`, { json: { name: editName } });
            setEditingFlow(null);
            await fetchFlows();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to update flow');
        }
    };

    const filteredFlows = flows.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.id.includes(searchTerm)
    );

    const templates = templateType === 'WITHOUT_ENDPOINT' ? WITHOUT_ENDPOINT_TEMPLATES : WITH_ENDPOINT_TEMPLATES;

    return (
        <div className="max-w-7xl space-y-0 animate-in fade-in duration-500">
            {/* Meta-style Breadcrumb Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                        <span>WhatsApp Manager</span>
                        <ChevronRight size={14} />
                        <span className="font-semibold text-gray-700">Flows</span>
                    </div>
                    <h1 className="text-2xl font-black text-gray-900">Flows</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => { setSyncing(true); fetchFlows().finally(() => setSyncing(false)); }}
                        disabled={syncing || loading}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-100 text-gray-600 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all font-bold text-sm">
                        <RefreshCw size={15} className={syncing ? 'animate-spin' : ''} />
                        {syncing ? 'Syncing...' : 'Sync from Meta'}
                    </button>
                    <button onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#0866FF] text-white rounded-xl hover:bg-blue-600 font-black text-sm shadow-md shadow-blue-100 transition-all">
                        <Plus size={16} />
                        Create Flow
                    </button>
                </div>
            </div>

            {/* Stats + Search Row */}
            <div className="flex items-center justify-between pb-5 gap-4">
                <div className="flex gap-2">
                    {[
                        { label: 'Total', count: flows.length, active: true },
                        { label: 'Published', count: flows.filter(f => f.status === 'PUBLISHED').length, active: false },
                        { label: 'Draft', count: flows.filter(f => f.status === 'DRAFT').length, active: false },
                    ].map(s => (
                        <div key={s.label} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm shadow-sm">
                            <span className="font-black text-gray-900">{s.count}</span>
                            <span className="text-gray-400 font-semibold">{s.label}</span>
                        </div>
                    ))}
                </div>
                <div className="relative w-64">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input type="text" placeholder="Search flows..."
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                </div>
            </div>

            {/* Table (Desktop) / Card List (Mobile) */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                {/* Desktop Table */}
                <table className="w-full hidden md:table">
                    <thead className="border-b border-gray-100">
                        <tr>
                            {['Flow name', 'ID', 'Status', 'Category', 'Last modified', ''].map(h => (
                                <th key={h} className="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan={6} className="text-center py-16 text-gray-400">
                                <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                                <p className="text-sm font-semibold">Loading flows...</p>
                            </td></tr>
                        ) : error ? (
                            <tr><td colSpan={6} className="text-center py-16">
                                <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
                                <p className="text-sm text-red-600 font-semibold mb-3">{error}</p>
                                <button onClick={fetchFlows} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold">Retry</button>
                            </td></tr>
                        ) : filteredFlows.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-20">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                                    <Workflow size={28} className="text-blue-500" />
                                </div>
                                <h3 className="font-black text-gray-900 mb-1">No flows yet</h3>
                                <p className="text-sm text-gray-400 mb-4">Create your first WhatsApp Flow to get started.</p>
                                <button onClick={() => setIsCreateModalOpen(true)}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0866FF] text-white rounded-xl text-sm font-black">
                                    <Plus size={16} /> Create Flow
                                </button>
                            </td></tr>
                        ) : filteredFlows.map(flow => (
                            <tr key={flow.id} className="hover:bg-blue-50/20 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                                            <Workflow size={16} className="text-[#0866FF]" />
                                        </div>
                                        <div>
                                            <div className="font-black text-gray-900 text-sm">{flow.name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <code className="text-[10px] text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg font-mono">{flow.id}</code>
                                </td>
                                <td className="px-6 py-4"><StatusBadge status={flow.status} /></td>
                                <td className="px-6 py-4">
                                    {flow.categories && flow.categories.length > 0 ? (
                                        <span className="text-xs text-gray-500 font-semibold">
                                            {FLOW_CATEGORIES.find(c => c.value === flow.categories![0])?.label || flow.categories[0]}
                                        </span>
                                    ) : <span className="text-gray-300 text-xs">—</span>}
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-400">
                                    {flow.updated_at ? new Date(flow.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1 justify-end" ref={activeMenu === flow.id ? menuRef : null}>
                                        {/* Quick actions */}
                                        {flow.status === 'DRAFT' && (
                                            <button onClick={() => handlePublish(flow.id)}
                                                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Submit to Meta">
                                                <Send size={14} />
                                            </button>
                                        )}
                                        <button onClick={() => handleExport(flow.id, flow.name)}
                                            className="p-1.5 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors" title="Export JSON">
                                            <Download size={14} />
                                        </button>
                                        <label className="p-1.5 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer" title="Import JSON">
                                            <Upload size={14} />
                                            <input type="file" className="hidden" accept=".json"
                                                onChange={e => { const f = e.target.files?.[0]; if (f) handleImport(flow.id, f); }} />
                                        </label>
                                        <Link href={`/dashboard/${workspaceId}/settings/whatsapp/flows/${flow.id}`}
                                            className="p-1.5 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors" title="Open Flow Editor">
                                            <ExternalLink size={14} />
                                        </Link>
                                        {/* More menu */}
                                        <div className="relative">
                                            <button onClick={() => setActiveMenu(activeMenu === flow.id ? null : flow.id)}
                                                className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                                                <MoreVertical size={14} />
                                            </button>
                                            {activeMenu === flow.id && (
                                                <div className="absolute right-0 top-8 bg-white border border-gray-100 rounded-xl shadow-xl z-50 min-w-[160px] py-1.5 overflow-hidden">
                                                    <button onClick={() => { setEditingFlow(flow); setEditName(flow.name); setActiveMenu(null); }}
                                                        className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 font-semibold transition-colors">
                                                        <Edit3 size={14} /> Edit
                                                    </button>
                                                    <button onClick={() => { handleDelete(flow.id); setActiveMenu(null); }}
                                                        className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-red-50 text-sm text-red-600 font-semibold transition-colors">
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Mobile Card List */}
                <div className="flex flex-col divide-y divide-gray-100 md:hidden">
                    {loading ? (
                        <div className="text-center py-16 text-gray-400">
                            <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                            <p className="text-sm font-semibold">Loading flows...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-16 px-4">
                            <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
                            <p className="text-sm text-red-600 font-semibold mb-3">{error}</p>
                            <button onClick={fetchFlows} className="w-full py-3 bg-red-600 text-white rounded-xl text-sm font-bold">Retry</button>
                        </div>
                    ) : filteredFlows.length === 0 ? (
                        <div className="text-center py-20 px-4">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                                <Workflow size={28} className="text-blue-500" />
                            </div>
                            <h3 className="font-black text-gray-900 mb-1">No flows yet</h3>
                            <button onClick={() => setIsCreateModalOpen(true)}
                                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-[#0866FF] text-white rounded-xl text-sm font-black">
                                <Plus size={16} /> Create Flow
                            </button>
                        </div>
                    ) : filteredFlows.map(flow => (
                        <div key={flow.id} className="p-4 space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                        <Workflow size={18} className="text-[#0866FF]" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-gray-900 text-sm leading-tight">{flow.name}</h4>
                                        <code className="text-[10px] text-gray-400 font-mono">{flow.id}</code>
                                    </div>
                                </div>
                                <StatusBadge status={flow.status} />
                            </div>

                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-400 font-semibold uppercase tracking-wider">Category</span>
                                <span className="text-gray-700 font-bold">
                                    {flow.categories?.[0] ? (FLOW_CATEGORIES.find(c => c.value === flow.categories?.[0])?.label || flow.categories[0]) : '—'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-400 font-semibold uppercase tracking-wider">Modified</span>
                                <span className="text-gray-700 font-bold">
                                    {flow.updated_at ? new Date(flow.updated_at).toLocaleDateString() : '—'}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <Link href={`/dashboard/${workspaceId}/settings/whatsapp/flows/${flow.id}`}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-50 text-gray-700 rounded-xl text-xs font-black">
                                    <Edit3 size={14} /> Open Editor
                                </Link>
                                <div className="flex gap-2">
                                    {flow.status === 'DRAFT' && (
                                        <button onClick={() => handlePublish(flow.id)}
                                            className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                            <Send size={16} />
                                        </button>
                                    )}
                                    <button onClick={() => handleExport(flow.id, flow.name)}
                                        className="p-2.5 bg-gray-50 text-gray-400 rounded-xl">
                                        <Download size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(flow.id)}
                                        className="p-2.5 bg-red-50 text-red-600 rounded-xl">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Edit Flow Modal */}
            {editingFlow && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                                <Edit3 size={20} className="text-blue-500" /> Edit Flow
                            </h2>
                            <button onClick={() => setEditingFlow(null)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X size={18} className="text-gray-400" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-black text-gray-400 mb-1.5 block uppercase tracking-wider">Flow Name</label>
                                <input value={editName} onChange={e => setEditName(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 font-semibold" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setEditingFlow(null)}
                                    className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-black text-gray-500 hover:bg-gray-50">Cancel</button>
                                <button onClick={handleUpdateMetadata}
                                    className="flex-1 py-3 bg-[#0866FF] text-white rounded-xl text-sm font-black hover:bg-blue-600">Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Flow Modal — Meta Exact */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-4xl h-[88vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-200">
                        {/* Modal header - Meta breadcrumb style */}
                        <div className="h-12 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0">
                            <div className="flex items-center gap-2 text-sm">
                                <div className="w-5 h-5 bg-[#0866FF] rounded-md flex items-center justify-center">
                                    <Workflow size={12} className="text-white" />
                                </div>
                                <span className="font-black text-gray-500 text-xs uppercase tracking-wider">WHATSAPP MANAGER</span>
                                <span className="text-gray-200">›</span>
                                <span className="font-black text-gray-600 text-xs uppercase tracking-wider">CREATE FLOW</span>
                            </div>
                            <button onClick={() => setIsCreateModalOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex flex-1 overflow-hidden">
                            {/* Left: Form */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-6 border-r border-gray-100">
                                {createError && (
                                    <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl flex gap-2 border border-red-100">
                                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                        <span>{createError}</span>
                                    </div>
                                )}

                                {/* Name */}
                                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-base font-black text-gray-900">Name</label>
                                        <span className="text-xs text-gray-400 font-mono">{newFlowName.length}/200</span>
                                    </div>
                                    <input
                                        type="text"
                                        maxLength={200}
                                        placeholder="Enter name"
                                        value={newFlowName}
                                        onChange={e => setNewFlowName(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#0866FF] focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-300 font-semibold"
                                    />
                                </div>

                                {/* Categories */}
                                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
                                    <label className="text-base font-black text-gray-900 block">Categories</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {FLOW_CATEGORIES.map(cat => (
                                            <button key={cat.value}
                                                onClick={() => toggleCategory(cat.value)}
                                                className={`px-4 py-3 rounded-xl text-sm font-semibold border-2 text-left transition-all ${selectedCategories.includes(cat.value)
                                                    ? 'border-[#0866FF] bg-blue-50 text-[#0866FF]'
                                                    : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-white'}`}>
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Template */}
                                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
                                    <label className="text-base font-black text-gray-900 block">Template</label>
                                    {/* Tabs */}
                                    <div className="flex border-b border-gray-100">
                                        {(['WITHOUT_ENDPOINT', 'WITH_ENDPOINT'] as const).map(type => (
                                            <button key={type}
                                                onClick={() => { setTemplateType(type); setSelectedTemplate(type === 'WITHOUT_ENDPOINT' ? 'default' : 'loan'); }}
                                                className={`px-4 py-2.5 text-sm font-bold transition-all border-b-2 -mb-px ${templateType === type
                                                    ? 'border-[#0866FF] text-[#0866FF]'
                                                    : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                                                {type === 'WITHOUT_ENDPOINT' ? 'Without Endpoint' : 'With Endpoint'}
                                            </button>
                                        ))}
                                    </div>
                                    {/* Template list */}
                                    <div className="space-y-1">
                                        {templates.map(tpl => (
                                            <label key={tpl.id}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${selectedTemplate === tpl.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                                                <input type="radio" name="template" value={tpl.id}
                                                    checked={selectedTemplate === tpl.id}
                                                    onChange={() => setSelectedTemplate(tpl.id)}
                                                    className="accent-[#0866FF]" />
                                                <span className={`text-sm font-semibold ${selectedTemplate === tpl.id ? 'text-[#0866FF]' : 'text-gray-700'}`}>
                                                    {tpl.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Flow Preview */}
                            <div className="w-80 flex flex-col shrink-0">
                                <div className="p-6 border-b border-gray-100">
                                    <h3 className="text-sm font-black text-gray-900">Flow Preview</h3>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <FlowPhonePreview template={selectedTemplate} />
                                </div>
                            </div>
                        </div>

                        {/* Footer — Meta style with disclaimer */}
                        <div className="border-t border-gray-100 bg-white px-8 py-4 flex items-center justify-between shrink-0">
                            <button onClick={() => setIsCreateModalOpen(false)}
                                className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-black text-gray-500 hover:bg-gray-50 transition-all">
                                Discard
                            </button>
                            <div className="flex-1 px-6 text-xs text-gray-400 leading-relaxed">
                                When utilising template Flow JSON, you are responsible for customising the experience to suit your use case, adhering to applicable laws and complying with{' '}
                                <span className="text-[#0866FF] cursor-pointer">WhatsApp Business Messaging Policy</span>.{' '}
                                <span className="text-[#0866FF] cursor-pointer">Learn more about templates</span>.
                            </div>
                            <button
                                onClick={handleCreateFlow}
                                disabled={!newFlowName.trim() || isCreating}
                                className="px-6 py-2.5 bg-[#0866FF] text-white rounded-xl text-sm font-black hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-md shadow-blue-100">
                                {isCreating ? <Loader2 size={16} className="animate-spin" /> : null}
                                {isCreating ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
