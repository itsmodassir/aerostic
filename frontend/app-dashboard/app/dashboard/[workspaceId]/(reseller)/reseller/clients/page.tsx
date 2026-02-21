'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Users2, Plus, Search, Filter, MoreVertical,
    Building2, Mail, CreditCard, ExternalLink,
    Shield, CheckCircle, XCircle, ChevronRight,
    Rocket, Zap, History, DollarSign, ArrowLeft,
    User, Lock, AlertCircle
} from 'lucide-react';
import api from '@/lib/api';

export default function ResellerClientsPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const workspaceId = params?.workspaceId || 'default';
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showOnboardModal, setShowOnboardModal] = useState(searchParams.get('action') === 'new');
    const [showCreditModal, setShowCreditModal] = useState(searchParams.get('action') === 'credits');
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, [workspaceId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [clientsRes, statsRes] = await Promise.all([
                fetch('/api/v1/reseller/clients', { credentials: 'include' }),
                fetch('/api/v1/reseller/stats', { credentials: 'include' })
            ]);

            if (clientsRes.ok) setClients(await clientsRes.json());
            if (statsRes.ok) setStats(await statsRes.json());
        } catch (error) {
            console.error('Failed to fetch clients', error);
        } finally {
            setLoading(false);
        }
    };

    const [onboarding, setOnboarding] = useState(false);
    const [onboardForm, setOnboardForm] = useState({
        name: '',
        ownerName: '',
        ownerEmail: '',
        password: ''
    });

    const handleOnboard = async (e: React.FormEvent) => {
        e.preventDefault();
        setOnboarding(true);
        try {
            const res = await fetch('/api/v1/reseller/client', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(onboardForm)
            });

            if (res.ok) {
                setShowOnboardModal(false);
                fetchData();
                setOnboardForm({ name: '', ownerName: '', ownerEmail: '', password: '' });
            } else {
                const err = await res.json();
                alert(err.message || 'Failed to onboard client');
            }
        } catch (e) {
            alert('A network error occurred');
        } finally {
            setOnboarding(false);
        }
    };

    const [allocating, setAllocating] = useState(false);
    const [creditAmount, setCreditAmount] = useState(0);

    const handleAllocate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClient) return;
        setAllocating(true);
        try {
            const res = await fetch('/api/v1/reseller/allocate-credits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    targetTenantId: selectedClient.id,
                    amount: creditAmount
                })
            });

            if (res.ok) {
                setShowCreditModal(false);
                fetchData();
            } else {
                const err = await res.json();
                alert(err.message || 'Failed to allocate credits');
            }
        } catch (e) {
            alert('A network error occurred');
        } finally {
            setAllocating(false);
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
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link href={`/dashboard/${workspaceId}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Portfolio Management</h1>
                        <p className="text-gray-500 text-sm">You have {clients.length} active clients</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden lg:flex flex-col items-end mr-4">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Available Credits</p>
                        <p className="text-lg font-bold text-purple-600">{stats?.availableCredits?.toLocaleString() || 0}</p>
                    </div>
                    <button
                        onClick={() => setShowOnboardModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all shadow-md active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Onboard Client
                    </button>
                </div>
            </div>

            {/* Client List */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search clients by name, email or slug..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <Filter className="w-4 h-4" />
                            Filter
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Client Detail</th>
                                <th className="px-6 py-4">Credits</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {clients.map((client) => (
                                <tr key={client.id} className="hover:bg-gray-50/80 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
                                                {client.name[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 leading-tight">{client.name}</p>
                                                <p className="text-xs text-gray-500 mt-1">{client.slug}.aimstore.in</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-900">{(client.resellerCredits || 0).toLocaleString()}</span>
                                            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">Available</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${client.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${client.status === 'active' ? 'bg-green-500' : 'bg-amber-500'}`} />
                                            {client.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(client.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedClient(client);
                                                    setShowCreditModal(true);
                                                }}
                                                className="p-2 text- purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                title="Allocate Credits"
                                            >
                                                <Zap className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {clients.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                <Building2 className="w-8 h-8 text-gray-300" />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">No Clients Yet</h3>
                                            <p className="text-gray-500 text-sm max-w-xs mx-auto mb-6">Start growing your portfolio by onboarding your first client today.</p>
                                            <button
                                                onClick={() => setShowOnboardModal(true)}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
                                            >
                                                Add First Client
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Onboard Modal */}
            {showOnboardModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="relative h-24 bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center px-8">
                            <h2 className="text-2xl font-bold text-white">Setup New Workspace</h2>
                            <button onClick={() => setShowOnboardModal(false)} className="absolute top-6 right-6 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleOnboard} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Business Name</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            required
                                            type="text"
                                            value={onboardForm.name}
                                            onChange={(e) => setOnboardForm({ ...onboardForm, name: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Acme Corp"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Admin Owner Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            required
                                            type="text"
                                            value={onboardForm.ownerName}
                                            onChange={(e) => setOnboardForm({ ...onboardForm, ownerName: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-bold text-gray-700">Owner Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            required
                                            type="email"
                                            value={onboardForm.ownerEmail}
                                            onChange={(e) => setOnboardForm({ ...onboardForm, ownerEmail: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-bold text-gray-700">Initial Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="password"
                                            value={onboardForm.password}
                                            onChange={(e) => setOnboardForm({ ...onboardForm, password: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400">Leave blank to use default secure password.</p>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowOnboardModal(false)}
                                    className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={onboarding}
                                    className="flex-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                >
                                    {onboarding ? 'Creating Architecture...' : 'Setup Workspace Now'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Credit Modal */}
            {showCreditModal && selectedClient && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="p-6 bg-purple-600 text-white flex items-center justify-between">
                            <h2 className="text-xl font-bold">Allocate Credits</h2>
                            <Zap className="w-6 h-6 text-purple-200" />
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 mb-6">
                                <p className="text-xs text-purple-600 font-bold uppercase tracking-wider mb-1">Target Client</p>
                                <p className="text-lg font-bold text-gray-900">{selectedClient.name}</p>
                                <p className="text-xs text-gray-500 mt-1">Current Balance: {(selectedClient.resellerCredits || 0).toLocaleString()}</p>
                            </div>

                            <div className="space-y-3 font-semibold text-gray-700">
                                <label className="text-sm">Amount to Allocate</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="number"
                                        value={creditAmount}
                                        onChange={(e) => setCreditAmount(parseInt(e.target.value) || 0)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="1000"
                                    />
                                </div>
                                <p className="text-xs text-gray-400">Your available balance: {stats?.availableCredits?.toLocaleString()}</p>
                            </div>

                            <div className="flex gap-3 pt-6">
                                <button onClick={() => setShowCreditModal(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors">Cancel</button>
                                <button
                                    onClick={handleAllocate}
                                    disabled={allocating || creditAmount <= 0 || creditAmount > stats?.availableCredits}
                                    className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 shadow-md active:scale-95 disabled:opacity-50"
                                >
                                    {allocating ? 'Processing...' : 'Allocate Credits'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
