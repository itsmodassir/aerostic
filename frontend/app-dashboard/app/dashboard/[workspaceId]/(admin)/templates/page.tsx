'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { RefreshCw, Search, CheckCircle, XCircle, Clock, Plus, AlertCircle, FileText, Workflow } from 'lucide-react';
import CreateTemplateModal from './CreateTemplateModal';

interface Template {
    id: string;
    name: string;
    status: string;
    category: string;
    language: string;
    components: any[];
    rejectionReason?: string;
}

const LANGUAGES: Record<string, string> = {
    en_US: 'English (US)', en_GB: 'English (UK)', hi: 'Hindi', ar: 'Arabic',
    es: 'Spanish', fr: 'French', de: 'German', pt_BR: 'Portuguese (BR)',
    id: 'Indonesian', ja: 'Japanese', ko: 'Korean', zh_CN: 'Chinese (Simplified)',
};

const LIBRARY_TEMPLATES = [
    { name: 'welcome_message', category: 'MARKETING', body: 'Hello {{1}}, welcome to {{2}}! We are excited to have you on board.', description: 'Warm welcome message for new customers.' },
    { name: 'special_offer', category: 'MARKETING', body: 'Exclusive Deal! 🌟 Get {{1}}% off on all {{2}} products. Use code {{3}} at checkout. Offer valid until {{4}}.', description: 'Promote a limited-time festive or seasonal offer.' },
    { name: 'abandoned_cart_recovery', category: 'MARKETING', body: 'Hi {{1}}, you left items in your cart. Complete your purchase now and get {{2}}% off! Click here: {{3}}', description: 'Recover lost sales.' },
    { name: 'order_confirmation', category: 'UTILITY', body: 'Thank you for your order! 📦 Your order #{{1}} for {{2}} has been confirmed and will be shipped shortly.', description: 'Confirm a new order.' },
    { name: 'shipping_update', category: 'UTILITY', body: 'Good news! 🚚 Your order #{{1}} has been shipped. Track your package here: {{2}}', description: 'Notify customers when their order ships.' },
    { name: 'appointment_reminder', category: 'UTILITY', body: 'Reminder: You have an appointment with us on {{1}} at {{2}}. Reply YES to confirm or NO to reschedule.', description: 'Remind customers of upcoming appointments.' },
    { name: 'feedback_request', category: 'UTILITY', body: 'Hi {{1}}, we hope you enjoyed your {{2}}. Would you mind rating your experience? It takes just a moment: {{3}}', description: 'Collect customer feedback.' },
    { name: 'auth_code', category: 'AUTHENTICATION', body: '{{1}} is your verification code. For your security, do not share this code.', description: 'Send a one-time password for login.' },
];

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [tenantId, setTenantId] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [view, setView] = useState<'mine' | 'library'>('mine');
    const [selectedLibraryTemplate, setSelectedLibraryTemplate] = useState<any>(null);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [search, setSearch] = useState('');

    const filteredTemplates = templates.filter(t => {
        const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
        const matchesSearch = !search || t.name.toLowerCase().includes(search.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    useEffect(() => {
        const init = async () => {
            try {
                const res = await api.get('/auth/me');
                if (res.data?.tenantId) {
                    setTenantId(res.data.tenantId);
                    fetchTemplates(res.data.tenantId);
                }
            } catch (e) {}
        };
        init();
    }, []);

    const fetchTemplates = async (tid: string) => {
        setLoading(true);
        try {
            const res = await api.get(`/templates?tenantId=${tid}`);
            setTemplates(res.data);
        } catch {} finally { setLoading(false); }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            await api.post('/templates/sync', { tenantId });
            await fetchTemplates(tenantId);
        } catch {} finally { setSyncing(false); }
    };

    return (
        <div className="max-w-7xl space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Message Templates</h1>
                    <p className="text-gray-400 text-sm mt-1 font-medium">Create, manage and submit WhatsApp templates for Meta approval</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleSync} disabled={syncing}
                        className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-gray-100 text-gray-600 rounded-2xl hover:bg-gray-50 disabled:opacity-50 transition-all font-bold text-sm shadow-sm">
                        <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
                        {syncing ? 'Syncing...' : 'Sync from Meta'}
                    </button>
                    <button onClick={() => { setSelectedLibraryTemplate(null); setIsCreateModalOpen(true); }}
                        className="flex items-center gap-2 px-5 py-3 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 transition-all font-black text-sm shadow-lg shadow-purple-100">
                        <Plus size={18} />
                        Create Template
                    </button>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Total', count: templates.length, color: 'bg-gray-50 text-gray-600 border-gray-100' },
                    { label: 'Approved', count: templates.filter(t => t.status === 'APPROVED').length, color: 'bg-green-50 text-green-700 border-green-100' },
                    { label: 'Pending', count: templates.filter(t => t.status === 'PENDING').length, color: 'bg-amber-50 text-amber-700 border-amber-100' },
                    { label: 'Rejected', count: templates.filter(t => t.status === 'REJECTED').length, color: 'bg-red-50 text-red-700 border-red-100' },
                ].map(s => (
                    <div key={s.label} className={`p-4 rounded-2xl border-2 ${s.color}`}>
                        <div className="text-2xl font-black">{s.count}</div>
                        <div className="text-sm font-bold opacity-70">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-gray-50 rounded-2xl p-1 w-fit">
                {[{ key: 'mine', label: 'My Templates' }, { key: 'library', label: 'Template Library' }].map(tab => (
                    <button key={tab.key} onClick={() => setView(tab.key as any)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all ${view === tab.key ? 'bg-white shadow text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            <CreateTemplateModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => { setView('mine'); fetchTemplates(tenantId); }}
                tenantId={tenantId}
                initialData={selectedLibraryTemplate}
            />

            {view === 'mine' && (
                <>
                    {/* Search + Filters */}
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                            <input type="text" placeholder="Search templates..."
                                value={search} onChange={e => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-100 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none text-sm" />
                        </div>
                        <div className="flex gap-1">
                            {['ALL', 'APPROVED', 'PENDING', 'REJECTED'].map(s => (
                                <button key={s} onClick={() => setStatusFilter(s)}
                                    className={`px-4 py-3 text-xs font-black rounded-2xl transition-all uppercase tracking-wider ${statusFilter === s ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>
                                    {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="text-center py-20 text-gray-400 font-semibold">Loading templates...</div>
                    ) : filteredTemplates.length === 0 ? (
                        <div className="py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                            <FileText className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                            <h3 className="text-base font-black text-gray-900">No templates found</h3>
                            <p className="mt-1 text-sm text-gray-400">Create your first template or sync from Meta to get started.</p>
                        </div>
                    ) : (
                        <div className="bg-white border-2 border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b-2 border-gray-100">
                                    <tr>
                                        {['Flow Name', 'Category', 'Language', 'Status', 'Last Updated', ''].map(h => (
                                            <th key={h} className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredTemplates.map(tpl => {
                                        const hasFlow = tpl.components?.some((c: any) => c.type === 'BUTTONS' && c.buttons?.some((b: any) => b.type === 'FLOW'));
                                        return (
                                            <tr key={tpl.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-xl ${hasFlow ? 'bg-purple-50' : 'bg-gray-50'}`}>
                                                            {hasFlow ? <Workflow size={16} className="text-purple-600" /> : <FileText size={16} className="text-gray-400" />}
                                                        </div>
                                                        <div>
                                                            <div className="font-black text-gray-900 text-sm">{tpl.name}</div>
                                                            {hasFlow && <div className="text-[10px] text-purple-500 font-bold">Flow attached</div>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{tpl.category}</td>
                                                <td className="px-6 py-4 text-xs text-gray-500">{LANGUAGES[tpl.language] || tpl.language}</td>
                                                <td className="px-6 py-4"><StatusBadge status={tpl.status} /></td>
                                                <td className="px-6 py-4 text-xs text-gray-400">Mar 21, 2026</td>
                                                <td className="px-6 py-4 text-right">
                                                    {tpl.status === 'REJECTED' && tpl.rejectionReason && (
                                                        <div className="flex items-center gap-1.5 text-[10px] text-red-500 font-semibold max-w-[140px] text-right ml-auto">
                                                            <AlertCircle size={12} className="shrink-0" />
                                                            <span>{tpl.rejectionReason}</span>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {view === 'library' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {LIBRARY_TEMPLATES.map(tpl => (
                        <div key={tpl.name} className="bg-white border-2 border-gray-100 rounded-3xl overflow-hidden flex flex-col hover:border-purple-200 hover:shadow-lg transition-all group">
                            <div className="p-5 border-b border-gray-50">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-black text-gray-900 text-base">{tpl.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</h3>
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${tpl.category === 'MARKETING' ? 'bg-purple-50 text-purple-700 border-purple-100' : tpl.category === 'AUTHENTICATION' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-gray-50 text-gray-600 border-gray-100'}`}>{tpl.category}</span>
                                </div>
                                <p className="text-xs text-gray-400">{tpl.description}</p>
                            </div>
                            <div className="p-5 flex-1 bg-gray-50/50">
                                <div className="bg-white rounded-2xl p-3 text-sm text-gray-600 border border-gray-100 line-clamp-3 text-xs leading-relaxed">
                                    "{tpl.body}"
                                </div>
                            </div>
                            <div className="p-5 border-t border-gray-50">
                                <button onClick={() => { setSelectedLibraryTemplate({ name: tpl.name, category: tpl.category, body: tpl.body, language: 'en_US' }); setIsCreateModalOpen(true); }}
                                    className="w-full py-3 text-sm font-black text-purple-600 bg-purple-50 border-2 border-purple-100 rounded-2xl hover:bg-purple-600 hover:text-white transition-all shadow-sm">
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
    if (status === 'APPROVED') return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-green-50 text-green-700 border border-green-100 uppercase tracking-wider">
            <CheckCircle size={11} /> Approved
        </span>
    );
    if (status === 'REJECTED') return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-red-50 text-red-700 border border-red-100 uppercase tracking-wider">
            <XCircle size={11} /> Rejected
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wider">
            <Clock size={11} /> {status}
        </span>
    );
}
