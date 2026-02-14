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
    Clock,
    List,
    Code,
    Webhook,
    GitPullRequest
} from 'lucide-react';
import { clsx } from 'clsx';

// Feature mapping matching Admin Panel
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

export default function OnboardingPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [selectedPlan, setSelectedPlan] = useState<string>('plan_starter');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [plansLoading, setPlansLoading] = useState(true);

    useEffect(() => {
        // Load Razorpay script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        fetchPlans();

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    const fetchPlans = async () => {
        try {
            const res = await api.get('/billing/available-plans');
            setPlans(res.data);
        } catch (err) {
            console.error('Failed to fetch plans', err);
            setError('Failed to load plans. Please refresh.');
        } finally {
            setPlansLoading(false);
        }
    };

    const handlePlanAction = async (planId: string) => {
        setLoading(true);
        setError(null);
        setSelectedPlan(planId);

        try {
            if (planId === 'free_trial') {
                // Activate trial
                await api.post('/billing/trial');
                // Force reload to update auth state/subscription check
                window.location.href = '/dashboard';
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
                    // Force reload to update auth state/subscription check
                    window.location.href = '/dashboard?status=success';
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
            setLoading(false);
        }
    };

    if (authLoading || plansLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Combine Free Trial with fetched plans
    const allPlans = [
        {
            id: 'free_trial',
            name: 'Free Trial',
            description: 'Perfect for exploring the platform',
            price: 0,
            duration: '7 days',
            setupFee: 0,
            features: ['1,000 Messages', '100 AI Credits', '1 AI Agent', 'Basic Automation'],
            isStatic: true,
            highlight: false,
            icon: <Clock className="w-6 h-6 text-gray-500" />
        },
        ...plans.map(p => ({
            ...p,
            duration: 'monthly',
            isStatic: false,
            highlight: p.name.includes('Starter 2') || p.name.includes('Growth'), // Auto-highlight popular plans
            icon: p.price > 4000 ? <Zap className="w-6 h-6 text-purple-600" /> : <Crown className="w-6 h-6 text-blue-600" />
        }))
    ];

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
                        Start your 7-day free trial or unlock full potential with our Pro plans.
                        Scale your customer engagement with AI.
                    </p>
                </div>

                {error && (
                    <div className="max-w-md mx-auto mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-center font-medium">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch">
                    {allPlans.map((plan) => (
                        <div
                            key={plan.id}
                            className={clsx(
                                "flex flex-col p-6 rounded-3xl border-2 transition-all duration-300 relative group",
                                plan.highlight
                                    ? "bg-white border-blue-500 shadow-xl scale-105 z-10"
                                    : "bg-white border-gray-100 shadow-lg hover:border-gray-200"
                            )}
                        >
                            {plan.highlight && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg tracking-wider">
                                    MOST POPULAR
                                </div>
                            )}

                            <div className="mb-6">
                                <div className={clsx(
                                    "w-10 h-10 rounded-xl flex items-center justify-center mb-4",
                                    plan.highlight ? "bg-blue-50" : "bg-gray-50"
                                )}>
                                    {plan.icon}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h3>
                                <p className="text-gray-500 text-xs line-clamp-2 h-8">
                                    {plan.description || (plan.price > 0 ? 'Full featured pro plan' : 'Trial plan')}
                                </p>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-extrabold text-gray-900">₹{plan.price.toLocaleString()}</span>
                                    <span className="text-gray-500 text-xs font-medium">/{plan.duration}</span>
                                </div>
                                {plan.setupFee > 0 && (
                                    <p className="text-xs text-gray-500 mt-1">+ ₹{plan.setupFee.toLocaleString()} setup fee</p>
                                )}
                            </div>

                            <div className="flex-1 mb-8">
                                <ul className="space-y-3">
                                    {/* Limits Display for DB Plans */}
                                    {!plan.isStatic && plan.limits && (
                                        <>
                                            <li className="flex items-start gap-2 text-xs text-gray-600">
                                                <Check className="w-3.5 h-3.5 text-green-600 mt-0.5" />
                                                <span className="font-medium">{plan.limits.monthly_messages === -1 ? 'Unlimited' : plan.limits.monthly_messages.toLocaleString()}</span> Messages
                                            </li>
                                            <li className="flex items-start gap-2 text-xs text-gray-600">
                                                <Check className="w-3.5 h-3.5 text-green-600 mt-0.5" />
                                                <span className="font-medium">{plan.limits.ai_credits === -1 ? 'Unlimited' : plan.limits.ai_credits.toLocaleString()}</span> AI Credits
                                            </li>
                                        </>
                                    )}

                                    {/* Features Display */}
                                    {plan.features.map((feature, idx) => {
                                        // For static plans (trial), feature is just a string
                                        // For DB plans, it's a feature code that needs mapping
                                        let label = feature;
                                        if (!plan.isStatic) {
                                            const mapped = FEATURE_MAP[feature];
                                            if (!mapped) return null; // Skip unknown features
                                            label = mapped.label;
                                        }

                                        return (
                                            <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                                                <Check className="w-3.5 h-3.5 text-green-600 mt-0.5" />
                                                {label}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>

                            <button
                                onClick={() => handlePlanAction(plan.id)}
                                disabled={loading}
                                className={clsx(
                                    "w-full py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 group",
                                    plan.highlight
                                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25"
                                        : "bg-gray-900 text-white hover:bg-black"
                                )}
                            >
                                {loading && selectedPlan === plan.id ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {plan.price === 0 ? 'Start Trial' : `Choose ${plan.name}`}
                                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
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
