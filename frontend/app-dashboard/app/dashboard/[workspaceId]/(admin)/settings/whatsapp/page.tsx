"use client";

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { useParams } from 'next/navigation';
import {
    Facebook, Settings, CheckCircle, XCircle, AlertCircle,
    Key, Globe, Shield, ArrowRight, Copy, Eye, EyeOff,
    Clock, Mail, Phone, Building2, Send, RefreshCw,
    Volume2, VolumeX, Zap, CreditCard, Smartphone, ShieldCheck, Workflow
} from 'lucide-react';
import AccountDetailsCard from '@/components/whatsapp/AccountDetailsCard';
import QualityRatingIndicator from '@/components/whatsapp/QualityRatingIndicator';
import MessagingLimitsCard from '@/components/whatsapp/MessagingLimitsCard';
import FeatureMatrixTable from '@/components/whatsapp/FeatureMatrixTable';
import PaymentSetupCard from '@/components/whatsapp/PaymentSetupCard';
import { clsx } from 'clsx';

export default function WhatsappSettingsPage() {
    const [loading, setLoading] = useState(false);
    const [tenantId, setTenantId] = useState<string | null>(null);
    const [connectionMethod, setConnectionMethod] = useState<'coexistence' | 'cloud' | 'manual' | null>(null);
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
    const [smbSyncing, setSmbSyncing] = useState(false);
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

                }
            } catch (e) {
                console.error('Failed to init settings', e);
            }
        };

        initSettings();
    }, [params.workspaceId]);

    const handleEmbeddedConnect = async (mode: 'coexistence' | 'cloud') => {
        if (!tenantId) {
            alert('Workspace context is missing. Please refresh and try again.');
            return;
        }
        setLoading(true);
        try {
            const res = await api.get(`/whatsapp/embedded/url?mode=${mode}`);
            const signupUrl = res.data?.url;
            if (!signupUrl) {
                throw new Error('Missing Meta signup URL');
            }
            window.location.href = signupUrl;
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to start Meta signup flow.');
            setLoading(false);
        }
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

    const handleSmbSync = async () => {
        if (!tenantId) return;
        setSmbSyncing(true);
        try {
            await api.post(`/whatsapp/smb-sync?tenantId=${tenantId}`);
            alert('App data synchronization initiated! Changes will appear shortly.');
        } catch (e: any) {
            alert('Failed to initiate sync: ' + (e.response?.data?.message || e.message));
        } finally {
            setSmbSyncing(false);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        WhatsApp Integration
                        {connectionStatus === 'connected' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                API 3.0 Active
                            </span>
                        )}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage your official Meta Cloud API connection and webhooks.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <button
                        onClick={toggleSound}
                        className={clsx(
                            "flex-1 sm:flex-none p-2.5 rounded-xl border transition-colors flex items-center justify-center",
                            soundEnabled ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-white text-gray-400 border-gray-200 hover:bg-gray-50"
                        )}
                        title="Alert Audio"
                    >
                        {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                    </button>
                    <Link href="/settings/whatsapp/trigger-flow" className="flex-1 sm:flex-none px-4 py-2 bg-white text-gray-700 border border-gray-200 font-bold text-[10px] sm:text-sm rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm">
                        <Workflow size={14} className="text-gray-400" /> Trigger
                    </Link>
                    <Link href="/settings/whatsapp/forms" className="flex-1 sm:flex-none px-4 py-2 bg-white text-gray-700 border border-gray-200 font-bold text-[10px] sm:text-sm rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm">
                        <Workflow size={14} className="text-gray-400" /> Forms
                    </Link>
                </div>
            </div>

            {/* Connection Overview Banner */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Status Card */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-2xl -mr-10 -mt-10" />
                    
                    <div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className={clsx(
                                "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm",
                                connectionStatus === 'connected' ? "bg-emerald-50 text-emerald-600" :
                                connectionStatus === 'pending' ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
                            )}>
                                {connectionStatus === 'connected' ? <ShieldCheck size={24} /> :
                                 connectionStatus === 'pending' ? <Clock size={24} /> : <AlertCircle size={24} />}
                            </div>
                            <div>
                                <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                                    {connectionStatus === 'connected' ? 'Secure Link Active' :
                                     connectionStatus === 'pending' ? 'Auth Verification Pending' : 'Link Offline'}
                                </h3>
                                <p className="text-[10px] sm:text-sm text-gray-500">
                                    {connectionStatus === 'connected' ? 'Meta Cloud API is fully operational and receiving webhooks.' :
                                     connectionStatus === 'pending' ? 'Reviewing manual handshake credentials.' : 'Integration is currently inactive.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100">
                        {connectionStatus === 'connected' ? (
                            <>
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <div className="relative flex-1 sm:w-64">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Send size={14} className="text-gray-400" />
                                        </div>
                                        <input 
                                            type="tel" 
                                            placeholder="Test Number (e.g., 91999...)" 
                                            value={testNumber} 
                                            onChange={(e) => setTestNumber(e.target.value)} 
                                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 outline-none rounded-lg text-sm transition-all shadow-sm"
                                        />
                                    </div>
                                    <button 
                                        onClick={handleSendTest} 
                                        disabled={sendingTest || !testNumber} 
                                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-sm disabled:opacity-50 transition-colors shrink-0"
                                    >
                                        Test
                                    </button>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                                    <button onClick={handleSyncAccount} disabled={syncing} title="Update Profile Details" className="flex-1 sm:flex-none px-4 py-2 bg-white text-gray-700 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm">
                                        <RefreshCw size={14} className={clsx(syncing && "animate-spin")} /> Profile
                                    </button>
                                    <button onClick={handleSmbSync} disabled={smbSyncing} title="Sync Contacts & History from App" className="flex-1 sm:flex-none px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 text-sm font-medium rounded-lg hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 shadow-sm">
                                        <Smartphone size={14} className={clsx(smbSyncing && "animate-pulse")} /> App Data
                                    </button>
                                    <button onClick={handleDisconnect} disabled={loading} className="flex-1 sm:flex-none px-4 py-2 bg-red-50 text-red-600 border border-red-100 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors shadow-sm">
                                        Disconnect
                                    </button>
                                </div>
                            </>
                        ) : connectionStatus === 'pending' ? (
                            <div className="w-full bg-amber-50/50 p-3 rounded-lg border border-amber-100 flex items-center gap-3">
                                <Clock size={16} className="text-amber-500 animate-pulse" />
                                <span className="text-sm font-medium text-amber-800">Validation takes up to 120 minutes. Please check back later.</span>
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-gray-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between">
                     <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-[50px] opacity-20 -mb-10 -mr-10" />
                     <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Facebook size={16} className="text-blue-400" />
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Meta Ecosystem</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Official Cloud API</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">Zero latency, maximum throughput, and end-to-end encryption with native auto-renewing tokens.</p>
                     </div>
                     <div className="mt-6 pt-4 border-t border-gray-800/50 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>Encryption</span>
                            <span className="font-medium text-emerald-400">End-to-End</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>Token Lifecycle</span>
                            <span className="font-medium text-blue-400">Auto-Renewing</span>
                        </div>
                     </div>
                </div>
            </div>

            {/* Onboarding Flow (if disconnected) */}
            {connectionStatus === 'disconnected' && !requestSent && (
                <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 sm:p-8 mb-8">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Integration Method</h3>
                        <p className="text-sm text-gray-500">Select how you want to link your WhatsApp Business Account.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <button
                            onClick={() => setConnectionMethod('coexistence')}
                            className={clsx(
                                "flex items-start gap-4 p-5 rounded-xl border-2 transition-all text-left",
                                connectionMethod === 'coexistence' ? "border-blue-500 bg-blue-50/30" : "border-gray-100 hover:border-blue-200 hover:bg-gray-50"
                            )}
                        >
                            <div className="w-10 h-10 rounded-lg bg-[#1877F2] text-white flex items-center justify-center shrink-0">
                                <Facebook size={20} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-gray-900">Connect Existing WhatsApp App</h4>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase">Recommended</span>
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed">Keep WhatsApp Business App active on your phone using coexistence onboarding.</p>
                            </div>
                        </button>

                        <button
                            onClick={() => setConnectionMethod('cloud')}
                            className={clsx(
                                "flex items-start gap-4 p-5 rounded-xl border-2 transition-all text-left",
                                connectionMethod === 'cloud' ? "border-emerald-500 bg-emerald-50/30" : "border-gray-100 hover:border-emerald-200 hover:bg-gray-50"
                            )}
                        >
                            <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                                <Phone size={20} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-gray-900">Register New Number</h4>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase">Cloud API</span>
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed">Register a dedicated number directly for Cloud API usage.</p>
                            </div>
                        </button>

                        <button
                            onClick={() => setConnectionMethod('manual')}
                            className={clsx(
                                "flex items-start gap-4 p-5 rounded-xl border-2 transition-all text-left",
                                connectionMethod === 'manual' ? "border-indigo-500 bg-indigo-50/30" : "border-gray-100 hover:border-indigo-200 hover:bg-gray-50"
                            )}
                        >
                            <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                                <Key size={20} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-gray-900">Manual Payload</h4>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 uppercase">Legacy</span>
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed">Direct credential injection with system tokens. Requires manual review.</p>
                            </div>
                        </button>
                    </div>

                    {/* Integrated Login Box */}
                    {(connectionMethod === 'coexistence' || connectionMethod === 'cloud') && (
                        <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div>
                                <h4 className="font-bold text-gray-900 mb-1">Ready to Connect</h4>
                                <p className="text-sm text-gray-600">
                                    {connectionMethod === 'coexistence'
                                        ? 'You will be redirected to Meta to connect your existing WhatsApp Business App.'
                                        : 'You will be redirected to Meta to register a new Cloud API number.'}
                                </p>
                            </div>
                            <button
                                onClick={() => handleEmbeddedConnect(connectionMethod)}
                                disabled={!tenantId || loading}
                                className="w-full sm:w-auto px-6 py-3 bg-[#1877F2] hover:bg-blue-700 text-white text-sm font-bold shadow-sm rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
                            >
                                <Facebook size={18} /> Connect Meta Account
                            </button>
                        </div>
                    )}

                    {/* Integrated Manual Form */}
                    {connectionMethod === 'manual' && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
                             <div className="mb-6">
                                <h4 className="font-bold text-gray-900 mb-1">Credential Injection</h4>
                                <p className="text-sm text-gray-500">Provide your app tokens directly from the Meta Developer dashboard.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Phone Number ID</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Smartphone size={16} /></div>
                                        <input type="text" value={phoneNumberId} onChange={(e) => setPhoneNumberId(e.target.value)} placeholder="e.g., 10000..." className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg text-sm transition-all" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">WABA ID</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Building2 size={16} /></div>
                                        <input type="text" value={wabaId} onChange={(e) => setWabaId(e.target.value)} placeholder="e.g., 00000..." className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg text-sm transition-all" />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">System User Access Token</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Key size={16} /></div>
                                        <input type={showToken ? 'text' : 'password'} value={accessToken} onChange={(e) => setAccessToken(e.target.value)} placeholder="EAAW..." className="w-full pl-9 pr-10 py-2 bg-white border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg text-sm font-mono transition-all" />
                                        <button onClick={() => setShowToken(!showToken)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                            {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button onClick={handleManualSubmit} disabled={loading || !phoneNumberId || !wabaId || !accessToken} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                                <Send size={16} /> Submit Credentials
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Submitted State */}
            {requestSent && (
                <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-10 text-center mb-8">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500"><CheckCircle size={32} /></div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Credentials Received</h3>
                    <p className="text-sm text-gray-500 max-w-lg mx-auto mb-6">Your manual integration request is queued for security validation. This process typically completes within 1-2 hours.</p>
                </div>
            )}

            {/* Sub-components container */}
            {connectionStatus === 'connected' && accountDetails && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {/* Ensure sub-components also adapt to their container nicely */}
                        <div className="min-w-0">
                            <AccountDetailsCard
                                businessId={accountDetails.businessId}
                                wabaId={accountDetails.wabaId}
                                phoneNumberId={accountDetails.phoneNumberId}
                                displayPhoneNumber={accountDetails.displayPhoneNumber}
                                verifiedName={accountDetails.verifiedName}
                            />
                        </div>
                        <div className="space-y-6 min-w-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <QualityRatingIndicator rating={accountDetails.qualityRating} />
                                <MessagingLimitsCard
                                    messagingLimit={accountDetails.messagingLimit}
                                    messageCount={accountDetails.messageCount}
                                />
                            </div>
                            <PaymentSetupCard />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden min-w-0">
                        <FeatureMatrixTable />
                    </div>
                </div>
            )}

            {/* Footer Support/Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-200/60">
                {[
                    { label: 'Cloud Architecture', desc: 'Secure reliable delivery', icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Security Protocols', desc: 'Enterprise data safety', icon: Key, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Priority Support', desc: 'Direct engineer access', icon: Mail, color: 'text-emerald-600', bg: 'bg-emerald-50' }
                ].map((item, idx) => (
                    <div key={idx} className="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className={clsx("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", item.bg, item.color)}>
                            <item.icon size={20} />
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 text-sm mb-0.5">{item.label}</h4>
                            <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
