"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useParams } from 'next/navigation';
import {
    Plus, Mail, Layout, Search, Filter, MoreVertical,
    Edit2, Trash2, Eye, Copy, Loader2, Sparkles,
    CheckCircle2, AlertCircle, X, Save, Braces, Code, Sidebar
} from 'lucide-react';
import { toast } from 'sonner';

export default function EmailTemplatesPage() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

    // Form state for modal
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        content: '',
        variables: [] as string[]
    });

    const params = useParams();
    const workspaceId = params.workspaceId;

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const res = await api.get('/email-templates');
            setTemplates(res.data);
        } catch (err) {
            toast.error('Failed to fetch templates');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (template: any = null) => {
        if (template) {
            setSelectedTemplate(template);
            setFormData({
                name: template.name,
                subject: template.subject,
                content: template.content,
                variables: template.variables || []
            });
        } else {
            setSelectedTemplate(null);
            setFormData({
                name: '',
                subject: '',
                content: '<h1>Hello {{name}}!</h1>\n<p>Your message goes here...</p>',
                variables: ['name']
            });
        }
        setShowModal(true);
    };

    const handleSave = async () => {
        try {
            if (selectedTemplate) {
                await api.patch(`/email-templates/${selectedTemplate.id}`, formData);
                toast.success('Template updated');
            } else {
                await api.post('/email-templates', formData);
                toast.success('Template created');
            }
            fetchTemplates();
            setShowModal(false);
        } catch (err) {
            toast.error('Failed to save template');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this template?')) return;
        try {
            await api.delete(`/email-templates/${id}`);
            toast.success('Template deleted');
            setTemplates(templates.filter(t => t.id !== id));
        } catch (err) {
            toast.error('Failed to delete template');
        }
    };

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Email Template Gallery</h2>
                    <p className="text-gray-500 mt-1">Manage and customize your reusable email templates</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all hover:scale-105"
                >
                    <Plus size={20} />
                    Create Template
                </button>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search templates by name or subject..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm"
                    />
                </div>
                <button className="px-6 py-3 bg-white border border-gray-200 text-gray-600 font-semibold rounded-2xl hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
                    <Filter size={18} />
                    Filter
                </button>
            </div>

            {/* Templates Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            ) : filteredTemplates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map((template) => (
                        <div key={template.id} className="group bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all overflow-hidden flex flex-col">
                            {/* Preview Area (Mock) */}
                            <div className="h-40 bg-gray-50 flex items-center justify-center border-b border-gray-100 group-hover:bg-blue-50/30 transition-colors relative overflow-hidden">
                                <Mail size={48} className="text-gray-200 group-hover:text-blue-100 transition-colors" />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600/5 backdrop-blur-[1px]">
                                    <button
                                        onClick={() => handleOpenModal(template)}
                                        className="bg-white text-blue-600 px-4 py-2 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 hover:scale-105 transition-transform"
                                    >
                                        <Eye size={16} />
                                        Preview & Edit
                                    </button>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{template.name}</h3>
                                    <div className="flex items-center gap-1">
                                        <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">HTML</span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-1 italic">{template.subject}</p>

                                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                                        <Layout size={12} />
                                        {template.variables?.length || 0} VARIABLES
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleOpenModal(template)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            title="Edit"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(template.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-20 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail size={40} className="text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Templates Found</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mb-8">Create your first email template to use in automation workflows and campaigns.</p>
                    <button
                        onClick={() => handleOpenModal()}
                        className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all inline-flex items-center gap-2"
                    >
                        <Plus size={20} />
                        New Template
                    </button>
                </div>
            )}

            {/* Template Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white w-full max-w-5xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b flex items-center justify-between bg-white z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                    <Layout size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{selectedTemplate ? 'Edit Template' : 'Create New Template'}</h3>
                                    <p className="text-xs text-gray-500 font-medium">Design your custom HTML email with dynamic variables</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-hidden flex">
                            {/* Editor Side */}
                            <div className="flex-1 flex flex-col p-8 space-y-6 overflow-y-auto border-r">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Template Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Welcome Email, Password Reset"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Subject Line</label>
                                    <input
                                        type="text"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        placeholder="Subject of the email..."
                                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="flex-1 flex flex-col min-h-[300px]">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-bold text-gray-700">HTML Content</label>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            <Code size={12} />
                                            Source Editor
                                        </div>
                                    </div>
                                    <textarea
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        placeholder="Write your HTML here..."
                                        className="flex-1 w-full p-6 border border-gray-200 rounded-3xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-mono text-sm resize-none bg-gray-50/50"
                                    />
                                </div>
                            </div>

                            {/* Sidebar Side */}
                            <div className="w-80 bg-gray-50/50 p-8 space-y-8 overflow-y-auto">
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Braces size={14} />
                                        Variables
                                    </h4>
                                    <p className="text-[11px] text-gray-500 leading-relaxed italic">Add keys to use as {'{{variable_name}}'} in your template content.</p>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.variables.map((v, idx) => (
                                            <div key={idx} className="bg-white border border-gray-200 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600 flex items-center gap-2 shadow-sm">
                                                {v}
                                                <button
                                                    onClick={() => setFormData({ ...formData, variables: formData.variables.filter((_, i) => i !== idx) })}
                                                    className="text-gray-300 hover:text-red-500 transition-colors"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => {
                                                const v = prompt('Variable name (e.g. customer_name):');
                                                if (v) setFormData({ ...formData, variables: [...formData.variables, v.trim()] });
                                            }}
                                            className="bg-blue-600 text-white p-1.5 rounded-xl hover:bg-blue-700 transition-all shadow-md"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-8 border-t border-gray-200">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Sparkles size={14} />
                                        Quick Templates
                                    </h4>
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => setFormData({ ...formData, content: '<h1>Welcome, {{name}}!</h1><p>We are glad to have you on board.</p>' })}
                                            className="w-full text-left p-3 bg-white border border-gray-100 rounded-xl text-xs font-medium text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm"
                                        >
                                            Welcome Message
                                        </button>
                                        <button
                                            onClick={() => setFormData({ ...formData, content: '<h1>Reset Password</h1><p>Click <a href="{{reset_url}}">here</a> to reset your password.</p>' })}
                                            className="w-full text-left p-3 bg-white border border-gray-100 rounded-xl text-xs font-medium text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm"
                                        >
                                            Password Reset
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-6 border-t bg-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                <AlertCircle size={14} />
                                Changes are saved instantly when you click Save.
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all flex items-center gap-2 hover:scale-[1.02]"
                                >
                                    <Save size={18} />
                                    Save Template
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
