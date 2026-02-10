'use client';

import { motion } from 'framer-motion';
import { AlertCircle, XCircle, TrendingDown } from 'lucide-react';

export default function Problem() {
    const painPoints = [
        {
            icon: <XCircle className="w-6 h-6" />,
            title: "Risk of Number Bans",
            description: "Using unofficial APIs or Chrome extensions leads to permanent WhatsApp bans.",
            color: "text-red-500",
            bg: "bg-red-50"
        },
        {
            icon: <TrendingDown className="w-6 h-6" />,
            title: "Poor Delivery Rates",
            description: "Generic solutions often fail to deliver messages during peak traffic hours.",
            color: "text-orange-500",
            bg: "bg-orange-50"
        },
        {
            icon: <AlertCircle className="w-6 h-6" />,
            title: "Zero Support",
            description: "No dedicated support means your business stops when the automation breaks.",
            color: "text-amber-500",
            bg: "bg-amber-50"
        }
    ];

    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="inline-block px-4 py-1.5 rounded-full bg-red-50 border border-red-100 text-red-600 text-sm font-bold uppercase tracking-wider mb-6"
                        >
                            The Status Quo
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight"
                        >
                            Stop Gambling with your <br />
                            <span className="text-red-500">WhatsApp Presence</span>
                        </motion.h2>

                        <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                            Most businesses use unstable, unofficial tools that put their brand at risk every single day.
                            Don't wait for a ban to realize you need a professional solution.
                        </p>

                        <div className="space-y-6">
                            {painPoints.map((point, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 + idx * 0.1 }}
                                    className="flex items-start space-x-4 p-6 rounded-2xl border border-gray-100 hover:border-red-100 hover:bg-red-50/10 transition-colors"
                                >
                                    <div className={`p-3 rounded-xl ${point.bg} ${point.color}`}>
                                        {point.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">{point.title}</h3>
                                        <p className="text-gray-600">{point.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-red-500/5 blur-[100px] rounded-full" />
                        <div className="relative bg-gray-900 rounded-[32px] p-8 shadow-2xl border border-gray-800">
                            <div className="flex items-center space-x-2 mb-8">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <div className="w-3 h-3 rounded-full bg-amber-500" />
                                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                            </div>

                            <div className="space-y-4">
                                <div className="h-4 bg-gray-800 rounded-full w-3/4" />
                                <div className="h-4 bg-gray-800 rounded-full w-1/2" />
                                <div className="pt-8 space-y-4">
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center space-x-3">
                                        <XCircle className="w-6 h-6 text-red-500" />
                                        <span className="text-red-400 font-mono text-sm">CRITICAL: Account suspended by Meta</span>
                                    </div>
                                    <div className="p-4 bg-gray-800/50 rounded-xl">
                                        <div className="h-3 bg-gray-700 rounded-full w-full mb-2" />
                                        <div className="h-3 bg-gray-700 rounded-full w-2/3" />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 text-center">
                                <p className="text-red-500 font-bold mb-2">Loss of Revenue</p>
                                <p className="text-5xl font-black text-white">400%</p>
                                <p className="text-gray-500 text-sm mt-2">Avg. impact of unstable automation</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
