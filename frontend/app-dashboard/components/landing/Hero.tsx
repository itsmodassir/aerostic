'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-white">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[800px] h-[800px] bg-emerald-50 rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[600px] h-[600px] bg-blue-50 rounded-full blur-3xl opacity-30" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center max-w-4xl mx-auto">
                    {/* Badge */}
                    <motion.div
                        initial={false}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-100 px-4 py-1.5 rounded-full mb-8"
                    >
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm font-semibold text-emerald-700 uppercase tracking-wider">Official Meta Cloud API</span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={false}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl md:text-7xl font-bold tracking-tight text-gray-900 mb-8"
                    >
                        The Safest Way to Scale <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600">
                            WhatsApp Business
                        </span>
                    </motion.h1>

                    {/* Subheading */}
                    <motion.p
                        initial={false}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-xl text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto"
                    >
                        Scale your sales and support with the official WhatsApp Marketing & Automation Platform.
                        100% compliance, zero bot bans, and direct Meta integration.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        initial={false}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16"
                    >
                        <Link
                            href="https://app.aimstore.in/register"
                            className="group bg-emerald-500 text-white px-8 py-4 rounded-2xl text-lg font-bold flex items-center space-x-2 hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-200 hover:-translate-y-1"
                        >
                            <span>Get Official API Access</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/contact"
                            className="group bg-white border-2 border-gray-100 px-8 py-4 rounded-2xl text-lg font-bold flex items-center space-x-2 hover:bg-gray-50 transition-all hover:-translate-y-1"
                        >
                            <Play className="w-5 h-5 text-emerald-500 fill-emerald-500" />
                            <span>Talk to an Expert</span>
                        </Link>
                    </motion.div>

                    {/* Trust Badges */}
                    <motion.div
                        initial={false}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="flex flex-wrap items-center justify-center gap-8 md:gap-12"
                    >
                        {[
                            "No Setup Fees",
                            "14-Day Free Trial",
                            "Cancel Anytime"
                        ].map((badge) => (
                            <div key={badge} className="flex items-center space-x-2 text-gray-500 font-medium">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                <span>{badge}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
