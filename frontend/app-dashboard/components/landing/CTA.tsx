'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function CTA() {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="bg-gray-900 rounded-[48px] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl"
                >
                    {/* Animated background blobs */}
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl animate-pulse" />

                    <div className="relative z-10 max-w-3xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full mb-8"
                        >
                            <Sparkles className="w-4 h-4 text-emerald-500" />
                            <span className="text-emerald-500 text-sm font-bold uppercase tracking-widest">Start for free today</span>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight"
                        >
                            Grow your business with <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400">
                                Official WhatsApp API
                            </span>
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
                        >
                            Join 2,500+ businesses who trust Aerostic to handle their mission-critical
                            WhatsApp communication. 14-day free trial on all plans.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
                        >
                            <Link
                                href="https://app.aerostic.in/auth"
                                className="w-full sm:w-auto bg-emerald-500 text-white px-10 py-5 rounded-2xl text-xl font-black flex items-center justify-center space-x-2 hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/25 hover:-translate-y-1"
                            >
                                <span>🚀 Get Started Free</span>
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                href="/contact"
                                className="w-full sm:w-auto bg-white/5 text-white border border-white/10 px-10 py-5 rounded-2xl text-xl font-black flex items-center justify-center space-x-2 hover:bg-white/10 transition-all hover:-translate-y-1"
                            >
                                <span>Talk to Sales</span>
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5 }}
                            className="mt-12 text-gray-500 font-medium"
                        >
                            No credit card required. Cancel anytime.
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
