'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
    MessageSquare, Code, Copy, Check, ChevronDown, ChevronRight,
    Key, Lock, Send, Users, FileText, Zap
} from 'lucide-react';

export default function APIReferencePage() {
    const [activeSection, setActiveSection] = useState('authentication');
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedCode(id);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const sections = [
        { id: 'authentication', name: 'Authentication', icon: <Key className="w-4 h-4" /> },
        { id: 'messages', name: 'Messages', icon: <Send className="w-4 h-4" /> },
        { id: 'contacts', name: 'Contacts', icon: <Users className="w-4 h-4" /> },
        { id: 'templates', name: 'Templates', icon: <FileText className="w-4 h-4" /> },
        { id: 'ai-agents', name: 'AI Agents', icon: <Zap className="w-4 h-4" /> },
    ];

    const endpoints = {
        authentication: [
            {
                id: 'auth-header',
                method: 'HEADER',
                path: 'Authorization',
                title: 'API Key Authentication',
                description: 'All API requests must include your API key in the Authorization header.',
                request: `curl -X GET https://api.aimstore.in/v1/me \\
  -H "Authorization: Bearer ak_live_xxxxxxxxxxxxx" \\
  -H "Content-Type: application/json"`,
                response: `{
  "id": "tenant_abc123",
  "name": "My Business",
  "email": "business@example.com",
  "plan": "growth",
  "api_calls_remaining": 45000
}`,
                params: []
            }
        ],
        messages: [
            {
                id: 'send-template',
                method: 'POST',
                path: '/messages/send',
                title: 'Send Template Message',
                description: 'Send a pre-approved WhatsApp template message to a recipient.',
                request: `curl -X POST https://api.aimstore.in/v1/messages/send \\
  -H "Authorization: Bearer ak_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+919876543210",
    "template": "order_confirmation",
    "language": "en",
    "variables": ["John", "ORD-12345", "₹1,499"]
  }'`,
                response: `{
  "id": "msg_abc123xyz",
  "status": "sent",
  "to": "+919876543210",
  "template": "order_confirmation",
  "wamid": "wamid.ABGGFlCGhYoIBRgB...",
  "timestamp": "2026-01-30T15:45:00Z"
}`,
                params: [
                    { name: 'to', type: 'string', required: true, desc: 'Recipient phone number with country code' },
                    { name: 'template', type: 'string', required: true, desc: 'Template name (must be approved)' },
                    { name: 'language', type: 'string', required: false, desc: 'Template language code (default: en)' },
                    { name: 'variables', type: 'array', required: false, desc: 'Variable values for template placeholders' },
                ]
            },
            {
                id: 'send-text',
                method: 'POST',
                path: '/messages/text',
                title: 'Send Text Message',
                description: 'Send a plain text message (only works within 24-hour window).',
                request: `curl -X POST https://api.aimstore.in/v1/messages/text \\
  -H "Authorization: Bearer ak_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+919876543210",
    "text": "Hello! How can I help you today?"
  }'`,
                response: `{
  "id": "msg_def456abc",
  "status": "sent",
  "to": "+919876543210",
  "type": "text",
  "timestamp": "2026-01-30T15:46:00Z"
}`,
                params: [
                    { name: 'to', type: 'string', required: true, desc: 'Recipient phone number' },
                    { name: 'text', type: 'string', required: true, desc: 'Message text (max 4096 chars)' },
                ]
            },
            {
                id: 'list-messages',
                method: 'GET',
                path: '/messages',
                title: 'List Messages',
                description: 'Retrieve a paginated list of messages.',
                request: `curl -X GET "https://api.aimstore.in/v1/messages?limit=20&status=delivered" \\
  -H "Authorization: Bearer ak_live_xxxxx"`,
                response: `{
  "data": [
    {
      "id": "msg_abc123",
      "to": "+919876543210",
      "status": "delivered",
      "type": "template",
      "timestamp": "2026-01-30T15:45:00Z"
    }
  ],
  "pagination": {
    "total": 1234,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}`,
                params: [
                    { name: 'limit', type: 'number', required: false, desc: 'Number of results (1-100, default: 20)' },
                    { name: 'offset', type: 'number', required: false, desc: 'Pagination offset' },
                    { name: 'status', type: 'string', required: false, desc: 'Filter by status: sent, delivered, read, failed' },
                ]
            },
        ],
        contacts: [
            {
                id: 'create-contact',
                method: 'POST',
                path: '/contacts',
                title: 'Create Contact',
                description: 'Add a new contact to your address book.',
                request: `curl -X POST https://api.aimstore.in/v1/contacts \\
  -H "Authorization: Bearer ak_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "phone": "+919876543210",
    "name": "John Doe",
    "email": "john@example.com",
    "tags": ["customer", "premium"]
  }'`,
                response: `{
  "id": "contact_xyz789",
  "phone": "+919876543210",
  "name": "John Doe",
  "email": "john@example.com",
  "tags": ["customer", "premium"],
  "createdAt": "2026-01-30T15:45:00Z"
}`,
                params: [
                    { name: 'phone', type: 'string', required: true, desc: 'Phone number with country code' },
                    { name: 'name', type: 'string', required: false, desc: 'Contact name' },
                    { name: 'email', type: 'string', required: false, desc: 'Email address' },
                    { name: 'tags', type: 'array', required: false, desc: 'Tags for segmentation' },
                ]
            },
            {
                id: 'list-contacts',
                method: 'GET',
                path: '/contacts',
                title: 'List Contacts',
                description: 'Retrieve all contacts with optional filtering.',
                request: `curl -X GET "https://api.aimstore.in/v1/contacts?tag=premium&limit=50" \\
  -H "Authorization: Bearer ak_live_xxxxx"`,
                response: `{
  "data": [
    {
      "id": "contact_xyz789",
      "phone": "+919876543210",
      "name": "John Doe",
      "tags": ["customer", "premium"]
    }
  ],
  "pagination": {
    "total": 2500,
    "limit": 50,
    "hasMore": true
  }
}`,
                params: [
                    { name: 'tag', type: 'string', required: false, desc: 'Filter by tag' },
                    { name: 'limit', type: 'number', required: false, desc: 'Results per page (max 100)' },
                ]
            },
        ],
        templates: [
            {
                id: 'list-templates',
                method: 'GET',
                path: '/templates',
                title: 'List Templates',
                description: 'Get all message templates with their approval status.',
                request: `curl -X GET https://api.aimstore.in/v1/templates \\
  -H "Authorization: Bearer ak_live_xxxxx"`,
                response: `{
  "data": [
    {
      "name": "order_confirmation",
      "category": "UTILITY",
      "language": "en",
      "status": "APPROVED",
      "components": [
        {
          "type": "BODY",
          "text": "Hi {{1}}, your order {{2}} has been confirmed!"
        }
      ]
    }
  ]
}`,
                params: []
            },
            {
                id: 'create-template',
                method: 'POST',
                path: '/templates',
                title: 'Create Template',
                description: 'Submit a new template for Meta approval.',
                request: `curl -X POST https://api.aimstore.in/v1/templates \\
  -H "Authorization: Bearer ak_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "welcome_message",
    "category": "MARKETING",
    "language": "en",
    "components": [
      {
        "type": "BODY",
        "text": "Welcome {{1}}! Thanks for joining us."
      }
    ]
  }'`,
                response: `{
  "name": "welcome_message",
  "status": "PENDING",
  "message": "Template submitted for review"
}`,
                params: [
                    { name: 'name', type: 'string', required: true, desc: 'Unique template name (lowercase, underscores)' },
                    { name: 'category', type: 'string', required: true, desc: 'MARKETING, UTILITY, or AUTHENTICATION' },
                    { name: 'language', type: 'string', required: true, desc: 'Language code (e.g., en, hi)' },
                    { name: 'components', type: 'array', required: true, desc: 'Template components (HEADER, BODY, FOOTER)' },
                ]
            },
        ],
        'ai-agents': [
            {
                id: 'list-agents',
                method: 'GET',
                path: '/ai-agents',
                title: 'List AI Agents',
                description: 'Get all configured AI agents.',
                request: `curl -X GET https://api.aimstore.in/v1/ai-agents \\
  -H "Authorization: Bearer ak_live_xxxxx"`,
                response: `{
  "data": [
    {
      "id": "agent_abc123",
      "name": "Sales Bot",
      "type": "sales",
      "isActive": true,
      "stats": {
        "conversations": 1234,
        "resolutionRate": 85.5
      }
    }
  ]
}`,
                params: []
            },
            {
                id: 'create-agent',
                method: 'POST',
                path: '/ai-agents',
                title: 'Create AI Agent',
                description: 'Create a new AI agent with custom configuration.',
                request: `curl -X POST https://api.aimstore.in/v1/ai-agents \\
  -H "Authorization: Bearer ak_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Support Bot",
    "type": "support",
    "systemPrompt": "You are a helpful support agent...",
    "handoffRules": {
      "keywords": ["manager", "complaint"],
      "confidenceThreshold": 0.6
    }
  }'`,
                response: `{
  "id": "agent_def456",
  "name": "Support Bot",
  "type": "support",
  "isActive": true,
  "createdAt": "2026-01-30T15:45:00Z"
}`,
                params: [
                    { name: 'name', type: 'string', required: true, desc: 'Agent display name' },
                    { name: 'type', type: 'string', required: true, desc: 'Agent type: support, sales, lead_qual, custom' },
                    { name: 'systemPrompt', type: 'string', required: true, desc: 'Instructions for AI behavior' },
                    { name: 'handoffRules', type: 'object', required: false, desc: 'Rules for human handoff' },
                ]
            },
        ],
    };

    const currentEndpoints = endpoints[activeSection as keyof typeof endpoints] || [];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 fixed h-full overflow-y-auto">
                <div className="p-4 border-b border-gray-200">
                    <Link href="/docs" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-gray-900">API Reference</span>
                    </Link>
                </div>
                <nav className="p-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Endpoints</p>
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left mb-1 transition-colors ${activeSection === section.id
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {section.icon}
                            <span className="font-medium">{section.name}</span>
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-gray-200">
                    <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">← Back to Website</Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-4xl">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 capitalize">{activeSection.replace('-', ' ')}</h1>
                        <p className="text-gray-600 mt-2">
                            {activeSection === 'authentication' && 'Learn how to authenticate your API requests.'}
                            {activeSection === 'messages' && 'Send and manage WhatsApp messages programmatically.'}
                            {activeSection === 'contacts' && 'Manage your contact lists and segmentation.'}
                            {activeSection === 'templates' && 'Create and manage message templates.'}
                            {activeSection === 'ai-agents' && 'Configure AI-powered chatbot agents.'}
                        </p>
                    </div>

                    {/* Endpoints */}
                    <div className="space-y-6">
                        {currentEndpoints.map((endpoint) => (
                            <div key={endpoint.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                                {/* Endpoint Header */}
                                <div
                                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => setExpandedEndpoint(expandedEndpoint === endpoint.id ? null : endpoint.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2 py-1 text-xs font-mono font-bold rounded ${endpoint.method === 'POST' ? 'bg-green-100 text-green-700' :
                                                endpoint.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                                                    endpoint.method === 'PUT' ? 'bg-amber-100 text-amber-700' :
                                                        endpoint.method === 'DELETE' ? 'bg-red-100 text-red-700' :
                                                            'bg-gray-100 text-gray-700'
                                                }`}>
                                                {endpoint.method}
                                            </span>
                                            <code className="text-gray-900 font-mono">{endpoint.path}</code>
                                        </div>
                                        {expandedEndpoint === endpoint.id ?
                                            <ChevronDown className="w-5 h-5 text-gray-400" /> :
                                            <ChevronRight className="w-5 h-5 text-gray-400" />
                                        }
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mt-2">{endpoint.title}</h3>
                                    <p className="text-gray-600 mt-1">{endpoint.description}</p>
                                </div>

                                {/* Expanded Content */}
                                {expandedEndpoint === endpoint.id && (
                                    <div className="border-t border-gray-200">
                                        {/* Parameters */}
                                        {endpoint.params && endpoint.params.length > 0 && (
                                            <div className="p-6 bg-gray-50">
                                                <h4 className="font-semibold text-gray-900 mb-3">Parameters</h4>
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="text-left text-gray-500">
                                                            <th className="pb-2">Name</th>
                                                            <th className="pb-2">Type</th>
                                                            <th className="pb-2">Required</th>
                                                            <th className="pb-2">Description</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {endpoint.params.map((param, i) => (
                                                            <tr key={i} className="border-t border-gray-200">
                                                                <td className="py-2 font-mono text-blue-600">{param.name}</td>
                                                                <td className="py-2 text-gray-600">{param.type}</td>
                                                                <td className="py-2">
                                                                    {param.required ?
                                                                        <span className="text-red-600">Yes</span> :
                                                                        <span className="text-gray-400">No</span>
                                                                    }
                                                                </td>
                                                                <td className="py-2 text-gray-600">{param.desc}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}

                                        {/* Request */}
                                        <div className="p-6">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-semibold text-gray-900">Request</h4>
                                                <button
                                                    onClick={() => copyToClipboard(endpoint.request, `${endpoint.id}-req`)}
                                                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                                                >
                                                    {copiedCode === `${endpoint.id}-req` ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                                    Copy
                                                </button>
                                            </div>
                                            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                                                <code>{endpoint.request}</code>
                                            </pre>
                                        </div>

                                        {/* Response */}
                                        <div className="p-6 pt-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-semibold text-gray-900">Response</h4>
                                                <button
                                                    onClick={() => copyToClipboard(endpoint.response, `${endpoint.id}-res`)}
                                                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                                                >
                                                    {copiedCode === `${endpoint.id}-res` ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                                    Copy
                                                </button>
                                            </div>
                                            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                                                <code>{endpoint.response}</code>
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
