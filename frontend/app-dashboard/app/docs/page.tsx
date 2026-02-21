'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
    MessageSquare, Book, Rocket, Code, Webhook, Bot,
    ChevronRight, Search, ExternalLink, Copy, Check, AlertTriangle
} from 'lucide-react';

export default function DocsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedEndpoint(id);
        setTimeout(() => setCopiedEndpoint(null), 2000);
    };

    const docSections = [
        {
            icon: <Rocket className="w-6 h-6" />,
            title: 'Getting Started',
            description: 'Set up your account and send your first message in 5 minutes',
            href: '/docs/getting-started',
            color: 'from-green-500 to-emerald-600',
            topics: ['Account Setup', 'WhatsApp Connection', 'First Message', 'Dashboard Tour']
        },
        {
            icon: <Code className="w-6 h-6" />,
            title: 'API Reference',
            description: 'Complete REST API documentation with examples',
            href: '/docs/api-reference',
            color: 'from-blue-500 to-indigo-600',
            topics: ['Authentication', 'Messages API', 'Contacts API', 'Templates API']
        },
        {
            icon: <Webhook className="w-6 h-6" />,
            title: 'Webhooks',
            description: 'Receive real-time events for messages and status updates',
            href: '/docs/webhooks',
            color: 'from-purple-500 to-violet-600',
            topics: ['Setup', 'Event Types', 'Signatures', 'Best Practices']
        },
        {
            icon: <Bot className="w-6 h-6" />,
            title: 'AI Agents',
            description: 'Build and deploy intelligent chatbots',
            color: 'from-amber-500 to-orange-600',
            href: '/docs/ai-agents',
            topics: ['Agent Types', 'System Prompts', 'Handoff Rules', 'Analytics']
        },
        {
            icon: <AlertTriangle className="w-6 h-6" />,
            title: 'Troubleshooting',
            description: 'Common issues and their technical resolutions',
            href: '/docs/troubleshooting',
            color: 'from-red-500 to-pink-600',
            topics: ['Meta OAuth', 'Permission Errors', 'Redirect 404s', 'Backend Crashes']
        },
    ];

    const quickStartEndpoints = [
        { method: 'POST', path: '/api/messages/send', description: 'Send a template message' },
        { method: 'GET', path: '/api/messages', description: 'List all messages' },
        { method: 'POST', path: '/api/contacts', description: 'Create a contact' },
        { method: 'GET', path: '/api/templates', description: 'List message templates' },
    ];

    const sdks = [
        { name: 'Node.js', version: '2.1.0', status: 'stable' },
        { name: 'Python', version: '1.8.0', status: 'stable' },
        { name: 'PHP', version: '1.5.0', status: 'beta' },
        { name: 'Go', version: '0.9.0', status: 'alpha' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Aerostic</span>
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">Docs</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search docs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 w-64"
                            />
                        </div>
                        <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
                        <a href="https://github.com/aerostic" target="_blank" rel="noopener" className="text-gray-600 hover:text-gray-900">
                            GitHub
                        </a>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-16">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm mb-6">
                        <Book className="w-4 h-4" />
                        <span>Developer Documentation</span>
                    </div>
                    <h1 className="text-5xl font-extrabold mb-4">Aerostic API Documentation</h1>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
                        Everything you need to integrate WhatsApp messaging into your applications.
                        RESTful APIs, webhooks, and AI-powered automation.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link href="/docs/getting-started" className="px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                            Get Started
                        </Link>
                        <Link href="/docs/api-reference" className="px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors border border-white/20">
                            API Reference
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-16">
                {/* Documentation Sections */}
                <div className="grid grid-cols-2 gap-6 mb-16">
                    {docSections.map((section, i) => (
                        <Link
                            key={i}
                            href={section.href}
                            className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all"
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${section.color} text-white`}>
                                    {section.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                                        {section.title}
                                        <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" />
                                    </h3>
                                    <p className="text-gray-600 mt-1 mb-4">{section.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {section.topics.map((topic, j) => (
                                            <span key={j} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                                {topic}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Quick Start Endpoints */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Start Endpoints</h2>
                    <div className="bg-gray-900 rounded-2xl overflow-hidden">
                        <div className="p-4 border-b border-gray-800">
                            <p className="text-gray-400 text-sm">Base URL: <code className="text-blue-400">https://api.aerostic.com/v1</code></p>
                        </div>
                        <div className="divide-y divide-gray-800">
                            {quickStartEndpoints.map((endpoint, i) => (
                                <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <span className={`px-2 py-1 text-xs font-mono font-bold rounded ${endpoint.method === 'POST' ? 'bg-green-500/20 text-green-400' :
                                            endpoint.method === 'GET' ? 'bg-blue-500/20 text-blue-400' :
                                                'bg-amber-500/20 text-amber-400'
                                            }`}>
                                            {endpoint.method}
                                        </span>
                                        <code className="text-gray-100 font-mono">{endpoint.path}</code>
                                        <span className="text-gray-500">{endpoint.description}</span>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(`https://api.aerostic.com/v1${endpoint.path}`, endpoint.path)}
                                        className="p-2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        {copiedEndpoint === endpoint.path ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* SDKs */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Official SDKs</h2>
                    <div className="grid grid-cols-4 gap-4">
                        {sdks.map((sdk, i) => (
                            <div key={i} className="bg-white rounded-xl p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-bold text-gray-900">{sdk.name}</h4>
                                    <span className={`px-2 py-0.5 text-xs rounded ${sdk.status === 'stable' ? 'bg-green-100 text-green-700' :
                                        sdk.status === 'beta' ? 'bg-blue-100 text-blue-700' :
                                            'bg-amber-100 text-amber-700'
                                        }`}>
                                        {sdk.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500">v{sdk.version}</p>
                                <a href="#" className="text-blue-600 text-sm hover:underline flex items-center gap-1 mt-2">
                                    View on npm <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Code Example */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Example</h2>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-gray-900 rounded-2xl overflow-hidden">
                            <div className="px-4 py-2 bg-gray-800 text-gray-400 text-sm flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                <span className="ml-2">send-message.js</span>
                            </div>
                            <pre className="p-4 text-sm text-gray-100 overflow-x-auto">
                                <code>{`const Aerostic = require('@aerostic/sdk');

const client = new Aerostic({
  apiKey: 'ak_live_xxxxx'
});

// Send a template message
const response = await client.messages.send({
  to: '+919876543210',
  template: 'order_confirmation',
  variables: ['John', 'ORD-12345']
});

console.log('Message sent:', response.id);`}</code>
                            </pre>
                        </div>
                        <div className="bg-gray-900 rounded-2xl overflow-hidden">
                            <div className="px-4 py-2 bg-gray-800 text-gray-400 text-sm flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                <span className="ml-2">Response</span>
                            </div>
                            <pre className="p-4 text-sm text-gray-100 overflow-x-auto">
                                <code>{`{
  "id": "msg_abc123xyz",
  "status": "sent",
  "to": "+919876543210",
  "template": "order_confirmation",
  "timestamp": "2026-01-30T15:45:00Z",
  "wamid": "wamid.ABG..."
}`}</code>
                            </pre>
                        </div>
                    </div>
                </div>

                {/* Help Section */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Need Help?</h2>
                        <p className="text-gray-600 mb-6">Our team is here to help you integrate Aerostic</p>
                        <div className="flex justify-center gap-4">
                            <Link href="/support" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700">
                                Contact Support
                            </Link>
                            <a href="https://discord.gg/aerostic" className="px-6 py-3 bg-white text-gray-900 rounded-xl font-medium hover:bg-gray-100 border border-gray-200">
                                Join Discord
                            </a>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8">
                <div className="max-w-7xl mx-auto px-6 text-center text-gray-400">
                    <p>© {new Date().getFullYear()} Aerostic. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
