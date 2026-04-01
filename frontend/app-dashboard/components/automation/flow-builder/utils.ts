import { Node, Edge } from "@xyflow/react";
import { BuilderNodeData, NodeKind } from "./types";

export const uid = () =>
  `node_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const defaultsByKind: Record<string, Partial<BuilderNodeData>> = {
  trigger: { kind: "trigger", label: "Trigger: Message Received", trigger: "message_received" },
  conditions: {
    kind: "conditions",
    label: "Conditions",
    conditionType: "keyword",
    keywords: [],
    matchType: "any",
  },
  custom_reply: {
    kind: "custom_reply",
    label: "Send Message",
    message: "",
  },
  set_variable: {
    kind: "set_variable",
    label: "Set Variable",
    key: "",
    value: "",
  },
  delay: {
    kind: "delay",
    label: "Delay",
    waitDuration: 1,
    waitUnit: "minutes",
  },
  end: { kind: "end", label: "End Flow" },
  photo: { kind: "photo", label: "Send Photo", message: "", mediaUrl: "" },
  video: { kind: "video", label: "Send Video", message: "", mediaUrl: "" },
  doc: { kind: "doc", label: "Send Document", message: "", mediaUrl: "", filename: "attachment.pdf" },
  if_else: { kind: "if_else", label: "If / Else", variable: "{{trigger.body}}", operator: "equals", value: "" },
};

export function transformAutomationToFlow(automation: any): {
  nodes: Node<BuilderNodeData>[];
  edges: Edge[];
} {
  if (!automation || !automation.nodes) {
    return {
      nodes: [
        {
          id: "start",
          type: "trigger",
          position: { x: 250, y: 50 },
          data: { ...(defaultsByKind.trigger as BuilderNodeData) },
        },
      ],
      edges: [],
    };
  }

  const nodes: Node<BuilderNodeData>[] = (automation.nodes || []).map((node: any) => ({
    id: node.nodeId,
    type: node.type,
    position: node.position || { x: 250, y: 150 },
    data: { ...node.data, label: node.data.label || node.type },
  }));

  const edges: Edge[] = (automation.edges || []).map((edge: any) => ({
    id: edge.id || `e-${edge.sourceNodeId}-${edge.targetNodeId}-${edge.sourceHandle || 'default'}`,
    source: edge.sourceNodeId,
    target: edge.targetNodeId,
    sourceHandle: edge.sourceHandle,
    animated: edge.animated !== false,
    type: "custom",
  }));

  return { nodes, edges };
}
