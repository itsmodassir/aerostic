'use client';

import { motion } from 'framer-motion';
import { AlertCircle, XCircle, TrendingDown, ShieldAlert, Cpu, Activity } from 'lucide-react';

export default function Problem() {
    const painPoints = [
        {
            icon: <ShieldAlert size={20} strokeWidth={3} />,
            title: "TERMINAL BAN RISK",
            description: "Unofficial protocols and Chrome extensions trigger permanent Meta account neutralization.",
            color: "text-red-500",
            bg: "bg-red-500/10"
        },
        {
            icon: <Activity size={20} strokeWidth={3} />,
            title: "THROUGHPUT COLLAPSE",
            description: "Generic infrastructure fails during high-velocity traffic, halting business operations.",
            color: "text-orange-500",
            bg: "bg-orange-500/10"
        },
        {
            icon: <Cpu size={20} strokeWidth={3} />,
            title: "ZERO NEURAL SUPPORT",
            description: "Non-official tools lack the direct API-level stability required for enterprise growth.",
            color: "text-amber-500",
            bg: "bg-amber-500/10"
        }
    ];

    return (
        <section id="features" className="py-32 bg-white relative overflow-hidden border-t border-gray-50">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <div className="grid lg:grid-cols-2 gap-24 items-center">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="inline-block px-5 py-2 rounded-full bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-[.4em] mb-12"
                        >
                            THREAT ASSESSMENT
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-black text-gray-900 mb-10 leading-[0.9] tracking-tighter"
                        >
                            STOP GAMBLING <br />
                            WITH YOUR <span className="text-red-500 italic">REACH</span>
                        </motion.h2>

                        <p className="text-xl font-bold text-gray-400 mb-16 leading-relaxed uppercase tracking-tighter">
                            Most businesses use unstable, unofficial tools that put their <span className="text-black">Entire Customer Base</span> at risk of permanent suspension.
                        </p>

                        <div className="grid gap-6">
                            {painPoints.map((point, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 + idx * 0.1 }}
                                    className="flex items-start gap-6 p-8 rounded-[28px] bg-gray-50/50 border border-transparent hover:border-red-100 hover:bg-white transition-all group lg:w-4/5"
                                >
                                    <div className={`p-4 rounded-2xl ${point.bg} ${point.color} group-hover:scale-110 transition-transform`}>
                                        {point.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-[10px] font-black tracking-[.2em] text-gray-900 mb-2 uppercase">{point.title}</h3>
                                        <p className="text-sm font-bold text-gray-400 leading-snug">{point.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="relative"
                    >
                        {/* High-End Diagnostic Interface */}
                        <div className="absolute inset-0 bg-red-500/10 blur-[150px] rounded-full animate-pulse" />
                        <div className="relative bg-black rounded-[48px] p-12 shadow-[0_40px_100px_rgba(0,0,0,0.3)] border border-gray-800 overflow-hidden">
                            {/* Scanning line effect */}
                            <motion.div 
                                animate={{ y: [0, 600, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-20 z-10" 
                            />
                            
                            <div className="flex items-center gap-3 mb-12">
                                <div className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                </div>
                                <span className="text-[10px] font-black text-red-500 uppercase tracking-[.3em]">System Critical Failure</span>
                            </div>

                            <div className="space-y-8 relative z-20">
                                <div className="space-y-3">
                                    <div className="h-3 bg-gray-900 rounded-full w-4/5 border border-gray-800" />
                                    <div className="h-3 bg-gray-900 rounded-full w-1/2 border border-gray-800" />
                                </div>
                                
                                <div className="p-8 bg-red-500/5 border border-red-500/30 rounded-3xl flex flex-col gap-4">
                                    <div className="flex items-center gap-4">
                                        <XCircle className="text-red-500" size={24} />
                                        <span className="font-black text-red-500 uppercase tracking-widest text-xs">Access Terminated</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-red-400 mt-2 leading-relaxed">
                                        META-ENFORCEMENT DETECTED UNOFFICIAL PROTOCOL INJECTION. <br />
                                        PERMANENT ACCOUNT SHUTDOWN INITIALIZED.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-6 pt-12">
                                    <div className="p-6 bg-gray-900/50 rounded-3xl border border-gray-800 text-center">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Reachable Clients</p>
                                        <p className="text-4xl font-black text-white">0%</p>
                                    </div>
                                    <div className="p-6 bg-gray-900/50 rounded-3xl border border-red-500/20 text-center">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Revenue Loss</p>
                                        <p className="text-4xl font-black text-red-500 animate-pulse">MAX</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
