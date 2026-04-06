import React from 'react';
import { Building2, Phone, Key, Copy, CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface AccountDetailsCardProps {
    businessId?: string;
    wabaId: string;
    phoneNumberId: string;
    displayPhoneNumber?: string;
    verifiedName?: string;
    onEdit?: () => void;
}

export default function AccountDetailsCard({
    businessId,
    wabaId,
    phoneNumberId,
    displayPhoneNumber,
    verifiedName,
    onEdit,
}: AccountDetailsCardProps) {
    const [copiedField, setCopiedField] = React.useState<string | null>(null);

    const copyToClipboard = (text: string, field: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const InfoRow = ({ label, value, icon: Icon, field }: any) => {
        if (!value) return null;

        return (
            <div className="flex items-center justify-between py-5 border-b-2 border-gray-50 last:border-0 group">
                <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-emerald-50 transition-colors border border-gray-100">
                        <Icon className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">{label}</p>
                        <p className="text-sm font-bold text-gray-900 truncate">{value}</p>
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
                        <Copy className="w-5 h-5 px-0.5" />
                    )}
                </button>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-[32px] border border-gray-200/60 p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm">
                        <Building2 className="text-emerald-600" size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-gray-900 tracking-tight">Account Identity</h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Meta Cloud Hub credentials</p>
                    </div>
                </div>
                {onEdit && (
                    <button 
                        onClick={onEdit}
                        className="px-4 py-2 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-gray-100"
                    >
                        Edit Profile
                    </button>
                )}
            </div>

            <div className="space-y-0 flex-1">
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
                    icon={Key}
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
