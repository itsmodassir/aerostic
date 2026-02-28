'use client';

import Link from 'next/link';
import {
    MessageSquare, AlertCircle, Shield,
    Link as LinkIcon, RefreshCw, Smartphone,
    ArrowRight, ChevronRight, CheckCircle, Info
} from 'lucide-react';

export default function TroubleshootingPage() {
    const issues = [
        {
            title: 'Backend Dependencies Exception',
            id: 'circular-dependency',
            icon: <RefreshCw className="w-5 h-5" />,
            description: 'NestJS fails to start with UnknownDependenciesException on Role or TenantMembership.',
            cause: 'Circular file-level imports between entities (Role <-> TenantMembership).',
            fix: 'Switch the relationship definition to use string references instead of classes.',
            code: `@ManyToOne('Role', (role: any) => role.memberships) // Use string 'Role'`
        },
        {
            title: 'Meta OAuth Mismatch',
            id: 'redirect-mismatch',
            icon: <LinkIcon className="w-5 h-5" />,
            description: 'Facebook error: "redirect_uri is not identical to the one used in the OAuth dialog request".',
            cause: 'The JS SDK (FB.login) uses a different implicit URI than our backend exchange request.',
            fix: 'Use a manual window.open popup to the Facebook dialog URL to explicitly set the redirect_uri.',
            code: `const fbUrl = \`https://www.facebook.com/v19.0/dialog/oauth?client_id=\${id}&redirect_uri=\${encodedUri}...\`;`
        },
        {
            title: 'Missing Permission (#100)',
            id: 'missing-permission',
            icon: <Shield className="w-5 h-5" />,
            description: 'The /me/businesses endpoint fails with a permission error even after granting scopes.',
            cause: 'Restricted access to the business listing endpoint for certain account types.',
            fix: 'Use the debug_token endpoint to extract the WABA ID directly from granular_scopes fallback.',
            code: `const wabaId = debugData.granular_scopes.find(s => s.scope === 'whatsapp_business_management').target_ids[0];`
        },
        {
            title: '404 After Meta Callback',
            id: '404-redirect',
            icon: <AlertCircle className="w-5 h-5" />,
            description: 'Redirecting to /dashboard after login results in a "Page Not Found" error.',
            cause: 'The app requires a workspace slug in the URL which was missing from the redirect path.',
            fix: 'Use the state parameter in the OAuth flow to carry the tenant ID and redirect back to the workspace settings.',
            code: `router.push(\`/dashboard/\${state}/settings/whatsapp\`);`
        }
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
                    <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900">Troubleshooting Guide</h1>
                </div>
                <p className="text-xl text-gray-600 mb-12">
                    Solutions for common Meta integration issues, backend crashes, and redirection errors.
                </p>

                {/* Quick Selection */}
                <div className="grid grid-cols-2 gap-4 mb-12">
                    {issues.map((issue) => (
                        <a
                            key={issue.id}
                            href={`#${issue.id}`}
                            className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all flex items-center gap-3 group"
                        >
                            <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
                                {issue.icon}
                            </div>
                            <span className="font-semibold text-gray-700">{issue.title}</span>
                            <ChevronRight className="w-4 h-4 ml-auto text-gray-300" />
                        </a>
                    ))}
                </div>

                {/* Detailed Sections */}
                <div className="space-y-16">
                    {issues.map((issue) => (
                        <section key={issue.id} id={issue.id} className="scroll-mt-24">
                            <div className="flex items-center gap-2 mb-4">
                                <CheckCircle className="w-6 h-6 text-green-500" />
                                <h2 className="text-2xl font-bold text-gray-900">{issue.title}</h2>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                                <div className="p-6 border-b border-gray-100">
                                    <div className="mb-6">
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Issue</h4>
                                        <p className="text-gray-800 font-medium">{issue.description}</p>
                                    </div>
                                    <div className="mb-6">
                                        <h4 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-2">Root Cause</h4>
                                        <p className="text-gray-600">{issue.cause}</p>
                                    </div>
                                    <div className="mb-0">
                                        <h4 className="text-sm font-bold text-green-500 uppercase tracking-wider mb-2">Resolution</h4>
                                        <p className="text-gray-800 font-semibold">{issue.fix}</p>
                                    </div>
                                </div>
                                <div className="bg-gray-900 p-6">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Technical Reference</h4>
                                    <pre className="text-sm text-blue-300 font-mono overflow-x-auto">
                                        <code>{issue.code}</code>
                                    </pre>
                                </div>
                            </div>
                        </section>
                    ))}
                </div>

                {/* Best Practices */}
                <div className="mt-16 bg-blue-50 rounded-2xl p-8 border border-blue-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Info className="w-6 h-6 text-blue-600" />
                        Infrastructure Best Practices
                    </h3>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-2 text-gray-700">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2" />
                            <span>Always use <strong>v19.0</strong> for Meta Graph API calls to ensure consistency.</span>
                        </li>
                        <li className="flex items-start gap-2 text-gray-700">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2" />
                            <span>Ensure <code>META_REDIRECT_URI</code> is set to <code>https://app.aimstore.in/meta/callback</code>.</span>
                        </li>
                        <li className="flex items-start gap-2 text-gray-700">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2" />
                            <span>Validate all IDs (WABA, Phone) are trimmed of whitespace before storage.</span>
                        </li>
                    </ul>
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
