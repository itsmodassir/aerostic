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
  NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useToast } from "../../../hooks/use-toast";
import api from "@/lib/api";

import {
  AutomationFlowBuilderProps,
  BuilderNodeData,
  NodeKind,
} from "./types";
import { uid, defaultsByKind, transformAutomationToFlow } from "./utils";
import { nodeTypes } from "./NodeComponents";
import { CustomEdge } from "./CustomEdge";
import { ConfigPanel } from "./ConfigPanel";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export default function AutomationFlowBuilder({
  automation,
  onClose,
}: AutomationFlowBuilderProps) {
  const { toast } = useToast();

  const [name, setName] = useState<string>(automation?.name || "Untitled Flow");
  const [description, setDescription] = useState<string>(automation?.description || "");
  const [trigger, setTrigger] = useState<string>(automation?.trigger || "message_received");

  const initialFlow = useMemo(() => transformAutomationToFlow(automation), [automation]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialFlow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialFlow.edges);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedId) || null,
    [nodes, selectedId]
  );

  const onConnect = useCallback(
    (params: Edge | Connection) =>
      setEdges((eds) =>
        addEdge({ ...params, animated: true, type: "custom" }, eds)
      ),
    [setEdges]
  );

  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    setSelectedId(node.id);
  }, []);

  const addNode = (kind: NodeKind) => {
    const id = uid();
    const base = defaultsByKind[kind] || { label: kind };

    const newNode: Node<BuilderNodeData> = {
      id,
      type: kind,
      position: { x: 400, y: (nodes.length + 1) * 100 },
      data: { ...(base as BuilderNodeData) },
    };

    setNodes((nds) => [...nds, newNode]);
    setSelectedId(id);
  };

  const deleteNode = () => {
    if (!selectedId) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedId));
    setEdges((eds) =>
      eds.filter((e) => e.source !== selectedId && e.target !== selectedId)
    );
    setSelectedId(null);
  };

  const patchSelected = (patch: Partial<BuilderNodeData>) => {
    if (!selectedId) return;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedId ? { ...n, data: { ...n.data, ...patch } } : n
      )
    );
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your automation.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name,
        description,
        trigger,
        nodes: nodes.map(n => ({
          nodeId: n.id,
          type: n.type,
          position: n.position,
          data: n.data,
        })),
        edges: edges.map(e => ({
          sourceNodeId: e.source,
          targetNodeId: e.target,
          sourceHandle: e.sourceHandle,
          animated: e.animated,
        })),
      };

      if (automation?.id) {
        await api.put(`/v1/new-automation/${automation.id}`, payload);
      } else {
        await api.post('/v1/new-automation', payload);
      }

      toast({
        title: "Success",
        description: "Automation flow saved successfully.",
      });
      onClose();
    } catch (error: any) {
      console.error("Save error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save flow.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const edgeTypes = useMemo(() => ({
    custom: (props: any) => <CustomEdge {...props} setEdges={setEdges} />,
  }), [setEdges]);

  return (
    <div className="h-screen w-full flex bg-slate-50 font-sans">
      <Sidebar onAddNode={addNode} />

      <div className="flex-1 flex flex-col relative">
        <Header
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          trigger={trigger}
          setTrigger={setTrigger}
          onClose={onClose}
          onSave={handleSave}
          isSaving={isSaving}
        />

        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            edgeTypes={edgeTypes}
            fitView
          >
            <Background color="#cbd5e1" gap={20} size={1} />
            <Controls className="bg-white border-slate-200 shadow-sm" />
            <MiniMap 
                className="bg-white border-slate-200 shadow-sm rounded-xl"
                nodeColor="#f8fafc"
                maskColor="rgba(248, 250, 252, 0.7)"
            />
          </ReactFlow>
        </div>
      </div>

      <div className="w-80 border-l border-slate-200 bg-white shadow-xl z-10">
        <ConfigPanel
          selected={selectedNode}
          onChange={patchSelected}
          onDelete={deleteNode}
        />
      </div>
    </div>
  );
}
