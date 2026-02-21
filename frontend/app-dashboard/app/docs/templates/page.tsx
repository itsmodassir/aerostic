'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
    MessageSquare, FileText, Copy, Check, AlertTriangle,
    CheckCircle, Clock, X, ArrowRight, Eye, Edit
} from 'lucide-react';

export default function TemplatesDocsPage() {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<'marketing' | 'utility' | 'authentication'>('marketing');

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedCode(id);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const categories = {
        marketing: {
            name: 'Marketing',
            description: 'Promotional content, offers, announcements',
            examples: [
                {
                    name: 'promotional_offer',
                    body: 'Hi {{1}}! 🎉 Get {{2}}% OFF on all products this weekend! Use code: {{3}}\n\nShop now at {{4}}',
                    footer: 'Reply STOP to unsubscribe'
                },
                {
                    name: 'new_arrival',
                    body: 'Hey {{1}}! Check out our latest collection just dropped! 👗✨\n\nExplore: {{2}}',
                    footer: 'Aerostic Fashion'
                }
            ]
        },
        utility: {
            name: 'Utility',
            description: 'Order updates, confirmations, reminders',
            examples: [
                {
                    name: 'order_confirmation',
                    body: 'Hi {{1}}, your order #{{2}} has been confirmed! ✅\n\nTotal: ₹{{3}}\nDelivery: {{4}}\n\nTrack at: {{5}}',
                    footer: 'Thank you for shopping!'
                },
                {
                    name: 'appointment_reminder',
                    body: 'Reminder: You have an appointment scheduled for {{1}} at {{2}}.\n\nLocation: {{3}}\n\nReply YES to confirm or NO to reschedule.',
                    footer: 'Aerostic Healthcare'
                }
            ]
        },
        authentication: {
            name: 'Authentication',
            description: 'OTPs, verification codes, security alerts',
            examples: [
                {
                    name: 'otp_verification',
                    body: 'Your verification code is: {{1}}\n\nThis code expires in 10 minutes. Do not share with anyone.',
                    footer: 'Aerostic Security'
                },
                {
                    name: 'login_alert',
                    body: 'New login detected on your account from {{1}} at {{2}}.\n\nIf this wasn\'t you, secure your account immediately.',
                    footer: 'Aerostic Security'
                }
            ]
        }
    };

    const statusColors = {
        APPROVED: 'bg-green-100 text-green-700',
        PENDING: 'bg-amber-100 text-amber-700',
        REJECTED: 'bg-red-100 text-red-700'
    };

    const createTemplateCode = `curl -X POST https://api.aerostic.com/v1/templates \\
  -H "Authorization: Bearer ak_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "order_confirmation",
    "category": "UTILITY",
    "language": "en",
    "components": [
      {
        "type": "HEADER",
        "format": "TEXT",
        "text": "Order Confirmed! ✅"
      },
      {
        "type": "BODY",
        "text": "Hi {{1}}, your order #{{2}} is confirmed.\\n\\nTotal: ₹{{3}}\\nDelivery: {{4}}"
      },
      {
        "type": "FOOTER",
        "text": "Thank you for shopping with us!"
      },
      {
        "type": "BUTTONS",
        "buttons": [
          {
            "type": "URL",
            "text": "Track Order",
            "url": "https://example.com/track/{{5}}"
          }
        ]
      }
    ]
  }'`;

    const guidelines = [
        { rule: 'Clear opt-out', desc: 'Marketing templates must include unsubscribe option' },
        { rule: 'No prohibited content', desc: 'Avoid gambling, adult content, or illegal products' },
        { rule: 'Variable limits', desc: 'Maximum 10 variables per template' },
        { rule: 'Character limits', desc: 'Body: 1024 chars, Header: 60 chars, Footer: 60 chars' },
        { rule: 'Language consistency', desc: 'Template must match the declared language' },
        { rule: 'No misleading content', desc: 'Be truthful about offers and claims' },
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
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                        <FileText className="w-6 h-6" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900">Message Templates</h1>
                </div>
                <p className="text-xl text-gray-600 mb-12">
                    Create and manage WhatsApp message templates for outbound campaigns.
                </p>

                {/* Overview */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Understanding Templates</h2>
                    <div className="bg-white rounded-2xl p-6 border border-gray-200">
                        <p className="text-gray-600 mb-4">
                            WhatsApp requires pre-approved templates for initiating conversations. Templates are categorized by:
                        </p>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                                <span className="text-sm font-bold text-purple-700">MARKETING</span>
                                <p className="text-sm text-gray-600 mt-1">Promotions, offers, announcements</p>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <span className="text-sm font-bold text-blue-700">UTILITY</span>
                                <p className="text-sm text-gray-600 mt-1">Order updates, confirmations</p>
                            </div>
                            <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                                <span className="text-sm font-bold text-green-700">AUTHENTICATION</span>
                                <p className="text-sm text-gray-600 mt-1">OTPs, verification codes</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Template Examples */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Template Examples</h2>
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        {/* Tabs */}
                        <div className="flex border-b border-gray-200">
                            {(['marketing', 'utility', 'authentication'] as const).map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeCategory === cat
                                            ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                                            : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {categories[cat].name}
                                </button>
                            ))}
                        </div>
                        <div className="p-6">
                            <p className="text-gray-600 mb-4">{categories[activeCategory].description}</p>
                            <div className="space-y-4">
                                {categories[activeCategory].examples.map((template, i) => (
                                    <div key={i} className="bg-gray-50 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <code className="text-sm font-mono text-blue-600">{template.name}</code>
                                            <button
                                                onClick={() => copyToClipboard(template.body, template.name)}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                {copiedCode === template.name ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                                            <p className="text-gray-800 whitespace-pre-line text-sm">{template.body}</p>
                                            <p className="text-gray-500 text-xs mt-2 pt-2 border-t border-gray-100">{template.footer}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Template Status */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Approval Status</h2>
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Timeline</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <tr>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors.PENDING}`}>
                                            <Clock className="w-3 h-3 inline mr-1" />PENDING
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">Template is under Meta review</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">24-48 hours</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors.APPROVED}`}>
                                            <CheckCircle className="w-3 h-3 inline mr-1" />APPROVED
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">Template is ready to use</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">-</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors.REJECTED}`}>
                                            <X className="w-3 h-3 inline mr-1" />REJECTED
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">Template violates guidelines</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">Edit and resubmit</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* API Example */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Template via API</h2>
                    <div className="bg-gray-900 rounded-xl overflow-hidden">
                        <div className="px-4 py-2 bg-gray-800 text-gray-400 text-sm flex items-center justify-between">
                            <span>create-template.sh</span>
                            <button
                                onClick={() => copyToClipboard(createTemplateCode, 'create-template')}
                                className="flex items-center gap-1 text-gray-400 hover:text-white"
                            >
                                {copiedCode === 'create-template' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                        <pre className="p-4 text-gray-100 text-sm overflow-x-auto">
                            <code>{createTemplateCode}</code>
                        </pre>
                    </div>
                </section>

                {/* Guidelines */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Template Guidelines</h2>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                            <div>
                                <p className="font-medium text-amber-800">Follow Meta's policies</p>
                                <p className="text-amber-700 text-sm">Templates that violate guidelines will be rejected.</p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {guidelines.map((item, i) => (
                            <div key={i} className="bg-white rounded-xl p-4 border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-1">{item.rule}</h4>
                                <p className="text-sm text-gray-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Next Steps */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                    <h3 className="font-bold text-gray-900 mb-2">Next Steps</h3>
                    <div className="flex flex-wrap gap-4">
                        <Link href="/docs/api-reference" className="text-blue-600 hover:underline flex items-center gap-1">
                            API Reference <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link href="/docs/getting-started" className="text-blue-600 hover:underline flex items-center gap-1">
                            Getting Started <ArrowRight className="w-4 h-4" />
                        </Link>
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
