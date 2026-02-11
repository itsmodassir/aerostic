'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, AlertTriangle, CheckCircle, Database, Globe, Key, Loader2, Eye, EyeOff } from 'lucide-react';

interface ConfigItem {
    value: string;
    description: string;
    category: string;
    isSecret: boolean;
    source: 'default' | 'env' | 'database';
    updatedAt?: string;
}

export default function SystemPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');
    const [configMeta, setConfigMeta] = useState<Record<string, ConfigItem>>({});

    // Configuration state
    const [config, setConfig] = useState({
        // Meta WhatsApp
        'meta.app_id': '',
        'meta.app_secret': '',
        'meta.webhook_verify_token': '',
        'meta.config_id': '',

        // Razorpay
        'razorpay.key_id': '',
        'razorpay.key_secret': '',
        'razorpay.webhook_secret': '',

        // AI
        'ai.gemini_api_key': '',
        'ai.openai_api_key': '',

        // Platform
        'platform.app_url': '',
        'platform.trial_days': '14',
        'platform.message_rate_limit': '100',
        'platform.max_tenants': '1000',
    });

    // Fetch existing configuration on mount
    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/v1/admin/config`, {
                credentials: 'include'
            });

            if (!res.ok) throw new Error('Failed to fetch config');

            const data: Record<string, ConfigItem> = await res.json();
            setConfigMeta(data);

            // Map to flat structure
            const newConfig: any = { ...config };
            for (const [key, item] of Object.entries(data)) {
                newConfig[key] = item.value || '';
            }
            setConfig(newConfig);
        } catch (e) {
            console.log('Using default config - API unavailable');
            // Keep defaults
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');

        try {
            const res = await fetch(`/api/v1/admin/config`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(config),
            });

            if (!res.ok) {
                throw new Error('Failed to save configuration');
            }

            const result = await res.json();
            console.log('Config saved:', result);

            setSaved(true);
            setTimeout(() => setSaved(false), 3000);

            // Refresh to get updated values
            await fetchConfig();
        } catch (e: any) {
            setError(e.message || 'Failed to save configuration');
        } finally {
            setSaving(false);
        }
    };


    const updateConfig = (key: string, value: string) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const handleReset = async (key: string) => {
        if (!confirm(`Are you sure you want to reset ${key} to its default value?`)) return;

        try {
            const res = await fetch(`/api/v1/admin/config/${key}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!res.ok) throw new Error('Failed to reset config');
            await fetchConfig();
        } catch (e: any) {
            setError(e.message || 'Failed to reset configuration');
        }
    };

    const SourceBadge = ({ source }: { source: string }) => {
        if (source === 'database') {
            return <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded-md font-medium">DB Override</span>;
        }
        if (source === 'env') {
            return <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-600 rounded-md font-medium">ENV</span>;
        }
        return <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded-md font-medium">Default</span>;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">System Configuration</h1>
                    <p className="text-gray-600 mt-1">Manage global platform settings - changes are saved to database</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchConfig}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                    {saved && (
                        <span className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="w-5 h-5" />
                            Saved!
                        </span>
                    )}
                    {error && (
                        <span className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="w-5 h-5" />
                            {error}
                        </span>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {saving ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {/* Meta WhatsApp Config */}
                <section className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <Globe className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Meta WhatsApp Configuration</h2>
                            <p className="text-gray-500 text-sm">WhatsApp Business API credentials</p>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">Meta App ID</label>
                                <div className="flex items-center gap-2">
                                    <SourceBadge source={configMeta['meta.app_id']?.source} />
                                    {configMeta['meta.app_id']?.source === 'database' && (
                                        <button onClick={() => handleReset('meta.app_id')} className="text-[10px] text-red-500 hover:underline">Reset</button>
                                    )}
                                </div>
                            </div>
                            <input
                                type="text"
                                value={config['meta.app_id']}
                                onChange={(e) => updateConfig('meta.app_id', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="123456789012345"
                                autoComplete="off"
                            />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">Meta App Secret</label>
                                <div className="flex items-center gap-2">
                                    <SourceBadge source={configMeta['meta.app_secret']?.source} />
                                    {configMeta['meta.app_secret']?.source === 'database' && (
                                        <button onClick={() => handleReset('meta.app_secret')} className="text-[10px] text-red-500 hover:underline">Reset</button>
                                    )}
                                </div>
                            </div>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={config['meta.app_secret']}
                                    onChange={(e) => updateConfig('meta.app_secret', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">Webhook Verify Token</label>
                                <div className="flex items-center gap-2">
                                    <SourceBadge source={configMeta['meta.webhook_verify_token']?.source} />
                                    {configMeta['meta.webhook_verify_token']?.source === 'database' && (
                                        <button onClick={() => handleReset('meta.webhook_verify_token')} className="text-[10px] text-red-500 hover:underline">Reset</button>
                                    )}
                                </div>
                            </div>
                            <input
                                type="text"
                                value={config['meta.webhook_verify_token']}
                                onChange={(e) => updateConfig('meta.webhook_verify_token', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="your_verify_token"
                                autoComplete="off"
                            />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">WhatsApp Configuration ID</label>
                                <div className="flex items-center gap-2">
                                    <SourceBadge source={configMeta['meta.config_id']?.source} />
                                    {configMeta['meta.config_id']?.source === 'database' && (
                                        <button onClick={() => handleReset('meta.config_id')} className="text-[10px] text-red-500 hover:underline">Reset</button>
                                    )}
                                </div>
                            </div>
                            <input
                                type="text"
                                value={config['meta.config_id']}
                                onChange={(e) => updateConfig('meta.config_id', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="925810693206943"
                                autoComplete="off"
                            />
                        </div>
                    </div>
                </section>

                {/* Razorpay Config */}
                <section className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <Key className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Razorpay Configuration</h2>
                            <p className="text-gray-500 text-sm">Payment gateway credentials</p>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">Razorpay Key ID</label>
                                <div className="flex items-center gap-2">
                                    <SourceBadge source={configMeta['razorpay.key_id']?.source} />
                                    {configMeta['razorpay.key_id']?.source === 'database' && (
                                        <button onClick={() => handleReset('razorpay.key_id')} className="text-[10px] text-red-500 hover:underline">Reset</button>
                                    )}
                                </div>
                            </div>
                            <input
                                type="text"
                                value={config['razorpay.key_id']}
                                onChange={(e) => updateConfig('razorpay.key_id', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="rzp_live_..."
                                autoComplete="off"
                            />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">Razorpay Key Secret</label>
                                <div className="flex items-center gap-2">
                                    <SourceBadge source={configMeta['razorpay.key_secret']?.source} />
                                    {configMeta['razorpay.key_secret']?.source === 'database' && (
                                        <button onClick={() => handleReset('razorpay.key_secret')} className="text-[10px] text-red-500 hover:underline">Reset</button>
                                    )}
                                </div>
                            </div>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={config['razorpay.key_secret']}
                                    onChange={(e) => updateConfig('razorpay.key_secret', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">Webhook Secret</label>
                                <div className="flex items-center gap-2">
                                    <SourceBadge source={configMeta['razorpay.webhook_secret']?.source} />
                                    {configMeta['razorpay.webhook_secret']?.source === 'database' && (
                                        <button onClick={() => handleReset('razorpay.webhook_secret')} className="text-[10px] text-red-500 hover:underline">Reset</button>
                                    )}
                                </div>
                            </div>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={config['razorpay.webhook_secret']}
                                    onChange={(e) => updateConfig('razorpay.webhook_secret', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* AI Configuration */}
                <section className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                            <Settings className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">AI Configuration</h2>
                            <p className="text-gray-500 text-sm">AI model API keys</p>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">Google Gemini API Key</label>
                                <div className="flex items-center gap-2">
                                    <SourceBadge source={configMeta['ai.gemini_api_key']?.source} />
                                    {configMeta['ai.gemini_api_key']?.source === 'database' && (
                                        <button onClick={() => handleReset('ai.gemini_api_key')} className="text-[10px] text-red-500 hover:underline">Reset</button>
                                    )}
                                </div>
                            </div>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={config['ai.gemini_api_key']}
                                    onChange={(e) => updateConfig('ai.gemini_api_key', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">OpenAI API Key (Optional)</label>
                                <div className="flex items-center gap-2">
                                    <SourceBadge source={configMeta['ai.openai_api_key']?.source} />
                                    {configMeta['ai.openai_api_key']?.source === 'database' && (
                                        <button onClick={() => handleReset('ai.openai_api_key')} className="text-[10px] text-red-500 hover:underline">Reset</button>
                                    )}
                                </div>
                            </div>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={config['ai.openai_api_key']}
                                    onChange={(e) => updateConfig('ai.openai_api_key', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Platform Settings */}
                <section className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                            <Database className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Platform Settings</h2>
                            <p className="text-gray-500 text-sm">General platform configuration</p>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">Application URL</label>
                                <div className="flex items-center gap-2">
                                    <SourceBadge source={configMeta['platform.app_url']?.source} />
                                    {configMeta['platform.app_url']?.source === 'database' && (
                                        <button onClick={() => handleReset('platform.app_url')} className="text-[10px] text-red-500 hover:underline">Reset</button>
                                    )}
                                </div>
                            </div>
                            <input
                                type="url"
                                value={config['platform.app_url']}
                                onChange={(e) => updateConfig('platform.app_url', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="https://app.aerostic.com"
                                autoComplete="off"
                            />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">Trial Days</label>
                                <div className="flex items-center gap-2">
                                    <SourceBadge source={configMeta['platform.trial_days']?.source} />
                                    {configMeta['platform.trial_days']?.source === 'database' && (
                                        <button onClick={() => handleReset('platform.trial_days')} className="text-[10px] text-red-500 hover:underline">Reset</button>
                                    )}
                                </div>
                            </div>
                            <input
                                type="number"
                                value={config['platform.trial_days']}
                                onChange={(e) => updateConfig('platform.trial_days', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                autoComplete="off"
                            />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">Message Rate Limit (per minute)</label>
                                <div className="flex items-center gap-2">
                                    <SourceBadge source={configMeta['platform.message_rate_limit']?.source} />
                                    {configMeta['platform.message_rate_limit']?.source === 'database' && (
                                        <button onClick={() => handleReset('platform.message_rate_limit')} className="text-[10px] text-red-500 hover:underline">Reset</button>
                                    )}
                                </div>
                            </div>
                            <input
                                type="number"
                                value={config['platform.message_rate_limit']}
                                onChange={(e) => updateConfig('platform.message_rate_limit', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                autoComplete="off"
                            />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">Max Tenants Per Server</label>
                                <div className="flex items-center gap-2">
                                    <SourceBadge source={configMeta['platform.max_tenants']?.source} />
                                    {configMeta['platform.max_tenants']?.source === 'database' && (
                                        <button onClick={() => handleReset('platform.max_tenants')} className="text-[10px] text-red-500 hover:underline">Reset</button>
                                    )}
                                </div>
                            </div>
                            <input
                                type="number"
                                value={config['platform.max_tenants']}
                                onChange={(e) => updateConfig('platform.max_tenants', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                autoComplete="off"
                            />
                        </div>
                    </div>
                </section>

                {/* Database Info */}
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                    <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-green-800">Connected to Database</h4>
                        <p className="text-sm text-green-700">
                            Configuration changes are saved permanently to the database and will persist across server restarts.
                        </p>
                    </div>
                </div>

                {/* Warning */}
                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-amber-800">Important</h4>
                        <p className="text-sm text-amber-700">
                            Changes to system configuration may affect all tenants. Make sure to test in a staging environment first.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
