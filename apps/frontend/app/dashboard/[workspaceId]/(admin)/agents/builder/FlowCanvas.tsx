'use client';

import React, { useState, useCallback, useRef } from 'react';
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

const initialNodes = [
    {
        id: 'trigger-1',
        type: 'TriggerNode',
        position: { x: 250, y: 5 },
        data: { label: 'Incoming Message' },
    },
];

let id = 0;
const getId = () => `dndnode_${id++}`;

export default function FlowCanvas() {
    const reactFlowWrapper = useRef(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [],
    );

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event) => {
            event.preventDefault();

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

    const onSave = () => {
        if (reactFlowInstance) {
            const flow = reactFlowInstance.toObject();
            console.log('Flow saved:', flow);
            // TODO: Send to backend (AgentsService)
            alert('Flow configuration logged to console (Backend integration pending)');
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
