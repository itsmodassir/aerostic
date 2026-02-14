'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
    ReactFlow,
    addEdge,
    Background,
    Controls,
    MiniMap,
    applyEdgeChanges,
    applyNodeChanges,
    Panel,
    Handle,
    Position,
    NodeProps,
    Edge,
    Node,
    OnConnect,
    Connection,
    ReactFlowProvider,
    useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
    Zap,
    MessageSquare,
    Bot,
    Calendar,
    ChevronRight,
    Save,
    ArrowLeft,
    Plus,
    Settings2,
    Trash2,
    X,
    Users,
    Megaphone,
    FileSpreadsheet,
    Terminal,
    Mail,
    Globe,
    Cpu,
    Sparkles
} from 'lucide-react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'sonner';
import clsx from 'clsx';
import TestChatPanel from './TestChatPanel';
import GoogleSheetsNode from './GoogleSheetsNode';
import ContactNode from './ContactNode';
import TemplateNode from './TemplateNode';
import EmailNode from './EmailNode';
import ChatNode from './ChatNode';
import WebhookNode from './WebhookNode';
import ApiNode from './ApiNode';
import GoogleDriveNode from './GoogleDriveNode';
import AiAgentNode from './AiAgentNode';
import OpenAiModelNode from './OpenAiModelNode';
import GeminiModelNode from './GeminiModelNode';

// --- Custom Node Components ---
// ... (omitted for brevity in instruction, but keep existing)

const TriggerNode = ({ data }: NodeProps) => (
    <div className="bg-white border-2 border-amber-500 rounded-xl shadow-lg min-w-[200px] overflow-hidden">
        <div className="bg-amber-500 p-2 flex items-center gap-2 text-white">
            <Zap size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Trigger</span>
        </div>
        <div className="p-4">
            <h4 className="font-bold text-gray-900">{data.label as string}</h4>
            <p className="text-[10px] text-gray-500 mt-1">Starts when a new message is received</p>
        </div>
        <Handle type="source" position={Position.Right} className="w-3 h-3 bg-amber-500" />
    </div>
);

const ActionNode = ({ data }: NodeProps) => (
    <div className="bg-white border-2 border-blue-500 rounded-xl shadow-lg min-w-[200px] overflow-hidden">
        <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500" />
        <div className="bg-blue-500 p-2 flex items-center gap-2 text-white">
            <MessageSquare size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Action</span>
        </div>
        <div className="p-4">
            <h4 className="font-bold text-gray-900">{data.label as string}</h4>
            <p className="text-[10px] text-gray-500 mt-1">Send a WhatsApp reply</p>
        </div>
        <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500" />
    </div>
);

const AiNode = ({ data }: NodeProps) => (
    <div className="bg-white border-2 border-purple-500 rounded-xl shadow-lg min-w-[200px] overflow-hidden">
        <Handle type="target" position={Position.Left} className="w-3 h-3 bg-purple-500" />
        <div className="bg-purple-500 p-2 flex items-center gap-2 text-white">
            <Bot size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">AI Agent</span>
        </div>
        <div className="p-4">
            <h4 className="font-bold text-gray-900">{data.label as string}</h4>
            <p className="text-[10px] text-gray-500 mt-1">Intelligent AI response</p>
        </div>
    </div>
);

const ConditionNode = ({ data }: NodeProps) => (
    <div className="bg-white border-2 border-amber-500 rounded-xl shadow-lg min-w-[220px] overflow-hidden">
        <Handle type="target" position={Position.Left} className="w-3 h-3 bg-amber-500" />
        <div className="bg-amber-500 p-2 flex items-center gap-2 text-white">
            <Settings2 size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Condition</span>
        </div>
        <div className="p-4">
            <h4 className="font-bold text-gray-900">{data.label as string}</h4>
            <div className="flex flex-col gap-2 mt-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-gray-400">
                    <span>MATCH</span>
                    <Handle type="source" position={Position.Right} id="true" className="w-3 h-3 bg-green-500 !top-1/2" style={{ top: '45px' }} />
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold text-gray-400">
                    <span>ELSE</span>
                    <Handle type="source" position={Position.Right} id="false" className="w-3 h-3 bg-red-500 !top-1/2" style={{ top: '75px' }} />
                </div>
            </div>
        </div>
    </div>
);

const LeadNode = ({ data }: NodeProps) => (
    <div className="bg-white border-2 border-emerald-500 rounded-xl shadow-lg min-w-[200px] overflow-hidden">
        <Handle type="target" position={Position.Left} className="w-3 h-3 bg-emerald-500" />
        <div className="bg-emerald-500 p-2 flex items-center gap-2 text-white">
            <Users size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Update Lead</span>
        </div>
        <div className="p-4">
            <h4 className="font-bold text-gray-900">{data.label as string}</h4>
            <p className="text-[10px] text-gray-500 mt-1">Change lead status or score</p>
        </div>
        <Handle type="source" position={Position.Right} className="w-3 h-3 bg-emerald-500" />
    </div>
);

const BroadcastNode = ({ data }: NodeProps) => (
    <div className="bg-white border-2 border-pink-500 rounded-xl shadow-lg min-w-[200px] overflow-hidden">
        <div className="bg-pink-500 p-2 flex items-center gap-2 text-white">
            <Megaphone size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Broadcast Trigger</span>
        </div>
        <div className="p-4">
            <h4 className="font-bold text-gray-900">{data.label as string}</h4>
            <p className="text-[10px] text-gray-500 mt-1">Triggers when a broadcast is sent</p>
        </div>
        <Handle type="source" position={Position.Right} className="w-3 h-3 bg-pink-500" />
    </div>
);

const nodeTypes = {
    trigger: TriggerNode,
    action: ActionNode,
    ai_agent: AiAgentNode, // Replaces old AiNode
    condition: ConditionNode,
    lead_update: LeadNode,
    broadcast_trigger: BroadcastNode,
    google_sheets: GoogleSheetsNode,
    contact: ContactNode,
    template: TemplateNode,
    email: EmailNode,
    chat: ChatNode,
    webhook: WebhookNode,
    api_request: ApiNode,
    google_drive: GoogleDriveNode,
    openai_model: OpenAiModelNode,
    gemini_model: GeminiModelNode,
};

// --- Main Builder Component ---

function WorkflowBuilder() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const workspaceId = params.workspaceId as string;
    const template = searchParams.get('template');

    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [name, setName] = useState('New Automation');
    const [loading, setLoading] = useState(false);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [showTestPanel, setShowTestPanel] = useState(false);

    // Initialize with dummy data or fetch if editing
    useEffect(() => {
        if (template === 'ai-sales') {
            setName('AI Sales Assistant');
            setNodes([
                { id: '1', type: 'trigger', data: { label: 'New Message' }, position: { x: 100, y: 100 } },
                { id: '2', type: 'ai_agent', data: { label: 'AI Assistant', persona: 'Proactive Sales Expert' }, position: { x: 400, y: 100 } },
                { id: '3', type: 'lead_update', data: { label: 'Update Status: Warm', status: 'warm' }, position: { x: 700, y: 100 } },
            ]);
            setEdges([
                { id: 'e1-2', source: '1', target: '2' },
                { id: 'e2-3', source: '2', target: '3' },
            ]);
        } else if (template === 'auto-welcome') {
            setName('Auto-Welcome');
            setNodes([
                { id: '1', type: 'trigger', data: { label: 'New Message' }, position: { x: 100, y: 150 } },
                { id: '2', type: 'action', data: { label: 'Welcome Reply', message: 'Hi there! Thanks for reaching out. An agent will be with you shortly.' }, position: { x: 400, y: 150 } },
            ]);
            setEdges([{ id: 'e1-2', source: '1', target: '2' }]);
        } else if (template === 'keyword-router') {
            setName('Keyword Router: Pricing');
            setNodes([
                { id: '1', type: 'trigger', data: { label: 'New Message' }, position: { x: 100, y: 200 } },
                { id: '2', type: 'condition', data: { label: 'Check "Price"', keyword: 'price', operator: 'contains' }, position: { x: 400, y: 200 } },
                { id: '3', type: 'action', data: { label: 'Send Pricing PDF', message: 'Here is our pricing structure: [Link]' }, position: { x: 750, y: 150 } },
            ]);
            setEdges([{ id: 'e1-2', source: '1', target: '2' }, { id: 'e2-3', source: '2', target: '3', sourceHandle: 'true' }]);
        } else {
            setNodes([
                {
                    id: '1',
                    type: 'trigger',
                    data: { label: 'New Message', triggerType: 'new_message' },
                    position: { x: 100, y: 100 },
                },
            ]);
        }
    }, [template]);

    const onNodesChange = useCallback(
        (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );

    const onEdgesChange = useCallback(
        (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );

    const onConnect: OnConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        []
    );

    const addNode = (type: string) => {
        const id = Date.now().toString();
        let label = '';
        switch (type) {
            case 'action': label = 'Send Reply'; break;
            case 'ai_agent': label = 'AI Assistant'; break;
            case 'condition': label = 'Keyword Check'; break;
            case 'lead_update': label = 'Update Status'; break;
            case 'broadcast_trigger': label = 'Campaign Sent'; break;
            case 'google_sheets': label = 'Google Sheets'; break;
            case 'contact': label = 'Contact Operation'; break;
            case 'template': label = 'Send Template'; break;
            case 'email': label = 'Send Email'; break;
            case 'webhook': label = 'Webhook Trigger'; break;
            case 'api_request': label = 'HTTP Request'; break;
            case 'google_drive': label = 'Google Drive'; break;
            default: label = 'New Node';
        }
        const newNode: Node = {
            id,
            type,
            position: { x: Math.random() * 400, y: Math.random() * 400 },
            data: {
                label,
                ...(type === 'action' && { message: 'Hello! How can I help you today?' }),
                ...(type === 'ai_agent' && { persona: 'Helpful Assistant' }),
                ...(type === 'condition' && { keyword: 'hi', operator: 'equals' }),
                ...(type === 'lead_update' && { status: 'warm' }),
                ...(type === 'google_sheets' && { operation: 'read' }),
                ...(type === 'contact' && { operation: 'get', matchField: 'phone' }),
                ...(type === 'template' && { templateName: 'hello_world', language: 'en_US' }),
                ...(type === 'email' && { to: '{{CONTACT_EMAIL}}', provider: 'smtp' }),
                ...(type === 'openai_model' && { modelName: 'gpt-4o', temperature: 0.7 }),
                ...(type === 'gemini_model' && { modelName: 'gemini-1.5-pro', temperature: 0.7 }),
                ...(type === 'chat' && { label: 'Agent Handoff' }),
                ...(type === 'webhook' && { label: 'Webhook Trigger', workflowId: params.workflowId || 'NEW' }),
                ...(type === 'api_request' && { method: 'GET', url: 'https://', headers: '{}', body: '{}', variableName: 'apiResponse' }),
                ...(type === 'google_drive' && { operation: 'list', variableName: 'driveResult' }),
            },
        };
        setNodes((nds) => nds.concat(newNode));
    };

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
    }, []);

    const updateNodeData = (newData: any) => {
        if (!selectedNode) return;
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === selectedNode?.id) {
                    return { ...node, data: { ...node.data, ...newData } };
                }
                return node;
            })
        );
        setSelectedNode({ ...selectedNode, data: { ...selectedNode?.data, ...newData } });
    };

    const isValidConnection = useCallback(
        (connection: any) => {
            // Prevent self-connections
            if (connection.source === connection.target) return false;

            const sourceNode = nodes.find((n) => n.id === connection.source);
            const targetNode = nodes.find((n) => n.id === connection.target);

            // Triggers can't be targets
            if (targetNode?.type === 'trigger' || targetNode?.type === 'webhook' || targetNode?.type === 'broadcast_trigger') return false;

            // AI Agent Specific Validation
            if (targetNode?.type === 'ai_agent') {
                const targetHandle = connection.targetHandle;

                // 1. Model Input Validation
                if (targetHandle === 'model-target') {
                    // Only allow Model nodes to connect to 'model-target'
                    return sourceNode?.type === 'openai_model' || sourceNode?.type === 'gemini_model';
                }

                // 2. Tool Input Validation
                if (targetHandle === 'tool-target') {
                    // Only allow Tool nodes to connect to 'tool-target'
                    // Currently only Google Drive is a tool
                    return sourceNode?.type === 'google_drive';
                }

                // 3. Flow Input Validation
                if (targetHandle === 'flow-target' || !targetHandle) {
                    // Models and Tools typically SHOULD NOT connect to the main flow input
                    // unless they also act as flow nodes (which they don't right now)
                    if (sourceNode?.type === 'openai_model' || sourceNode?.type === 'gemini_model') return false;
                    // Google Drive IS a flow node too, so it CAN connect to flow-target if used sequentially
                }
            }

            // Prevent Models from connecting to non-model inputs
            if (sourceNode?.type === 'openai_model' || sourceNode?.type === 'gemini_model') {
                return targetNode?.type === 'ai_agent' && connection.targetHandle === 'model-target';
            }

            return true;
        },
        [nodes]
    );

    const saveWorkflow = async () => {
        const hasTrigger = nodes.some(n => n.type === 'trigger');
        if (!hasTrigger) {
            toast.error('Workflow must have at least one trigger node');
            return;
        }

        setLoading(true);
        try {
            await api.post('/workflows', {
                name,
                nodes,
                edges,
                isActive: true,
            });
            toast.success('Workflow saved successfully!');
            router.push(`/dashboard/${workspaceId}/automation`);
        } catch (err) {
            toast.error('Failed to save workflow');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="h-screen flex flex-col -m-8">
            {/* Header */}
            <div className="bg-white border-b px-8 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="h-8 w-[1px] bg-gray-200" />
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="text-lg font-bold bg-transparent border-none focus:ring-0 p-0 text-gray-900 w-64"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowTestPanel(!showTestPanel)}
                        className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 ${showTestPanel ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <Terminal size={18} />
                        Test Bot
                    </button>
                    <button
                        onClick={saveWorkflow}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 disabled:opacity-50 transition-all hover:scale-105"
                    >
                        {loading ? <div className="animate-spin h-4 w-4 border-2 border-white/20 border-t-white rounded-full" /> : <Save size={18} />}
                        Save Workflow
                    </button>
                </div>
            </div>

            {/* Test Chat Panel */}
            {showTestPanel && (
                <TestChatPanel
                    workspaceId={workspaceId}
                    workflowId={params.workflowId as string}
                    onClose={() => setShowTestPanel(false)}
                    onDebugEvent={(event) => {
                        console.log('Received Debug Event in Page:', event);
                        setNodes((nds) => nds.map((node) => {
                            if (node.id === event.nodeId) {
                                // Apply Visual Styles based on status
                                let style = {};
                                if (event.status === 'processing') {
                                    style = { border: '2px solid #3b82f6', boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)' }; // Blue
                                } else if (event.status === 'completed') {
                                    style = { border: '2px solid #22c55e', boxShadow: '0 0 15px rgba(34, 197, 94, 0.4)' }; // Green
                                } else if (event.status === 'failed') {
                                    style = { border: '2px solid #ef4444', boxShadow: '0 0 15px rgba(239, 68, 68, 0.6)' }; // Red
                                }
                                return { ...node, style: { ...node.style, ...style } };
                            }
                            return node;
                        }));
                    }}
                />
            )}

            {/* Main Builder Area */}
            <div className="flex-1 relative bg-[#f8fafc]">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    onPaneClick={() => setSelectedNode(null)}
                    nodeTypes={nodeTypes}
                    isValidConnection={isValidConnection}
                    fitView
                >
                    <Background />
                    <Controls />
                    <MiniMap />

                    <Panel position="top-right" className="bg-white p-2 rounded-2xl shadow-xl border flex flex-col gap-2">
                        <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b mb-1">Add Elements</div>
                        <button onClick={() => addNode('action')} className="p-3 hover:bg-blue-50 text-blue-600 rounded-xl transition-colors flex items-center gap-3">
                            <MessageSquare size={20} />
                            <span className="text-sm font-bold">Reply Action</span>
                        </button>
                        <button onClick={() => addNode('condition')} className="p-3 hover:bg-amber-50 text-amber-600 rounded-xl transition-colors flex items-center gap-3">
                            <Settings2 size={20} />
                            <span className="text-sm font-bold">Condition</span>
                        </button>
                        <button onClick={() => addNode('webhook')} className="p-3 hover:bg-pink-50 text-pink-600 rounded-xl transition-colors flex items-center gap-3">
                            <Zap size={20} />
                            <span className="text-sm font-bold">Webhook Trigger</span>
                        </button>
                        <button onClick={() => addNode('api_request')} className="p-3 hover:bg-cyan-50 text-cyan-600 rounded-xl transition-colors flex items-center gap-3">
                            <Globe size={20} />
                            <span className="text-sm font-bold">HTTP Request</span>
                        </button>
                        <button onClick={() => addNode('ai_agent')} className="p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition text-left flex items-center gap-3 border border-purple-200 shadow-sm group">
                            <div className="p-2 bg-white rounded-md shadow-sm group-hover:scale-110 transition-transform"><Bot size={18} className="text-purple-600" /></div>
                            <div><div className="font-bold text-sm">AI Agent</div><div className="text-[10px] opacity-70">Smart Assistant</div></div>
                        </button>
                        <button onClick={() => addNode('openai_model')} className="p-3 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition text-left flex items-center gap-3 border border-teal-200 shadow-sm group">
                            <div className="p-2 bg-white rounded-md shadow-sm group-hover:scale-110 transition-transform"><Cpu size={18} className="text-teal-600" /></div>
                            <div><div className="font-bold text-sm">OpenAI Model</div><div className="text-[10px] opacity-70">GPT-4 Config</div></div>
                        </button>
                        <button onClick={() => addNode('gemini_model')} className="p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-left flex items-center gap-3 border border-blue-200 shadow-sm group">
                            <div className="p-2 bg-white rounded-md shadow-sm group-hover:scale-110 transition-transform"><Sparkles size={18} className="text-blue-600" /></div>
                            <div><div className="font-bold text-sm">Gemini Model</div><div className="text-[10px] opacity-70">Gemini Pro Config</div></div>
                        </button>
                        <button onClick={() => addNode('lead_update')} className="p-3 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-colors flex items-center gap-3">
                            <Users size={20} />
                            <span className="text-sm font-bold">Update Lead</span>
                        </button>
                        <button onClick={() => addNode('broadcast_trigger')} className="p-3 hover:bg-pink-50 text-pink-600 rounded-xl transition-colors flex items-center gap-3">
                            <Megaphone size={20} />
                            <span className="text-sm font-bold">Broadcast</span>
                        </button>
                        <button onClick={() => addNode('google_sheets')} className="p-3 hover:bg-green-50 text-green-600 rounded-xl transition-colors flex items-center gap-3">
                            <FileSpreadsheet size={20} />
                            <span className="text-sm font-bold">Google Sheets</span>
                        </button>
                        <button onClick={() => addNode('contact')} className="p-3 hover:bg-purple-50 text-purple-600 rounded-xl transition-colors flex items-center gap-3">
                            <Users size={20} />
                            <span className="text-sm font-bold">Contact</span>
                        </button>
                        <button onClick={() => addNode('template')} className="p-3 hover:bg-indigo-50 text-indigo-600 rounded-xl transition-colors flex items-center gap-3">
                            <Zap size={20} />
                            <span className="text-sm font-bold">Send Template</span>
                        </button>
                        <button onClick={() => addNode('email')} className="p-3 hover:bg-sky-50 text-sky-600 rounded-xl transition-colors flex items-center gap-3">
                            <Mail size={20} />
                            <span className="text-sm font-bold">Send Email</span>
                        </button>
                        <button onClick={() => addNode('chat')} className="p-3 hover:bg-indigo-50 text-indigo-600 rounded-xl transition-colors flex items-center gap-3">
                            <MessageSquare size={20} />
                            <span className="text-sm font-bold">Agent Handoff</span>
                        </button>
                    </Panel>
                </ReactFlow>

                {/* Node Editor Side Panel */}
                {selectedNode && (
                    <div className="absolute top-0 right-0 h-full w-80 bg-white border-l shadow-2xl z-20 animate-in slide-in-from-right duration-300">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-lg font-bold text-gray-900">Configure Node</h3>
                                <button onClick={() => setSelectedNode(null)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Node Label</label>
                                    <input
                                        type="text"
                                        value={selectedNode?.data.label as string}
                                        onChange={(e) => updateNodeData({ label: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                                    />
                                </div>

                                {selectedNode?.type === 'action' && (
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Reply Message</label>
                                        <textarea
                                            value={selectedNode?.data.message as string}
                                            onChange={(e) => updateNodeData({ message: e.target.value })}
                                            rows={4}
                                            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                                            placeholder="Enter the WhatsApp message to send..."
                                        />
                                    </div>
                                )}

                                {selectedNode?.type === 'ai_agent' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Model</label>
                                            <select
                                                value={selectedNode?.data.model as string || 'gpt-4o'}
                                                onChange={(e) => updateNodeData({ model: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 text-sm font-medium"
                                            >
                                                <option value="gpt-4o">GPT-4o (Best Quality)</option>
                                                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                                                <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Fastest)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">System Prompt</label>
                                            <textarea
                                                value={selectedNode?.data.systemPrompt as string || ''}
                                                onChange={(e) => updateNodeData({ systemPrompt: e.target.value })}
                                                rows={6}
                                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 text-sm font-medium font-mono text-xs"
                                                placeholder="You are a helpful assistant. Use {{contact.name}} to personalize..."
                                            />
                                            <p className="text-[10px] text-gray-400 mt-2">Variables: {'{{contact.name}}'}, {'{{contact.phone}}'}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Agent Persona</label>
                                            <input
                                                type="text"
                                                value={selectedNode?.data.persona as string}
                                                onChange={(e) => updateNodeData({ persona: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 text-sm font-medium"
                                                placeholder="e.g. Sales Expert"
                                            />
                                        </div>
                                    </div>
                                )}

                                {selectedNode?.type === 'condition' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Keyword to Match</label>
                                            <input
                                                type="text"
                                                value={selectedNode?.data.keyword as string}
                                                onChange={(e) => updateNodeData({ keyword: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Operator</label>
                                            <select
                                                value={selectedNode?.data.operator as string}
                                                onChange={(e) => updateNodeData({ operator: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                                            >
                                                <option value="equals">Equals to</option>
                                                <option value="contains">Contains</option>
                                                <option value="starts_with">Starts with</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {selectedNode?.type === 'lead_update' && (
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Update Status to</label>
                                        <select
                                            value={selectedNode?.data.status as string}
                                            onChange={(e) => updateNodeData({ status: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                                        >
                                            <option value="new">New</option>
                                            <option value="warm">Warm</option>
                                            <option value="hot">Hot</option>
                                            <option value="contacted">Contacted</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </div>
                                )}

                                {selectedNode?.type === 'broadcast_trigger' && (
                                    <div className="space-y-4">
                                        <div className="bg-gray-100 p-1 rounded-lg flex">
                                            {['contacts', 'file', 'sheets'].map((t) => (
                                                <button
                                                    key={t}
                                                    onClick={() => updateNodeData({ audienceType: t })}
                                                    className={`flex-1 py-1.5 text-xs font-bold rounded-md capitalize transition-all ${(selectedNode?.data.audienceType || 'contacts') === t ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-500'
                                                        }`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                        {(!selectedNode?.data.audienceType || selectedNode?.data.audienceType === 'contacts') && (
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Filter Tags</label>
                                                <input
                                                    type="text"
                                                    value={selectedNode?.data.tags as string || ''}
                                                    onChange={(e) => updateNodeData({ tags: e.target.value })}
                                                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-pink-500 text-sm font-medium"
                                                    placeholder="vip, new-lead"
                                                />
                                            </div>
                                        )}
                                        {selectedNode?.data.audienceType === 'sheets' && (
                                            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-xl border border-dashed">
                                                Connect a "Google Sheets" node to this workflow to use it as a source.
                                            </div>
                                        )}
                                    </div>
                                )}

                                {selectedNode?.type === 'google_sheets' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Spreadsheet ID</label>
                                            <input
                                                type="text"
                                                value={selectedNode?.data.sheetId as string || ''}
                                                onChange={(e) => updateNodeData({ sheetId: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 text-sm font-medium"
                                                placeholder="1BxiMVs0..."
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Range / Sheet Name</label>
                                            <input
                                                type="text"
                                                value={selectedNode?.data.range as string || ''}
                                                onChange={(e) => updateNodeData({ range: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 text-sm font-medium"
                                                placeholder="Sheet1!A1:D"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Operation</label>
                                            <select
                                                value={selectedNode?.data.operation as string || 'read'}
                                                onChange={(e) => updateNodeData({ operation: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 text-sm font-medium"
                                            >
                                                <option value="read">Read Data</option>
                                                <option value="write">Write Data</option>
                                                <option value="append">Append Row</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                                {selectedNode?.type === 'contact' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Action</label>
                                            <div className="bg-gray-100 p-1 rounded-lg flex">
                                                {['get', 'create', 'update'].map((op) => (
                                                    <button
                                                        key={op}
                                                        onClick={() => updateNodeData({ operation: op })}
                                                        className={`flex-1 py-1.5 text-xs font-bold rounded-md capitalize transition-all ${(selectedNode?.data.operation || 'get') === op ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500'
                                                            }`}
                                                    >
                                                        {op}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Match Field</label>
                                            <select
                                                value={selectedNode?.data.matchField as string || 'phone'}
                                                onChange={(e) => updateNodeData({ matchField: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 text-sm font-medium"
                                            >
                                                <option value="phone">Phone Number</option>
                                                <option value="email">Email Address</option>
                                            </select>
                                        </div>
                                        {(selectedNode?.data.operation === 'create' || selectedNode?.data.operation === 'update') && (
                                            <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded-lg border border-blue-100">
                                                Use <strong>{'{{contact.name}}'}</strong> or <strong>{'{{contact.phone}}'}</strong> variables in other nodes to reference this contact.
                                            </div>
                                        )}
                                    </div>
                                )}

                                {selectedNode?.type === 'template' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Template Name</label>
                                            <input
                                                type="text"
                                                value={selectedNode?.data.templateName as string || ''}
                                                onChange={(e) => updateNodeData({ templateName: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                                                placeholder="hello_world"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Language Code</label>
                                            <input
                                                type="text"
                                                value={selectedNode?.data.language as string || 'en_US'}
                                                onChange={(e) => updateNodeData({ language: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                                                placeholder="en_US"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Variables (CSV)</label>
                                            <input
                                                type="text"
                                                value={selectedNode?.data.variables as string || ''}
                                                onChange={(e) => updateNodeData({ variables: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                                                placeholder="{{contact.name}}, Coupon123"
                                            />
                                        </div>
                                        <div className="p-3 bg-indigo-50 text-indigo-700 text-xs rounded-lg border border-indigo-100">
                                            Ensure the template name matches exactly with your Meta Business Manager.
                                        </div>
                                    </div>
                                )}

                                {selectedNode?.type === 'email' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">To (Email Address)</label>
                                            <input
                                                type="text"
                                                value={selectedNode?.data.to as string || ''}
                                                onChange={(e) => updateNodeData({ to: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500 text-sm font-medium"
                                                placeholder="{{contact.email}}"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Subject</label>
                                            <input
                                                type="text"
                                                value={selectedNode?.data.subject as string || ''}
                                                onChange={(e) => updateNodeData({ subject: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500 text-sm font-medium"
                                                placeholder="Welcome to Aerostic!"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Email Body</label>
                                            <textarea
                                                value={selectedNode?.data.body as string || ''}
                                                onChange={(e) => updateNodeData({ body: e.target.value })}
                                                rows={5}
                                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500 text-sm font-medium"
                                                placeholder="Hello {{contact.name}}, ..."
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Provider</label>
                                            <select
                                                value={selectedNode?.data.provider as string || 'smtp'}
                                                onChange={(e) => updateNodeData({ provider: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500 text-sm font-medium"
                                            >
                                                <option value="smtp">SMTP (Default)</option>
                                                <option value="resend">Resend</option>
                                                <option value="sendgrid">SendGrid</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {selectedNode?.type === 'google_drive' && (
                                    <div className="space-y-4">
                                        <div className="p-4 bg-green-50 border border-green-200 rounded-xl mb-4">
                                            <h4 className="text-sm font-bold text-green-800 mb-2">Google Account</h4>
                                            <button
                                                onClick={() => {
                                                    const width = 500;
                                                    const height = 600;
                                                    const left = (window.screen.width / 2) - (width / 2);
                                                    const top = (window.screen.height / 2) - (height / 2);
                                                    const popup = window.open(
                                                        `${api.defaults.baseURL}/google/auth?tenantId=${params.workspaceId}`,
                                                        'GoogleAuth',
                                                        `width=${width},height=${height},top=${top},left=${left}`
                                                    );

                                                    const receiveMessage = (event: any) => {
                                                        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
                                                            toast.success('Google Account Connected!');
                                                            if (popup) popup.close();
                                                            window.removeEventListener('message', receiveMessage);
                                                        }
                                                    };
                                                    window.addEventListener('message', receiveMessage);
                                                }}
                                                className="w-full py-2 bg-white border-2 border-green-500 text-green-700 font-bold rounded-lg hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <div className="w-5 h-5 bg-contain bg-no-repeat bg-center" style={{ backgroundImage: 'url(https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg)' }} />
                                                Connect Google Drive
                                            </button>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Operation</label>
                                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                                {['list', 'read', 'upload'].map((op) => (
                                                    <button
                                                        key={op}
                                                        onClick={() => updateNodeData({ operation: op })}
                                                        className={`flex-1 py-1.5 text-xs font-bold rounded-md capitalize transition-all ${(selectedNode?.data.operation || 'list') === op ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'
                                                            }`}
                                                    >
                                                        {op}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {selectedNode?.data.operation === 'read' && (
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">File ID</label>
                                                <input
                                                    type="text"
                                                    value={selectedNode?.data.fileId as string || ''}
                                                    onChange={(e) => updateNodeData({ fileId: e.target.value })}
                                                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 text-sm font-medium font-mono"
                                                    placeholder="1BxiMVs0..."
                                                />
                                            </div>
                                        )}

                                        {selectedNode?.data.operation === 'upload' && (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">File Name</label>
                                                    <input
                                                        type="text"
                                                        value={selectedNode?.data.fileName as string || ''}
                                                        onChange={(e) => updateNodeData({ fileName: e.target.value })}
                                                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 text-sm font-medium"
                                                        placeholder="report.pdf"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Content (Text/Base64)</label>
                                                    <textarea
                                                        value={selectedNode?.data.content as string || ''}
                                                        onChange={(e) => updateNodeData({ content: e.target.value })}
                                                        rows={3}
                                                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 text-sm font-medium"
                                                        placeholder="File content..."
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Save Result To (Variable)</label>
                                            <input
                                                type="text"
                                                value={selectedNode?.data.variableName as string || 'driveResult'}
                                                onChange={(e) => updateNodeData({ variableName: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 text-sm font-medium"
                                                placeholder="driveResult"
                                            />
                                        </div>
                                    </div>
                                )}

                                {selectedNode?.type === 'openai_model' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Model Name</label>
                                            <select
                                                value={selectedNode?.data.modelName as string || 'gpt-4o'}
                                                onChange={(e) => updateNodeData({ modelName: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-teal-500 text-sm font-medium"
                                            >
                                                <option value="gpt-4o">GPT-4o</option>
                                                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                                                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Temperature</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="2"
                                                step="0.1"
                                                value={selectedNode?.data.temperature as number || 0.7}
                                                onChange={(e) => updateNodeData({ temperature: parseFloat(e.target.value) })}
                                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-teal-500 text-sm font-medium"
                                            />
                                            <p className="text-[10px] text-gray-400 mt-1">0 = Deterministic, 2 = Creative</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">API Key (Optional)</label>
                                            <input
                                                type="password"
                                                value={selectedNode?.data.apiKey as string || ''}
                                                onChange={(e) => updateNodeData({ apiKey: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-teal-500 text-sm font-medium"
                                                placeholder="sk-..."
                                            />
                                            <p className="text-[10px] text-gray-400 mt-1">Leave empty to use system default.</p>
                                        </div>
                                    </div>
                                )}

                                {selectedNode?.type === 'gemini_model' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Model Name</label>
                                            <select
                                                value={selectedNode?.data.modelName as string || 'gemini-1.5-pro'}
                                                onChange={(e) => updateNodeData({ modelName: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                                            >
                                                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                                                <option value="gemini-pro">Gemini Pro</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Temperature</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="1"
                                                step="0.1"
                                                value={selectedNode?.data.temperature as number || 0.7}
                                                onChange={(e) => updateNodeData({ temperature: parseFloat(e.target.value) })}
                                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">API Key (Optional)</label>
                                            <input
                                                type="password"
                                                value={selectedNode?.data.apiKey as string || ''}
                                                onChange={(e) => updateNodeData({ apiKey: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                                                placeholder="AIza..."
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        {selectedNode?.data.operation === 'read' && (
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">File ID</label>
                                <input
                                    type="text"
                                    value={selectedNode?.data.fileId as string || ''}
                                    onChange={(e) => updateNodeData({ fileId: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 text-sm font-medium font-mono"
                                    placeholder="1abc..."
                                />
                            </div>
                        )}
                        {selectedNode?.data.operation === 'upload' && (
                            <>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">File Name</label>
                                    <input
                                        type="text"
                                        value={selectedNode?.data.fileName as string || ''}
                                        onChange={(e) => updateNodeData({ fileName: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 text-sm font-medium"
                                        placeholder="report.pdf"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Content (Text/Base64/Var)</label>
                                    <textarea
                                        value={selectedNode?.data.fileContent as string || ''}
                                        onChange={(e) => updateNodeData({ fileContent: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 text-sm font-medium font-mono text-xs"
                                        placeholder="{{apiResponse.data}}"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">MIME Type</label>
                                    <input
                                        type="text"
                                        value={selectedNode?.data.mimeType as string || 'text/plain'}
                                        onChange={(e) => updateNodeData({ mimeType: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 text-sm font-medium"
                                        placeholder="text/plain"
                                    />
                                </div>
                            </>
                        )}
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Save Result To (Variable)</label>
                            <input
                                type="text"
                                value={selectedNode?.data.variableName as string || 'driveResult'}
                                onChange={(e) => updateNodeData({ variableName: e.target.value })}
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 text-sm font-medium"
                                placeholder="driveResult"
                            />
                        </div>
                    </div>
                )}

                {selectedNode?.type === 'chat' && (
                    <div className="space-y-4">
                        <div className="p-4 bg-indigo-50 text-indigo-700 text-sm rounded-xl border border-indigo-100">
                            <strong>Agent Handoff</strong><br />
                            When this node is reached, the conversation status will be set to <strong>"agent_handoff"</strong>.
                            <br /><br />
                            The bot will stop responding, and the conversation will be flagged for a human agent.
                        </div>
                    </div>
                )}

                {selectedNode?.type === 'api_request' && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Method</label>
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                {['GET', 'POST', 'PUT', 'DELETE'].map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => updateNodeData({ method: m })}
                                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${(selectedNode?.data.method || 'GET') === m
                                            ? 'bg-white text-cyan-600 shadow-sm'
                                            : 'text-gray-500'
                                            }`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">URL</label>
                            <input
                                type="text"
                                value={selectedNode?.data.url as string || ''}
                                onChange={(e) => updateNodeData({ url: e.target.value })}
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-cyan-500 text-sm font-medium font-mono"
                                placeholder="https://api.example.com/v1/users"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Headers (JSON)</label>
                            <textarea
                                value={selectedNode?.data.headers as string || '{}'}
                                onChange={(e) => updateNodeData({ headers: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-cyan-500 text-sm font-medium font-mono text-xs"
                                placeholder='{"Authorization": "Bearer TOKEN"}'
                            />
                        </div>
                        {selectedNode?.data.method !== 'GET' && (
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Body (JSON)</label>
                                <textarea
                                    value={selectedNode?.data.body as string || '{}'}
                                    onChange={(e) => updateNodeData({ body: e.target.value })}
                                    rows={5}
                                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-cyan-500 text-sm font-medium font-mono text-xs"
                                    placeholder='{"name": "{{contact.name}}"}'
                                />
                            </div>
                        )}
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Save Response To (Variable)</label>
                            <input
                                type="text"
                                value={selectedNode?.data.variableName as string || 'apiResponse'}
                                onChange={(e) => updateNodeData({ variableName: e.target.value })}
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-cyan-500 text-sm font-medium"
                                placeholder="apiResponse"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">
                                Access later with <code>context.apiResponse</code>
                            </p>
                        </div>
                    </div>
                )}

                {/* Common Delete Button for All Nodes */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                    <button
                        onClick={() => {
                            if (selectedNode) {
                                setNodes(nds => nds.filter(n => n.id !== selectedNode?.id));
                                setSelectedNode(null);
                            }
                        }}
                        className="w-full py-3 text-red-600 font-bold hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <Trash2 size={16} />
                        Delete Node
                    </button>
                </div>
            </div>
        </div>
                )}
            </div>
        </div>
    );
}
        <ReactFlowProvider>
            <WorkflowBuilder />
        </ReactFlowProvider>
    );
}