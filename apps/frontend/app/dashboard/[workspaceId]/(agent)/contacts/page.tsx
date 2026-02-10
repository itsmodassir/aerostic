'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Plus, Upload, Search } from 'lucide-react';
import { useParams } from 'next/navigation';

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

    const params = useParams();

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
                }
            } catch (e) {
                console.error('Failed to resolve tenant');
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
            await api.post('/contacts', { ...newContact, tenantId });
            setShowAddModal(false);
            setNewContact({ name: '', phoneNumber: '', email: '' });
            fetchContacts(tenantId); // Refresh list
        } catch (error) {
            alert('Failed to add contact. Ensure phone number is unique.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 text-gray-600">
                        <Upload size={18} />
                        Import CSV
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Plus size={18} />
                        Add Contact
                    </button>
                </div>
            </div>

            {/* Search Bar (Stub) */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search contacts..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Contacts Table */}
            <div className="bg-white rounded-lg shadow border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 text-sm font-medium text-gray-500">Name</th>
                            <th className="px-6 py-3 text-sm font-medium text-gray-500">Phone Number</th>
                            <th className="px-6 py-3 text-sm font-medium text-gray-500">Email</th>
                            <th className="px-6 py-3 text-sm font-medium text-gray-500">Added</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {loading ? (
                            <tr><td colSpan={4} className="p-6 text-center text-gray-500">Loading...</td></tr>
                        ) : contacts.length === 0 ? (
                            <tr><td colSpan={4} className="p-6 text-center text-gray-500">No contacts found. Add one to get started.</td></tr>
                        ) : (
                            contacts.map((contact) => (
                                <tr key={contact.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{contact.name}</td>
                                    <td className="px-6 py-4 text-gray-600">{contact.phoneNumber}</td>
                                    <td className="px-6 py-4 text-gray-600">{contact.email || '-'}</td>
                                    <td className="px-6 py-4 text-gray-400 text-sm">{new Date(contact.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Contact Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Add New Contact</h2>
                        <form onSubmit={handleAddContact} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input
                                    required
                                    className="w-full border rounded-md px-3 py-2 mt-1"
                                    value={newContact.name}
                                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                <input
                                    required
                                    placeholder="e.g. 15551234567"
                                    className="w-full border rounded-md px-3 py-2 mt-1"
                                    value={newContact.phoneNumber}
                                    onChange={(e) => setNewContact({ ...newContact, phoneNumber: e.target.value })}
                                />
                                <p className="text-xs text-gray-500 mt-1">Include country code without +</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email (Optional)</label>
                                <input
                                    type="email"
                                    className="w-full border rounded-md px-3 py-2 mt-1"
                                    value={newContact.email}
                                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Save Contact
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
