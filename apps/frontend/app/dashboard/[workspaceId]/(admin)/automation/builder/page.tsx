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
    Users
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'sonner';

// --- Custom Node Components ---

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

const nodeTypes = {
    trigger: TriggerNode,
    action: ActionNode,
    ai_agent: AiNode,
    condition: ConditionNode,
    lead_update: LeadNode,
};

// --- Main Builder Component ---

function WorkflowBuilder() {
    const router = useRouter();
    const params = useParams();
    const workspaceId = params.workspaceId as string;

    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [name, setName] = useState('New Automation');
    const [loading, setLoading] = useState(false);

    // Initialize with dummy data or fetch if editing
    useEffect(() => {
        setNodes([
            {
                id: '1',
                type: 'trigger',
                data: { label: 'New Message', triggerType: 'new_message' },
                position: { x: 100, y: 100 },
            },
        ]);
    }, []);

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
            default: label = 'New Node';
        }
        const newNode: Node = {
            id,
            type,
            position: { x: Math.random() * 400, y: Math.random() * 400 },
            data: { label },
        };
        setNodes((nds) => nds.concat(newNode));
    };

    const isValidConnection = useCallback(
        (connection: Connection) => {
            // Prevent self-connections
            if (connection.source === connection.target) return false;

            const sourceNode = nodes.find((n) => n.id === connection.source);
            const targetNode = nodes.find((n) => n.id === connection.target);

            // Triggers can't be targets
            if (targetNode?.type === 'trigger') return false;

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
                    <button className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                        Test Flow
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

            {/* Main Builder Area */}
            <div className="flex-1 relative bg-[#f8fafc]">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
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
                        <button onClick={() => addNode('ai_agent')} className="p-3 hover:bg-purple-50 text-purple-600 rounded-xl transition-colors flex items-center gap-3">
                            <Bot size={20} />
                            <span className="text-sm font-bold">AI Agent</span>
                        </button>
                        <button onClick={() => addNode('lead_update')} className="p-3 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-colors flex items-center gap-3">
                            <Users size={20} />
                            <span className="text-sm font-bold">Update Lead</span>
                        </button>
                    </Panel>
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
