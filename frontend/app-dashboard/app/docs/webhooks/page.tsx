'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
    MessageSquare, Webhook, Copy, Check, AlertTriangle, Shield,
    CheckCircle, Zap, Code, ArrowRight
} from 'lucide-react';

export default function WebhooksPage() {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedCode(id);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const events = [
        {
            name: 'message.received',
            description: 'Triggered when a new message is received from a customer',
            payload: `{
  "event": "message.received",
  "timestamp": "2026-01-30T15:45:00Z",
  "data": {
    "id": "msg_abc123",
    "from": "+919876543210",
    "type": "text",
    "text": "Hi, I need help with my order",
    "wamid": "wamid.ABGGFlC..."
  }
}`
        },
        {
            name: 'message.sent',
            description: 'Triggered when a message is successfully sent',
            payload: `{
  "event": "message.sent",
  "timestamp": "2026-01-30T15:45:05Z",
  "data": {
    "id": "msg_def456",
    "to": "+919876543210",
    "status": "sent",
    "wamid": "wamid.ABGGFlC..."
  }
}`
        },
        {
            name: 'message.delivered',
            description: 'Triggered when a message is delivered to the recipient',
            payload: `{
  "event": "message.delivered",
  "timestamp": "2026-01-30T15:45:10Z",
  "data": {
    "id": "msg_def456",
    "to": "+919876543210",
    "status": "delivered",
    "deliveredAt": "2026-01-30T15:45:10Z"
  }
}`
        },
        {
            name: 'message.read',
            description: 'Triggered when a message is read by the recipient',
            payload: `{
  "event": "message.read",
  "timestamp": "2026-01-30T15:46:00Z",
  "data": {
    "id": "msg_def456",
    "to": "+919876543210",
    "status": "read",
    "readAt": "2026-01-30T15:46:00Z"
  }
}`
        },
        {
            name: 'message.failed',
            description: 'Triggered when a message fails to send',
            payload: `{
  "event": "message.failed",
  "timestamp": "2026-01-30T15:45:05Z",
  "data": {
    "id": "msg_ghi789",
    "to": "+919876543210",
    "status": "failed",
    "error": {
      "code": "INVALID_RECIPIENT",
      "message": "Phone number is not on WhatsApp"
    }
  }
}`
        },
        {
            name: 'contact.created',
            description: 'Triggered when a new contact is added',
            payload: `{
  "event": "contact.created",
  "timestamp": "2026-01-30T15:45:00Z",
  "data": {
    "id": "contact_xyz",
    "phone": "+919876543210",
    "name": "John Doe",
    "tags": ["new", "website"]
  }
}`
        },
    ];

    const verificationCode = `const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return signature === \`sha256=\${expectedSignature}\`;
}

// Express.js middleware example
app.post('/webhook', express.raw({ type: '*/*' }), (req, res) => {
  const signature = req.headers['x-aimstors-signature'];
  const isValid = verifyWebhookSignature(req.body, signature, WEBHOOK_SECRET);
  
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  const event = JSON.parse(req.body);
  console.log('Received event:', event.event);
  
  // Process the event...
  
  res.status(200).json({ received: true });
});`;

    const retrySchedule = [
        { attempt: 1, delay: 'Immediate' },
        { attempt: 2, delay: '30 seconds' },
        { attempt: 3, delay: '5 minutes' },
        { attempt: 4, delay: '30 minutes' },
        { attempt: 5, delay: '2 hours' },
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
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Aimstors Solution</span>
                    </Link>
                    <Link href="/docs" className="text-blue-600 hover:underline">← Back to Docs</Link>
                </div>
            </nav>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-6 py-16">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                        <Webhook className="w-6 h-6" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900">Webhooks</h1>
                </div>
                <p className="text-xl text-gray-600 mb-12">
                    Receive real-time notifications for message events, status updates, and more.
                </p>

                {/* Setup Section */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Setting Up Webhooks</h2>
                    <div className="bg-white rounded-2xl p-6 border border-gray-200">
                        <ol className="list-decimal pl-6 space-y-4 text-gray-600">
                            <li>
                                <strong>Create an endpoint</strong><br />
                                Set up an HTTPS endpoint on your server to receive webhook events.
                            </li>
                            <li>
                                <strong>Configure in Dashboard</strong><br />
                                Go to Dashboard → Developer → Webhooks and add your endpoint URL.
                            </li>
                            <li>
                                <strong>Select events</strong><br />
                                Choose which events you want to receive notifications for.
                            </li>
                            <li>
                                <strong>Verify signatures</strong><br />
                                Always verify the webhook signature to ensure requests are from Aimstors Solution.
                            </li>
                        </ol>
                    </div>
                </section>

                {/* Event Types */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Types</h2>
                    <div className="space-y-4">
                        {events.map((event, i) => (
                            <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="p-4 border-b border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <code className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-mono text-sm">
                                                {event.name}
                                            </code>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(event.payload, event.name)}
                                            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                                        >
                                            {copiedCode === event.name ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <p className="text-gray-600 text-sm mt-2">{event.description}</p>
                                </div>
                                <pre className="p-4 bg-gray-900 text-gray-100 text-sm overflow-x-auto">
                                    <code>{event.payload}</code>
                                </pre>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Security */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Shield className="w-6 h-6 text-green-600" />
                        Signature Verification
                    </h2>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                            <div>
                                <p className="font-medium text-amber-800">Security Best Practice</p>
                                <p className="text-amber-700 text-sm">Always verify webhook signatures to prevent spoofed requests.</p>
                            </div>
                        </div>
                    </div>
                    <p className="text-gray-600 mb-4">
                        Every webhook request includes an <code className="px-1 bg-gray-100 rounded">X-Aimstors Solution-Signature</code> header.
                        Verify this signature using your webhook secret:
                    </p>
                    <div className="bg-gray-900 rounded-xl overflow-hidden">
                        <div className="px-4 py-2 bg-gray-800 text-gray-400 text-sm flex items-center justify-between">
                            <span>verify-signature.js</span>
                            <button
                                onClick={() => copyToClipboard(verificationCode, 'verify')}
                                className="flex items-center gap-1 text-gray-400 hover:text-white"
                            >
                                {copiedCode === 'verify' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                        <pre className="p-4 text-gray-100 text-sm overflow-x-auto">
                            <code>{verificationCode}</code>
                        </pre>
                    </div>
                </section>

                {/* Retry Policy */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Zap className="w-6 h-6 text-purple-600" />
                        Retry Policy
                    </h2>
                    <p className="text-gray-600 mb-4">
                        If your endpoint returns a non-2xx status code, we'll retry the webhook with exponential backoff:
                    </p>
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Attempt</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Delay</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {retrySchedule.map((item) => (
                                    <tr key={item.attempt}>
                                        <td className="px-4 py-3 text-sm text-gray-600">Attempt {item.attempt}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{item.delay}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-gray-500 text-sm mt-4">
                        After 5 failed attempts, the webhook will be marked as failed and you'll receive an email notification.
                    </p>
                </section>

                {/* Best Practices */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Best Practices</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { title: 'Respond quickly', desc: 'Return a 200 status within 5 seconds' },
                            { title: 'Process async', desc: 'Queue events for background processing' },
                            { title: 'Handle duplicates', desc: 'Use event IDs to detect duplicates' },
                            { title: 'Use HTTPS', desc: 'Secure your endpoint with TLS' },
                        ].map((item, i) => (
                            <div key={i} className="bg-white rounded-xl p-4 border border-gray-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <h4 className="font-semibold text-gray-900">{item.title}</h4>
                                </div>
                                <p className="text-sm text-gray-600">{item.desc}</p>
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
                        <Link href="/docs/ai-agents" className="text-blue-600 hover:underline flex items-center gap-1">
                            AI Agents <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8">
                <div className="max-w-7xl mx-auto px-6 text-center text-gray-400">
                    <p>© {new Date().getFullYear()} Aimstors Solution. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
