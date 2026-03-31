"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
    Zap, Plus, MoreVertical, Play, 
    Pause, Trash2, Edit2, 
    Search, Filter, Calendar, Activity
} from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';
import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { resolveWorkspaceId } from '@/components/dashboard/DashboardComponents';

interface Automation {
    id: string;
    name: string;
    description: string;
    status: 'active' | 'inactive' | 'paused';
    trigger: string;
    executionCount: number;
    lastExecutedAt: string | null;
    updatedAt: string;
}

export default function AutomationsPage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = resolveWorkspaceId(params?.workspaceId as string | string[] | undefined);
    
    const [automations, setAutomations] = useState<Automation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchAutomations();
    }, [workspaceId]);

    const fetchAutomations = async () => {
        setLoading(true);
        try {
            const res = await api.get('/v1/new-automation');
            if (res.status === 200) {
                setAutomations(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch automations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this automation?')) return;
        try {
            await api.delete(`/v1/new-automation/${id}`);
            setAutomations(prev => prev.filter(a => a.id !== id));
        } catch (error) {
            console.error('Failed to delete automation:', error);
        }
    };

    const filteredAutomations = automations.filter(a => 
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
                <p className="text-xs font-semibold text-gray-400 font-mono uppercase">Initializing automation nexus...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <Zap className="text-blue-600 fill-blue-600" size={24} />
                        Automations
                    </h1>
                    <p className="text-sm text-gray-500 font-medium">Build intelligent workflows to engage your customers 24/7.</p>
                </div>
                <Button 
                    onClick={() => router.push(`/dashboard/${workspaceId}/automations/new/builder`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-100 uppercase tracking-wider text-[10px] h-10 px-6 rounded-xl"
                >
                    <Plus className="mr-2" size={14} strokeWidth={3} />
                    Create Automation
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 border-none shadow-sm bg-white flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <Activity size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Total Flows</p>
                        <h3 className="text-xl font-black text-gray-900 leading-none">{automations.length}</h3>
                    </div>
                </Card>
                <Card className="p-4 border-none shadow-sm bg-white flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <Play size={20} className="fill-emerald-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Active Now</p>
                        <h3 className="text-xl font-black text-gray-900 leading-none">
                            {automations.filter(a => a.status === 'active').length}
                        </h3>
                    </div>
                </Card>
                <Card className="p-4 border-none shadow-sm bg-white flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Zap size={20} className="fill-indigo-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Executions</p>
                        <h3 className="text-xl font-black text-gray-900 leading-none">
                            {automations.reduce((acc, curr) => acc + (curr.executionCount || 0), 0)}
                        </h3>
                    </div>
                </Card>
            </div>

            {/* List Section */}
            <Card className="border-none shadow-sm overflow-hidden bg-white">
                <div className="p-4 border-b border-gray-50 flex items-center gap-4 justify-between bg-white">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Find an automation..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                        />
                    </div>
                    <Button variant="outline" className="rounded-xl border-gray-100 hover:bg-gray-50 font-bold text-[10px] uppercase tracking-wider text-gray-500">
                        <Filter className="mr-2" size={14} />
                        Filter
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-50 bg-gray-50/30">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Automation Name</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Trigger</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Runs</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Run</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredAutomations.map((automation) => (
                                <tr key={automation.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={clsx(
                                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                                                automation.status === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-400"
                                            )}>
                                                <Zap size={16} className={automation.status === 'active' ? "fill-emerald-600" : ""} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900 tracking-tight leading-none mb-1">{automation.name}</p>
                                                <p className="text-xs text-gray-400 font-medium truncate max-w-[200px]">{automation.description || 'No description provided'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="outline" className="bg-blue-50/50 text-blue-600 border-blue-100 rounded-lg text-[9px] font-black uppercase px-2 py-0.5 tracking-wider">
                                            {automation.trigger.replace(/_/g, ' ')}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={clsx(
                                                "w-2 h-2 rounded-full",
                                                automation.status === 'active' ? "bg-emerald-500 animate-pulse" : 
                                                automation.status === 'paused' ? "bg-amber-500" : "bg-gray-300"
                                            )} />
                                            <span className="text-[11px] font-bold text-gray-600 capitalize">{automation.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-xs font-black text-gray-900 tabular-nums">{automation.executionCount || 0}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Calendar size={12} />
                                            <span className="text-[11px] font-bold">
                                                {automation.lastExecutedAt ? new Date(automation.lastExecutedAt).toLocaleDateString() : 'Never'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 rounded-lg hover:bg-blue-50 hover:text-blue-600"
                                                onClick={() => router.push(`/dashboard/${workspaceId}/automations/${automation.id}/builder`)}
                                            >
                                                <Edit2 size={14} />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 rounded-lg hover:bg-red-50 hover:text-red-600"
                                                onClick={() => handleDelete(automation.id)}
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                                <MoreVertical size={14} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredAutomations.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 mb-2">
                                                <Zap size={32} />
                                            </div>
                                            <p className="text-sm font-black text-gray-900 tracking-tight uppercase tracking-widest">No Automations Found</p>
                                            <p className="text-xs text-gray-400 font-medium">Ready to scale your business? Create your first automation flow.</p>
                                            <Button 
                                                onClick={() => router.push(`/dashboard/${workspaceId}/automations/new/builder`)}
                                                className="mt-4 bg-gray-900 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] h-10 px-8"
                                            >
                                                Launch Builder
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
