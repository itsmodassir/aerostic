'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
    Check, ArrowRight, MessageSquare, Bot, Zap, Users, Shield, BarChart,
    CheckCircle, Star, Play, ChevronRight, Sparkles, Globe, Clock, TrendingUp,
    Send, Target, Layers, Award, Heart
} from 'lucide-react';

export default function LandingPage() {
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    const [animatedStats, setAnimatedStats] = useState({ messages: 0, clients: 0, countries: 0 });

    useEffect(() => {
        // Animate stats on mount
        const targets = { messages: 50, clients: 2500, countries: 45 };
        const duration = 2000;
        const steps = 60;
        const interval = duration / steps;

        let step = 0;
        const timer = setInterval(() => {
            step++;
            setAnimatedStats({
                messages: Math.round((targets.messages * step) / steps),
                clients: Math.round((targets.clients * step) / steps),
                countries: Math.round((targets.countries * step) / steps),
            });
            if (step >= steps) clearInterval(timer);
        }, interval);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const features = [
        {
            icon: <MessageSquare className="w-7 h-7" />,
            title: 'Bulk Campaigns',
            description: 'Send personalized messages to thousands of customers instantly with smart scheduling.',
            gradient: 'from-green-500 to-emerald-600',
        },
        {
            icon: <Bot className="w-7 h-7" />,
            title: 'AI Agents',
            description: 'Deploy intelligent chatbots that handle queries, qualify leads, and close sales 24/7.',
            gradient: 'from-blue-500 to-purple-600',
        },
        {
            icon: <Zap className="w-7 h-7" />,
            title: 'Smart Automation',
            description: 'Trigger automated responses based on keywords, time, or customer behavior.',
            gradient: 'from-amber-500 to-orange-600',
        },
        {
            icon: <Users className="w-7 h-7" />,
            title: 'Team Inbox',
            description: 'Collaborate with your team on conversations with assignment and tagging.',
            gradient: 'from-pink-500 to-rose-600',
        },
        {
            icon: <Target className="w-7 h-7" />,
            title: 'Lead Scoring',
            description: 'AI-powered lead qualification to focus on high-intent prospects.',
            gradient: 'from-cyan-500 to-teal-600',
        },
        {
            icon: <BarChart className="w-7 h-7" />,
            title: 'Analytics',
            description: 'Track delivery rates, response times, conversions, and campaign ROI.',
            gradient: 'from-violet-500 to-purple-600',
        },
    ];

    const testimonials = [
        {
            name: 'Rahul Sharma',
            role: 'Founder, TechStart India',
            avatar: '👨‍💼',
            content: 'Aerostic transformed our customer engagement. We went from 100 to 10,000 monthly conversations with the same team size.',
            rating: 5,
        },
        {
            name: 'Priya Patel',
            role: 'Marketing Head, RetailPro',
            avatar: '👩‍💼',
            content: 'The AI agents handle 80% of our queries automatically. Our customers love the instant responses!',
            rating: 5,
        },
        {
            name: 'Amit Kumar',
            role: 'CEO, EduTech Solutions',
            avatar: '👨‍🏫',
            content: 'Best investment we made this year. ROI was visible within the first month. Highly recommend!',
            rating: 5,
        },
    ];

    const trustedLogos = [
        'TechCorp', 'RetailPro', 'FinanceHub', 'EduLearn', 'HealthPlus', 'FoodExpress'
    ];

    return (
        <div className="min-h-screen bg-white overflow-x-hidden">
            {/* Floating Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Aerostic
                        </span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</Link>
                        <Link href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Testimonials</Link>
                        <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link>
                        <Link href="/docs" className="text-gray-600 hover:text-gray-900 transition-colors">Docs</Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="hidden sm:block text-gray-600 hover:text-gray-900 font-medium">
                            Login
                        </Link>
                        <Link
                            href="/register"
                            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-0.5"
                        >
                            Start Free
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
                <div className="absolute top-20 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl" />

                <div className="relative max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-4xl mx-auto">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200 text-blue-700 px-5 py-2 rounded-full text-sm font-semibold mb-8 animate-pulse">
                            <Sparkles className="w-4 h-4" />
                            #1 WhatsApp Marketing Platform in India
                            <ChevronRight className="w-4 h-4" />
                        </div>

                        {/* Headline */}
                        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
                            Turn WhatsApp into your
                            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                                Sales Machine
                            </span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
                            AI-powered automation that sends campaigns, qualifies leads,
                            and closes sales while you sleep. Join 2,500+ businesses growing with Aerostic.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                            <Link
                                href="/register"
                                className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
                            >
                                Start 14-Day Free Trial
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="#demo"
                                className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl font-bold text-lg hover:border-blue-500 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
                            >
                                <Play className="w-5 h-5" />
                                Watch Demo
                            </Link>
                        </div>

                        {/* Trust badges */}
                        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                No credit card required
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-blue-500" />
                                Meta Business Partner
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-purple-500" />
                                Setup in 5 minutes
                            </div>
                        </div>
                    </div>

                    {/* Hero Image/Dashboard Preview */}
                    <div className="mt-16 relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none" />
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-2 shadow-2xl shadow-gray-900/20 border border-gray-700/50 max-w-5xl mx-auto">
                            <div className="bg-gray-800 rounded-2xl p-1">
                                <div className="flex gap-2 mb-4 px-4 pt-3">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                </div>
                                <div className="bg-gradient-to-br from-gray-100 to-white rounded-xl p-6 h-80 flex items-center justify-center">
                                    <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
                                        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <MessageSquare className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <span className="text-sm font-medium text-gray-600">Messages</span>
                                            </div>
                                            <p className="text-2xl font-bold text-gray-900">12.5K</p>
                                            <p className="text-xs text-green-600">+23% today</p>
                                        </div>
                                        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                                    <Users className="w-4 h-4 text-green-600" />
                                                </div>
                                                <span className="text-sm font-medium text-gray-600">Leads</span>
                                            </div>
                                            <p className="text-2xl font-bold text-gray-900">847</p>
                                            <p className="text-xs text-green-600">+12% this week</p>
                                        </div>
                                        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                                    <Bot className="w-4 h-4 text-purple-600" />
                                                </div>
                                                <span className="text-sm font-medium text-gray-600">AI Chats</span>
                                            </div>
                                            <p className="text-2xl font-bold text-gray-900">4.2K</p>
                                            <p className="text-xs text-green-600">95% resolved</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trusted By Section */}
            <section className="py-12 bg-gray-50 border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-6">
                    <p className="text-center text-gray-500 text-sm font-medium mb-8">
                        TRUSTED BY 2,500+ FAST-GROWING COMPANIES
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
                        {trustedLogos.map((logo) => (
                            <div key={logo} className="text-2xl font-bold text-gray-300 hover:text-gray-400 transition-colors">
                                {logo}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                <div className="relative max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div className="p-8">
                            <div className="text-6xl md:text-7xl font-extrabold mb-2">{animatedStats.messages}M+</div>
                            <p className="text-blue-100 text-lg">Messages Sent Monthly</p>
                        </div>
                        <div className="p-8">
                            <div className="text-6xl md:text-7xl font-extrabold mb-2">{animatedStats.clients.toLocaleString()}+</div>
                            <p className="text-blue-100 text-lg">Active Businesses</p>
                        </div>
                        <div className="p-8">
                            <div className="text-6xl md:text-7xl font-extrabold mb-2">{animatedStats.countries}+</div>
                            <p className="text-blue-100 text-lg">Countries Served</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                            <Layers className="w-4 h-4" />
                            POWERFUL FEATURES
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                            Everything you need to
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                                dominate WhatsApp marketing
                            </span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            From bulk campaigns to AI chatbots, we've got every tool you need to engage, convert, and delight your customers.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, i) => (
                            <div
                                key={i}
                                className="group bg-white rounded-3xl p-8 border border-gray-100 hover:border-transparent hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 hover:-translate-y-2"
                            >
                                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                            <Zap className="w-4 h-4" />
                            SIMPLE SETUP
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                            Get started in 3 easy steps
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                step: '01', title: 'Connect WhatsApp', desc: 'Link your WhatsApp Business account in seconds using Meta\'s official API.', icon: <Globe className="w-8 h-8" />
                            },
                            { step: '02', title: 'Configure AI Agents', desc: 'Set up your AI chatbots with custom prompts and training data.', icon: <Bot className="w-8 h-8" /> },
                            { step: '03', title: 'Launch Campaigns', desc: 'Send bulk messages, track performance, and watch leads pour in.', icon: <Send className="w-8 h-8" /> },
                        ].map((item, i) => (
                            <div key={i} className="relative">
                                <div className="bg-white rounded-3xl p-8 border border-gray-100 hover:shadow-xl transition-shadow">
                                    <div className="text-7xl font-extrabold text-gray-100 absolute top-4 right-8">{item.step}</div>
                                    <div className="relative">
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white mb-6">
                                            {item.icon}
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                        <p className="text-gray-600">{item.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                            <Heart className="w-4 h-4" />
                            LOVED BY CUSTOMERS
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                            See what our customers say
                        </h2>
                    </div>

                    <div className="max-w-3xl mx-auto">
                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-10 border border-gray-100 shadow-xl relative">
                            <div className="absolute top-6 right-8 text-6xl text-gray-100">"</div>
                            <div className="flex items-center gap-1 mb-6">
                                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                                    <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-400" />
                                ))}
                            </div>
                            <p className="text-2xl text-gray-700 mb-8 leading-relaxed">
                                "{testimonials[currentTestimonial].content}"
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="text-4xl">{testimonials[currentTestimonial].avatar}</div>
                                <div>
                                    <p className="font-bold text-gray-900">{testimonials[currentTestimonial].name}</p>
                                    <p className="text-gray-500">{testimonials[currentTestimonial].role}</p>
                                </div>
                            </div>
                            <div className="flex justify-center gap-2 mt-8">
                                {testimonials.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentTestimonial(i)}
                                        className={`w-3 h-3 rounded-full transition-all ${i === currentTestimonial ? 'bg-blue-600 w-8' : 'bg-gray-300'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Preview */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                            Simple, transparent pricing
                        </h2>
                        <p className="text-xl text-gray-600">Start free, upgrade when you're ready</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {[
                            { name: 'Starter', price: '1,999', messages: '10,000', popular: false },
                            { name: 'Growth', price: '4,999', messages: '50,000', popular: true },
                            { name: 'Enterprise', price: '14,999', messages: 'Unlimited', popular: false },
                        ].map((plan) => (
                            <div
                                key={plan.name}
                                className={`relative bg-white rounded-3xl p-8 ${plan.popular
                                    ? 'ring-4 ring-blue-600 shadow-2xl shadow-blue-500/20 scale-105'
                                    : 'border border-gray-200'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold px-6 py-2 rounded-full">
                                        MOST POPULAR
                                    </div>
                                )}
                                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                <div className="mb-4">
                                    <span className="text-5xl font-extrabold">₹{plan.price}</span>
                                    <span className="text-gray-500">/month</span>
                                </div>
                                <p className="text-gray-600 mb-6">{plan.messages} messages/mo</p>
                                <Link
                                    href="/pricing"
                                    className={`block text-center py-4 rounded-2xl font-bold transition-all ${plan.popular
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    Get Started
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />

                <div className="relative max-w-4xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-5 py-2 rounded-full text-sm font-semibold mb-8">
                        <Award className="w-4 h-4" />
                        14-Day Free Trial • No Credit Card Required
                    </div>
                    <h2 className="text-4xl md:text-6xl font-extrabold mb-6">
                        Ready to transform your
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                            WhatsApp marketing?
                        </span>
                    </h2>
                    <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                        Join 2,500+ businesses that are already growing with Aerostic. Start your free trial today.
                    </p>
                    <Link
                        href="/register"
                        className="inline-flex items-center gap-2 px-10 py-5 bg-white text-gray-900 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-white/20 transition-all transform hover:-translate-y-1"
                    >
                        Start Your Free Trial
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-5 gap-8 mb-12">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                                    <MessageSquare className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-2xl font-bold">Aerostic</span>
                            </div>
                            <p className="text-gray-400 mb-6 max-w-xs">
                                India's leading WhatsApp Marketing & Automation Platform for growing businesses.
                            </p>
                            <div className="flex gap-4">
                                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                                    𝕏
                                </a>
                                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                                    in
                                </a>
                                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                                    f
                                </a>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Product</h4>
                            <ul className="space-y-3 text-gray-400">
                                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                                <li><Link href="/docs/api-reference" className="hover:text-white transition-colors">API</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Company</h4>
                            <ul className="space-y-3 text-gray-400">
                                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                                <li><Link href="/support" className="hover:text-white transition-colors">Support</Link></li>
                                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Legal</h4>
                            <ul className="space-y-3 text-gray-400">
                                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                                <li><Link href="/refund" className="hover:text-white transition-colors">Refund Policy</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between text-gray-500 text-sm">
                        <p>© {new Date().getFullYear()} Aerostic. All rights reserved.</p>
                        <p className="flex items-center gap-2 mt-4 md:mt-0">
                            Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> in India 🇮🇳
                        </p>
                    </div>
                </div>
            </footer>

            {/* WhatsApp Floating Button */}
            <a
                href="https://wa.me/919999999999?text=Hi%2C%20I%20want%20to%20know%20more%20about%20Aerostic"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-2xl shadow-green-500/30 hover:bg-green-600 hover:scale-110 transition-all z-50 group"
                aria-label="Chat on WhatsApp"
            >
                <MessageSquare className="w-7 h-7" />
                <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-white text-gray-900 px-4 py-2 rounded-xl text-sm font-medium shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Chat with us!
                </span>
            </a>

            {/* CSS for gradient animation */}
            <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
        </div>
    );
}
