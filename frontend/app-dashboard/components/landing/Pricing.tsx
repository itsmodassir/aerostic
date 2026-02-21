'use client';

import { motion } from 'framer-motion';
import { Check, X, Zap, Plus } from 'lucide-react';
import Link from 'next/link';

export default function Pricing() {
    const plans = [
        {
            name: "Starter",
            subtitle: "For small businesses & individuals",
            price: "999",
            setupFee: "₹1,999 setup",
            description: "Best for: Local businesses, solo agents, beginners",
            features: [
                "WhatsApp API onboarding (1 number)",
                "100 AI credits / month",
                "Auto-reply bot (1 basic)",
                "Human takeover",
                "Unlimited Contact",
                "5,000 broadcasts / month (Meta fee extra)",
                "Lead capture from WhatsApp chats",
                "Google Sheet integration (1 sheet)",
                "Basic keyword-based lead filtering",
                "Daily lead sync",
                "7 days support"
            ],
            cta: "Get Started",
            highlight: false,
            color: "blue"
        },
        {
            name: "Starter 2",
            subtitle: "More power for small businesses",
            price: "2,499",
            setupFee: "₹1,999 setup",
            description: "Best for: Local businesses, solo agents, beginners",
            features: [
                "WhatsApp API onboarding (1 number)",
                "500 AI credits / month",
                "Auto-reply bot (3 bots)",
                "Human takeover",
                "Unlimited Contact",
                "20,000 broadcasts / month (Meta fee extra)",
                "Lead capture from WhatsApp chats",
                "Google Sheet integration (1 sheet)",
                "Basic keyword-based lead filtering",
                "Daily lead sync",
                "7 days support"
            ],
            cta: "Get Started",
            highlight: false,
            color: "emerald"
        },
        {
            name: "Growth",
            subtitle: "Most Popular",
            price: "3,999",
            setupFee: "₹0 setup",
            description: "Best for: Real estate agents, coaches, service providers",
            features: [
                "Everything in Starter",
                "WhatsApp API (up to 3 numbers)",
                "1000 AI credits / month",
                "Unlimited Contact",
                "Unlimited broadcasts / month",
                "Smart lead detection (name, phone, requirement)",
                "Google Sheets + CRM sync",
                "Group message lead extraction",
                "Auto follow-up sequences (Day 1, 3, 7)",
                "Admin dashboard (leads, status, source)",
                "Campaign scheduler",
                "30 days support"
            ],
            cta: "Choose Growth",
            highlight: true,
            color: "purple"
        },
        {
            name: "Professional",
            subtitle: "High-volume businesses",
            price: "6,999",
            setupFee: "₹29,999 setup",
            description: "Best for: Agencies, builders, marketing teams",
            features: [
                "Everything in Growth",
                "Up to 5 WhatsApp numbers",
                "Multi-client dashboard",
                "Advanced lead tagging & pipeline",
                "AI-based message classification",
                "Duplicate lead detection",
                "Google Sheet + Webhook + API access",
                "Role-based access (Admin / Agent)",
                "Priority support (WhatsApp + Call)"
            ],
            cta: "Go Professional",
            highlight: false,
            color: "orange"
        }
    ];

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
                        initial={{ opacity: 0, y: 20 }}
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
                <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-24">
                    {plans.map((plan, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
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
                                        + {plan.setupFee}
                                    </p>
                                </div>

                                <p className={`text-sm mb-8 italic ${plan.highlight ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {plan.description}
                                </p>

                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature, i) => (
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
                                    href="https://app.aerostic.com/register"
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
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                        <div className="relative z-10">
                            <span className="inline-block px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest mb-6">
                                Red Plan
                            </span>
                            <h3 className="text-3xl font-black mb-4">Enterprise / Custom</h3>
                            <p className="text-gray-400 mb-8 text-lg">
                                Need more? Get a tailored solution for your specific requirements breakdown.
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
                        initial={{ opacity: 0, x: 20 }}
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
