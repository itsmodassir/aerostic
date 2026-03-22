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
        <div className={clsx("bg-white rounded-[32px] border-2 border-gray-50 p-6 md:p-8 shadow-xl shadow-gray-200/30 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100", className)}>
            <div className="mb-8">
                <h3 className="text-xl font-black text-gray-900 tracking-tight text-center sm:text-left">Feature Matrix</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1 text-center sm:text-left">Service capability breakdown</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {features.map((feature) => {
                    const Icon = feature.icon;
                    return (
                        <div
                            key={feature.name}
                            className="flex flex-col sm:flex-row items-center justify-between p-5 bg-gray-50/50 border-2 border-transparent hover:border-blue-500 hover:bg-white rounded-3xl transition-all group shadow-sm hover:shadow-xl hover:shadow-blue-500/10 active:scale-[0.98]"
                        >
                            <div className="flex flex-col sm:flex-row items-center gap-5 flex-1 w-full text-center sm:text-left">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                                    <Icon className="w-7 h-7 text-gray-400 group-hover:text-white transition-colors" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-black text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight text-sm mb-1">{feature.name}</h4>
                                    <p className="text-xs text-gray-400 font-bold tracking-tight line-clamp-1">{feature.description}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mt-4 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
                                {getStatusBadge(feature.status)}
                                <a
                                    href={feature.action.href}
                                    target={feature.action.external ? '_blank' : undefined}
                                    rel={feature.action.external ? 'noopener noreferrer' : undefined}
                                    className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-white border border-gray-100 text-gray-400 hover:text-blue-600 hover:border-blue-200 rounded-xl transition-all flex items-center gap-1 shadow-sm"
                                >
                                    {feature.action.label}
                                    <ChevronRight size={12} />
                                </a>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
