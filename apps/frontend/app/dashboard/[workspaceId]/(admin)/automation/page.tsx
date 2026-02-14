'use client';

import { useState, useEffect } from 'react';
import {
    Plus,
    Zap,
    Trash2,
    MoreVertical,
    ArrowRight,
    Bot,
    MessageSquare
} from 'lucide-react';
import api from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

interface Workflow {
    id: string;
    name: string;
    isActive: boolean;
    updatedAt: string;
    nodes: any[];
}

export default function AutomationPage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params.workspaceId as string;
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWorkflows = async () => {
            try {
                const res = await api.get('/workflows');
                setWorkflows(res.data);
            } catch (err) {
                console.error('Failed to fetch workflows', err);
            } finally {
                setLoading(false);
            }
        };
        fetchWorkflows();
    }, []);

    const toggleStatus = async (id: string, current: boolean) => {
        try {
            await api.put(`/workflows/${id}`, { isActive: !current });
            setWorkflows(workflows.map(w => w.id === id ? { ...w, isActive: !current } : w));
            toast.success(`Workflow ${!current ? 'activated' : 'paused'}`);
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const deleteWorkflow = async (id: string) => {
        if (!confirm('Are you sure you want to delete this workflow?')) return;
        try {
            await api.delete(`/workflows/${id}`);
            setWorkflows(workflows.filter(w => w.id !== id));
            toast.success('Workflow deleted');
        } catch (err) {
            toast.error('Failed to delete workflow');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Automation</h1>
                    <p className="text-gray-500 text-sm">Create smart workflows to engage your customers.</p>
                </div>
                <Link
                    href={`/dashboard/${workspaceId}/automation/builder`}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
                >
                    <Plus size={20} />
                    New Workflow
                </Link>
            </div>

            {/* Template Library */}
            <div className="grid grid-cols-3 gap-6">
                {[
                    {
                        id: 'ai-sales',
                        name: 'AI Sales Assistant',
                        desc: 'Intelligent AI response that updates lead status.',
                        icon: Bot,
                        color: 'bg-purple-100 text-purple-600'
                    },
                    {
                        id: 'auto-welcome',
                        name: 'Auto-Welcome',
                        desc: 'Instantly reply to new customers who message you.',
                        icon: MessageSquare,
                        color: 'bg-blue-100 text-blue-600'
                    },
                    {
                        id: 'keyword-router',
                        name: 'Keyword Router',
                        desc: 'Send specific info based on words like "Price" or "Demo".',
                        icon: Zap,
                        color: 'bg-amber-100 text-amber-600'
                    },
                ].map((tpl) => (
                    <Link
                        key={tpl.id}
                        href={`/dashboard/${workspaceId}/automation/builder?template=${tpl.id}`}
                        className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group relative overflow-hidden"
                    >
                        <div className={`p-3 rounded-xl w-fit mb-4 ${tpl.color}`}>
                            <tpl.icon size={24} />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{tpl.name}</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">{tpl.desc}</p>
                        <div className="mt-4 flex items-center gap-1.5 text-blue-600 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                            Use Template <ArrowRight size={12} />
                        </div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-24 bg-white border rounded-2xl animate-pulse" />
                    ))
                ) : workflows.length === 0 ? (
                    <div className="bg-white border-2 border-dashed rounded-3xl p-16 text-center flex flex-col items-center">
                        <div className="p-5 bg-blue-50 text-blue-600 rounded-2xl mb-6">
                            <Zap size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">Create your first Automation</h3>
                        <p className="text-gray-500 max-w-sm mt-3 text-lg leading-relaxed">Save time and boost engagement with automated WhatsApp sequences.</p>
                        <Link
                            href={`/dashboard/${workspaceId}/automation/builder`}
                            className="mt-8 flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:bg-blue-700 transition-all hover:scale-105"
                        >
                            Open Workflow Builder <ArrowRight size={20} />
                        </Link>
                    </div>
                ) : workflows.map((workflow) => (
                    <div key={workflow.id} className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            <div className={`p-4 rounded-2xl ${workflow.isActive ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}>
                                <Zap size={28} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{workflow.name}</h3>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-sm text-gray-500 font-medium">{workflow.nodes.length} steps</span>
                                    <div className="w-1 h-1 bg-gray-300 rounded-full" />
                                    <span className="text-sm text-gray-500 font-medium">Updated {new Date(workflow.updatedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 mr-4">
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${workflow.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                                    {workflow.isActive ? 'Active' : 'Paused'}
                                </span>
                                <button
                                    onClick={() => toggleStatus(workflow.id, workflow.isActive)}
                                    className={`w-11 h-6 rounded-full p-1 transition-colors relative ${workflow.isActive ? 'bg-blue-600' : 'bg-gray-200'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${workflow.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>
                            <button
                                onClick={() => deleteWorkflow(workflow.id)}
                                className="p-2.5 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"
                            >
                                <Trash2 size={20} />
                            </button>
                            <Link
                                href={`/dashboard/${workspaceId}/automation/builder?id=${workflow.id}`}
                                className="p-2.5 text-gray-400 hover:bg-gray-100 rounded-xl transition-all"
                            >
                                <MoreVertical size={20} />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
