'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Play, CheckCircle2, Sparkles, Zap, Shield } from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';

export default function Hero() {
    return (
        <section className="relative pt-32 pb-24 md:pt-64 md:pb-48 overflow-hidden bg-white">
            {/* Neural Background Matrix */}
            <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-emerald-50 rounded-full blur-[120px] opacity-40 -translate-y-1/2 translate-x-1/4 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-50 rounded-full blur-[120px] opacity-30 translate-y-1/2 -translate-x-1/4" />
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center max-w-5xl mx-auto">
                    {/* Premium Protocol Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="inline-flex items-center gap-3 bg-white border-2 border-emerald-100 px-6 py-2 rounded-full mb-12 shadow-xl shadow-emerald-100/20"
                    >
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-[.4em]">Official Meta Nexus Node V4.0</span>
                    </motion.div>

                    {/* High-Velocity Headline */}
                    <motion.h1 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "circOut" }}
                        className="text-5xl md:text-9xl font-black tracking-tighter text-gray-900 leading-[0.9] mb-12"
                    >
                        THE SAFEST WAY TO <br />
                        <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 bg-clip-text text-transparent italic">
                            SCALE WHATSAPP
                        </span>
                    </motion.h1>

                    {/* Operational Subheading */}
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.2, delay: 0.3 }}
                        className="text-lg md:text-2xl font-bold text-gray-400 max-w-3xl mx-auto leading-relaxed uppercase tracking-tighter mb-16"
                    >
                        Orchestrate global sales and support with the official <span className="text-black">Meta Cloud Protocol</span>. 
                        Zero bot-bans, 100% compliance, and hyper-automated engagement.
                    </motion.p>

                    {/* Tactical Mobilization CTAs */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24"
                    >
                        <Link
                            href="https://app.aimstore.in/register"
                            className="w-full sm:w-auto px-12 py-6 bg-black text-white rounded-[24px] text-[10px] font-black uppercase tracking-[.3em] hover:bg-emerald-600 transition-all shadow-2xl flex items-center justify-center gap-4 group"
                        >
                            <span>Initialize Protocol</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/contact"
                            className="w-full sm:w-auto px-12 py-6 bg-white border-2 border-gray-100 rounded-[24px] text-[10px] font-black uppercase tracking-[.3em] text-gray-900 hover:border-black transition-all flex items-center justify-center gap-4 group"
                        >
                            <Play className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                            <span>Neural Sandbox</span>
                        </Link>
                    </motion.div>

                    {/* Trust Infrastructure Matrix */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 1 }}
                        className="flex flex-wrap items-center justify-center gap-10 md:gap-16 pt-12 border-t border-gray-100"
                    >
                        {[
                            { label: "Zero Setup Cost", icon: Zap },
                            { label: "14-Day Free Evaluation", icon: Sparkles },
                            { label: "Nexus Node Security", icon: Shield }
                        ].map((node) => (
                            <div key={node.label} className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:scale-110 transition-transform">
                                    <node.icon size={18} strokeWidth={3} />
                                </div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{node.label}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
            
            {/* Scroll Indicator */}
            <motion.div 
                animate={{ y: [0, 10, 0] }} 
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-200 hidden md:block"
            >
                <div className="w-6 h-10 rounded-full border-2 border-gray-100 flex items-start justify-center p-1">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                </div>
            </motion.div>
        </section>
    );
}
