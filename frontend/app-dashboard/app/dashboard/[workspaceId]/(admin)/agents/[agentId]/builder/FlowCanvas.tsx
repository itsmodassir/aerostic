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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import Sidebar from './Sidebar';
import { TriggerNode, MessageNode, TemplateNode, ConditionNode } from './CustomNodes';
import { Save } from 'lucide-react';

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
const getId = () => `dndnode_${id++}`;

export default function FlowCanvas({ agentId, workspaceId }: FlowCanvasProps) {
    const reactFlowWrapper = useRef(null);
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance<Node, Edge> | null>(null);

    // Fetch existing flow on mount
    useEffect(() => {
        const fetchAgent = async () => {
            try {
                const res = await api.get(`/ai/agent?tenantId=${workspaceId}`);
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

        if (workspaceId) {
            fetchAgent();
        }
    }, [workspaceId, setNodes, setEdges]);

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
                type,
                position,
                data: { label: `${type} node` },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance],
    );

    const onSave = async () => {
        if (reactFlowInstance && agentId && workspaceId) {
            const flow = reactFlowInstance.toObject();
            const toastId = toast.loading('Saving flow configuration...');
            try {
                await api.post(`/ai/agents/${agentId}/flow?tenantId=${workspaceId}`, {
                    nodes: flow.nodes,
                    edges: flow.edges
                });
                toast.success('Flow saved successfully!', { id: toastId });
            } catch (error) {
                console.error('Failed to save flow:', error);
                toast.error('Failed to save API configuration', { id: toastId });
            }
        } else if (!agentId) {
            toast.error('Agent ID is missing');
        }
    };

    return (
        <div className="flex h-screen w-full bg-gray-50">
            <ReactFlowProvider>
                <div className="flex-1 h-full" ref={reactFlowWrapper}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onInit={setReactFlowInstance}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        nodeTypes={nodeTypes}
                        fitView
                        className="bg-gray-50"
                    >
                        <Controls />
                        <Background color="#aaa" gap={16} />
                        <MiniMap />
                        <Panel position="top-right">
                            <button
                                onClick={onSave}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                            >
                                <Save size={16} />
                                Save Flow
                            </button>
                        </Panel>
                    </ReactFlow>
                </div>
                <Sidebar />
            </ReactFlowProvider>
        </div>
    );
}
