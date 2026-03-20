'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import {
    ReactFlow,
    Background,
    Controls,
    Panel,
    useNodesState,
    useEdgesState,
    addEdge,
    Handle,
    Position,
    Connection,
    Edge,
    NodeProps,
    Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
    ArrowLeft, Plus, X, MessageSquare, Clock, Users, Zap, Check, Trash2,
    Send, FileText, AlertCircle, GitBranch
} from 'lucide-react';

// ─── Constants & Styles ───────────────────────────────────────────────────────
const NODE_COLORS: Record<string, string> = {
    action: 'from-blue-500 to-blue-600',
    message: 'from-green-500 to-green-600',
    delay: 'from-amber-500 to-amber-600',
    condition: 'from-purple-500 to-purple-600',
    end: 'from-gray-400 to-gray-500',
};

const NODE_ICONS: Record<string, any> = {
    action: Zap,
    message: MessageSquare,
    delay: Clock,
    condition: GitBranch,
    end: Check,
};

// ─── Custom Node Components ──────────────────────────────────────────────────
const CustomNode = ({ data, selected, id }: NodeProps) => {
    const type = data.type as string;
    const Icon = NODE_ICONS[type] || MessageSquare;
    const gradient = NODE_COLORS[type] || 'from-gray-500 to-gray-600';
    const onDelete = data.onDelete as (id: string) => void;

    return (
        <div
            className={`rounded-xl shadow-lg border-2 transition-all min-w-[210px] bg-white overflow-hidden
                ${selected ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200 hover:border-gray-300'}`}
        >
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-indigo-500" />
            
            {/* Header */}
            <div className={`flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r ${gradient} text-white`}>
                <Icon className="w-4 h-4 shrink-0" />
                <span className="text-sm font-semibold capitalize">{type}</span>
                <button
                    className="ml-auto opacity-70 hover:opacity-100 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); if (onDelete) onDelete(id); }}
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Body */}
            <div className="px-4 py-3">
                {type === 'action' && (
                    <p className="text-xs text-gray-600 font-medium">{data.label as string || 'Broadcasting'}</p>
                )}
                {type === 'message' && (
                    <p className="text-xs text-gray-600 line-clamp-2 italic">{data.text as string || 'Click to compose message'}</p>
                )}
                {type === 'delay' && (
                    <p className="text-xs text-gray-600">{data.hours as string || '24'} hours delay</p>
                )}
                {type === 'condition' && (
                    <p className="text-xs text-gray-600">{data.condition as string || 'If user replies...'}</p>
                )}
                {type === 'end' && (
                    <p className="text-xs text-gray-500">Flow ends here</p>
                )}
            </div>

            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-indigo-500" />
        </div>
    );
};

const nodeTypes = {
    campaignNode: CustomNode,
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function CampaignFlowBuilderPage() {
    const router = useRouter();
    const params = useParams();
    const workspaceId = params?.workspaceId as string;

    const [campaignName, setCampaignName] = useState('New Broadcast');
    const [messageType, setMessageType] = useState<'24hours' | 'anytime'>('anytime');
    const [templates, setTemplates] = useState<any[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [scheduleType, setScheduleType] = useState<'now' | 'later'>('now');
    const [scheduleDate, setScheduleDate] = useState('');

    // Audience
    const [includeLabels, setIncludeLabels] = useState('');
    const [excludeLabels, setExcludeLabels] = useState('');

    // React Flow State
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([
        { 
            id: 'node-1', 
            type: 'campaignNode', 
            position: { x: 60, y: 60 }, 
            data: { type: 'action', label: 'Broadcasting' } 
        },
    ]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const onDeleteNode = useCallback((id: string) => {
        setNodes((nds) => nds.filter((node) => node.id !== id));
        setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
    }, [setNodes, setEdges]);

    // Update node data with deletion handler
    useEffect(() => {
        setNodes((nds) => nds.map((node) => ({
            ...node,
            data: { ...node.data, onDelete: onDeleteNode }
        })));
    }, [onDeleteNode, setNodes]);

    const [launching, setLaunching] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/templates').then(res => {
            const list = res.data?.templates || res.data || [];
            const approved = list.filter((t: any) =>
                (t.status || '').toLowerCase() === 'approved'
            );
            setTemplates(approved);
        }).catch(() => {});
    }, []);

    const addNode = (type: string) => {
        const id = `node-${Date.now()}`;
        const newNode: Node = {
            id,
            type: 'campaignNode',
            position: { x: Math.random() * 400, y: Math.random() * 400 },
            data: { type, onDelete: onDeleteNode },
        };
        setNodes((nds) => nds.concat(newNode));
    };

    const handleLaunch = async () => {
        setError('');
        setLaunching(true);
        try {
            const tenantId = workspaceId;
            const createRes = await api.post('/campaigns', {
                tenantId,
                name: campaignName,
                templateName: selectedTemplate,
                templateLanguage: 'en',
                recipientType: 'ALL',
                recipients: [],
                flowNodes: nodes,
                flowEdges: edges,
                scheduleType,
                scheduleDate: scheduleType === 'later' ? scheduleDate : null,
            });

            const campaignId = createRes.data.id;
            if (scheduleType === 'now') {
                await api.post(`/campaigns/${campaignId}/send`, { tenantId });
            }
            router.push(`/dashboard/${workspaceId}/campaigns`);
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || 'Failed to launch campaign');
        } finally {
            setLaunching(false);
        }
    };

    const selectedNode = nodes.find(n => n.id === selectedNodeId);

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50">
            {/* Top Bar */}
            <div className="flex items-center gap-4 px-6 py-3 bg-white border-b border-gray-200 shadow-sm z-10">
                <button
                    onClick={() => router.push(`/dashboard/${workspaceId}/campaigns`)}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <input
                    className="text-lg font-bold text-gray-900 bg-transparent border-none outline-none focus:border-b-2 focus:border-indigo-500 min-w-60"
                    value={campaignName}
                    onChange={e => setCampaignName(e.target.value)}
                    placeholder="Campaign name..."
                />
                <div className="flex-1" />
                {error && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-1.5 rounded-lg text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}
                <button
                    onClick={handleLaunch}
                    disabled={!selectedTemplate || launching}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50 shadow-md shadow-indigo-200"
                >
                    <Send className="w-4 h-4" />
                    {launching ? 'Launching...' : scheduleType === 'later' ? 'Schedule' : 'Launch Now'}
                </button>
            </div>

            {/* Main Layout */}
            <div className="flex flex-1 overflow-hidden">
                {/* ─── Left Panel ─────────────────────────────────────── */}
                <aside className="w-[340px] shrink-0 bg-white border-r border-gray-200 overflow-y-auto flex flex-col z-10">
                    <div className="p-5 space-y-6">
                        {/* Message Type */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Message Type</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setMessageType('24hours')}
                                    className={`p-3 rounded-xl border-2 text-left transition-all ${messageType === '24hours' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <Clock className={`w-5 h-5 mb-1 ${messageType === '24hours' ? 'text-indigo-600' : 'text-gray-400'}`} />
                                    <p className="text-xs font-semibold text-gray-800">24 Hours</p>
                                    <p className="text-[10px] text-gray-500 mt-0.5">Free messaging</p>
                                </button>
                                <button
                                    onClick={() => setMessageType('anytime')}
                                    className={`p-3 rounded-xl border-2 text-left transition-all ${messageType === 'anytime' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <FileText className={`w-5 h-5 mb-1 ${messageType === 'anytime' ? 'text-indigo-600' : 'text-gray-400'}`} />
                                    <p className="text-xs font-semibold text-gray-800">Anytime</p>
                                    <p className="text-[10px] text-gray-500 mt-0.5">Template only</p>
                                </button>
                            </div>
                            <div className={`mt-2 p-3 rounded-lg text-xs leading-relaxed ${messageType === '24hours' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                                {messageType === '24hours'
                                    ? 'Send free-form messages within 24 hours of the last interaction. No template required.'
                                    : 'Send to users anytime using a pre-approved WhatsApp template. Charges apply.'}
                            </div>
                        </div>

                        {/* Template */}
                        {messageType === 'anytime' && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-2">Select Template</h3>
                                <select
                                    value={selectedTemplate}
                                    onChange={e => setSelectedTemplate(e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                >
                                    <option value="">Choose template...</option>
                                    {templates.map(t => (
                                        <option key={t.id} value={t.name}>{t.name} ({t.language})</option>
                                    ))}
                                </select>
                                {templates.length === 0 && (
                                    <p className="text-xs text-gray-400 mt-1">No approved templates found. Sync from WhatsApp first.</p>
                                )}
                            </div>
                        )}

                        {/* Audience Filters */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Audience</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Include Labels (comma-separated)</label>
                                    <input
                                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="e.g. vip, broadcast"
                                        value={includeLabels}
                                        onChange={e => setIncludeLabels(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Exclude Labels</label>
                                    <input
                                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="e.g. unsubscribed"
                                        value={excludeLabels}
                                        onChange={e => setExcludeLabels(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sending Time */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Sending Time</h3>
                            <div className="space-y-2">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div
                                        onClick={() => setScheduleType('now')}
                                        className={`w-10 h-6 rounded-full transition-colors ${scheduleType === 'now' ? 'bg-indigo-600' : 'bg-gray-300'} relative`}
                                    >
                                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${scheduleType === 'now' ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                    </div>
                                    <span className="text-sm text-gray-700">Send immediately</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div
                                        onClick={() => setScheduleType('later')}
                                        className={`w-10 h-6 rounded-full transition-colors ${scheduleType === 'later' ? 'bg-indigo-600' : 'bg-gray-300'} relative`}
                                    >
                                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${scheduleType === 'later' ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                    </div>
                                    <span className="text-sm text-gray-700">Schedule for later</span>
                                </label>
                                {scheduleType === 'later' && (
                                    <input
                                        type="datetime-local"
                                        value={scheduleDate}
                                        onChange={e => setScheduleDate(e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm mt-2 outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* ─── Flow Canvas ─────────────────────────────────────── */}
                <div className="flex-1 flex flex-col relative">
                    {/* Canvas Toolbar */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-200 z-10">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest mr-2">Add Node</span>
                        {['message', 'delay', 'condition', 'end'].map(type => {
                            const Icon = NODE_ICONS[type];
                            return (
                                <button
                                    key={type}
                                    onClick={() => addNode(type)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 text-xs font-medium text-gray-700 hover:text-indigo-700 transition-all"
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </button>
                            );
                        })}
                    </div>

                    {/* Canvas Area with React Flow */}
                    <div className="flex-1">
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            nodeTypes={nodeTypes}
                            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
                            onPaneClick={() => setSelectedNodeId(null)}
                            fitView
                        >
                            <Background color="#e5e7eb" gap={24} />
                            <Controls />
                        </ReactFlow>
                    </div>
                </div>

                {/* ─── Right Properties Panel ───────────────────────────── */}
                {selectedNode && (
                    <aside className="w-72 shrink-0 bg-white border-l border-gray-200 overflow-y-auto z-10">
                        <div className="p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-gray-900 capitalize">{selectedNode.data.type as string} Node</h3>
                                <button onClick={() => setSelectedNodeId(null)}>
                                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                </button>
                            </div>

                            {selectedNode.data.type === 'message' && (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Message Text</label>
                                        <textarea
                                            rows={5}
                                            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                            placeholder="Type your message..."
                                            value={selectedNode.data.text as string || ''}
                                            onChange={e => setNodes(prev => prev.map(n =>
                                                n.id === selectedNode.id ? { ...n, data: { ...n.data, text: e.target.value } } : n
                                            ))}
                                        />
                                    </div>
                                </div>
                            )}

                            {selectedNode.data.type === 'delay' && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Wait (hours)</label>
                                    <input
                                        type="number"
                                        min={1}
                                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={selectedNode.data.hours as string || '24'}
                                        onChange={e => setNodes(prev => prev.map(n =>
                                            n.id === selectedNode.id ? { ...n, data: { ...n.data, hours: e.target.value } } : n
                                        ))}
                                    />
                                </div>
                            )}

                            {selectedNode.data.type === 'condition' && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Condition</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={selectedNode.data.condition as string || ''}
                                        onChange={e => setNodes(prev => prev.map(n =>
                                            n.id === selectedNode.id ? { ...n, data: { ...n.data, condition: e.target.value } } : n
                                        ))}
                                    >
                                        <option value="">Select condition...</option>
                                        <option value="replied">User replied</option>
                                        <option value="button_clicked">Button clicked</option>
                                        <option value="no_response">No response after delay</option>
                                    </select>
                                </div>
                            )}

                            <button
                                onClick={() => onDeleteNode(selectedNode.id)}
                                className="flex items-center gap-2 text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Node
                            </button>
                        </div>
                    </aside>
                )}
            </div>
        </div>
    );
}
