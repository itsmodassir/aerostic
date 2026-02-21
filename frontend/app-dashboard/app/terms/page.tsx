'use client';

import Link from 'next/link';
import { MessageSquare } from 'lucide-react';

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Aerostic</span>
                    </Link>
                </div>
            </nav>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-6 py-16">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Terms of Service</h1>
                <p className="text-gray-500 mb-8">Last updated: January 30, 2026</p>

                <div className="prose prose-lg max-w-none text-gray-600">
                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
                    <p>
                        By accessing or using Aerostic's WhatsApp Marketing platform ("Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use our Service.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Description of Service</h2>
                    <p>
                        Aerostic provides a SaaS platform for WhatsApp marketing automation, including bulk messaging, AI chatbots, campaign management, and analytics.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Account Registration</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>You must provide accurate and complete information</li>
                        <li>You are responsible for maintaining account security</li>
                        <li>You must be 18+ years old to create an account</li>
                        <li>Business accounts must represent legitimate businesses</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Acceptable Use</h2>
                    <p>You agree NOT to:</p>
                    <ul className="list-disc pl-6 space-y-2 mt-4">
                        <li>Send spam or unsolicited messages</li>
                        <li>Violate WhatsApp/Meta's terms and policies</li>
                        <li>Send illegal, harmful, or offensive content</li>
                        <li>Impersonate others or provide false information</li>
                        <li>Attempt to bypass rate limits or security measures</li>
                        <li>Use the service for any illegal purpose</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Payment Terms</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Subscription fees are billed monthly in advance</li>
                        <li>All payments are processed through Razorpay</li>
                        <li>Prices are in Indian Rupees (INR) unless stated otherwise</li>
                        <li>You authorize us to charge your payment method automatically</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Cancellation & Refunds</h2>
                    <p>
                        You may cancel your subscription at any time. Please refer to our <Link href="/refund" className="text-blue-600 hover:underline">Refund Policy</Link> for details on refunds.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Intellectual Property</h2>
                    <p>
                        All content, features, and functionality of Aerostic are owned by us and protected by intellectual property laws. You may not copy, modify, or distribute our software without permission.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Limitation of Liability</h2>
                    <p>
                        Aerostic is provided "as is" without warranties. We are not liable for any indirect, incidental, or consequential damages. Our total liability is limited to the amount you paid in the last 12 months.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Service Availability</h2>
                    <p>
                        We strive for 99.9% uptime but do not guarantee uninterrupted service. We may perform maintenance or updates that temporarily affect availability.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Termination</h2>
                    <p>
                        We may suspend or terminate your account for violations of these terms. Upon termination, your right to use the Service ceases immediately.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Governing Law</h2>
                    <p>
                        These Terms are governed by the laws of India. Any disputes shall be resolved in the courts of Noida, Uttar Pradesh.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">12. Changes to Terms</h2>
                    <p>
                        We may update these Terms at any time. Continued use of the Service after changes constitutes acceptance of the new Terms.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">13. Contact</h2>
                    <p>
                        Questions? Contact us at <strong>legal@aimstore.in</strong>
                    </p>
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
