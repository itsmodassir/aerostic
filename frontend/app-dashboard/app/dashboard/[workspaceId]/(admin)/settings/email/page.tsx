"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useParams } from 'next/navigation';
import {
    Settings, CheckCircle, XCircle, AlertCircle,
    Key, Globe, Shield, Save, Mail, Server, Fingerprint,
    Info, Trash2, Plus, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function EmailSettingsPage() {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [mailboxes, setMailboxes] = useState<any[]>([]);
    const [testing, setTesting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        emailAddress: '',
        host: '',
        port: 465,
        user: '',
        pass: '',
        secure: true
    });

    const params = useParams();
    const workspaceId = params.workspaceId;

    useEffect(() => {
        fetchMailboxes();
    }, [workspaceId]);

    const fetchMailboxes = async () => {
        try {
            const res = await api.get('/mailboxes');
            setMailboxes(res.data);
            if (res.data.length > 0) {
                const mb = res.data[0];
                setFormData({
                    name: mb.name || '',
                    emailAddress: mb.emailAddress || '',
                    host: mb.smtpConfig?.host || '',
                    port: mb.smtpConfig?.port || 465,
                    user: mb.smtpConfig?.user || mb.smtpConfig?.auth?.user || '',
                    pass: mb.smtpConfig?.pass || mb.smtpConfig?.auth?.pass || '',
                    secure: mb.smtpConfig?.secure ?? true
                });
            }
        } catch (err) {
            console.error('Failed to fetch mailboxes:', err);
        } finally {
            setFetching(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const payload = {
                name: formData.name,
                emailAddress: formData.emailAddress,
                provider: 'custom_smtp',
                smtpConfig: {
                    host: formData.host,
                    port: formData.port,
                    secure: formData.secure,
                    user: formData.user,
                    pass: formData.pass
                }
            };

            if (mailboxes.length > 0) {
                await api.patch(`/mailboxes/${mailboxes[0].id}`, payload);
                toast.success('SMTP Settings updated successfully');
            } else {
                await api.post('/mailboxes', payload);
                toast.success('SMTP Settings saved successfully');
                fetchMailboxes();
            }
        } catch (err) {
            toast.error('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    const handleTestConnection = async () => {
        setTesting(true);
        try {
            await api.post('/email/test-connection', {
                host: formData.host,
                port: formData.port,
                secure: formData.secure,
                user: formData.user,
                pass: formData.pass,
                fromEmail: formData.emailAddress
            });
            toast.success('Connection successful!');
        } catch (err: any) {
            toast.error(`Connection failed: ${err.response?.data?.message || err.message}`);
        } finally {
            setTesting(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl space-y-8 pb-20">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Email Settings</h2>
                <p className="text-gray-500 mt-1">Configure your own SMTP server to send emails from your domain</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sender Info */}
                    <div className="space-y-4 md:col-span-2 pb-4 border-b">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Mail size={16} />
                            Sender Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Display Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Aimstors Solution Support"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">From Email Address</label>
                                <input
                                    type="email"
                                    value={formData.emailAddress}
                                    onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                                    placeholder="support@yourdomain.com"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Server Info */}
                    <div className="space-y-4 md:col-span-2 pt-2">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Server size={16} />
                            SMTP Server Configuration
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">SMTP Host</label>
                                <input
                                    type="text"
                                    value={formData.host}
                                    onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                                    placeholder="smtp.gmail.com"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Port</label>
                                <input
                                    type="number"
                                    value={formData.port}
                                    onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                                    placeholder="465"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Auth Info */}
                    <div className="space-y-4 md:col-span-2 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Username / User</label>
                                <input
                                    type="text"
                                    value={formData.user}
                                    onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                                    placeholder="your-email@gmail.com"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Password / App Key</label>
                                <input
                                    type="password"
                                    value={formData.pass}
                                    onChange={(e) => setFormData({ ...formData, pass: e.target.value })}
                                    placeholder="••••••••••••"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                            <input
                                type="checkbox"
                                id="secure"
                                checked={formData.secure}
                                onChange={(e) => setFormData({ ...formData, secure: e.target.checked })}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="secure" className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                Use SSL/TLS (Secure Connection)
                                <Shield size={14} className="text-green-500" />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-4 items-start">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Info className="text-amber-600" size={20} />
                    </div>
                    <div className="text-sm">
                        <p className="font-bold text-amber-900">Security Note</p>
                        <p className="text-amber-800 mt-1">If you're using Gmail, make sure to use an <strong>App Password</strong> rather than your primary account password. Two-factor authentication must be enabled on your Google account.</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                        onClick={handleTestConnection}
                        disabled={testing || !formData.host}
                        className="flex-1 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                        {testing ? <Loader2 size={18} className="animate-spin" /> : <Globe size={18} />}
                        Test Connection
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-[2] px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Save SMTP Configuration
                    </button>
                </div>
            </div>

            {/* Help Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex gap-4">
                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                        <Globe size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900">Automation Node</h4>
                        <p className="text-sm text-gray-500 mt-1">Once configured, you can select "Personal SMTP" in your automation workflows.</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900">Verified Sending</h4>
                        <p className="text-sm text-gray-500 mt-1">Emails will be sent with your own domain, improving delivery rates.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
