'use client';

import { useState, useEffect } from 'react';
import { Key, Webhook, Plus, Copy, Eye, EyeOff, Trash2, Check, AlertTriangle } from 'lucide-react';

interface ApiKey {
    id: string;
    name: string;
    keyPrefix: string;
    permissions: string[];
    isActive: boolean;
    lastUsedAt: string | null;
    createdAt: string;
}

interface WebhookEndpoint {
    id: string;
    url: string;
    description: string;
    events: string[];
    isActive: boolean;
    lastTriggeredAt: string | null;
    failureCount: number;
}

const AVAILABLE_EVENTS = [
    'message.received',
    'message.sent',
    'lead.created',
    'lead.updated',
    'campaign.started',
    'campaign.completed',
    'agent.handoff',
];

const AVAILABLE_PERMISSIONS = [
    'messages:read',
    'messages:write',
    'contacts:read',
    'contacts:write',
    'campaigns:read',
    'campaigns:write',
    'templates:read',
    'webhooks:manage',
];

export default function DeveloperPage() {
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [newKeyName, setNewKeyName] = useState('');
    const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>([]);
    const [showNewKey, setShowNewKey] = useState<string | null>(null);
    const [copiedKey, setCopiedKey] = useState(false);
    const [showApiKeyForm, setShowApiKeyForm] = useState(false);
    const [showWebhookForm, setShowWebhookForm] = useState(false);
    const [newWebhookUrl, setNewWebhookUrl] = useState('');
    const [newWebhookEvents, setNewWebhookEvents] = useState<string[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [keysRes, webhooksRes] = await Promise.all([
                fetch('/api/billing/api-keys'),
                fetch('/api/billing/webhooks'),
            ]);
            if (keysRes.ok) setApiKeys(await keysRes.json());
            if (webhooksRes.ok) setWebhooks(await webhooksRes.json());
        } catch (error) {
            console.error('Failed to fetch developer data', error);
        } finally {
            setLoading(false);
        }
    };

    const createApiKey = async () => {
        try {
            const res = await fetch('/api/billing/api-keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newKeyName, permissions: newKeyPermissions }),
            });
            const data = await res.json();
            setShowNewKey(data.rawKey);
            setNewKeyName('');
            setNewKeyPermissions([]);
            setShowApiKeyForm(false);
            fetchData();
        } catch (error) {
            console.error('Failed to create API key', error);
        }
    };

    const revokeApiKey = async (id: string) => {
        if (!confirm('Are you sure you want to revoke this API key?')) return;
        try {
            await fetch(`/api/billing/api-keys/${id}`, { method: 'DELETE' });
            fetchData();
        } catch (error) {
            console.error('Failed to revoke API key', error);
        }
    };

    const createWebhook = async () => {
        try {
            await fetch('/api/billing/webhooks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: newWebhookUrl, events: newWebhookEvents }),
            });
            setNewWebhookUrl('');
            setNewWebhookEvents([]);
            setShowWebhookForm(false);
            fetchData();
        } catch (error) {
            console.error('Failed to create webhook', error);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 2000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Developer Portal</h1>
                <p className="text-gray-600 mt-2">Manage API keys and webhook integrations</p>
            </div>

            {/* New Key Modal */}
            {showNewKey && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
                        <div className="flex items-center gap-3 mb-4 text-green-600">
                            <Check className="w-6 h-6" />
                            <h2 className="text-xl font-bold">API Key Created</h2>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Copy this key now. You won't be able to see it again!
                        </p>
                        <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm break-all mb-4">
                            {showNewKey}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => copyToClipboard(showNewKey)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                {copiedKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copiedKey ? 'Copied!' : 'Copy Key'}
                            </button>
                            <button
                                onClick={() => setShowNewKey(null)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* API Keys Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Key className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">API Keys</h2>
                            <p className="text-gray-500 text-sm">Authenticate your API requests</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowApiKeyForm(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4" />
                        Create Key
                    </button>
                </div>

                {showApiKeyForm && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <input
                            type="text"
                            placeholder="Key name (e.g., Production API)"
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
                        />
                        <p className="text-sm text-gray-600 mb-2">Permissions:</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {AVAILABLE_PERMISSIONS.map((perm) => (
                                <label key={perm} className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={newKeyPermissions.includes(perm)}
                                        onChange={(e) => {
                                            if (e.target.checked) setNewKeyPermissions([...newKeyPermissions, perm]);
                                            else setNewKeyPermissions(newKeyPermissions.filter((p) => p !== perm));
                                        }}
                                    />
                                    <span className="text-sm">{perm}</span>
                                </label>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={createApiKey}
                                disabled={!newKeyName}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                Create
                            </button>
                            <button
                                onClick={() => setShowApiKeyForm(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {apiKeys.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No API keys created yet</p>
                ) : (
                    <div className="space-y-3">
                        {apiKeys.map((key) => (
                            <div key={key.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{key.name}</span>
                                        {!key.isActive && (
                                            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">Revoked</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <code className="text-sm text-gray-500">{key.keyPrefix}...</code>
                                        <span className="text-xs text-gray-400">
                                            Created {new Date(key.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => revokeApiKey(key.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Webhooks Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Webhook className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Webhooks</h2>
                            <p className="text-gray-500 text-sm">Receive real-time event notifications</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowWebhookForm(true)}
                        className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                    >
                        <Plus className="w-4 h-4" />
                        Add Webhook
                    </button>
                </div>

                {showWebhookForm && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <input
                            type="url"
                            placeholder="https://your-app.com/webhook"
                            value={newWebhookUrl}
                            onChange={(e) => setNewWebhookUrl(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
                        />
                        <p className="text-sm text-gray-600 mb-2">Events to subscribe:</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {AVAILABLE_EVENTS.map((event) => (
                                <label key={event} className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={newWebhookEvents.includes(event)}
                                        onChange={(e) => {
                                            if (e.target.checked) setNewWebhookEvents([...newWebhookEvents, event]);
                                            else setNewWebhookEvents(newWebhookEvents.filter((ev) => ev !== event));
                                        }}
                                    />
                                    <span className="text-sm">{event}</span>
                                </label>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={createWebhook}
                                disabled={!newWebhookUrl || newWebhookEvents.length === 0}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                            >
                                Create
                            </button>
                            <button
                                onClick={() => setShowWebhookForm(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {webhooks.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No webhooks configured yet</p>
                ) : (
                    <div className="space-y-3">
                        {webhooks.map((webhook) => (
                            <div key={webhook.id} className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <code className="text-sm font-medium">{webhook.url}</code>
                                    {webhook.failureCount > 0 && (
                                        <span className="flex items-center gap-1 text-xs text-amber-600">
                                            <AlertTriangle className="w-3 h-3" />
                                            {webhook.failureCount} failures
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {webhook.events.map((event) => (
                                        <span key={event} className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded">
                                            {event}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* API Documentation Link */}
            <div className="mt-8 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 text-white">
                <h3 className="text-xl font-bold mb-2">API Documentation</h3>
                <p className="text-gray-300 mb-4">
                    Learn how to integrate with Aerostic API to send messages, manage contacts, and automate workflows.
                </p>
                <a
                    href="/docs"
                    className="inline-flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100"
                >
                    View Documentation
                </a>
            </div>
        </div>
    );
}
