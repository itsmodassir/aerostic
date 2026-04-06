'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
    Smartphone, Globe, ArrowLeft, RefreshCw, 
    AlertCircle, CheckCircle, ShieldCheck, 
    ExternalLink, Trash2
} from 'lucide-react';
import { clsx } from 'clsx';
import api from '@/lib/api';
import AccountDetailsCard from '@/components/whatsapp/AccountDetailsCard';
import MessagingLimitsCard from '@/components/whatsapp/MessagingLimitsCard';
import QualityRatingIndicator from '@/components/whatsapp/QualityRatingIndicator';
import BusinessProfileModal from '@/components/whatsapp/BusinessProfileModal';

export default function WhatsAppSettingsPage() {
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);
    const [status, setStatus] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;

            if (event.data?.type === 'WA_CONNECTED') {
                if (event.data.success) {
                    setNotice('WhatsApp connected successfully.');
                    fetchData();
                } else if (event.data.error) {
                    setError(event.data.error);
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    useEffect(() => {
        const connected = searchParams.get('connected');
        const urlError = searchParams.get('error');

        if (connected === '1') {
            setNotice('WhatsApp connected successfully.');
        } else if (urlError) {
            setError(urlError);
        }
        
        fetchData();
    }, [searchParams]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statusRes, profileRes] = await Promise.all([
                api.get('/whatsapp/status'),
                api.get('/whatsapp/profile').catch(() => ({ data: null }))
            ]);
            setStatus(statusRes.data);
            setProfile(profileRes.data);
            setError(null);
        } catch (err: any) {
            console.error('Failed to fetch WhatsApp data', err);
            setError(err.response?.data?.message || 'Failed to load configuration');
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            await api.post('/whatsapp/sync-account');
            await fetchData();
            setNotice('Meta data synchronized.');
        } catch (err) {
            console.error('Sync failed', err);
        } finally {
            setSyncing(false);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm('Are you sure you want to disconnect your WhatsApp Business Account? This will pause all active campaigns.')) return;
        
        setDisconnecting(true);
        try {
            await api.delete('/whatsapp');
            setStatus({ connected: false });
        } catch (err) {
            console.error('Disconnect failed', err);
        } finally {
            setDisconnecting(false);
        }
    };

    const handleConnect = async () => {
        try {
            const res = await api.get('/whatsapp/embedded/url');
            if (res.data.url) {
                const width = 600;
                const height = 700;
                const left = window.screen.width / 2 - width / 2;
                const top = window.screen.height / 2 - height / 2;
                window.open(res.data.url, 'MetaSignup', `width=${width},height=${height},top=${top},left=${left}`);
            }
        } catch (err) {
            console.error('Failed to start signup', err);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/dashboard" className="p-2.5 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100">
                            <ArrowLeft size={20} className="text-gray-500" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                WhatsApp Integration
                                {status?.connected && (
                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">Connected</span>
                                )}
                            </h1>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Scale your business via official Meta Cloud Hub</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {status?.connected && (
                            <button 
                                onClick={handleSync}
                                disabled={syncing}
                                className="flex items-center gap-2.5 px-5 py-3 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-bold text-xs"
                            >
                                <RefreshCw size={16} className={clsx(syncing && "animate-spin")} />
                                {syncing ? 'Syncing...' : 'Sync Meta data'}
                            </button>
                        )}
                        <a 
                            href="https://business.facebook.com/wa/manage/" 
                            target="_blank" 
                            className="flex items-center gap-2.5 px-5 py-3 text-blue-600 border border-blue-100 bg-blue-50/50 rounded-xl hover:bg-blue-50 transition-all font-bold text-xs"
                        >
                            <ExternalLink size={16} />
                            Meta Manager
                        </a>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-12">
                {!status?.connected ? (
                    <div className="bg-white rounded-[40px] border border-gray-200 p-12 text-center shadow-sm max-w-2xl mx-auto">
                        <div className="w-24 h-24 bg-emerald-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 border border-emerald-100">
                            <Smartphone size={48} className="text-emerald-600" />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Connect your WhatsApp Business Account</h2>
                        <p className="text-gray-500 mb-10 leading-relaxed font-medium">
                            Integrate your official WhatsApp API to send broadcast campaigns, 
                            deploy AI response agents, and manage customer conversations at scale.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 text-left">
                            <div className="flex gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                <CheckCircle size={20} className="text-emerald-500 shrink-0" />
                                <p className="text-xs font-semibold text-gray-700">Official Cloud API (v20.0+)</p>
                            </div>
                            <div className="flex gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                <ShieldCheck size={20} className="text-emerald-500 shrink-0" />
                                <p className="text-xs font-semibold text-gray-700">Meta Verified Integration</p>
                            </div>
                        </div>

                        <button 
                            onClick={handleConnect}
                            className="w-full py-5 bg-black text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-xl shadow-gray-200 active:scale-95 flex items-center justify-center gap-3"
                        >
                            <Globe size={20} strokeWidth={3} />
                            Initiate Meta Secure Signup
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-12 space-y-8">
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <AccountDetailsCard 
                                    wabaId={status.wabaId}
                                    phoneNumberId={status.phoneNumberId}
                                    businessId={status.businessId}
                                    verifiedName={status.verifiedName}
                                    displayPhoneNumber={status.displayPhoneNumber}
                                    onEdit={() => setIsProfileModalOpen(true)}
                                />
                                <MessagingLimitsCard 
                                    messagingLimit={status.messagingLimit}
                                    messageCount={status.messageCount || 0}
                                />
                                <QualityRatingIndicator 
                                    rating={status.qualityRating}
                                />
                             </div>

                             <BusinessProfileModal 
                                isOpen={isProfileModalOpen}
                                onClose={() => setIsProfileModalOpen(false)}
                                onSuccess={fetchData}
                                initialData={profile}
                             />

                             <div className="bg-red-50/50 rounded-[32px] border-2 border-red-50 p-8 flex items-center justify-between group">
                                <div className="flex gap-4 items-center">
                                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center border border-red-200 shadow-sm">
                                        <Trash2 size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-red-900 tracking-tight">Danger Zone</h4>
                                        <p className="text-xs text-red-600/70 font-semibold uppercase tracking-widest mt-0.5">Disconnect integration from system</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleDisconnect}
                                    disabled={disconnecting}
                                    className="px-8 py-4 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-100 flex items-center gap-2"
                                >
                                    {disconnecting ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                    Disconnect account
                                </button>
                             </div>
                        </div>
                    </div>
                )}
            </div>

            {error && (
                 <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom duration-500">
                    <div className="bg-red-600 text-white px-8 py-5 rounded-[24px] shadow-2xl flex items-center gap-4 border-2 border-red-500">
                        <AlertCircle size={24} strokeWidth={3} />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">{error}</p>
                        <button onClick={() => setError(null)} className="ml-4 hover:opacity-50 transition-opacity">✕</button>
                    </div>
                </div>
            )}

            {notice && (
                 <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom duration-500">
                    <div className="bg-emerald-600 text-white px-8 py-5 rounded-[24px] shadow-2xl flex items-center gap-4 border-2 border-emerald-500">
                        <CheckCircle size={24} strokeWidth={3} />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">{notice}</p>
                        <button onClick={() => setNotice(null)} className="ml-4 hover:opacity-50 transition-opacity">✕</button>
                    </div>
                </div>
            )}
        </div>
    );
}
