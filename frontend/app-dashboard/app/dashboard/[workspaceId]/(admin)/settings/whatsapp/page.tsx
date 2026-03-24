"use client";

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { useParams } from 'next/navigation';
import {
    Facebook, Settings, CheckCircle, XCircle, AlertCircle,
    Key, Globe, Shield, ArrowRight, Copy, Eye, EyeOff,
    Clock, Mail, Phone, Building2, Send, RefreshCw,
    Volume2, VolumeX, Zap, CreditCard, Smartphone, ShieldCheck
} from 'lucide-react';
import FacebookSDKLoader, { launchWhatsAppSignup } from '@/components/FacebookSDKLoader';
import AccountDetailsCard from '@/components/whatsapp/AccountDetailsCard';
import QualityRatingIndicator from '@/components/whatsapp/QualityRatingIndicator';
import MessagingLimitsCard from '@/components/whatsapp/MessagingLimitsCard';
import FeatureMatrixTable from '@/components/whatsapp/FeatureMatrixTable';
import PaymentSetupCard from '@/components/whatsapp/PaymentSetupCard';
import { clsx } from 'clsx';

const FALLBACK_APP_ID = '1507294274063502';
const FALLBACK_CONFIG_ID = '1704866660475462';

export default function WhatsappSettingsPage() {
    const [loading, setLoading] = useState(false);
    const [tenantId, setTenantId] = useState<string | null>(null);
    const [connectionMethod, setConnectionMethod] = useState<'facebook' | 'manual' | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'pending' | 'disconnected'>('disconnected');
    
    // Manual config fields
    const [phoneNumberId, setPhoneNumberId] = useState('');
    const [wabaId, setWabaId] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [showToken, setShowToken] = useState(false);
    const [requestSent, setRequestSent] = useState(false);
    const [requestStatus, setRequestStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);

    // Test Message State
    const [testNumber, setTestNumber] = useState('');
    const [sendingTest, setSendingTest] = useState(false);

    // Account Details State
    const [accountDetails, setAccountDetails] = useState<any>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);

    useEffect(() => {
        const saved = localStorage.getItem('sound_enabled');
        setSoundEnabled(saved !== 'false');
    }, []);

    const toggleSound = () => {
        const newState = !soundEnabled;
        setSoundEnabled(newState);
        localStorage.setItem('sound_enabled', newState.toString());
    };

    const [metaConfig, setMetaConfig] = useState<{ appId: string, configId: string, redirectUri: string } | null>(null);
    const params = useParams();

    useEffect(() => {
        const initSettings = async () => {
            const workspaceSlug = params.workspaceId as string;
            if (!workspaceSlug) return;

            if (workspaceSlug === 'billing' || workspaceSlug === 'settings') {
                window.location.href = '/dashboard';
                return;
            }

            try {
                const res = await api.get('/auth/workspaces');
                const memberships = res.data;
                const activeMembership = memberships.find((m: any) => m.tenant?.slug === workspaceSlug || m.tenant?.id === workspaceSlug);

                if (activeMembership && activeMembership.tenant?.id) {
                    const tId = activeMembership.tenant.id;
                    setTenantId(tId);

                    try {
                        const statusRes = await api.get(`/whatsapp/status?tenantId=${tId}`);
                        if (statusRes.data.connected) {
                            setConnectionStatus('connected');
                            fetchAccountDetails(tId);
                        } else if (statusRes.data.mode === 'manual' && statusRes.data.status === 'pending') {
                            setConnectionStatus('pending');
                        } else {
                            setConnectionStatus('disconnected');
                        }
                    } catch (err) {
                        setConnectionStatus('disconnected');
                    }

                    try {
                        const configRes = await api.get('/whatsapp/public-config');
                        setMetaConfig(configRes.data);
                    } catch (e) {
                        if (process.env.NEXT_PUBLIC_META_APP_ID) {
                            setMetaConfig({
                                appId: process.env.NEXT_PUBLIC_META_APP_ID || FALLBACK_APP_ID,
                                configId: process.env.NEXT_PUBLIC_META_CONFIG_ID || FALLBACK_CONFIG_ID,
                                redirectUri: process.env.NEXT_PUBLIC_META_REDIRECT_URI || 'https://app.aimstore.in/meta/callback'
                            });
                        }
                    }
                }
            } catch (e) {
                console.error('Failed to init settings', e);
            }
        };

        initSettings();
    }, [params.workspaceId]);

    const handleFacebookConnect = () => {
        if (!metaConfig?.appId || !metaConfig?.configId) {
            alert('Configuration is still loading. Please wait a moment.');
            return;
        }

        launchWhatsAppSignup(
            metaConfig.configId,
            tenantId || '',
            (code) => {
                // When we get the code, redirect to our callback page to finish the process
                const state = tenantId || '';
                window.location.href = `/meta/callback?code=${code}&state=${state}`;
            }
        );
    };

    const handleManualSubmit = async () => {
        if (!phoneNumberId || !wabaId || !accessToken) {
            alert('Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            await api.post('/whatsapp/config/request', {
                tenantId, phoneNumberId, wabaId, accessToken,
            });
            setRequestSent(true);
            setRequestStatus('pending');
        } catch (e) {
            alert('Failed to submit request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm('Are you sure you want to disconnect? Sending functionality will stop immediately.')) return;
        setLoading(true);
        try {
            await api.delete(`/whatsapp?tenantId=${tenantId}`);
            setConnectionStatus('disconnected');
            window.location.reload();
        } catch (e) {
            alert('Failed to disconnect');
            setLoading(false);
        }
    };

    const handleSendTest = async () => {
        if (!testNumber) return;
        setSendingTest(true);
        try {
            await api.post(`/whatsapp/send-test?tenantId=${tenantId}`, { to: testNumber });
            alert('Test message sent successfully!');
            setTestNumber('');
        } catch (e: any) {
            alert('Failed to send test message: ' + (e.response?.data?.message || e.message));
        } finally {
            setSendingTest(false);
        }
    };

    const fetchAccountDetails = async (tid: string) => {
        setLoadingDetails(true);
        try {
            const res = await api.get(`/whatsapp/account-details?tenantId=${tid}`);
            setAccountDetails(res.data);
        } catch (e) {
            console.error('Failed to fetch account details:', e);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleSyncAccount = async () => {
        if (!tenantId) return;
        setSyncing(true);
        try {
            await api.post(`/whatsapp/sync-account?tenantId=${tenantId}`);
            await fetchAccountDetails(tenantId);
            alert('Account synced successfully!');
        } catch (e: any) {
            alert('Failed to sync account: ' + (e.response?.data?.message || e.message));
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 animate-in fade-in duration-700">
            {metaConfig && <FacebookSDKLoader appId={metaConfig.appId} />}

            {/* Premium Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-6">
                <div>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight sm:text-5xl">WhatsApp <span className="text-blue-600 italic">Core</span></h2>
                    <p className="text-sm font-black text-gray-400 uppercase tracking-[0.3em] mt-3 ml-1">Enterprise API Infrastructure</p>
                </div>
                <div className="flex gap-4">
                     <button
                        onClick={toggleSound}
                        className={clsx(
                            "p-4 rounded-[20px] transition-all border-2 active:scale-95 group",
                            soundEnabled ? "bg-blue-50 text-blue-600 border-blue-100 shadow-lg shadow-blue-100/50" : "bg-gray-50 text-gray-400 border-transparent hover:border-gray-100"
                        )}
                        title="Alert Audio"
                    >
                        {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
                    </button>
                    <div className="p-4 bg-gray-50 rounded-[20px] text-gray-400 border-2 border-transparent">
                        <Settings size={24} />
                    </div>
                </div>
            </div>

            {/* Connection Health & Control Container */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="lg:col-span-2 bg-white rounded-[40px] border-2 border-gray-50 p-8 md:p-10 shadow-2xl shadow-gray-200/50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 opacity-50 group-hover:scale-110 transition-transform duration-700" />
                    
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-10">
                            <div className="flex items-center gap-6">
                                <div className={clsx(
                                    "w-20 h-20 rounded-[30px] flex items-center justify-center shadow-xl transition-all duration-500",
                                    connectionStatus === 'connected' ? "bg-emerald-500 text-white shadow-emerald-200 rotate-3" :
                                    connectionStatus === 'pending' ? "bg-amber-500 text-white shadow-amber-200 rotate-12" : "bg-red-500 text-white shadow-red-200"
                                )}>
                                    {connectionStatus === 'connected' ? <ShieldCheck size={40} strokeWidth={2.5} /> :
                                     connectionStatus === 'pending' ? <Clock size={40} strokeWidth={2.5} /> : <AlertCircle size={40} strokeWidth={2.5} />}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Operational Status</p>
                                    <h3 className="text-3xl font-black text-gray-900 tracking-tighter">
                                        {connectionStatus === 'connected' ? 'Secure Link Active' :
                                         connectionStatus === 'pending' ? 'Auth Verification' : 'Link Offline'}
                                    </h3>
                                    <div className={clsx(
                                        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                        connectionStatus === 'connected' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                        connectionStatus === 'pending' ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-red-50 text-red-600 border-red-100"
                                    )}>
                                        <div className={clsx("w-1.5 h-1.5 rounded-full animate-pulse", connectionStatus === 'connected' ? "bg-emerald-500" : connectionStatus === 'pending' ? "bg-amber-500" : "bg-red-500")} />
                                        {connectionStatus === 'connected' ? 'API 3.0 Operational' :
                                         connectionStatus === 'pending' ? 'Reviewing Handshake' : 'Needs Configuration'}
                                    </div>
                                </div>
                            </div>

                            {connectionStatus === 'connected' && (
                                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                                    <button onClick={handleSyncAccount} disabled={syncing} className="flex-1 px-8 py-4 bg-gray-50 text-gray-900 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-100 border-2 border-transparent transition-all active:scale-95 flex items-center justify-center gap-3">
                                        <RefreshCw size={16} className={clsx(syncing && "animate-spin")} /> {syncing ? 'Syncing Telemetry' : 'Sync Account'}
                                    </button>
                                    <button onClick={handleDisconnect} disabled={loading} className="px-8 py-4 bg-white text-red-500 font-black text-xs uppercase tracking-widest rounded-2xl border-2 border-red-50 hover:bg-red-50 transition-all active:scale-95">Disconnect</button>
                                </div>
                            )}
                        </div>

                        {connectionStatus === 'connected' && (
                            <div className="pt-10 border-t-2 border-gray-50 flex flex-col md:flex-row items-center gap-6">
                                <div className="flex-1 w-full text-center md:text-left">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Testing Protocol</p>
                                    <p className="text-sm font-bold text-gray-600">Transmit a secure handshake to verify API integrity.</p>
                                </div>
                                <div className="flex gap-2 w-full md:w-auto">
                                    <input type="tel" placeholder="91XXXXXXXXXX" value={testNumber} onChange={(e) => setTestNumber(e.target.value)} className="flex-1 md:w-64 px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 outline-none rounded-2xl font-black text-sm transition-all" />
                                    <button onClick={handleSendTest} disabled={sendingTest || !testNumber} className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 disabled:opacity-20 active:scale-90 transition-all"><Send size={24} /></button>
                                </div>
                            </div>
                        )}

                        {connectionStatus === 'pending' && (
                            <div className="p-8 bg-amber-50/50 border-2 border-amber-100 rounded-[30px] flex gap-6 items-center animate-pulse">
                                <div className="p-4 bg-white rounded-2xl text-amber-500 shadow-sm"><Clock size={32} /></div>
                                <div className="flex-1">
                                    <p className="font-black text-amber-900 uppercase tracking-tight">Handshake in Progress</p>
                                    <p className="text-xs font-bold text-amber-700 mt-1 opacity-70">Our system is currently validating your manual API credentials. This usually concludes within 120 minutes.</p>
                                </div>
                            </div>
                        )}
                        
                        {connectionStatus === 'disconnected' && !requestSent && (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <div className="w-24 h-24 bg-red-50 rounded-[30px] flex items-center justify-center text-red-500 mb-6"><XCircle size={48} /></div>
                                <h4 className="text-2xl font-black text-gray-900 tracking-tighter mb-2">No Active Integration</h4>
                                <p className="text-sm font-bold text-gray-400 max-w-sm">Seamlessly link your Meta Business Account to activate premium communication channels.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-gray-900 to-black rounded-[40px] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden group">
                     <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-600 rounded-full blur-[80px] opacity-20 -mb-20 -mr-20 group-hover:opacity-40 transition-opacity duration-700" />
                     <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Meta Ecosystem</p>
                            <h3 className="text-3xl font-black tracking-tighter leading-tight mb-4">Official <span className="text-blue-500">Cloud API</span> Integration</h3>
                            <p className="text-sm font-bold text-gray-500 leading-relaxed">Experience zero latency and maximum throughput with the native WhatsApp Cloud API 3.0 protocol.</p>
                        </div>
                        <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center text-blue-500"><Shield size={16} /></div>
                                <span className="text-xs font-black uppercase tracking-widest text-white/50">End-to-End Encrypted</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center text-blue-500"><RefreshCw size={16} /></div>
                                <span className="text-xs font-black uppercase tracking-widest text-white/50">Auto-Renewing Tokens</span>
                            </div>
                        </div>
                     </div>
                </div>
            </div>

            {/* Connection Selection Flow */}
            {connectionStatus === 'disconnected' && !requestSent && (
                <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                    <div className="text-center mb-4">
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Onboarding Protocol</h3>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.3em] mt-2">Select your preferred integration method</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            {
                                id: 'facebook',
                                name: 'Meta Embedded',
                                icon: Facebook,
                                color: 'bg-[#1877F2]',
                                desc: 'Instant verification via Meta Secure Handshake.',
                                tags: ['Recommended', 'Instant'],
                                iconColor: 'text-white'
                            },
                            {
                                id: 'manual',
                                name: 'Manual Payload',
                                icon: Key,
                                color: 'bg-indigo-600',
                                desc: 'Direct credential injection for advanced scale.',
                                tags: ['Legacy', 'Review Required'],
                                iconColor: 'text-white'
                            }
                        ].map((method) => (
                            <button
                                key={method.id}
                                onClick={() => setConnectionMethod(method.id as any)}
                                className={clsx(
                                    "p-1 rounded-[40px] transition-all relative group h-full",
                                    connectionMethod === method.id ? "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-2xl shadow-blue-500/20" : "bg-transparent hover:bg-gray-100"
                                )}
                            >
                                <div className="bg-white rounded-[39px] p-8 h-full flex flex-col">
                                    <div className="flex items-start justify-between mb-8">
                                        <div className={clsx("w-16 h-16 rounded-[24px] flex items-center justify-center shadow-lg transition-transform group-hover:scale-110", method.color, method.iconColor)}>
                                            <method.icon size={32} />
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5">
                                            {method.tags.map(t => <span key={t} className={clsx("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border", t === 'Recommended' ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-gray-50 text-gray-400 border-gray-100")}>{t}</span>)}
                                        </div>
                                    </div>
                                    <div className="text-left flex-1 h-full mb-8">
                                        <h4 className="text-2xl font-black text-gray-900 tracking-tighter mb-2">{method.name}</h4>
                                        <p className="text-sm font-bold text-gray-400 leading-relaxed">{method.desc}</p>
                                    </div>
                                    <div className={clsx(
                                        "w-full py-4 rounded-[20px] font-black text-xs uppercase tracking-[0.2em] transition-all text-center",
                                        connectionMethod === method.id ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20" : "bg-gray-50 text-gray-400"
                                    )}>
                                        {connectionMethod === method.id ? 'Selected' : 'Select Method'}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Integrated Login Box */}
                    {connectionMethod === 'facebook' && (
                        <div className="bg-white rounded-[40px] border-2 border-blue-500/20 p-8 sm:p-12 shadow-2xl shadow-blue-500/5 relative overflow-hidden animate-in zoom-in-95">
                            <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
                                <div className="text-center lg:text-left flex-1">
                                    <h3 className="text-3xl font-black text-gray-900 tracking-tight sm:text-4xl mb-6 leading-tight">Authorize Meta <span className="text-blue-600 underline decoration-blue-100 underline-offset-8">Cloud Service</span></h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
                                        {[
                                            { icon: ShieldCheck, title: 'Secure Handshake', desc: 'Bank-grade OAuth 2.0 flow' },
                                            { icon: RefreshCw, title: 'Session Persistence', desc: 'Tokens auto-refresh monthly' }
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex gap-4">
                                                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0"><item.icon size={20} /></div>
                                                <div>
                                                    <p className="font-black text-gray-900 text-sm tracking-tight">{item.title}</p>
                                                    <p className="text-xs font-bold text-gray-400 mt-1">{item.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={handleFacebookConnect}
                                    disabled={!tenantId || loading}
                                    className="w-full lg:w-auto px-12 py-6 bg-[#1877F2] text-white font-black rounded-3xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 active:scale-95 flex items-center justify-center gap-4 text-lg"
                                >
                                    <Facebook size={24} fill="currentColor" />
                                    <span>Connect Meta Account</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Integrated Manual Form */}
                    {connectionMethod === 'manual' && (
                        <div className="bg-white rounded-[40px] border-2 border-indigo-500/20 p-8 sm:p-12 shadow-2xl shadow-indigo-500/5 animate-in zoom-in-95">
                             <div className="mb-10 text-center sm:text-left">
                                <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">Credential Injection</h3>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-2 opacity-60">High-throughput manual configuration</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number ID</label>
                                    <div className="relative">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400"><Smartphone size={20} /></div>
                                        <input type="text" value={phoneNumberId} onChange={(e) => setPhoneNumberId(e.target.value)} placeholder="10000XXXXXXXXX" className="w-full pl-16 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-3xl font-black text-sm outline-none transition-all" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">WABA Account ID</label>
                                    <div className="relative">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400"><Building2 size={20} /></div>
                                        <input type="text" value={wabaId} onChange={(e) => setWabaId(e.target.value)} placeholder="00000XXXXXXXXX" className="w-full pl-16 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-3xl font-black text-sm outline-none transition-all" />
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Enterprise Access Token</label>
                                    <div className="relative">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400"><Key size={20} /></div>
                                        <input type={showToken ? 'text' : 'password'} value={accessToken} onChange={(e) => setAccessToken(e.target.value)} placeholder="EAAWXXXXXXXXXXXX..." className="w-full pl-16 pr-20 py-5 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-3xl font-black text-sm outline-none transition-all font-mono tracking-tighter" />
                                        <button onClick={() => setShowToken(!showToken)} className="absolute right-6 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400">{showToken ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                                    </div>
                                </div>
                            </div>

                            <button onClick={handleManualSubmit} disabled={loading || !phoneNumberId || !wabaId || !accessToken} className="w-full py-6 bg-indigo-600 text-white font-black text-xl rounded-[28px] hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 disabled:opacity-20 active:scale-95 flex items-center justify-center gap-4">
                                <Send size={24} /> Submit Auth Payload
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Account Insight Engine - Only show when connected */}
            {connectionStatus === 'connected' && accountDetails && (
                <div className="space-y-8 animate-in slide-in-from-bottom-12 duration-1000">
                    <div className="flex items-center gap-6 mb-4">
                        <div className="h-1 bg-gray-100 flex-1 rounded-full" />
                        <h3 className="text-xs font-black text-gray-300 uppercase tracking-[0.5em] shrink-0">Telemetry Data</h3>
                        <div className="h-1 bg-gray-100 flex-1 rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        <AccountDetailsCard
                            businessId={accountDetails.businessId}
                            wabaId={accountDetails.wabaId}
                            phoneNumberId={accountDetails.phoneNumberId}
                            displayPhoneNumber={accountDetails.displayPhoneNumber}
                            verifiedName={accountDetails.verifiedName}
                        />
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-8">
                                <QualityRatingIndicator rating={accountDetails.qualityRating} />
                                <MessagingLimitsCard
                                    messagingLimit={accountDetails.messagingLimit}
                                    messageCount={accountDetails.messageCount}
                                />
                            </div>
                            <PaymentSetupCard />
                        </div>
                    </div>

                    <FeatureMatrixTable />
                </div>
            )}

            {/* Submitted State */}
             {requestSent && (
                <div className="bg-white rounded-[40px] border-2 border-emerald-500/20 p-12 text-center shadow-2xl shadow-emerald-500/5 animate-in zoom-in-95">
                    <div className="w-24 h-24 bg-emerald-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 text-emerald-500 shadow-xl shadow-emerald-100"><CheckCircle size={48} /></div>
                    <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-4 uppercase">Transmission Success</h3>
                    <p className="text-lg font-bold text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">Your enterprise credentials have been queued for manual verification. Our engineers will finalize the connection within the next 2 cycles.</p>
                    <div className="inline-flex items-center gap-3 px-8 py-4 bg-amber-50 text-amber-700 rounded-3xl font-black text-xs uppercase tracking-[0.2em] border border-amber-100 animate-pulse">
                        <Clock size={16} /> Verification Pipeline Active
                    </div>
                </div>
            )}

            {/* Premium Support Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 pt-16 border-t-2 border-gray-50">
                {[
                    { label: 'Cloud Architecture', desc: 'System level API docs', icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Security Protocols', desc: 'Auth token encryption', icon: Key, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Human Support', desc: 'Direct engineer access', icon: Mail, color: 'text-emerald-600', bg: 'bg-emerald-50' }
                ].map((item, idx) => (
                    <div key={idx} className="p-8 bg-white border-2 border-gray-50 rounded-[32px] hover:border-blue-500 transition-all group shadow-sm hover:shadow-xl hover:shadow-gray-200/50 cursor-pointer">
                        <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110", item.bg, item.color)}><item.icon size={28} /></div>
                        <h4 className="font-black text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight text-sm mb-2">{item.label}</h4>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
