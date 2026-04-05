'use client';

import { useEffect, useState } from 'react';
import {
    DollarSign, Save, Loader2, RefreshCw, AlertCircle,
    CheckCircle2, Info, ArrowRight, ShieldCheck, Zap,
    MessageSquare, Smartphone, Key, Search, User, X,
    ChevronDown, Globe
} from 'lucide-react';

interface PricingConfig {
    "whatsapp.marketing_rate_meta": string;
    "whatsapp.marketing_rate_custom": string;
    "whatsapp.utility_rate_meta": string;
    "whatsapp.utility_rate_custom": string;
    "whatsapp.auth_rate_meta": string;
    "whatsapp.auth_rate_custom": string;
    "whatsapp.template_rate_inr": string;
}

export default function AdminPricingPage() {
    const [config, setConfig] = useState<PricingConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const [selectedTenant, setSelectedTenant] = useState<{ id: string, name: string } | null>(null);
    const [tenantSearch, setTenantSearch] = useState('');
    const [tenants, setTenants] = useState<{ id: string, name: string }[]>([]);
    const [searchingTenants, setSearchingTenants] = useState(false);
    const [showTenantDropdown, setShowTenantDropdown] = useState(false);

    const fetchPricing = async (tenantId?: string) => {
        setLoading(true);
        try {
            const url = tenantId
                ? `/api/v1/admin/billing/pricing?tenantId=${tenantId}`
                : '/api/v1/admin/billing/pricing';
            const res = await fetch(url, { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch pricing');
            const data = await res.json();
            setConfig(data);
        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', message: 'Failed to load pricing configuration' });
        } finally {
            setLoading(false);
        }
    };

    const searchTenants = async (query: string) => {
        if (query.length < 2) {
            setTenants([]);
            return;
        }
        setSearchingTenants(true);
        try {
            const res = await fetch(`/api/v1/admin/tenants?search=${query}&limit=5`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setTenants(data.data || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSearchingTenants(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const tenantSelector = document.getElementById('tenant-selector');
            if (tenantSelector && !tenantSelector.contains(event.target as Node)) {
                setShowTenantDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        fetchPricing(selectedTenant?.id);
    }, [selectedTenant?.id]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (tenantSearch) searchTenants(tenantSearch);
        }, 300);
        return () => clearTimeout(timer);
    }, [tenantSearch]);

    const handleUpdate = async () => {
        if (!config) return;
        setSaving(true);
        setStatus(null);
        try {
            const url = selectedTenant?.id
                ? `/api/v1/admin/billing/pricing?tenantId=${selectedTenant.id}`
                : '/api/v1/admin/billing/pricing';
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(config)
            });

            if (!res.ok) throw new Error('Update failed');

            setStatus({ type: 'success', message: `${selectedTenant ? 'Tenant' : 'Global'} pricing updated successfully!` });
            setTimeout(() => setStatus(null), 3000);
        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', message: 'Failed to save changes' });
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        if (!selectedTenant) return;
        if (!confirm(`Are you sure you want to reset pricing for ${selectedTenant.name} to global defaults?`)) return;

        setSaving(true);
        try {
            const res = await fetch(`/api/v1/admin/billing/pricing?tenantId=${selectedTenant.id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!res.ok) throw new Error('Reset failed');

            setStatus({ type: 'success', message: 'Tenant pricing reset to global defaults' });
            fetchPricing(selectedTenant.id);
            setTimeout(() => setStatus(null), 3000);
        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', message: 'Failed to reset pricing' });
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (key: keyof PricingConfig, value: string) => {
        if (config) {
            setConfig({ ...config, [key]: value });
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-500 font-medium font-[Inter]">Loading pricing matrix...</p>
            </div>
        );
    }

    const categories = [
        {
            id: 'marketing',
            name: 'Marketing Templates',
            icon: Zap,
            color: 'blue',
            metaKey: 'whatsapp.marketing_rate_meta',
            customKey: 'whatsapp.marketing_rate_custom',
            description: 'Highest reach messages including promotions and newsletters.'
        },
        {
            id: 'utility',
            name: 'Utility Templates',
            icon: MessageSquare,
            color: 'emerald',
            metaKey: 'whatsapp.utility_rate_meta',
            customKey: 'whatsapp.utility_rate_custom',
            description: 'Transactional messages like order updates and alerts.'
        },
        {
            id: 'auth',
            name: 'Authentication Templates',
            icon: ShieldCheck,
            color: 'purple',
            metaKey: 'whatsapp.auth_rate_meta',
            customKey: 'whatsapp.auth_rate_custom',
            description: 'OTP and verification codes for user security.'
        }
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight font-[Outfit]">Template Pricing</h1>
                        {selectedTenant ? (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-100 uppercase tracking-wider">
                                <User className="w-3 h-3" />
                                Tenant Override
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100 uppercase tracking-wider">
                                <Globe className="w-3 h-3" />
                                Global Defaults
                            </div>
                        )}
                    </div>
                    <p className="text-gray-500 font-medium italic">
                        {selectedTenant ? `Customizing rates for ${selectedTenant.name}` : 'Configure fallback margins for the entire platform.'}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Tenant Selector */}
                    <div className="relative" id="tenant-selector">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition-all min-w-[240px]">
                            <Search className="w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search tenant..."
                                value={selectedTenant ? selectedTenant.name : tenantSearch}
                                onChange={(e) => {
                                    if (selectedTenant) {
                                        setSelectedTenant(null);
                                        setTenantSearch('');
                                    } else {
                                        setTenantSearch(e.target.value);
                                        setShowTenantDropdown(true);
                                    }
                                }}
                                onFocus={() => !selectedTenant && setShowTenantDropdown(true)}
                                className="bg-transparent border-none outline-none text-sm font-medium w-full"
                            />
                            {selectedTenant && (
                                <button onClick={() => { setSelectedTenant(null); setTenantSearch(''); }} className="p-1 hover:bg-gray-100 rounded-full">
                                    <X className="w-3 h-3 text-gray-500" />
                                </button>
                            )}
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showTenantDropdown ? 'rotate-180' : ''}`} />
                        </div>

                        {showTenantDropdown && !selectedTenant && (
                            <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="max-h-60 overflow-y-auto p-2 space-y-1">
                                    <button
                                        onClick={() => { setSelectedTenant(null); setShowTenantDropdown(false); }}
                                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-blue-50 rounded-xl transition-colors text-left group"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                <Globe className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-700 group-hover:text-blue-700">Global Defaults</span>
                                        </div>
                                        {!selectedTenant && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                                    </button>

                                    <div className="h-px bg-gray-50 my-1 mx-2" />

                                    {searchingTenants ? (
                                        <div className="p-4 text-center">
                                            <Loader2 className="w-5 h-5 animate-spin text-gray-400 mx-auto" />
                                        </div>
                                    ) : tenants.length > 0 ? (
                                        tenants.map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => { setSelectedTenant(t); setShowTenantDropdown(false); }}
                                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-xl transition-colors text-left group"
                                            >
                                                <div className="p-1.5 bg-gray-100 text-gray-500 rounded-lg group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-700">{t.name}</span>
                                                    <span className="text-[10px] text-gray-400 font-medium truncate max-w-[150px]">{t.id}</span>
                                                </div>
                                            </button>
                                        ))
                                    ) : tenantSearch.length >= 2 ? (
                                        <div className="p-4 text-center text-gray-400 text-xs font-medium italic">No tenants found</div>
                                    ) : (
                                        <div className="p-4 text-center text-gray-400 text-[10px] font-bold uppercase tracking-wider">Type to find tenant...</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {selectedTenant && (
                        <button
                            onClick={handleReset}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl font-bold transition-all disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
                            Reset to Global
                        </button>
                    )}

                    <div className="h-8 w-px bg-gray-200 mx-1 hidden md:block" />

                    <div className="flex items-center gap-3">
                        {status && (
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold animate-in zoom-in-95 duration-200 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                                }`}>
                                {status.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                {status.message}
                            </div>
                        )}
                        <button
                            onClick={handleUpdate}
                            disabled={saving}
                            className={`flex items-center gap-2 px-6 py-2.5 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50 ${selectedTenant
                                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'
                                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                                }`}
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {selectedTenant ? 'Save Override' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Pricing Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {categories.map((cat) => (
                    <div key={cat.id} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col group hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-500 relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${cat.color === 'blue' ? 'from-blue-400 to-blue-600' :
                            cat.color === 'emerald' ? 'from-emerald-400 to-emerald-600' :
                                'from-purple-400 to-purple-600'
                            }`} />

                        <div className="flex items-center gap-4 mb-6">
                            <div className={`p-3 rounded-2xl ${cat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                                cat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                                    'bg-purple-50 text-purple-600'
                                } group-hover:scale-110 transition-transform duration-500`}>
                                <cat.icon className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg">{cat.name}</h3>
                        </div>

                        <p className="text-gray-500 text-sm mb-8 leading-relaxed font-medium">{cat.description}</p>

                        <div className="space-y-6 mt-auto">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Meta Price (Base)</label>
                                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold">Cost</span>
                                </div>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={config?.[cat.metaKey as keyof PricingConfig] || ''}
                                        onChange={(e) => handleChange(cat.metaKey as keyof PricingConfig, e.target.value)}
                                        className="w-full pl-8 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-gray-200 outline-none transition-all font-bold text-gray-700"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-center -my-2 opacity-30">
                                <ArrowRight className="w-5 h-5 transform rotate-90" />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-xs font-bold text-blue-500 uppercase tracking-widest">Our Price (Selling)</label>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${cat.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                                        cat.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                                            'bg-purple-100 text-purple-700'
                                        }`}>Margin</span>
                                </div>
                                <div className="relative">
                                    <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold ${cat.color === 'blue' ? 'text-blue-600' :
                                        cat.color === 'emerald' ? 'text-emerald-600' :
                                            'text-purple-600'
                                        }`}>₹</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={config?.[cat.customKey as keyof PricingConfig] || ''}
                                        onChange={(e) => handleChange(cat.customKey as keyof PricingConfig, e.target.value)}
                                        className={`w-full pl-8 pr-4 py-4 border-2 rounded-2xl focus:bg-white outline-none transition-all font-extrabold text-xl ${cat.color === 'blue' ? 'bg-blue-50/30 border-blue-100 text-blue-700 focus:border-blue-400' :
                                            cat.color === 'emerald' ? 'bg-emerald-50/30 border-emerald-100 text-emerald-700 focus:border-emerald-400' :
                                                'bg-purple-50/30 border-purple-100 text-purple-700 focus:border-purple-400'
                                            }`}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Global Fallback */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                    <Smartphone className="w-32 h-32 text-white" />
                </div>

                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-white/10 rounded-xl">
                                <AlertCircle className="w-5 h-5 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Global Fallback Rate</h3>
                        </div>
                        <p className="text-gray-400 font-medium leading-relaxed">
                            This rate is applied to any template message where the category cannot be resolved (e.g. legacy templates).
                            We recommend setting this to your highest safety margin.
                        </p>
                    </div>

                    <div className="w-full md:w-64">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2 block ml-1 text-center">Safety Delta Price</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 font-bold text-lg">₹</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={config?.["whatsapp.template_rate_inr"] || ''}
                                    onChange={(e) => handleChange("whatsapp.template_rate_inr", e.target.value)}
                                    className="w-full pl-10 pr-4 py-4 bg-white/10 border border-white/10 rounded-xl focus:bg-white/20 focus:border-blue-500 outline-none transition-all font-black text-2xl text-white text-center"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hint Box */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 flex gap-4">
                <div className="p-2 bg-blue-100 rounded-xl h-fit">
                    <Info className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-sm">
                    <p className="font-bold text-blue-900 mb-1 text-base">Audit Trail Protection</p>
                    <p className="text-blue-700 leading-relaxed font-medium">
                        All pricing changes are logged with an audit trail showing the administrator's ID and the timestamp.
                        New rates take effect immediately for all subsequent template messages sent through the platform.
                    </p>
                </div>
            </div>
        </div>
    );
}
