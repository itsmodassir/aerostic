'use client';

import Link from 'next/link';
import { MessageSquare } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Privacy Policy</h1>
                <p className="text-gray-500 mb-8">Last updated: January 30, 2026</p>

                <div className="prose prose-lg max-w-none text-gray-600">
                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Introduction</h2>
                    <p>
                        Aerostic ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our WhatsApp Marketing SaaS platform.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Information We Collect</h2>
                    <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Personal Information</h3>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Name, email address, and phone number</li>
                        <li>Company/business information</li>
                        <li>Payment and billing information</li>
                        <li>WhatsApp Business Account details</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Usage Data</h3>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>IP address and device information</li>
                        <li>Browser type and operating system</li>
                        <li>Pages visited and features used</li>
                        <li>Message logs and campaign analytics</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. How We Use Your Information</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>To provide and maintain our services</li>
                        <li>To process payments and subscriptions</li>
                        <li>To send you service-related communications</li>
                        <li>To improve our platform and user experience</li>
                        <li>To comply with legal obligations</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Data Sharing</h2>
                    <p>
                        We do not sell your personal information. We may share data with:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-4">
                        <li>Service providers (payment processors, cloud hosting)</li>
                        <li>Meta/WhatsApp for API integration</li>
                        <li>Legal authorities when required by law</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Data Security</h2>
                    <p>
                        We implement industry-standard security measures including encryption, secure servers, and regular security audits to protect your data.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Data Retention</h2>
                    <p>
                        We retain your data for as long as your account is active or as needed to provide services. You can request deletion of your data at any time.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Your Rights</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Access and download your data</li>
                        <li>Correct inaccurate information</li>
                        <li>Delete your account and data</li>
                        <li>Opt-out of marketing communications</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Cookies</h2>
                    <p>
                        We use cookies and similar technologies to improve your experience. You can control cookies through your browser settings.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Contact Us</h2>
                    <p>
                        If you have questions about this Privacy Policy, contact us at:
                    </p>
                    <p className="mt-4">
                        <strong>Email:</strong> privacy@aimstore.in<br />
                        <strong>Address:</strong> Chembur, Mumbai, India 400071
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
