import React, { useState, useEffect } from 'react';
import { 
    X, User, Phone, Mail, 
    Star, Users, CheckCircle2, 
    AlertCircle, Loader2, Tag
} from 'lucide-react';
import { clsx } from 'clsx';
import api from '@/lib/api';

interface AddEditContactModalProps {
    isOpen: boolean;
    contact: any | null;
    onClose: () => void;
    onSuccess: () => void;
}

const CONTACT_STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'];

const COUNTRY_CODES = [
    { code: '+91', country: 'India (IN)' },
    { code: '+1', country: 'USA/Canada (US/CA)' },
    { code: '+44', country: 'UK (GB)' },
    { code: '+971', country: 'UAE (AE)' },
    { code: '+61', country: 'Australia (AU)' },
    { code: '+65', country: 'Singapore (SG)' },
];

export default function AddEditContactModal({ isOpen, contact, onClose, onSuccess }: AddEditContactModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        countryCode: '+91',
        phoneNumber: '',
        email: '',
        status: 'NEW',
        isVIP: false,
        groups: [] as string[]
    });
    const [groupInput, setGroupInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (contact) {
            // Find if phone number starts with a known country code
            const foundCode = COUNTRY_CODES.find(c => contact.phoneNumber?.startsWith(c.code));
            const code = foundCode ? foundCode.code : '+91';
            const number = foundCode 
                ? contact.phoneNumber.slice(code.length) 
                : (contact.phoneNumber?.startsWith('+') ? contact.phoneNumber : contact.phoneNumber);

            setFormData({
                name: contact.name || '',
                countryCode: code,
                phoneNumber: number || '',
                email: contact.email || '',
                status: contact.status || 'NEW',
                isVIP: contact.isVIP || false,
                groups: contact.groups || []
            });
        } else {
            setFormData({
                name: '',
                countryCode: '+91',
                phoneNumber: '',
                email: '',
                status: 'NEW',
                isVIP: false,
                groups: []
            });
        }
    }, [contact, isOpen]);

    const handleAddGroup = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && groupInput.trim()) {
            e.preventDefault();
            if (!formData.groups.includes(groupInput.trim())) {
                setFormData({ ...formData, groups: [...formData.groups, groupInput.trim()] });
            }
            setGroupInput('');
        }
    };

    const removeGroup = (tag: string) => {
        setFormData({ ...formData, groups: formData.groups.filter(g => g !== tag) });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const fullPhone = formData.phoneNumber.startsWith('+') 
                ? formData.phoneNumber 
                : `${formData.countryCode}${formData.phoneNumber.replace(/\D/g, '')}`;

            const payload = { 
                ...formData,
                phoneNumber: fullPhone
            };
            
            if (!payload.email || payload.email.trim() === '') {
                delete (payload as any).email;
            }

            if (contact) {
                await api.patch(`/contacts/${contact.id}`, payload);
            } else {
                await api.post('/contacts', payload);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save contact');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center font-bold text-lg">
                            {formData.name ? formData.name.charAt(0) : <User size={20} />}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 leading-none">{contact ? 'Edit Profile' : 'New Contact'}</h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">CRM Core</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-black"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                    {/* VIP Status */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex items-center gap-2">
                            <Star size={16} className={clsx(formData.isVIP ? "fill-amber-400 text-amber-400" : "text-gray-300")} />
                            <span className="text-xs font-bold text-gray-600">VIP Priority Status</span>
                        </div>
                        <button 
                            type="button"
                            onClick={() => setFormData({ ...formData, isVIP: !formData.isVIP })}
                            className={clsx(
                                "w-9 h-5 rounded-full relative transition-all",
                                formData.isVIP ? "bg-black" : "bg-gray-300"
                            )}
                        >
                            <div className={clsx(
                                "w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all",
                                formData.isVIP ? "right-0.5" : "left-0.5"
                            )} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Name */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                            <input 
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Vikram Singh"
                                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black transition-all outline-none text-sm font-semibold"
                                required
                            />
                        </div>

                        {/* Phone */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Mobile Connection</label>
                            <div className="flex gap-2">
                                <select 
                                    value={formData.countryCode}
                                    onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                                    className="w-24 p-3 bg-white border border-gray-200 rounded-xl focus:border-black transition-all outline-none text-sm font-bold"
                                    disabled={!!contact}
                                >
                                    {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                                </select>
                                <input 
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    placeholder="9876543210"
                                    className="flex-1 p-3 bg-white border border-gray-200 rounded-xl focus:border-black transition-all outline-none text-sm font-bold"
                                    required
                                    disabled={!!contact}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                            <input 
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="client@brand.com"
                                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-black transition-all outline-none text-sm font-semibold"
                            />
                        </div>

                        {/* Status */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Lead Status</label>
                            <select 
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-black transition-all outline-none text-sm font-bold"
                            >
                                {CONTACT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        {/* Groups */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Group Tags</label>
                            <div className="flex flex-wrap gap-1.5 mb-2">
                                {formData.groups.map(g => (
                                    <span key={g} className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-[10px] font-bold uppercase tracking-wide border border-gray-200">
                                        {g}
                                        <button onClick={() => removeGroup(g)} className="hover:text-red-500"><X size={10} /></button>
                                    </span>
                                ))}
                            </div>
                            <input 
                                value={groupInput}
                                onChange={(e) => setGroupInput(e.target.value)}
                                onKeyDown={handleAddGroup}
                                placeholder="Add group tag..."
                                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none text-sm font-medium focus:bg-white focus:border-black transition-all"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600">
                            <AlertCircle size={14} />
                            <p className="text-[10px] font-bold uppercase tracking-wider">{error}</p>
                        </div>
                    )}
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2.5 text-gray-400 font-bold text-[11px] uppercase tracking-wider hover:text-black transition-colors"
                    >
                        Discard
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-8 py-2.5 bg-black text-white rounded-xl font-bold text-[11px] uppercase tracking-wider hover:bg-gray-800 transition-all flex items-center gap-2 disabled:bg-gray-400"
                    >
                        {loading ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                        Save Account
                    </button>
                </div>
            </div>
        </div>
    );
}
