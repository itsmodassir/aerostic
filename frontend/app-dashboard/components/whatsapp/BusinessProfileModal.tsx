import React, { useState, useEffect } from 'react';
import { 
    X, Camera, Building2, Globe, Mail, 
    MapPin, AlignLeft, CheckCircle2, AlertCircle,
    Loader2
} from 'lucide-react';
import { clsx } from 'clsx';
import api from '@/lib/api';

interface BusinessProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any;
}

const VERTICALS = [
    { value: 'OTHER', label: 'Other' },
    { value: 'AUTO', label: 'Automotive' },
    { value: 'BEAUTY', label: 'Beauty, Spa and Salon' },
    { value: 'APPAREL', label: 'Clothing and Apparel' },
    { value: 'EDU', label: 'Education' },
    { value: 'ENTERTAIN', label: 'Entertainment' },
    { value: 'EVENT_PLAN', label: 'Event Planning and Service' },
    { value: 'FINANCE', label: 'Finance and Banking' },
    { value: 'GROCERY', label: 'Food and Grocery' },
    { value: 'GOVT', label: 'Public Service / Government' },
    { value: 'HOTEL', label: 'Hotel and Lodging' },
    { value: 'HEALTH', label: 'Medical and Health' },
    { value: 'NON_PROFIT', label: 'Non-profit' },
    { value: 'PROF_SERVICES', label: 'Professional Services' },
    { value: 'RETAIL', label: 'Shopping and Retail' },
    { value: 'TRAVEL', label: 'Travel and Transportation' },
    { value: 'RESTAURANT', label: 'Restaurant' },
];

export default function BusinessProfileModal({ 
    isOpen, 
    onClose, 
    onSuccess,
    initialData 
}: BusinessProfileModalProps) {
    const [formData, setFormData] = useState({
        about: '',
        description: '',
        address: '',
        email: '',
        vertical: 'OTHER',
        websites: ['']
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                about: initialData.about || '',
                description: initialData.description || '',
                address: initialData.address || '',
                email: initialData.email || '',
                vertical: initialData.vertical || 'OTHER',
                websites: initialData.websites?.length ? initialData.websites : ['']
            });
            setPreviewUrl(initialData.profile_picture_url || null);
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleWebsitesChange = (index: number, value: string) => {
        const newWebsites = [...formData.websites];
        newWebsites[index] = value;
        setFormData({ ...formData, websites: newWebsites });
    };

    const addWebsite = () => {
        if (formData.websites.length < 2) {
            setFormData({ ...formData, websites: [...formData.websites, ''] });
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onload = (prev) => setPreviewUrl(prev.target?.result as string);
        reader.readAsDataURL(file);

        setUploading(true);
        setError(null);
        
        try {
            const uploadData = new FormData();
            uploadData.append('file', file);
            await api.post('/whatsapp/profile/photo', uploadData);
            onSuccess();
        } catch (err: any) {
            console.error('Photo upload failed', err);
            setError(err.response?.data?.message || 'Failed to upload photo');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await api.post('/whatsapp/profile', {
                ...formData,
                websites: formData.websites.filter(w => w.trim() !== '')
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Profile update failed', err);
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[40px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative border border-gray-100 flex flex-col">
                {/* Header */}
                <div className="p-8 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm">
                            <Building2 className="text-emerald-600" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">WhatsApp Business Profile</h2>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Update how customers see your brand</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-3 hover:bg-gray-50 rounded-2xl transition-colors border border-gray-100 group"
                    >
                        <X className="text-gray-400 group-hover:text-gray-900 transition-colors" size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8 flex-1">
                    {/* Error Alert */}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in slide-in-from-top-2">
                            <AlertCircle size={20} className="shrink-0" />
                            <p className="text-xs font-bold uppercase tracking-wider">{error}</p>
                        </div>
                    )}

                    {/* Profile Photo */}
                    <div className="flex flex-col items-center gap-6">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-[40px] overflow-hidden border-4 border-gray-50 bg-gray-100 shadow-inner flex items-center justify-center">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <Camera size={32} className="text-gray-300" />
                                )}
                            </div>
                            <label className="absolute -bottom-2 -right-2 bg-black text-white p-3 rounded-2xl cursor-pointer hover:bg-emerald-600 transition-all shadow-lg active:scale-90 flex items-center justify-center">
                                {uploading ? <Loader2 className="animate-spin" size={18} /> : <Camera size={18} />}
                                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                            </label>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
                            Recommended: 640x640px JPG/PNG<br/>
                            Max size: 5MB
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* About / Status */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <AlignLeft size={14} /> Business About
                            </label>
                            <input 
                                value={formData.about}
                                onChange={(e) => setFormData({...formData, about: e.target.value})}
                                placeholder="Your brand's brief tagline..."
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-sm font-medium"
                                maxLength={139}
                            />
                            <p className="text-[9px] text-gray-400 text-right font-bold tracking-tighter">
                                {formData.about.length} / 139 characters
                            </p>
                        </div>

                        {/* Category (Vertical) */}
                        <div className="space-y-4">
                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <CheckCircle2 size={14} /> Business Category
                            </label>
                            <select 
                                value={formData.vertical}
                                onChange={(e) => setFormData({...formData, vertical: e.target.value})}
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-sm font-medium appearance-none"
                            >
                                {VERTICALS.map(v => (
                                    <option key={v.value} value={v.value}>{v.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Description */}
                        <div className="space-y-4 md:col-span-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <AlignLeft size={14} /> Detailed Description
                            </label>
                            <textarea 
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                rows={3}
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-sm font-medium resize-none"
                                placeholder="Elevate your brand with our premium services..."
                                maxLength={256}
                            />
                            <p className="text-[9px] text-gray-400 text-right font-bold tracking-tighter">
                                {formData.description.length} / 256 characters
                            </p>
                        </div>

                        {/* Contacts */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Mail size={14} /> Support Email
                            </label>
                            <input 
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-sm font-medium"
                                placeholder="support@brand.com"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <MapPin size={14} /> Physical Address
                            </label>
                            <input 
                                value={formData.address}
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-sm font-medium"
                                placeholder="123 Brand Street, Suite 100"
                            />
                        </div>

                        {/* Websites */}
                        <div className="md:col-span-2 space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Globe size={14} /> Official Websites
                                </label>
                                {formData.websites.length < 2 && (
                                    <button 
                                        type="button"
                                        onClick={addWebsite}
                                        className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700"
                                    >
                                        + Add Website
                                    </button>
                                )}
                            </div>
                            <div className="space-y-3">
                                {formData.websites.map((url, idx) => (
                                    <input 
                                        key={idx}
                                        value={url}
                                        onChange={(e) => handleWebsitesChange(idx, e.target.value)}
                                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-sm font-medium"
                                        placeholder="https://www.brand.com"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-4 sticky bottom-0 z-10 backdrop-blur-md rounded-b-[40px]">
                    <button 
                        onClick={onClose}
                        className="px-8 py-4 text-gray-500 font-black text-[10px] uppercase tracking-[0.2em] hover:text-gray-900 transition-colors"
                    >
                        Discard
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-12 py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-xl shadow-gray-200 active:scale-95 disabled:bg-gray-400 disabled:shadow-none flex items-center gap-3"
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                        Sync with Meta
                    </button>
                </div>
            </div>
        </div>
    );
}
