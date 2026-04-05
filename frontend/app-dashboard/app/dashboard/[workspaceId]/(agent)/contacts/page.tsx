'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Plus, Upload, Search, Users2, Mail, Phone, Calendar, MoreVertical, X, Filter, BarChart3, TrendingUp, Target } from 'lucide-react';
import { useParams } from 'next/navigation';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import ContactRow from '@/components/crm/ContactRow';

interface Contact {
    id: string;
    name: string;
    phoneNumber: string;
    email?: string;
    createdAt: string;
}

export default function ContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newContact, setNewContact] = useState({ name: '', phoneNumber: '', email: '' });
    const [tenantId, setTenantId] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filterType, setFilterType] = useState<'all' | 'with_email' | 'recent'>('all');
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);

    const params = useParams();

    const filteredContacts = contacts.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.phoneNumber.includes(searchTerm) ||
            (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()));
        
        if (filterType === 'with_email') return matchesSearch && !!c.email;
        if (filterType === 'recent') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return matchesSearch && new Date(c.createdAt) > weekAgo;
        }
        return matchesSearch;
    });

    useEffect(() => {
        const initTenant = async () => {
            const workspaceSlug = params.workspaceId as string;
            if (!workspaceSlug) return;
            try {
                const res = await api.get('/auth/workspaces');
                const memberships = res.data;
                const activeMembership = memberships.find((m: any) => m.tenant?.slug === workspaceSlug);
                if (activeMembership && activeMembership.tenant?.id) {
                    const tid = activeMembership.tenant.id;
                    setTenantId(tid);
                    fetchContacts(tid);
                } else {
                    setLoading(false);
                }
            } catch (e) {
                setLoading(false);
            }
        };
        initTenant();
    }, [params.workspaceId]);

    const fetchContacts = async (tid: string) => {
        try {
            const res = await api.get(`/contacts?tenantId=${tid}`);
            setContacts(res.data);
        } catch (error) {
            console.error('Failed to fetch contacts', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddContact = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { ...newContact, tenantId };
            if (!payload.email) delete (payload as any).email;
            await api.post('/contacts', payload);
            setShowAddModal(false);
            setNewContact({ name: '', phoneNumber: '', email: '' });
            fetchContacts(tenantId);
        } catch (error: any) {
            alert('Failed to add contact. Ensure values are valid.');
        }
    };

    const handleEditContact = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedContact) return;
        try {
            await api.put(`/contacts/${selectedContact.id}`, { ...selectedContact, tenantId });
            setShowEditModal(false);
            setSelectedContact(null);
            fetchContacts(tenantId);
        } catch (error: any) {
            alert('Failed to update contact.');
        }
    };

    const handleDeleteContact = async (id: string) => {
        if (!confirm('Are you sure you want to delete this contact?')) return;
        try {
            await api.delete(`/contacts/${id}?tenantId=${tenantId}`);
            fetchContacts(tenantId);
        } catch (error: any) {
            alert('Failed to delete contact.');
        }
    };

    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.onchange = async (e: any) => {
            const file = e.target.files[0];
            if (!file) return;
            alert(`Ready to import ${file.name}. (Backend CSV import endpoint pending)`);
        };
        input.click();
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-32 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                            <Users2 size={24} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Your Audience</h1>
                    </div>
                    <p className="text-sm font-bold text-slate-400">Manage, segment, and grow your communication lists seamlessly.</p>
                </div>
                <div className="flex items-center gap-3">
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleImport} 
                        className="flex items-center gap-2 px-6 py-3 bg-white/70 backdrop-blur-md border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all font-black text-sm shadow-sm"
                    >
                        <Upload size={18} strokeWidth={2.5} />
                        Import CSV
                    </motion.button>
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl hover:shadow-xl hover:shadow-blue-200 transition-all font-black text-sm shadow-lg shadow-blue-100"
                    >
                        <Plus size={20} strokeWidth={3} />
                        Create Contact
                    </motion.button>
                </div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Audience', value: contacts.length, icon: Users2, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Recent Growth', value: '+12%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Verified Emails', value: contacts.filter(c => !!c.email).length, icon: Mail, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Conversion Rate', value: '8.4%', icon: Target, color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map((stat, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={stat.label} 
                        className="bg-white/80 backdrop-blur-md p-6 rounded-[32px] border border-slate-100 shadow-sm group hover:shadow-xl transition-all duration-300"
                    >
                        <div className={clsx("w-10 h-10 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                            <stat.icon size={20} strokeWidth={2.5} />
                        </div>
                        <div className="text-3xl font-black text-slate-800 tracking-tight">{stat.value}</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 px-1 sm:px-0 relative z-30">
                <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name, phone, or email..."
                        className="w-full pl-14 pr-6 py-4 bg-white/70 backdrop-blur-md border-2 border-slate-100 rounded-[28px] focus:border-blue-500 focus:ring-8 focus:ring-blue-500/5 outline-none font-bold text-slate-700 transition-all shadow-sm"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <button 
                        onClick={() => setShowFilters(!showFilters)} 
                        className={clsx(
                            "h-[60px] px-8 rounded-[28px] border-2 transition-all flex items-center justify-center gap-3 font-black text-sm shrink-0", 
                            showFilters ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 text-slate-500 border-transparent hover:border-slate-200"
                        )}
                    >
                        <Filter size={18} strokeWidth={2.5} />
                        Display Filters
                    </button>
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 top-full mt-3 w-56 bg-white rounded-[24px] shadow-2xl border border-slate-100 p-2 z-50 overflow-hidden"
                            >
                                {[
                                    { id: 'all', label: 'All Contacts' },
                                    { id: 'with_email', label: 'Verified Contacts' },
                                    { id: 'recent', label: 'Added Recently' }
                                ].map(f => (
                                    <button 
                                        key={f.id} 
                                        onClick={() => { setFilterType(f.id as any); setShowFilters(false); }} 
                                        className={clsx(
                                            "w-full text-left px-5 py-3 rounded-xl text-[11px] font-black transition-colors uppercase tracking-widest", 
                                            filterType === f.id ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50"
                                        )}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="space-y-4">
                {/* Desktop Table View */}
                <div className="hidden sm:block bg-white/80 backdrop-blur-md border border-slate-100 rounded-[40px] overflow-hidden shadow-xl shadow-slate-200/50">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left min-w-[900px]">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Audience Identity</th>
                                    <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Channels</th>
                                    <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Onboarded On</th>
                                    <th className="px-8 py-6"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="py-32 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Synchronizing audience...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredContacts.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-32 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-20">
                                                <div className="p-8 bg-slate-100 rounded-[40px]">
                                                    <Users2 size={64} />
                                                </div>
                                                <p className="font-black text-xl text-slate-900">Audience is empty</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    <AnimatePresence mode="popLayout">
                                        {filteredContacts.map((contact) => (
                                            <ContactRow 
                                                key={contact.id} 
                                                contact={contact}
                                                isActive={activeActionMenu === contact.id}
                                                onToggleMenu={() => setActiveActionMenu(activeActionMenu === contact.id ? null : contact.id)}
                                                onEdit={() => { setSelectedContact(contact); setShowEditModal(true); setActiveActionMenu(null); }}
                                                onDelete={() => { handleDeleteContact(contact.id); setActiveActionMenu(null); }}
                                            />
                                        ))}
                                    </AnimatePresence>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile Cards View */}
                <div className="sm:hidden space-y-4 px-1">
                    {loading ? (
                        <div className="py-20 text-center text-slate-400 font-bold">Fetching your audience...</div>
                    ) : filteredContacts.length === 0 ? (
                        <div className="py-20 text-center opacity-30">
                            <Users2 size={48} className="mx-auto" />
                            <p className="font-bold mt-2 text-slate-900">No contacts found</p>
                        </div>
                    ) : (
                        filteredContacts.map((contact) => (
                            <div key={contact.id} className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm flex flex-col gap-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-sm">
                                            {contact.name[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 text-sm leading-tight">{contact.name}</h3>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">ID: {contact.id.slice(0, 8)}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => { setSelectedContact(contact); setShowEditModal(true); }} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl">
                                        <MoreVertical size={20} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 gap-3 border-t border-slate-50 pt-4">
                                    <div className="flex items-center gap-3 text-xs font-bold text-slate-600 bg-slate-50/50 p-3 rounded-2xl">
                                        <Phone size={14} className="text-blue-500" />
                                        {contact.phoneNumber}
                                    </div>
                                    {contact.email && (
                                        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500 bg-slate-50/50 p-3 rounded-2xl">
                                            <Mail size={14} className="text-indigo-500" />
                                            {contact.email}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Add Contact Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
                            onClick={() => setShowAddModal(false)} 
                        />
                        <motion.div 
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="relative w-full max-w-lg bg-white sm:rounded-[40px] rounded-t-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Add Contact</h2>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Growth phase initiated</p>
                                </div>
                                <button onClick={() => setShowAddModal(false)} className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-400"><X size={20} strokeWidth={3} /></button>
                            </div>
                            
                            <form onSubmit={handleAddContact} className="p-10 space-y-8 overflow-y-auto">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-500 ml-1 uppercase tracking-widest">Full Name</label>
                                        <input
                                            required
                                            placeholder="e.g. Alexander Pierce"
                                            className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-slate-900"
                                            value={newContact.name}
                                            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-500 ml-1 uppercase tracking-widest">Phone Number</label>
                                        <div className="relative">
                                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black">+</div>
                                            <input
                                                required
                                                placeholder="15551234567"
                                                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl pl-12 pr-6 py-4 outline-none transition-all font-bold text-slate-900"
                                                value={newContact.phoneNumber}
                                                onChange={(e) => setNewContact({ ...newContact, phoneNumber: e.target.value.replace(/\D/g, '') })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-500 ml-1 uppercase tracking-widest">Email Address</label>
                                        <input
                                            type="email"
                                            placeholder="email@example.com"
                                            className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-slate-900"
                                            value={newContact.email}
                                            onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                
                                <div className="pt-4 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 px-8 py-5 border-2 border-slate-100 text-slate-400 font-black rounded-3xl hover:bg-slate-50 transition-all uppercase tracking-widest text-xs"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] px-8 py-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black rounded-3xl hover:shadow-xl hover:shadow-blue-200 transition-all shadow-lg shadow-blue-100 uppercase tracking-widest text-xs"
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Contact Modal */}
            <AnimatePresence>
                {showEditModal && selectedContact && (
                    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
                            onClick={() => setShowEditModal(false)} 
                        />
                        <motion.div 
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="relative w-full max-w-lg bg-white sm:rounded-[40px] rounded-t-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Edit Profile</h2>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Refining identity</p>
                                </div>
                                <button onClick={() => setShowEditModal(false)} className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-400"><X size={20} strokeWidth={3} /></button>
                            </div>
                            
                            <form onSubmit={handleEditContact} className="p-10 space-y-8 overflow-y-auto">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-500 ml-1 uppercase tracking-widest">Full Name</label>
                                        <input
                                            required
                                            className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-slate-900"
                                            value={selectedContact?.name || ''}
                                            onChange={(e) => setSelectedContact(prev => prev ? { ...prev, name: e.target.value } : null)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-500 ml-1 uppercase tracking-widest">Phone Number</label>
                                        <div className="relative">
                                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black">+</div>
                                            <input
                                                required
                                                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl pl-12 pr-6 py-4 outline-none transition-all font-bold text-slate-900"
                                                value={selectedContact?.phoneNumber || ''}
                                                onChange={(e) => setSelectedContact(prev => prev ? { ...prev, phoneNumber: e.target.value.replace(/\D/g, '') } : null)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-500 ml-1 uppercase tracking-widest">Email Address</label>
                                        <input
                                            type="email"
                                            className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-slate-900"
                                            value={selectedContact?.email || ''}
                                            onChange={(e) => setSelectedContact(prev => prev ? { ...prev, email: e.target.value } : null)}
                                        />
                                    </div>
                                </div>
                                
                                <div className="pt-4 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="flex-1 px-8 py-5 border-2 border-slate-100 text-slate-400 font-black rounded-3xl hover:bg-slate-50 transition-all uppercase tracking-widest text-xs"
                                    >
                                        Discard
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] px-8 py-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black rounded-3xl hover:shadow-xl hover:shadow-blue-200 transition-all shadow-lg shadow-blue-100 uppercase tracking-widest text-xs"
                                    >
                                        Update Details
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
