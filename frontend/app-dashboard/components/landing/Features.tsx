'use client';

import { motion } from 'framer-motion';
import {
    Inbox, Bot, Target, BarChart3, Users, Globe,
    MessageSquare, Zap, Shield, Sparkles
} from 'lucide-react';

export default function Features() {
    const features = [
        {
            icon: <Inbox className="w-6 h-6" />,
            title: "Smart Shared Inbox",
            description: "Connect multiple agents and manage all WhatsApp conversations in one collaborative workspace.",
            color: "blue"
        },
        {
            icon: <Bot className="w-6 h-6" />,
            title: "AI Auto-Responses",
            description: "Powered by Gemini AI to handle common queries, qualify leads and schedule appointments 24/7.",
            color: "emerald"
        },
        {
            icon: <Target className="w-6 h-6" />,
            title: "Bulk Broadcasts",
            description: "Send personalized campaign messages to thousands of opt-in customers with smart scheduling.",
            color: "purple"
        },
        {
            icon: <BarChart3 className="w-6 h-6" />,
            title: "Deep Analytics",
            description: "Track read rates, response times, and campaign ROI with enterprise-grade reporting dashboards.",
            color: "amber"
        },
        {
            icon: <Users className="w-6 h-6" />,
            title: "Roles & Permissions",
            description: "Granular access control for Owners, Admins, and Agents to keep your business data secure.",
            color: "indigo"
        },
        {
            icon: <Globe className="w-6 h-6" />,
            title: "Multi-Language Support",
            description: "Translate incoming and outgoing messages instantly to serve a global customer base.",
            color: "pink"
        }
    ];

    const colorMap: Record<string, string> = {
        blue: "bg-blue-500/10 text-blue-500",
        emerald: "bg-emerald-500/10 text-emerald-500",
        purple: "bg-purple-500/10 text-purple-500",
        amber: "bg-amber-500/10 text-amber-500",
        indigo: "bg-indigo-500/10 text-indigo-500",
        pink: "bg-pink-500/10 text-pink-500"
    };

    return (
        <section id="features" className="py-32 bg-gray-900 overflow-hidden relative">
            {/* Background radial glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.05)_0%,_transparent_70%)]" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full mb-6"
                    >
                        <Sparkles className="w-4 h-4 text-emerald-500" />
                        <span className="text-emerald-500 text-sm font-bold uppercase tracking-wider">Powerful Features</span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-bold text-white mb-6"
                    >
                        Everything you need to <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                            Automate & Scale
                        </span>
                    </motion.h2>
                    <p className="text-xl text-gray-400">
                        Professional tools designed for high-growth teams and mission-critical WhatsApp operations.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ y: -5, backgroundColor: "rgba(31, 41, 55, 0.5)" }}
                            className="p-8 rounded-[24px] border border-gray-800 bg-gray-800/30 transition-all duration-300 group"
                        >
                            <div className={`w-14 h-14 rounded-xl ${colorMap[feature.color]} flex items-center justify-center mb-8 shadow-inner`}>
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-4 group-hover:text-emerald-400 transition-colors">{feature.title}</h3>
                            <p className="text-gray-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-20 p-8 rounded-[32px] bg-gradient-to-r from-emerald-500 to-teal-600 flex flex-col md:flex-row items-center justify-between shadow-2xl shadow-emerald-500/20 overflow-hidden relative"
                >
                    {/* Decorative mesh */}
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

                    <div className="relative z-10 text-center md:text-left mb-8 md:mb-0">
                        <h3 className="text-2xl font-black text-white mb-2 underline decoration-emerald-300 underline-offset-4">Ready to try it out?</h3>
                        <p className="text-emerald-50 text-lg font-medium">Join 2,500+ businesses and start your 14-day trial today.</p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative z-10 bg-white text-gray-900 px-10 py-4 rounded-2xl font-black text-lg shadow-xl shadow-black/10 hover:bg-emerald-50 transition-colors"
                    >
                        Get Started Now
                    </motion.button>
                </motion.div>
            </div>
        </section>
    );
}
