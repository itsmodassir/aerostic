'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { RefreshCw, Search, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Template {
    id: string;
    name: string;
    status: string; // APPROVED, REJECTED, PENDING
    category: string;
    language: string;
    components: any[];
}

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [tenantId, setTenantId] = useState('');

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

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Message Templates</h1>
                    <p className="text-sm text-gray-500">Manage your WhatsApp approved templates.</p>
                </div>
                <button
                    onClick={handleSync}
                    disabled={syncing}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 w-full sm:w-auto"
                >
                    <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
                    {syncing ? 'Syncing...' : 'Sync with Meta'}
                </button>
            </div>

            {loading ? (
                <div>Loading templates...</div>
            ) : templates.length === 0 ? (
                <div className="p-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <Search className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <h3 className="text-sm font-medium text-gray-900">No templates found</h3>
                    <p className="mt-1 text-sm text-gray-500">Click "Sync with Meta" to fetch your approved templates.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((tpl) => (
                        <div key={tpl.id} className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col">
                            <div className="p-4 border-b flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-gray-900 truncate pr-2" title={tpl.name}>{tpl.name}</h3>
                                    <p className="text-xs text-gray-500 uppercase">{tpl.language} • {tpl.category}</p>
                                </div>
                                <StatusBadge status={tpl.status} />
                            </div>
                            <div className="p-4 bg-gray-50 flex-1 text-sm text-gray-600 space-y-2">
                                {/* Simplified Preview: Find BODY component */}
                                <p className="line-clamp-4">
                                    {tpl.components?.find((c: any) => c.type === 'BODY')?.text || 'No preview available'}
                                </p>
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
