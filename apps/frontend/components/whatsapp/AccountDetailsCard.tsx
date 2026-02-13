import React from 'react';
import { Building2, Phone, Key, Copy, CheckCircle } from 'lucide-react';

interface AccountDetailsCardProps {
    businessId?: string;
    wabaId: string;
    phoneNumberId: string;
    displayPhoneNumber?: string;
    verifiedName?: string;
}

export default function AccountDetailsCard({
    businessId,
    wabaId,
    phoneNumberId,
    displayPhoneNumber,
    verifiedName,
}: AccountDetailsCardProps) {
    const [copiedField, setCopiedField] = React.useState<string | null>(null);

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const InfoRow = ({ label, value, icon: Icon, field }: any) => {
        if (!value) return null;

        return (
            <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">{label}</p>
                        <p className="text-sm font-mono text-gray-900 mt-0.5">{value}</p>
                    </div>
                </div>
                <button
                    onClick={() => copyToClipboard(value, field)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Copy to clipboard"
                >
                    {copiedField === field ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                    )}
                </button>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-bold text-gray-900">Account Information</h3>
                    <p className="text-sm text-gray-500 mt-1">Your WhatsApp Business Account details</p>
                </div>
                {verifiedName && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Verified
                    </div>
                )}
            </div>

            <div className="space-y-0">
                {verifiedName && (
                    <InfoRow
                        label="Verified Business Name"
                        value={verifiedName}
                        icon={Building2}
                        field="verifiedName"
                    />
                )}

                {displayPhoneNumber && (
                    <InfoRow
                        label="Display Phone Number"
                        value={displayPhoneNumber}
                        icon={Phone}
                        field="displayPhone"
                    />
                )}

                {businessId && (
                    <InfoRow
                        label="Business ID"
                        value={businessId}
                        icon={Building2}
                        field="businessId"
                    />
                )}

                <InfoRow
                    label="WhatsApp Business Account ID (WABA)"
                    value={wabaId}
                    icon={Building2}
                    field="wabaId"
                />

                <InfoRow
                    label="Phone Number ID"
                    value={phoneNumberId}
                    icon={Key}
                    field="phoneNumberId"
                />
            </div>
        </div>
    );
}
