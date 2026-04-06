import React, { useState, useEffect } from 'react';
import { 
  MoreVertical, UserPlus, Upload, Download, 
  Search, Star, Trash2, Edit3, 
  Users, CheckCircle2, XCircle, Filter,
  ChevronLeft, ChevronRight, Loader2,
  Check
} from 'lucide-react';
import { clsx } from 'clsx';
import api from '@/lib/api';

interface Contact {
    id: string;
    name: string;
    phoneNumber: string;
    email?: string;
    status: string;
    isVIP: boolean;
    groups: string[];
    createdAt: string;
}

interface ContactTableProps {
    onEdit: (contact: Contact) => void;
    onAdd: () => void;
    onImport: () => void;
    onExport: () => void;
}

export default function ContactTable({ onEdit, onAdd, onImport, onExport }: ContactTableProps) {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        fetchContacts();
    }, [filter]);

    const fetchContacts = async () => {
        setLoading(true);
        try {
            let url = '/contacts';
            if (filter === 'vip') url = '/contacts/segment?isVIP=true';
            
            const res = await api.get(url);
            setContacts(res.data);
        } catch (err) {
            console.error('Failed to fetch contacts', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleVip = async (contact: Contact) => {
        try {
            await api.patch(`/contacts/${contact.id}/vip`);
            setContacts(prev => prev.map(c => 
                c.id === contact.id ? { ...c, isVIP: !c.isVIP } : c
            ));
        } catch (err) {
            console.error('Failed to toggle VIP', err);
        }
    };

    const deleteContact = async (id: string) => {
        if (!confirm('Are you sure you want to delete this contact?')) return;
        setDeletingId(id);
        try {
            await api.delete(`/contacts/${id}`);
            setContacts(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            console.error('Delete failed', err);
        } finally {
            setDeletingId(null);
        }
    };

    const filteredContacts = contacts.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phoneNumber.includes(search)
    );

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredContacts.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredContacts.map(c => c.id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl shadow-gray-200/50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Table Header / Actions */}
            <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-50/30">
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                        <input 
                            type="text"
                            placeholder="Find by name or phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl w-full md:w-80 shadow-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-sm font-medium"
                        />
                    </div>
                    <div className="flex items-center bg-white border border-gray-100 rounded-2xl p-1.5 shadow-sm">
                        <button 
                            onClick={() => setFilter('all')}
                            className={clsx(
                                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                filter === 'all' ? "bg-black text-white shadow-lg" : "text-gray-400 hover:text-black"
                            )}
                        >
                            All
                        </button>
                        <button 
                            onClick={() => setFilter('vip')}
                            className={clsx(
                                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                filter === 'vip' ? "bg-emerald-600 text-white shadow-lg" : "text-gray-400 hover:text-emerald-600"
                            )}
                        >
                            VIPs
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={onExport}
                        className="p-4 bg-white border border-gray-100 text-gray-600 rounded-2xl hover:bg-gray-50 transition-all active:scale-95 shadow-sm group"
                        title="Export CSV"
                    >
                        <Download size={20} className="group-hover:text-black" />
                    </button>
                    <button 
                        onClick={onImport}
                        className="p-4 bg-white border border-gray-100 text-gray-600 rounded-2xl hover:bg-gray-50 transition-all active:scale-95 shadow-sm group mr-2"
                        title="Import CSV"
                    >
                        <Upload size={20} className="group-hover:text-black" />
                    </button>
                    <button 
                        onClick={onAdd}
                        className="px-8 py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all active:scale-95 shadow-xl shadow-gray-200 flex items-center gap-3"
                    >
                        <UserPlus size={16} /> Add Contact
                    </button>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedIds.length > 0 && (
                <div className="mx-8 mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center text-xs font-black">
                            {selectedIds.length}
                        </div>
                        <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Contacts Selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="px-4 py-2 bg-white text-emerald-700 border border-emerald-200 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors">
                            Assign Group
                        </button>
                        <button 
                            className="px-4 py-2 bg-red-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-700 transition-colors shadow-lg shadow-red-100"
                        >
                            Delete Bulk
                        </button>
                    </div>
                </div>
            )}

            {/* Table Area */}
            <div className="flex-1 overflow-x-auto min-h-[400px]">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-50">
                            <th className="px-8 py-6 w-12">
                                <button 
                                    onClick={toggleSelectAll}
                                    className={clsx(
                                        "w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center",
                                        selectedIds.length === filteredContacts.length ? "bg-emerald-600 border-emerald-600" : "border-gray-200 hover:border-gray-300"
                                    )}
                                >
                                    {selectedIds.length === filteredContacts.length && <Check size={14} className="text-white" strokeWidth={4} />}
                                </button>
                            </th>
                            <th className="px-4 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Info</th>
                            <th className="px-4 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Groups / Tags</th>
                            <th className="px-4 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                            <th className="px-4 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Added</th>
                            <th className="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="py-32">
                                    <div className="flex flex-col items-center gap-4">
                                        <Loader2 className="animate-spin text-emerald-500" size={32} />
                                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Synchronizing records...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredContacts.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-32">
                                    <div className="flex flex-col items-center gap-6 text-gray-300">
                                        <Users size={64} strokeWidth={1} />
                                        <div className="text-center">
                                            <p className="text-lg font-black text-gray-900 mb-1">No contacts found</p>
                                            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Try adjusting your filters or import a CSV</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredContacts.map(contact => (
                            <tr key={contact.id} className="group hover:bg-gray-50/50 transition-colors">
                                <td className="px-8 py-6">
                                    <button 
                                        onClick={() => toggleSelect(contact.id)}
                                        className={clsx(
                                            "w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center",
                                            selectedIds.includes(contact.id) ? "bg-emerald-600 border-emerald-600" : "border-gray-100 group-hover:border-gray-200"
                                        )}
                                    >
                                        {selectedIds.includes(contact.id) && <Check size={14} className="text-white" strokeWidth={4} />}
                                    </button>
                                </td>
                                <td className="px-4 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-sm font-black text-gray-500 border border-gray-100 shadow-sm overflow-hidden group-hover:scale-105 transition-transform uppercase">
                                            {contact.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-black text-gray-900 tracking-tight">{contact.name}</p>
                                                <button 
                                                    onClick={() => toggleVip(contact)}
                                                    className={clsx(
                                                        "transition-all active:scale-125",
                                                        contact.isVIP ? "text-amber-400 fill-amber-400" : "text-gray-200 hover:text-amber-300"
                                                    )}
                                                >
                                                    <Star size={14} />
                                                </button>
                                            </div>
                                            <p className="text-[11px] font-bold text-gray-400 mt-0.5">{contact.phoneNumber}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-6">
                                    <div className="flex flex-wrap gap-1.5">
                                        {contact.groups?.length > 0 ? contact.groups.map(g => (
                                            <span key={g} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-gray-200">
                                                {g}
                                            </span>
                                        )) : (
                                            <span className="text-[9px] font-black text-gray-200 uppercase tracking-widest italic">Uncategorized</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-6">
                                    <div className={clsx(
                                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm",
                                        contact.status === 'WON' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                        contact.status === 'LOST' ? 'bg-red-50 text-red-700 border-red-100' :
                                        'bg-gray-50 text-gray-500 border-gray-100'
                                    )}>
                                        <div className={clsx("w-1.5 h-1.5 rounded-full", 
                                            contact.status === 'WON' ? 'bg-emerald-500' :
                                            contact.status === 'LOST' ? 'bg-red-500' : 'bg-gray-400'
                                        )} />
                                        {contact.status}
                                    </div>
                                </td>
                                <td className="px-4 py-6">
                                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-tighter">
                                        {new Date(contact.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => onEdit(contact)}
                                            className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-black hover:border-gray-300 rounded-xl transition-all shadow-sm active:scale-90"
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => deleteContact(contact.id)}
                                            disabled={deletingId === contact.id}
                                            className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-red-600 hover:border-red-100 rounded-xl transition-all shadow-sm active:scale-90 disabled:opacity-50"
                                        >
                                            {deletingId === contact.id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination / Footer */}
            <div className="p-8 border-t border-gray-50 bg-gray-50/10 flex items-center justify-between">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Showing <span className="text-gray-900">{filteredContacts.length}</span> of <span className="text-gray-900">{contacts.length}</span> contacts
                </p>
                <div className="flex items-center gap-4">
                    <button className="px-4 py-2 bg-white border border-gray-200 text-gray-400 hover:text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-30 flex items-center gap-2" disabled>
                        <ChevronLeft size={14} /> Prev
                    </button>
                    <div className="px-4 py-2 bg-black text-white rounded-xl text-[10px] font-black tracking-widest shadow-lg">1</div>
                    <button className="px-4 py-2 bg-white border border-gray-200 text-gray-400 hover:text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-30 flex items-center gap-2" disabled>
                        Next <ChevronRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}
