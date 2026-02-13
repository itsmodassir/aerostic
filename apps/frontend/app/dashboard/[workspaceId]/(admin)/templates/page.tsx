'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { RefreshCw, Search, CheckCircle, XCircle, Clock, Plus } from 'lucide-react';
import CreateTemplateModal from './CreateTemplateModal';

interface Template {
    id: string;
    name: string;
    status: string; // APPROVED, REJECTED, PENDING
    category: string;
    language: string;
    components: any[];
}

interface LibraryTemplate {
    name: string;
    category: string;
    body: string;
    description: string;
}

const LIBRARY_TEMPLATES: LibraryTemplate[] = [
    {
        name: 'welcome_message',
        category: 'MARKETING',
        body: 'Hello {{1}}, welcome to Aerostic! We are excited to have you on board.',
        description: 'Standard welcome message for new customers.'
    },
    {
        name: 'shipping_update',
        category: 'UTILITY',
        body: 'Hi {{1}}, your order #{{2}} has been shipped and is on its way to you!',
        description: 'Notify customers about their order shipment.'
    },
    {
        name: 'appointment_reminder',
        category: 'UTILITY',
        body: 'Reminder: You have an appointment with us on {{1}} at {{2}}. See you there!',
        description: 'Send reminders for upcoming appointments.'
    },
    {
        name: 'order_confirmation',
        category: 'UTILITY',
        body: 'Thank you for your order! Your order #{{1}} for {{2}} has been confirmed.',
        description: 'Confirm new orders placed by customers.'
    }
];

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [tenantId, setTenantId] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [view, setView] = useState<'mine' | 'library'>('mine');
    const [selectedLibraryTemplate, setSelectedLibraryTemplate] = useState<any>(null);

    useEffect(() => {
        const init = async () => {
            try {
                const res = await api.get('/auth/me');
                if (res.data && res.data.tenantId) {
                    setTenantId(res.data.tenantId);
                    fetchTemplates(res.data.tenantId);
                }
            } catch (e) { }
        };
        init();
    }, []);

    const fetchTemplates = async (tid: string) => {
        setLoading(true);
        try {
            const res = await api.get(`/templates?tenantId=${tid}`);
            setTemplates(res.data);
        } catch (error) {
            console.error('Failed to load templates');
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            await api.post('/templates/sync', { tenantId });
            // Fetch again after sync
            await fetchTemplates(tenantId);
            alert('Templates synced from Meta!');
        } catch (e) {
            alert('Sync failed. Check WABA configuration.');
        } finally {
            setSyncing(false);
        }
    };

    const handleUseLibraryTemplate = (tpl: LibraryTemplate) => {
        setSelectedLibraryTemplate({
            name: tpl.name,
            category: tpl.category,
            body: tpl.body,
            language: 'en_US'
        });
        setIsCreateModalOpen(true);
    };

    const handleOpenCreateModal = () => {
        setSelectedLibraryTemplate(null);
        setIsCreateModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Message Templates</h1>
                    <p className="text-sm text-gray-500">Manage your WhatsApp approved templates.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={handleOpenCreateModal}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto shadow-sm"
                    >
                        <Plus size={18} />
                        Create Template
                    </button>
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 w-full sm:w-auto"
                    >
                        <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
                        {syncing ? 'Syncing...' : 'Sync with Meta'}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setView('mine')}
                    className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${view === 'mine' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    My Templates
                </button>
                <button
                    onClick={() => setView('library')}
                    className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${view === 'library' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Template Library
                </button>
            </div>

            <CreateTemplateModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    setView('mine');
                    fetchTemplates(tenantId);
                }}
                tenantId={tenantId}
                initialData={selectedLibraryTemplate}
            />

            {view === 'mine' ? (
                loading ? (
                    <div>Loading templates...</div>
                ) : templates.length === 0 ? (
                    <div className="p-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <Search className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <h3 className="text-sm font-medium text-gray-900">No templates found</h3>
                        <p className="mt-1 text-sm text-gray-500">Click "Sync with Meta" or use the Library to get started.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates.map((tpl) => (
                            <div key={tpl.id} className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                                <div className="p-4 border-b flex justify-between items-start">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 truncate pr-2" title={tpl.name}>{tpl.name}</h3>
                                        <p className="text-xs text-gray-500 uppercase">{tpl.language} • {tpl.category}</p>
                                    </div>
                                    <StatusBadge status={tpl.status} />
                                </div>
                                <div className="p-4 bg-gray-50 flex-1 text-sm text-gray-600">
                                    <p className="line-clamp-4 italic border-l-2 border-gray-300 pl-3 py-1">
                                        {tpl.components?.find((c: any) => c.type === 'BODY')?.text || 'No preview available'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {LIBRARY_TEMPLATES.map((tpl) => (
                        <div key={tpl.name} className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col hover:border-blue-200 transition-colors">
                            <div className="p-4 border-b">
                                <h3 className="font-semibold text-gray-900">{tpl.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</h3>
                                <p className="text-xs text-gray-500 uppercase">{tpl.category}</p>
                            </div>
                            <div className="p-4 flex-1 space-y-3">
                                <p className="text-xs text-gray-500 line-clamp-2">{tpl.description}</p>
                                <div className="bg-blue-50/50 rounded-lg p-3 text-sm text-gray-600 border border-blue-100/50">
                                    <p className="line-clamp-3">"{tpl.body}"</p>
                                </div>
                            </div>
                            <div className="p-4 border-t bg-gray-50/50">
                                <button
                                    onClick={() => handleUseLibraryTemplate(tpl)}
                                    className="w-full py-2 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                >
                                    Use & Customize
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'APPROVED') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                <CheckCircle size={12} /> Approved
            </span>
        );
    }
    if (status === 'REJECTED') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                <XCircle size={12} /> Rejected
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
            <Clock size={12} /> {status}
        </span>
    );
}
