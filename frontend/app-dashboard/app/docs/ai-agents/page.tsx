'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
    MessageSquare, Bot, Zap, Settings, ArrowRight, Brain,
    Users, MessageCircle, TrendingUp, Copy, Check
} from 'lucide-react';

export default function AIAgentsDocsPage() {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'support' | 'sales' | 'lead'>('support');

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedCode(id);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const agentTypes = {
        support: {
            name: 'Customer Support',
            description: 'Handle FAQs, troubleshooting, and general inquiries',
            prompt: `You are a helpful customer support agent for [Company Name].

Business Information:
- Hours: 10 AM - 7 PM IST, Monday to Saturday
- Return Policy: 7 days from delivery
- Website: www.example.com

Your Role:
- Answer common questions about products and services
- Help with order tracking and status updates
- Guide customers through troubleshooting steps
- Escalate complex issues to human agents

Rules:
- Be friendly, professional, and patient
- If unsure, admit it and offer to connect with a human
- Never make promises you can't keep
- Always confirm customer satisfaction before closing`
        },
        sales: {
            name: 'Sales Assistant',
            description: 'Qualify leads, recommend products, and close deals',
            prompt: `You are a sales assistant for [Company Name].

Product Categories:
- Category A: ₹999 - ₹4,999
- Category B: ₹5,000 - ₹19,999
- Category C: ₹20,000+

Your Goals:
- Understand customer needs through questions
- Recommend suitable products based on requirements
- Address objections and concerns
- Guide towards purchase or demo booking

Conversation Flow:
1. Greet and qualify (budget, timeline, requirements)
2. Present 2-3 relevant options
3. Handle questions and objections
4. Close with CTA (buy now, book demo, schedule call)`
        },
        lead: {
            name: 'Lead Qualification',
            description: 'Capture lead information and score prospects',
            prompt: `You are a lead qualification bot for [Company Name].

Qualification Criteria:
- Company Size: <10, 10-50, 50-200, 200+
- Budget: <1L, 1-5L, 5-20L, 20L+
- Timeline: Immediate, 1-3 months, 3-6 months, 6+ months
- Decision Maker: Yes/No

Data to Collect:
1. Full Name
2. Company Name
3. Email Address
4. Phone Number
5. Requirements

Scoring:
- Hot Lead: Budget >5L + Immediate timeline + Decision maker
- Warm Lead: Any 2 criteria met
- Cold Lead: Information collection only`
        }
    };

    const handoffTriggers = [
        { trigger: 'Confidence < 60%', description: 'AI is unsure about the response' },
        { trigger: 'Keywords detected', description: '"speak to human", "manager", "complaint"' },
        { trigger: '3+ failed attempts', description: 'Customer repeats same question' },
        { trigger: 'Payment issues', description: 'Refunds, payment failures' },
        { trigger: 'Explicit request', description: 'Customer asks for human support' },
    ];

    const apiExample = `// Create an AI Agent via API
const response = await fetch('https://api.aimstore.in/v1/ai-agents', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ak_live_xxxxx',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Support Bot',
    type: 'support',
    isActive: true,
    systemPrompt: 'You are a helpful support agent...',
    handoffRules: {
      keywords: ['manager', 'complaint', 'refund'],
      confidenceThreshold: 0.6,
      maxFailedAttempts: 3
    },
    knowledgeBase: ['FAQ document', 'Product catalog']
  })
});

const agent = await response.json();
console.log('Agent created:', agent.id);`;

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
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                        <Bot className="w-6 h-6" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900">AI Agents</h1>
                </div>
                <p className="text-xl text-gray-600 mb-12">
                    Deploy intelligent AI chatbots powered by Google Gemini for 24/7 automated customer support.
                </p>

                {/* Overview */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {[
                            { icon: <Brain className="w-5 h-5" />, title: 'Powered by Gemini', desc: 'Advanced AI understanding' },
                            { icon: <MessageCircle className="w-5 h-5" />, title: 'Natural Conversations', desc: 'Human-like responses' },
                            { icon: <Users className="w-5 h-5" />, title: 'Smart Handoff', desc: 'Escalate when needed' },
                            { icon: <TrendingUp className="w-5 h-5" />, title: 'Analytics', desc: 'Track performance' },
                        ].map((item, i) => (
                            <div key={i} className="bg-white rounded-xl p-4 border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">{item.icon}</div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{item.title}</h4>
                                        <p className="text-sm text-gray-500">{item.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Agent Types */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Agent Types & Prompts</h2>
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        {/* Tabs */}
                        <div className="flex border-b border-gray-200">
                            {(['support', 'sales', 'lead'] as const).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setActiveTab(type)}
                                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === type
                                            ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600'
                                            : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {agentTypes[type].name}
                                </button>
                            ))}
                        </div>
                        {/* Content */}
                        <div className="p-6">
                            <p className="text-gray-600 mb-4">{agentTypes[activeTab].description}</p>
                            <div className="bg-gray-900 rounded-xl overflow-hidden">
                                <div className="px-4 py-2 bg-gray-800 text-gray-400 text-sm flex items-center justify-between">
                                    <span>System Prompt Template</span>
                                    <button
                                        onClick={() => copyToClipboard(agentTypes[activeTab].prompt, activeTab)}
                                        className="flex items-center gap-1 text-gray-400 hover:text-white"
                                    >
                                        {copiedCode === activeTab ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                                <pre className="p-4 text-gray-100 text-sm overflow-x-auto whitespace-pre-wrap">
                                    <code>{agentTypes[activeTab].prompt}</code>
                                </pre>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Handoff Configuration */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Human Handoff</h2>
                    <p className="text-gray-600 mb-4">
                        Configure when the agent should transfer conversations to human agents:
                    </p>
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Trigger</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {handoffTriggers.map((item, i) => (
                                    <tr key={i}>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.trigger}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{item.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* API Example */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">API Integration</h2>
                    <div className="bg-gray-900 rounded-xl overflow-hidden">
                        <div className="px-4 py-2 bg-gray-800 text-gray-400 text-sm flex items-center justify-between">
                            <span>create-agent.js</span>
                            <button
                                onClick={() => copyToClipboard(apiExample, 'api-example')}
                                className="flex items-center gap-1 text-gray-400 hover:text-white"
                            >
                                {copiedCode === 'api-example' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                        <pre className="p-4 text-gray-100 text-sm overflow-x-auto">
                            <code>{apiExample}</code>
                        </pre>
                    </div>
                </section>

                {/* Analytics */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics & Metrics</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { metric: 'Total Conversations', desc: 'Number of chats handled by the agent' },
                            { metric: 'Resolution Rate', desc: 'Percentage resolved without human handoff' },
                            { metric: 'Avg Response Time', desc: 'Time to first response (typically <2s)' },
                            { metric: 'Customer Satisfaction', desc: 'Based on post-chat feedback' },
                            { metric: 'Handoff Rate', desc: 'Percentage transferred to humans' },
                            { metric: 'Intent Recognition', desc: 'Accuracy of understanding queries' },
                        ].map((item, i) => (
                            <div key={i} className="bg-white rounded-lg p-4 border border-gray-200">
                                <p className="font-semibold text-gray-900">{item.metric}</p>
                                <p className="text-sm text-gray-500">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Next Steps */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
                    <h3 className="font-bold text-gray-900 mb-2">Next Steps</h3>
                    <div className="flex flex-wrap gap-4">
                        <Link href="/docs/api-reference" className="text-blue-600 hover:underline flex items-center gap-1">
                            API Reference <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link href="/docs/webhooks" className="text-blue-600 hover:underline flex items-center gap-1">
                            Webhooks <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link href="/dashboard/ai-agents" className="text-blue-600 hover:underline flex items-center gap-1">
                            Create Agent <ArrowRight className="w-4 h-4" />
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
