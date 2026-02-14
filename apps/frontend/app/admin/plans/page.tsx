'use client';

import { useState, useEffect } from 'react';
import {
    CreditCard,
    Plus,
    Edit,
    Trash2,
    Check,
    X,
    Loader2,
    List,
    MessageSquare,
    Bot,
    Users,
    Code,
    Webhook
} from 'lucide-react';

interface Plan {
    id: string;
    name: string;
    slug: string;
    price: number;
    setupFee: number;
    isActive: boolean;
    limits: {
        monthly_messages: number;
        ai_credits: number;
        max_agents: number;
        max_phone_numbers?: number;
        max_bots?: number;
        monthly_broadcasts?: number;
    };
    features: string[];
}

const AVAILABLE_FEATURES = [
    { id: 'whatsapp_embedded', label: 'WhatsApp Embedded Signup', icon: MessageSquare },
    { id: 'whatsapp_marketing', label: 'WhatsApp Marketing', icon: MessageSquare },
    { id: 'ai_features', label: 'AI Features', icon: Bot },
    { id: 'templates', label: 'Templates Management', icon: List },
    { id: 'api_access', label: 'API Access', icon: Code },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
];

export default function PlansPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        price: 0,
        setupFee: 0,
        limits: {
            monthly_messages: 1000,
            ai_credits: 100,
            max_agents: 1,
            max_phone_numbers: 1,
            max_bots: 1,
            monthly_broadcasts: 0,
        },
        features: [] as string[],
    });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const res = await fetch(`${API_URL}/api/v1/admin/plans`, {
                credentials: 'include',
            });
            if (res.ok) {
                const data = await res.json();
                setPlans(data);
            }
        } catch (error) {
            console.error('Failed to fetch plans', error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (plan?: Plan) => {
        if (plan) {
            setEditingPlan(plan);
            setFormData({
                name: plan.name,
                price: plan.price,
                setupFee: plan.setupFee || 0,
                limits: {
                    monthly_messages: plan.limits.monthly_messages,
                    ai_credits: plan.limits.ai_credits,
                    max_agents: plan.limits.max_agents,
                    max_phone_numbers: plan.limits.max_phone_numbers || 1,
                    max_bots: plan.limits.max_bots || 1,
                    monthly_broadcasts: plan.limits.monthly_broadcasts ?? 0
                },
                features: plan.features,
            });
        } else {
            setEditingPlan(null);
            setFormData({
                name: '',
                price: 0,
                setupFee: 0,
                limits: {
                    monthly_messages: 1000,
                    ai_credits: 100,
                    max_agents: 1,
                    max_phone_numbers: 1,
                    max_bots: 1,
                    monthly_broadcasts: 0
                },
                features: [],
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const url = editingPlan
                ? `${API_URL}/api/v1/admin/plans/${editingPlan.id}`
                : `${API_URL}/api/v1/admin/plans`;
            const method = editingPlan ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error('Failed to save plan');

            await fetchPlans();
            setIsModalOpen(false);
        } catch (error) {
            alert('Error saving plan');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this plan?')) return;
        try {
            await fetch(`${API_URL}/api/v1/admin/plans/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            fetchPlans();
        } catch (error) {
            alert('Error deleting plan');
        }
    };

    const toggleFeature = (featureId: string) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.includes(featureId)
                ? prev.features.filter(f => f !== featureId)
                : [...prev.features, featureId]
        }));
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Plans & Features</h1>
                    <p className="text-gray-600 mt-1">Manage subscription plans and feature entitlements</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Create Plan
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div key={plan.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                                    <p className="text-sm text-gray-500 font-mono mt-1">{plan.slug}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-blue-600">₹{plan.price}</p>
                                    <p className="text-xs text-gray-500">/month</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Limits */}
                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Limits</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Monthly Messages</span>
                                        <span className="font-medium">{plan.limits.monthly_messages.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">AI Credits</span>
                                        <span className="font-medium">{plan.limits.ai_credits.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Max Agents</span>
                                        <span className="font-medium">{plan.limits.max_agents}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">WhatsApp Numbers</span>
                                        <span className="font-medium">{plan.limits.max_phone_numbers || 1}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Bots</span>
                                        <span className="font-medium">{plan.limits.max_bots || 1}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Broadcasts</span>
                                        <span className="font-medium">{plan.limits.monthly_broadcasts === -1 ? 'Unlimited' : (plan.limits.monthly_broadcasts || 0).toLocaleString()}</span>
                                    </div>
                                    {plan.setupFee > 0 && (
                                        <div className="flex justify-between pt-2 border-t border-dashed">
                                            <span className="text-gray-600">Setup Fee</span>
                                            <span className="font-medium">₹{plan.setupFee.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Features */}
                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Features included</h4>
                                <div className="flex flex-wrap gap-2">
                                    {plan.features.map(f => {
                                        const feat = AVAILABLE_FEATURES.find(af => af.id === f);
                                        return (
                                            <span key={f} className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium border border-green-100">
                                                <Check className="w-3 h-3" />
                                                {feat ? feat.label : f}
                                            </span>
                                        );
                                    })}
                                    {plan.features.length === 0 && <span className="text-sm text-gray-400 italic">No specific features</span>}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                            <button
                                onClick={() => openModal(plan)}
                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(plan.id)}
                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold">{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-8">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g. Pro Plan"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={e => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Setup Fee (₹)</label>
                                    <input
                                        type="number"
                                        value={formData.setupFee}
                                        onChange={e => setFormData(prev => ({ ...prev, setupFee: Number(e.target.value) }))}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Limits */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 mb-3 border-b pb-1">Usage Limits</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Messages / Month</label>
                                        <input
                                            type="number"
                                            value={formData.limits.monthly_messages}
                                            onChange={e => setFormData(prev => ({
                                                ...prev,
                                                limits: { ...prev.limits, monthly_messages: Number(e.target.value) }
                                            }))}
                                            className="w-full px-3 py-2 border rounded-lg outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">AI Credits</label>
                                        <input
                                            type="number"
                                            value={formData.limits.ai_credits}
                                            onChange={e => setFormData(prev => ({
                                                ...prev,
                                                limits: { ...prev.limits, ai_credits: Number(e.target.value) }
                                            }))}
                                            className="w-full px-3 py-2 border rounded-lg outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Max Agents</label>
                                        <input
                                            type="number"
                                            value={formData.limits.max_agents}
                                            onChange={e => setFormData(prev => ({
                                                ...prev,
                                                limits: { ...prev.limits, max_agents: Number(e.target.value) }
                                            }))}
                                            className="w-full px-3 py-2 border rounded-lg outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Phone Numbers</label>
                                        <input
                                            type="number"
                                            value={formData.limits.max_phone_numbers}
                                            onChange={e => setFormData(prev => ({
                                                ...prev,
                                                limits: { ...prev.limits, max_phone_numbers: Number(e.target.value) }
                                            }))}
                                            className="w-full px-3 py-2 border rounded-lg outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Max Bots</label>
                                        <input
                                            type="number"
                                            value={formData.limits.max_bots}
                                            onChange={e => setFormData(prev => ({
                                                ...prev,
                                                limits: { ...prev.limits, max_bots: Number(e.target.value) }
                                            }))}
                                            className="w-full px-3 py-2 border rounded-lg outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Monthly Broadcasts</label>
                                        <input
                                            type="number"
                                            value={formData.limits.monthly_broadcasts}
                                            onChange={e => setFormData(prev => ({
                                                ...prev,
                                                limits: { ...prev.limits, monthly_broadcasts: Number(e.target.value) }
                                            }))}
                                            placeholder="-1 for Unlimited"
                                            className="w-full px-3 py-2 border rounded-lg outline-none"
                                        />
                                        <span className="text-[10px] text-gray-400">-1 for Unlimited</span>
                                    </div>
                                </div>
                            </div>

                            {/* Features */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 mb-3 border-b pb-1">Feature Entitlements</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {AVAILABLE_FEATURES.map(feature => (
                                        <button
                                            key={feature.id}
                                            onClick={() => toggleFeature(feature.id)}
                                            className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${formData.features.includes(feature.id)
                                                ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                : 'border-gray-200 hover:border-blue-300'
                                                }`}
                                        >
                                            <div className={`p-2 rounded-lg ${formData.features.includes(feature.id) ? 'bg-blue-200' : 'bg-gray-100'
                                                }`}>
                                                <feature.icon className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium text-sm">{feature.label}</span>
                                            {formData.features.includes(feature.id) && <Check className="w-4 h-4 ml-auto" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
                            >
                                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                Save Plan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
