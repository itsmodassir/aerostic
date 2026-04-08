"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    MessageSquare, Bot, CheckCircle, Palette, 
    ChevronRight, Save, Shield, Settings,
    Smartphone, Zap, Sparkles, Globe, 
    ArrowUpRight, Lock
} from 'lucide-react';
import { clsx } from 'clsx';
import { LockedFeatureCard } from './DashboardComponents';

import api from '@/lib/api';

export default function SettingsTab({ planFeatures, userPlan, membership }: any) {
    const isSuperAdmin = membership?.user?.role === 'admin' || membership?.role === 'owner'; // Simple heuristic for now
    
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
            // 1. Fetch WhatsApp Status (Tenant Level)
            const waRes = await api.get('/whatsapp/status');
            if (waRes.status === 200) {
                const waData = waRes.data;
                if (waData.connected) {
                    setWhatsappConfig({
                        phoneNumberId: waData.phoneNumberId || '',
                        wabaId: waData.wabaId || '',
                        accessToken: 'Connected via Meta'
                    });
                }
            }

            // 2. Fetch AI / System Config (Falls back to Tenant Level if available)
            const configRes = await api.get('/admin/config');
            if (configRes.status === 200) {
                const data = configRes.data;
                setAiConfig({
                    model: data['ai.model']?.value || 'gemini-2.0-flash',
                    systemPrompt: data['ai.system_prompt']?.value || '',
                    knowledgeBase: data['ai.knowledge_base']?.value || ''
                });
            }
        } catch (error) {
            console.error('Failed to fetch config', error);
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async (category: string, updates: any) => {
        setSaving(category);
        try {
            const res = await api.post('/admin/system/config', updates);
            if (res.status === 201 || res.status === 200) {
                setSuccessMsg(`${category.toUpperCase()} Protocols Synced`);
            }
        } catch (err) {
            console.error('Save failed', err);
        } finally {
            setSaving(null);
            setTimeout(() => setSuccessMsg(''), 3000);
        }
    };

    const handleConnectWhatsApp = async () => {
        try {
            const res = await api.get('/whatsapp/embedded/url');
            if (res.data?.url) {
                const width = 600;
                const height = 700;
                const left = window.screen.width / 2 - width / 2;
                const top = window.screen.height / 2 - height / 2;
                window.open(res.data.url, 'MetaSignup', `width=${width},height=${height},top=${top},left=${left}`);
                setSuccessMsg('Initializing Meta Secure Gateway...');
            }
        } catch (error) {
            console.error('Failed to get signup URL', error);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-32 gap-6">
                <div className="w-16 h-16 border-[6px] border-blue-50 border-t-blue-600 rounded-full animate-spin shadow-xl shadow-blue-100" />
                <div className="text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] animate-pulse">Syncing Neural Core</p>
                    <p className="text-[8px] text-gray-300 font-bold mt-2 uppercase tracking-widest">Awaiting Database Acknowledgment</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-32">
            
            {/* 1. Global Presence Notification */}
            <div className="group relative">
                <div className="absolute inset-0 bg-blue-600 blur-[80px] opacity-10 -z-10 group-hover:opacity-20 transition-opacity" />
                <div className="flex flex-col sm:flex-row items-center gap-6 px-8 py-6 bg-white/50 backdrop-blur-xl border border-white rounded-[32px] shadow-2xl shadow-gray-200/50">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 animate-pulse">
                        <Zap size={22} strokeWidth={3} />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">Active Infrastructure</h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Status: Operational • Region: Mumbai-1 • Latency: 14ms</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 shadow-sm">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Verified Stable</span>
                    </div>
                </div>
            </div>

            {/* 2. WhatsApp Configuration Section */}
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl shadow-gray-200/40 overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-[100px] opacity-40 -mr-32 -mt-32 pointer-events-none" />
                
                <div className="p-10 md:p-12 border-b border-gray-50 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[24px] flex items-center justify-center border border-emerald-100 shadow-lg group-hover:rotate-6 transition-transform">
                            <Smartphone size={32} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tighter">Meta WhatsApp Nexus</h3>
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Configure Business API Protocols</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <button 
                            onClick={handleConnectWhatsApp}
                            className="px-10 py-5 bg-black text-white rounded-[22px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all active:scale-95 shadow-xl flex items-center gap-3 group"
                        >
                            <Globe size={18} strokeWidth={3} className="group-hover:rotate-45 transition-transform" />
                            Launch Meta OAuth
                        </button>
                        <button 
                            onClick={() => saveSettings('whatsapp', { 'whatsapp.phoneNumberId': whatsappConfig.phoneNumberId, 'whatsapp.wabaId': whatsappConfig.wabaId })}
                            disabled={saving === 'whatsapp'}
                            className="px-10 py-5 bg-emerald-600 text-white rounded-[22px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all active:scale-95 shadow-xl shadow-emerald-100 flex items-center gap-3"
                        >
                            {saving === 'whatsapp' ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={18} strokeWidth={3} />}
                            Sync Phone Node
                        </button>
                    </div>
                </div>

                <div className="p-10 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-10 bg-gray-50/30">
                    <div className="space-y-3">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Phone Identifier</label>
                         <input
                            type="text"
                            value={whatsappConfig.phoneNumberId}
                            onChange={(e) => setWhatsappConfig({ ...whatsappConfig, phoneNumberId: e.target.value })}
                            className="w-full px-8 py-6 bg-white border border-gray-100 rounded-[28px] focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all font-mono text-sm font-black tracking-tight shadow-sm"
                            placeholder="e.g. 1092837465019"
                        />
                    </div>
                    <div className="space-y-3">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">WABA Registry ID</label>
                         <input
                            type="text"
                            value={whatsappConfig.wabaId}
                            onChange={(e) => setWhatsappConfig({ ...whatsappConfig, wabaId: e.target.value })}
                            className="w-full px-8 py-6 bg-white border border-gray-100 rounded-[28px] focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all font-mono text-sm font-black tracking-tight shadow-sm"
                            placeholder="e.g. WABA_0192837465"
                        />
                    </div>
                </div>
            </div>

            {/* 3. AI Autonomy Model Section */}
            <div className="bg-gradient-to-br from-[#020617] to-[#0f172a] rounded-[48px] p-10 md:p-16 text-white shadow-3xl relative overflow-hidden group border border-white/5">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[150px] opacity-10 -mr-64 -mt-64 group-hover:opacity-20 transition-opacity" />
                
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-12 mb-16 relative z-10">
                    <div className="flex items-center gap-8">
                        <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-[32px] flex items-center justify-center shadow-inner group-hover:shadow-blue-500/20 group-hover:border-blue-500/50 transition-all duration-700">
                            <Sparkles size={40} strokeWidth={2} className="text-blue-400 group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black tracking-tighter">Neural Identity Engine</h3>
                            <p className="text-[12px] font-black text-white/30 uppercase tracking-[0.4em] mt-2">Scale AI Response Logic</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => saveSettings('ai', { 'ai.system_prompt': aiConfig.systemPrompt, 'ai.model': aiConfig.model })}
                        disabled={saving === 'ai'}
                        className="px-12 py-6 bg-blue-600 text-white rounded-[28px] font-black text-[12px] uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all active:scale-95 shadow-2xl shadow-blue-900/50 flex items-center justify-center gap-4"
                    >
                        {saving === 'ai' ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Zap size={20} strokeWidth={3} />}
                        Engage Model Config
                    </button>
                </div>

                <div className="space-y-12 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em] ml-2 font-mono">Foundational Cortex</label>
                            <div className="relative group/select">
                                <select 
                                    value={aiConfig.model}
                                    onChange={(e) => setAiConfig({ ...aiConfig, model: e.target.value })}
                                    className="w-full px-10 py-6 bg-white/5 border border-white/10 rounded-[32px] text-[13px] font-black uppercase tracking-widest focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                                    <option value="gpt-4o">GPT-4 Omni</option>
                                    <option value="claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                                </select>
                                <ChevronRight className="absolute right-10 top-1/2 -translate-y-1/2 text-white/20 group-hover/select:text-white transition-colors rotate-90" size={18} />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em] ml-2 font-mono">Real-time Inference</label>
                            <div className="w-full px-10 py-6 bg-white/5 border border-white/10 rounded-[32px] flex items-center justify-between border-dashed">
                                <span className="text-[13px] font-black tracking-widest text-blue-400">STABLE CLOUDSIDE</span>
                                <div className="px-4 py-1.5 bg-blue-500/10 text-blue-400 rounded-xl text-[9px] font-black border border-blue-500/20">LOW LATENCY</div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div className="flex items-center justify-between ml-2">
                            <label className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em] font-mono">Neural Behavioral Prompt</label>
                            <span className="text-[9px] font-black text-blue-500/50 uppercase tracking-widest">RAG Optimized</span>
                        </div>
                        <textarea
                            value={aiConfig.systemPrompt}
                            onChange={(e) => setAiConfig({ ...aiConfig, systemPrompt: e.target.value })}
                            rows={8}
                            className="w-full px-12 py-10 bg-white/5 border border-white/10 rounded-[40px] text-sm font-medium tracking-tight focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-white/10 resize-none leading-relaxed shadow-inner"
                            placeholder="Establish the neural behavioral protocols for this workspace..."
                        />
                    </div>
                </div>
            </div>

            {/* 4. Branding Virtualization Matrix (Only for Resellers) */}
            {membership?.tenantType === 'reseller' && planFeatures.whiteLabel && (
                <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl p-10 md:p-12">
                     <div className="flex items-center gap-6 mb-10">
                        <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center border border-purple-100 shadow-sm">
                            <Palette size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Identity Virtualization</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Platform White-label Configuration</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                         <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Brand Name</label>
                            <input type="text" className="w-full px-8 py-6 bg-gray-50 border border-gray-100 rounded-[28px] font-black text-sm" placeholder="Your Virtual Org" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Custom Alias Domain</label>
                            <input type="text" className="w-full px-8 py-6 bg-gray-50 border border-gray-100 rounded-[28px] font-black text-sm" placeholder="chat.yourdomain.com" />
                        </div>
                    </div>
                </div>
            )}

            {/* Success Toast */}
            {successMsg && (
                <div className="fixed top-12 right-12 z-[100] animate-in slide-in-from-right-20 duration-500">
                    <div className="bg-black text-white px-10 py-6 rounded-[28px] shadow-3xl flex items-center gap-6 border border-white/10 backdrop-blur-3xl">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 font-black">
                            <CheckCircle size={24} strokeWidth={3} />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-[11px] font-black uppercase tracking-[0.3em] leading-none mb-1">Acknowledgment</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{successMsg}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
