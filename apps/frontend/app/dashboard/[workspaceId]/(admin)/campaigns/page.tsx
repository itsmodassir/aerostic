"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Plus, Send, Copy, AlertCircle } from 'lucide-react';
import { useParams } from 'next/navigation';

interface Campaign {
    id: string;
    name: string;
    status: string;
    sentCount: number;
    failedCount: number;
    totalContacts: number;
    createdAt: string;
}

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [tenantId, setTenantId] = useState<string>('');
    const params = useParams();

    const [templates, setTemplates] = useState<any[]>([]);

    const [newCampaign, setNewCampaign] = useState({
        name: '',
        templateName: ''
    });

    useEffect(() => {
        const initTenant = async () => {
            const workspaceSlug = params.workspaceId as string;
            if (!workspaceSlug) return;

            try {
                // Fetch workspaces to resolve slug -> id
                const res = await api.get('/auth/workspaces');
                // The API might return { tenant: {...} } or flat.
                // Based on auth.controller.ts: relations: ['tenant']
                // It returns TenantMembership[] which likely looks like: { userId, tenantId, role, tenant: { id, name, slug } }
                // Let's assume the shape from AuthController.
                const memberships = res.data;
                const activeMembership = memberships.find((m: any) => m.tenant?.slug === workspaceSlug);

                if (activeMembership && activeMembership.tenant?.id) {
                    const tid = activeMembership.tenant.id;
                    setTenantId(tid);
                    fetchCampaigns(tid);
                    fetchTemplates(tid);
                }
            } catch (e) {
                console.error('Failed to resolve tenant');
            }
        };

        initTenant();
    }, [params.workspaceId]);

    const fetchTemplates = async (tid: string) => {
        try {
            const res = await api.get(`/templates?tenantId=${tid}`);
            setTemplates(res.data.filter((t: any) => t.status === 'APPROVED'));
        } catch (e) {
            console.error('Failed to load templates');
        }
    };

    const fetchCampaigns = async (tid: string) => {
        try {
            const res = await api.get(`/campaigns?tenantId=${tid}`);
            setCampaigns(res.data);
        } catch (error) {
            console.error('Failed to fetch campaigns', error);
        }
    };

    const handleCreateAndSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirm('This will send a message to ALL contacts. Are you sure?')) return;

        try {
            // 1. Create Campaign
            const createRes = await api.post('/campaigns', {
                tenantId,
                name: newCampaign.name,
                templateName: newCampaign.templateName // Now passing real template name
            });

            const campaignId = createRes.data.id;

            // 2. Dispatch Immediately (For MVP)
            await api.post(`/campaigns/${campaignId}/send`, { tenantId });

            setShowModal(false);
            setNewCampaign({ name: '', templateName: '' }); // Reset
            fetchCampaigns(tenantId);
            alert('Campaign dispatched! Refresh to see progress.');
        } catch (error) {
            alert('Failed to launch campaign');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Broadcasts</h1>
                    <p className="text-gray-500">Send bulk marketing messages to your audience.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus size={18} />
                    New Campaign
                </button>
            </div>

            <div className="grid gap-4">
                {campaigns.length === 0 ? (
                    <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500">
                        No campaigns yet. Launch your first broadcast!
                    </div>
                ) : (
                    campaigns.map((camp) => (
                        <div key={camp.id} className="bg-white p-6 rounded-lg shadow-sm border flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                    {camp.name}
                                    <span className={`px-2 py-0.5 rounded text-xs uppercase font-bold ${camp.status === 'completed' ? 'bg-green-100 text-green-700' :
                                        camp.status === 'sending' ? 'bg-blue-100 text-blue-700' :
                                            'bg-gray-100 text-gray-600'
                                        }`}>
                                        {camp.status}
                                    </span>
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Dispatched on {new Date(camp.createdAt).toLocaleDateString()} at {new Date(camp.createdAt).toLocaleTimeString()}
                                </p>
                            </div>
                            <div className="flex gap-8 text-center">
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{camp.totalContacts}</p>
                                    <p className="text-xs text-gray-500 uppercase">Targeted</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-green-600">{camp.sentCount}</p>
                                    <p className="text-xs text-gray-500 uppercase">Sent</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-red-500">{camp.failedCount}</p>
                                    <p className="text-xs text-gray-500 uppercase">Failed</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg">
                        <h2 className="text-xl font-bold mb-4">New Broadcast</h2>
                        <form onSubmit={handleCreateAndSend} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Campaign Name</label>
                                <input
                                    required
                                    className="w-full border rounded-md px-3 py-2 mt-1"
                                    placeholder="e.g. Summer Sale 2024"
                                    value={newCampaign.name}
                                    onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Select Template</label>
                                <select
                                    className="w-full border rounded-md px-3 py-2 mt-1 bg-white"
                                    required
                                    value={newCampaign.templateName}
                                    onChange={(e) => setNewCampaign({ ...newCampaign, templateName: e.target.value })}
                                >
                                    <option value="" disabled>Select a template...</option>
                                    <option value="hello_world">hello_world (Test)</option>
                                    {templates.map(t => (
                                        <option key={t.id} value={t.name}>{t.name} ({t.language})</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    Only APPROVED templates are shown.
                                </p>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex gap-3">
                                <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
                                <p className="text-sm text-yellow-800">
                                    This will immediately send messages to all saved contacts.
                                    Ensure you have explicit opt-in consent.
                                </p>
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                >
                                    <Send size={16} />
                                    Launch Campaign
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
