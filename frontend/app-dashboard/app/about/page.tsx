'use client';

import Link from 'next/link';
import { MessageSquare, Target, Users, Rocket, Globe, Award, Heart, ArrowRight } from 'lucide-react';

export default function AboutPage() {
    const team = [
        { name: 'Modassir', role: 'Founder & CEO', emoji: '👨‍💻' },
        { name: 'Tech Team', role: 'Engineering', emoji: '⚡' },
        { name: 'Support Team', role: 'Customer Success', emoji: '💬' },
    ];

    const milestones = [
        { year: '2024', event: 'Aimstors Solution Founded', desc: 'Started with a vision to democratize WhatsApp marketing' },
        { year: '2024', event: 'Meta Partnership', desc: 'Became official Meta Business Partner' },
        { year: '2025', event: '2,500+ Customers', desc: 'Trusted by thousands of businesses across India' },
        { year: '2026', event: 'AI Agents Launch', desc: 'Revolutionary AI-powered chatbots for automation' },
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Aimstors Solution</span>
                    </Link>
                    <Link href="/register" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
                        We're on a mission to help businesses
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                            grow with WhatsApp
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Aimstors Solution is India's leading WhatsApp marketing platform, empowering businesses
                        to connect with customers at scale through intelligent automation.
                    </p>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-8 text-center">
                        {[
                            { value: '2,500+', label: 'Active Customers' },
                            { value: '50M+', label: 'Messages/Month' },
                            { value: '45+', label: 'Countries' },
                            { value: '99.9%', label: 'Uptime' },
                        ].map((stat, i) => (
                            <div key={i} className="p-6">
                                <div className="text-4xl font-extrabold text-blue-600 mb-2">{stat.value}</div>
                                <p className="text-gray-600">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Story */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-extrabold text-gray-900 mb-6">Our Story</h2>
                            <p className="text-lg text-gray-600 mb-4">
                                Aimstors Solution was born from a simple observation: businesses were struggling to leverage
                                WhatsApp's massive reach for marketing and customer support.
                            </p>
                            <p className="text-lg text-gray-600 mb-4">
                                We built Aimstors Solution to bridge this gap—providing an enterprise-grade platform that's
                                simple to use, affordable, and powered by cutting-edge AI.
                            </p>
                            <p className="text-lg text-gray-600">
                                Today, we're proud to serve over 2,500 businesses across India and beyond,
                                helping them send millions of messages every month.
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 text-white">
                            <h3 className="text-2xl font-bold mb-6">Our Values</h3>
                            <div className="space-y-4">
                                {[
                                    { icon: <Target className="w-6 h-6" />, text: 'Customer First' },
                                    { icon: <Rocket className="w-6 h-6" />, text: 'Innovation Always' },
                                    { icon: <Users className="w-6 h-6" />, text: 'Team Excellence' },
                                    { icon: <Heart className="w-6 h-6" />, text: 'Built with Love' },
                                ].map((value, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className="p-2 bg-white/20 rounded-lg">{value.icon}</div>
                                        <span className="text-lg font-medium">{value.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="py-20 bg-white">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-12">Our Journey</h2>
                    <div className="space-y-8">
                        {milestones.map((m, i) => (
                            <div key={i} className="flex gap-6">
                                <div className="w-20 shrink-0 text-right">
                                    <span className="text-blue-600 font-bold">{m.year}</span>
                                </div>
                                <div className="w-4 h-4 bg-blue-600 rounded-full mt-1.5 shrink-0" />
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{m.event}</h3>
                                    <p className="text-gray-600">{m.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-4xl font-extrabold mb-4">Join our growing community</h2>
                    <p className="text-xl text-blue-100 mb-8">Start your free trial today and see why 2,500+ businesses trust Aimstors Solution.</p>
                    <Link
                        href="/register"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                        Get Started Free <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8">
                <div className="max-w-7xl mx-auto px-6 text-center text-gray-400">
                    <p>© {new Date().getFullYear()} Aimstors Solution. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
