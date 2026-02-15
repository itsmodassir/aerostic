'use client';

import { useState, useEffect } from 'react';
import {
    Users2, Plus, Search, Shield, CreditCard,
    ExternalLink, MoreVertical, ArrowUpRight, Filter,
    CheckCircle, AlertTriangle
} from 'lucide-react';
import { clsx } from 'clsx';

export default function ResellersPage() {
    const [resellers, setResellers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showOnboardModal, setShowOnboardModal] = useState(false);
    const [plans, setPlans] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState<any>(null);

    const [onboardForm, setOnboardForm] = useState({
        name: '',
        email: '',
        slug: '',
        plan: 'Platinum Partner',
        planId: '',
        initialCredits: 5000,
        maxUsers: 10,
        monthlyMessageLimit: 1000
    });
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', msg: string, data?: any } | null>(null);
    const [selectedReseller, setSelectedReseller] = useState<any>(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [savingLimits, setSavingLimits] = useState(false);

    useEffect(() => {
        fetchResellers();
        fetchPlans();
        fetchStats();
    }, []);

    const fetchResellers = async () => {
        try {
            const res = await fetch('/api/v1/admin/tenants?type=reseller', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setResellers(data);
            }
        } catch (error) {
            console.error('Failed to fetch resellers:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPlans = async () => {
        try {
            const res = await fetch('/api/v1/billing/plans', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setPlans(data.filter((p: any) => p.isPublic || p.name.toLowerCase().includes('partner')));
            }
        } catch (error) {
            console.error('Failed to fetch plans:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/v1/admin/stats', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setStats(data.resellerStats);
            }
        } catch (error) {
            console.error('Failed to fetch reseller stats:', error);
        }
    };

    const handleDeploy = async () => {
        if (!onboardForm.name || !onboardForm.email) {
            setFeedback({ type: 'error', msg: 'Please provide company name and email' });
            return;
        }

        try {
            setSubmitting(true);
            setFeedback(null);
            const res = await fetch('/api/v1/admin/resellers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(onboardForm),
                credentials: 'include'
            });

            if (res.ok) {
                const data = await res.json();
                setFeedback({
                    type: 'success',
                    msg: 'Partner instance deployed successfully!',
                    data: { password: data.generatedPassword, email: onboardForm.email }
                });
                fetchResellers();
                fetchStats();
                // Don't close immediately if we have a password to show
            } else {
                const err = await res.json();
                throw new Error(err.message || 'Deployment failed');
            }
        } catch (error: any) {
            setFeedback({ type: 'error', msg: error.message });
        } finally {
            setSubmitting(false);
        }
    };

    const handleRedirect = (slug: string) => {
        const isProduction = window.location.hostname !== 'localhost';
        const url = isProduction
            ? `https://${slug}.aerostic.com/dashboard`
            : `http://${slug}.localhost:3000/dashboard`;
        window.open(url, '_blank');
    };

    const handleImpersonate = async (tenantId: string) => {
        try {
            const res = await fetch(`/api/v1/admin/tenants/${tenantId}/impersonate`, {
                method: 'POST',
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                window.location.href = data.redirectUrl || `/dashboard/${data.workspaceId}`;
            }
        } catch (error) {
            console.error('Failed to impersonate:', error);
        }
    };

    const handleUpdateLimits = async (id: string, updates: any) => {
        setSavingLimits(true);
        try {
            const res = await fetch(`/api/v1/admin/resellers/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
                credentials: 'include'
            });
            if (res.ok) {
                fetchResellers();
                setFeedback({ type: 'success', msg: 'Partner details updated successfully' });
                setTimeout(() => setFeedback(null), 3000);
                setShowProfileModal(false);
            }
        } catch (error) {
            console.error('Failed to update reseller:', error);
        } finally {
            setSavingLimits(false);
        }
    };

    const filteredResellers = resellers.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Reseller Partners</h1>
                    <p className="text-gray-500 mt-1 text-sm md:text-base">
                        Manage your white-label ecosystem and tiered credit distribution.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => window.location.href = '/admin/plans'}
                        className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold shadow-sm"
                    >
                        Manage Partner Plans
                    </button>
                    <button
                        onClick={() => setShowOnboardModal(true)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all font-semibold"
                    >
                        <Plus className="w-5 h-5" />
                        Onboard New Partner
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Resellers', value: stats?.totalResellers || 0, icon: Users2, color: 'blue', trend: '+12%' },
                    { label: 'Sub-tenants', value: stats?.subTenantsCount || 0, icon: Shield, color: 'emerald', trend: '+18%' },
                    { label: 'Credits Allocated', value: (stats?.totalCreditsAllocated / 1000).toFixed(1) + 'K', icon: CreditCard, color: 'purple', trend: '+5.4%' },
                    { label: 'Partner Revenue', value: '₹' + (stats?.partnerRevenue / 100000).toFixed(1) + 'L', icon: CreditCard, color: 'amber', trend: '+22%' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                <ArrowUpRight className="w-3 h-3" />
                                {stat.trend}
                            </div>
                        </div>
                        <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search partners by name or subdomain..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-all shadow-sm">
                    <Filter className="w-5 h-5" />
                    Filters
                </button>
            </div>

            {/* Partner Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b">
                                <th className="px-8 py-5">Partner Profile</th>
                                <th className="px-8 py-5">Tier / Plan</th>
                                <th className="px-8 py-5 text-center">Managed Clients</th>
                                <th className="px-8 py-5 text-center">Credit Balance</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-gray-500 font-medium tracking-wide">Synchronizing partner data...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredResellers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center text-gray-500">
                                        <div className="max-w-xs mx-auto space-y-3">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                                                <Users2 className="w-8 h-8" />
                                            </div>
                                            <p className="font-semibold text-gray-900 text-lg">No resellers found</p>
                                            <p className="text-sm">Start building your partner network by onboarding your first white-label reseller.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredResellers.map((reseller) => (
                                    <tr key={reseller.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-200">
                                                    {reseller.name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-base">{reseller.name}</p>
                                                    <p className="text-xs text-blue-600 font-medium tracking-tight">@{reseller.slug}.aerostic.com</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="inline-flex items-center px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold ring-1 ring-inset ring-indigo-700/10">
                                                <Shield className="w-3 h-3 mr-1.5" />
                                                {reseller.planRelation?.name || reseller.plan || 'Platinum Partner'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className="font-bold text-gray-900">{reseller.subTenants?.length || 0}</span>
                                            <p className="text-[10px] text-gray-400 font-medium">Active Clients</p>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className="font-bold text-purple-600 tracking-tight">{reseller.resellerCredits || 0}</span>
                                            <p className="text-[10px] text-gray-400 font-medium">Available Units</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className={clsx(
                                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                reseller.status === 'active'
                                                    ? "bg-green-50 text-green-700 border-green-200"
                                                    : "bg-amber-50 text-amber-700 border-amber-200"
                                            )}>
                                                <div className={clsx("w-1.5 h-1.5 rounded-full animate-pulse", reseller.status === 'active' ? 'bg-green-600' : 'bg-amber-600')} />
                                                {reseller.status}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleRedirect(reseller.slug)}
                                                    className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-200 transition-all"
                                                    title="Open Portal"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </button>
                                                <div className="relative group/menu">
                                                    <button className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-900 hover:text-white transition-all">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 hidden group-hover/menu:block z-50 animate-in fade-in slide-in-from-top-1">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedReseller(reseller);
                                                                setShowProfileModal(true);
                                                            }}
                                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                        >
                                                            <Users2 className="w-4 h-4 text-gray-400" />
                                                            View Profile
                                                        </button>
                                                        <button
                                                            onClick={() => handleImpersonate(reseller.id)}
                                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                        >
                                                            <Shield className="w-4 h-4 text-gray-400" />
                                                            Impersonate Admin
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedReseller(reseller);
                                                                setShowProfileModal(true);
                                                            }}
                                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                        >
                                                            <CreditCard className="w-4 h-4 text-gray-400" />
                                                            Configure Limits
                                                        </button>
                                                        <div className="h-px bg-gray-100 my-1"></div>
                                                        <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium">
                                                            Suspend Partner
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Footer */}
                <div className="p-4 bg-gray-50/50 border-t flex items-center justify-between text-xs font-medium text-gray-500">
                    <p>Displaying {filteredResellers.length} partner accounts</p>
                    <div className="flex gap-4">
                        <button className="hover:text-blue-600 transition-colors">Export CSV</button>
                        <button className="hover:text-blue-600 transition-colors">API Logs</button>
                    </div>
                </div>
            </div>

            {/* Partner Profile Modal */}
            {showProfileModal && selectedReseller && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in">
                        <div className="p-8 border-b flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Partner Profile: {selectedReseller.name}</h3>
                                <p className="text-sm text-gray-500">Configure partner limits and platform access</p>
                            </div>
                            <button onClick={() => setShowProfileModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <Plus className="w-6 h-6 rotate-45 text-gray-400" />
                            </button>
                        </div>
                        <div className="p-8 space-y-8 max-height-[70vh] overflow-y-auto">
                            {/* Metrics */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Portfolio Size</p>
                                    <p className="text-2xl font-bold text-gray-900">{selectedReseller.subTenants?.length || 0} Entities</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Credit Pool</p>
                                    <p className="text-2xl font-bold text-indigo-600">{selectedReseller.resellerCredits || 0} Units</p>
                                </div>
                            </div>

                            {/* Limits Configuration */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest border-l-4 border-blue-600 pl-3">Usage Limits</h4>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">Monthly Message Limit</label>
                                        <input
                                            type="number"
                                            defaultValue={selectedReseller.monthlyMessageLimit || 1000}
                                            onChange={(e) => selectedReseller.newMonthlyLimit = parseInt(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-600/20 font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">AI Credits (Monthly)</label>
                                        <input
                                            type="number"
                                            defaultValue={selectedReseller.aiCredits || 100}
                                            onChange={(e) => selectedReseller.newAiCredits = parseInt(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-600/20 font-bold"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Feature Toggles */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest border-l-4 border-emerald-600 pl-3">Partner Configuration</h4>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">Partner Subdomain</label>
                                        <input
                                            type="text"
                                            defaultValue={selectedReseller.slug}
                                            onChange={(e) => selectedReseller.newSlug = e.target.value}
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-600/20 font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">Partner Plan</label>
                                        <input
                                            type="text"
                                            defaultValue={selectedReseller.plan}
                                            onChange={(e) => selectedReseller.newPlan = e.target.value}
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-600/20 font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">Max User Accounts</label>
                                        <input
                                            type="number"
                                            defaultValue={selectedReseller.maxUsers || 10}
                                            onChange={(e) => selectedReseller.newMaxUsers = parseInt(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-600/20 font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">Status</label>
                                        <select
                                            defaultValue={selectedReseller.status}
                                            onChange={(e) => selectedReseller.newStatus = e.target.value}
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-600/20 font-bold"
                                        >
                                            <option value="active">Active</option>
                                            <option value="suspended">Suspended</option>
                                        </select>
                                    </div>
                                </div>
                                <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest border-l-4 border-emerald-600 pl-3 mt-8">Platform Access</h4>
                                <div className="space-y-3">
                                    {[
                                        { id: 'api', label: 'API Access', desc: 'Allow partner to use developer endpoints', enabled: selectedReseller.apiAccessEnabled },
                                        { id: 'whitelabel', label: 'White-Label Branding', desc: 'Custom logo, colors, and subdomain', enabled: true },
                                        { id: 'analytics', label: 'Advanced Analytics', desc: 'Real-time message tracing and reporting', enabled: true },
                                    ].map((feat) => (
                                        <div key={feat.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{feat.label}</p>
                                                <p className="text-xs text-gray-500">{feat.desc}</p>
                                            </div>
                                            <div className={clsx(
                                                "w-12 h-6 rounded-full p-1 transition-colors cursor-pointer",
                                                feat.enabled ? "bg-blue-600" : "bg-gray-200"
                                            )}>
                                                <div className={clsx(
                                                    "w-4 h-4 bg-white rounded-full transition-transform",
                                                    feat.enabled ? "translate-x-6" : "translate-x-0"
                                                )} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-8 bg-gray-50 flex gap-4">
                            <button
                                onClick={() => setShowProfileModal(false)}
                                className="px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold text-sm"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => handleUpdateLimits(selectedReseller.id, {
                                    name: selectedReseller.newName,
                                    slug: selectedReseller.newSlug,
                                    plan: selectedReseller.newPlan,
                                    maxUsers: selectedReseller.newMaxUsers,
                                    monthlyMessageLimit: selectedReseller.newMonthlyLimit,
                                    aiCredits: selectedReseller.newAiCredits,
                                    status: selectedReseller.newStatus
                                })}
                                disabled={savingLimits}
                                className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all flex items-center justify-center gap-2"
                            >
                                {savingLimits && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                {savingLimits ? 'Saving...' : 'Apply Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Improved Onboard Modal */}
            {showOnboardModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300 ring-1 ring-black/5">
                        <div className="p-10 border-b bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight italic">ONBOARD PARTNER</h3>
                                <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                                    Initiate a new white-label partnership instance. Credentials will be sent automatically.
                                </p>
                            </div>
                            <div className="absolute -right-4 -top-4 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl" />
                        </div>

                        <div className="max-h-[min(700px,80vh)] overflow-y-auto">
                            {feedback && feedback.type === 'success' && feedback.data ? (
                                <div className="p-10 space-y-6">
                                    <div className="p-6 bg-green-50 rounded-[24px] border border-green-100 text-center">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle className="w-8 h-8 text-green-600" />
                                        </div>
                                        <h4 className="text-xl font-bold text-gray-900 mb-2">Partner Onboarded!</h4>
                                        <p className="text-sm text-gray-600 mb-6">Share these temporary credentials with the partner. They must change their password on first login.</p>

                                        <div className="space-y-3 text-left">
                                            <div className="p-4 bg-white rounded-xl border border-green-200">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Login Email</p>
                                                <p className="font-bold text-gray-900">{feedback.data.email}</p>
                                            </div>
                                            <div className="p-4 bg-white rounded-xl border border-green-200 flex justify-between items-center group">
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Generated Password</p>
                                                    <p className="font-mono font-bold text-blue-600">{feedback.data.password}</p>
                                                </div>
                                                <button
                                                    onClick={() => navigator.clipboard.writeText(feedback.data.password)}
                                                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                                                >
                                                    <Plus className="w-4 h-4 rotate-45" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setShowOnboardModal(false);
                                            setFeedback(null);
                                            setOnboardForm({
                                                name: '',
                                                email: '',
                                                slug: '',
                                                plan: 'Platinum Partner',
                                                planId: '',
                                                initialCredits: 5000,
                                                maxUsers: 10,
                                                monthlyMessageLimit: 1000
                                            });
                                        }}
                                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-xs tracking-widest hover:bg-black transition-all"
                                    >
                                        DONE & CLOSE
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {feedback && (
                                        <div className={clsx(
                                            "mx-10 mt-6 p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2",
                                            feedback.type === 'success' ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                                        )}>
                                            {feedback.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                                            <span className="text-sm font-bold tracking-tight">{feedback.msg}</span>
                                        </div>
                                    )}

                                    <div className="p-10 space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2">
                                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Company Entity Name</label>
                                                <input
                                                    type="text"
                                                    value={onboardForm.name}
                                                    onChange={(e) => setOnboardForm({ ...onboardForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') })}
                                                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-600/20 font-medium placeholder:text-gray-300 transition-all italic"
                                                    placeholder="e.g. SKYNET MEDIA GROUP"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Partner Subdomain</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={onboardForm.slug}
                                                        onChange={(e) => setOnboardForm({ ...onboardForm, slug: e.target.value })}
                                                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-600/20 font-bold transition-all"
                                                        placeholder="partner-slug"
                                                    />
                                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">.aerostic.com</span>
                                                </div>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Administrative Email</label>
                                                <input
                                                    type="email"
                                                    value={onboardForm.email}
                                                    onChange={(e) => setOnboardForm({ ...onboardForm, email: e.target.value })}
                                                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-600/20 font-medium placeholder:text-gray-300 transition-all"
                                                    placeholder="admin@partner.com"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Manual Plan Name</label>
                                                <input
                                                    type="text"
                                                    value={onboardForm.plan}
                                                    onChange={(e) => setOnboardForm({ ...onboardForm, plan: e.target.value })}
                                                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-600/20 font-bold transition-all"
                                                    placeholder="e.g. Platinum Partner"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Initial Credits</label>
                                                <input
                                                    type="number"
                                                    value={onboardForm.initialCredits}
                                                    onChange={(e) => setOnboardForm({ ...onboardForm, initialCredits: parseInt(e.target.value) || 0 })}
                                                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-600/20 font-bold transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">User Limit</label>
                                                <input
                                                    type="number"
                                                    value={onboardForm.maxUsers}
                                                    onChange={(e) => setOnboardForm({ ...onboardForm, maxUsers: parseInt(e.target.value) || 1 })}
                                                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-600/20 font-bold transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Message Limit (Monthly)</label>
                                                <input
                                                    type="number"
                                                    value={onboardForm.monthlyMessageLimit}
                                                    onChange={(e) => setOnboardForm({ ...onboardForm, monthlyMessageLimit: parseInt(e.target.value) || 0 })}
                                                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-600/20 font-bold transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-10 bg-gray-50/50 flex gap-4 border-t sticky bottom-0">
                                        <button
                                            onClick={() => setShowOnboardModal(false)}
                                            className="flex-1 px-8 py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl hover:bg-gray-100 transition-all font-black text-xs tracking-widest"
                                            disabled={submitting}
                                        >
                                            ABORT
                                        </button>
                                        <button
                                            onClick={handleDeploy}
                                            disabled={submitting}
                                            className="flex-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:shadow-xl hover:shadow-blue-500/30 transition-all font-black text-xs tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {submitting && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                            {submitting ? 'DEPLOYING...' : 'DEPLOY INSTANCE'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
