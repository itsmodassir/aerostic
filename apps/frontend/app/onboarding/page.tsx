'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import {
    Check,
    Zap,
    Users,
    MessageSquare,
    Bot,
    Sparkles,
    Shield,
    ArrowRight,
    Crown,
    Star,
    LayoutDashboard,
    Clock
} from 'lucide-react';
import { clsx } from 'clsx';

const PLANS = [
    {
        id: 'free_trial',
        name: 'Free Trial',
        description: 'Perfect for exploring the platform',
        price: '0',
        duration: '14 days',
        features: [
            '1,000 Messages',
            '100 AI Credits',
            '1 AI Agent',
            'Basic Automation',
            'Community Support'
        ],
        cta: 'Start 14-Day Trial',
        highlight: false,
        icon: <Clock className="w-6 h-6 text-gray-500" />
    },
    {
        id: 'plan_starter',
        name: 'Starter Pro',
        description: 'Best for growing businesses',
        price: '1,999',
        duration: 'monthly',
        features: [
            '10,000 Messages/mo',
            '1,000 AI Credits/mo',
            '1 AI Agent',
            'Advanced Automation',
            'Email Support'
        ],
        cta: 'Choose Starter Pro',
        highlight: true,
        icon: <Crown className="w-6 h-6 text-blue-600" />
    },
    {
        id: 'plan_growth',
        name: 'Growth Hero',
        description: 'For high-volume operations',
        price: '4,999',
        duration: 'monthly',
        features: [
            '50,000 Messages/mo',
            '5,000 AI Credits/mo',
            '5 AI Agents',
            'Priority Automation',
            'Priority Support',
            'API Access'
        ],
        cta: 'Choose Growth Hero',
        highlight: false,
        icon: <Zap className="w-6 h-6 text-purple-600" />
    }
];

export default function OnboardingPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [selectedPlan, setSelectedPlan] = useState<string>('plan_starter');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Load Razorpay script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handlePlanAction = async (planId: string) => {
        setLoading(true);
        setError(null);

        try {
            if (planId === 'free_trial') {
                // Activate trial
                await api.post('/billing/trial');
                router.push('/dashboard');
                return;
            }

            // Create Razorpay Subscription
            const response = await api.post('/billing/subscribe', { planId });
            const subscription = response.data;

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                subscription_id: subscription.id,
                name: 'Aerostic',
                description: `Subscription for ${planId}`,
                image: '/logo.png',
                handler: function (response: any) {
                    console.log('Payment successful:', response);
                    router.push('/dashboard?status=success');
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                },
                theme: {
                    color: '#2563eb'
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        } catch (err: any) {
            console.error('Plan selection error:', err);
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) return null;

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col">
            {/* Header */}
            <header className="py-8 px-6 bg-white border-b">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Aerostic" className="w-10 h-10" />
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Aerostic
                        </span>
                    </div>
                    <div className="hidden md:flex items-center gap-6">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Shield className="w-4 h-4" />
                            Secure Checkout
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Star className="w-4 h-4 text-amber-500" />
                            Trusted by 100+ Brands
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto px-6 py-12 md:py-20 w-full">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                        Choose the Perfect Plan for
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                            Your Business Growth
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600">
                        Start your 14-day free trial or unlock full potential with our Pro plans.
                        Scale your customer engagement with AI.
                    </p>
                </div>

                {error && (
                    <div className="max-w-md mx-auto mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-center font-medium">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                    {PLANS.map((plan) => (
                        <div
                            key={plan.id}
                            className={clsx(
                                "flex flex-col p-8 rounded-3xl border-2 transition-all duration-300 relative group",
                                plan.highlight
                                    ? "bg-white border-blue-500 shadow-2xl scale-105 z-10"
                                    : "bg-white border-gray-100 shadow-xl hover:border-gray-200"
                            )}
                        >
                            {plan.highlight && (
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                                    MOST POPULAR
                                </div>
                            )}

                            <div className="mb-8">
                                <div className={clsx(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center mb-6",
                                    plan.highlight ? "bg-blue-50" : "bg-gray-50"
                                )}>
                                    {plan.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                <p className="text-gray-500 text-sm">{plan.description}</p>
                            </div>

                            <div className="mb-8">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-extrabold text-gray-900">₹{plan.price}</span>
                                    <span className="text-gray-500 text-sm font-medium">/{plan.duration}</span>
                                </div>
                            </div>

                            <ul className="flex-1 space-y-4 mb-10">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-600">
                                        <div className="mt-0.5 w-5 h-5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                                            <Check className="w-3 h-3 text-green-600" />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handlePlanAction(plan.id)}
                                disabled={loading}
                                className={clsx(
                                    "w-full py-4 px-6 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 group",
                                    plan.highlight
                                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25"
                                        : "bg-gray-900 text-white hover:bg-black"
                                )}
                            >
                                {loading && selectedPlan === plan.id ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {plan.cta}
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Bottom Trust Section */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-8 py-12 border-t border-gray-100">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <MessageSquare className="w-6 h-6 text-blue-600" />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">WhatsApp API</h4>
                        <p className="text-xs text-gray-500">Official Meta Business integration</p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Bot className="w-6 h-6 text-purple-600" />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">AI Automation</h4>
                        <p className="text-xs text-gray-500">Gemini-powered smart replies</p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-6 h-6 text-green-600" />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">Secure Billing</h4>
                        <p className="text-xs text-gray-500">Razorpay encrypted payments</p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="w-6 h-6 text-amber-600" />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">High ROI</h4>
                        <p className="text-xs text-gray-500">10x engagement for merchants</p>
                    </div>
                </div>
            </main>

            <footer className="py-8 bg-white border-t text-center text-sm text-gray-500">
                &copy; {new Date().getFullYear()} Aerostic. Professional Customer Engagement Platform.
            </footer>
        </div>
    );
}
