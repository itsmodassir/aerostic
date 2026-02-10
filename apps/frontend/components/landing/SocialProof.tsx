'use client';

import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

export default function SocialProof() {
    const stats = [
        { label: "Messages Sent", value: "50M+" },
        { label: "Active Clients", value: "2,500+" },
        { label: "Meta Partners", value: "Official" },
        { label: "ROI Average", value: "5.5x" }
    ];

    const testimonials = [
        {
            name: "Alex Rivera",
            role: "Founder, Growthly",
            content: "Aerostic isn't just a tool; it's our growth engine. We've automated 90% of our patient reminders.",
            avatar: "AR"
        },
        {
            name: "Sarah Chen",
            role: "Marketing Director",
            content: "The official API stability is a game changer. No more morning panics about blocked numbers.",
            avatar: "SC"
        },
        {
            name: "Marcus Thorne",
            role: "Operations Lead",
            content: "Gemini AI auto-replies are scary good. It's like having our best agent working 24/7.",
            avatar: "MT"
        }
    ];

    return (
        <section className="py-24 bg-gray-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="text-center"
                        >
                            <p className="text-5xl font-black text-gray-900 mb-2 truncate">{stat.value}</p>
                            <p className="text-emerald-600 font-bold uppercase tracking-widest text-sm">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Testimonials */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
                    >
                        Loved by <span className="text-emerald-500">Industry Leaders</span>
                    </motion.h2>
                    <div className="flex items-center justify-center space-x-1 mb-8">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-400" />)}
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {testimonials.map((t, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/40 relative"
                        >
                            <Quote className="w-12 h-12 text-emerald-500/10 absolute top-8 right-8" />
                            <p className="text-xl text-gray-700 italic leading-relaxed mb-10 relative z-10">
                                "{t.content}"
                            </p>
                            <div className="flex items-center space-x-4">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xl">
                                    {t.avatar}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{t.name}</p>
                                    <p className="text-gray-500 text-sm font-medium">{t.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
