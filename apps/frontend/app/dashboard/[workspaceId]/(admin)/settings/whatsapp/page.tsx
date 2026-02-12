"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useParams } from 'next/navigation';
import {
    Facebook, Settings, CheckCircle, XCircle, AlertCircle,
    Key, Globe, Shield, ArrowRight, Copy, Eye, EyeOff,
    Clock, Mail, Phone, Building2, Send, RefreshCw
} from 'lucide-react';
import FacebookSDKLoader, { launchWhatsAppSignup } from '@/components/FacebookSDKLoader';

const FALLBACK_APP_ID = '782076418251038';
const FALLBACK_CONFIG_ID = '1093745902865717';

export default function WhatsappSettingsPage() {
    const [loading, setLoading] = useState(false);
    const [tenantId, setTenantId] = useState<string | null>(null);
    const [connectionMethod, setConnectionMethod] = useState<'facebook' | 'manual' | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'pending' | 'disconnected'>('disconnected');
    const [sdkLoaded, setSdkLoaded] = useState(false);

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

    // Meta Config
    const [metaConfig, setMetaConfig] = useState<{ appId: string, configId: string } | null>(
        typeof window !== 'undefined' ? {
            appId: process.env.NEXT_PUBLIC_META_APP_ID || FALLBACK_APP_ID,
            configId: process.env.NEXT_PUBLIC_META_CONFIG_ID || FALLBACK_CONFIG_ID
        } : null
    );
    const [embeddedIds, setEmbeddedIds] = useState<{ phoneNumberId: string, wabaId: string } | null>(null);

    const params = useParams();

    useEffect(() => {
        const initSettings = async () => {
            const workspaceSlug = params.workspaceId as string;
            if (!workspaceSlug) return;

            try {
                // Resolve tenant
                const res = await api.get('/auth/workspaces');
                const memberships = res.data;
                const activeMembership = memberships.find((m: any) => m.tenant?.slug === workspaceSlug);

                if (activeMembership && activeMembership.tenant?.id) {
                    const tId = activeMembership.tenant.id;
                    setTenantId(tId);

                    // Fetch connection status
                    try {
                        const statusRes = await api.get(`/whatsapp/status?tenantId=${tId}`);
                        if (statusRes.data.connected) {
                            setConnectionStatus('connected');
                        } else if (statusRes.data.mode === 'manual' && statusRes.data.status === 'pending') {
                            setConnectionStatus('pending');
                        } else {
                            setConnectionStatus('disconnected');
                        }
                    } catch (err) {
                        setConnectionStatus('disconnected');
                    }

                    // Fetch Meta Public Config
                    try {
                        const configRes = await api.get('/whatsapp/public-config');
                        setMetaConfig(configRes.data);
                    } catch (e) {
                        console.error('Failed to fetch meta config');
                    }
                }
            } catch (e) {
                console.error('Failed to init settings');
            }
        };

        initSettings();
    }, [params.workspaceId]);

    useEffect(() => {
        console.log('[MetaDebug] Current metaConfig:', metaConfig);
        console.log('[MetaDebug] Env Var:', process.env.NEXT_PUBLIC_META_APP_ID);
    }, [metaConfig]);

    // Embedded Signup Event Listener
    useEffect(() => {
        const checkSdk = setInterval(() => {
            if (window.FB && window._fbInitialized) {
                setSdkLoaded(true);
                clearInterval(checkSdk);
            }
        }, 500);

        const handler = (event: MessageEvent) => {
            if (event.origin !== "https://www.facebook.com" && event.origin !== "https://web.facebook.com") {
                return;
            }
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'WA_EMBEDDED_SIGNUP') {
                    if (data.event === 'FINISH') {
                        const { phone_number_id, waba_id } = data.data;
                        console.log("Embedded Signup Finished:", phone_number_id, waba_id);
                        setEmbeddedIds({ phoneNumberId: phone_number_id, wabaId: waba_id });
                    } else if (data.event === 'CANCEL') {
                        console.warn("Embedded Signup Cancelled");
                    } else if (data.event === 'ERROR') {
                        console.error("Embedded Signup Error:", data.data.error_message);
                    }
                }
            } catch (e) {
                // Ignore non-JSON
            }
        };
        window.addEventListener('message', handler);
        return () => {
            window.removeEventListener('message', handler);
            clearInterval(checkSdk);
        };
    }, []);

    const handleFacebookConnect = () => {
        console.log('Facebook Connect clicked');
        if (!tenantId) {
            alert('Debug: tenantId is missing from localStorage/token');
            return;
        }
        if (!metaConfig) {
            alert('Debug: metaConfig is missing from backend');
            return;
        }
        if (!metaConfig.configId) {
            alert('Debug: metaConfig.configId is missing');
            return;
        }

        const handleFacebookConnect = () => {
            if (!metaConfig?.appId || !metaConfig?.configId) {
                alert('Configuration missing (App ID or Config ID)');
                return;
            }

            // Construct the OAuth URL directly to avoid SDK popup issues
            const redirectUri = typeof window !== 'undefined' ? `${window.location.origin}/meta/callback` : 'https://app.aerostic.com/meta/callback';
            const state = tenantId; // Pass tenantId as state to persist through callback

            // Facebook Embedded Signup URL structure
            const fbUrl = `https://www.facebook.com/v22.0/dialog/oauth?` +
                `client_id=${metaConfig.appId}` +
                `&redirect_uri=${encodeURIComponent(redirectUri)}` +
                `&response_type=code` +
                `&config_id=${metaConfig.configId}` +
                `&state=${state}`; // State is critical for security and context

            console.log('Redirecting to Facebook:', fbUrl);
            window.location.href = fbUrl;
        };

        const handleManualSubmit = async () => {
            if (!phoneNumberId || !wabaId || !accessToken) {
                alert('Please fill in all fields');
                return;
            }
            setLoading(true);
            try {
                // Send request to admin for approval
                await api.post('/whatsapp/config/request', {
                    tenantId,
                    phoneNumberId,
                    wabaId,
                    accessToken,
                });
                setRequestSent(true);
                setRequestStatus('pending');
            } catch (e) {
                console.error(e);
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
                setTenantId(null); // Optional: clear if needed, or just status
                window.location.reload(); // Clean state
            } catch (e) {
                console.error(e);
                alert('Failed to disconnect');
                setLoading(false);
            }
        };

        const copyToClipboard = (text: string) => {
            navigator.clipboard.writeText(text);
        };

        const handleSendTest = async () => {
            if (!testNumber) return;
            setSendingTest(true);
            try {
                await api.post(`/whatsapp/send-test?tenantId=${tenantId}`, { to: testNumber });
                alert('Test message sent successfully!');
                setTestNumber('');
            } catch (e: any) {
                console.error(e);
                alert('Failed to send test message: ' + (e.response?.data?.message || e.message));
            } finally {
                setSendingTest(false);
            }
        };

        return (
            <div className="max-w-4xl space-y-8">
                {metaConfig && <FacebookSDKLoader appId={metaConfig.appId} />}
                {/* Header */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">WhatsApp Configuration</h2>
                    <p className="text-gray-500 mt-1">Connect your WhatsApp Business Account to start messaging</p>
                </div>

                {/* Connection Status Card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${connectionStatus === 'connected' ? 'bg-green-100' :
                                connectionStatus === 'pending' ? 'bg-amber-100' : 'bg-red-100'
                                }`}>
                                {connectionStatus === 'connected' ? (
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                ) : connectionStatus === 'pending' ? (
                                    <Clock className="w-6 h-6 text-amber-600" />
                                ) : (
                                    <XCircle className="w-6 h-6 text-red-600" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Connection Status</h3>
                                <p className={`text-sm font-medium ${connectionStatus === 'connected' ? 'text-green-600' :
                                    connectionStatus === 'pending' ? 'text-amber-600' : 'text-red-600'
                                    }`}>
                                    {connectionStatus === 'connected' ? '✓ Connected & Active' :
                                        connectionStatus === 'pending' ? '⏳ Pending Approval' : '✗ Not Connected'}
                                </p>
                            </div>
                        </div>
                        {connectionStatus === 'connected' && (
                            <button
                                onClick={handleDisconnect}
                                disabled={loading}
                                className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 font-medium text-sm disabled:opacity-50"
                            >
                                {loading ? 'Disconnecting...' : 'Disconnect'}
                            </button>
                        )}
                    </div>

                    {connectionStatus === 'connected' && (
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <h4 className="font-semibold text-gray-900 mb-3">Test Connection</h4>
                            <div className="flex gap-3">
                                <input
                                    type="tel"
                                    placeholder="Recipient Phone (e.g. 919999999999)"
                                    value={testNumber}
                                    onChange={(e) => setTestNumber(e.target.value)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                />
                                <button
                                    onClick={handleSendTest}
                                    disabled={sendingTest || !testNumber}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    {sendingTest ? 'Sending...' : 'Send Test'}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Sends a "Hello World" template message to verify the API connection.
                            </p>
                        </div>
                    )}

                    {connectionStatus === 'pending' && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                            <div>
                                <p className="font-medium text-amber-800">Awaiting Admin Approval</p>
                                <p className="text-sm text-amber-700 mt-1">
                                    Your WhatsApp configuration request has been submitted and is pending review.
                                    You'll be notified once approved.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Connection Methods */}
                {connectionStatus === 'disconnected' && !requestSent && (
                    <>
                        <h3 className="text-lg font-semibold text-gray-900">Choose Connection Method</h3>

                        <div className="grid grid-cols-2 gap-6">
                            {/* Method 1: Facebook Embedded SDK */}
                            <div
                                className={`bg-white rounded-2xl border-2 p-6 cursor-pointer transition-all hover:shadow-lg ${connectionMethod === 'facebook' ? 'border-blue-500 ring-4 ring-blue-100' : 'border-gray-200'
                                    }`}
                                onClick={() => setConnectionMethod('facebook')}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-[#1877F2] rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Facebook Embedded SDK</h4>
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Recommended</span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-4">
                                    Connect directly through Facebook's official embedded signup flow. Quick, secure, and automatic.
                                </p>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-center gap-2 text-gray-600">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Instant connection
                                    </li>
                                    <li className="flex items-center gap-2 text-gray-600">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        No manual configuration
                                    </li>
                                    <li className="flex items-center gap-2 text-gray-600">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Automatic token refresh
                                    </li>
                                </ul>
                                {connectionMethod === 'facebook' && (
                                    <div className="mt-4 pt-4 border-t">
                                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center absolute -top-2 -right-2">
                                            <CheckCircle className="w-3 h-3 text-white" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Method 2: Manual Configuration */}
                            <div
                                className={`bg-white rounded-2xl border-2 p-6 cursor-pointer transition-all hover:shadow-lg ${connectionMethod === 'manual' ? 'border-purple-500 ring-4 ring-purple-100' : 'border-gray-200'
                                    }`}
                                onClick={() => setConnectionMethod('manual')}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                                        <Key className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Manual Configuration</h4>
                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Advanced</span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-4">
                                    Enter your WhatsApp Business API credentials manually. Requires admin approval.
                                </p>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-center gap-2 text-gray-600">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Full control over credentials
                                    </li>
                                    <li className="flex items-center gap-2 text-gray-600">
                                        <Clock className="w-4 h-4 text-amber-500" />
                                        Requires admin approval
                                    </li>
                                    <li className="flex items-center gap-2 text-gray-600">
                                        <Shield className="w-4 h-4 text-blue-500" />
                                        Enterprise-grade security
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </>
                )}

                {/* Facebook Connect Section */}
                {connectionMethod === 'facebook' && connectionStatus === 'disconnected' && (
                    <div className="bg-gradient-to-r from-[#1877F2] to-[#166fe5] rounded-2xl p-8 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold mb-2">Connect with Facebook</h3>
                                <p className="text-blue-100 max-w-lg">
                                    You'll be redirected to Facebook to authorize Aerostic to access your WhatsApp Business Account.
                                    This is the fastest way to get started.
                                </p>
                            </div>
                            <button
                                onClick={handleFacebookConnect}
                                disabled={!tenantId || loading || !sdkLoaded}
                                className={`flex items-center gap-3 px-8 py-4 bg-white text-[#1877F2] font-bold rounded-xl hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${!sdkLoaded && metaConfig ? 'animate-pulse' : ''}`}
                            >
                                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                {loading ? 'Connecting...' : !sdkLoaded && metaConfig ? 'Initializing SDK...' : 'Login with Facebook'}
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mt-6 pt-6 border-t border-blue-400/30 grid grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                <span>Secure OAuth 2.0</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <RefreshCw className="w-4 h-4" />
                                <span>Auto token refresh</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                <span>Official Meta API</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Manual Configuration Form */}
                {connectionMethod === 'manual' && connectionStatus === 'disconnected' && !requestSent && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Settings className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Manual API Configuration</h3>
                                <p className="text-sm text-gray-500">Enter your WhatsApp Business API credentials</p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            {/* Phone Number ID */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number ID <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={phoneNumberId}
                                        onChange={(e) => setPhoneNumberId(e.target.value)}
                                        placeholder="e.g., 100000000000000"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Found in Meta Business Suite → WhatsApp → Phone Numbers</p>
                            </div>

                            {/* WABA ID */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    WhatsApp Business Account ID <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={wabaId}
                                        onChange={(e) => setWabaId(e.target.value)}
                                        placeholder="e.g., 100000000000000"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Your WABA ID from Meta Business Suite</p>
                            </div>

                            {/* Access Token */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Permanent Access Token <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showToken ? 'text' : 'password'}
                                        value={accessToken}
                                        onChange={(e) => setAccessToken(e.target.value)}
                                        placeholder="EAAxxxxxxxx..."
                                        className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowToken(!showToken)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                                    >
                                        {showToken ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Generate a permanent token in Meta Business Suite → System Users</p>
                            </div>

                            {/* Info Banner */}
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-medium text-blue-800">Admin Approval Required</p>
                                    <p className="text-blue-700 mt-1">
                                        Your configuration will be reviewed by our team to ensure everything is set up correctly.
                                        This usually takes 1-2 business hours.
                                    </p>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleManualSubmit}
                                disabled={loading || !phoneNumberId || !wabaId || !accessToken}
                                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Send className="w-5 h-5" />
                                {loading ? 'Submitting...' : 'Submit for Admin Approval'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Request Submitted Confirmation */}
                {requestSent && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Request Submitted!</h3>
                        <p className="text-gray-600 max-w-md mx-auto mb-6">
                            Your WhatsApp configuration request has been submitted successfully.
                            Our team will review and approve it within 1-2 business hours.
                        </p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full font-medium">
                            <Clock className="w-4 h-4" />
                            Pending Admin Approval
                        </div>
                    </div>
                )}

                {/* Help Section */}
                <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Need Help?</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <a href="/docs/getting-started" className="p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group">
                            <Globe className="w-6 h-6 text-blue-600 mb-2" />
                            <h4 className="font-medium text-gray-900 group-hover:text-blue-600">Setup Guide</h4>
                            <p className="text-sm text-gray-500">Step-by-step instructions</p>
                        </a>
                        <a href="/docs/api-reference" className="p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group">
                            <Key className="w-6 h-6 text-purple-600 mb-2" />
                            <h4 className="font-medium text-gray-900 group-hover:text-purple-600">API Credentials</h4>
                            <p className="text-sm text-gray-500">How to get your keys</p>
                        </a>
                        <a href="mailto:support@aerostic.com" className="p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group">
                            <Mail className="w-6 h-6 text-green-600 mb-2" />
                            <h4 className="font-medium text-gray-900 group-hover:text-green-600">Contact Support</h4>
                            <p className="text-sm text-gray-500">Get personalized help</p>
                        </a>
                    </div>
                </div>
            </div>
        );
    }
}
