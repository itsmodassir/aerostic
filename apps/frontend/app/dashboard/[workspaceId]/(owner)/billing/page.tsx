'use client';

import { useEffect, useState } from 'react';
import {
    CheckCircle, XCircle, CreditCard, Calendar,
    Shield, Zap, MessageSquare, Bot, ArrowRight,
    Loader2, AlertTriangle, FileText, Download
} from 'lucide-react';
import api from '@/lib/api';
import { useParams } from 'next/navigation';

const PLANS = [
    {
        id: 'starter',
        name: 'Starter',
        price: '₹1,999',
        description: 'Perfect for small businesses just getting started.',
        features: [
            { name: '10,000 Messages/mo', included: true },
            { name: '1 AI Agent', included: true },
            { name: '1,000 AI Credits', included: true },
            { name: 'Basic Templates', included: true },
            { name: 'Email Support', included: true },
            { name: 'API Access', included: false },
            { name: 'Webhooks', included: false },
            { name: 'Team Collaboration', included: false },
        ]
    },
    {
        id: 'growth',
        name: 'Growth',
        price: '₹4,999',
        popular: true,
        description: 'For growing teams that need more power and flexibility.',
        features: [
            { name: '50,000 Messages/mo', included: true },
            { name: '5 AI Agents', included: true },
            { name: '5,000 AI Credits', included: true },
            { name: 'Custom Templates', included: true },
            { name: 'Priority Support', included: true },
            { name: 'API Access', included: true },
            { name: 'Webhooks', included: true },
            { name: 'Team Collaboration', included: true },
        ]
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: '₹14,999',
        description: 'Advanced features and dedicated support for large scale.',
        features: [
            { name: 'Unlimited Messages', included: true },
            { name: 'Unlimited AI Agents', included: true },
            { name: 'Unlimited AI Credits', included: true },
            { name: 'Custom Integrations', included: true },
            { name: 'Dedicated Support', included: true },
            { name: 'SLA Guarantee', included: true },
            { name: 'On-premise Deployment', included: true },
            { name: 'White Labeling', included: true },
        ]
    }
];

export default function BillingPage() {
    const params = useParams();
    const workspaceId = params?.workspaceId || 'default';
    const [subscription, setSubscription] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [upgrading, setUpgrading] = useState<string | null>(null);
    const [invoices, setInvoices] = useState<any[]>([]);

    useEffect(() => {
        fetchSubscription();
    }, []);

    const fetchSubscription = async () => {
        try {
            const res = await api.get('/billing/subscription');
            if (res.data) {
                setSubscription(res.data);
            }
            // Mock invoices corresponding to subscription
            setInvoices([
                { id: 'INV-001', date: '2025-05-01', amount: '₹1,999', status: 'paid' },
                { id: 'INV-002', date: '2025-04-01', amount: '₹1,999', status: 'paid' },
                { id: 'INV-003', date: '2025-03-01', amount: '₹1,999', status: 'paid' },
            ]);
        } catch (error) {
            console.error('Failed to fetch subscription', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpgrade = async (planId: string) => {
        setUpgrading(planId);
        try {
            const res = await api.post('/billing/subscription/subscribe', { planId: `plan_${planId}` });
            if (res.data && res.data.short_url) {
                window.location.href = res.data.short_url; // Redirect to Razorpay payment page
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

    const currentPlanId = subscription?.plan || 'starter';

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
                <p className="text-gray-500 mt-2">Manage your plan, billing details, and invoices</p>
            </div>

            {/* Current Plan Overview */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between gap-8">
                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Shield className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Current Plan</h2>
                                <p className="text-3xl font-extrabold text-blue-600 capitalize">{currentPlanId}</p>
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
                                <span className="font-medium">{subscription?.monthlyMessages?.toLocaleString() || 1000} / {PLANS.find(p => p.id === currentPlanId)?.features[0].name.split(' ')[0] || '10,000'}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div className="bg-blue-600 h-full rounded-full" style={{ width: '45%' }}></div>
                            </div>
                        </div>

                        {/* AI Credits */}
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600 flex items-center gap-2"><Zap className="w-4 h-4" /> AI Credits</span>
                                <span className="font-medium">{subscription?.aiCredits?.toLocaleString() || 500} / {PLANS.find(p => p.id === currentPlanId)?.features[2].name.split(' ')[0] || '1,000'}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div className="bg-purple-600 h-full rounded-full" style={{ width: '25%' }}></div>
                            </div>
                        </div>

                        {/* Agents */}
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600 flex items-center gap-2"><Bot className="w-4 h-4" /> Active Agents</span>
                                <span className="font-medium">1 / {subscription?.maxAgents || 1}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div className="bg-green-600 h-full rounded-full" style={{ width: '10%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Plans Grid */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Upgrade your plan</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {PLANS.map((plan) => (
                        <div
                            key={plan.id}
                            className={`bg-white rounded-2xl border p-6 flex flex-col transition-all ${currentPlanId === plan.id
                                    ? 'border-blue-600 ring-2 ring-blue-600 ring-opacity-20 shadow-lg scale-[1.02]'
                                    : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                                }`}
                        >
                            {plan.popular && (
                                <div className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-full w-fit mb-4">
                                    MOST POPULAR
                                </div>
                            )}
                            <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                            <div className="mt-2 mb-4">
                                <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                                <span className="text-gray-500">/month</span>
                            </div>
                            <p className="text-gray-500 text-sm mb-6">{plan.description}</p>

                            <button
                                onClick={() => handleUpgrade(plan.id)}
                                disabled={currentPlanId === plan.id || upgrading !== null}
                                className={`w-full py-2.5 rounded-xl font-medium transition-colors mb-6 flex items-center justify-center gap-2 ${currentPlanId === plan.id
                                        ? 'bg-gray-100 text-gray-500 cursor-default'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                            >
                                {upgrading === plan.id && <Loader2 className="w-4 h-4 animate-spin" />}
                                {currentPlanId === plan.id ? 'Current Plan' : 'Upgrade Now'}
                            </button>

                            <div className="space-y-3 flex-1">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm">
                                        {feature.included ? (
                                            <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-gray-300 shrink-0" />
                                        )}
                                        <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                                            {feature.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Invoices */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-500" />
                        Billing History
                    </h3>
                </div>
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
                            {invoices.map((inv, i) => (
                                <tr key={i} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{inv.id}</td>
                                    <td className="px-6 py-4 text-gray-500">{new Date(inv.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-gray-900 font-medium">{inv.amount}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 capitalize">
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-gray-400 hover:text-blue-600 transition-colors">
                                            <Download className="w-4 h-4 ml-auto" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
