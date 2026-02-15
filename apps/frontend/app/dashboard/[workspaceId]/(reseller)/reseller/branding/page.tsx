'use client';

import { useState, useEffect } from 'react';
import {
    Globe, Palette, Mail, ChevronRight,
    Save, AlertTriangle, CheckCircle2,
    Image as ImageIcon, Layout
} from 'lucide-react';
import { useParams } from 'next/navigation';

export default function ResellerBrandingPage() {
    const { workspaceId } = useParams();
    const [config, setConfig] = useState<any>({
        domain: '',
        brandName: '',
        primaryColor: '#7C3AED',
        supportEmail: '',
        logo: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await fetch(`/api/v1/reseller/branding`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                if (data) setConfig(data);
            }
        } catch (error) {
            console.error('Failed to fetch branding config:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/v1/reseller/branding`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
                credentials: 'include'
            });
            if (res.ok) {
                // Success notification
            }
        } catch (error) {
            console.error('Failed to save branding:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl space-y-8 pb-12">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">White-label Settings</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Customize the platform appearance for your clients.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-primary" />
                        Custom Domain
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Connect your own domain to provide a seamless experience.
                    </p>
                </div>
                <div className="md:col-span-2 bg-white p-6 rounded-xl border shadow-sm space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Domain</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={config.domain}
                                onChange={e => setConfig({ ...config, domain: e.target.value })}
                                className="flex-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="whatsapp.youragency.com"
                            />
                            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium">Connect</button>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Requires CNAME record pointing to app.aerostic.com
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t pt-8">
                <div className="md:col-span-1">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Palette className="w-5 h-5 text-primary" />
                        Brand Identity
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Choose your logo and primary colors.
                    </p>
                </div>
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
                        <div className="flex items-start gap-6">
                            <div className="w-24 h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                                {config.logo ? <img src={config.logo} className="w-full h-full object-contain p-2" /> : <ImageIcon className="w-6 h-6 mb-1" />}
                                <span className="text-[10px] font-medium">Upload Logo</span>
                            </div>
                            <div className="flex-1 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                                    <input
                                        type="text"
                                        value={config.brandName}
                                        onChange={e => setConfig({ ...config, brandName: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="e.g. Agency Pro"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                                    <div className="flex gap-3 items-center">
                                        <input
                                            type="color"
                                            value={config.primaryColor}
                                            onChange={e => setConfig({ ...config, primaryColor: e.target.value })}
                                            className="w-10 h-10 rounded cursor-pointer border-none p-0 overflow-hidden"
                                        />
                                        <input
                                            type="text"
                                            value={config.primaryColor}
                                            onChange={e => setConfig({ ...config, primaryColor: e.target.value })}
                                            className="flex-1 px-4 py-2 border rounded-lg font-mono text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t pt-8">
                <div className="md:col-span-1">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-primary" />
                        Support Info
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Client-facing support contact details.
                    </p>
                </div>
                <div className="md:col-span-2 bg-white p-6 rounded-xl border shadow-sm">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
                    <input
                        type="email"
                        value={config.supportEmail}
                        onChange={e => setConfig({ ...config, supportEmail: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="support@youragency.com"
                    />
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-bold shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                    {saving ? 'Saving...' : <>
                        <Save className="w-4 h-4" />
                        Save Changes
                    </>}
                </button>
            </div>
        </div>
    );
}
