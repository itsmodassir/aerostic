'use client';

import { useState, useEffect } from 'react';
import {
    Users2, Plus, Search, Shield, CreditCard,
    ExternalLink, MoreVertical, CheckCircle2, AlertCircle
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '@/hooks/useAuth';

export default function ResellersPage() {
    const [resellers, setResellers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showOnboardModal, setShowOnboardModal] = useState(false);
    const [plans, setPlans] = useState<any[]>([]);

    useEffect(() => {
        fetchResellers();
        fetchPlans();
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
            const res = await fetch('/api/v1/billing/plans?type=reseller', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setPlans(data);
            }
        } catch (error) {
            console.error('Failed to fetch plans:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Reseller Management</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage your white-label partners and their credit allocations.
                    </p>
                </div>
                <button
                    onClick={() => setShowOnboardModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Onboard Reseller
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                            <Users2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Resellers</p>
                            <p className="text-2xl font-bold text-gray-900">{resellers.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Active Clients</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {resellers.reduce((acc, r) => acc + (r.subTenants?.length || 0), 0)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Platform Credits</p>
                            <p className="text-2xl font-bold text-gray-900">Infinite</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Resellers Table */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="p-4 border-b flex items-center justify-between bg-gray-50/50">
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search resellers..."
                            className="w-full pl-9 pr-4 py-2 bg-white border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">
                                <th className="px-6 py-4">Partner</th>
                                <th className="px-6 py-4">Plan</th>
                                <th className="px-6 py-4">Clients</th>
                                <th className="px-6 py-4">Credits</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                                        Loading resellers...
                                    </td>
                                </tr>
                            ) : resellers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                        No resellers found. Onboard your first partner to get started.
                                    </td>
                                </tr>
                            ) : (
                                resellers.map((reseller) => (
                                    <tr key={reseller.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold">
                                                    {reseller.name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{reseller.name}</p>
                                                    <p className="text-xs text-muted-foreground">{reseller.slug}.aerostic.com</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            <span className="capitalize">{reseller.planRelation?.name || reseller.plan}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Users2 className="w-4 h-4 text-muted-foreground" />
                                                <span>{reseller.subTenants?.length || 0}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="w-4 h-4 text-muted-foreground" />
                                                <span className="font-medium">{reseller.resellerCredits || 0}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={clsx(
                                                "px-2.5 py-1 rounded-full text-xs font-medium border",
                                                reseller.status === 'active'
                                                    ? "bg-green-50 text-green-700 border-green-100"
                                                    : "bg-amber-50 text-amber-700 border-amber-100"
                                            )}>
                                                {reseller.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button className="p-2 hover:bg-white border rounded-lg transition-colors text-muted-foreground hover:text-primary">
                                                    <ExternalLink className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 hover:bg-white border rounded-lg transition-colors text-muted-foreground hover:text-gray-900">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Onboard Modal Placeholder */}
            {showOnboardModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-6 border-b bg-gray-50/50">
                            <h3 className="text-xl font-bold text-gray-900">Onboard New Reseller</h3>
                            <p className="text-sm text-muted-foreground mt-1">Create a new partner account and assign a plan.</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                <input type="text" className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. Digital Agents Co." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Owner Email</label>
                                <input type="email" className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary/20" placeholder="owner@company.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reseller Plan</label>
                                <select className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary/20">
                                    {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="p-6 border-t bg-gray-50/50 flex gap-3">
                            <button
                                onClick={() => setShowOnboardModal(false)}
                                className="flex-1 px-4 py-2 border rounded-lg hover:bg-white transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium">
                                Create Partner
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
