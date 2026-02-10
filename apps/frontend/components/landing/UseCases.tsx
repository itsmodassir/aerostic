'use client';

import { motion } from 'framer-motion';
import {
    ShoppingBag, Landmark, GraduationCap,
    Stethoscope, Utensils, Plane
} from 'lucide-react';

export default function UseCases() {
    const cases = [
        {
            icon: <ShoppingBag />,
            industry: "E-Commerce",
            use: "Abandoned cart recovery & order updates",
            metrics: "32% Recovery Rate",
            color: "blue"
        },
        {
            icon: <Landmark />,
            industry: "Real Estate",
            use: "Automated lead qualification & site visits",
            metrics: "5x More Leads",
            color: "emerald"
        },
        {
            icon: <GraduationCap />,
            industry: "Education",
            use: "Admission support & course announcements",
            metrics: "90% Student Engagement",
            color: "orange"
        },
        {
            icon: <Stethoscope />,
            industry: "Healthcare",
            use: "Appointment booking & health reminders",
            metrics: "Zero No-Shows",
            color: "red"
        },
        {
            icon: <Utensils />,
            industry: "Hospitality",
            use: "Table reservations & digital feedback",
            metrics: "25% Increase in Reviews",
            color: "amber"
        },
        {
            icon: <Plane />,
            industry: "Travel",
            use: "Flight status & personalized itineraries",
            metrics: "12% Up-sell Success",
            color: "cyan"
        }
    ];

    const colorMap: Record<string, string> = {
        blue: "bg-blue-500/10 text-blue-600 border-blue-100",
        emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-100",
        orange: "bg-orange-500/10 text-orange-600 border-orange-100",
        red: "bg-red-500/10 text-red-600 border-red-100",
        amber: "bg-amber-500/10 text-amber-600 border-amber-100",
        cyan: "bg-cyan-500/10 text-cyan-600 border-cyan-100"
    };

    return (
        <section id="solutions" className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div className="max-w-2xl">
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
                        >
                            Built for <br />
                            <span className="text-emerald-500">Every Industry</span>
                        </motion.h2>
                        <p className="text-xl text-gray-600">
                            Vertical-specific solutions designed to solve unique business challenges and drive measurable growth.
                        </p>
                    </div>
                    <div className="flex -space-x-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className={`w-14 h-14 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 overflow-hidden`}>
                                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                            </div>
                        ))}
                        <div className="w-14 h-14 rounded-full border-4 border-white bg-emerald-500 flex items-center justify-center text-xs font-bold text-white z-10">
                            +2k
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cases.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ scale: 1.02 }}
                            className={`p-8 rounded-[32px] border ${colorMap[item.color]} flex flex-col justify-between h-[320px] transition-all`}
                        >
                            <div>
                                <div className="w-12 h-12 flex items-center justify-center mb-6">
                                    {item.icon}
                                </div>
                                <h3 className="text-2xl font-black mb-3">{item.industry}</h3>
                                <p className="text-gray-600 font-medium leading-relaxed">
                                    {item.use}
                                </p>
                            </div>

                            <div className="flex items-center space-x-2">
                                <div className="flex -space-x-1">
                                    {[1, 2, 3].map(j => <div key={j} className="w-6 h-6 rounded-full border border-white bg-gray-100" />)}
                                </div>
                                <span className="text-sm font-bold uppercase tracking-wider">{item.metrics}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
