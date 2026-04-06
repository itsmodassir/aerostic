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

export default function AddEditContactModal({ isOpen, contact, onClose, onSuccess }: AddEditContactModalProps) {
    const [formData, setFormData] = useState({
        name: '',
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
            setFormData({
                name: contact.name || '',
                phoneNumber: contact.phoneNumber || '',
                email: contact.email || '',
                status: contact.status || 'NEW',
                isVIP: contact.isVIP || false,
                groups: contact.groups || []
            });
        } else {
            setFormData({
                name: '',
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
            if (contact) {
                await api.patch(`/contacts/${contact.id}`, formData);
            } else {
                await api.post('/contacts', formData);
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl relative border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg shadow-gray-200 uppercase">
                            {formData.name ? formData.name.charAt(0) : <User size={24} />}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">{contact ? 'Edit Profile' : 'New Contact'}</h2>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Contact Identity Hub</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-3 hover:bg-gray-100 rounded-2xl transition-colors border border-gray-200 text-gray-400 hover:text-black"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                    {/* VIP Toggle */}
                    <button 
                        type="button"
                        onClick={() => setFormData({ ...formData, isVIP: !formData.isVIP })}
                        className={clsx(
                            "w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all active:scale-95",
                            formData.isVIP ? "bg-emerald-50 border-emerald-500 text-emerald-900" : "bg-gray-50 border-gray-100 text-gray-400 grayscale"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <Star size={20} className={formData.isVIP ? "fill-emerald-500 text-emerald-500" : ""} />
                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">VIP Client Priority</span>
                        </div>
                        <div className={clsx(
                            "w-10 h-5 rounded-full relative transition-all",
                            formData.isVIP ? "bg-emerald-500" : "bg-gray-200"
                        )}>
                            <div className={clsx(
                                "w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all",
                                formData.isVIP ? "right-0.5" : "left-0.5"
                            )} />
                        </div>
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <User size={14} /> Full Descriptor
                            </label>
                            <input 
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Vikram Singh"
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-sm font-bold tracking-tight"
                                required
                            />
                        </div>

                        {/* Phone */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Phone size={14} /> WhatsApp Link
                            </label>
                            <input 
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                placeholder="+91 9876543210"
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-sm font-bold tracking-tight"
                                required
                                disabled={!!contact}
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Mail size={14} /> Communication Hub
                            </label>
                            <input 
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="client@brand.com"
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-sm font-bold tracking-tight"
                            />
                        </div>

                        {/* Status */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Tag size={14} /> Pipeline Phase
                            </label>
                            <select 
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-sm font-bold tracking-tight appearance-none"
                            >
                                {CONTACT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        {/* Group Assignment */}
                        <div className="space-y-3 md:col-span-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Users size={14} /> Group Participation
                            </label>
                            <div className="w-full p-2 bg-gray-50 border border-gray-100 rounded-3xl min-h-[100px] flex flex-wrap gap-2 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all">
                                {formData.groups.map(g => (
                                    <span key={g} className="inline-flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-xl text-[9px] font-black uppercase tracking-widest">
                                        {g}
                                        <button onClick={() => removeGroup(g)} className="hover:text-red-400"><X size={12} /></button>
                                    </span>
                                ))}
                                <input 
                                    value={groupInput}
                                    onChange={(e) => setGroupInput(e.target.value)}
                                    onKeyDown={handleAddGroup}
                                    placeholder="Type group and press Enter..."
                                    className="flex-1 bg-transparent border-none outline-none text-sm font-medium px-2 py-1 min-w-[200px]"
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in slide-in-from-top-2">
                            <AlertCircle size={18} />
                            <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
                        </div>
                    )}
                </form>

                {/* Footer */}
                <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-4 rounded-b-[40px]">
                    <button 
                        onClick={onClose}
                        className="px-8 py-4 text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-black transition-colors"
                    >
                        Discard
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-12 py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-gray-200 hover:bg-emerald-600 transition-all active:scale-95 disabled:bg-gray-400 flex items-center gap-3"
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                        Confirm Persistence
                    </button>
                </div>
            </div>
        </div>
    );
}
