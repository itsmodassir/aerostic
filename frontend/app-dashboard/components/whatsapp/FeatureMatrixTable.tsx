import React from 'react';
import { CheckCircle, MessageSquare, Image, Workflow, CreditCard, Smartphone, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

interface FeatureMatrixTableProps {
    className?: string;
}

export default function FeatureMatrixTable({ className = '' }: FeatureMatrixTableProps) {
    const features = [
        {
            name: 'Template Messaging',
            status: 'enabled',
            icon: MessageSquare,
            description: 'Automated notification engine',
            action: { label: 'Manage', href: '../templates' },
        },
        {
            name: 'Interactive UI',
            status: 'enabled',
            icon: Smartphone,
            description: 'Buttons & list interactions',
            action: { label: 'View Docs', href: 'https://developers.facebook.com/docs/whatsapp/guides/interactive-messages', external: true },
        },
        {
            name: 'Rich Media',
            status: 'enabled',
            icon: Image,
            description: 'Images, video & document support',
            action: { label: 'Check Limits', href: 'https://developers.facebook.com/docs/whatsapp/api/media', external: true },
        },
        {
            name: 'Advanced Flows',
            status: 'enabled',
            icon: Workflow,
            description: 'Conversational form processing',
            action: { label: 'Builder', href: 'whatsapp/flows' },
        },
        {
            name: 'Coexistence Mode',
            status: 'enabled',
            icon: Smartphone,
            description: 'Sync with official WhatsApp app',
            action: { label: 'Sync Now', href: '#' },
        },
        {
            name: 'Native Payments',
            status: 'unavailable',
            icon: CreditCard,
            description: 'In-chat checkout systems',
            action: { label: 'Explore', href: 'https://developers.facebook.com/docs/whatsapp/payments', external: true },
        },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'enabled':
                return (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm shadow-emerald-50">
                        <CheckCircle className="w-3 h-3" />
                        Active
                    </div>
                );
            case 'pending':
                return (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-100 shadow-sm shadow-amber-50">
                        <CheckCircle className="w-3 h-3" />
                        Pending
                    </div>
                );
            case 'unavailable':
                return (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-gray-100">
                        Locked
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={clsx("p-6", className)}>
            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 text-center sm:text-left">Feature Matrix</h3>
                <p className="text-sm text-gray-500 mt-1 text-center sm:text-left">Service capability breakdown</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                {features.map((feature) => {
                    const Icon = feature.icon;
                    return (
                        <div
                            key={feature.name}
                            className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white border border-gray-200 hover:border-blue-300 rounded-xl transition-shadow group shadow-sm hover:shadow-md"
                        >
                            <div className="flex flex-col sm:flex-row items-center gap-4 flex-1 w-full text-center sm:text-left">
                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:bg-blue-50 transition-colors shrink-0">
                                    <Icon className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-900 text-sm mb-0.5 group-hover:text-blue-600 transition-colors">{feature.name}</h4>
                                    <p className="text-xs text-gray-500 truncate">{feature.description}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mt-4 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
                                {getStatusBadge(feature.status)}
                                <a
                                    href={feature.action.href}
                                    target={feature.action.external ? '_blank' : undefined}
                                    rel={feature.action.external ? 'noopener noreferrer' : undefined}
                                    className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 hover:bg-white hover:text-blue-600 hover:border-blue-200 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                                >
                                    {feature.action.label}
                                    <ChevronRight size={14} />
                                </a>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
