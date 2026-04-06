"use client";

import { useCallback, useMemo, useState } from "react";
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
  NodeMouseHandler,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { WaNodeData, NodeKind, WaFlowBuilderProps } from "./types";
import { uid, defaultsByKind, transformSavedFlow, transformFlowToPayload } from "./utils";
import { nodeTypes } from "./NodeComponents";
import { NodeSidebar } from "./NodeSidebar";
import { ConfigPanel } from "./ConfigPanel";
import {
  Save, Loader2, X, Workflow, ChevronLeft
} from "lucide-react";

// ─── Custom animated edge ─────────────────────────────────────────────────────

const edgeOptions = {
  animated: true,
  style: { stroke: "#94a3b8", strokeWidth: 2 },
};

// ─── Main Builder Component ───────────────────────────────────────────────────

export default function WaFlowBuilder({
  flowId,
  flowName: initialName = "Untitled Flow",
  initialData,
  onClose,
  onSaved,
}: WaFlowBuilderProps) {
  const [flowName, setFlowName] = useState(initialName);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { nodes: initNodes, edges: initEdges } = useMemo(
    () => transformSavedFlow(initialData),
    [initialData]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<WaNodeData>>(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedId) || null,
    [nodes, selectedId]
  );

  // ─── Connections ────────────────────────────────────────────────────────────

  const onConnect = useCallback(
    (params: Edge | Connection) =>
      setEdges((eds) => addEdge({ ...params, ...edgeOptions }, eds)),
    [setEdges]
  );

  // ─── Node click ─────────────────────────────────────────────────────────────

  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    setSelectedId(node.id);
  }, []);

  const onPaneClick = useCallback(() => setSelectedId(null), []);

  // ─── Add node ────────────────────────────────────────────────────────────────

  const addNode = useCallback(
    (kind: NodeKind) => {
      const id = uid();
      const defaults = defaultsByKind[kind] || { label: kind };
      const newNode: Node<WaNodeData> = {
        id,
        type: kind,
        position: {
          x: 300 + Math.random() * 60,
          y: 150 + nodes.length * 120,
        },
        data: { ...(defaults as WaNodeData) },
      };
      setNodes((nds) => [...nds, newNode]);
      setSelectedId(id);
    },
    [nodes.length, setNodes]
  );

  // ─── Patch selected ──────────────────────────────────────────────────────────

  const patchSelected = useCallback(
    (patch: Partial<WaNodeData>) => {
      if (!selectedId) return;
      setNodes((nds) =>
        nds.map((n) =>
          n.id === selectedId ? { ...n, data: { ...n.data, ...patch } } : n
        )
      );
    },
    [selectedId, setNodes]
  );

  // ─── Delete selected ─────────────────────────────────────────────────────────

  const deleteNode = useCallback(() => {
    if (!selectedId) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedId));
    setEdges((eds) =>
      eds.filter((e) => e.source !== selectedId && e.target !== selectedId)
    );
    setSelectedId(null);
  }, [selectedId, setNodes, setEdges]);

  // ─── Save ─────────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!flowId) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const payload = {
        name: flowName,
        flowData: transformFlowToPayload(nodes, edges),
      };
      const res = await fetch(`/api/v1/whatsapp/flows/${flowId}/canvas`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Save failed");
      onSaved?.();
    } catch (err: any) {
      setSaveError(err.message || "Could not save flow.");
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 font-sans">
      {/* ── Top Bar ── */}
      <header className="flex items-center h-14 px-4 bg-white border-b border-slate-200 shadow-sm gap-3 shrink-0 z-10">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors px-2 py-1.5 hover:bg-slate-100 rounded-xl"
        >
          <ChevronLeft size={14} />
          Back
        </button>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        <Workflow size={16} className="text-blue-500 shrink-0" />
        <input
          value={flowName}
          onChange={(e) => setFlowName(e.target.value)}
          className="text-sm font-black text-slate-800 bg-transparent border-b-2 border-transparent focus:border-blue-400 focus:outline-none px-1 py-0.5 transition-all min-w-[160px] max-w-[320px]"
        />

        <div className="ml-auto flex items-center gap-2">
          {saveError && (
            <span className="text-[10px] text-red-500 font-black uppercase tracking-widest">
              {saveError}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-60"
          >
            {isSaving ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Save size={13} />
            )}
            {isSaving ? "Saving..." : "Save Flow"}
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X size={16} className="text-slate-400" />
          </button>
        </div>
      </header>

      {/* ── Main Area ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar: Node Library */}
        <NodeSidebar onAddNode={addNode} />

        {/* Canvas */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            defaultEdgeOptions={edgeOptions}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            proOptions={{ hideAttribution: true }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="#e2e8f0"
            />
            <Controls className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden" />
            <MiniMap
              className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden"
              nodeColor="#f1f5f9"
              maskColor="rgba(241,245,249,0.7)"
            />
          </ReactFlow>
        </div>

        {/* Right panel: Config */}
        <div className="w-72 border-l border-slate-200 bg-white overflow-hidden flex flex-col shrink-0 shadow-lg z-10">
          <ConfigPanel
            selected={selectedNode}
            onChange={patchSelected}
            onDelete={deleteNode}
          />
        </div>
      </div>
    </div>
  );
}
