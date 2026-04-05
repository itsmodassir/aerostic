'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
    ReactFlow,
    ReactFlowProvider,
    addEdge,
    useNodesState,
    useEdgesState,
    Controls,
    Background,
    MiniMap,
    Panel,
    Node,
    Edge,
    ReactFlowInstance,
    Connection,
    BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import Sidebar from './Sidebar';
import { TriggerNode, MessageNode, TemplateNode, ConditionNode } from './CustomNodes';
import { Save, Sparkles, Activity, ShieldCheck, Zap, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const nodeTypes = {
    TriggerNode,
    MessageNode,
    TemplateNode,
    ConditionNode,
};

const initialNodes: Node[] = [
    {
        id: 'trigger-1',
        type: 'TriggerNode',
        position: { x: 250, y: 5 },
        data: { label: 'Incoming Message' },
    },
];

interface FlowCanvasProps {
    agentId?: string;
    workspaceId?: string;
}

let id = 0;
const getId = () => `dndnode_${Math.random().toString(36).substr(2, 9)}`;

export default function FlowCanvas({ agentId, workspaceId }: FlowCanvasProps) {
    const reactFlowWrapper = useRef(null);
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance<Node, Edge> | null>(null);
    const [saving, setSaving] = useState(false);

    // Fetch existing flow on mount
    useEffect(() => {
        const fetchAgent = async () => {
            try {
                const res = await api.get(`/agents/${agentId}?tenantId=${workspaceId}`);
                if (res.data) {
                    const agent = res.data;
                    if (agent.nodes && Array.isArray(agent.nodes) && agent.nodes.length > 0) {
                        setNodes(agent.nodes);
                    }
                    if (agent.edges && Array.isArray(agent.edges)) {
                        setEdges(agent.edges);
                    }
                }
            } catch (error) {
                console.error('Failed to load agent flow:', error);
                toast.error('Failed to load existing flow data');
            }
        };

        if (workspaceId && agentId) {
            fetchAgent();
        }
    }, [workspaceId, agentId, setNodes, setEdges]);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [],
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            if (!reactFlowInstance) {
                return;
            }

            const type = event.dataTransfer.getData('application/reactflow');

            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode = {
                id: getId(),
                type: type as any,
                position,
                data: { label: `${type.replace('Node', '')} node` },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes],
    );

    const onSave = async () => {
        if (reactFlowInstance && agentId && workspaceId) {
            setSaving(true);
            const flow = reactFlowInstance.toObject();
            const toastId = toast.loading('Synchronizing Intelligence Vector...');
            try {
                await api.patch(`/agents/${agentId}?tenantId=${workspaceId}`, {
                    nodes: flow.nodes,
                    edges: flow.edges
                });
                toast.success('Agent Logic Optimized!', { id: toastId });
            } catch (error) {
                console.error('Failed to save flow:', error);
                toast.error('Sync failure detected', { id: toastId });
            } finally {
                setSaving(false);
            }
        } else if (!agentId) {
            toast.error('Intelligence ID is missing');
        }
    };

    return (
        <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
            <ReactFlowProvider>
                <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onInit={setReactFlowInstance}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        nodeTypes={nodeTypes as any}
                        fitView
                        className="bg-slate-50"
                        defaultEdgeOptions={{ 
                            style: { strokeWidth: 3, stroke: '#6366f1' },
                            animated: true 
                        }}
                    >
                        <Controls className="bg-white border-2 border-slate-50 shadow-2xl rounded-2xl p-1 overflow-hidden" />
                        <Background 
                            variant={BackgroundVariant.Dots} 
                            gap={24} 
                            size={1} 
                            color="#e2e8f0" 
                        />
                        
                        {/* Header Panel - Aerostic Premium */}
                        <Panel position="top-left" className="m-6">
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white/80 backdrop-blur-xl p-6 rounded-[32px] border-2 border-white shadow-2xl border-slate-50/50"
                            >
                                <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 animate-pulse">
                                         <Activity size={24} strokeWidth={3} />
                                     </div>
                                     <div>
                                         <h3 className="text-sm font-black text-slate-900 tracking-tight lowercase">Flow Orchestrator<span className="text-indigo-600">.</span></h3>
                                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">v2.5 Intelligence Engine</p>
                                     </div>
                                </div>
                            </motion.div>
                        </Panel>

                        {/* Save Panel - High Fidelity */}
                        <Panel position="top-right" className="m-6">
                            <motion.button
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onSave}
                                disabled={saving}
                                className="group flex items-center gap-3 p-1.5 pr-8 bg-[#0F172A] text-white rounded-[24px] hover:shadow-2xl hover:shadow-indigo-500/20 transition-all disabled:opacity-50"
                            >
                                <div className="w-12 h-12 bg-indigo-600 rounded-[18px] flex items-center justify-center shadow-lg group-hover:rotate-90 transition-transform">
                                    {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} strokeWidth={3} />}
                                </div>
                                <div className="flex flex-col items-start translate-y-0.5">
                                    <span className="text-xs font-black uppercase tracking-widest leading-none">Optimize Vector</span>
                                    <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mt-1 shrink-0">Sync to Meta_</span>
                                </div>
                            </motion.button>
                        </Panel>

                        <MiniMap 
                            className="m-6 rounded-[24px] border-2 border-white shadow-2xl overflow-hidden bg-white/40 backdrop-blur-md" 
                            maskColor="rgba(255, 255, 255, 0.4)"
                        />
                    </ReactFlow>
                </div>
                <Sidebar />
            </ReactFlowProvider>
        </div>
    );
}
