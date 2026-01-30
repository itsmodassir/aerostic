'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Bot, Plus, Settings, Trash2, Play, Pause, MessageSquare, TrendingUp,
    Users, Lock, Crown, Sparkles, AlertCircle, CheckCircle, X,
    Brain, Headphones, ShoppingCart, UserPlus, HelpCircle
} from 'lucide-react';

interface Agent {
    id: string;
    name: string;
    description: string;
    type: string;
    systemPrompt?: string;
    isActive: boolean;
    totalConversations: number;
    successfulResolutions: number;
    handoffsTriggered: number;
}

// Plan limits for agents
const PLAN_LIMITS = {
    starter: { maxAgents: 1, name: 'Starter' },
    growth: { maxAgents: 5, name: 'Growth' },
    enterprise: { maxAgents: -1, name: 'Enterprise' }, // -1 = unlimited
};

const AGENT_TYPES = [
    { id: 'customer_support', name: 'Customer Support', icon: Headphones, color: 'blue', description: 'Handle customer inquiries and issues' },
    { id: 'sales', name: 'Sales Assistant', icon: ShoppingCart, color: 'green', description: 'Qualify leads and assist with purchases' },
    { id: 'lead_followup', name: 'Lead Follow-up', icon: UserPlus, color: 'purple', description: 'Nurture and follow up with leads' },
    { id: 'faq', name: 'FAQ Bot', icon: HelpCircle, color: 'amber', description: 'Answer frequently asked questions' },
];

export default function AgentsPage() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [userPlan, setUserPlan] = useState<'starter' | 'growth' | 'enterprise'>('starter');

    // Form state
    const [newAgentName, setNewAgentName] = useState('');
    const [newAgentType, setNewAgentType] = useState('customer_support');
    const [newAgentDescription, setNewAgentDescription] = useState('');
    const [newAgentPrompt, setNewAgentPrompt] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        // Get user plan from token
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const userEmail = payload.email || '';
                if (userEmail === 'md@modassir.info') {
                    setUserPlan('growth');
                } else if (userEmail.includes('@enterprise') || userEmail.includes('enterprise@')) {
                    setUserPlan('enterprise');
                }
            } catch (e) { }
        }
        fetchAgents();
    }, []);

    const fetchAgents = async () => {
        try {
            const res = await fetch('/api/ai/agents');
            if (res.ok) {
                setAgents(await res.json());
            } else {
                // Use demo agents for display
                setAgents([]);
            }
        } catch (error) {
            console.error('Failed to fetch agents', error);
            setAgents([]);
        } finally {
            setLoading(false);
        }
    };

    const planLimits = PLAN_LIMITS[userPlan];
    const canCreateMore = planLimits.maxAgents === -1 || agents.length < planLimits.maxAgents;
    const agentsRemaining = planLimits.maxAgents === -1 ? '∞' : planLimits.maxAgents - agents.length;

    const toggleAgent = async (id: string, isActive: boolean) => {
        try {
            await fetch(`/api/ai/agents/${id}/toggle`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !isActive }),
            });
            fetchAgents();
        } catch (error) {
            console.error('Failed to toggle agent', error);
        }
    };

    const handleCreateAgent = async () => {
        if (!newAgentName.trim()) {
            alert('Please enter an agent name');
            return;
        }

        setCreating(true);
        try {
            // In real implementation, this would call the API
            const newAgent: Agent = {
                id: `agent_${Date.now()}`,
                name: newAgentName,
                type: newAgentType,
                description: newAgentDescription,
                systemPrompt: newAgentPrompt,
                isActive: true,
                totalConversations: 0,
                successfulResolutions: 0,
                handoffsTriggered: 0,
            };
            setAgents([...agents, newAgent]);
            setShowCreateModal(false);
            resetForm();
        } catch (error) {
            console.error('Failed to create agent', error);
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteAgent = (id: string) => {
        if (confirm('Are you sure you want to delete this agent?')) {
            setAgents(agents.filter(a => a.id !== id));
        }
    };

    const resetForm = () => {
        setNewAgentName('');
        setNewAgentType('customer_support');
        setNewAgentDescription('');
        setNewAgentPrompt('');
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'customer_support': return 'bg-blue-100 text-blue-700';
            case 'sales': return 'bg-green-100 text-green-700';
            case 'lead_followup': return 'bg-purple-100 text-purple-700';
            case 'faq': return 'bg-amber-100 text-amber-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-gray-500">Loading agents...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">AI Agents</h1>
                    <p className="text-gray-600 mt-1">Configure intelligent agents for WhatsApp automation</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Plan indicator */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl">
                        <Bot className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-700">
                            {agents.length} / {planLimits.maxAgents === -1 ? '∞' : planLimits.maxAgents} Agents
                        </span>
                    </div>

                    {canCreateMore ? (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2.5 rounded-xl font-medium hover:shadow-lg transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Create Agent
                        </button>
                    ) : (
                        <Link
                            href="/dashboard/billing"
                            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2.5 rounded-xl font-medium hover:shadow-lg transition-all"
                        >
                            <Crown className="w-5 h-5" />
                            Upgrade for More
                        </Link>
                    )}
                </div>
            </div>

            {/* Plan Limit Banner */}
            {!canCreateMore && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                            <Lock className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Agent Limit Reached</h3>
                            <p className="text-gray-600 text-sm">
                                Your {planLimits.name} plan allows {planLimits.maxAgents} agent{planLimits.maxAgents > 1 ? 's' : ''}.
                                Upgrade to create more AI agents.
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/dashboard/billing"
                        className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                    >
                        View Plans
                    </Link>
                </div>
            )}

            {/* Stats Overview */}
            <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5 border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-100 rounded-xl">
                            <Bot className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Agents</p>
                            <p className="text-2xl font-bold">{agents.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-green-100 rounded-xl">
                            <Play className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Active</p>
                            <p className="text-2xl font-bold">{agents.filter(a => a.isActive).length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-purple-100 rounded-xl">
                            <MessageSquare className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Conversations</p>
                            <p className="text-2xl font-bold">
                                {agents.reduce((sum, a) => sum + a.totalConversations, 0)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-100 rounded-xl">
                            <TrendingUp className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Resolution Rate</p>
                            <p className="text-2xl font-bold">
                                {agents.length > 0
                                    ? Math.round(
                                        (agents.reduce((sum, a) => sum + a.successfulResolutions, 0) /
                                            Math.max(agents.reduce((sum, a) => sum + a.totalConversations, 0), 1)) * 100
                                    )
                                    : 0}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Agents Grid */}
            {agents.length === 0 ? (
                <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
                    <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-700 mb-2">No Agents Yet</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Create your first AI agent to automate WhatsApp conversations and provide 24/7 customer support
                    </p>
                    {canCreateMore && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
                        >
                            <Sparkles className="w-5 h-5" />
                            Create Your First Agent
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {agents.map((agent) => (
                        <div key={agent.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-3 rounded-xl ${agent.isActive ? 'bg-gradient-to-br from-blue-100 to-purple-100' : 'bg-gray-100'}`}>
                                        <Bot className={`w-6 h-6 ${agent.isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{agent.name}</h3>
                                        <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(agent.type)}`}>
                                            {agent.type.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => toggleAgent(agent.id, agent.isActive)}
                                    className={`p-2 rounded-lg transition-colors ${agent.isActive ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                        }`}
                                >
                                    {agent.isActive ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                                </button>
                            </div>

                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{agent.description || 'No description'}</p>

                            <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                                <div className="bg-gray-50 rounded-xl p-3">
                                    <p className="text-xl font-bold text-gray-900">{agent.totalConversations}</p>
                                    <p className="text-xs text-gray-500">Chats</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3">
                                    <p className="text-xl font-bold text-gray-900">{agent.successfulResolutions}</p>
                                    <p className="text-xs text-gray-500">Resolved</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3">
                                    <p className="text-xl font-bold text-gray-900">{agent.handoffsTriggered}</p>
                                    <p className="text-xs text-gray-500">Handoffs</p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium">
                                    <Settings className="w-4 h-4" />
                                    Configure
                                </button>
                                <button
                                    onClick={() => handleDeleteAgent(agent.id)}
                                    className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Add Agent Card (if can create more) */}
                    {canCreateMore && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all min-h-[280px]"
                        >
                            <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                                <Plus className="w-7 h-7 text-gray-400" />
                            </div>
                            <h3 className="font-bold text-gray-700 mb-1">Add New Agent</h3>
                            <p className="text-sm text-gray-500">
                                {agentsRemaining} slot{agentsRemaining !== 1 ? 's' : ''} remaining
                            </p>
                        </button>
                    )}
                </div>
            )}

            {/* Create Agent Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Create New Agent</h2>
                                    <p className="text-sm text-gray-500">Configure your AI assistant</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setShowCreateModal(false); resetForm(); }}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* Agent Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Agent Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={newAgentName}
                                    onChange={(e) => setNewAgentName(e.target.value)}
                                    placeholder="e.g., Sales Bot, Support Assistant"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Agent Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Agent Type <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {AGENT_TYPES.map((type) => (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => setNewAgentType(type.id)}
                                            className={`p-4 rounded-xl border-2 text-left transition-all ${newAgentType === type.id
                                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg bg-${type.color}-100`}>
                                                    <type.icon className={`w-5 h-5 text-${type.color}-600`} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{type.name}</p>
                                                    <p className="text-xs text-gray-500">{type.description}</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    value={newAgentDescription}
                                    onChange={(e) => setNewAgentDescription(e.target.value)}
                                    placeholder="Brief description of what this agent does"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* System Prompt */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    System Prompt
                                </label>
                                <textarea
                                    value={newAgentPrompt}
                                    onChange={(e) => setNewAgentPrompt(e.target.value)}
                                    placeholder="You are a helpful assistant for [Company Name]. Your goal is to..."
                                    rows={5}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Define your agent's personality, knowledge, and behavior
                                </p>
                            </div>

                            {/* Plan Info */}
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-medium text-blue-800">
                                        {planLimits.name} Plan: {agents.length + 1} of {planLimits.maxAgents === -1 ? 'Unlimited' : planLimits.maxAgents} agents
                                    </p>
                                    <p className="text-blue-700">
                                        You'll have {agentsRemaining === '∞' ? 'unlimited' : Number(agentsRemaining) - 1} slot{agentsRemaining !== 2 ? 's' : ''} remaining after creating this agent.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => { setShowCreateModal(false); resetForm(); }}
                                className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateAgent}
                                disabled={!newAgentName.trim() || creating}
                                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {creating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Create Agent
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
