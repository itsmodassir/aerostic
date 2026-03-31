import React from 'react';
import { CreditCard, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { clsx } from 'clsx';

interface PaymentSetupCardProps {
    className?: string;
}

export default function PaymentSetupCard({ className = '' }: PaymentSetupCardProps) {
    // In a real implementation, this would fetch payment status from the backend
    const [paymentConfigured, setPaymentConfigured] = React.useState(false);

    return (
        <div className={clsx("bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300", className)}>
            <div className="flex items-center gap-4 mb-6">
                <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-colors", paymentConfigured ? 'bg-emerald-50' : 'bg-amber-50')}>
                    <CreditCard className={clsx("w-5 h-5", paymentConfigured ? 'text-emerald-600' : 'text-amber-600')} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Billing & Payments</h3>
                    <div className={clsx("text-xs font-semibold uppercase tracking-wider mt-0.5", paymentConfigured ? 'text-emerald-600' : 'text-amber-600')}>
                        {paymentConfigured ? 'Connected & Operational' : 'Action Required'}
                    </div>
                </div>
            </div>

            {!paymentConfigured && (
                <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl mb-6 shadow-sm">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 text-amber-600 shrink-0">
                            <AlertCircle size={18} />
                        </div>
                        <div>
                            <p className="font-semibold text-amber-900 text-sm">Add Payment Method</p>
                            <p className="text-xs text-amber-700/80 mt-1 leading-relaxed">
                                Business-initiated conversations require a verified payment method in your Meta Business Suite to scale beyond the sandbox.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                    {
                        label: paymentConfigured ? 'Update Method' : 'Configure Meta Billing',
                        desc: 'Access Business Manager settings',
                        href: 'https://business.facebook.com/settings/whatsapp-business-accounts'
                    },
                    {
                        label: 'Billing Analytics',
                        desc: 'Review historical Meta charges',
                        href: 'https://business.facebook.com/settings/whatsapp-business-accounts'
                    }
                ].map((action, idx) => (
                    <a
                        key={idx}
                        href={action.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col p-4 bg-white border border-gray-200 hover:border-blue-300 rounded-xl transition-shadow shadow-sm hover:shadow-md group"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight text-xs">{action.label}</h4>
                            <ExternalLink size={14} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                        <p className="text-xs text-gray-500">{action.desc}</p>
                    </a>
                ))}
            </div>

            {paymentConfigured && (
                <div className="mt-6 pt-5 border-t border-gray-100">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg w-fit">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-xs font-semibold text-emerald-700">Direct Debit Active</span>
                    </div>
                </div>
            )}
        </div>
    );
}
