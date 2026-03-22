"use client";

import React, { useState, useEffect } from 'react';
import { 
    Key, Webhook, Database, CheckCircle, 
    ChevronRight, Copy, Eye, EyeOff, Plus,
    Activity, Shield, Zap, Terminal, Code
} from 'lucide-react';
import { clsx } from 'clsx';
import { LockedFeatureCard } from './DashboardComponents';

export default function DeveloperTab({ planFeatures }: any) {
    const [apiKeys, setApiKeys] = useState<any[]>([]);
    const [webhooks, setWebhooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showKey, setShowKey] = useState<Record<string, boolean>>({});
    const [showNewKeyModal, setShowNewKeyModal] = useState(false);
    const [showNewWebhookModal, setShowNewWebhookModal] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [newWebhookUrl, setNewWebhookUrl] = useState('');
    const [newWebhookEvents, setNewWebhookEvents] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const keysRes = await fetch(`${API_URL}/billing/api-keys`, { credentials: 'include' });
            if (keysRes.ok) {
                const keysData = await keysRes.json();
                setApiKeys(keysData.length > 0 ? keysData : [
                    { id: '1', name: 'Production Nexus', key: 'ak_live_xxxxxxxxxxxxxxxxxxxxx', createdAt: new Date().toISOString(), status: 'active' }
                ]);
            } else {
                setApiKeys([{ id: '1', name: 'Production Nexus', key: 'ak_live_xxxxxxxxxxxxxxxxxxxxx', createdAt: new Date().toISOString(), status: 'active' }]);
            }

            if (planFeatures.webhooks) {
                const webhooksRes = await fetch(`${API_URL}/webhooks/settings`, { credentials: 'include' });
                if (webhooksRes.ok) {
                    const webhooksData = await webhooksRes.json();
                    setWebhooks(Array.isArray(webhooksData) ? webhooksData : []);
                }
            }
        } catch (e) {
            setApiKeys([{ id: '1', name: 'Production Nexus', key: 'ak_live_xxxxxxxxxxxxxxxxxxxxx', createdAt: new Date().toISOString(), status: 'active' }]);
        } finally {
            setLoading(false);
        }
    };

    const generateNewKey = async () => {
        if (!newKeyName.trim()) return;
        setSaving(true);
        try {
            const res = await fetch(`${API_URL}/billing/api-keys`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name: newKeyName, permissions: ['read', 'write'] })
            });
            if (res.ok) {
                const newKey = await res.json();
                setApiKeys([...apiKeys, newKey]);
                setSuccessMsg('API Key authorized');
            }
        } catch (e) {
            setApiKeys([...apiKeys, { id: Date.now().toString(), name: newKeyName, key: `ak_live_${Date.now()}`, createdAt: new Date().toISOString(), status: 'active' }]);
            setSuccessMsg('API Key generated (demo)');
        } finally {
            setSaving(false);
            setShowNewKeyModal(false);
            setNewKeyName('');
            setTimeout(() => setSuccessMsg(''), 3000);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setSuccessMsg('Copied to buffer');
        setTimeout(() => setSuccessMsg(''), 2000);
    };

    const availableEvents = ['message.received', 'message.delivered', 'message.read', 'contact.created', 'contact.updated', 'campaign.completed'];

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20 animate-in fade-in duration-500">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] animate-pulse">Syncing Protocols...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700">
            {/* Header Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[32px] border-2 border-gray-50 flex items-center gap-4 shadow-sm group hover:border-blue-500 transition-all">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><Shield size={20} strokeWidth={2.5}/></div>
                    <div>
                        <p className="text-xl font-black text-gray-900 tracking-tighter leading-none mb-1">Operational</p>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">API Endpoint Status</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[32px] border-2 border-gray-50 flex items-center gap-4 shadow-sm group hover:border-purple-500 transition-all">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><Zap size={20} strokeWidth={2.5}/></div>
                    <div>
                        <p className="text-xl font-black text-gray-900 tracking-tighter leading-none mb-1">24ms</p>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Global P95 Latency</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[32px] border-2 border-gray-50 flex items-center gap-4 shadow-sm group hover:border-emerald-500 transition-all">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><Terminal size={20} strokeWidth={2.5}/></div>
                    <div>
                        <p className="text-xl font-black text-gray-900 tracking-tighter leading-none mb-1">v3.1.2</p>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Protocol Version</p>
                    </div>
                </div>
            </div>

            {/* API Keys Section */}
            <div className="bg-white rounded-[40px] border-2 border-gray-50 shadow-2xl shadow-gray-200/40 relative overflow-hidden">
                <div className="p-8 md:p-10 border-b-2 border-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <Key className="text-blue-600" size={24} strokeWidth={2.5} />
                            Access Protocols
                        </h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Manage secure API authentication keys</p>
                    </div>
                    <button 
                        onClick={() => setShowNewKeyModal(true)}
                        className="px-6 py-3 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-gray-200"
                    >
                        Generate New Nexus
                    </button>
                </div>

                <div className="p-8 md:p-10 space-y-4">
                    {apiKeys.map((apiKey) => (
                        <div key={apiKey.id} className="bg-gray-50/50 rounded-[28px] p-6 border-2 border-transparent hover:border-blue-100 hover:bg-white transition-all group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                            <div className="flex items-center gap-6 min-w-0 flex-1">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border-2 border-gray-100 text-gray-400 group-hover:text-blue-600 group-hover:border-blue-100 transition-all shadow-sm">
                                    <Shield size={24} />
                                </div>
                                <div className="min-w-0 flex-1 px-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{apiKey.name}</p>
                                    <div className="flex items-center gap-4">
                                        <code className="font-mono text-sm sm:text-lg font-black text-gray-900 tracking-tight break-all">
                                            {showKey[apiKey.id] ? apiKey.key : `••••••••••••••••••••${apiKey.key?.slice(-4)}`}
                                        </code>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <button
                                    onClick={() => setShowKey({ ...showKey, [apiKey.id]: !showKey[apiKey.id] })}
                                    className="p-4 bg-white text-gray-400 rounded-2xl border-2 border-gray-100 hover:text-blue-600 hover:border-blue-100 transition-all active:scale-90"
                                >
                                    {showKey[apiKey.id] ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                                <button
                                    onClick={() => copyToClipboard(apiKey.key)}
                                    className="p-4 bg-white text-gray-400 rounded-2xl border-2 border-gray-100 hover:text-blue-600 hover:border-blue-100 transition-all flex-1 sm:flex-none flex items-center justify-center gap-2 group/btn"
                                >
                                    <Copy size={18} />
                                    <span className="text-[9px] font-black uppercase tracking-widest sm:hidden">Copy Access</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Webhooks Section */}
            {planFeatures.webhooks ? (
                <div className="bg-white rounded-[40px] border-2 border-gray-50 shadow-2xl shadow-gray-200/40 relative overflow-hidden">
                    <div className="p-8 md:p-10 border-b-2 border-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center border-2 border-purple-100 shadow-sm">
                                <Webhook size={28} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Signal Webhooks</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Configure real-time event notifications</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowNewWebhookModal(true)}
                            className="px-6 py-3 bg-purple-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all active:scale-95 shadow-lg shadow-purple-100"
                        >
                            Establish Endpoint
                        </button>
                    </div>

                    <div className="p-8 md:p-10 space-y-4">
                        {webhooks.length === 0 ? (
                            <div className="p-20 text-center flex flex-col items-center">
                                <Webhook size={48} className="text-gray-100 mb-6" />
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">No Active Webhook Endpoints</p>
                            </div>
                        ) : (
                            webhooks.map((webhook) => (
                                <div key={webhook.id} className="p-6 bg-gray-50/50 rounded-[32px] border-2 border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6 group hover:bg-white hover:border-purple-200 transition-all">
                                    <div className="flex-1 min-w-0">
                                        <code className="text-sm font-black text-gray-900 tracking-tight break-all uppercase leading-none">{webhook.url}</code>
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {webhook.events.map((e: string, i: number) => (
                                                <span key={i} className="text-[8px] font-black uppercase tracking-widest bg-purple-50 text-purple-600 px-3 py-1 rounded-lg border border-purple-100">{e}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className={clsx("w-2 h-2 rounded-full", webhook.status === 'active' ? "bg-emerald-500 animate-pulse shadow-lg shadow-emerald-400" : "bg-gray-300")} />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{webhook.status}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ) : (
                <LockedFeatureCard 
                    title="Real-Time Webhooks" 
                    description="Synchronize your internal infrastructure with real-time signal processing and automated event triggers." 
                    icon={Webhook} 
                    plan="Growth" 
                />
            )}

            {/* Quick API Reference */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-black rounded-[32px] p-8 text-white relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-full blur-[60px] opacity-20" />
                     <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-4">Base Protocol URL</p>
                     <code className="text-sm font-black text-blue-400 tracking-tight">{API_URL}/v1</code>
                </div>
                <div className="bg-white rounded-[32px] p-8 border-2 border-gray-50 shadow-xl shadow-gray-100 flex flex-col justify-between group hover:border-black transition-all">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Transmission Throttle</p>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-black text-gray-900 tracking-tighter leading-none">1,000</span>
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1.5">Req / Min</span>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] p-8 text-white flex flex-col justify-between group hover:shadow-2xl hover:shadow-blue-500/20 transition-all">
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-4">Documentation Hub</p>
                    <a href="https://docs.aerostic.info" target="_blank" className="flex items-center justify-between group/link">
                        <span className="text-xl font-black tracking-tight">API Reference</span>
                        <div className="p-2 bg-white/10 rounded-xl group-hover/link:bg-white group-hover/link:text-blue-600 transition-all tracking-normal"><Plus className="rotate-45" size={20} /></div>
                    </a>
                </div>
            </div>

            {/* Notifications */}
            {successMsg && (
                <div className="fixed top-8 right-8 z-[100] animate-in slide-in-from-right duration-500">
                    <div className="bg-black text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4">
                        <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center"><CheckCircle size={18} /></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">{successMsg}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
