'use client';

import { useState } from 'react';
import { Bot, Save, Sparkles } from 'lucide-react';

export default function AiSettingsPage() {
    const [enabled, setEnabled] = useState(true);
    const [persona, setPersona] = useState(
        "You are a helpful and friendly customer support agent for Aerostic, a SaaS platform. Answer concisely."
    );
    const [saving, setSaving] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 1000));
        setSaving(false);
        alert('AI Settings Saved (Mock)');
    };

    return (
        <div className="max-w-2xl space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="text-purple-600" />
                    AI Agent Configuration
                </h1>
                <p className="text-gray-500">Customize how your AI Assistant interacts with customers.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-medium text-gray-900">Enable AI Agent</h3>
                        <p className="text-sm text-gray-500">Allow AI to reply when no automation rules match.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={enabled}
                            onChange={(e) => setEnabled(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                </div>

                <div className="border-t pt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        System Prompt (Persona)
                    </label>
                    <p className="text-xs text-gray-500 mb-3">
                        Define who the AI is, what it knows, and how it should behave.
                    </p>
                    <textarea
                        rows={6}
                        className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                        value={persona}
                        onChange={(e) => setPersona(e.target.value)}
                        placeholder="e.g. You are a sales assistant for..."
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-70 transition-colors"
                    >
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save Configuration'}
                    </button>
                </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-3 items-start">
                <Bot className="text-blue-600 shrink-0 mt-1" size={20} />
                <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Pro Tip</p>
                    Give the AI specific instructions about your business hours, refund policy, and tone of voice for best results.
                </div>
            </div>
        </div>
    );
}
