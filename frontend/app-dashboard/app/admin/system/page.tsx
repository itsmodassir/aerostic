'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, AlertTriangle, CheckCircle, Database, Globe, Key, Loader2, FileText, Search, Lock, Terminal, Mail, CheckCheck, XCircle } from 'lucide-react';

interface ConfigItem {
    value: string;
    description: string;
    category: string;
    isSecret: boolean;
    source: 'default' | 'env' | 'database';
    updatedAt?: string;
}

interface EnvVar {
    key: string;
    value: string;
    isSensitive: boolean;
}

export default function SystemPage() {
    const [activeTab, setActiveTab] = useState<'config' | 'env'>('config');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [fetchingEnv, setFetchingEnv] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');
    const [configMeta, setConfigMeta] = useState<Record<string, ConfigItem>>({});
    const [envVars, setEnvVars] = useState<EnvVar[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

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

        // WhatsApp Pricing (Global)
        'whatsapp.template_rate_inr': '0.80',

        // Email / SMTP
        'email.smtp_host': '',
        'email.smtp_port': '587',
        'email.smtp_secure': 'false',
        'email.smtp_user': '',
        'email.smtp_pass': '',
        'email.from_name': 'Aerostic',
        'email.from_email': 'no-reply@aimstore.in',
        'email.otp_enabled': 'true',
        'email.welcome_enabled': 'true',
        'email.forgot_password_enabled': 'true',
        'email.promotional_enabled': 'false',
    });

    // Fetch existing configuration on mount
    useEffect(() => {
        fetchConfig();
        fetchEnv();
    }, []);

    const fetchConfig = async () => {
        setLoading(true);
        setError('');
        try {
            console.log('Fetching system config...');
            const res = await fetch(`/api/v1/admin/system/config`, {
                credentials: 'include'
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error(`Fetch config failed: ${res.status} ${res.statusText}`, errorText);
                throw new Error(`Failed to fetch config (${res.status})`);
            }

            const data: Record<string, ConfigItem> = await res.json();
            setConfigMeta(data);

            // Map to flat structure
            const newConfig: any = { ...config };
            for (const [key, item] of Object.entries(data)) {
                newConfig[key] = item.value || '';
            }
            setConfig(newConfig);
        } catch (e: any) {
            console.error('Core config fetch error:', e);
            setError(e.message || 'API unavailable');
        } finally {
            setLoading(false);
        }
    };

    const fetchEnv = async () => {
        setFetchingEnv(true);
        try {
            const res = await fetch(`/api/v1/admin/system/env`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setEnvVars(data);
            }
        } catch (e) {
            console.error('Failed to fetch env file:', e);
        } finally {
            setFetchingEnv(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');

        try {
            console.log('Saving config updates:', config);
            const res = await fetch(`/api/v1/admin/system/config`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(config),
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error(`Save config failed: ${res.status} ${res.statusText}`, errorText);
                throw new Error(`Failed to save configuration (${res.status})`);
            }

            const result = await res.json();
            console.log('Config successfully saved:', result);

            setSaved(true);
            setTimeout(() => setSaved(false), 3000);

            // Refresh to get updated values
            await fetchConfig();
        } catch (e: any) {
            console.error('Core config save error:', e);
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
            const res = await fetch(`/api/v1/admin/system/config/${key}`, {
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

    const filteredEnvVars = envVars.filter(ev =>
        ev.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.value.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const TestEmailButton = () => {
        const [testing, setTesting] = useState(false);
        const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null);
        const test = async () => {
            setTesting(true);
            setResult(null);
            try {
                const res = await fetch('/api/v1/admin/system/email/test', { method: 'POST', credentials: 'include' });
                const data = await res.json();
                setResult(data);
            } catch (e: any) {
                setResult({ success: false, error: 'Request failed' });
            } finally {
                setTesting(false);
            }
        };
        return (
            <div className="flex items-center gap-3">
                <button
                    onClick={test}
                    disabled={testing}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50"
                >
                    {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                    {testing ? 'Testing...' : 'Test SMTP Connection'}
                </button>
                {result && (
                    result.success
                        ? <span className="flex items-center gap-1 text-green-600 text-sm"><CheckCheck className="w-4 h-4" /> Connected!</span>
                        : <span className="flex items-center gap-1 text-red-600 text-sm"><XCircle className="w-4 h-4" /> {result.error || 'Failed'}</span>
                )}
            </div>
        );
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
                    <p className="text-gray-600 mt-1">Manage global platform settings and environment variables</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={activeTab === 'config' ? fetchConfig : fetchEnv}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                        <RefreshCw className={`w-4 h-4 ${(loading || fetchingEnv) ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    {activeTab === 'config' && (
                        <>
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
                        </>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-4 mb-6 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('config')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'config'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                >
                    <Settings className="w-4 h-4" />
                    Configuration
                </button>
                <button
                    onClick={() => setActiveTab('env')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'env'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                >
                    <Terminal className="w-4 h-4" />
                    Environment (.env)
                </button>
            </div>

            {activeTab === 'config' ? (
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
                                        <SourceBadge source={configMeta['meta.config_id']?.source || 'default'} />
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
                            <div className="md:col-span-2 pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Global Template Message Rate (INR)</label>
                                        <p className="text-xs text-gray-500 mt-1">Default cost deducted per WhatsApp template message sent by tenants.</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <SourceBadge source={configMeta['whatsapp.template_rate_inr']?.source || 'default'} />
                                        {configMeta['whatsapp.template_rate_inr']?.source === 'database' && (
                                            <button onClick={() => handleReset('whatsapp.template_rate_inr')} className="text-[10px] text-red-500 hover:underline">Reset</button>
                                        )}
                                    </div>
                                </div>
                                <div className="relative w-full md:w-1/2">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={config['whatsapp.template_rate_inr']}
                                        onChange={(e) => updateConfig('whatsapp.template_rate_inr', e.target.value)}
                                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="0.80"
                                        autoComplete="off"
                                    />
                                </div>
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
                                    placeholder="https://app.aimstore.in"
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

                    {/* Email Configuration */}
                    <section className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">Email Configuration</h2>
                                <p className="text-gray-500 text-sm">SMTP settings for OTP, welcome, forgot-password & promotional emails</p>
                            </div>
                        </div>

                        {/* SMTP Credentials */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700">SMTP Host</label>
                                    <SourceBadge source={configMeta['email.smtp_host']?.source} />
                                </div>
                                <input
                                    type="text"
                                    value={config['email.smtp_host']}
                                    onChange={(e) => updateConfig('email.smtp_host', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="smtp.gmail.com"
                                    autoComplete="off"
                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700">SMTP Port</label>
                                    <SourceBadge source={configMeta['email.smtp_port']?.source} />
                                </div>
                                <select
                                    value={config['email.smtp_port']}
                                    onChange={(e) => {
                                        const port = e.target.value;
                                        updateConfig('email.smtp_port', port);
                                        updateConfig('email.smtp_secure', port === '465' ? 'true' : 'false');
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="587">587 — STARTTLS (Recommended)</option>
                                    <option value="465">465 — SSL</option>
                                    <option value="25">25 — Unencrypted</option>
                                </select>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700">SMTP Username</label>
                                    <SourceBadge source={configMeta['email.smtp_user']?.source} />
                                </div>
                                <input
                                    type="text"
                                    value={config['email.smtp_user']}
                                    onChange={(e) => updateConfig('email.smtp_user', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="you@gmail.com"
                                    autoComplete="off"
                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700">SMTP Password / App Password</label>
                                    <SourceBadge source={configMeta['email.smtp_pass']?.source} />
                                </div>
                                <input
                                    type="password"
                                    value={config['email.smtp_pass']}
                                    onChange={(e) => updateConfig('email.smtp_pass', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    autoComplete="new-password"
                                    placeholder="••••••••••••"
                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700">Sender Name</label>
                                    <SourceBadge source={configMeta['email.from_name']?.source} />
                                </div>
                                <input
                                    type="text"
                                    value={config['email.from_name']}
                                    onChange={(e) => updateConfig('email.from_name', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Aerostic"
                                    autoComplete="off"
                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700">From Email Address</label>
                                    <SourceBadge source={configMeta['email.from_email']?.source} />
                                </div>
                                <input
                                    type="email"
                                    value={config['email.from_email']}
                                    onChange={(e) => updateConfig('email.from_email', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="no-reply@aimstore.in"
                                    autoComplete="off"
                                />
                            </div>
                        </div>

                        {/* Test Connection */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <TestEmailButton />
                        </div>

                        {/* Email Type Toggles */}
                        <div className="mt-6 pt-4 border-t border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4">Email Type Settings</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                {([
                                    { key: 'email.otp_enabled', label: 'OTP / Verification Emails', desc: 'Send OTP codes for account verification' },
                                    { key: 'email.welcome_enabled', label: 'Welcome Emails', desc: 'Greet new users when they sign up' },
                                    { key: 'email.forgot_password_enabled', label: 'Forgot Password Emails', desc: 'Password reset link emails' },
                                    { key: 'email.promotional_enabled', label: 'Promotional Emails', desc: 'Marketing & promotional messages' },
                                ] as { key: keyof typeof config; label: string; desc: string }[]).map(({ key, label, desc }) => (
                                    <label key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">{label}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                                        </div>
                                        <button
                                            onClick={() => updateConfig(key, config[key] === 'true' ? 'false' : 'true')}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config[key] === 'true' ? 'bg-green-500' : 'bg-gray-300'
                                                }`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${config[key] === 'true' ? 'translate-x-6' : 'translate-x-1'
                                                }`} />
                                        </button>
                                    </label>
                                ))}
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
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 bg-gray-50/50">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-gray-500" />
                                    Server Environment Variables
                                </h2>
                                <p className="text-gray-500 text-sm mt-1">Read-only view of the server's .env file (Sensitive values are masked)</p>
                            </div>
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search variables..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
                                />
                            </div>
                        </div>
                    </div>

                    {fetchingEnv ? (
                        <div className="p-12 flex flex-col items-center justify-center gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            <p className="text-gray-500 animate-pulse">Reading server environment...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Variable Key</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Current Value</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredEnvVars.length > 0 ? (
                                        filteredEnvVars.map((ev) => (
                                            <tr key={ev.key} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <code className="text-sm font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                                        {ev.key}
                                                    </code>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-sm font-mono ${ev.isSensitive ? 'text-gray-400' : 'text-gray-900'}`}>
                                                            {ev.value}
                                                        </span>
                                                        {ev.isSensitive && (
                                                            <Lock className="w-3 h-3 text-gray-300" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {ev.isSensitive ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                                            Sensitive
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                            Public
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                                {searchTerm ? 'No environment variables match your search.' : 'No environment variables found.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
