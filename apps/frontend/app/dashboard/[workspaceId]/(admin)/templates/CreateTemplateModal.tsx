'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { X, Send, AlertCircle } from 'lucide-react';

interface CreateTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    tenantId: string;
}

export default function CreateTemplateModal({ isOpen, onClose, onSuccess, tenantId }: CreateTemplateModalProps) {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('MARKETING');
    const [language, setLanguage] = useState('en_US');
    const [body, setBody] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await api.post('/templates', {
                tenantId,
                name: name.toLowerCase().replace(/ /g, '_'),
                category,
                language,
                components: [
                    {
                        type: 'BODY',
                        text: body,
                    },
                ],
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create template. Ensure name is unique and follows Meta guidelines.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-900">Create New Template</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2 border border-red-100">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Template Name</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. welcome_message"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Only lowercase letters and underscores allowed</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            >
                                <option value="MARKETING">Marketing</option>
                                <option value="UTILITY">Utility</option>
                                <option value="AUTHENTICATION">Authentication</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700">Language</label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            >
                                <option value="en_US">English (US)</option>
                                <option value="hi">Hindi</option>
                                <option value="es">Spanish</option>
                                <option value="pt_BR">Portuguese (BR)</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Message Body</label>
                        <textarea
                            required
                            rows={4}
                            placeholder="Hello {{1}}, welcome to our service!"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        />
                        <p className="text-xs text-gray-500">Use {"{{1}}"}" , "{"{{2}}"}" etc. for variables</p>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-lg shadow-blue-500/20"
                        >
                            {loading ? 'Submitting...' : (
                                <>
                                    <Send size={18} />
                                    Submit to Meta
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
