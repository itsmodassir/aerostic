'use client';

import { useState, useEffect } from 'react';
import {
    Users, Crown, Shield, Search, ChevronDown,
    ArrowUpCircle, ArrowDownCircle, CheckCircle, XCircle, Clock,
    MessageSquare, Bot, AlertCircle, Eye, Loader2,
    Building2, TrendingUp, RefreshCw, Settings, Save, Lock,
    CreditCard, Globe, Database, Server
} from 'lucide-react';

interface User {
    id: string;
    name: string;
    email: string;
    tenantName: string;
    currentPlan: 'starter' | 'growth' | 'enterprise';
    status: 'active' | 'pending' | 'suspended';
    messagesUsed: number;
    agentsCreated: number;
    createdAt: string;
    lastActive: string;
    pendingRequest?: {
        type: 'upgrade' | 'downgrade' | 'config';
        requestedPlan?: string;
        requestedAt: string;
        notes?: string;
    };
}

const PLANS = {
    starter: { name: 'Starter', price: 1999, color: 'gray', messages: 10000, agents: 1 },
    growth: { name: 'Growth', price: 4999, color: 'blue', messages: 50000, agents: 5 },
    enterprise: { name: 'Enterprise', price: 14999, color: 'purple', messages: -1, agents: -1 },
};

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<'tenants' | 'configuration'>('tenants');
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    const checkAdmin = () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setIsAdmin(payload.role === 'super_admin' || payload.email === 'md@modassir.info');
            } catch (e) { }
        }
        setLoading(false);
    };

    useEffect(() => {
        checkAdmin();
    }, []);

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600" /></div>;

    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-700 mb-2">Admin Access Required</h2>
                    <p className="text-gray-500">You don't have permission to access this page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Shield className="w-8 h-8 text-purple-600" />
                        Admin Console
                    </h1>
                    <p className="text-gray-600 mt-1">Platform management and system configuration</p>
                </div>

                {/* Database Connected Badge */}
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg w-fit h-fit">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm text-green-700 font-medium">System Online</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('tenants')}
                    className={`px-6 py-3 font-medium text-sm flex items-center gap-2 transition-colors border-b-2 ${activeTab === 'tenants'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Users className="w-4 h-4" />
                    Tenants & Users
                </button>
                <button
                    onClick={() => setActiveTab('configuration')}
                    className={`px-6 py-3 font-medium text-sm flex items-center gap-2 transition-colors border-b-2 ${activeTab === 'configuration'
                        ? 'border-purple-600 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Settings className="w-4 h-4" />
                    System Configuration
                </button>
            </div>

            {activeTab === 'tenants' ? <TenantsTab /> : <ConfigurationTab />}
        </div>
    );
}

function TenantsTab() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // ... Copying logic from previous file ...
    // Since I'm rewriting the whole file, I will re-implement the necessary logic here

    // (Consolidated state for modals)
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [newPlan, setNewPlan] = useState<'starter' | 'growth' | 'enterprise'>('starter');
    const [saving, setSaving] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Failed');
            const data = await res.json();

            // Map data
            const mappedUsers: User[] = data.map((u: any) => ({
                id: u.id,
                name: u.name || u.tenantName || 'Unknown',
                email: u.email || '',
                tenantName: u.tenantName || u.name || 'Unknown',
                currentPlan: u.currentPlan || 'starter',
                status: u.status || 'active',
                messagesUsed: u.messagesUsed || 0,
                agentsCreated: u.agentsCreated || 0,
                createdAt: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '',
                lastActive: u.lastActive || u.createdAt || '',
            }));

            setUsers(mappedUsers);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const confirmPlanChange = async () => {
        if (!selectedUser) return;
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/admin/users/${selectedUser.id}/plan`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ plan: newPlan }),
            });
            if (res.ok) {
                setUsers(users.map(u =>
                    u.id === selectedUser.id
                        ? { ...u, currentPlan: newPlan, pendingRequest: undefined }
                        : u
                ));
                setShowPlanModal(false);
                setSuccessMessage('Plan updated successfully');
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (e) { console.error(e); }
        finally { setSaving(false); }
    };

    // Filter Logic
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="p-12 text-center text-gray-500">Loading tenants...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {successMessage && (
                <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-green-100 border border-green-200 text-green-700 rounded-xl flex items-center gap-2 shadow-lg">
                    <CheckCircle className="w-5 h-5" />
                    {successMessage}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5 border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-100 rounded-xl">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Tenants</p>
                            <p className="text-2xl font-bold">{users.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-purple-100 rounded-xl">
                            <Crown className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Enterprise</p>
                            <p className="text-2xl font-bold">{users.filter(u => u.currentPlan === 'enterprise').length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-green-100 rounded-xl">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Active Now</p>
                            <p className="text-2xl font-bold">{users.filter(u => u.status === 'active').length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-100 rounded-xl">
                            <Building2 className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Revenue</p>
                            <p className="text-2xl font-bold">₹48.5L</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table and Filter */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tenants..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Tenant</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Plan</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Usage</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">
                                            {user.name[0]}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{user.tenantName}</p>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium 
                                        ${user.currentPlan === 'enterprise' ? 'bg-purple-100 text-purple-700' :
                                            user.currentPlan === 'growth' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {user.currentPlan.charAt(0).toUpperCase() + user.currentPlan.slice(1)}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Active</span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {user.messagesUsed.toLocaleString()} msgs
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => {
                                            setSelectedUser(user);
                                            setNewPlan(user.currentPlan);
                                            setShowPlanModal(true);
                                        }}
                                        className="text-blue-600 hover:underline text-sm font-medium"
                                    >
                                        Edit Plan
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Plan Modal */}
            {showPlanModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6">
                        <h2 className="text-xl font-bold mb-4">Change Plan for {selectedUser.name}</h2>
                        <div className="space-y-3 mb-6">
                            {Object.entries(PLANS).map(([key, plan]) => (
                                <button
                                    key={key}
                                    onClick={() => setNewPlan(key as any)}
                                    className={`w-full p-4 rounded-xl border-2 text-left flex justify-between items-center ${newPlan === key ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}
                                >
                                    <div>
                                        <p className="font-bold">{plan.name}</p>
                                        <p className="text-sm text-gray-500">{plan.messages === -1 ? 'Unlimited' : plan.messages} msgs</p>
                                    </div>
                                    <p className="font-bold">₹{plan.price}</p>
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowPlanModal(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                            <button
                                onClick={confirmPlanChange}
                                disabled={saving}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Confirm Change'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ConfigurationTab() {
    const [config, setConfig] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    useEffect(() => { fetchConfig(); }, []);

    const fetchConfig = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/admin/config`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                // Flatten structure: { "key": { "value": "..." } } -> { "key": "..." }
                const flattened: Record<string, string> = {};
                Object.entries(data).forEach(([key, obj]: [string, any]) => {
                    flattened[key] = obj.value;
                });
                setConfig(flattened);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const updateConfig = (key: string, value: string) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const saveConfig = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/admin/config`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(config)
            });
            if (res.ok) {
                setSuccessMsg('System configuration updated successfully');
                setTimeout(() => setSuccessMsg(''), 3000);
            }
        } catch (e) { console.error(e); }
        finally { setSaving(false); }
    };

    if (loading) return <div className="p-12 text-center text-gray-500">Loading configuration...</div>;

    return (
        <div className="space-y-6 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {successMsg && (
                <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-green-100 border border-green-200 text-green-700 rounded-xl flex items-center gap-2 shadow-lg">
                    <CheckCircle className="w-5 h-5" />
                    {successMsg}
                </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm">
                    <strong>Security Warning:</strong> These settings control the core platform infrastructure.
                    Changes here affect all tenants immediately. Secrets are stored securely in the database.
                </p>
            </div>

            {/* Meta Configuration */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Meta WhatsApp Configuration</h3>
                        <p className="text-sm text-gray-500">Required for Embedded Signup & Messaging</p>
                    </div>
                </div>

                <div className="grid gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Meta App ID</label>
                        <input
                            type="text"
                            value={config['meta.app_id'] || ''}
                            onChange={(e) => updateConfig('meta.app_id', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            placeholder="1234567890"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Meta App Secret</label>
                        <div className="relative">
                            <input
                                type="password"
                                value={config['meta.app_secret'] || ''}
                                onChange={(e) => updateConfig('meta.app_secret', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                placeholder="••••••••••••••••"
                            />
                            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Webhook Verify Token</label>
                        <input
                            type="text"
                            value={config['meta.webhook_verify_token'] || ''}
                            onChange={(e) => updateConfig('meta.webhook_verify_token', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            placeholder="secure_random_token"
                        />
                    </div>
                </div>
            </div>

            {/* Razorpay Configuration */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Razorpay Configuration</h3>
                        <p className="text-sm text-gray-500">Payment gateway credentials for subscriptions</p>
                    </div>
                </div>

                <div className="grid gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Key ID</label>
                        <input
                            type="text"
                            value={config['razorpay.key_id'] || ''}
                            onChange={(e) => updateConfig('razorpay.key_id', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="rzp_live_..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Key Secret</label>
                        <div className="relative">
                            <input
                                type="password"
                                value={config['razorpay.key_secret'] || ''}
                                onChange={(e) => updateConfig('razorpay.key_secret', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="••••••••••••••••"
                            />
                            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Webhook Secret</label>
                        <div className="relative">
                            <input
                                type="password"
                                value={config['razorpay.webhook_secret'] || ''}
                                onChange={(e) => updateConfig('razorpay.webhook_secret', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="••••••••••••••••"
                            />
                            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Platform Settings */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Server className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Platform Settings</h3>
                        <p className="text-sm text-gray-500">Global application constraints (Rate limits, etc.)</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Max Tenants</label>
                        <input
                            type="number"
                            value={config['platform.max_tenants'] || ''}
                            onChange={(e) => updateConfig('platform.max_tenants', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Global Rate Limit (RPM)</label>
                        <input
                            type="number"
                            value={config['platform.message_rate_limit'] || ''}
                            onChange={(e) => updateConfig('platform.message_rate_limit', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4 pb-12">
                <button
                    onClick={saveConfig}
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {saving ? 'Saving Changes...' : 'Save Configuration'}
                </button>
            </div>
        </div>
    );
}
