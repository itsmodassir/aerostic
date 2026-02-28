'use client';

import Link from 'next/link';
import { MessageSquare } from 'lucide-react';

export default function RefundPolicyPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Aimstors Solution</span>
                    </Link>
                </div>
            </nav>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-6 py-16">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Refund Policy</h1>
                <p className="text-gray-500 mb-8">Last updated: January 30, 2026</p>

                <div className="prose prose-lg max-w-none text-gray-600">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                        <p className="text-blue-800 font-medium">
                            We want you to be completely satisfied with Aimstors Solution. If you're not happy, we offer a straightforward refund policy.
                        </p>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">14-Day Free Trial</h2>
                    <p>
                        All new accounts start with a 14-day free trial. During this period, you can explore all features without any payment. No credit card is required to start your trial.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Refund Eligibility</h2>
                    <p>After your trial ends and you subscribe to a paid plan:</p>
                    <ul className="list-disc pl-6 space-y-2 mt-4">
                        <li><strong>First 7 days:</strong> Full refund, no questions asked</li>
                        <li><strong>8-30 days:</strong> Pro-rated refund based on unused days</li>
                        <li><strong>After 30 days:</strong> No refunds, but you can cancel anytime</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">How to Request a Refund</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                        <li>Email us at <strong>billing@aimstore.in</strong></li>
                        <li>Include your account email and reason for refund</li>
                        <li>We'll process your request within 3-5 business days</li>
                        <li>Refunds are credited to your original payment method</li>
                    </ol>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Non-Refundable Items</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>One-time setup or onboarding fees (if applicable)</li>
                        <li>Add-on message credits beyond your plan</li>
                        <li>Custom development or integration work</li>
                        <li>Accounts terminated for policy violations</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Subscription Cancellation</h2>
                    <p>
                        You can cancel your subscription at any time from your dashboard. Upon cancellation:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-4">
                        <li>Your account remains active until the end of the billing period</li>
                        <li>No further charges will be made</li>
                        <li>You can reactivate anytime by subscribing again</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Refund Processing Time</h2>
                    <table className="w-full border-collapse border border-gray-200 mt-4">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="border border-gray-200 px-4 py-2 text-left">Payment Method</th>
                                <th className="border border-gray-200 px-4 py-2 text-left">Processing Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-gray-200 px-4 py-2">Credit/Debit Card</td>
                                <td className="border border-gray-200 px-4 py-2">5-7 business days</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-200 px-4 py-2">UPI</td>
                                <td className="border border-gray-200 px-4 py-2">3-5 business days</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-200 px-4 py-2">Net Banking</td>
                                <td className="border border-gray-200 px-4 py-2">5-7 business days</td>
                            </tr>
                        </tbody>
                    </table>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Contact Us</h2>
                    <p>
                        Have questions about refunds? Contact our billing team:
                    </p>
                    <p className="mt-4">
                        <strong>Email:</strong> billing@aimstore.in<br />
                        <strong>WhatsApp:</strong> +91 99999 99999<br />
                        <strong>Hours:</strong> Monday-Saturday, 10 AM - 7 PM IST
                    </p>
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
