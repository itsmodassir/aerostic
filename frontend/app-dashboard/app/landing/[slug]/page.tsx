'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
    MessageSquare, Shield, Globe, Zap,
    ArrowRight, CheckCircle2, Layout,
    Smartphone, Bot, BarChart3
} from 'lucide-react';

export default function ResellerLandingPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                // We'll add a public endpoint for this or reuse a tenant info one
                const res = await fetch(`/api/v1/auth/tenant-info?slug=${slug}`);
                if (res.ok) {
                    const data = await res.json();
                    setConfig(data);
                }
            } catch (error) {
                console.error('Failed to fetch reseller config:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const brandName = config?.resellerConfig?.brandName || config?.name || 'Aimstors Solution Partner';
    const primaryColor = config?.resellerConfig?.primaryColor || '#3B82F6';
    const logo = config?.resellerConfig?.logo;

    return (
        <div className="min-h-screen bg-white text-gray-900 selection:bg-blue-100 italic-none">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {logo ? (
                            <img src={logo} alt={brandName} className="h-8 w-auto" />
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                                {brandName[0]}
                            </div>
                        )}
                        <span className="font-black text-xl tracking-tighter uppercase">{brandName}</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-500 uppercase tracking-widest">
                        <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
                        <a href="#solutions" className="hover:text-blue-600 transition-colors">Solutions</a>
                        <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
                    </div>
                    <a
                        href="/login"
                        style={{ backgroundColor: primaryColor }}
                        className="px-6 py-2.5 text-white rounded-full font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-blue-500/20"
                    >
                        Login to Dashboard
                    </a>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-40 pb-32 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest">
                            <Zap className="w-4 h-4" />
                            Next-Generation Communication
                        </div>
                        <h1 className="text-6xl md:text-7xl font-black text-gray-900 leading-[0.9] tracking-tighter italic">
                            SCALE YOUR <br />
                            <span style={{ color: primaryColor }}>MESSAGING</span> <br />
                            WITH AI.
                        </h1>
                        <p className="text-xl text-gray-500 max-w-lg leading-relaxed font-medium">
                            {brandName} provides professional grade WhatsApp automation and customer engagement tools designed for modern enterprises.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <a
                                href="/register"
                                style={{ backgroundColor: primaryColor }}
                                className="px-10 py-5 text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/20"
                            >
                                Start Free Trial <ArrowRight className="w-4 h-4" />
                            </a>
                            <button className="px-10 py-5 bg-gray-50 text-gray-900 rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-gray-100 transition-all">
                                Watch Demo
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[40px] blur-3xl opacity-10 animate-pulse" />
                        <div className="relative bg-white p-8 rounded-[40px] border border-gray-100 shadow-2xl overflow-hidden aspect-video flex items-center justify-center group">
                            <Bot className="w-32 h-32 text-blue-600/10 group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-4">
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-gray-50 transform -rotate-12 translate-y-8 animate-bounce delay-100">
                                    <MessageSquare className="w-8 h-8 text-green-500" />
                                </div>
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-gray-50 transform rotate-12 -translate-y-8 animate-bounce delay-300">
                                    <BarChart3 className="w-8 h-8 text-blue-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-32 bg-gray-50/50 skew-y-1">
                <div className="max-w-7xl mx-auto px-6 -skew-y-1">
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: MessageSquare, title: 'Smart Inbox', desc: 'Manage all your customer conversations in one ultra-fast shared dashboard.' },
                            { icon: Bot, title: 'AI Automation', desc: 'Deploy intelligent chatbots that handle support and sales 24/7 with human-like precision.' },
                            { icon: BarChart3, title: 'Live Analytics', desc: 'Real-time tracking of message delivery, engagement, and conversion rates.' },
                        ].map((f, i) => (
                            <div key={i} className="p-10 bg-white rounded-[32px] border border-gray-100 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                    <f.icon className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-4 uppercase italic">{f.title}</h3>
                                <p className="text-gray-500 leading-relaxed font-medium">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 px-6 overflow-hidden relative">
                <div className="max-w-4xl mx-auto bg-gray-900 rounded-[48px] p-16 text-center text-white relative z-10">
                    <h2 className="text-4xl md:text-5xl font-black mb-8 leading-none italic tracking-tighter">
                        READY TO TRANSFORM <br />
                        YOUR WORKFLOW?
                    </h2>
                    <p className="text-xl text-gray-400 mb-12 max-w-lg mx-auto font-medium">
                        Join thousands of companies using {brandName} to automate their customer engagement.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="/register"
                            style={{ backgroundColor: primaryColor }}
                            className="px-12 py-5 text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:scale-105 transition-all"
                        >
                            Get Started Now
                        </a>
                        <a href="/login" className="px-12 py-5 bg-white/10 text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-white/20 transition-all">
                            Partner Login
                        </a>
                    </div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px]" />
            </section>

            {/* Footer */}
            <footer className="py-20 border-t border-gray-100 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white font-bold">
                            {brandName[0]}
                        </div>
                        <span className="font-black text-lg tracking-tighter uppercase">{brandName}</span>
                    </div>
                    <p className="text-sm text-gray-400 font-medium tracking-tight">
                        © 2026 {brandName}. All rights reserved. Powered by Aimstors Solution.
                    </p>
                    <div className="flex gap-8 text-xs font-black text-gray-400 uppercase tracking-widest">
                        <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
                        <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
