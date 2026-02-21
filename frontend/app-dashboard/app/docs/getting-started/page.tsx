'use client';

import Link from 'next/link';
import {
    MessageSquare, Rocket, CheckCircle, Copy, Check, ArrowRight,
    Smartphone, Globe, Key, Zap
} from 'lucide-react';
import { useState } from 'react';

export default function GettingStartedPage() {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedCode(id);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const steps = [
        {
            number: 1,
            title: 'Create Your Account',
            description: 'Sign up for a free 14-day trial. No credit card required.',
            details: [
                'Go to aimstore.in and click "Start Free Trial"',
                'Enter your business email and create a password',
                'Verify your email address',
                'Complete your business profile'
            ],
            time: '2 minutes'
        },
        {
            number: 2,
            title: 'Connect WhatsApp Business',
            description: 'Link your WhatsApp Business Account using our embedded signup.',
            details: [
                'Go to Dashboard → Settings → WhatsApp',
                'Click "Connect WhatsApp Business"',
                'Log in with your Meta Business account',
                'Create or select your WhatsApp Business Account',
                'Register a phone number (or use your existing one)'
            ],
            time: '5 minutes'
        },
        {
            number: 3,
            title: 'Create Your First Template',
            description: 'Templates are required for initiating conversations.',
            details: [
                'Navigate to Templates → Create New',
                'Choose a category: Marketing, Utility, or Authentication',
                'Write your message with {{variables}}',
                'Submit for Meta approval (usually 24-48 hours)'
            ],
            time: '5 minutes',
            codeExample: {
                id: 'template-example',
                code: `// Example template
{
  "name": "order_confirmation",
  "category": "UTILITY",
  "language": "en",
  "components": [
    {
      "type": "BODY",
      "text": "Hi {{1}}, your order {{2}} has been confirmed! Track at {{3}}"
    },
    {
      "type": "FOOTER",
      "text": "Thanks for shopping with us!"
    }
  ]
}`
            }
        },
        {
            number: 4,
            title: 'Send Your First Message',
            description: 'Test your setup by sending a message.',
            details: [
                'Go to Messages → New Message',
                'Select your approved template',
                'Enter a test phone number',
                'Fill in the template variables',
                'Click Send!'
            ],
            time: '1 minute',
            codeExample: {
                id: 'send-message',
                code: `curl -X POST https://api.aimstore.in/v1/messages/send \\
  -H "Authorization: Bearer ak_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+919876543210",
    "template": "order_confirmation",
    "variables": ["John", "ORD-12345", "track.com/12345"]
  }'`
            }
        },
        {
            number: 5,
            title: 'Set Up AI Agent (Optional)',
            description: 'Deploy an AI chatbot to handle customer queries automatically.',
            details: [
                'Go to AI Agents → Create New',
                'Choose agent type: Support, Sales, or Lead Qualification',
                'Customize the system prompt with your business info',
                'Set handoff rules for human escalation',
                'Enable the agent'
            ],
            time: '10 minutes'
        }
    ];

    const quickLinks = [
        { title: 'API Reference', href: '/docs/api-reference', icon: <Key className="w-5 h-5" /> },
        { title: 'Webhooks', href: '/docs/webhooks', icon: <Globe className="w-5 h-5" /> },
        { title: 'AI Agents', href: '/docs/ai-agents', icon: <Zap className="w-5 h-5" /> },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/docs" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Aerostic</span>
                    </Link>
                    <Link href="/docs" className="text-blue-600 hover:underline">← Back to Docs</Link>
                </div>
            </nav>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-6 py-16">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                        <Rocket className="w-6 h-6" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900">Getting Started</h1>
                </div>
                <p className="text-xl text-gray-600 mb-8">
                    Get up and running with Aerostic in under 15 minutes.
                </p>

                {/* Prerequisites */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-12">
                    <h2 className="font-bold text-gray-900 mb-3">Prerequisites</h2>
                    <ul className="space-y-2">
                        {[
                            'A Meta Business Account (create one at business.facebook.com)',
                            'A phone number that can receive SMS for verification',
                            'Your business details (name, address, website)',
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-gray-700">
                                <CheckCircle className="w-5 h-5 text-blue-600" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Steps */}
                <div className="space-y-8">
                    {steps.map((step, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                        {step.number}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">~{step.time}</span>
                                        </div>
                                        <p className="text-gray-600 mt-1 mb-4">{step.description}</p>
                                        <ol className="space-y-2">
                                            {step.details.map((detail, j) => (
                                                <li key={j} className="flex items-start gap-2 text-gray-600">
                                                    <span className="text-blue-600 font-medium">{j + 1}.</span>
                                                    {detail}
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                </div>
                            </div>
                            {step.codeExample && (
                                <div className="border-t border-gray-200 bg-gray-900">
                                    <div className="px-4 py-2 bg-gray-800 text-gray-400 text-sm flex items-center justify-between">
                                        <span>Example</span>
                                        <button
                                            onClick={() => copyToClipboard(step.codeExample!.code, step.codeExample!.id)}
                                            className="flex items-center gap-1 text-gray-400 hover:text-white"
                                        >
                                            {copiedCode === step.codeExample.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <pre className="p-4 text-gray-100 text-sm overflow-x-auto">
                                        <code>{step.codeExample.code}</code>
                                    </pre>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Success */}
                <div className="mt-12 bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">You're Ready!</h3>
                    <p className="text-gray-600 mb-6">
                        You've successfully set up Aerostic. Start automating your WhatsApp marketing today.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link href="/dashboard" className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700">
                            Go to Dashboard
                        </Link>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="mt-12">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Continue Learning</h2>
                    <div className="grid grid-cols-3 gap-4">
                        {quickLinks.map((link, i) => (
                            <Link
                                key={i}
                                href={link.href}
                                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
                            >
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    {link.icon}
                                </div>
                                <span className="font-medium text-gray-900">{link.title}</span>
                                <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-blue-600" />
                            </Link>
                        ))}
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
