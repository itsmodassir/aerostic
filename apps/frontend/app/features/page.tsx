'use client';

import Link from 'next/link';
import {
    MessageSquare, Bot, Zap, Users, Shield, BarChart, Target, Layers,
    Send, Globe, Clock, CheckCircle, ArrowRight, Rocket, Sparkles
} from 'lucide-react';

export default function FeaturesPage() {
    const features = [
        {
            icon: <MessageSquare className="w-8 h-8" />,
            title: 'Bulk Campaigns',
            description: 'Send personalized messages to thousands of customers at once. Schedule campaigns, segment audiences, and track delivery in real-time.',
            benefits: ['Smart scheduling', 'Audience segmentation', 'Delivery tracking', 'Template variables'],
            gradient: 'from-green-500 to-emerald-600',
        },
        {
            icon: <Bot className="w-8 h-8" />,
            title: 'AI-Powered Agents',
            description: 'Deploy intelligent chatbots that understand context, answer queries, qualify leads, and close sales 24/7 without human intervention.',
            benefits: ['Natural language AI', 'Custom training', 'Lead qualification', 'Human handoff'],
            gradient: 'from-blue-500 to-purple-600',
        },
        {
            icon: <Zap className="w-8 h-8" />,
            title: 'Smart Automation',
            description: 'Create powerful automation rules triggered by keywords, time, customer actions, or external events via webhooks.',
            benefits: ['Keyword triggers', 'Time-based rules', 'Webhook integration', 'Multi-step flows'],
            gradient: 'from-amber-500 to-orange-600',
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: 'Team Inbox',
            description: 'Collaborate with your team on customer conversations. Assign chats, add internal notes, and track team performance.',
            benefits: ['Chat assignment', 'Internal notes', 'Team analytics', 'Role management'],
            gradient: 'from-pink-500 to-rose-600',
        },
        {
            icon: <Target className="w-8 h-8" />,
            title: 'Lead Scoring',
            description: 'AI automatically scores and prioritizes leads based on engagement, responses, and behavioral signals.',
            benefits: ['Auto qualification', 'Priority scoring', 'Engagement tracking', 'Sales alerts'],
            gradient: 'from-cyan-500 to-teal-600',
        },
        {
            icon: <BarChart className="w-8 h-8" />,
            title: 'Advanced Analytics',
            description: 'Get deep insights into message delivery, response rates, conversion funnels, and campaign ROI.',
            benefits: ['Real-time dashboard', 'Custom reports', 'Export data', 'Campaign comparison'],
            gradient: 'from-violet-500 to-purple-600',
        },
        {
            icon: <Layers className="w-8 h-8" />,
            title: 'Template Builder',
            description: 'Create and submit WhatsApp templates with our visual editor. Track approval status and use variables for personalization.',
            benefits: ['Visual editor', 'Meta approval', 'Variable support', 'Media templates'],
            gradient: 'from-indigo-500 to-blue-600',
        },
        {
            icon: <Globe className="w-8 h-8" />,
            title: 'Developer API',
            description: 'Full REST API access to integrate WhatsApp messaging into your own applications, CRM, or workflows.',
            benefits: ['REST API', 'Webhooks', 'SDKs', 'OAuth support'],
            gradient: 'from-slate-500 to-gray-600',
        },
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
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Aerostic</span>
                    </Link>
                    <Link href="/register" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Start Free Trial
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                        <Sparkles className="w-4 h-4" />
                        Packed with Powerful Features
                    </div>
                    <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
                        Everything you need to
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                            master WhatsApp marketing
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        From bulk campaigns to AI chatbots, Aerostic gives you all the tools
                        to engage customers, convert leads, and grow your business.
                    </p>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-8">
                        {features.map((feature, i) => (
                            <div key={i} className="bg-white rounded-3xl p-8 border border-gray-100 hover:shadow-xl transition-shadow">
                                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white mb-6`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 mb-6">{feature.description}</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {feature.benefits.map((benefit, j) => (
                                        <div key={j} className="flex items-center gap-2 text-sm text-gray-600">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            {benefit}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Integration Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
                        Integrates with your favorite tools
                    </h2>
                    <p className="text-xl text-gray-600 mb-12">
                        Connect Aerostic with your CRM, helpdesk, and other business tools via webhooks and API.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-8">
                        {['Salesforce', 'HubSpot', 'Zoho', 'Freshdesk', 'Zapier', 'Google Sheets'].map((tool) => (
                            <div key={tool} className="px-6 py-3 bg-white rounded-xl border border-gray-200 text-gray-600 font-medium">
                                {tool}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-4xl font-extrabold mb-4">Ready to supercharge your WhatsApp marketing?</h2>
                    <p className="text-xl text-blue-100 mb-8">Start your 14-day free trial. No credit card required.</p>
                    <Link
                        href="/register"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                        Start Free Trial <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8">
                <div className="max-w-7xl mx-auto px-6 text-center text-gray-400">
                    <p>© {new Date().getFullYear()} Aerostic. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
