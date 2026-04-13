"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Loader2, Check, X, ArrowRight, MessageSquare } from 'lucide-react';

const FEATURE_MAP: Record<string, string> = {
    'whatsapp_embedded': 'WhatsApp Embedded Signup',
    'whatsapp_marketing': 'WhatsApp Marketing',
    'ai_features': 'AI Features',
    'templates': 'Templates Management',
    'api_access': 'API Access',
    'webhooks': 'Webhooks',
    'human_takeover': 'Human Takeover',
    'unlimited_broadcasts': 'Unlimited Broadcasts',
    'multi_client_dashboard': 'Multi-Client Dashboard',
    'lead_pipeline': 'Lead Pipeline',
    'ai_classification': 'AI Classification',
    'advanced_ai': 'Advanced AI / Gemini',
    'whitelabel': 'White-label Branding',
    'reseller_hub': 'Reseller Hub Access',
    'crm_integrations': 'CRM Integrations',
    'basic_support': 'Basic Support',
    'unlimited_templates': 'Unlimited Templates'
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

export default function PricingPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const res = await api.get('/billing/available-plans');
            setPlans(res.data);
        } catch (err) {
            console.error('Failed to fetch plans', err);
            setError('Failed to load pricing. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
    );

    const allPlans = plans.map((p, index) => ({
        ...p,
        popular: plans.length > 2 ? index === 1 : (plans.length === 2 ? index === 1 : false),
    }));

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold text-blue-600">
                        Aimstors Solution
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-gray-600 hover:text-gray-900">Login</Link>
                        <Link
                            href="/register"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Start Free
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Header */}
            <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h1 className="text-5xl font-bold text-gray-900 mb-4">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Choose the plan that fits your business. All plans include a 7-day free trial.
                    </p>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="py-16 -mt-8">
                <div className="max-w-7xl mx-auto px-6">
                    <div className={`grid gap-8 ${allPlans.length === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' : 'md:grid-cols-3'}`}>
                        {allPlans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`rounded-3xl p-8 flex flex-col ${plan.popular
                                        ? 'bg-blue-600 text-white shadow-2xl scale-105 z-10'
                                        : 'bg-white border-2 border-gray-100'
                                    }`}
                            >
                                {plan.popular && (
                                    <span className="inline-block bg-white text-blue-600 text-[10px] font-bold px-3 py-1 rounded-full mb-4 self-start">
                                        MOST POPULAR
                                    </span>
                                )}
                                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                <p className={`mb-6 text-sm ${plan.popular ? 'text-blue-100' : 'text-gray-500'}`}>
                                    {plan.description || (plan.price === 0 ? 'Basic starter plan' : 'Advanced features for growth')}
                                </p>
                                <div className="mb-6">
                                    <span className="text-5xl font-bold">₹{plan.price.toLocaleString()}</span>
                                    <span className={plan.popular ? 'text-blue-200' : 'text-gray-500'}>/month</span>
                                </div>
                                <Link
                                    href="/register"
                                    className={`block w-full py-4 rounded-xl font-bold text-center mb-8 transition-all ${plan.popular
                                            ? 'bg-white text-blue-600 hover:bg-gray-100 shadow-lg shadow-blue-900/20'
                                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20'
                                        }`}
                                >
                                    {plan.price === 0 ? 'Get Started for Free' : 'Choose Plan'}
                                </Link>
                                <ul className="space-y-4 flex-1">
                                    {/* Limits */}
                                    {plan.limits && (
                                        <>
                                            <li className="flex items-center gap-3">
                                                <Check className={`w-5 h-5 ${plan.popular ? 'text-blue-200' : 'text-blue-500'}`} />
                                                <span className="text-sm">
                                                    <span className="font-bold">{plan.limits.monthly_messages === -1 ? 'Unlimited' : plan.limits.monthly_messages.toLocaleString()}</span> Messages/mo
                                                </span>
                                            </li>
                                            <li className="flex items-center gap-3">
                                                <Check className={`w-5 h-5 ${plan.popular ? 'text-blue-200' : 'text-blue-500'}`} />
                                                <span className="text-sm">
                                                    <span className="font-bold">{plan.limits.ai_credits === -1 ? 'Unlimited' : plan.limits.ai_credits.toLocaleString()}</span> AI Credits
                                                </span>
                                            </li>
                                        </>
                                    )}
                                    {/* Features */}
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <Check className={`w-5 h-5 ${plan.popular ? 'text-blue-200' : 'text-blue-500'}`} />
                                            <span className="text-sm">{FEATURE_MAP[f] || f}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        {[
                            {
                                q: 'Can I change my plan later?',
                                a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.',
                            },
                            {
                                q: 'What payment methods do you accept?',
                                a: 'We accept all major credit/debit cards, UPI, net banking, and wallets via Razorpay.',
                            },
                            {
                                q: 'Is there a free trial?',
                                a: 'Yes! All plans include a 14-day free trial. No credit card required to start.',
                            },
                            {
                                q: 'What happens if I exceed my message limit?',
                                a: 'You can purchase additional message credits or upgrade to a higher plan.',
                            },
                        ].map((faq, i) => (
                            <div key={i} className="bg-white rounded-xl p-6 border border-gray-200">
                                <h3 className="font-semibold text-lg mb-2">{faq.q}</h3>
                                <p className="text-gray-600">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 bg-blue-600 text-white">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
                    <p className="text-blue-100 mb-8">
                        Start your 14-day free trial today. No credit card required.
                    </p>
                    <Link
                        href="/register"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                    >
                        Start Free Trial <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            {/* WhatsApp Button */}
            <a
                href="https://wa.me/919999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors z-50"
            >
                <MessageSquare className="w-6 h-6" />
            </a>
        </div>
    );
}
