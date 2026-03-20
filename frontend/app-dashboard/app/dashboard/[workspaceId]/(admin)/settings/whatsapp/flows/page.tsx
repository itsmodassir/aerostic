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
    { value: 'CUSTOMER_SUPPORT', label: 'Customer Support' },
    { value: 'LEAD_GENERATION', label: 'Lead Generation' },
    { value: 'APPOINTMENT_BOOKING', label: 'Appointment Booking' },
    { value: 'SIGN_UP', label: 'Sign Up' },
    { value: 'SIGN_IN', label: 'Sign In' },
    { value: 'SHOPPING', label: 'Shopping' },
    { value: 'CONTACT_US', label: 'Contact Us' },
    { value: 'SURVEY', label: 'Survey' },
    { value: 'OTHER', label: 'Other' },
];

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
                    <p className="text-gray-500 max-w-sm mx-auto text-lg leading-relaxed mb-8">
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

            {/* Create Flow Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-purple-50/50">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Workflow className="text-purple-600" size={20} />
                                Create New Flow
                            </h2>
                            <button 
                                onClick={() => setIsCreateModalOpen(false)}
                                className="p-2 hover:bg-gray-200 rounded-xl transition-colors text-gray-500"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateFlow} className="p-6 space-y-4">
                            {createError && (
                                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs flex gap-2">
                                    <AlertCircle size={16} className="shrink-0" />
                                    {createError}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Flow Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Lead Qualification"
                                    value={newFlowName}
                                    onChange={(e) => setNewFlowName(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Category</label>
                                <select
                                    value={newFlowCategory}
                                    onChange={(e) => setNewFlowCategory(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white transition-all appearance-none cursor-pointer"
                                >
                                    {FLOW_CATEGORIES.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="pt-4 flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all font-sans"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating || !newFlowName.trim()}
                                    className="flex-[2] px-4 py-3 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-100 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isCreating ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Flow'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

