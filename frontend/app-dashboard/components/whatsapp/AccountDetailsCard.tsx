import React from 'react';
import { Building2, Phone, Key, Copy, CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';

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
            <div className="flex items-center justify-between py-5 border-b-2 border-gray-50 last:border-0 group">
                <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-50 transition-colors border border-gray-100">
                        <Icon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs text-gray-500 font-semibold mb-0.5">{label}</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{value}</p>
                    </div>
                </div>
                <button
                    onClick={() => copyToClipboard(value, field)}
                    className={clsx(
                        "p-3 rounded-xl transition-all active:scale-95 shrink-0",
                        copiedField === field ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                    )}
                >
                    {copiedField === field ? (
                        <CheckCircle className="w-5 h-5 shadow-sm" />
                    ) : (
                        <Copy className="w-5 h-5" />
                    )}
                </button>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Account Profile</h3>
                    <p className="text-sm text-gray-500 mt-1">Official Meta Credentials</p>
                </div>
                {verifiedName && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-green-100 shadow-sm shadow-green-100">
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
                        label="Official Display Number"
                        value={displayPhoneNumber}
                        icon={Phone}
                        field="displayPhone"
                    />
                )}

                {businessId && (
                    <InfoRow
                        label="Meta Business ID"
                        value={businessId}
                        icon={Building2}
                        field="businessId"
                    />
                )}

                <InfoRow
                    label="WhatsApp Account ID (WABA)"
                    value={wabaId}
                    icon={Building2}
                    field="wabaId"
                />

                <InfoRow
                    label="Business Phone Number ID"
                    value={phoneNumberId}
                    icon={Key}
                    field="phoneNumberId"
                />
            </div>
        </div>
    );
}
