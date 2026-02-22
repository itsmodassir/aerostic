'use client';

import { useEffect, useState } from 'react';
import {
    CreditCard, ArrowUpRight, ArrowDownLeft,
    History, Plus, Loader2, AlertCircle,
    CheckCircle2, Clock, Wallet as WalletIcon
} from 'lucide-react';
import api from '@/lib/api';
import { useParams } from 'next/navigation';
import { clsx } from 'clsx';

interface Transaction {
    id: string;
    type: 'credit' | 'debit';
    amount: string | number;
    balanceAfter: string | number;
    description: string;
    referenceType: string;
    createdAt: string;
}

export default function WalletPage() {
    const params = useParams();
    const workspaceId = params?.workspaceId || 'default';
    const [balance, setBalance] = useState<number>(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [recharging, setRecharging] = useState(false);
    const [rechargeAmount, setRechargeAmount] = useState<number>(1000);
    const [showRechargeModal, setShowRechargeModal] = useState(false);

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        try {
            const [balanceRes, txRes] = await Promise.all([
                api.get('/billing/wallet/balance'),
                api.get('/billing/wallet/transactions?limit=50')
            ]);
            setBalance(Number(balanceRes.data.balance));
            setTransactions(txRes.data.transactions);
        } catch (error) {
            console.error('Failed to fetch wallet data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRecharge = async () => {
        setRecharging(true);
        try {
            const res = await api.post('/billing/wallet/recharge', {
                amount: rechargeAmount,
                description: `Wallet recharge for ${workspaceId}`
            });
            if (res.data && res.data.short_url) {
                window.location.href = res.data.short_url;
            } else {
                alert('Failed to initiate recharge. Please try again.');
            }
        } catch (error) {
            console.error('Recharge failed', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setRecharging(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[600px]">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
                    <p className="text-gray-500 mt-2">Manage your credits and transaction history</p>
                </div>
                <button
                    onClick={() => setShowRechargeModal(true)}
                    className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                >
                    <Plus className="w-5 h-5" /> Recharge Wallet
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Balance Card */}
                <div className="md:col-span-2 bg-gradient-to-br from-primary to-purple-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6 opacity-80">
                            <WalletIcon className="w-6 h-6" />
                            <span className="text-sm font-medium uppercase tracking-wider">Available Balance</span>
                        </div>
                        <div className="text-5xl font-black mb-8">
                            ₹{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 flex-1 border border-white/10">
                                <p className="text-xs opacity-70 mb-1">Status</p>
                                <p className="font-bold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Active</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 flex-1 border border-white/10">
                                <p className="text-xs opacity-70 mb-1">Currency</p>
                                <p className="font-bold">INR</p>
                            </div>
                        </div>
                    </div>
                    {/* Decorative Circles */}
                    <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-purple-400/20 rounded-full blur-3xl" />
                </div>

                {/* Quick Info */}
                <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-500" /> Need to know
                    </h3>
                    <ul className="space-y-4">
                        <li className="text-sm text-gray-600 flex gap-3">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0" />
                            Credits are used for message overages and AI processing.
                        </li>
                        <li className="text-sm text-gray-600 flex gap-3">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0" />
                            Minimum recharge amount is ₹500.
                        </li>
                        <li className="text-sm text-gray-600 flex gap-3">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0" />
                            All transactions are encrypted and secured by Razorpay.
                        </li>
                    </ul>
                </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <History className="w-5 h-5 text-gray-400" /> Transaction History
                    </h3>
                </div>
                {transactions.length === 0 ? (
                    <div className="p-20 text-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <History className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-gray-500">No transactions recorded yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50/50 text-gray-500 font-semibold border-b border-gray-100">
                                <tr>
                                    <th className="px-8 py-4">Transaction Details</th>
                                    <th className="px-8 py-4">Status</th>
                                    <th className="px-8 py-4 text-right">Amount</th>
                                    <th className="px-8 py-4 text-right">Balance After</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className={clsx(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                                    tx.type === 'credit' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                                                )}>
                                                    {tx.type === 'credit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{tx.description || tx.referenceType}</p>
                                                    <p className="text-xs text-gray-500 font-medium">{new Date(tx.createdAt).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wider">Completed</span>
                                        </td>
                                        <td className={clsx(
                                            "px-8 py-5 text-right font-black text-base",
                                            tx.type === 'credit' ? "text-green-600" : "text-red-500"
                                        )}>
                                            {tx.type === 'credit' ? '+' : '-'}₹{Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-8 py-5 text-right font-bold text-gray-600">
                                            ₹{Number(tx.balanceAfter).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Recharge Modal */}
            {showRechargeModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowRechargeModal(false)} />
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-8 pb-4">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Recharge Wallet</h2>
                            <p className="text-gray-500 text-sm">Add credits to your account for uninterrupted service.</p>
                        </div>

                        <div className="p-8 pt-4 space-y-6">
                            <div className="grid grid-cols-2 gap-3">
                                {[1000, 2500, 5000, 10000].map((amt) => (
                                    <button
                                        key={amt}
                                        onClick={() => setRechargeAmount(amt)}
                                        className={clsx(
                                            "py-3 px-4 rounded-xl font-bold text-sm transition-all border-2",
                                            rechargeAmount === amt
                                                ? "border-primary bg-primary/5 text-primary"
                                                : "border-gray-100 hover:border-gray-300 text-gray-600"
                                        )}
                                    >
                                        ₹{amt.toLocaleString()}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Custom Amount</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={rechargeAmount}
                                        onChange={(e) => setRechargeAmount(Number(e.target.value))}
                                        className="w-full pl-8 pr-4 py-3.5 bg-gray-50 border-gray-200 border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-bold text-lg"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleRecharge}
                                disabled={recharging || rechargeAmount < 500}
                                className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-primary/30 active:scale-[0.98] transition-all"
                            >
                                {recharging ? <Loader2 className="w-6 h-6 animate-spin" /> : <CreditCard className="w-6 h-6" />}
                                Complete Payment
                            </button>

                            <p className="text-center text-[11px] text-gray-400 font-medium">
                                Secured by <span className="text-blue-600 font-bold">Razorpay</span>
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
