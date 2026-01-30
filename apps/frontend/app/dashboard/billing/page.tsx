'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Check, Zap, Building, Crown, CreditCard, AlertCircle,
    MessageSquare, Bot, Users, FileText, ArrowRight, Clock,
    TrendingUp, Shield, Sparkles
} from 'lucide-react';

const PLANS = [
    {
        id: 'starter',
        name: 'Starter',
        price: 1999,
        description: 'Perfect for small businesses getting started',
        color: 'gray',
        features: [
            '10,000 messages/month',
            '1 AI Agent',
            'Basic templates',
            'Email support',
            '1,000 AI credits',
        ],
        limits: {
            messages: 10000,
            agents: 1,
            aiCredits: 1000,
        }
    },
    {
        id: 'growth',
        name: 'Growth',
        price: 4999,
        description: 'For growing teams and businesses',
        color: 'blue',
        popular: true,
        features: [
            '50,000 messages/month',
            '5 AI Agents',
            'Custom templates',
            'Priority support',
            'API access',
            'Team collaboration',
            'Webhooks',
            '5,000 AI credits',
        ],
        limits: {
            messages: 50000,
            agents: 5,
            aiCredits: 5000,
        }
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 14999,
        description: 'For large organizations with custom needs',
        color: 'purple',
        features: [
            'Unlimited messages',
            'Unlimited AI Agents',
            'White-label branding',
            'Dedicated support',
            'Custom integrations',
            'SLA guarantee',
            'On-premise option',
            'Unlimited AI credits',
        ],
        limits: {
            messages: -1,
            agents: -1,
            aiCredits: -1,
        }
    },
];

export default function BillingPage() {
    const [userPlan, setUserPlan] = useState<'starter' | 'growth' | 'enterprise'>('starter');
    const [loading, setLoading] = useState(true);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

    // Usage data
    const [usage, setUsage] = useState({
        messagesUsed: 0,
        aiCreditsUsed: 0,
        agentsCreated: 0,
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.email === 'md@modassir.info') {
                    setUserPlan('growth');
                } else if (payload.email?.includes('enterprise')) {
                    setUserPlan('enterprise');
                }
            } catch (e) { }
        }

        // Demo usage data
        setUsage({
            messagesUsed: 12500,
            aiCreditsUsed: 850,
            agentsCreated: 3,
        });

        setLoading(false);
    }, []);

    const currentPlan = PLANS.find(p => p.id === userPlan) || PLANS[0];
    const annualDiscount = 0.2; // 20% off

    const getPrice = (plan: typeof PLANS[0]) => {
        if (billingCycle === 'annual') {
            return Math.round(plan.price * (1 - annualDiscount));
        }
        return plan.price;
    };

    const getUsagePercent = (used: number, limit: number) => {
        if (limit === -1) return 0;
        return Math.min((used / limit) * 100, 100);
    };

    const getPlanIcon = (planId: string) => {
        switch (planId) {
            case 'starter': return <Zap className="w-6 h-6" />;
            case 'growth': return <Building className="w-6 h-6" />;
            case 'enterprise': return <Crown className="w-6 h-6" />;
            default: return <CreditCard className="w-6 h-6" />;
        }
    };

    const handleUpgrade = (planId: string) => {
        // In real app, redirect to Razorpay
        alert(`Upgrading to ${planId} plan. This would redirect to payment.`);
    };

    const handleRequestUpgrade = (planId: string) => {
        alert(`Upgrade request sent to admin for ${planId} plan.`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Billing & Plans</h1>
                <p className="text-gray-600 mt-1">Manage your subscription and usage</p>
            </div>

            {/* Current Plan Card */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />

                <div className="relative flex items-start justify-between">
                    <div>
                        <p className="text-blue-100 text-sm">Current Plan</p>
                        <h2 className="text-3xl font-bold mt-1 flex items-center gap-3">
                            {getPlanIcon(userPlan)}
                            {currentPlan.name}
                        </h2>
                        <p className="text-blue-100 mt-2">{currentPlan.description}</p>

                        <div className="flex items-center gap-4 mt-4">
                            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                                Active
                            </span>
                            <span className="text-sm text-blue-100">
                                <Clock className="w-4 h-4 inline mr-1" />
                                Renews Feb 28, 2026
                            </span>
                        </div>
                    </div>

                    <div className="text-right">
                        <p className="text-4xl font-bold">₹{currentPlan.price.toLocaleString()}</p>
                        <p className="text-blue-100">/month</p>
                    </div>
                </div>

                {/* Usage Bars */}
                <div className="grid grid-cols-3 gap-6 mt-8 relative">
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" />
                                Messages
                            </span>
                            <span>
                                {usage.messagesUsed.toLocaleString()} / {currentPlan.limits.messages === -1 ? '∞' : currentPlan.limits.messages.toLocaleString()}
                            </span>
                        </div>
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white rounded-full transition-all"
                                style={{ width: `${getUsagePercent(usage.messagesUsed, currentPlan.limits.messages)}%` }}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="flex items-center gap-1">
                                <Sparkles className="w-4 h-4" />
                                AI Credits
                            </span>
                            <span>
                                {usage.aiCreditsUsed.toLocaleString()} / {currentPlan.limits.aiCredits === -1 ? '∞' : currentPlan.limits.aiCredits.toLocaleString()}
                            </span>
                        </div>
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white rounded-full transition-all"
                                style={{ width: `${getUsagePercent(usage.aiCreditsUsed, currentPlan.limits.aiCredits)}%` }}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="flex items-center gap-1">
                                <Bot className="w-4 h-4" />
                                AI Agents
                            </span>
                            <span>
                                {usage.agentsCreated} / {currentPlan.limits.agents === -1 ? '∞' : currentPlan.limits.agents}
                            </span>
                        </div>
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white rounded-full transition-all"
                                style={{ width: `${getUsagePercent(usage.agentsCreated, currentPlan.limits.agents)}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Billing Cycle Toggle */}
            <div className="flex items-center justify-center gap-4">
                <span className={`text-sm ${billingCycle === 'monthly' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                    Monthly
                </span>
                <button
                    onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                    className={`relative w-14 h-7 rounded-full transition-colors ${billingCycle === 'annual' ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${billingCycle === 'annual' ? 'translate-x-8' : 'translate-x-1'}`} />
                </button>
                <span className={`text-sm ${billingCycle === 'annual' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                    Annual
                </span>
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    Save 20%
                </span>
            </div>

            {/* Plans Grid */}
            <div className="grid md:grid-cols-3 gap-6">
                {PLANS.map((plan) => {
                    const isCurrentPlan = plan.id === userPlan;
                    const isUpgrade = PLANS.findIndex(p => p.id === plan.id) > PLANS.findIndex(p => p.id === userPlan);
                    const isDowngrade = PLANS.findIndex(p => p.id === plan.id) < PLANS.findIndex(p => p.id === userPlan);

                    return (
                        <div
                            key={plan.id}
                            className={`relative rounded-2xl border-2 p-6 transition-all ${isCurrentPlan
                                    ? 'border-blue-500 bg-blue-50'
                                    : plan.popular
                                        ? 'border-purple-300 bg-purple-50/50'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                        >
                            {plan.popular && !isCurrentPlan && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-purple-600 text-white text-xs font-medium rounded-full">
                                    Popular
                                </div>
                            )}

                            {isCurrentPlan && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                                    Current Plan
                                </div>
                            )}

                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-2 rounded-xl ${plan.id === 'starter' ? 'bg-gray-100 text-gray-600' :
                                        plan.id === 'growth' ? 'bg-blue-100 text-blue-600' :
                                            'bg-purple-100 text-purple-600'
                                    }`}>
                                    {getPlanIcon(plan.id)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                                    <p className="text-sm text-gray-500">{plan.description}</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <span className="text-4xl font-bold text-gray-900">
                                    ₹{getPrice(plan).toLocaleString()}
                                </span>
                                <span className="text-gray-500">/month</span>
                                {billingCycle === 'annual' && (
                                    <p className="text-sm text-green-600 mt-1">
                                        Save ₹{(plan.price * 12 * annualDiscount).toLocaleString()}/year
                                    </p>
                                )}
                            </div>

                            <ul className="space-y-3 mb-6">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-green-500 shrink-0" />
                                        <span className="text-gray-700 text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {isCurrentPlan ? (
                                <button
                                    disabled
                                    className="w-full py-3 rounded-xl font-medium bg-gray-100 text-gray-400 cursor-not-allowed"
                                >
                                    Current Plan
                                </button>
                            ) : isUpgrade ? (
                                <button
                                    onClick={() => handleUpgrade(plan.id)}
                                    className="w-full py-3 rounded-xl font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                    Upgrade <ArrowRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleRequestUpgrade(plan.id)}
                                    className="w-full py-3 rounded-xl font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                                >
                                    Request Downgrade
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Payment Methods */}
            <div className="bg-gray-50 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
                </div>
                <p className="text-gray-600 mb-4">
                    We accept all major payment methods via Razorpay: Credit/Debit Cards, UPI, Net Banking, Wallets.
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                    <Shield className="w-5 h-5 text-green-500" />
                    <span>Secure payments powered by Razorpay</span>
                </div>
            </div>

            {/* Enterprise Banner */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold mb-2">Need a custom plan?</h3>
                    <p className="text-purple-100">
                        Contact us for enterprise pricing, custom integrations, and dedicated support.
                    </p>
                </div>
                <a
                    href="mailto:support@aerostic.com"
                    className="px-6 py-3 bg-white text-purple-600 rounded-xl font-medium hover:bg-purple-50 transition-colors"
                >
                    Contact Sales
                </a>
            </div>
        </div>
    );
}
