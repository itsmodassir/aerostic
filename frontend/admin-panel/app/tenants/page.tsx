'use client';

import { useState, useEffect } from 'react';
import { Search, Edit, Loader2, X, Check, ExternalLink, Banknote, Shield, UserPlus, PauseCircle, Ban, PlayCircle } from 'lucide-react';
import Link from 'next/link';

interface Tenant {
    id: string;
    name: string;
    email?: string | null;
    slug?: string;
    currentPlan: string;
    status: string;
    createdAt: string;
    owner?: {
        id: string;
        name: string;
        email: string;
    } | null;
    users: number;
    monthlyMessages: number;
    messagesSent: number;
    aiCredits?: number;
    apiAccessEnabled?: boolean;
}

interface TenantUser {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    tenantRole: 'owner' | 'admin' | 'agent' | 'viewer';
    membershipStatus: 'active' | 'paused' | 'suspended' | 'blocked';
    permissions: string[];
    apiAccessEnabled: boolean;
    isActive: boolean;
    emailVerified: boolean;
    lastLoginAt?: string | null;
}

const AVAILABLE_PERMISSIONS = [
    'messages:read',
    'messages:write',
    'contacts:read',
    'contacts:write',
    'campaigns:read',
    'campaigns:write',
    'analytics:read',
    'settings:manage',
];

export default function TenantsPage() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPlan, setFilterPlan] = useState('all');

    // Edit Modal State
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
    const [editPlan, setEditPlan] = useState('');
    const [editAccountStatus, setEditAccountStatus] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [tenantUsers, setTenantUsers] = useState<TenantUser[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [creatingUser, setCreatingUser] = useState(false);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        role: 'agent',
        status: 'active',
        permissions: [] as string[],
        apiAccessEnabled: false,
    });
    // Funding State
    const [fundTenant, setFundTenant] = useState<Tenant | null>(null);
    const [amountToAdd, setAmountToAdd] = useState("");
    const [fundDescription, setFundDescription] = useState("Admin account credited funds");
    const [isFunding, setIsFunding] = useState(false);


    const [availablePlans, setAvailablePlans] = useState<string[]>([]);

    useEffect(() => {
        fetchTenants();
        fetchAvailablePlans();
    }, []);

    const fetchAvailablePlans = async () => {
        try {
            const res = await fetch(`/api/v1/admin/plans`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setAvailablePlans(data.map((p: any) => p.slug));
            }
        } catch (e) {
            console.error('Failed to fetch plans', e);
        }
    };

    const fetchTenants = async () => {
        try {
            const res = await fetch(`/api/v1/admin/tenants`, {
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to fetch tenants');
            const response = await res.json();

            // Backend returns { data: Tenant[], total, page, limit, totalPages }
            const list = Array.isArray(response) ? response : (response.data || []);

            const mapped = list.map((t: any) => ({
                ...t,
                users: t.usersCount || 1,
                monthlyMessages: t.monthlyMessageLimit || 1000,
                messagesSent: t.messagesSentThisMonth || 0,
                currentPlan: t.currentPlan || t.plan || 'starter',
                email: t.email || t.owner?.email || null,
            }));
            setTenants(mapped);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePlan = async () => {
        if (!selectedTenant) return;
        setIsUpdating(true);
        try {
            const planRes = await fetch(`/api/v1/admin/tenants/${selectedTenant.id}/plan`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    plan: editPlan,
                    status: 'active'
                })
            });

            if (!planRes.ok) throw new Error('Plan update failed');

            const statusRes = await fetch(`/api/v1/admin/tenants/${selectedTenant.id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    status: editAccountStatus,
                })
            });

            if (!statusRes.ok) throw new Error('Status update failed');

            // Refresh list
            await fetchTenants();
            setSelectedTenant(null);
        } catch (e) {
            console.error(e);
            alert('Failed to update tenant plan');
        } finally {
            setIsUpdating(false);
        }
    };

    const fetchTenantUsers = async (tenantId: string) => {
        setUsersLoading(true);
        try {
            const res = await fetch(`/api/v1/admin/tenants/${tenantId}/users`, {
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to load tenant users');
            const data = await res.json();
            setTenantUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            setTenantUsers([]);
        } finally {
            setUsersLoading(false);
        }
    };

    const openTenantManager = async (tenant: Tenant) => {
        setSelectedTenant(tenant);
        setEditPlan(tenant.currentPlan || 'starter');
        setEditAccountStatus(tenant.status || 'active');
        setNewUser({
            name: '',
            email: '',
            role: 'agent',
            status: 'active',
            permissions: [],
            apiAccessEnabled: false,
        });
        await fetchTenantUsers(tenant.id);
    };

    const handleImpersonate = async (tenantId: string) => {
        try {
            const res = await fetch(`/api/v1/admin/tenants/${tenantId}/impersonate`, {
                method: 'POST',
                credentials: 'include',
            });

            if (!res.ok) throw new Error('Impersonation failed');

            const data = await res.json();
            if (data.success && data.workspaceId) {
                // Force full reload to ensure auth state is picked up
                localStorage.setItem('x-tenant-id', data.workspaceId);
                window.location.href = '/dashboard';
            }
        } catch (error) {
            console.error('Impersonation error:', error);
            alert('Failed to login as tenant');
        }
    };

    const handleImpersonateUser = async (tenantId: string, userId: string) => {
        try {
            const res = await fetch(`/api/v1/admin/tenants/${tenantId}/users/${userId}/impersonate`, {
                method: 'POST',
                credentials: 'include',
            });

            if (!res.ok) throw new Error('User impersonation failed');

            const data = await res.json();
            if (data.success && data.workspaceId) {
                localStorage.setItem('x-tenant-id', data.workspaceId);
                window.location.href = '/dashboard';
            }
        } catch (error) {
            console.error(error);
            alert('Failed to open this user account');
        }
    };

    const handleUpdateUser = async (user: TenantUser) => {
        if (!selectedTenant) return;
        try {
            const res = await fetch(`/api/v1/admin/tenants/${selectedTenant.id}/users/${user.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    name: user.name,
                    role: user.tenantRole,
                    status: user.membershipStatus,
                    permissions: user.permissions,
                    apiAccessEnabled: user.apiAccessEnabled,
                    isActive: user.isActive,
                })
            });

            if (!res.ok) throw new Error('Failed to update user');
            await fetchTenantUsers(selectedTenant.id);
        } catch (error) {
            console.error(error);
            alert('Failed to update user access');
        }
    };

    const handleCreateUser = async () => {
        if (!selectedTenant || !newUser.name || !newUser.email) return;
        setCreatingUser(true);
        try {
            const res = await fetch(`/api/v1/admin/tenants/${selectedTenant.id}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(newUser),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to create user');

            if (data.generatedPassword) {
                alert(`User created. Temporary password: ${data.generatedPassword}`);
            }

            setNewUser({
                name: '',
                email: '',
                role: 'agent',
                status: 'active',
                permissions: [],
                apiAccessEnabled: false,
            });
            await fetchTenantUsers(selectedTenant.id);
            await fetchTenants();
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Failed to create user');
        } finally {
            setCreatingUser(false);
        }
    };

    const toggleNewUserPermission = (permission: string) => {
        setNewUser((prev) => ({
            ...prev,
            permissions: prev.permissions.includes(permission)
                ? prev.permissions.filter((item) => item !== permission)
                : [...prev.permissions, permission],
        }));
    };

    const toggleUserPermission = (userId: string, permission: string) => {
        setTenantUsers((prev) =>
            prev.map((user) =>
                user.id === userId
                    ? {
                        ...user,
                        permissions: user.permissions.includes(permission)
                            ? user.permissions.filter((item) => item !== permission)
                            : [...user.permissions, permission],
                    }
                    : user,
            ),
        );
    };

    const handleAddFunds = async () => {
        if (!fundTenant || !amountToAdd) return;
        setIsFunding(true);
        try {
            const res = await fetch(`/api/v1/admin/billing/wallets/${fundTenant.id}/fund`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    amount: parseFloat(amountToAdd),
                    description: fundDescription
                })
            });

            if (!res.ok) throw new Error('Fund transfer failed');

            alert(`Successfully added ₹${amountToAdd} to ${fundTenant.name}'s wallet`);
            setFundTenant(null);
            setAmountToAdd('');
        } catch (e) {
            console.error(e);
            alert('Failed to add funds');
        } finally {
            setIsFunding(false);
        }
    };

    const filteredTenants = tenants.filter((t) => {
        if (searchQuery && !t.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (filterPlan !== 'all' && t.currentPlan !== filterPlan) return false;
        return true;
    });

    const getPlanBadge = (plan: string) => {
        const styles: Record<string, string> = {
            free: 'bg-emerald-100 text-emerald-700',
            yearly: 'bg-blue-100 text-blue-700',
            'reseller-yearly': 'bg-purple-100 text-purple-700',
        };
        return styles[plan.toLowerCase()] || 'bg-gray-100 text-gray-700';
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
                        className="px-4 py-2 border border-gray-300 rounded-lg capitalize"
                    >
                        <option value="all">All Plans</option>
                        {availablePlans.map(p => (
                            <option key={p} value={p}>{p.replace(/-/g, ' ')}</option>
                        ))}
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
                                            <button
                                                onClick={() => {
                                                    setFundTenant(tenant);
                                                    setAmountToAdd('');
                                                    setFundDescription('Admin account credited funds');
                                                }}
                                                className="p-2 hover:bg-green-50 text-green-600 rounded-lg"
                                                title="Add Funds"
                                            >
                                                <Banknote className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    openTenantManager(tenant);
                                                }}
                                                className="p-2 hover:bg-gray-100 rounded-lg"
                                                title="Manage Tenant"
                                            >
                                                <Edit className="w-4 h-4 text-gray-500" />
                                            </button>
                                            <button
                                                onClick={() => handleImpersonate(tenant.id)}
                                                className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg"
                                                title="Login as Tenant"
                                            >
                                                <ExternalLink className="w-4 h-4" />
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

            {/* Change Plan Modal */}
            {selectedTenant && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h3 className="font-bold text-gray-900">Manage Tenant Plan</h3>
                                <p className="text-xs text-gray-500 mt-0.5">{selectedTenant.name}</p>
                            </div>
                            <button
                                onClick={() => setSelectedTenant(null)}
                                className="p-2 hover:bg-white rounded-full text-gray-400 hover:text-gray-600 transition-colors shadow-sm border border-transparent hover:border-gray-200"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 block">Subscription Plan</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {availablePlans.map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setEditPlan(p)}
                                            className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${editPlan === p
                                                ? 'border-blue-600 bg-blue-50/50'
                                                : 'border-gray-100 bg-white hover:border-gray-200'
                                                }`}
                                        >
                                            <span className="capitalize font-medium text-gray-700">{p.replace(/-/g, ' ')}</span>
                                            {editPlan === p && <Check className="w-4 h-4 text-blue-600" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 block text-sm">Account Status</label>
                                <select
                                    value={editAccountStatus}
                                    onChange={(e) => setEditAccountStatus(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-700"
                                >
                                    <option value="active">Active</option>
                                    <option value="paused">Paused</option>
                                    <option value="suspended">Suspended</option>
                                    <option value="blocked">Permanent Block</option>
                                </select>
                            </div>

                            <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Workspace Access</h4>
                                        <p className="text-xs text-gray-500">Open the tenant workspace or manage users with direct account actions.</p>
                                    </div>
                                    <button
                                        onClick={() => handleImpersonate(selectedTenant.id)}
                                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Open Workspace
                                    </button>
                                </div>

                                <div className="grid gap-3 rounded-xl bg-white p-4 border border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-gray-900">Tenant Team</p>
                                            <p className="text-xs text-gray-500">Create users, assign roles, control API access, and suspend or block accounts.</p>
                                        </div>
                                        {usersLoading && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
                                    </div>

                                    <div className="grid gap-3 rounded-xl border border-dashed border-gray-300 p-3 md:grid-cols-2">
                                        <input
                                            type="text"
                                            placeholder="Full name"
                                            value={newUser.name}
                                            onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
                                            className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="email"
                                            placeholder="Email address"
                                            value={newUser.email}
                                            onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
                                            className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <select
                                            value={newUser.role}
                                            onChange={(e) => setNewUser((prev) => ({ ...prev, role: e.target.value }))}
                                            className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="owner">Owner</option>
                                            <option value="admin">Admin</option>
                                            <option value="agent">Agent</option>
                                            <option value="viewer">Viewer</option>
                                        </select>
                                        <select
                                            value={newUser.status}
                                            onChange={(e) => setNewUser((prev) => ({ ...prev, status: e.target.value }))}
                                            className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="active">Active</option>
                                            <option value="paused">Paused</option>
                                            <option value="suspended">Suspended</option>
                                            <option value="blocked">Permanent Block</option>
                                        </select>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                            <input
                                                type="checkbox"
                                                checked={newUser.apiAccessEnabled}
                                                onChange={(e) => setNewUser((prev) => ({ ...prev, apiAccessEnabled: e.target.checked }))}
                                            />
                                            API access
                                        </label>
                                        <button
                                            onClick={handleCreateUser}
                                            disabled={creatingUser}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-50"
                                        >
                                            {creatingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                            Add User
                                        </button>
                                        <div className="md:col-span-2 flex flex-wrap gap-2">
                                            {AVAILABLE_PERMISSIONS.map((permission) => (
                                                <button
                                                    key={permission}
                                                    type="button"
                                                    onClick={() => toggleNewUserPermission(permission)}
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold border ${newUser.permissions.includes(permission)
                                                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                            : 'border-gray-200 bg-white text-gray-600'
                                                        }`}
                                                >
                                                    {permission}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {tenantUsers.map((user) => (
                                            <div key={user.id} className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
                                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{user.name}</p>
                                                        <p className="text-sm text-gray-500">{user.email}</p>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        <button
                                                            onClick={() => handleImpersonateUser(selectedTenant.id, user.id)}
                                                            className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"
                                                        >
                                                            <Shield className="w-3 h-3" />
                                                            Open Account
                                                        </button>
                                                        <button
                                                            onClick={() => setTenantUsers((prev) => prev.map((item) => item.id === user.id ? { ...item, membershipStatus: 'paused' } : item))}
                                                            className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700"
                                                        >
                                                            <PauseCircle className="w-3 h-3" />
                                                            Pause
                                                        </button>
                                                        <button
                                                            onClick={() => setTenantUsers((prev) => prev.map((item) => item.id === user.id ? { ...item, membershipStatus: 'suspended' } : item))}
                                                            className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700"
                                                        >
                                                            <Ban className="w-3 h-3" />
                                                            Suspend
                                                        </button>
                                                        <button
                                                            onClick={() => setTenantUsers((prev) => prev.map((item) => item.id === user.id ? { ...item, membershipStatus: 'active', isActive: true } : item))}
                                                            className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"
                                                        >
                                                            <PlayCircle className="w-3 h-3" />
                                                            Unsuspend
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="grid gap-3 md:grid-cols-3">
                                                    <select
                                                        value={user.tenantRole}
                                                        onChange={(e) => setTenantUsers((prev) => prev.map((item) => item.id === user.id ? { ...item, tenantRole: e.target.value as TenantUser['tenantRole'] } : item))}
                                                        className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="owner">Owner</option>
                                                        <option value="admin">Admin</option>
                                                        <option value="agent">Agent</option>
                                                        <option value="viewer">Viewer</option>
                                                    </select>
                                                    <select
                                                        value={user.membershipStatus}
                                                        onChange={(e) => setTenantUsers((prev) => prev.map((item) => item.id === user.id ? { ...item, membershipStatus: e.target.value as TenantUser['membershipStatus'] } : item))}
                                                        className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="active">Active</option>
                                                        <option value="paused">Paused</option>
                                                        <option value="suspended">Suspended</option>
                                                        <option value="blocked">Permanent Block</option>
                                                    </select>
                                                    <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700">
                                                        <input
                                                            type="checkbox"
                                                            checked={user.apiAccessEnabled}
                                                            onChange={(e) => setTenantUsers((prev) => prev.map((item) => item.id === user.id ? { ...item, apiAccessEnabled: e.target.checked } : item))}
                                                        />
                                                        API access
                                                    </label>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {AVAILABLE_PERMISSIONS.map((permission) => (
                                                        <button
                                                            key={`${user.id}-${permission}`}
                                                            type="button"
                                                            onClick={() => toggleUserPermission(user.id, permission)}
                                                            className={`rounded-full px-3 py-1 text-xs font-semibold border ${user.permissions.includes(permission)
                                                                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                                    : 'border-gray-200 bg-white text-gray-600'
                                                                }`}
                                                        >
                                                            {permission}
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="flex items-center justify-between text-xs text-gray-500">
                                                    <span>{user.emailVerified ? 'Email verified' : 'Email pending verification'}</span>
                                                    <button
                                                        onClick={() => handleUpdateUser(user)}
                                                        className="rounded-xl bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-black"
                                                    >
                                                        Save User Access
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        {!usersLoading && tenantUsers.length === 0 && (
                                            <div className="rounded-xl border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500">
                                                No users yet for this tenant.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                            <button
                                onClick={() => setSelectedTenant(null)}
                                className="flex-1 px-4 py-2.5 text-gray-700 font-semibold hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdatePlan}
                                disabled={isUpdating}
                                className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                            >
                                {isUpdating ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Funds Modal */}
            {fundTenant && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h3 className="font-bold text-gray-900">Add Wallet Funds</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Crediting {fundTenant.name}</p>
                            </div>
                            <button
                                onClick={() => setFundTenant(null)}
                                className="p-2 hover:bg-white rounded-full text-gray-400 hover:text-gray-600 transition-colors shadow-sm border border-transparent hover:border-gray-200"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 block text-sm">Amount (INR)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium font-mono">₹</span>
                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={amountToAdd}
                                        onChange={(e) => setAmountToAdd(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-medium text-gray-700"
                                        placeholder="Enter amount"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 block text-sm">Description (Optional)</label>
                                <input
                                    type="text"
                                    value={fundDescription}
                                    onChange={(e) => setFundDescription(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-medium text-gray-700"
                                    placeholder="e.g. Admin account credited funds"
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                            <button
                                onClick={() => setFundTenant(null)}
                                className="flex-1 px-4 py-2.5 text-gray-700 font-semibold hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddFunds}
                                disabled={isFunding || !amountToAdd || parseFloat(amountToAdd) <= 0}
                                className="flex-1 px-4 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2"
                            >
                                {isFunding ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    'Credit Funds'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
