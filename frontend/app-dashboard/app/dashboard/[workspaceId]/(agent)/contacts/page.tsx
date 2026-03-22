'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Plus, Upload, Search, Users2, Mail, Phone, Calendar, MoreVertical, X, Filter } from 'lucide-react';
import { useParams } from 'next/navigation';
import { clsx } from 'clsx';

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

    const params = useParams();

    const filteredContacts = contacts.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phoneNumber.includes(searchTerm) ||
        (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

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

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Users2 className="text-blue-600" size={32} />
                        Contacts
                    </h1>
                    <p className="text-gray-400 text-sm mt-1 font-medium">Manage your audience and communication lists</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border-2 border-gray-100 text-gray-600 rounded-2xl hover:bg-gray-50 transition-all font-bold text-sm shadow-sm">
                        <Upload size={18} />
                        Import
                    </button>
                    <button onClick={() => setShowAddModal(true)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-black text-sm shadow-lg shadow-blue-100">
                        <Plus size={18} />
                        Add Contact
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-3xl border-2 border-gray-100 shadow-sm">
                    <div className="text-2xl font-black text-gray-900">{contacts.length}</div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Audience</div>
                </div>
                {/* Placeholder stats */}
                <div className="bg-white p-4 rounded-3xl border-2 border-gray-100 shadow-sm">
                    <div className="text-2xl font-black text-green-600">100%</div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Rate</div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, phone or email..."
                        className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm transition-all"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="px-5 py-3 bg-gray-50 text-gray-400 rounded-2xl border-2 border-transparent hover:border-gray-200 transition-all flex items-center justify-center gap-2 font-bold text-sm">
                    <Filter size={18} />
                    Filters
                </button>
            </div>

            {/* Contacts Container */}
            <div className="bg-white border-2 border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left min-w-[700px]">
                        <thead>
                            <tr className="bg-gray-50/50 border-b-2 border-gray-100">
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact details</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Communication</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Added on</th>
                                <th className="px-6 py-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={4} className="py-20 text-center text-gray-400 font-bold">Fetching your audience...</td></tr>
                            ) : filteredContacts.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-2 opacity-30">
                                            <Users2 size={48} />
                                            <p className="font-bold">No contacts found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredContacts.map((contact) => (
                                    <tr key={contact.id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm">
                                                    {contact.name[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-black text-gray-900 text-sm">{contact.name}</div>
                                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">ID: {contact.id.slice(0, 8)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 space-y-1">
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                                                <Phone size={12} className="text-gray-300" />
                                                {contact.phoneNumber}
                                            </div>
                                            {contact.email && (
                                                <div className="flex items-center gap-2 text-[11px] font-medium text-gray-400">
                                                    <Mail size={12} className="text-gray-300" />
                                                    {contact.email}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                                <Calendar size={12} className="text-gray-300" />
                                                {new Date(contact.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button className="p-2 hover:bg-white rounded-lg transition-all opacity-0 group-hover:opacity-100 shadow-sm border border-transparent hover:border-gray-200">
                                                <MoreVertical size={16} className="text-gray-400" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Contact Modal - Meta Style */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
                    <div className="relative w-full max-w-lg bg-white sm:rounded-[32px] rounded-t-[32px] shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 tracking-tight">Add Contact</h2>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">New audience member</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400"><X size={20} /></button>
                        </div>
                        
                        <form onSubmit={handleAddContact} className="p-8 space-y-6 overflow-y-auto">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-black text-gray-700 ml-1">Full Name</label>
                                    <input
                                        required
                                        placeholder="John Doe"
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-5 py-3 outline-none transition-all font-medium text-gray-900"
                                        value={newContact.name}
                                        onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-black text-gray-700 ml-1">Phone Number</label>
                                    <div className="relative">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-black">+</div>
                                        <input
                                            required
                                            placeholder="15551234567"
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl pl-10 pr-5 py-3 outline-none transition-all font-medium text-gray-900"
                                            value={newContact.phoneNumber}
                                            onChange={(e) => setNewContact({ ...newContact, phoneNumber: e.target.value.replace(/\D/g, '') })}
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider ml-1">Include country code, digits only</p>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-black text-gray-700 ml-1">Email (Optional)</label>
                                    <input
                                        type="email"
                                        placeholder="john@example.com"
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-5 py-3 outline-none transition-all font-medium text-gray-900"
                                        value={newContact.email}
                                        onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            
                            <div className="pt-4 flex flex-col sm:flex-row gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-6 py-4 border-2 border-gray-100 text-gray-500 font-black rounded-2xl hover:bg-gray-50 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] px-6 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
                                >
                                    Save contact
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
