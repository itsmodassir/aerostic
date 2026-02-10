'use client';

import { motion } from 'framer-motion';

export default function TrustStrip() {
    const logos = [
        { name: 'TechCorp', color: 'bg-blue-500' },
        { name: 'RetailPro', color: 'bg-emerald-500' },
        { name: 'FinanceHub', color: 'bg-purple-500' },
        { name: 'EduLearn', color: 'bg-orange-500' },
        { name: 'HealthPlus', color: 'bg-red-500' },
        { name: 'FoodExpress', color: 'bg-amber-500' },
    ];

    return (
        <section className="py-12 bg-gray-50/50 border-y border-gray-100 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <p className="text-center text-sm font-bold text-gray-400 uppercase tracking-widest mb-10">
                    Trusted by 2,500+ fast-growing brands worldwide
                </p>

                <div className="relative">
                    {/* Faded edges */}
                    <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-gray-50 to-transparent z-10" />
                    <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-gray-50 to-transparent z-10" />

                    <motion.div
                        animate={{ x: [0, -1035] }}
                        transition={{
                            duration: 30,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="flex items-center space-x-20 whitespace-nowrap"
                    >
                        {[...logos, ...logos, ...logos].map((logo, idx) => (
                            <div
                                key={idx}
                                className="flex items-center space-x-3 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                            >
                                <div className={`w-8 h-8 rounded-lg ${logo.color}`} />
                                <span className="text-2xl font-black tracking-tighter text-gray-900">{logo.name}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
