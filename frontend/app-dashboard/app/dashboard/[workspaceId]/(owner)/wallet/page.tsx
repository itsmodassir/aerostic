'use client';

import { useEffect, useState, useMemo } from 'react';
import {
    CreditCard, ArrowUpRight, ArrowDownLeft,
    History, Plus, Loader2, AlertCircle,
    CheckCircle2, Clock, Wallet as WalletIcon,
    Zap, Gem, ArrowRight, ShieldCheck, ChevronRight, X
} from 'lucide-react';
import api from '@/lib/api';
import { useParams } from 'next/navigation';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface Transaction {
    id: string;
    type: 'credit' | 'debit';
    amount: string | number;
    balanceAfter: string | number;
    description: string;
    referenceType: string;
    createdAt: string;
}

const TransactionRow = ({ tx }: { tx: Transaction }) => (
    <motion.tr 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="group hover:bg-slate-50/80 transition-all duration-300"
    >
        <td className="px-8 py-6">
            <div className="flex items-center gap-5">
                <div className={clsx(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110",
                    tx.type === 'credit' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                )}>
                    {tx.type === 'credit' ? <ArrowDownLeft size={20} strokeWidth={2.5} /> : <ArrowUpRight size={20} strokeWidth={2.5} />}
                </div>
                <div>
                    <p className="font-black text-slate-900 text-sm tracking-tight">{tx.description || tx.referenceType}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{new Date(tx.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                </div>
            </div>
        </td>
        <td className="px-8 py-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border border-emerald-100/50">
                <ShieldCheck size={10} strokeWidth={3} />
                Settled
            </span>
        </td>
        <td className={clsx(
            "px-8 py-6 text-right font-black text-base tracking-tight",
            tx.type === 'credit' ? "text-emerald-600" : "text-rose-500"
        )}>
            {tx.type === 'credit' ? '+' : '-'}₹{Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </td>
        <td className="px-8 py-6 text-right">
            <div className="flex flex-col items-end">
                <span className="font-bold text-slate-700 text-sm">₹{Number(tx.balanceAfter).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-0.5">Post-Balance</span>
            </div>
        </td>
    </motion.tr>
);

export default function WalletPage() {
    const params = useParams();
    const workspaceId = params?.workspaceId || 'default';
    const [balance, setBalance] = useState<number>(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [recharging, setRecharging] = useState(false);
    const [rechargeAmount, setRechargeAmount] = useState<number>(2500);
    const [showRechargeModal, setShowRechargeModal] = useState(false);
    const [tenantId, setTenantId] = useState<string>('');

    useEffect(() => {
        const init = async () => {
            const workspaceSlug = params.workspaceId as string;
            if (!workspaceSlug) return;
            try {
                const res = await api.get('/auth/workspaces');
                const activeMembership = res.data.find((m: any) => 
                    m.tenant?.slug === workspaceSlug || m.tenant?.id === workspaceSlug
                );
                if (activeMembership?.tenant?.id) {
                    setTenantId(activeMembership.tenant.id);
                } else {
                    setLoading(false);
                }
            } catch (e) {
                setLoading(false);
            }
        };
        init();
    }, [params.workspaceId]);

    useEffect(() => {
        if (tenantId) fetchWalletData();
    }, [tenantId]);

    const fetchWalletData = async () => {
        try {
            const headers = { 'x-tenant-id': tenantId };
            const [balanceRes, txRes] = await Promise.all([
                api.get('/billing/wallet/balance', { headers }),
                api.get('/billing/wallet/transactions?limit=50', { headers })
            ]);
            setBalance(Number(balanceRes.data.balance));
            setTransactions(txRes.data.transactions || []);
        } catch (error) {
            console.error('Failed to fetch wallet data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRecharge = async () => {
        if (!tenantId) {
            alert('Security context not initialized. Please refresh.');
            return;
        }
        setRecharging(true);
        try {
            const res = await api.post('/billing/wallet/recharge', {
                amount: rechargeAmount,
                description: `Aerostic Wallet Recharge (${workspaceId})`
            }, {
                headers: { 'x-tenant-id': tenantId }
            });
            
            if (res.data && (res.data.short_url || res.data.payment_url)) {
                window.location.href = res.data.short_url || res.data.payment_url;
            } else {
                throw new Error('No payment URL received');
            }
        } catch (error: any) {
            console.error('Recharge failed', error);
            alert(error.response?.data?.message || 'Failed to initialize payment. Our secure gateway is currently high loaded. Please try again in 2 minutes.');
        } finally {
            setRecharging(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Authenticating Vault Access...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-32 animate-in fade-in duration-700">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
                            <Gem size={24} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Credits & Billing</h1>
                    </div>
                    <p className="text-sm font-bold text-slate-400 ml-1">Universal across all your AI agents and messaging channels.</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowRechargeModal(true)}
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-[24px] font-black text-sm shadow-2xl shadow-slate-200 transition-all hover:bg-slate-800"
                >
                    <Plus size={20} strokeWidth={3} />
                    Refill Credits
                </motion.button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Balance Card - Premium High Fidelity */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-2 relative h-[360px] rounded-[48px] bg-[#0A0C10] overflow-hidden group shadow-2xl shadow-slate-300"
                >
                    {/* Background Visual Components */}
                    <div className="absolute top-0 right-0 w-[500px] h-full bg-gradient-to-l from-blue-600/20 to-transparent blur-[120px] pointer-events-none" />
                    <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
                    
                    {/* Card Content */}
                    <div className="relative h-full p-12 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center">
                                    <Gem className="text-blue-400" size={28} />
                                </div>
                                <div>
                                    <h2 className="text-white text-lg font-black tracking-tight">Aerostic Vault</h2>
                                    <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">Verified Main Balance</p>
                                </div>
                            </div>
                            <div className="px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Real-time Sync</span>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-baseline gap-3 mb-2">
                                <span className="text-white/30 text-3xl font-black">₹</span>
                                <div className="text-7xl font-black text-white tracking-tighter">
                                    {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-white/40 font-bold text-sm ml-10">
                                <span>Secured credit for</span>
                                <span className="text-white px-2 py-0.5 bg-white/10 rounded-lg">{workspaceId}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 pt-8 border-t border-white/5">
                            <div className="flex items-center gap-2">
                                <Zap size={14} className="text-amber-400" />
                                <span className="text-[10px] text-white/60 font-black uppercase tracking-widest">Instant Top-up</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={14} className="text-emerald-400" />
                                <span className="text-[10px] text-white/60 font-black uppercase tracking-widest">Encrypted via Razorpay</span>
                            </div>
                        </div>
                    </div>

                    {/* Chip/Contactless visual enhancement */}
                    <div className="absolute top-12 right-12 w-14 h-10 bg-gradient-to-br from-amber-200 to-amber-500 rounded-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                </motion.div>

                {/* Quick Info & Stats */}
                <div className="space-y-6">
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-xl shadow-slate-200/50"
                    >
                        <h3 className="font-black text-slate-900 text-lg mb-6 flex items-center gap-3">
                            <AlertCircle className="text-amber-500" size={24} /> 
                            Billing Policy
                        </h3>
                        <ul className="space-y-6">
                            {[
                                { text: "Credits are used for AI processing ($0.05/token) and overages.", icon: Zap, color: 'text-amber-500' },
                                { text: "Minimum recharge of ₹500. Credits never expire.", icon: Clock, color: 'text-indigo-500' },
                                { text: "Auto-sync with WhatsApp Business Platform costs.", icon: ShieldCheck, color: 'text-emerald-500' }
                            ].map((item, idx) => (
                                <li key={idx} className="flex gap-4">
                                    <div className={clsx("w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0", item.color)}>
                                        <item.icon size={18} strokeWidth={2.5} />
                                    </div>
                                    <p className="text-xs font-bold text-slate-500 leading-relaxed pt-1">{item.text}</p>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="relative z-10 space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Reward Program</p>
                            <h4 className="text-xl font-black tracking-tight leading-tight">Get 10% extra credits on ₹5000+ refill</h4>
                            <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                                Redeem Now <ArrowRight size={14} />
                            </button>
                        </div>
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                    </div>
                </div>
            </div>

            {/* Transaction History Section */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[48px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400">
                            <History size={24} />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 text-xl tracking-tight">Ledger History</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Immutable Transaction Records</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Spend (MTD)</p>
                            <p className="font-black text-slate-900 tracking-tight">₹14,500.00</p>
                        </div>
                        <div className="h-8 w-px bg-slate-200" />
                        <button className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                            <Plus size={20} className="text-slate-400" />
                        </button>
                    </div>
                </div>

                {transactions.length === 0 ? (
                    <div className="py-40 flex flex-col items-center justify-center text-center space-y-6 opacity-20">
                        <div className="w-24 h-24 bg-slate-100 rounded-[40px] flex items-center justify-center">
                            <History size={48} />
                        </div>
                        <div className="space-y-1">
                            <p className="font-black text-lg text-slate-900">Your ledger is empty</p>
                            <p className="text-sm font-bold text-slate-500">Transactions will appear here automatically.</p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left min-w-[1000px]">
                            <thead>
                                <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">
                                    <th className="px-10 py-6 tracking-[0.3em]">Transaction Entity</th>
                                    <th className="px-10 py-6 tracking-[0.3em]">Verification Status</th>
                                    <th className="px-10 py-6 text-right tracking-[0.3em]">Credit Delta</th>
                                    <th className="px-10 py-6 text-right tracking-[0.3em]">Aggregate Vault</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {transactions.map((tx) => (
                                    <TransactionRow key={tx.id} tx={tx} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                
                <div className="px-10 py-6 border-t border-slate-50 bg-slate-50/20 flex justify-center">
                    <button className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-blue-600 transition-colors group">
                        Load Complete Audit Log <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Recharge Modal - Meta Style */}
            <AnimatePresence>
                {showRechargeModal && (
                    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
                            onClick={() => setShowRechargeModal(false)} 
                        />
                        <motion.div 
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="relative w-full max-w-lg bg-white sm:rounded-[48px] rounded-t-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Vault Refill</h2>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Select amount in INR</p>
                                </div>
                                <button onClick={() => setShowRechargeModal(false)} className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-400"><X size={24} strokeWidth={3} /></button>
                            </div>

                            <div className="p-10 space-y-10 overflow-y-auto">
                                <div className="grid grid-cols-2 gap-4">
                                    {[1000, 2500, 5000, 10000].map((amt) => (
                                        <button
                                            key={amt}
                                            onClick={() => setRechargeAmount(amt)}
                                            className={clsx(
                                                "py-5 px-6 rounded-3xl font-black text-sm transition-all border-2",
                                                rechargeAmount === amt
                                                    ? "border-blue-600 bg-blue-50/50 text-blue-600 shadow-inner"
                                                    : "border-slate-100 hover:border-slate-300 text-slate-500 bg-slate-50/20"
                                            )}
                                        >
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-xs font-bold opacity-50">₹</span>
                                                <span className="text-xl tracking-tight">{amt.toLocaleString()}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Custom Deposit Amount</label>
                                    <div className="relative group">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-black text-slate-300 group-focus-within:text-blue-500 transition-colors">₹</div>
                                        <input
                                            type="number"
                                            placeholder="Min. 500.00"
                                            value={rechargeAmount}
                                            onChange={(e) => setRechargeAmount(Number(e.target.value))}
                                            className="w-full pl-12 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-3xl outline-none transition-all font-black text-2xl tracking-tight text-slate-900"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold px-2">Processing fees included in final settlement.</p>
                                </div>

                                <div className="pt-4 space-y-4">
                                    <button
                                        onClick={handleRecharge}
                                        disabled={recharging || rechargeAmount < 500}
                                        className="w-full bg-slate-900 text-white h-20 rounded-[32px] font-black text-xl disabled:opacity-50 flex items-center justify-center gap-4 shadow-2xl shadow-slate-200 active:scale-[0.98] transition-all relative overflow-hidden"
                                    >
                                        {recharging ? (
                                            <Loader2 className="w-8 h-8 animate-spin" />
                                        ) : (
                                            <>
                                                <CreditCard size={24} strokeWidth={2.5} />
                                                <span>Authorize Checkout</span>
                                            </>
                                        )}
                                    </button>

                                    <div className="flex items-center justify-center gap-6 opacity-40 grayscale group-hover:grayscale-0 transition-all pt-4">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" className="h-5" />
                                        <div className="h-4 w-px bg-slate-300" />
                                        <div className="flex items-center gap-1.5 font-black text-[9px] uppercase tracking-widest text-slate-900">
                                            <ShieldCheck size={14} className="text-emerald-500" /> Secure SSL
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
