'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Globe, MessageSquare, Cpu, Layers, Sparkles } from 'lucide-react';

export default function Solution() {
    const benefits = [
        {
            icon: <ShieldCheck size={28} strokeWidth={3} />,
            title: "OFFICIAL META PROTOCOL",
            description: "Direct-to-Meta encryption layers ensure absolute compliance and 100% account sovereignty.",
            gradient: "from-emerald-500 to-emerald-600"
        },
        {
            icon: <Zap size={28} strokeWidth={3} />,
            title: "NEURAL ONBOARDING",
            description: "Synchronize your business identity in milliseconds with our embedded authentication matrix.",
            gradient: "from-emerald-600 to-teal-600"
        },
        {
            icon: <Globe size={28} strokeWidth={3} />,
            title: "GLOBAL THROUGHPUT",
            description: "Elastic infrastructure designed for high-velocity global broadcasting and 99.9% delivery rates.",
            gradient: "from-teal-500 to-emerald-500"
        }
    ];

    return (
        <section id="solutions" className="py-32 bg-gray-50/30 relative overflow-hidden border-b border-gray-50">
            {/* Neural Background Decor */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center max-w-4xl mx-auto mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block px-5 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-[.4em] mb-12"
                    >
                        THE AER<span>O</span>STIC ADVANTAGE
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-8xl font-black text-gray-900 mb-10 leading-[0.9] tracking-tighter"
                    >
                        ENTERPRISE-GRADE <br />
                        <span className="text-emerald-500 italic">OFFICIAL ACCESS</span>
                    </motion.h2>
                    <p className="text-xl md:text-2xl font-bold text-gray-400 max-w-2xl mx-auto leading-relaxed uppercase tracking-tighter">
                        We deploy a hardware-accelerated bridge between your business and <span className="text-black">Meta Global Systems</span>.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-10">
                    {benefits.map((benefit, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 + idx * 0.1 }}
                            whileHover={{ y: -12 }}
                            className="bg-white p-12 rounded-[40px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] relative group overflow-hidden"
                        >
                            {/* Abstract card decor */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 dark:bg-emerald-900/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <div className={`w-20 h-20 rounded-[28px] bg-gradient-to-br ${benefit.gradient} flex items-center justify-center text-white mb-10 shadow-xl shadow-emerald-100/40 transform transition-all duration-500 group-hover:rotate-12 group-hover:scale-110`}>
                                {benefit.icon}
                            </div>
                            
                            <h3 className="text-[12px] font-black tracking-[.3em] text-gray-900 mb-4 uppercase">{benefit.title}</h3>
                            <p className="text-base font-bold text-gray-400 leading-snug mb-10">{benefit.description}</p>

                            <div className="pt-8 border-t border-gray-50 flex items-center justify-between">
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active Node</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
