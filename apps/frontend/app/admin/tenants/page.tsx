'use client';

import { useState, useEffect } from 'react';
import { Building, Search, Plus, MoreHorizontal, Edit, Trash2, Eye, Filter } from 'lucide-react';
import Link from 'next/link';

interface Tenant {
    id: string;
    name: string;
    plan: string;
    status: string;
    subscriptionStatus: string;
    users: number;
    monthlyMessages: number;
    messagesSent: number;
    createdAt: string;
}

export default function TenantsPage() {
    const [tenants, setTenants] = useState<Tenant[]>([
        {
            id: '1',
            name: 'Acme Corporation',
            plan: 'growth',
            status: 'active',
            subscriptionStatus: 'active',
            users: 15,
            monthlyMessages: 50000,
            messagesSent: 32500,
            createdAt: '2024-01-05',
        },
        {
            id: '2',
            name: 'TechStart Inc',
            plan: 'starter',
            status: 'active',
            subscriptionStatus: 'trial',
            users: 3,
            monthlyMessages: 10000,
            messagesSent: 1200,
            createdAt: '2024-01-12',
        },
        {
            id: '3',
            name: 'Global Retail Ltd',
            plan: 'enterprise',
            status: 'active',
            subscriptionStatus: 'active',
            users: 50,
            monthlyMessages: 999999,
            messagesSent: 450000,
            createdAt: '2023-11-20',
        },
        {
            id: '4',
            name: 'LocalBiz Shop',
            plan: 'starter',
            status: 'active',
            subscriptionStatus: 'active',
            users: 2,
            monthlyMessages: 10000,
            messagesSent: 8500,
            createdAt: '2024-01-08',
        },
        {
            id: '5',
            name: 'FastGrowth Ltd',
            plan: 'growth',
            status: 'suspended',
            subscriptionStatus: 'past_due',
            users: 8,
            monthlyMessages: 50000,
            messagesSent: 42000,
            createdAt: '2023-12-15',
        },
    ]);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterPlan, setFilterPlan] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    const filteredTenants = tenants.filter((t) => {
        if (searchQuery && !t.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (filterPlan !== 'all' && t.plan !== filterPlan) return false;
        if (filterStatus !== 'all' && t.status !== filterStatus) return false;
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

    const getStatusBadge = (status: string) => {
        const styles = {
            active: 'bg-green-100 text-green-700',
            suspended: 'bg-red-100 text-red-700',
            trial: 'bg-amber-100 text-amber-700',
            past_due: 'bg-orange-100 text-orange-700',
        };
        return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Tenants</h1>
                    <p className="text-gray-600 mt-1">Manage all organizations on the platform</p>
                </div>
                <Link
                    href="/admin/tenants/new"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    <Plus className="w-5 h-5" />
                    Add Tenant
                </Link>
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
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
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
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subscription</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Users</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message Usage</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredTenants.map((tenant) => (
                                <tr key={tenant.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-semibold">
                                                {tenant.name.charAt(0)}
                                            </div>
                                            <span className="font-medium text-gray-900">{tenant.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getPlanBadge(tenant.plan)}`}>
                                            {tenant.plan}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(tenant.status)}`}>
                                            {tenant.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(tenant.subscriptionStatus)}`}>
                                            {tenant.subscriptionStatus.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{tenant.users}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-2 bg-gray-200 rounded-full max-w-[100px]">
                                                <div
                                                    className="h-2 bg-blue-500 rounded-full"
                                                    style={{ width: `${Math.min((tenant.messagesSent / tenant.monthlyMessages) * 100, 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-sm text-gray-500">
                                                {Math.round((tenant.messagesSent / tenant.monthlyMessages) * 100)}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {new Date(tenant.createdAt).toLocaleDateString('en-IN')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button className="p-2 hover:bg-gray-100 rounded-lg" title="View">
                                                <Eye className="w-4 h-4 text-gray-500" />
                                            </button>
                                            <button className="p-2 hover:bg-gray-100 rounded-lg" title="Edit">
                                                <Edit className="w-4 h-4 text-gray-500" />
                                            </button>
                                            <button className="p-2 hover:bg-red-50 rounded-lg" title="Delete">
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 border-t border-gray-200 text-sm text-gray-500">
                    Showing {filteredTenants.length} of {tenants.length} tenants
                </div>
            </div>
        </div>
    );
}
