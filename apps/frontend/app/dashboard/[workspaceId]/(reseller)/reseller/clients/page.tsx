'use client';

import { useState, useEffect } from 'react';
import {
    Users2, Plus, Search, CreditCard,
    ExternalLink, MoreVertical, CheckCircle2,
    Building2, Mail, Key
} from 'lucide-react';
import { clsx } from 'clsx';
import { useParams } from 'next/navigation';

export default function ResellerClientsPage() {
    const { workspaceId } = useParams();
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showOnboardModal, setShowOnboardModal] = useState(false);
    const [resellerStats, setResellerStats] = useState({ credits: 0, clientCount: 0 });

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const res = await fetch(`/api/v1/admin/tenants?resellerId=${workspaceId}`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setClients(data);
            }

            // Fetch own credits
            const ownRes = await fetch(`/api/v1/auth/membership`, { credentials: 'include' });
            if (ownRes.ok) {
                const data = await ownRes.json();
                setResellerStats({
                    credits: data.tenant?.resellerCredits || 0,
                    clientCount: data.tenant?.subTenants?.length || 0
                });
            }
        } catch (error) {
            console.error('Failed to fetch clients:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Clients</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage your clients, their access, and credit distribution.
                    </p>
                </div>
                <button
                    onClick={() => setShowOnboardModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Onboard Client
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Available Credits</p>
                        <p className="text-2xl font-bold text-gray-900">{resellerStats.credits}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                        <Users2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
                        <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
                    </div>
                </div>
            </div>

            {/* Clients List */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="p-4 border-b flex items-center justify-between bg-gray-50/50">
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search clients..."
                            className="w-full pl-9 pr-4 py-2 bg-white border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">
                                <th className="px-6 py-4">Client Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Credits</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                                        Loading clients...
                                    </td>
                                </tr>
                            ) : clients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        No clients discovered. Click "Onboard Client" to add your first customer.
                                    </td>
                                </tr>
                            ) : (
                                clients.map((client) => (
                                    <tr key={client.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 font-bold">
                                                    {client.name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{client.name}</p>
                                                    <p className="text-xs text-muted-foreground">{client.slug}.aerostic.com</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{client.ownerEmail || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{client.resellerCredits || 0}</span>
                                                <button className="p-1 hover:bg-primary/10 text-primary rounded" title="Add Credits">
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={clsx(
                                                "px-2.5 py-1 rounded-full text-xs font-medium border",
                                                client.status === 'active'
                                                    ? "bg-green-50 text-green-700 border-green-100"
                                                    : "bg-amber-50 text-amber-700 border-amber-100"
                                            )}>
                                                {client.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button className="p-2 hover:bg-white border rounded-lg transition-colors text-muted-foreground hover:text-primary">
                                                    <ExternalLink className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 hover:bg-white border rounded-lg transition-colors text-muted-foreground hover:text-gray-900">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Onboard Modal Placeholder */}
            {showOnboardModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b bg-gray-50/50">
                            <h3 className="text-xl font-bold text-gray-900">Onboard New Client</h3>
                            <p className="text-sm text-muted-foreground mt-1">Create a new workspace for your customer.</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input type="text" className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. Acme Inc." />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Owner Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input type="email" className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary/20" placeholder="admin@acme.com" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Initial Password</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input type="text" className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary/20" defaultValue="AcmeStart2026!" />
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t bg-gray-50/50 flex gap-3">
                            <button
                                onClick={() => setShowOnboardModal(false)}
                                className="flex-1 px-4 py-2 border rounded-lg hover:bg-white transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium">
                                Create Client
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
