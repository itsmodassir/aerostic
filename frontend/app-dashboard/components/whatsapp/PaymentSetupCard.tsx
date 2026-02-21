import React from 'react';
import { CreditCard, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';

interface PaymentSetupCardProps {
    className?: string;
}

export default function PaymentSetupCard({ className = '' }: PaymentSetupCardProps) {
    // In a real implementation, this would fetch payment status from the backend
    const [paymentConfigured, setPaymentConfigured] = React.useState(false);

    return (
        <div className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 ${paymentConfigured ? 'bg-green-100' : 'bg-amber-100'} rounded-xl flex items-center justify-center`}>
                    <CreditCard className={`w-6 h-6 ${paymentConfigured ? 'text-green-600' : 'text-amber-600'}`} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">Payment Setup</h3>
                    <p className={`text-sm font-medium ${paymentConfigured ? 'text-green-600' : 'text-amber-600'}`}>
                        {paymentConfigured ? 'Payment method configured' : 'Payment method required'}
                    </p>
                </div>
            </div>

            {!paymentConfigured && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-medium text-amber-800 text-sm">Payment Method Required</p>
                            <p className="text-sm text-amber-700 mt-1">
                                Add a payment method to continue using WhatsApp Business API beyond the free tier.
                                You'll only be charged for conversations initiated by your business.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                <a
                    href="https://business.facebook.com/settings/whatsapp-business-accounts"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-sm transition-all group"
                >
                    <div>
                        <h4 className="font-semibold text-gray-900 group-hover:text-purple-600">
                            {paymentConfigured ? 'Manage Payment Method' : 'Add Payment Method'}
                        </h4>
                        <p className="text-sm text-gray-500 mt-0.5">Configure billing in Meta Business Suite</p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-purple-600" />
                </a>

                <a
                    href="https://business.facebook.com/settings/whatsapp-business-accounts"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-sm transition-all group"
                >
                    <div>
                        <h4 className="font-semibold text-gray-900 group-hover:text-purple-600">View Billing History</h4>
                        <p className="text-sm text-gray-500 mt-0.5">Check your conversation charges</p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-purple-600" />
                </a>
            </div>

            {paymentConfigured && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>Payment method active</span>
                    </div>
                </div>
            )}
        </div>
    );
}
