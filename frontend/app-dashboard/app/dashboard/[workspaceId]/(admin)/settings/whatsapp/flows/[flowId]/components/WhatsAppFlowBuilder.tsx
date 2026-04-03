"use client";

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
  Connection,
  Edge,
  Node,
  ReactFlowInstance,
  OnNodesDelete,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { WhatsAppFlowJSON, ScreenNodeData, WhatsAppFlowNode, WhatsAppFlowEdge, FlowComponent } from "./types";
import { flowToNodes, nodesToFlow, uid } from "./utils";
import ScreenNode from "./ScreenNode";
import FlowSidebar from "./FlowSidebar";
import PropertiesPanel from "./PropertiesPanel";
import { Save, Play, Code, Layout, RefreshCw, Smartphone } from "lucide-react";

const nodeTypes = {
  screen: ScreenNode,
};

interface WhatsAppFlowBuilderProps {
  flowData: WhatsAppFlowJSON;
  onSave: (updatedFlow: WhatsAppFlowJSON) => void;
  onToggleCode: () => void;
}

export default function WhatsAppFlowBuilder({ flowData, onSave, onToggleCode }: WhatsAppFlowBuilderProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const initial = useMemo(() => flowToNodes(flowData), [flowData]);
  const [nodes, setNodes, onNodesChange] = useNodesState<WhatsAppFlowNode>(initial.nodes as WhatsAppFlowNode[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedId) || null,
    [nodes, selectedId]
  );

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge({ ...params, animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } }, eds)
      ),
    [setEdges]
  );

  const onNodeClick = useCallback((_: any, node: WhatsAppFlowNode) => {
    setSelectedId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedId(null);
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      if (type === 'Screen') {
        const id = `SCREEN_${nodes.length + 1}`;
        const newNode: WhatsAppFlowNode = {
          id,
          type: 'screen',
          position,
          data: {
            id,
            title: `Screen ${nodes.length + 1}`,
            components: [],
          },
        };
        setNodes((nds) => [...nds, newNode]);
      } else {
        // Drop component into selected node or nearest node
        if (selectedId) {
            const componentType = type as any;
            const newComp: FlowComponent = { type: componentType, label: `New ${type}` };
            setNodes((nds) =>
                nds.map((n) =>
                    n.id === selectedId 
                        ? { ...n, data: { ...n.data, components: [...(n.data.components as FlowComponent[] || []), newComp] } } 
                        : n
                ) as WhatsAppFlowNode[]
            );
        }
      }
    },
    [reactFlowInstance, nodes, selectedId]
  );

  const patchSelected = (id: string, patch: Partial<ScreenNodeData>) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...patch } } : n
      )
    );
  };

  const deleteNode = (id: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    setSelectedId(null);
  };

  const handleSave = () => {
    const updatedFlow = nodesToFlow(nodes as WhatsAppFlowNode[], edges, flowData);
    onSave(updatedFlow);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-50 font-sans">
      <FlowSidebar />

      <div className="flex-1 flex flex-col relative overflow-hidden" ref={reactFlowWrapper}>
        <div className="flex-1">
          <ReactFlow
            nodes={nodes as any}
            edges={edges}
            onNodesChange={onNodesChange as any}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes as any}
            onNodeClick={onNodeClick as any}
            onPaneClick={onPaneClick}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
            className="bg-slate-50"
          >
            <Background color="#e2e8f0" gap={24} size={1} />
            
            <Panel position="top-right" className="flex gap-2">
                <button 
                    onClick={onToggleCode}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 shadow-sm transition-all"
                >
                    <Code size={14} />
                    <span>JSON Editor</span>
                </button>
                <button 
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 border border-blue-700 rounded-xl text-xs font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                >
                    <Save size={14} />
                    <span>Save Flow</span>
                </button>
            </Panel>

            <Controls className="bg-white border-slate-200 shadow-sm rounded-xl overflow-hidden" />
            <MiniMap 
                className="bg-white border-slate-200 shadow-sm rounded-xl"
                nodeColor={(n) => {
                    if (n.id === 'WELCOME') return '#14b8a6';
                    return '#f8fafc';
                }}
                maskColor="rgba(248, 250, 252, 0.7)"
            />
          </ReactFlow>
        </div>
      </div>

      <PropertiesPanel 
        selectedNode={selectedNode} 
        onChange={patchSelected}
        onDelete={deleteNode}
      />
    </div>
  );
}
