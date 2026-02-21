'use client';

import Link from 'next/link';
import { useState } from 'react';
import { HelpCircle, Book, MessageSquare, Mail, Phone, Search, ChevronRight, ExternalLink } from 'lucide-react';

export default function SupportPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const helpTopics = [
        {
            category: 'Getting Started',
            articles: [
                { title: 'How to connect your WhatsApp Business Account', href: '/docs/getting-started' },
                { title: 'Setting up your first campaign', href: '/docs/campaigns' },
                { title: 'Understanding message templates', href: '/docs/templates' },
            ],
        },
        {
            category: 'Billing & Plans',
            articles: [
                { title: 'Upgrading or downgrading your plan', href: '/docs/billing' },
                { title: 'Understanding your invoice', href: '/docs/billing' },
                { title: 'Refund policy', href: '/refund' },
            ],
        },
        {
            category: 'AI Agents',
            articles: [
                { title: 'Creating your first AI agent', href: '/docs/ai-agents' },
                { title: 'Training your agent with custom data', href: '/docs/ai-agents' },
                { title: 'Handoff to human agents', href: '/docs/ai-agents' },
            ],
        },
        {
            category: 'API & Integrations',
            articles: [
                { title: 'API authentication', href: '/docs/api-reference' },
                { title: 'Setting up webhooks', href: '/docs/webhooks' },
                { title: 'Rate limits and quotas', href: '/docs/api-reference' },
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold text-blue-600">
                        Aerostic
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
                        <Link href="/contact" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Contact Us
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Header */}
            <section className="py-16 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <HelpCircle className="w-16 h-16 mx-auto mb-4 text-blue-200" />
                    <h1 className="text-4xl font-bold mb-4">How can we help?</h1>
                    <p className="text-xl text-blue-100 mb-8">
                        Search our help center or browse topics below
                    </p>
                    <div className="relative max-w-xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search for help..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 focus:ring-4 focus:ring-blue-300"
                        />
                    </div>
                </div>
            </section>

            {/* Quick Actions */}
            <section className="py-12 -mt-8">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-4">
                        <a
                            href="https://wa.me/919999999999"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow flex items-center gap-4"
                        >
                            <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Chat on WhatsApp</h3>
                                <p className="text-sm text-gray-500">Get quick support</p>
                            </div>
                        </a>
                        <Link
                            href="/contact"
                            className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow flex items-center gap-4"
                        >
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Email Support</h3>
                                <p className="text-sm text-gray-500">support@aimstore.in</p>
                            </div>
                        </Link>
                        <Link
                            href="/docs"
                            className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow flex items-center gap-4"
                        >
                            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                                <Book className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Documentation</h3>
                                <p className="text-sm text-gray-500">Browse all guides</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Help Topics */}
            <section className="py-12">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-2xl font-bold mb-8">Popular Help Topics</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {helpTopics.map((topic) => (
                            <div key={topic.category} className="bg-white rounded-xl border border-gray-200 p-6">
                                <h3 className="font-semibold text-lg mb-4">{topic.category}</h3>
                                <ul className="space-y-3">
                                    {topic.articles.map((article, i) => (
                                        <li key={i}>
                                            <Link
                                                href={article.href}
                                                className="flex items-center justify-between text-gray-600 hover:text-blue-600 group"
                                            >
                                                <span>{article.title}</span>
                                                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Still Need Help */}
            <section className="py-12 bg-white border-t border-gray-200">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
                    <p className="text-gray-600 mb-8">
                        Our support team is available Monday to Saturday, 10 AM - 7 PM IST
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href="https://wa.me/919999999999"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
                        >
                            <MessageSquare className="w-5 h-5" />
                            Chat on WhatsApp
                        </a>
                        <Link
                            href="/contact"
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                        >
                            <Mail className="w-5 h-5" />
                            Contact Support
                        </Link>
                    </div>
                </div>
            </section>

            {/* WhatsApp Button */}
            <a
                href="https://wa.me/919999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors z-50"
            >
                <MessageSquare className="w-6 h-6" />
            </a>
        </div>
    );
}
