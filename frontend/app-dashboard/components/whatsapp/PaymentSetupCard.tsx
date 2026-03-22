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
        <div className={clsx("bg-white rounded-[32px] border-2 border-gray-50 p-6 md:p-8 shadow-xl shadow-gray-200/30 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300", className)}>
            <div className="flex items-center gap-4 mb-8">
                <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-colors", paymentConfigured ? 'bg-emerald-50' : 'bg-amber-50')}>
                    <CreditCard className={clsx("w-7 h-7", paymentConfigured ? 'text-emerald-600' : 'text-amber-600')} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Billing & Payments</h3>
                    <div className={clsx("text-[10px] font-black uppercase tracking-widest mt-1", paymentConfigured ? 'text-emerald-600' : 'text-amber-600')}>
                        {paymentConfigured ? 'Connected & Operational' : 'Action Required'}
                    </div>
                </div>
            </div>

            {!paymentConfigured && (
                <div className="p-5 bg-amber-50/50 border-2 border-amber-100 rounded-[24px] mb-8 shadow-sm shadow-amber-50 animate-pulse">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-amber-100 rounded-xl text-amber-600 shrink-0">
                            <AlertCircle size={20} />
                        </div>
                        <div>
                            <p className="font-black text-amber-900 text-sm tracking-tight">Add Payment Method</p>
                            <p className="text-xs font-bold text-amber-700/70 mt-1 leading-relaxed">
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
                        className="flex flex-col p-6 bg-gray-50 border-2 border-transparent hover:border-blue-500 hover:bg-white rounded-3xl transition-all group active:scale-[0.98] shadow-sm hover:shadow-xl hover:shadow-blue-500/10"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-black text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight text-xs">{action.label}</h4>
                            <ExternalLink size={14} className="text-gray-300 group-hover:text-blue-600 transition-colors" />
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 tracking-tight leading-relaxed">{action.desc}</p>
                    </a>
                ))}
            </div>

            {paymentConfigured && (
                <div className="mt-8 pt-6 border-t-2 border-gray-50">
                    <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-2xl w-fit">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Direct Debit Active</span>
                    </div>
                </div>
            )}
        </div>
    );
}
