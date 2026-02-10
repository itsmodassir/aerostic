'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Plus, Zap, Trash2 } from 'lucide-react';

interface AutomationRule {
    id: string;
    name: string;
    trigger: string;
    condition: string;
    keyword: string;
    action: string;
    payload: any;
    isActive: boolean;
}

export default function AutomationPage() {
    const [rules, setRules] = useState<AutomationRule[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [tenantId, setTenantId] = useState<string>('');

    const [newRule, setNewRule] = useState({
        name: '',
        trigger: 'keyword',
        condition: 'contains',
        keyword: '',
        action: 'reply',
        replyText: ''
    });

    useEffect(() => {
        const init = async () => {
            try {
                const res = await api.get('/auth/me'); // Check auth and get user
                if (res.data && res.data.tenantId) {
                    setTenantId(res.data.tenantId);
                    fetchRules(res.data.tenantId);
                }
            } catch (e) {
                console.error('Auth failed', e);
            }
        };
        init();
    }, []);

    const fetchRules = async (tid: string) => {
        try {
            const res = await api.get(`/automation/rules?tenantId=${tid}`);
            setRules(res.data);
        } catch (error) {
            console.error('Failed to fetch rules', error);
        }
    };

    const handleCreateRule = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/automation/rules', {
                tenantId,
                name: newRule.name,
                trigger: newRule.trigger,
                condition: newRule.condition,
                keyword: newRule.keyword,
                action: newRule.action,
                payload: { text: newRule.replyText }
            });
            setShowModal(false);
            setNewRule({ name: '', trigger: 'keyword', condition: 'contains', keyword: '', action: 'reply', replyText: '' });
            fetchRules(tenantId);
        } catch (error) {
            alert('Failed to create rule');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Automation</h1>
                    <p className="text-sm text-gray-500">Create rules to automate your conversations.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full sm:w-auto"
                >
                    <Plus size={18} />
                    New Rule
                </button>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 shrink-0">
                        <Zap size={20} fill="currentColor" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">AI Agent</h2>
                        <p className="text-sm text-gray-500">
                            When no rules match, let the AI reply intelligently.
                        </p>
                    </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-0 pt-4 sm:pt-0">
                    <span className="text-sm font-medium text-gray-700">Disabled (Stub)</span>
                    <button className="w-12 h-6 bg-gray-200 rounded-full relative transition-colors">
                        <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"></div>
                    </button>
                </div>
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-4">Custom Rules</h2>
            <div className="grid gap-4">
                {rules.length === 0 ? (
                    <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500">
                        No automation rules found. Create one to get started.
                    </div>
                ) : (
                    rules.map((rule) => (
                        <div key={rule.id} className="bg-white p-4 md:p-6 rounded-lg shadow-sm border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                                    <Zap size={20} />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-semibold text-gray-900 truncate">{rule.name}</h3>
                                    <p className="text-xs sm:text-sm text-gray-500">
                                        If message <strong>{rule.condition}</strong> "{rule.keyword}", then <strong>reply</strong>.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-0 pt-4 sm:pt-0">
                                <span className={`shrink-0 px-2 py-1 rounded text-[10px] font-medium ${rule.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {rule.isActive ? 'Active' : 'Inactive'}
                                </span>
                                <button className="text-red-500 hover:bg-red-50 p-2 rounded-lg ml-auto">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg">
                        <h2 className="text-xl font-bold mb-4">Create Automation Rule</h2>
                        <form onSubmit={handleCreateRule} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Rule Name</label>
                                <input
                                    required
                                    className="w-full border rounded-md px-3 py-2 mt-1"
                                    placeholder="e.g. Welcome Message"
                                    value={newRule.name}
                                    onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Trigger</label>
                                    <select
                                        className="w-full border rounded-md px-3 py-2 mt-1 bg-gray-50"
                                        disabled
                                        value={newRule.trigger}
                                    >
                                        <option value="keyword">Keyword</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Condition</label>
                                    <select
                                        className="w-full border rounded-md px-3 py-2 mt-1"
                                        value={newRule.condition}
                                        onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
                                    >
                                        <option value="contains">Contains</option>
                                        <option value="exact">Exact Match</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Keyword</label>
                                <input
                                    required
                                    className="w-full border rounded-md px-3 py-2 mt-1"
                                    placeholder="e.g. hello, pricing, help"
                                    value={newRule.keyword}
                                    onChange={(e) => setNewRule({ ...newRule, keyword: e.target.value })}
                                />
                            </div>

                            <hr />

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Action: Reply Text</label>
                                <textarea
                                    required
                                    rows={3}
                                    className="w-full border rounded-md px-3 py-2 mt-1"
                                    placeholder="Enter the automated reply..."
                                    value={newRule.replyText}
                                    onChange={(e) => setNewRule({ ...newRule, replyText: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Create Rule
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
