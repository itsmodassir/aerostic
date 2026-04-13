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
  Save, Loader2, X, Workflow, ChevronLeft, Upload, Download, Send, Code2, RotateCcw
} from "lucide-react";
import api from "@/lib/api";

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
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<"idle" | "success" | "error">("idle");
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [jsonDraft, setJsonDraft] = useState("");
  const [generatedJson, setGeneratedJson] = useState("");
  const [hasCustomJsonOverride, setHasCustomJsonOverride] = useState(false);
  const [isJsonBusy, setIsJsonBusy] = useState(false);

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

  const loadJsonEditor = useCallback(async () => {
    if (!flowId) return;
    setIsJsonBusy(true);
    try {
      const response = await api.get(`/whatsapp/flows/${flowId}/json`);
      setGeneratedJson(JSON.stringify(response.data?.generatedJson || {}, null, 2));
      setJsonDraft(JSON.stringify(response.data?.activeJson || {}, null, 2));
      setHasCustomJsonOverride(Boolean(response.data?.hasCustomOverride));
      setIsJsonModalOpen(true);
    } catch (err: any) {
      setSaveError(err.response?.data?.message || err.message || "Could not load flow JSON.");
      setPublishStatus("error");
    } finally {
      setIsJsonBusy(false);
    }
  }, [flowId]);

  const handleSaveJsonOverride = async () => {
    if (!flowId) return;
    setIsJsonBusy(true);
    setSaveError(null);
    try {
      const response = await api.put(`/whatsapp/flows/${flowId}/json`, {
        json: jsonDraft,
        useCustomOverride: true,
      });
      const activeJson = response.data?.activeJson || JSON.parse(jsonDraft);
      setJsonDraft(JSON.stringify(activeJson, null, 2));
      setHasCustomJsonOverride(Boolean(response.data?.hasCustomOverride));
    } catch (err: any) {
      setSaveError(err.response?.data?.message || err.message || "Could not save flow JSON.");
      setPublishStatus("error");
    } finally {
      setIsJsonBusy(false);
    }
  };

  const handleResetJsonOverride = async () => {
    if (!flowId) return;
    setIsJsonBusy(true);
    setSaveError(null);
    try {
      const response = await api.delete(`/whatsapp/flows/${flowId}/json`);
      setJsonDraft(JSON.stringify(response.data?.activeJson || {}, null, 2));
      setGeneratedJson(JSON.stringify(response.data?.activeJson || {}, null, 2));
      setHasCustomJsonOverride(false);
    } catch (err: any) {
      setSaveError(err.response?.data?.message || err.message || "Could not reset flow JSON.");
      setPublishStatus("error");
    } finally {
      setIsJsonBusy(false);
    }
  };

  const handleSave = async (options?: { closeAfterSave?: boolean }) => {
    if (!flowId) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const payload = {
        name: flowName,
        flowData: transformFlowToPayload(nodes, edges),
      };
      const response = await api.put(`/whatsapp/flows/${flowId}/canvas`, payload);
      if (response.data?.metaValidation?.ok === false) {
        const validationMessage =
          response.data?.metaValidation?.message || "Flow JSON validation failed on Meta.";
        setSaveError(validationMessage);
        setPublishStatus("error");
      }
      if (options?.closeAfterSave !== false) {
        onSaved?.();
      }
      return response.data;
    } catch (err: any) {
      setSaveError(err.response?.data?.message || err.message || "Could not save flow.");
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Publish ──────────────────────────────────────────────────────────────────

  const handlePublish = async () => {
    if (!flowId) return;
    setIsPublishing(true);
    setPublishStatus("idle");
    setSaveError(null);
    try {
      // 1. First Save
      const saveResult = await handleSave({ closeAfterSave: false });
      if (saveResult?.metaValidation?.ok === false) {
        setSaveError(saveResult?.metaValidation?.message || "Flow JSON validation failed on Meta.");
        setPublishStatus("error");
        return;
      }
      
      // 2. Then Publish
      await api.post(`/whatsapp/flows/${flowId}/publish`);
      
      setPublishStatus("success");
      onSaved?.();
    } catch (err: any) {
      setSaveError(err.response?.data?.message || err.message || "Meta Rejection: Please verify flow structure.");
      setPublishStatus("error");
    } finally {
      setIsPublishing(false);
    }
  };

  // ─── Import/Export ────────────────────────────────────────────────────────────

  const handleExport = () => {
    const data = {
      name: flowName,
      nodes,
      edges,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${flowName.replace(/\s+/g, "_")}_flow.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        if (data.nodes && data.edges) {
          setNodes(data.nodes);
          setEdges(data.edges);
          if (data.name) setFlowName(data.name);
        }
      } catch (err) {
        alert("Invalid flow JSON file");
      }
    };
    reader.readAsText(file);
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
            <div className="flex flex-col items-end mr-2">
              <span className="text-[9px] text-red-500 font-black uppercase tracking-widest leading-none">
                {publishStatus === "error" ? "Publish Failed" : "Save Failed"}
              </span>
              <span className="text-[8px] text-red-400 font-medium max-w-[200px] truncate">
                {saveError}
              </span>
            </div>
          )}
          
          {publishStatus === "success" && (
            <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mr-2">
              ✓ Published to Meta
            </span>
          )}

          <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 mr-2">
            <button
               onClick={handleExport}
               className="p-1.5 hover:bg-white rounded-lg transition-all text-slate-500 hover:text-blue-600"
               title="Export JSON"
            >
              <Download size={14} />
            </button>
            <label className="p-1.5 hover:bg-white rounded-lg transition-all text-slate-500 hover:text-blue-600 cursor-pointer">
              <Upload size={14} />
              <input type="file" className="hidden" onChange={handleImport} accept=".json" />
            </label>
            <button
              onClick={() => void loadJsonEditor()}
              disabled={isJsonBusy}
              className="p-1.5 hover:bg-white rounded-lg transition-all text-slate-500 hover:text-blue-600 disabled:opacity-60"
              title="Show / edit Meta Flow JSON"
            >
              {isJsonBusy ? <Loader2 size={14} className="animate-spin" /> : <Code2 size={14} />}
            </button>
          </div>

          <button
            onClick={() => {
              void handleSave();
            }}
            disabled={isSaving || isPublishing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors disabled:opacity-60"
          >
            {isSaving ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Save size={12} />
            )}
            {isSaving ? "Saving..." : "Save Draft"}
          </button>

          <button
            onClick={handlePublish}
            disabled={isPublishing || isSaving}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-60"
          >
            {isPublishing ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Send size={12} />
            )}
            {isPublishing ? "Publishing..." : "Publish to Meta"}
          </button>

          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors ml-2"
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

      {isJsonModalOpen && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/35 backdrop-blur-sm p-4">
          <div className="w-full max-w-5xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-800">Meta Flow JSON</p>
                <p className="text-[11px] text-slate-500 font-medium mt-1">
                  Review the generated JSON or save a custom override for publish.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {hasCustomJsonOverride && (
                  <span className="rounded-full bg-amber-50 border border-amber-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-amber-700">
                    Custom JSON Active
                  </span>
                )}
                <button
                  onClick={() => setIsJsonModalOpen(false)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-white hover:text-slate-700 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <div className="border-b lg:border-b-0 lg:border-r border-slate-200">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Generated JSON</p>
                </div>
                <textarea
                  readOnly
                  value={generatedJson}
                  className="h-[480px] w-full resize-none border-0 bg-slate-50 p-4 font-mono text-[12px] leading-6 text-slate-600 focus:outline-none"
                />
              </div>

              <div>
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Active / Editable JSON</p>
                </div>
                <textarea
                  value={jsonDraft}
                  onChange={(e) => setJsonDraft(e.target.value)}
                  className="h-[480px] w-full resize-none border-0 bg-white p-4 font-mono text-[12px] leading-6 text-slate-700 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
              <p className="text-[11px] text-slate-500 font-medium">
                Publish uses the custom JSON when saved here; otherwise it uses the generated JSON.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => void handleResetJsonOverride()}
                  disabled={isJsonBusy}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 disabled:opacity-60"
                >
                  <RotateCcw size={12} />
                  Reset
                </button>
                <button
                  onClick={() => void handleSaveJsonOverride()}
                  disabled={isJsonBusy}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {isJsonBusy ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                  Save JSON
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
