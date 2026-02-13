import React from 'react';
import { CheckCircle, MessageSquare, Image, Workflow, CreditCard, Smartphone } from 'lucide-react';

interface FeatureMatrixTableProps {
    className?: string;
}

export default function FeatureMatrixTable({ className = '' }: FeatureMatrixTableProps) {
    const features = [
        {
            name: 'Template Messaging',
            status: 'enabled',
            icon: MessageSquare,
            description: 'Send pre-approved message templates',
            action: { label: 'Manage Templates', href: '../templates' },
        },
        {
            name: 'Interactive Messages',
            status: 'enabled',
            icon: Smartphone,
            description: 'Buttons, lists, and quick replies',
            action: { label: 'View Docs', href: 'https://developers.facebook.com/docs/whatsapp/guides/interactive-messages', external: true },
        },
        {
            name: 'Media Messaging',
            status: 'enabled',
            icon: Image,
            description: 'Send images, videos, and documents',
            action: { label: 'Check Limits', href: 'https://developers.facebook.com/docs/whatsapp/api/media', external: true },
        },
        {
            name: 'WhatsApp Flows',
            status: 'pending',
            icon: Workflow,
            description: 'Advanced conversational forms',
            action: { label: 'Request Access', href: 'https://developers.facebook.com/docs/whatsapp/flows', external: true },
        },
        {
            name: 'WhatsApp Pay',
            status: 'unavailable',
            icon: CreditCard,
            description: 'In-chat payment processing',
            action: { label: 'Learn More', href: 'https://developers.facebook.com/docs/whatsapp/payments', external: true },
        },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'enabled':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Enabled
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Pending
                    </span>
                );
            case 'unavailable':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Not Available
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
            <h3 className="font-bold text-gray-900 mb-4">Feature Availability</h3>
            <p className="text-sm text-gray-500 mb-6">WhatsApp Business API features enabled for your account</p>

            <div className="space-y-4">
                {features.map((feature) => {
                    const Icon = feature.icon;
                    return (
                        <div
                            key={feature.name}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-sm transition-all"
                        >
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Icon className="w-5 h-5 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">{feature.name}</h4>
                                    <p className="text-sm text-gray-500">{feature.description}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {getStatusBadge(feature.status)}
                                <a
                                    href={feature.action.href}
                                    target={feature.action.external ? '_blank' : undefined}
                                    rel={feature.action.external ? 'noopener noreferrer' : undefined}
                                    className="px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                >
                                    {feature.action.label}
                                </a>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
