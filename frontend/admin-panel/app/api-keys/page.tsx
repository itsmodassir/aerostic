'use client';

import { useState, useEffect } from 'react';
import {
    Key,
    Plus,
    Trash2,
    Search,
    Check,
    X,
    Loader2,
    Copy,
    Building
} from 'lucide-react';

interface ApiKey {
    id: string;
    name: string;
    keyPrefix: string;
    permissions: string[];
    isActive: boolean;
    lastUsedAt: string | null;
    createdAt: string;
    tenant?: {
        id: string;
        name: string;
    };
}

interface Tenant {
    id: string;
    name: string;
}

const AVAILABLE_PERMISSIONS = [
    { id: 'messages:read', label: 'Read Messages' },
    { id: 'messages:write', label: 'Send Messages' },
    { id: 'contacts:read', label: 'Read Contacts' },
    { id: 'contacts:write', label: 'Manage Contacts' },
    { id: 'templates:read', label: 'Read Templates' },
    { id: 'settings:read', label: 'Read Settings' },
];

export default function ApiKeysPage() {
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        tenantId: '',
        name: '',
        permissions: ['messages:read', 'messages:write'] as string[],
    });



    useEffect(() => {
        fetchApiKeys();
        fetchTenants();
    }, []);

    const fetchApiKeys = async () => {
        try {
            const res = await fetch(`/api/v1/admin/billing/api-keys`, {
                credentials: 'include',
            });
            if (res.ok) {
                const data = await res.json();
                setApiKeys(data);
            }
        } catch (error) {
            console.error('Failed to fetch API keys', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTenants = async () => {
        try {
            // Reusing existing admin endpoint for tenants management
            const res = await fetch(`/api/v1/admin/tenants`, {
                credentials: 'include',
            });
            if (res.ok) {
                const data = await res.json();
                setTenants(data.map((t: any) => ({ id: t.id, name: t.name })));
            }
        } catch (error) {
            console.error('Failed to fetch tenants', error);
        }
    };

    const openModal = () => {
        setGeneratedKey(null);
        setFormData({
            tenantId: tenants[0]?.id || '',
            name: '',
            permissions: ['messages:read', 'messages:write'],
        });
        setIsModalOpen(true);
    };

    const handleCreate = async () => {
        if (!formData.tenantId || !formData.name) {
            alert('Please fill in all required fields');
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`/api/v1/admin/api-keys`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error('Failed to create API key');

            const data = await res.json();
            setGeneratedKey(data.rawKey); // Show the raw key to the user
            fetchApiKeys(); // Refresh list in background
            setSaving(false);
        } catch (error) {
            alert('Error creating API key');
            setSaving(false);
        }
    };

    const handleRevoke = async (id: string, tenantId: string) => {
        if (!confirm('Are you sure you want to revoke this API Key? It will stop working immediately.')) return;
        try {
            // Assuming delete endpoint works or specific revoke endpoint
            // My implementation used DELETE /:id with tenantId query param
            const res = await fetch(`/api/v1/admin/billing/api-keys/${id}?tenantId=${tenantId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (res.ok) {
                fetchApiKeys();
            } else {
                alert('Failed to revoke key');
            }
        } catch (error) {
            alert('Error revoking API key');
        }
    };

    const togglePermission = (permId: string) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permId)
                ? prev.permissions.filter(p => p !== permId)
                : [...prev.permissions, permId]
        }));
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Global API Keys</h1>
                    <p className="text-gray-600 mt-1">Manage API access for all tenants</p>
                </div>
                <button
                    onClick={openModal}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Generate Key
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name / Prefix</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Used</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {apiKeys.length > 0 ? apiKeys.map((key) => (
                                <tr key={key.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-gray-900">{key.name}</p>
                                        <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{key.keyPrefix}...</code>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <Building className="w-4 h-4 text-gray-400" />
                                            {key.tenant?.name || 'Unknown'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {key.permissions.slice(0, 3).map(p => (
                                                <span key={p} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs border border-blue-100">
                                                    {p.split(':')[1]}
                                                </span>
                                            ))}
                                            {key.permissions.length > 3 && (
                                                <span className="px-1.5 py-0.5 bg-gray-50 text-gray-600 rounded text-xs">
                                                    +{key.permissions.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {key.isActive ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                                Revoked
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Never'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(key.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {key.isActive && (
                                            <button
                                                onClick={() => handleRevoke(key.id, key.tenant?.id || '')}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Revoke Key"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        <Key className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                        <p>No API Keys found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold">Generate API Key</h2>
                            {!generatedKey && (
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        <div className="p-6">
                            {generatedKey ? (
                                <div className="text-center space-y-4">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Check className="w-8 h-8 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">API Key Generated!</h3>
                                    <p className="text-sm text-gray-600">
                                        Please copy this key immediately. You won't be able to see it again.
                                    </p>

                                    <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg border border-gray-200 mt-4">
                                        <code className="text-sm font-mono text-gray-800 break-all flex-1">{generatedKey}</code>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(generatedKey)}
                                            className="p-2 hover:bg-white rounded-md text-gray-500 hover:text-blue-600 transition-colors"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                    >
                                        Done
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Tenant</label>
                                        <select
                                            value={formData.tenantId}
                                            onChange={e => setFormData(prev => ({ ...prev, tenantId: e.target.value }))}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                        >
                                            {tenants.map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Key Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="e.g. Production Server"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {AVAILABLE_PERMISSIONS.map(p => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => togglePermission(p.id)}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all text-left ${formData.permissions.includes(p.id)
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${formData.permissions.includes(p.id) ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'
                                                        }`}>
                                                        {formData.permissions.includes(p.id) && <Check className="w-3 h-3 text-white" />}
                                                    </div>
                                                    {p.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-end gap-3">
                                        <button
                                            onClick={() => setIsModalOpen(false)}
                                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleCreate}
                                            disabled={saving}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
                                        >
                                            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                            Generate Key
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
