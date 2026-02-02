'use client';

import { useState, useEffect } from 'react';
import { Building, Search, Plus, MoreHorizontal, Edit, Trash2, Eye, Filter, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Tenant {
    id: string;
    name: string;
    email: string;
    tenantName: string;
    currentPlan: string;
    status: string;
    createdAt: string;
    // Extra fields to match UI if needed, or derived
    users: number;
    monthlyMessages: number;
    messagesSent: number;
}

export default function TenantsPage() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPlan, setFilterPlan] = useState('all');

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    useEffect(() => {
        fetchTenants();
    }, []);

    const fetchTenants = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/admin/users`, { // Using /users as it returns tenant info
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch tenants');
            const data = await res.json();

            // Use real data from backend
            const mapped = data.map((t: any) => ({
                ...t,
                // Fallbacks if data is missing, but prefer real values
                users: t.usersCount || 1,
                monthlyMessages: t.monthlyMessageLimit || 1000,
                messagesSent: t.messagesSentThisMonth || 0,
                plan: t.currentPlan || t.plan || 'starter'
            }));
            setTenants(mapped);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const filteredTenants = tenants.filter((t) => {
        if (searchQuery && !t.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (filterPlan !== 'all' && t.currentPlan !== filterPlan) return false;
        return true;
    });

    const getPlanBadge = (plan: string) => {
        const styles = {
            starter: 'bg-gray-100 text-gray-700',
            growth: 'bg-blue-100 text-blue-700',
            enterprise: 'bg-purple-100 text-purple-700',
        };
        return styles[plan as keyof typeof styles] || 'bg-gray-100 text-gray-700';
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Tenants</h1>
                    <p className="text-gray-600 mt-1">Manage all organizations on the platform</p>
                </div>
                {/* 
                <Link
                    href="/admin/tenants/new"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    <Plus className="w-5 h-5" />
                    Add Tenant
                </Link> 
                */}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search tenants..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <select
                        value={filterPlan}
                        onChange={(e) => setFilterPlan(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                    >
                        <option value="all">All Plans</option>
                        <option value="starter">Starter</option>
                        <option value="growth">Growth</option>
                        <option value="enterprise">Enterprise</option>
                    </select>
                </div>
            </div>

            {/* Tenants Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Users</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message Usage</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredTenants.length > 0 ? filteredTenants.map((tenant) => (
                                <tr key={tenant.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">
                                                {tenant.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{tenant.name}</p>
                                                <p className="text-xs text-gray-500">{tenant.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getPlanBadge(tenant.currentPlan)}`}>
                                            {tenant.currentPlan}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 capitalize">
                                            {tenant.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{tenant.users}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-2 bg-gray-200 rounded-full w-24">
                                                <div
                                                    className="h-2 bg-blue-500 rounded-full"
                                                    style={{ width: `${Math.min((tenant.messagesSent / tenant.monthlyMessages) * 100, 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {Math.round((tenant.messagesSent / tenant.monthlyMessages) * 100)}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 text-sm">
                                        {new Date(tenant.createdAt).toLocaleDateString('en-IN')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button className="p-2 hover:bg-gray-100 rounded-lg" title="Edit">
                                                <Edit className="w-4 h-4 text-gray-500" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        No tenants found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
