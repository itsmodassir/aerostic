'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import {
    ArrowLeft, Save, Play, Plus, X, ChevronDown,
    MessageSquare, Clock, Users, Zap, Check, Trash2,
    Move, Settings, Eye, Send, FileText, Bot, AlertCircle,
    MoreHorizontal, Link as LinkIcon, GitBranch
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type NodeType = 'action' | 'message' | 'delay' | 'condition' | 'end';

interface FlowNode {
    id: string;
    type: NodeType;
    x: number;
    y: number;
    data: Record<string, any>;
}

interface FlowEdge {
    id: string;
    from: string;
    to: string;
    label?: string;
}

const NODE_COLORS: Record<NodeType, string> = {
    action: 'from-blue-500 to-blue-600',
    message: 'from-green-500 to-green-600',
    delay: 'from-amber-500 to-amber-600',
    condition: 'from-purple-500 to-purple-600',
    end: 'from-gray-400 to-gray-500',
};

const NODE_ICONS: Record<NodeType, any> = {
    action: Zap,
    message: MessageSquare,
    delay: Clock,
    condition: GitBranch,
    end: Check,
};

// ─── Mini Node Card ────────────────────────────────────────────────────────────
function NodeCard({
    node, selected, onSelect, onDelete, onChange
}: {
    node: FlowNode; selected: boolean;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
    onChange: (id: string, data: Record<string, any>) => void;
}) {
    const Icon = NODE_ICONS[node.type];
    const gradient = NODE_COLORS[node.type];

    return (
        <div
            style={{ position: 'absolute', left: node.x, top: node.y, minWidth: 210 }}
            className={`rounded-xl shadow-lg border-2 transition-all cursor-pointer select-none
                ${selected ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200 hover:border-gray-300'}
                bg-white`}
            onClick={() => onSelect(node.id)}
        >
            {/* Header */}
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl bg-gradient-to-r ${gradient} text-white`}>
                <Icon className="w-4 h-4 shrink-0" />
                <span className="text-sm font-semibold capitalize">{node.type}</span>
                <button
                    className="ml-auto opacity-70 hover:opacity-100 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>
            {/* Body */}
            <div className="px-4 py-3">
                {node.type === 'action' && (
                    <p className="text-xs text-gray-600 font-medium">{node.data.label || 'Broadcasting'}</p>
                )}
                {node.type === 'message' && (
                    <p className="text-xs text-gray-600 line-clamp-2">{node.data.text || 'Click to compose message'}</p>
                )}
                {node.type === 'delay' && (
                    <p className="text-xs text-gray-600">{node.data.hours || 24} hours delay</p>
                )}
                {node.type === 'condition' && (
                    <p className="text-xs text-gray-600">{node.data.condition || 'If user replies...'}</p>
                )}
                {node.type === 'end' && (
                    <p className="text-xs text-gray-500">Flow ends here</p>
                )}
            </div>
            {/* Connection port */}
            <div className="flex justify-center pb-2">
                <div className="w-3 h-3 rounded-full bg-gray-300 border-2 border-white shadow" />
            </div>
        </div>
    );
}

// ─── SVG Arrows between Nodes ─────────────────────────────────────────────────
function FlowArrows({ nodes, edges }: { nodes: FlowNode[]; edges: FlowEdge[] }) {
    return (
        <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
            <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
                </marker>
            </defs>
            {edges.map(edge => {
                const from = nodes.find(n => n.id === edge.from);
                const to = nodes.find(n => n.id === edge.to);
                if (!from || !to) return null;
                const x1 = from.x + 105;
                const y1 = from.y + 100;
                const x2 = to.x + 105;
                const y2 = to.y;
                const cy = (y1 + y2) / 2;
                return (
                    <g key={edge.id}>
                        <path
                            d={`M${x1},${y1} C${x1},${cy} ${x2},${cy} ${x2},${y2}`}
                            fill="none" stroke="#6366f1" strokeWidth="2" markerEnd="url(#arrowhead)"
                            strokeDasharray="6 3"
                        />
                        {edge.label && (
                            <text x={(x1 + x2) / 2} y={cy - 6} textAnchor="middle" fontSize="11" fill="#6366f1" fontWeight="500">
                                {edge.label}
                            </text>
                        )}
                    </g>
                );
            })}
        </svg>
    );
}

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
    const [recipientCount, setRecipientCount] = useState<number | null>(null);

    // Flow canvas
    const [nodes, setNodes] = useState<FlowNode[]>([
        { id: 'node-1', type: 'action', x: 60, y: 60, data: { label: 'Broadcasting' } },
    ]);
    const [edges, setEdges] = useState<FlowEdge[]>([]);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const canvasRef = useRef<HTMLDivElement>(null);

    const [saving, setSaving] = useState(false);
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

    const addNode = (type: NodeType) => {
        const last = nodes[nodes.length - 1];
        const newNode: FlowNode = {
            id: `node-${Date.now()}`,
            type,
            x: last ? last.x + 20 : 60,
            y: last ? last.y + 130 : 60,
            data: {},
        };
        setNodes(prev => [...prev, newNode]);
        if (last) {
            setEdges(prev => [...prev, {
                id: `edge-${Date.now()}`,
                from: last.id,
                to: newNode.id,
            }]);
        }
    };

    const deleteNode = (id: string) => {
        setNodes(prev => prev.filter(n => n.id !== id));
        setEdges(prev => prev.filter(e => e.from !== id && e.to !== id));
        if (selectedNodeId === id) setSelectedNodeId(null);
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
            <div className="flex items-center gap-4 px-6 py-3 bg-white border-b border-gray-200 shadow-sm">
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
                <aside className="w-[340px] shrink-0 bg-white border-r border-gray-200 overflow-y-auto flex flex-col">
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
                                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-indigo-500" />
                                        <span className="text-sm font-medium text-gray-700">Targeted contacts</span>
                                    </div>
                                    <span className="text-sm font-semibold text-indigo-600">
                                        {recipientCount !== null ? recipientCount : '—'}
                                    </span>
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
                <div className="flex-1 flex flex-col">
                    {/* Canvas Toolbar */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-200">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest mr-2">Add Node</span>
                        {(['message', 'delay', 'condition', 'end'] as NodeType[]).map(type => {
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
                        <div className="flex-1" />
                        <span className="text-xs text-gray-400">{nodes.length} node{nodes.length !== 1 ? 's' : ''}</span>
                    </div>

                    {/* Canvas */}
                    <div
                        ref={canvasRef}
                        className="flex-1 relative overflow-auto bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[length:24px_24px]"
                        style={{ minHeight: 600 }}
                        onClick={() => setSelectedNodeId(null)}
                    >
                        <FlowArrows nodes={nodes} edges={edges} />
                        {nodes.map(node => (
                            <NodeCard
                                key={node.id}
                                node={node}
                                selected={selectedNodeId === node.id}
                                onSelect={setSelectedNodeId}
                                onDelete={deleteNode}
                                onChange={(id, data) => setNodes(prev =>
                                    prev.map(n => n.id === id ? { ...n, data: { ...n.data, ...data } } : n)
                                )}
                            />
                        ))}

                        {/* Add first node hint */}
                        {nodes.length === 1 && (
                            <div
                                style={{ position: 'absolute', left: 60, top: 210 }}
                                className="flex flex-col items-center gap-2 opacity-50"
                            >
                                <div className="w-0.5 h-8 bg-indigo-300" />
                                <button
                                    onClick={() => addNode('message')}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-indigo-300 text-indigo-500 text-sm hover:bg-indigo-50 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Compose Next Message
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── Right Properties Panel ───────────────────────────── */}
                {selectedNode && (
                    <aside className="w-72 shrink-0 bg-white border-l border-gray-200 overflow-y-auto">
                        <div className="p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-gray-900 capitalize">{selectedNode.type} Node</h3>
                                <button onClick={() => setSelectedNodeId(null)}>
                                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                </button>
                            </div>

                            {selectedNode.type === 'message' && (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Message Text</label>
                                        <textarea
                                            rows={5}
                                            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                            placeholder="Type your message..."
                                            value={selectedNode.data.text || ''}
                                            onChange={e => setNodes(prev => prev.map(n =>
                                                n.id === selectedNode.id ? { ...n, data: { ...n.data, text: e.target.value } } : n
                                            ))}
                                        />
                                    </div>
                                </div>
                            )}

                            {selectedNode.type === 'delay' && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Wait (hours)</label>
                                    <input
                                        type="number"
                                        min={1}
                                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={selectedNode.data.hours || 24}
                                        onChange={e => setNodes(prev => prev.map(n =>
                                            n.id === selectedNode.id ? { ...n, data: { ...n.data, hours: +e.target.value } } : n
                                        ))}
                                    />
                                </div>
                            )}

                            {selectedNode.type === 'condition' && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Condition</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={selectedNode.data.condition || ''}
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
                                onClick={() => deleteNode(selectedNode.id)}
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
