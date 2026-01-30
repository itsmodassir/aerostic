'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
    MessageSquare, Package, Copy, Check, ArrowRight,
    Terminal, Download, ExternalLink, Code, Zap
} from 'lucide-react';

export default function SDKsDocsPage() {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [activeSDK, setActiveSDK] = useState<'node' | 'python' | 'php' | 'go'>('node');

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedCode(id);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const sdks = {
        node: {
            name: 'Node.js',
            version: '2.1.0',
            status: 'stable',
            install: 'npm install @aerostic/sdk',
            init: `const Aerostic = require('@aerostic/sdk');

const client = new Aerostic({
  apiKey: process.env.AEROSTIC_API_KEY
});`,
            sendMessage: `// Send a template message
const response = await client.messages.send({
  to: '+919876543210',
  template: 'order_confirmation',
  language: 'en',
  variables: ['John', 'ORD-12345', '₹1,499']
});

console.log('Message ID:', response.id);
console.log('Status:', response.status);`,
            webhook: `// Handle webhook events
app.post('/webhook', express.json(), (req, res) => {
  const event = req.body;
  
  switch (event.event) {
    case 'message.received':
      console.log('New message from:', event.data.from);
      break;
    case 'message.delivered':
      console.log('Message delivered:', event.data.id);
      break;
  }
  
  res.status(200).json({ received: true });
});`
        },
        python: {
            name: 'Python',
            version: '1.8.0',
            status: 'stable',
            install: 'pip install aerostic',
            init: `from aerostic import Aerostic
import os

client = Aerostic(api_key=os.environ['AEROSTIC_API_KEY'])`,
            sendMessage: `# Send a template message
response = client.messages.send(
    to='+919876543210',
    template='order_confirmation',
    language='en',
    variables=['John', 'ORD-12345', '₹1,499']
)

print(f"Message ID: {response.id}")
print(f"Status: {response.status}")`,
            webhook: `# Flask webhook handler
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/webhook', methods=['POST'])
def webhook():
    event = request.json
    
    if event['event'] == 'message.received':
        print(f"New message from: {event['data']['from']}")
    elif event['event'] == 'message.delivered':
        print(f"Message delivered: {event['data']['id']}")
    
    return jsonify({'received': True}), 200`
        },
        php: {
            name: 'PHP',
            version: '1.5.0',
            status: 'beta',
            install: 'composer require aerostic/sdk',
            init: `<?php
use Aerostic\\Client;

$client = new Client(getenv('AEROSTIC_API_KEY'));`,
            sendMessage: `<?php
// Send a template message
$response = $client->messages->send([
    'to' => '+919876543210',
    'template' => 'order_confirmation',
    'language' => 'en',
    'variables' => ['John', 'ORD-12345', '₹1,499']
]);

echo "Message ID: " . $response->id . "\\n";
echo "Status: " . $response->status . "\\n";`,
            webhook: `<?php
// Laravel webhook handler
Route::post('/webhook', function (Request $request) {
    $event = $request->all();
    
    switch ($event['event']) {
        case 'message.received':
            Log::info('New message from: ' . $event['data']['from']);
            break;
        case 'message.delivered':
            Log::info('Message delivered: ' . $event['data']['id']);
            break;
    }
    
    return response()->json(['received' => true]);
});`
        },
        go: {
            name: 'Go',
            version: '0.9.0',
            status: 'alpha',
            install: 'go get github.com/aerostic/aerostic-go',
            init: `package main

import (
    "os"
    aerostic "github.com/aerostic/aerostic-go"
)

func main() {
    client := aerostic.NewClient(os.Getenv("AEROSTIC_API_KEY"))
}`,
            sendMessage: `// Send a template message
response, err := client.Messages.Send(&aerostic.SendMessageParams{
    To:        "+919876543210",
    Template:  "order_confirmation",
    Language:  "en",
    Variables: []string{"John", "ORD-12345", "₹1,499"},
})

if err != nil {
    log.Fatal(err)
}

fmt.Printf("Message ID: %s\\n", response.ID)
fmt.Printf("Status: %s\\n", response.Status)`,
            webhook: `// HTTP webhook handler
func webhookHandler(w http.ResponseWriter, r *http.Request) {
    var event aerostic.WebhookEvent
    json.NewDecoder(r.Body).Decode(&event)
    
    switch event.Event {
    case "message.received":
        log.Printf("New message from: %s", event.Data.From)
    case "message.delivered":
        log.Printf("Message delivered: %s", event.Data.ID)
    }
    
    json.NewEncoder(w).Encode(map[string]bool{"received": true})
}`
        }
    };

    const sdk = sdks[activeSDK];

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
                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                        <Package className="w-6 h-6" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900">SDK Libraries</h1>
                </div>
                <p className="text-xl text-gray-600 mb-12">
                    Official client libraries for integrating Aerostic into your applications.
                </p>

                {/* SDK Grid */}
                <div className="grid grid-cols-4 gap-4 mb-12">
                    {(['node', 'python', 'php', 'go'] as const).map((key) => (
                        <button
                            key={key}
                            onClick={() => setActiveSDK(key)}
                            className={`p-4 rounded-xl border-2 transition-all ${activeSDK === key
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-gray-900">{sdks[key].name}</span>
                                <span className={`px-2 py-0.5 text-xs rounded ${sdks[key].status === 'stable' ? 'bg-green-100 text-green-700' :
                                        sdks[key].status === 'beta' ? 'bg-blue-100 text-blue-700' :
                                            'bg-amber-100 text-amber-700'
                                    }`}>
                                    {sdks[key].status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500">v{sdks[key].version}</p>
                        </button>
                    ))}
                </div>

                {/* Installation */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Download className="w-5 h-5" /> Installation
                    </h2>
                    <div className="bg-gray-900 rounded-xl overflow-hidden">
                        <div className="px-4 py-2 bg-gray-800 text-gray-400 text-sm flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Terminal className="w-4 h-4" />
                                <span>Terminal</span>
                            </div>
                            <button
                                onClick={() => copyToClipboard(sdk.install, 'install')}
                                className="text-gray-400 hover:text-white"
                            >
                                {copiedCode === 'install' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                        <pre className="p-4 text-gray-100 text-sm">
                            <code>{sdk.install}</code>
                        </pre>
                    </div>
                </section>

                {/* Initialization */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5" /> Quick Start
                    </h2>
                    <div className="bg-gray-900 rounded-xl overflow-hidden">
                        <div className="px-4 py-2 bg-gray-800 text-gray-400 text-sm flex items-center justify-between">
                            <span>Initialize the client</span>
                            <button
                                onClick={() => copyToClipboard(sdk.init, 'init')}
                                className="text-gray-400 hover:text-white"
                            >
                                {copiedCode === 'init' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                        <pre className="p-4 text-gray-100 text-sm overflow-x-auto">
                            <code>{sdk.init}</code>
                        </pre>
                    </div>
                </section>

                {/* Send Message */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Code className="w-5 h-5" /> Send a Message
                    </h2>
                    <div className="bg-gray-900 rounded-xl overflow-hidden">
                        <div className="px-4 py-2 bg-gray-800 text-gray-400 text-sm flex items-center justify-between">
                            <span>Send template message</span>
                            <button
                                onClick={() => copyToClipboard(sdk.sendMessage, 'send')}
                                className="text-gray-400 hover:text-white"
                            >
                                {copiedCode === 'send' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                        <pre className="p-4 text-gray-100 text-sm overflow-x-auto">
                            <code>{sdk.sendMessage}</code>
                        </pre>
                    </div>
                </section>

                {/* Webhook Handler */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Webhook Handler</h2>
                    <div className="bg-gray-900 rounded-xl overflow-hidden">
                        <div className="px-4 py-2 bg-gray-800 text-gray-400 text-sm flex items-center justify-between">
                            <span>Handle webhook events</span>
                            <button
                                onClick={() => copyToClipboard(sdk.webhook, 'webhook')}
                                className="text-gray-400 hover:text-white"
                            >
                                {copiedCode === 'webhook' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                        <pre className="p-4 text-gray-100 text-sm overflow-x-auto">
                            <code>{sdk.webhook}</code>
                        </pre>
                    </div>
                </section>

                {/* Resources */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Resources</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <a href="#" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
                            <ExternalLink className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="font-medium text-gray-900">GitHub Repository</p>
                                <p className="text-sm text-gray-500">View source code and examples</p>
                            </div>
                        </a>
                        <a href="#" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
                            <ExternalLink className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="font-medium text-gray-900">npm / PyPI Package</p>
                                <p className="text-sm text-gray-500">View on package registry</p>
                            </div>
                        </a>
                    </div>
                </section>

                {/* Next Steps */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
                    <h3 className="font-bold text-gray-900 mb-2">Next Steps</h3>
                    <div className="flex flex-wrap gap-4">
                        <Link href="/docs/api-reference" className="text-blue-600 hover:underline flex items-center gap-1">
                            API Reference <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link href="/docs/webhooks" className="text-blue-600 hover:underline flex items-center gap-1">
                            Webhooks <ArrowRight className="w-4 h-4" />
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
