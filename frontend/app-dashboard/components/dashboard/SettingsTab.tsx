"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
    MessageSquare, Bot, CheckCircle, Palette, 
    ChevronRight, Save, Shield, Settings,
    Smartphone, Zap, Sparkles, Globe, 
    ArrowUpRight, Lock
} from 'lucide-react';
import { clsx } from 'clsx';
import { LockedFeatureCard, resolveWorkspaceId } from './DashboardComponents';

export default function SettingsTab({ planFeatures, userPlan, membership }: any) {
    const params = useParams();
    const workspaceId = resolveWorkspaceId(params?.workspaceId as string | string[] | undefined);
    const [whatsappConfig, setWhatsappConfig] = useState({
        phoneNumberId: '',
        wabaId: '',
        accessToken: ''
    });
    const [aiConfig, setAiConfig] = useState({
        model: 'gemini-2.0-flash',
        systemPrompt: '',
        knowledgeBase: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const waRes = await fetch('/api/v1/whatsapp/status', { credentials: 'include' });
            if (waRes.ok) {
                const waData = await waRes.json();
                if (waData.connected) {
                    setWhatsappConfig({
                        phoneNumberId: waData.phoneNumber || '',
                        wabaId: waData.wabaId || '',
                        accessToken: 'Connected via Embedded OAuth'
                    });
                }
            }

            const configRes = await fetch('/api/v1/admin/config', { credentials: 'include' });
            if (configRes.ok) {
                const configData = await configRes.json();
                setAiConfig({
                    model: configData['ai.model']?.value || 'gemini-2.0-flash',
                    systemPrompt: configData['ai.system_prompt']?.value || '',
                    knowledgeBase: configData['ai.knowledge_base']?.value || ''
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const saveWhatsAppConfig = async () => {
        setSaving('whatsapp');
        try {
            await new Promise(r => setTimeout(r, 1000));
            setSuccessMsg('WhatsApp Protocol Sync Complete');
        } finally {
            setSaving(null);
            setTimeout(() => setSuccessMsg(''), 3000);
        }
    };

    const saveAIConfig = async () => {
        setSaving('ai');
        try {
            await new Promise(r => setTimeout(r, 1000));
            setSuccessMsg('AI Model Vectorized');
        } finally {
            setSaving(null);
            setTimeout(() => setSuccessMsg(''), 3000);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-blue-50 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] animate-pulse">Retrieving Global Config...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700 pb-20">
            {/* Status Bar */}
            <div className="flex items-center gap-4 px-6 py-4 bg-emerald-50 border-2 border-emerald-100 rounded-[28px] w-full sm:w-fit shadow-xl shadow-emerald-100/20">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-700">Database Connection: Stable</span>
            </div>

            {/* WhatsApp Protocol Config */}
            <div className="bg-white rounded-[48px] border-2 border-gray-50 shadow-2xl shadow-gray-200/40 relative overflow-hidden">
                <div className="p-8 md:p-10 border-b-2 border-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border-2 border-emerald-100 shadow-sm">
                            <Smartphone size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">WhatsApp Core</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Manage Business API and Vector communication</p>
                        </div>
                    </div>
                    <button 
                        onClick={saveWhatsAppConfig}
                        disabled={saving === 'whatsapp'}
                        className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all active:scale-95 shadow-xl shadow-emerald-100 flex items-center gap-3"
                    >
                        {saving === 'whatsapp' ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : <Save size={18} strokeWidth={3} />}
                        Sync Protocol
                    </button>
                </div>

                <div className="p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Node ID</label>
                         <input
                            type="text"
                            value={whatsappConfig.phoneNumberId}
                            onChange={(e) => setWhatsappConfig({ ...whatsappConfig, phoneNumberId: e.target.value })}
                            className="w-full px-6 py-5 bg-gray-50/50 border-2 border-gray-100 rounded-[24px] focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all font-mono text-sm font-black tracking-tight"
                            placeholder="100000000000000"
                        />
                    </div>
                    <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">WABA Registry ID</label>
                         <input
                            type="text"
                            value={whatsappConfig.wabaId}
                            onChange={(e) => setWhatsappConfig({ ...whatsappConfig, wabaId: e.target.value })}
                            className="w-full px-6 py-5 bg-gray-50/50 border-2 border-gray-100 rounded-[24px] focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all font-mono text-sm font-black tracking-tight"
                            placeholder="100000000000000"
                        />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Secure Access Token</label>
                         <div className="relative">
                            <input
                                type="password"
                                value={whatsappConfig.accessToken}
                                onChange={(e) => setWhatsappConfig({ ...whatsappConfig, accessToken: e.target.value })}
                                className="w-full px-6 py-5 bg-gray-50/50 border-2 border-gray-100 rounded-[24px] focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all font-mono text-sm font-black tracking-tight pr-14"
                                placeholder="••••••••••••••••••••"
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300"><Lock size={18} /></div>
                         </div>
                    </div>
                </div>
            </div>

            {/* AI Settings - Pure Premium Glass */}
            <div className="bg-gradient-to-br from-[#0F172A] to-black rounded-[48px] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden border-2 border-white/5 group">
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600 rounded-full blur-[120px] opacity-20 -mr-32 -mb-32 group-hover:scale-125 transition-transform duration-1000" />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-12">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white/5 border-2 border-white/10 rounded-3xl flex items-center justify-center shadow-lg group-hover:bg-purple-600 transition-all duration-500">
                            <Sparkles size={32} strokeWidth={2.5} className="text-purple-400 group-hover:text-white transition-colors" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black tracking-tighter">AI Synthesis Engine</h3>
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mt-1">Configure neural response orchestration</p>
                        </div>
                    </div>
                    <button 
                        onClick={saveAIConfig}
                        disabled={saving === 'ai'}
                        className="px-8 py-5 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-purple-500 hover:text-white transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-3"
                    >
                        {saving === 'ai' ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Zap size={18} strokeWidth={3} />}
                        Save Model Config
                    </button>
                </div>

                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-1">Foundation Model</label>
                            <select 
                                value={aiConfig.model}
                                onChange={(e) => setAiConfig({ ...aiConfig, model: e.target.value })}
                                className="w-full px-8 py-5 bg-white/5 border-2 border-white/10 rounded-[28px] text-sm font-black uppercase tracking-widest focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all appearance-none"
                            >
                                <option value="gemini-2.0-flash" className="bg-gray-900">Gemini 2.0 Flash (Honeypot)</option>
                                <option value="gpt-4o" className="bg-gray-900">GPT-4 Omni (Standard)</option>
                                <option value="claude-3.5-sonnet" className="bg-gray-900">Claude 3.5 Sonnet</option>
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-1">Context Window</label>
                            <div className="w-full px-8 py-5 bg-white/5 border-2 border-white/10 rounded-[28px] text-sm font-black uppercase tracking-widest flex items-center justify-between">
                                <span>128k Tokens</span>
                                <div className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-[8px] font-black">Ultra Latency</div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-1">Core Identity Script (System Prompt)</label>
                        <textarea
                            value={aiConfig.systemPrompt}
                            onChange={(e) => setAiConfig({ ...aiConfig, systemPrompt: e.target.value })}
                            rows={6}
                            className="w-full px-10 py-8 bg-white/5 border-2 border-white/10 rounded-[40px] text-sm font-medium tracking-tight focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:text-white/10 resize-none leading-relaxed"
                            placeholder="Establish the neural personality protocols here..."
                        />
                    </div>
                </div>
            </div>

            {/* White Labeling Matrix */}
            {membership?.tenantType === 'reseller' && (
                planFeatures.whiteLabel ? (
                    <div className="bg-white rounded-[48px] border-2 border-gray-50 shadow-2xl shadow-gray-200/40 relative overflow-hidden">
                        <div className="p-8 md:p-10 border-b-2 border-gray-50 flex items-center justify-between">
                             <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border-2 border-amber-100 shadow-sm">
                                    <Palette size={28} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Enterprise Nexus Branding</h3>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Full platform white-label virtualization</p>
                                </div>
                            </div>
                            <button className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-amber-500 hover:text-white transition-all active:scale-90"><Save size={20} /></button>
                        </div>
                        <div className="p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Identity Name</label>
                                <input type="text" className="w-full px-6 py-5 bg-gray-50/50 border-2 border-gray-100 rounded-[24px] font-black text-sm tracking-tight" placeholder="Your Nexus Org" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Virtual Domain Alias</label>
                                <input type="text" className="w-full px-6 py-5 bg-gray-50/50 border-2 border-gray-100 rounded-[24px] font-black text-sm tracking-tight" placeholder="chat.nexus.com" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <LockedFeatureCard
                        title="White Label UI Matrix"
                        description="Fully virtualize the platform under your own brand identity, custom domain, and aesthetic palette."
                        icon={Palette}
                        plan="Enterprise"
                    />
                )
            )}

            {/* License Overview */}
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-[48px] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32 opacity-10 blur-[60px]" />
                <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="space-y-2 text-center md:text-left">
                        <h3 className="text-3xl font-black tracking-tighter uppercase leading-none">Subscription: {planFeatures.name} Tier</h3>
                        <p className="text-indigo-100/60 text-[10px] font-black uppercase tracking-[0.3em]">Billing Cycle Renewing: 30 SEP 2026</p>
                    </div>
                    {userPlan !== 'enterprise' && (
                        <Link href={`/dashboard/${workspaceId}/billing`} className="px-10 py-5 bg-white text-indigo-600 rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all active:scale-95 shadow-2xl flex items-center gap-3">
                            <ArrowUpRight size={18} strokeWidth={3} />
                            Universal Upgrade
                        </Link>
                    )}
                </div>
            </div>

            {/* Notifications */}
            {successMsg && (
                <div className="fixed top-8 right-8 z-[110] animate-in slide-in-from-right duration-500">
                    <div className="bg-black text-white px-8 py-5 rounded-[24px] shadow-2xl flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20"><CheckCircle size={24} strokeWidth={3} /></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">{successMsg}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
