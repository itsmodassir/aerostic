'use client';

import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

export default function Comparison() {
    const comparisons = [
        { feature: "Official Meta API Access", aerostic: true, others: false },
        { feature: "Zero Risk of Number Bans", aerostic: true, others: false },
        { feature: "AI Chatbot Agents (Gemini Pro)", aerostic: true, others: "Extra Cost" },
        { feature: "Multi-Agent Shared Inbox", aerostic: true, others: true },
        { feature: "Advanced Lead Matching", aerostic: true, others: false },
        { feature: "24/7 Dedicated Support", aerostic: true, others: false },
        { feature: "No Performance Lag", aerostic: true, others: false },
    ];

    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.h2
                        initial={false}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl font-bold text-gray-900 mb-6"
                    >
                        Why Choose <span className="text-emerald-500">Aerostic?</span>
                    </motion.h2>
                    <p className="text-xl text-gray-600">
                        See how we compare against generic WhatsApp automation tools and unofficial chrome extensions.
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] border-collapse">
                        <thead>
                            <tr className="border-b-2 border-gray-100">
                                <th className="py-6 px-8 text-left text-lg font-bold text-gray-900">Platform Features</th>
                                <th className="py-6 px-8 text-center bg-emerald-50/50 rounded-t-3xl">
                                    <div className="flex flex-col items-center">
                                        <span className="text-emerald-600 font-black text-xl mb-1">AEROSTIC</span>
                                        <span className="text-emerald-500 text-xs font-bold uppercase tracking-widest">The Leader</span>
                                    </div>
                                </th>
                                <th className="py-6 px-8 text-center text-gray-400 text-lg font-medium">Others</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comparisons.map((row, idx) => (
                                <motion.tr
                                    key={idx}
                                    initial={false}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                                >
                                    <td className="py-6 px-8 text-gray-700 font-medium">{row.feature}</td>
                                    <td className="py-6 px-8 text-center bg-emerald-50/30">
                                        <div className="flex justify-center">
                                            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                                                <Check className="w-6 h-6 stroke-[3]" />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6 px-8 text-center">
                                        <div className="flex flex-col items-center">
                                            {typeof row.others === 'string' ? (
                                                <span className="text-amber-500 font-bold text-sm uppercase">{row.others}</span>
                                            ) : row.others ? (
                                                <Check className="w-6 h-6 text-emerald-500/50" />
                                            ) : (
                                                <X className="w-6 h-6 text-red-400" />
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-16 text-center">
                    <p className="text-gray-500 font-medium italic">
                        * Comparison based on standard market alternatives as of Q1 2026.
                    </p>
                </div>
            </div>
        </section>
    );
}
