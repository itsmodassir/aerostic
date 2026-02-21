'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Globe, Palette, Link as LinkIcon, Mail,
    Save, ArrowLeft, CheckCircle, Upload,
    Image as ImageIcon, RefreshCcw, Layout,
    ExternalLink, AlertCircle, Building2
} from 'lucide-react';

export default function ResellerBrandingPage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params?.workspaceId || 'default';
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [membership, setMembership] = useState<any>(null);

    const [branding, setBranding] = useState({
        brandName: '',
        primaryColor: '#7C3AED',
        logo: '',
        favicon: '',
        domain: '',
        supportEmail: ''
    });

    useEffect(() => {
        fetchBranding();
    }, [workspaceId]);

    const fetchBranding = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/v1/auth/membership', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setMembership(data);
                if (data.branding) {
                    setBranding({
                        brandName: data.branding.brandName || '',
                        primaryColor: data.branding.primaryColor || '#7C3AED',
                        logo: data.branding.logo || '',
                        favicon: data.branding.favicon || '',
                        domain: data.branding.domain || '',
                        supportEmail: data.branding.supportEmail || ''
                    });
                }
            }
        } catch (error) {
            console.error('Failed to fetch branding', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/v1/reseller/branding', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(branding)
            });

            if (res.ok) {
                setSuccessMsg('Branding configuration updated successfully!');
                setTimeout(() => setSuccessMsg(''), 3000);
            } else {
                const err = await res.json();
                alert(err.message || 'Failed to update branding');
            }
        } catch (error) {
            alert('A network error occurred');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/dashboard/${workspaceId}`} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">White Label Branding</h1>
                        <p className="text-gray-500 text-sm">Customize the dashboard with your own brand identity</p>
                    </div>
                </div>
                {successMsg && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-xl animate-in fade-in slide-in-from-top-1">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">{successMsg}</span>
                    </div>
                )}
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                {/* Visual Identity Section */}
                <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Palette className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="font-bold text-gray-900">Visual Identity</h3>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Brand Name</label>
                                <input
                                    type="text"
                                    value={branding.brandName}
                                    onChange={(e) => setBranding({ ...branding, brandName: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Your Agency Name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Primary Color</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={branding.primaryColor}
                                        onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                                        className="w-12 h-12 rounded-xl cursor-pointer border-none p-0"
                                    />
                                    <input
                                        type="text"
                                        value={branding.primaryColor}
                                        onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-mono text-sm uppercase"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Logo URL</label>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gray-50 rounded-xl border border-dashed border-gray-300 flex items-center justify-center shrink-0 overflow-hidden">
                                        {branding.logo ? (
                                            <img src={branding.logo} alt="Logo Preview" className="w-full h-full object-contain" />
                                        ) : (
                                            <ImageIcon className="w-6 h-6 text-gray-300" />
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        value={branding.logo}
                                        onChange={(e) => setBranding({ ...branding, logo: e.target.value })}
                                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
                                        placeholder="https://yourdomain.com/logo.png"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Favicon URL</label>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gray-50 rounded-xl border border-dashed border-gray-300 flex items-center justify-center shrink-0">
                                        {branding.favicon ? (
                                            <img src={branding.favicon} alt="Favicon Preview" className="w-6 h-6" />
                                        ) : (
                                            <Globe className="w-6 h-6 text-gray-300" />
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        value={branding.favicon}
                                        onChange={(e) => setBranding({ ...branding, favicon: e.target.value })}
                                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
                                        placeholder="https://yourdomain.com/favicon.ico"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Domain & Support Section */}
                <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                            <Layout className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="font-bold text-gray-900">Custom Domain & Support</h3>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Custom Dashboard Domain</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={branding.domain}
                                        onChange={(e) => setBranding({ ...branding, domain: e.target.value })}
                                        className="w-full pl-10 pr-12 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="dash.yourcompany.com"
                                    />
                                    <ExternalLink className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                </div>
                                <p className="mt-2 text-[10px] text-gray-400">CNAME should point to app.aimstore.in</p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Support Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="email"
                                        value={branding.supportEmail}
                                        onChange={(e) => setBranding({ ...branding, supportEmail: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="support@yourcompany.com"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-bold text-amber-900">Domain Verification Required</p>
                                <p className="text-amber-700 mt-1">SSL certificates are automatically generated. Please ensure your CNAME record is active before testing your custom domain.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={fetchBranding}
                        className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 flex items-center gap-2 transition-colors"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        Discard Changes
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg active:scale-95 disabled:opacity-50 min-w-[160px] justify-center transition-all"
                    >
                        {saving ? (
                            <RefreshCcw className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        {saving ? 'Applying...' : 'Save Branding'}
                    </button>
                </div>
            </form>

            {/* Preview Section */}
            <div className="pt-12">
                <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">Design Preview</h3>
                <div className="bg-gray-50 rounded-[2.5rem] p-12 border border-dashed border-gray-300">
                    <div className="bg-white rounded-[1.5rem] shadow-2xl overflow-hidden border border-gray-200 max-w-sm mx-auto">
                        <header className="h-12 border-b bg-white flex items-center px-4 justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-400" />
                                <div className="w-2 h-2 rounded-full bg-amber-400" />
                                <div className="w-2 h-2 rounded-full bg-green-400" />
                            </div>
                            <div className="w-24 h-4 bg-gray-100 rounded-full" />
                        </header>
                        <div className="flex h-64">
                            <aside className="w-16 border-r flex flex-col items-center py-4 gap-4">
                                <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: branding.primaryColor || '#7C3AED' }} />
                                <div className="w-8 h-8 rounded-lg bg-gray-50" />
                                <div className="w-8 h-8 rounded-lg bg-gray-50" />
                            </aside>
                            <main className="flex-1 p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 overflow-hidden rounded-md border flex items-center justify-center">
                                        {branding.logo ? <img src={branding.logo} className="w-full h-full object-contain" /> : <Building2 className="w-4 h-4 text-gray-300" />}
                                    </div>
                                    <span className="font-bold text-sm" style={{ color: branding.primaryColor || '#7C3AED' }}>{branding.brandName || 'Brand Name'}</span>
                                </div>
                                <div className="h-4 bg-gray-100 rounded-full w-3/4 animate-pulse" />
                                <div className="h-24 bg-gray-50 rounded-xl" />
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="h-12 bg-gray-50 rounded-lg" />
                                    <div className="h-12 bg-gray-50 rounded-lg" />
                                </div>
                            </main>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
