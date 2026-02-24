'use client';

import { useEffect, useState } from 'react';
import {
    Wallet, Search, Filter, Plus, Loader2, X, RefreshCw,
    TrendingUp, CreditCard, ArrowUpRight, DollarSign,
    MoreVertical, ChevronDown
} from 'lucide-react';

interface WalletBalance {
    type: string;
    balance: number;
}

interface TenantWallet {
    id: string;
    tenantId: string;
    tenantName: string;
    status: string;
    balances: WalletBalance[];
}

export default function AdminWalletsPage() {
    const [wallets, setWallets] = useState<TenantWallet[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    // Funding Modal State
    const [fundTenant, setFundTenant] = useState<{ id: string, name: string } | null>(null);
    const [amountToAdd, setAmountToAdd] = useState('');
    const [fundDescription, setFundDescription] = useState('');
    const [isFunding, setIsFunding] = useState(false);

    const fetchWallets = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/v1/admin/billing/wallets', {
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to fetch wallets');
            const data = await res.json();
            setWallets(data.wallets || []);
        } catch (error) {
            console.error('Failed to fetch wallet data', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchWallets();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchWallets();
    };

    const handleAddFunds = async () => {
        if (!fundTenant || !amountToAdd) return;
        setIsFunding(true);
        try {
            const res = await fetch(`/api/v1/admin/billing/wallets/${fundTenant.id}/fund`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    amount: parseFloat(amountToAdd),
                    description: fundDescription
                })
            });

            if (!res.ok) throw new Error('Fund transfer failed');

            // Success!
            setFundTenant(null);
            setAmountToAdd('');
            setFundDescription('');
            fetchWallets(); // Refresh list to see new balance
        } catch (e) {
            console.error(e);
            alert('Failed to add funds');
        } finally {
            setIsFunding(false);
        }
    };

    const filteredWallets = wallets.filter(w =>
        w.tenantName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getMainBalance = (wallet: TenantWallet) => {
        return wallet.balances.find(b => b.type === 'main_balance')?.balance || 0;
    };

    const getBonusBalance = (wallet: TenantWallet) => {
        return wallet.balances.find(b => b.type === 'bonus_credits')?.balance || 0;
    };

    const getAiCredits = (wallet: TenantWallet) => {
        return wallet.balances.find(b => b.type === 'ai_credits')?.balance || 0;
    };

    if (loading && !refreshing) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-500 font-medium font-[Inter]">Loading wallet data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight font-[Outfit]">Tenant Wallets</h1>
                    <p className="text-gray-500 mt-1 font-medium">Manage and audit credit balances across all platform tenants.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all hover:shadow-md disabled:opacity-50"
                    >
                        <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search tenant wallets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl w-64 focus:ring-2 focus:ring-blue-500 outline-none transition-all hover:border-blue-400 font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <DollarSign className="w-16 h-16 text-blue-600" />
                    </div>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Platform Balance</p>
                    <div className="mt-2 flex items-baseline gap-2">
                        <p className="text-3xl font-extrabold text-gray-900 font-[Outfit]">
                            ₹{wallets.reduce((acc, w) => acc + getMainBalance(w), 0).toLocaleString()}
                        </p>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-green-600 font-semibold text-sm">
                        <TrendingUp className="w-4 h-4" />
                        <span>Active Reserves</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <CreditCard className="w-16 h-16 text-purple-600" />
                    </div>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Bonus Credits</p>
                    <div className="mt-2 flex items-baseline gap-2">
                        <p className="text-3xl font-extrabold text-gray-900 font-[Outfit]">
                            ₹{wallets.reduce((acc, w) => acc + getBonusBalance(w), 0).toLocaleString()}
                        </p>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-purple-600 font-semibold text-sm">
                        <ArrowUpRight className="w-4 h-4" />
                        <span>Marketing Allocation</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <RefreshCw className="w-16 h-16 text-emerald-600" />
                    </div>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total AI Credits</p>
                    <div className="mt-2 flex items-baseline gap-2">
                        <p className="text-3xl font-extrabold text-gray-900 font-[Outfit]">
                            {wallets.reduce((acc, w) => acc + getAiCredits(w), 0).toLocaleString()}
                        </p>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-emerald-600 font-semibold text-sm">
                        <TrendingUp className="w-4 h-4" />
                        <span>Computational Units</span>
                    </div>
                </div>
            </div>

            {/* Wallets Table */}
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-50 bg-gray-50/30">
                                <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-widest font-[Outfit]">Tenant & Status</th>
                                <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-widest font-[Outfit]">Main Balance</th>
                                <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-widest font-[Outfit]">Bonus Credits</th>
                                <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-widest font-[Outfit]">AI Credits</th>
                                <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-widest font-[Outfit] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredWallets.length > 0 ? filteredWallets.map((wallet) => (
                                <tr key={wallet.id} className="group hover:bg-gray-50/50 transition-all duration-300">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center font-bold text-gray-600 group-hover:from-blue-600 group-hover:to-purple-600 group-hover:text-white transition-all duration-500 shadow-sm">
                                                {wallet.tenantName.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{wallet.tenantName}</p>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <span className={`w-2 h-2 rounded-full ${wallet.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                                                    <span className="text-xs font-bold text-gray-400 uppercase">{wallet.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-xl font-extrabold text-gray-900 font-[Outfit]">₹{getMainBalance(wallet).toLocaleString()}</span>
                                            <span className="text-xs text-gray-400 font-bold uppercase mt-1">Currency: INR</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="bg-purple-50 rounded-xl px-4 py-2 inline-flex flex-col">
                                            <span className="text-lg font-bold text-purple-700 font-[Outfit]">₹{getBonusBalance(wallet).toLocaleString()}</span>
                                            <span className="text-[10px] text-purple-400 font-bold uppercase">Promotional</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="bg-emerald-50 rounded-xl px-4 py-2 inline-flex flex-col">
                                            <span className="text-lg font-bold text-emerald-700 font-[Outfit]">{getAiCredits(wallet).toLocaleString()} pts</span>
                                            <span className="text-[10px] text-emerald-400 font-bold uppercase">Available Units</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setFundTenant({ id: wallet.tenantId, name: wallet.tenantName })}
                                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-bold hover:scale-105 transition-all shadow-lg shadow-green-200 active:scale-95"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Add Funds
                                            </button>
                                            <button className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mb-4">
                                                <Search className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <p className="text-gray-900 font-bold text-xl">No tenant wallets found</p>
                                            <p className="text-gray-500 font-medium">Try adjusting your search query.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Funds Modal */}
            {fundTenant && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
                        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h3 className="text-2xl font-extrabold text-gray-900 font-[Outfit]">Add Wallet Funds</h3>
                                <p className="text-sm text-gray-500 mt-1 font-medium">Crediting <span className="text-blue-600 font-bold">@{fundTenant.name}</span></p>
                            </div>
                            <button
                                onClick={() => setFundTenant(null)}
                                className="p-2.5 hover:bg-white rounded-2xl text-gray-400 hover:text-gray-600 transition-all shadow-sm border border-transparent hover:border-gray-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-2.5">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-widest ml-1">Amount (INR)</label>
                                <div className="relative group">
                                    <span className="absolute left-4.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg group-focus-within:text-green-600 transition-colors">₹</span>
                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={amountToAdd}
                                        onChange={(e) => setAmountToAdd(e.target.value)}
                                        className="w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-[1.25rem] focus:bg-white focus:border-green-500 outline-none transition-all font-bold text-gray-800 text-xl"
                                        placeholder="1,000"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-widest ml-1">Description</label>
                                <textarea
                                    rows={3}
                                    value={fundDescription}
                                    onChange={(e) => setFundDescription(e.target.value)}
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-[1.25rem] focus:bg-white focus:border-green-500 outline-none transition-all font-medium text-gray-800"
                                    placeholder="e.g. Official recharge for operational credits"
                                />
                            </div>

                            <div className="bg-blue-50/50 rounded-[1.25rem] p-4 flex gap-3 border border-blue-100">
                                <div className="p-2 bg-blue-100 rounded-xl h-fit">
                                    <Plus className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="text-sm">
                                    <p className="font-bold text-blue-900">Immediate Allocation</p>
                                    <p className="text-blue-700 mt-0.5 leading-relaxed">This amount will be instantly available in the tenant's Main Balance for all transactional use.</p>
                                </div>
                            </div>
                        </div>

                        <div className="px-8 py-6 bg-gray-50/80 border-t border-gray-100 flex gap-4">
                            <button
                                onClick={() => setFundTenant(null)}
                                className="flex-1 px-6 py-4 text-gray-600 font-bold hover:bg-gray-100 rounded-[1.25rem] transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddFunds}
                                disabled={isFunding || !amountToAdd || parseFloat(amountToAdd) <= 0}
                                className="flex-1 px-6 py-4 bg-gradient-to-br from-green-500 to-emerald-600 text-white font-extrabold rounded-[1.25rem] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-green-200 transition-all flex items-center justify-center gap-3"
                            >
                                {isFunding ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <span>Credit Funds</span>
                                        <ArrowUpRight className="w-5 h-5 opacity-70" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
