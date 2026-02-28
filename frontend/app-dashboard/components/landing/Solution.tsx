'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Globe, MessageSquare } from 'lucide-react';

export default function Solution() {
    const benefits = [
        {
            icon: <ShieldCheck className="w-8 h-8" />,
            title: "100% Meta Compliant",
            description: "Direct integration with Meta Cloud API ensures your account always stays safe and active.",
            gradient: "from-emerald-500 to-teal-600"
        },
        {
            icon: <Zap className="w-8 h-8" />,
            title: "Instant Setup",
            description: "Connect your number in seconds with our official embedded signup flow. No long waiting times.",
            gradient: "from-blue-500 to-indigo-600"
        },
        {
            icon: <Globe className="w-8 h-8" />,
            title: "Global Reach",
            description: "Broadcast to customers worldwide with localized support and high delivery guarantee.",
            gradient: "from-purple-500 to-pink-600"
        }
    ];

    return (
        <section className="py-24 bg-gray-50 relative overflow-hidden">
            {/* Abstract shapes */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-1/4 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.div
                        initial={false}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-sm font-bold uppercase tracking-wider mb-6"
                    >
                        The Aimstors Solution Edge
                    </motion.div>
                    <motion.h2
                        initial={false}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
                    >
                        Enterprise-Grade <br />
                        <span className="text-emerald-500">Official API Access</span>
                    </motion.h2>
                    <p className="text-xl text-gray-600">
                        We provide a secure bridge between your business and Meta,
                        giving you the stability you need to grow without limits.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {benefits.map((benefit, idx) => (
                        <motion.div
                            key={idx}
                            initial={false}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 + idx * 0.1 }}
                            whileHover={{ y: -10 }}
                            className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/40 relative group"
                        >
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center text-white mb-8 shadow-lg transition-transform group-hover:scale-110 duration-300`}>
                                {benefit.icon}
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{benefit.description}</p>

                            <div className="mt-8 pt-8 border-t border-gray-50">
                                <span className="text-emerald-600 font-bold flex items-center text-sm group-hover:translate-x-1 transition-transform">
                                    Learn more <Zap className="w-4 h-4 ml-1 fill-emerald-600" />
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
