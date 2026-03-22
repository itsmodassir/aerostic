'use client';

import { motion } from 'framer-motion';

export default function TrustStrip() {
    const logos = [
        { name: 'TechCorp', color: 'bg-indigo-500' },
        { name: 'RetailPro', color: 'bg-emerald-500' },
        { name: 'FinanceHub', color: 'bg-blue-600' },
        { name: 'EduLearn', color: 'bg-amber-500' },
        { name: 'HealthPlus', color: 'bg-rose-500' },
        { name: 'FoodExpress', color: 'bg-orange-600' },
    ];

    return (
        <section className="py-20 bg-white border-y border-gray-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <p className="text-center text-[10px] font-black text-gray-300 uppercase tracking-[.5em] mb-16">
                    Trusted by 2,500+ global enterprises
                </p>

                <div className="relative">
                    {/* Neural Gradient Fade */}
                    <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-white to-transparent z-10" />
                    <div className="absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-white to-transparent z-10" />

                    <motion.div
                        animate={{ x: [0, -1200] }}
                        transition={{
                            duration: 40,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="flex items-center gap-24 whitespace-nowrap"
                    >
                        {[...logos, ...logos, ...logos].map((logo, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-4 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all duration-700 cursor-none group"
                            >
                                <div className={`w-10 h-10 rounded-[12px] ${logo.color} shadow-lg shadow-black/5 flex items-center justify-center text-white font-black text-xs rotate-0 group-hover:rotate-12 transition-transform`}>
                                    {logo.name[0]}
                                </div>
                                <span className="text-3xl font-black tracking-tighter text-gray-900 uppercase">
                                    {logo.name}
                                </span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
