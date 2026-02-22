'use client';

import { useEffect, useState } from 'react';
import {
    CheckCircle, XCircle, CreditCard, Calendar,
    Shield, Zap, MessageSquare, Bot, ArrowRight,
    Loader2, AlertTriangle, FileText, Download,
    Crown, Clock, List, Code, Webhook, GitPullRequest, LayoutDashboard, Users
} from 'lucide-react';
import api from '@/lib/api';
import { useParams } from 'next/navigation';
import { clsx } from 'clsx';

// Feature mapping matching Admin Panel & Onboarding
const FEATURE_MAP: Record<string, { label: string; icon: any }> = {
    'whatsapp_embedded': { label: 'WhatsApp Embedded Signup', icon: MessageSquare },
    'whatsapp_marketing': { label: 'WhatsApp Marketing', icon: MessageSquare },
    'ai_features': { label: 'AI Features', icon: Bot },
    'templates': { label: 'Templates Management', icon: List },
    'api_access': { label: 'API Access', icon: Code },
    'webhooks': { label: 'Webhooks', icon: Webhook },
    'human_takeover': { label: 'Human Takeover', icon: Users },
    'unlimited_broadcasts': { label: 'Unlimited Broadcasts', icon: MessageSquare },
    'multi_client_dashboard': { label: 'Multi-Client Dashboard', icon: LayoutDashboard },
    'lead_pipeline': { label: 'Lead Pipeline', icon: GitPullRequest },
    'ai_classification': { label: 'AI Classification', icon: Bot },
};

interface Plan {
    id: string;
    name: string;
    description?: string;
    price: number;
    setupFee: number;
    features: string[];
    limits: any;
    slug: string;
}

interface Invoice {
    id: string;
    amount: number;
    status: string;
    date: string;
    pdfUrl?: string;
    razorpayPaymentId?: string;
}

interface UsageMetrics {
    messages: number;
    aiCredits: number;
    broadcasts: number;
    periodStart: string;
    periodEnd: string;
}

export default function BillingPage() {
    const params = useParams();
    const workspaceId = params?.workspaceId || 'default';
    const [subscription, setSubscription] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [upgrading, setUpgrading] = useState<string | null>(null);
    const [invoiceHistory, setInvoiceHistory] = useState<Invoice[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [usage, setUsage] = useState<UsageMetrics | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [subRes, plansRes, invoicesRes, usageRes] = await Promise.all([
                api.get('/billing/subscription').catch(() => ({ data: null })),
                api.get('/billing/available-plans'),
                api.get('/billing/invoices'),
                api.get('/billing/usage')
            ]);

            if (subRes.data) setSubscription(subRes.data);
            if (plansRes.data) setPlans(plansRes.data);
            if (invoicesRes.data) setInvoiceHistory(invoicesRes.data);
            if (usageRes.data) setUsage(usageRes.data);

        } catch (error) {
            console.error('Failed to fetch billing data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpgrade = async (planId: string) => {
        setUpgrading(planId);
        try {
            // Plan ID is UUID, backend maps it to Razorpay ID
            const res = await api.post('/billing/subscribe', { planId });
            if (res.data && res.data.short_url) {
                window.location.href = res.data.short_url;
            } else {
                alert('Failed to initiate upgrade. Please try again.');
            }
        } catch (error) {
            console.error('Upgrade failed', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setUpgrading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[600px]">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    const currentPlanSlug = subscription?.plan || 'free-trial'; // Default to trial or free
    const currentPlan = plans.find(p => p.slug === currentPlanSlug) || plans[0]; // Fallback

    // Calculate Usage Percentages
    const getUsagePercentage = (used: number, limit: number) => {
        if (limit === -1) return 5; // Simulating 'unlimited' visual
        if (limit === 0) return 100;
        return Math.min(100, (used / limit) * 100);
    };

    const limits = currentPlan?.limits || { monthly_messages: 1000, ai_credits: 100, max_agents: 1, monthly_broadcasts: 0 };
    const usageData = usage || { messages: 0, aiCredits: 0, broadcasts: 0, periodStart: new Date().toISOString(), periodEnd: new Date().toISOString() };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
                <p className="text-gray-500 mt-2">Manage your plan, billing details, and invoices</p>
            </div>

            {/* Current Plan Overview */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between gap-8">
                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Shield className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Current Plan</h2>
                                <p className="text-3xl font-extrabold text-blue-600 capitalize">
                                    {currentPlan?.name || subscription?.plan || 'Free Trial'}
                                </p>
                            </div>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Your plan renews on <span className="font-semibold text-gray-900">{new Date(subscription?.currentPeriodEnd || Date.now()).toLocaleDateString()}</span>
                        </p>
                        <div className="flex gap-3">
                            {subscription?.status === 'active' ? (
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" /> Active
                                </span>
                            ) : (
                                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" /> {subscription?.status || 'Inactive'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Usage Statistics */}
                    <div className="flex-1 space-y-4">
                        <h3 className="font-semibold text-gray-900 mb-2">Plan Usage</h3>

                        {/* Messages */}
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600 flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Messages</span>
                                <span className="font-medium">
                                    {usageData.messages.toLocaleString()} / {limits.monthly_messages === -1 ? 'Unlimited' : limits.monthly_messages.toLocaleString()}
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${getUsagePercentage(usageData.messages, limits.monthly_messages)}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* AI Credits */}
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600 flex items-center gap-2"><Zap className="w-4 h-4" /> AI Credits</span>
                                <span className="font-medium">
                                    {usageData.aiCredits.toLocaleString()} / {limits.ai_credits === -1 ? 'Unlimited' : limits.ai_credits.toLocaleString()}
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-purple-600 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${getUsagePercentage(usageData.aiCredits, limits.ai_credits)}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Broadcasts */}
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600 flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Broadcasts</span>
                                <span className="font-medium">
                                    {usageData.broadcasts.toLocaleString()} / {limits.monthly_broadcasts === -1 ? 'Unlimited' : (limits.monthly_broadcasts || 0).toLocaleString()}
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-orange-500 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${getUsagePercentage(usageData.broadcasts, limits.monthly_broadcasts || 0)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Plans Grid */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Upgrade your plan</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {plans.map((plan) => {
                        const isCurrent = currentPlanSlug === plan.slug;
                        const isPopular = plan.slug === 'growth'; // Simplistic popular check

                        return (
                            <div
                                key={plan.id}
                                className={clsx(
                                    "bg-white rounded-2xl border p-6 flex flex-col transition-all",
                                    isCurrent
                                        ? 'border-blue-600 ring-2 ring-blue-600 ring-opacity-20 shadow-lg scale-[1.02]'
                                        : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                                )}
                            >
                                {isPopular && (
                                    <div className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-full w-fit mb-4">
                                        MOST POPULAR
                                    </div>
                                )}
                                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                                <div className="mt-2 mb-4">
                                    <span className="text-3xl font-bold text-gray-900">₹{plan.price.toLocaleString()}</span>
                                    <span className="text-gray-500">/month</span>
                                    {plan.setupFee > 0 && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            + ₹{plan.setupFee.toLocaleString()} setup fee
                                        </div>
                                    )}
                                </div>
                                <p className="text-gray-500 text-sm mb-6 line-clamp-2 h-10">
                                    {plan.description || 'Professional plan for growing businesses.'}
                                </p>

                                <button
                                    onClick={() => handleUpgrade(plan.id)}
                                    disabled={isCurrent || upgrading !== null}
                                    className={clsx(
                                        "w-full py-2.5 rounded-xl font-medium transition-colors mb-6 flex items-center justify-center gap-2",
                                        isCurrent
                                            ? 'bg-gray-100 text-gray-500 cursor-default'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                    )}
                                >
                                    {upgrading === plan.id && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {isCurrent ? 'Current Plan' : 'Upgrade Now'}
                                </button>

                                <div className="space-y-3 flex-1">
                                    {/* Limits */}
                                    {plan.limits && (
                                        <>
                                            <div className="flex items-center gap-3 text-sm">
                                                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                                                <span className="text-gray-700">
                                                    {plan.limits.monthly_messages === -1 ? 'Unlimited' : plan.limits.monthly_messages.toLocaleString()} Msgs
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                                                <span className="text-gray-700">
                                                    {plan.limits.ai_credits === -1 ? 'Unlimited' : plan.limits.ai_credits.toLocaleString()} Credits
                                                </span>
                                            </div>
                                        </>
                                    )}

                                    {/* Features */}
                                    {plan.features.map((featureCode, i) => {
                                        const mapped = FEATURE_MAP[featureCode];
                                        if (!mapped) return null;
                                        return (
                                            <div key={i} className="flex items-center gap-3 text-sm">
                                                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                                                <span className="text-gray-700">
                                                    {mapped.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Invoices */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mt-8">
                <div className="p-4 sm:p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-500" />
                        Billing History
                    </h3>
                </div>
                {invoiceHistory.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No invoices found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Invoice ID</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Download</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {invoiceHistory.map((inv, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{inv.id}</td>
                                        <td className="px-6 py-4 text-gray-500">{new Date(inv.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-gray-900 font-medium">₹{inv.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={clsx(
                                                "px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                                                inv.status === 'paid' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                                            )}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {inv.pdfUrl ? (
                                                <a href={inv.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                                                    <Download className="w-4 h-4" /> PDF
                                                </a>
                                            ) : (
                                                <span className="text-gray-400">Unavailable</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
