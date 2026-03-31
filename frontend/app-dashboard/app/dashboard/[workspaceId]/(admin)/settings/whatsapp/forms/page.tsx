'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Link2, Plus, RefreshCw, Rocket, Trash2 } from 'lucide-react';

type WaForm = {
    id: string;
    name: string;
    description?: string;
    status: 'draft' | 'published' | 'archived';
    metaFlowId?: string | null;
    updatedAt: string;
};

function statusClass(status: WaForm['status']) {
    if (status === 'published') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (status === 'archived') return 'bg-gray-100 text-gray-600 border-gray-200';
    return 'bg-amber-50 text-amber-700 border-amber-100';
}

export default function WhatsappFormsListPage() {
    const [forms, setForms] = useState<WaForm[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState('');

    const loadForms = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/wa-forms');
            setForms(Array.isArray(res.data) ? res.data : []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load WA Forms');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadForms();
    }, []);

    const createForm = async () => {
        setSyncing(true);
        try {
            const res = await api.post('/wa-forms', {
                name: `New Form ${new Date().toLocaleTimeString()}`,
                description: 'Configure your WhatsApp form fields',
                schemaJson: {
                    title: 'New WhatsApp Form',
                    description: 'Collect user responses',
                    sections: [
                        {
                            id: 'section_1',
                            title: 'Section 1',
                            description: 'Main details',
                            questions: [
                                {
                                    id: 'question_1',
                                    label: 'Full Name',
                                    type: 'short_text',
                                    required: true,
                                },
                            ],
                        },
                    ],
                },
            });
            if (res.data?.id) {
                window.location.href = `/settings/whatsapp/forms/${res.data.id}`;
                return;
            }
            await loadForms();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to create form');
        } finally {
            setSyncing(false);
        }
    };

    const publishForm = async (id: string) => {
        setSyncing(true);
        try {
            await api.post(`/wa-forms/${id}/publish`);
            await loadForms();
            alert('Form published to WhatsApp Flow.');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Publish failed. Check WhatsApp connection first.');
        } finally {
            setSyncing(false);
        }
    };

    const removeForm = async (id: string) => {
        if (!confirm('Delete this form?')) return;
        try {
            await api.delete(`/wa-forms/${id}`);
            await loadForms();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete form');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 animate-in fade-in duration-500">
            <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">WA Forms</h1>
                    <p className="text-sm text-gray-500 mt-1">Build form-like WhatsApp flow experiences and reuse them in automation.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={loadForms}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 inline-flex items-center gap-2"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                    <button
                        onClick={createForm}
                        disabled={syncing}
                        className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 inline-flex items-center gap-2 disabled:opacity-60"
                    >
                        <Plus size={16} />
                        New Form
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
                        <tr>
                            <th className="text-left px-4 py-3">Name</th>
                            <th className="text-left px-4 py-3">Status</th>
                            <th className="text-left px-4 py-3">Meta Flow ID</th>
                            <th className="text-left px-4 py-3">Updated</th>
                            <th className="text-right px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">Loading forms...</td>
                            </tr>
                        )}
                        {!loading && forms.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No forms yet. Create your first WA Form.</td>
                            </tr>
                        )}
                        {!loading && forms.map((form) => (
                            <tr key={form.id} className="border-t border-gray-100">
                                <td className="px-4 py-3">
                                    <Link href={`/settings/whatsapp/forms/${form.id}`} className="font-bold text-gray-900 hover:text-blue-700">
                                        {form.name}
                                    </Link>
                                    {form.description && <p className="text-xs text-gray-500 mt-1">{form.description}</p>}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2.5 py-1 rounded-full border text-xs font-bold capitalize ${statusClass(form.status)}`}>
                                        {form.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-gray-600">{form.metaFlowId || '-'}</td>
                                <td className="px-4 py-3 text-gray-600">{new Date(form.updatedAt).toLocaleString()}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => publishForm(form.id)}
                                            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 inline-flex items-center gap-1"
                                        >
                                            <Rocket size={12} />
                                            Publish
                                        </button>
                                        <Link
                                            href={`/automation/builder?id=new&formId=${encodeURIComponent(form.id)}&formName=${encodeURIComponent(form.name)}&triggerType=flow_response`}
                                            className="px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-700 text-xs font-semibold hover:bg-indigo-50 inline-flex items-center gap-1"
                                        >
                                            <Link2 size={12} />
                                            Attach Trigger
                                        </Link>
                                        <button
                                            onClick={() => removeForm(form.id)}
                                            className="px-2 py-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
