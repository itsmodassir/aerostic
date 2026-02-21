'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Plus, Search, Filter, MoreHorizontal, ChevronRight, User, Phone, Mail } from 'lucide-react';
import { useParams } from 'next/navigation';

enum ContactStatus {
    NEW = 'NEW',
    CONTACTED = 'CONTACTED',
    QUALIFIED = 'QUALIFIED',
    PROPOSAL = 'PROPOSAL',
    WON = 'WON',
    LOST = 'LOST',
}

interface Contact {
    id: string;
    name: string;
    phoneNumber: string;
    email?: string;
    status: ContactStatus;
    score: number;
    createdAt: string;
}

const COLUMNS = [
    { id: ContactStatus.NEW, title: 'New Leads', color: 'bg-blue-500' },
    { id: ContactStatus.CONTACTED, title: 'Contacted', color: 'bg-yellow-500' },
    { id: ContactStatus.QUALIFIED, title: 'Qualified', color: 'bg-purple-500' },
    { id: ContactStatus.PROPOSAL, title: 'Proposal', color: 'bg-indigo-500' },
    { id: ContactStatus.WON, title: 'Won', color: 'bg-green-500' },
    { id: ContactStatus.LOST, title: 'Lost', color: 'bg-red-500' },
];

export default function LeadsPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [tenantId, setTenantId] = useState<string>('');
    const params = useParams();

    useEffect(() => {
        const init = async () => {
            const workspaceSlug = params.workspaceId as string;
            if (!workspaceSlug) return;

            try {
                const res = await api.get('/auth/workspaces');
                const activeMembership = res.data.find((m: any) => m.tenant?.slug === workspaceSlug);

                if (activeMembership?.tenant?.id) {
                    setTenantId(activeMembership.tenant.id);
                    fetchLeads(activeMembership.tenant.id);
                }
            } catch (e) {
                console.error('Failed to init leads page', e);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [params.workspaceId]);

    const fetchLeads = async (tid: string) => {
        try {
            const res = await api.get(`/contacts?tenantId=${tid}`);
            setContacts(res.data);
        } catch (error) {
            console.error('Failed to fetch leads', error);
        }
    };

    const updateLeadStatus = async (id: string, newStatus: ContactStatus) => {
        try {
            await api.patch(`/contacts/${id}`, { status: newStatus });
            fetchLeads(tenantId);
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const getLeadsByStatus = (status: ContactStatus) => {
        return contacts.filter((c) => c.status === status);
    };

    return (
        <div className="h-full flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Leads Pipeline</h1>
                    <p className="text-sm text-gray-500">Manage your sales funnel and track conversions.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 bg-white">
                        <Filter size={18} />
                        Filter
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Plus size={18} />
                        Add Lead
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto pb-4">
                <div className="flex gap-4 min-w-max h-full">
                    {COLUMNS.map((column) => (
                        <div key={column.id} className="w-80 flex flex-col bg-gray-50 rounded-xl border border-gray-200">
                            <div className="p-4 border-b flex items-center justify-between bg-white rounded-t-xl">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${column.color}`} />
                                    <h2 className="font-semibold text-gray-700">{column.title}</h2>
                                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">
                                        {getLeadsByStatus(column.id).length}
                                    </span>
                                </div>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>

                            <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-250px)]">
                                {getLeadsByStatus(column.id).map((lead) => (
                                    <div
                                        key={lead.id}
                                        className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:border-blue-300 transition-colors group cursor-pointer"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {lead.name}
                                            </h3>
                                            <div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                                S: {lead.score}
                                            </div>
                                        </div>

                                        <div className="space-y-1.5 text-xs text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <Phone size={12} />
                                                {lead.phoneNumber}
                                            </div>
                                            {lead.email && (
                                                <div className="flex items-center gap-2">
                                                    <Mail size={12} />
                                                    {lead.email}
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4 pt-3 border-t flex justify-between items-center text-[10px] text-gray-400">
                                            <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                                            <div className="flex gap-1">
                                                {COLUMNS.filter(c => c.id !== column.id).slice(0, 2).map(next => (
                                                    <button
                                                        key={next.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            updateLeadStatus(lead.id, next.id);
                                                        }}
                                                        className="px-2 py-1 bg-gray-50 hover:bg-gray-100 border rounded transition-colors"
                                                    >
                                                        Move to {next.title.split(' ')[0]}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
