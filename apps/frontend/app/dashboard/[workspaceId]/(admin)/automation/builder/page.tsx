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
    useReactFlow,
    MarkerType
} from '@xyflow/react';

export type WorkflowUIFlowNode<D extends Record<string, any> = Record<string, any>, T extends string = string> = Node<D, T>;
import { NodeEditorPanel } from './NodeEditorPanel';

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
import {
    TriggerNodeData,
    ActionNodeData,
    AiAgentNodeData,
    ConditionNodeData,
    LeadUpdateNodeData,
    BroadcastTriggerNodeData
} from '@/types/workflow';

// --- Custom Node Components ---
// ... (omitted for brevity in instruction, but keep existing)

const TriggerNode = ({ data }: NodeProps<WorkflowUIFlowNode<TriggerNodeData>>) => (
    <div className="bg-white border-2 border-amber-500 rounded-xl shadow-lg min-w-[200px] overflow-hidden">
        <div className="bg-amber-500 p-2 flex items-center gap-2 text-white">
            <Zap size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Trigger</span>
        </div>
        <div className="p-4">
            <h4 className="font-bold text-gray-900">{data.label}</h4>
            <p className="text-[10px] text-gray-500 mt-1">Starts when a new message is received</p>
        </div>
        <Handle type="source" position={Position.Right} className="w-3 h-3 bg-amber-500" />
    </div>
);

const ActionNode = ({ data }: NodeProps<WorkflowUIFlowNode<ActionNodeData>>) => (
    <div className="bg-white border-2 border-blue-500 rounded-xl shadow-lg min-w-[200px] overflow-hidden">
        <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500" />
        <div className="bg-blue-500 p-2 flex items-center gap-2 text-white">
            <MessageSquare size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Action</span>
        </div>
        <div className="p-4">
            <h4 className="font-bold text-gray-900">{data.label}</h4>
            <p className="text-[10px] text-gray-500 mt-1">Send a WhatsApp reply</p>
        </div>
        <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500" />
    </div>
);

const AiNode = ({ data }: NodeProps<WorkflowUIFlowNode<AiAgentNodeData>>) => (
    <div className="bg-white border-2 border-purple-500 rounded-xl shadow-lg min-w-[200px] overflow-hidden">
        <Handle type="target" position={Position.Left} className="w-3 h-3 bg-purple-500" />
        <div className="bg-purple-500 p-2 flex items-center gap-2 text-white">
            <Bot size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">AI Agent</span>
        </div>
        <div className="p-4">
            <h4 className="font-bold text-gray-900">{data.label}</h4>
            <p className="text-[10px] text-gray-500 mt-1">Intelligent AI response</p>
        </div>
    </div>
);

const ConditionNode = ({ data }: NodeProps<WorkflowUIFlowNode<ConditionNodeData>>) => (
    <div className="bg-white border-2 border-amber-500 rounded-xl shadow-lg min-w-[220px] overflow-hidden">
        <Handle type="target" position={Position.Left} className="w-3 h-3 bg-amber-500" />
        <div className="bg-amber-500 p-2 flex items-center gap-2 text-white">
            <Settings2 size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Condition</span>
        </div>
        <div className="p-4">
            <h4 className="font-bold text-gray-900">{data.label}</h4>
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

const LeadNode = ({ data }: NodeProps<WorkflowUIFlowNode<LeadUpdateNodeData>>) => (
    <div className="bg-white border-2 border-emerald-500 rounded-xl shadow-lg min-w-[200px] overflow-hidden">
        <Handle type="target" position={Position.Left} className="w-3 h-3 bg-emerald-500" />
        <div className="bg-emerald-500 p-2 flex items-center gap-2 text-white">
            <Users size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Update Lead</span>
        </div>
        <div className="p-4">
            <h4 className="font-bold text-gray-900">{data.label}</h4>
            <p className="text-[10px] text-gray-500 mt-1">Change lead status or score</p>
        </div>
        <Handle type="source" position={Position.Right} className="w-3 h-3 bg-emerald-500" />
    </div>
);

const BroadcastNode = ({ data }: NodeProps<WorkflowUIFlowNode<BroadcastTriggerNodeData>>) => (
    <div className="bg-white border-2 border-pink-500 rounded-xl shadow-lg min-w-[200px] overflow-hidden">
        <div className="bg-pink-500 p-2 flex items-center gap-2 text-white">
            <Megaphone size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Broadcast Trigger</span>
        </div>
        <div className="p-4">
            <h4 className="font-bold text-gray-900">{data.label}</h4>
            <p className="text-[10px] text-gray-500 mt-1">Triggers when a broadcast is sent</p>
        </div>
        <Handle type="source" position={Position.Right} className="w-3 h-3 bg-pink-500" />
    </div>
);

const KnowledgeNode = ({ data }: NodeProps<WorkflowUIFlowNode>) => (
    <div className="bg-white border-2 border-cyan-500 rounded-xl shadow-lg min-w-[200px] overflow-hidden">
        <Handle type="target" position={Position.Left} className="w-3 h-3 bg-cyan-500" />
        <div className="bg-cyan-500 p-2 flex items-center gap-2 text-white">
            <Globe size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Knowledge Query</span>
        </div>
        <div className="p-4">
            <h4 className="font-bold text-gray-900">{data.label}</h4>
            <p className="text-[10px] text-gray-500 mt-1">Search documentation/KB</p>
        </div>
        <Handle type="source" position={Position.Right} className="w-3 h-3 bg-cyan-500" />
    </div>
);

const MemoryNode = ({ data }: NodeProps<WorkflowUIFlowNode>) => (
    <div className="bg-white border-2 border-indigo-500 rounded-xl shadow-lg min-w-[200px] overflow-hidden">
        <Handle type="target" position={Position.Left} className="w-3 h-3 bg-indigo-500" />
        <div className="bg-indigo-500 p-2 flex items-center gap-2 text-white">
            <Cpu size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Memory</span>
        </div>
        <div className="p-4">
            <h4 className="font-bold text-gray-900">{data.label}</h4>
            <p className="text-[10px] text-gray-500 mt-1">Get/Set user variables</p>
        </div>
        <Handle type="source" position={Position.Right} className="w-3 h-3 bg-indigo-500" />
    </div>
);

const nodeTypes = {
    trigger: TriggerNode,
    action: ActionNode,
    ai_agent: AiAgentNode,
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
    knowledge_query: KnowledgeNode,
    memory: MemoryNode,
};

// --- Main Builder Component ---

function WorkflowBuilder() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const workspaceId = params.workspaceId as string;
    const template = searchParams.get('template');

    const [nodes, setNodes] = useState<WorkflowUIFlowNode[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [name, setName] = useState('New Automation');
    const [loading, setLoading] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [selectedNode, setSelectedNode] = useState<WorkflowUIFlowNode | null>(null);
    const [showTestPanel, setShowTestPanel] = useState(false);

    // Fetch existing workflow if editing
    useEffect(() => {
        const fetchWorkflow = async () => {
            const workflowId = params.workflowId as string;
            if (workflowId && workflowId !== 'new') {
                try {
                    const res = await api.get(`/workflows/${workflowId}`);
                    if (res.data) {
                        setName(res.data.name);
                        setNodes(res.data.nodes || []);
                        setEdges(res.data.edges || []);
                    }
                } catch (err) {
                    console.error('Failed to fetch workflow:', err);
                    toast.error('Failed to load workflow data');
                }
            }
        };
        fetchWorkflow();
    }, [params.workflowId]);

    // Initialize with templates
    useEffect(() => {
        const workflowId = params.workflowId as string;
        if (!workflowId || workflowId === 'new') {
            if (template === 'ai-sales') {
                setName('AI Sales Assistant');
                setNodes([
                    { id: '1', type: 'trigger', data: { label: 'New Message' }, position: { x: 100, y: 100 } },
                    { id: '2', type: 'ai_agent', data: { label: 'AI Assistant', persona: 'Proactive Sales Expert' }, position: { x: 400, y: 100 } },
                    { id: '3', type: 'lead_update', data: { label: 'Update Status: Warm', status: 'warm' }, position: { x: 700, y: 100 } },
                ] as WorkflowUIFlowNode[]);
                setEdges([
                    { id: 'e1-2', source: '1', target: '2', markerEnd: { type: MarkerType.ArrowClosed } },
                    { id: 'e2-3', source: '2', target: '3', markerEnd: { type: MarkerType.ArrowClosed } },
                ]);
            } else if (template === 'broadcast') {
                setName('Broadcasting Workflow');
                setNodes([
                    { id: '1', type: 'broadcast_trigger', data: { label: 'Campaign Sent' }, position: { x: 100, y: 150 } },
                    { id: '2', type: 'template', data: { label: 'Send Welcome Template', templateName: 'welcome_template' }, position: { x: 450, y: 150 } },
                    { id: '3', type: 'lead_update', data: { label: 'Status: Contacted', status: 'warm' }, position: { x: 800, y: 150 } },
                ] as WorkflowUIFlowNode[]);
                setEdges([
                    { id: 'e1-2', source: '1', target: '2', markerEnd: { type: MarkerType.ArrowClosed } },
                    { id: 'e2-3', source: '2', target: '3', markerEnd: { type: MarkerType.ArrowClosed } },
                ]);
            } else if (template === 'support') {
                setName('AI Support Assistant');
                setNodes([
                    { id: '1', type: 'trigger', data: { label: 'New Message' }, position: { x: 100, y: 200 } },
                    { id: '2', type: 'knowledge_query', data: { label: 'Search Handbook', knowledgeBaseId: 'kb_default' }, position: { x: 400, y: 200 } },
                    { id: '3', type: 'ai_agent', data: { label: 'Support AI', persona: 'Friendly Support Bot' }, position: { x: 750, y: 200 } },
                    { id: '4', type: 'condition', data: { label: 'Can Answer?', keyword: 'not_found', operator: 'contains' }, position: { x: 1100, y: 200 } },
                ] as WorkflowUIFlowNode[]);
                setEdges([
                    { id: 'e1-2', source: '1', target: '2', markerEnd: { type: MarkerType.ArrowClosed } },
                    { id: 'e2-3', source: '2', target: '3', markerEnd: { type: MarkerType.ArrowClosed } },
                    { id: 'e3-4', source: '3', target: '4', markerEnd: { type: MarkerType.ArrowClosed } },
                ]);
            } else if (template === 'auto-welcome') {
                setName('Auto-Welcome');
                setNodes([
                    { id: '1', type: 'trigger', data: { label: 'New Message' }, position: { x: 100, y: 150 } },
                    { id: '2', type: 'action', data: { label: 'Welcome Reply', message: 'Hi there! Thanks for reaching out. An agent will be with you shortly.' }, position: { x: 400, y: 150 } },
                ] as WorkflowUIFlowNode[]);
                setEdges([{ id: 'e1-2', source: '1', target: '2', markerEnd: { type: MarkerType.ArrowClosed } }]);
            } else if (template === 'keyword-router') {
                setName('Keyword Router: Pricing');
                setNodes([
                    { id: '1', type: 'trigger', data: { label: 'New Message' }, position: { x: 100, y: 200 } },
                    { id: '2', type: 'condition', data: { label: 'Check "Price"', keyword: 'price', operator: 'contains' }, position: { x: 400, y: 200 } },
                    { id: '3', type: 'action', data: { label: 'Send Pricing PDF', message: 'Here is our pricing structure: [Link]' }, position: { x: 750, y: 150 } },
                ] as WorkflowUIFlowNode[]);
                setEdges([{ id: 'e1-2', source: '1', target: '2', markerEnd: { type: MarkerType.ArrowClosed } }, { id: 'e2-3', source: '2', target: '3', sourceHandle: 'true', markerEnd: { type: MarkerType.ArrowClosed } }]);
            } else {
                setNodes([
                    {
                        id: '1',
                        type: 'trigger',
                        data: { label: 'New Message', triggerType: 'new_message' },
                        position: { x: 100, y: 100 },
                    },
                ] as WorkflowUIFlowNode[]);
            }
        }
    }, [template, params.workflowId]);

    // Auto-save logic
    useEffect(() => {
        if (!hasChanges) return;
        const timeout = setTimeout(() => {
            saveWorkflow(true);
        }, 30000); // 30 seconds
        return () => clearTimeout(timeout);
    }, [nodes, edges, name, hasChanges]);

    const onNodesChange = useCallback(
        (changes: any) => {
            setNodes((nds: WorkflowUIFlowNode[]) => applyNodeChanges(changes, nds) as any as WorkflowUIFlowNode[]);
            setHasChanges(true);
        },
        []
    );

    const onEdgesChange = useCallback(
        (changes: any) => {
            setEdges((eds) => applyEdgeChanges(changes, eds));
            setHasChanges(true);
        },
        []
    );

    const onConnect: OnConnect = useCallback(
        (params: Connection) => {
            setEdges((eds) => addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed } }, eds));
            setHasChanges(true);
        },
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
            case 'knowledge_query': label = 'Knowledge Query'; break;
            case 'memory': label = 'Memory'; break;
            default: label = 'New Node';
        }

        const newNode: WorkflowUIFlowNode = {
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
                ...(type === 'knowledge_query' && { knowledgeBaseId: 'default' }),
            },
        };
        setNodes((nds) => nds.concat(newNode));
        setHasChanges(true);
    };

    const onNodeClick = useCallback((event: React.MouseEvent, node: WorkflowUIFlowNode) => {
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
        setHasChanges(true);
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

    const exportWorkflow = () => {
        const dataStr = JSON.stringify({ name, nodes, edges }, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `${name.toLowerCase().replace(/\s+/g, '_')}_workflow.json`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const saveWorkflow = async (isAutoSave = false) => {
        const hasTrigger = nodes.some(n => n.type === 'trigger' || n.type === 'webhook' || n.type === 'broadcast_trigger');
        if (!hasTrigger && !isAutoSave) {
            toast.error('Workflow must have at least one trigger node');
            return;
        }

        if (!isAutoSave) setLoading(true);
        try {
            const workflowId = params.workflowId as string;
            if (workflowId && workflowId !== 'new') {
                await api.patch(`/workflows/${workflowId}`, {
                    name,
                    nodes,
                    edges,
                });
            } else {
                const res = await api.post('/workflows', {
                    name,
                    nodes,
                    edges,
                    isActive: true,
                });
                if (res.data?.id) {
                    router.replace(`/dashboard/${workspaceId}/automation/builder/${res.data.id}`);
                }
            }
            if (!isAutoSave) toast.success('Workflow saved successfully!');
            setLastSaved(new Date());
            setHasChanges(false);
        } catch (err) {
            if (!isAutoSave) toast.error('Failed to save workflow');
        } finally {
            if (!isAutoSave) setLoading(false);
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
                        onClick={exportWorkflow}
                        className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors flex items-center gap-2"
                    >
                        <Save size={18} />
                        Export JSON
                    </button>
                    <button
                        onClick={() => setShowTestPanel(!showTestPanel)}
                        className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 ${showTestPanel ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <Terminal size={18} />
                        Test Bot
                    </button>
                    <button
                        onClick={() => saveWorkflow(false)}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 disabled:opacity-50 transition-all hover:scale-105"
                    >
                        {loading ? <div className="animate-spin h-4 w-4 border-2 border-white/20 border-t-white rounded-full" /> : <Save size={18} />}
                        {hasChanges ? 'Save Changes' : 'Saved'}
                    </button>
                </div>
            </div>

            {/* Test Chat Panel */}
            {showTestPanel && (
                <TestChatPanel
                    workspaceId={workspaceId}
                    workflowId={params.workflowId as string}
                    onClose={() => setShowTestPanel(false)}
                    onDebugEvent={(eventData) => {
                        console.log('Received Debug Event in Page:', eventData);
                        const { event, data } = eventData;
                        const nodeId = data.nodeId;

                        setNodes((nds) => nds.map((node) => {
                            if (node.id === nodeId) {
                                // Apply Visual Styles based on status
                                let style = {};
                                if (event === 'node_started') {
                                    style = { border: '2px solid #3b82f6', boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)' }; // Blue
                                } else if (event === 'node_completed') {
                                    style = { border: '2px solid #22c55e', boxShadow: '0 0 15px rgba(34, 197, 94, 0.4)' }; // Green
                                } else if (event === 'node_failed') {
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

                    <Panel position="top-right" className="bg-white p-2 rounded-2xl shadow-xl border flex flex-col gap-2 max-h-[85vh] overflow-y-auto">
                        <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b mb-1">Add Elements</div>
                        <button onClick={() => addNode('action')} className="p-3 hover:bg-blue-50 text-blue-600 rounded-xl transition-colors flex items-center gap-3 text-left">
                            <MessageSquare size={20} />
                            <span className="text-sm font-bold">Reply Action</span>
                        </button>
                        <button onClick={() => addNode('condition')} className="p-3 hover:bg-amber-50 text-amber-600 rounded-xl transition-colors flex items-center gap-3 text-left">
                            <Settings2 size={20} />
                            <span className="text-sm font-bold">Condition</span>
                        </button>
                        <button onClick={() => addNode('webhook')} className="p-3 hover:bg-pink-50 text-pink-600 rounded-xl transition-colors flex items-center gap-3 text-left">
                            <Zap size={20} />
                            <span className="text-sm font-bold">Webhook Trigger</span>
                        </button>
                        <button onClick={() => addNode('api_request')} className="p-3 hover:bg-cyan-50 text-cyan-600 rounded-xl transition-colors flex items-center gap-3 text-left">
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
                        <button onClick={() => addNode('lead_update')} className="p-3 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-colors flex items-center gap-3 text-left">
                            <Users size={20} />
                            <span className="text-sm font-bold">Update Lead</span>
                        </button>
                        <button onClick={() => addNode('broadcast_trigger')} className="p-3 hover:bg-pink-50 text-pink-600 rounded-xl transition-colors flex items-center gap-3 text-left">
                            <Megaphone size={20} />
                            <span className="text-sm font-bold">Broadcast</span>
                        </button>
                        <button onClick={() => addNode('google_sheets')} className="p-3 hover:bg-green-50 text-green-600 rounded-xl transition-colors flex items-center gap-3 text-left">
                            <FileSpreadsheet size={20} />
                            <span className="text-sm font-bold">Google Sheets</span>
                        </button>
                        <button onClick={() => addNode('contact')} className="p-3 hover:bg-purple-50 text-purple-600 rounded-xl transition-colors flex items-center gap-3 text-left">
                            <Users size={20} />
                            <span className="text-sm font-bold">Contact</span>
                        </button>
                        <button onClick={() => addNode('template')} className="p-3 hover:bg-indigo-50 text-indigo-600 rounded-xl transition-colors flex items-center gap-3 text-left">
                            <Zap size={20} />
                            <span className="text-sm font-bold">Send Template</span>
                        </button>
                        <button onClick={() => addNode('email')} className="p-3 hover:bg-sky-50 text-sky-600 rounded-xl transition-colors flex items-center gap-3 text-left">
                            <Mail size={20} />
                            <span className="text-sm font-bold">Send Email</span>
                        </button>
                        <button onClick={() => addNode('chat')} className="p-3 hover:bg-indigo-50 text-indigo-600 rounded-xl transition-colors flex items-center gap-3 text-left">
                            <MessageSquare size={20} />
                            <span className="text-sm font-bold">Agent Handoff</span>
                        </button>
                        <button onClick={() => addNode('memory')} className="p-3 hover:bg-indigo-50 text-indigo-600 rounded-xl transition-colors flex items-center gap-3 text-left">
                            <Cpu size={20} />
                            <span className="text-sm font-bold">Memory</span>
                        </button>
                        <button onClick={() => addNode('knowledge_query')} className="p-3 hover:bg-cyan-50 text-cyan-600 rounded-xl transition-colors flex items-center gap-3 text-left">
                            <Globe size={20} />
                            <span className="text-sm font-bold">Knowledge Query</span>
                        </button>
                    </Panel>

                    {selectedNode && (
                        <NodeEditorPanel
                            node={selectedNode}
                            nodes={nodes}
                            onUpdate={(id: string, data: any) => updateNodeData(data)}
                            onClose={() => setSelectedNode(null)}
                        />
                    )}
                </ReactFlow>
            </div>
        </div>
    );
}


export default function BuilderPage() {
    return (
        <ReactFlowProvider>
            <WorkflowBuilder />
        </ReactFlowProvider>
    );
}