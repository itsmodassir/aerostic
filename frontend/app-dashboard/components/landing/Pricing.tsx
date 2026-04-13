"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Zap, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

export default function Pricing() {
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const res = await api.get('/billing/available-plans');
            setPlans(res.data);
        } catch (err) {
            console.error('Failed to fetch plans', err);
        } finally {
            setLoading(false);
        }
    };

    const colors = ['blue', 'emerald', 'purple', 'orange'];
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
        'ai_classification': 'AI Classification'
    };

    if (loading) return (
        <div className="py-24 flex justify-center">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        </div>
    );

    const displayPlans = plans.map((p, idx) => ({
        name: p.name,
        subtitle: p.price === 0 ? "For individuals" : (p.price > 10000 ? "High-volume businesses" : "For growing teams"),
        price: p.price.toLocaleString(),
        setupFee: `₹${(p.setupFee || 0).toLocaleString()} setup`,
        description: p.description || (p.price === 0 ? "Best for beginners" : "Full power for scaling"),
        features: [
            ...(p.limits?.monthly_messages ? [`${p.limits.monthly_messages === -1 ? 'Unlimited' : p.limits.monthly_messages.toLocaleString()} messages/mo`] : []),
            ...(p.limits?.ai_credits ? [`${p.limits.ai_credits === -1 ? 'Unlimited' : p.limits.ai_credits.toLocaleString()} AI credits`] : []),
            ...p.features.map((f: string) => FEATURE_MAP[f] || f)
        ],
        cta: p.price === 0 ? "Get Started" : `Choose ${p.name}`,
        highlight: plans.length > 2 ? idx === 1 : (plans.length === 2 ? idx === 1 : false),
        color: colors[idx % colors.length]
    }));

    const addOns = [
        { name: "WhatsApp API approval support", price: "₹2,000" },
        { name: "CRM (custom build)", price: "₹10,000+" },
        { name: "AI chatbot training", price: "₹5,000" },
        { name: "Payment gateway (Razorpay)", price: "₹3,000" },
        { name: "Website + WhatsApp integration", price: "₹7,000" }
    ];

    return (
        <section id="pricing" className="py-24 bg-gray-50 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.h2
                        initial={false}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
                    >
                        Transparent <span className="text-emerald-500">Pricing</span>
                    </motion.h2>
                    <p className="text-xl text-gray-600">
                        Choose the plan that fits your business stage. No hidden costs.
                    </p>
                </div>

                {/* Plans Grid */}
                <div className={`grid gap-6 mb-24 ${displayPlans.length === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' : 'md:grid-cols-2 xl:grid-cols-4'}`}>
                    {displayPlans.map((plan, idx) => (
                        <motion.div
                            key={idx}
                            initial={false}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className={`flex flex-col relative rounded-3xl overflow-hidden transition-all duration-300 ${plan.highlight
                                ? 'bg-gray-900 text-white shadow-2xl md:scale-105 z-10 border-2 border-emerald-500'
                                : 'bg-white text-gray-900 border border-gray-100 shadow-xl hover:shadow-2xl'
                                }`}
                        >
                            {plan.highlight && (
                                <div className="bg-emerald-500 text-white text-center py-2 text-xs font-bold uppercase tracking-widest">
                                    Most Popular
                                </div>
                            )}

                            <div className="p-8 flex-grow">
                                <div className="mb-6">
                                    <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
                                    <p className={`text-sm font-medium ${plan.highlight ? 'text-emerald-400' : 'text-gray-500'}`}>
                                        {plan.subtitle}
                                    </p>
                                </div>

                                <div className="mb-8">
                                    <div className="flex items-baseline">
                                        <span className="text-2xl font-bold mr-1">₹</span>
                                        <span className="text-5xl font-black tracking-tight">{plan.price}</span>
                                        <span className={`text-sm font-bold ml-2 ${plan.highlight ? 'text-gray-400' : 'text-gray-500'}`}>/mo</span>
                                    </div>
                                    <p className={`text-sm mt-2 font-bold ${plan.highlight ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {plan.setupFee}
                                    </p>
                                </div>

                                <p className={`text-sm mb-8 italic ${plan.highlight ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {plan.description}
                                </p>

                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature: string, i: number) => (
                                        <li key={i} className="flex items-start">
                                            <Check className={`w-5 h-5 mr-3 shrink-0 ${plan.highlight ? 'text-emerald-400' : 'text-emerald-500'}`} />
                                            <span className={`text-sm font-medium leading-relaxed ${plan.highlight ? 'text-gray-300' : 'text-gray-600'}`}>
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="p-8 pt-0 mt-auto">
                                <Link
                                    href="/register"
                                    className={`block w-full py-4 rounded-xl text-center font-bold text-lg transition-all ${plan.highlight
                                        ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/30'
                                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                        }`}
                                >
                                    {plan.cta}
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Enterprise & Add-ons Section */}
                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Enterprise Card */}
                    <motion.div
                        initial={false}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                        <div className="relative z-10">
                            <span className="inline-block px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest mb-6">
                                Enterprise
                            </span>
                            <h3 className="text-3xl font-black mb-4">Enterprise / Custom</h3>
                            <p className="text-gray-400 mb-8 text-lg">
                                Need more? Get a tailored solution for your specific business requirements.
                            </p>
                            <Link
                                href="/contact"
                                className="inline-flex items-center space-x-2 bg-white text-gray-900 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                            >
                                <span>Contact Sales</span>
                                <Zap className="w-4 h-4" />
                            </Link>
                        </div>
                    </motion.div>

                    {/* Add-ons List */}
                    <motion.div
                        initial={false}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-3xl p-10 border border-gray-100 shadow-xl"
                    >
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <Plus className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">Optional Add-Ons</h3>
                        </div>

                        <div className="space-y-4">
                            {addOns.map((addon, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-emerald-200 transition-colors">
                                    <span className="font-medium text-gray-700">{addon.name}</span>
                                    <span className="font-bold text-emerald-600">{addon.price}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
