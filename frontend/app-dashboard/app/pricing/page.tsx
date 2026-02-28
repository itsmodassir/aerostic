'use client';

import Link from 'next/link';
import { Check, X, ArrowRight, MessageSquare } from 'lucide-react';

export default function PricingPage() {
    const plans = [
        {
            id: 'starter',
            name: 'Starter',
            price: 1999,
            description: 'Perfect for small businesses getting started',
            features: [
                { text: '10,000 messages/month', included: true },
                { text: '1,000 AI credits', included: true },
                { text: '1 AI Agent', included: true },
                { text: 'Basic templates', included: true },
                { text: 'Email support', included: true },
                { text: 'API access', included: false },
                { text: 'Custom templates', included: false },
                { text: 'White-label', included: false },
            ],
        },
        {
            id: 'growth',
            name: 'Growth',
            price: 4999,
            description: 'For growing teams with higher volume',
            popular: true,
            features: [
                { text: '50,000 messages/month', included: true },
                { text: '5,000 AI credits', included: true },
                { text: '5 AI Agents', included: true },
                { text: 'Custom templates', included: true },
                { text: 'API access', included: true },
                { text: 'Priority support', included: true },
                { text: 'Team collaboration', included: true },
                { text: 'White-label', included: false },
            ],
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            price: 14999,
            description: 'For large organizations with custom needs',
            features: [
                { text: 'Unlimited messages', included: true },
                { text: 'Unlimited AI credits', included: true },
                { text: 'Unlimited Agents', included: true },
                { text: 'Custom integrations', included: true },
                { text: 'Dedicated support', included: true },
                { text: 'SLA guarantee', included: true },
                { text: 'White-label branding', included: true },
                { text: 'On-premise option', included: true },
            ],
        },
    ];

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
                        Choose the plan that fits your business. All plans include a 14-day free trial.
                    </p>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="py-16 -mt-8">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-8">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`rounded-2xl p-8 ${plan.popular
                                        ? 'bg-blue-600 text-white ring-4 ring-blue-600 ring-offset-4'
                                        : 'bg-white border-2 border-gray-200'
                                    }`}
                            >
                                {plan.popular && (
                                    <span className="inline-block bg-white text-blue-600 text-xs font-bold px-3 py-1 rounded-full mb-4">
                                        MOST POPULAR
                                    </span>
                                )}
                                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                <p className={`mb-6 ${plan.popular ? 'text-blue-100' : 'text-gray-600'}`}>
                                    {plan.description}
                                </p>
                                <div className="mb-6">
                                    <span className="text-5xl font-bold">₹{plan.price.toLocaleString()}</span>
                                    <span className={plan.popular ? 'text-blue-200' : 'text-gray-500'}>/month</span>
                                </div>
                                <Link
                                    href="/register"
                                    className={`block w-full py-3 rounded-lg font-semibold text-center mb-8 transition-colors ${plan.popular
                                            ? 'bg-white text-blue-600 hover:bg-gray-100'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                >
                                    Start Free Trial
                                </Link>
                                <ul className="space-y-4">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            {feature.included ? (
                                                <Check className={`w-5 h-5 ${plan.popular ? 'text-blue-200' : 'text-green-500'}`} />
                                            ) : (
                                                <X className={`w-5 h-5 ${plan.popular ? 'text-blue-300' : 'text-gray-300'}`} />
                                            )}
                                            <span className={!feature.included ? (plan.popular ? 'text-blue-200' : 'text-gray-400') : ''}>
                                                {feature.text}
                                            </span>
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
