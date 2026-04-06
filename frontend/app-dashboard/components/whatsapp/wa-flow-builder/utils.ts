import { Node, Edge } from "@xyflow/react";
import { WaNodeData, NodeKind, WaBuilderNode, MCQOption, ListSection, CarouselCard } from "./types";

export const uid = () =>
  `n_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

// ─── Defaults per Node Kind ──────────────────────────────────────────────────

export const defaultsByKind: Record<string, Partial<WaNodeData>> = {
  wa_start: {
    kind: "wa_start",
    label: "Start",
    triggerType: "keyword",
    triggerKeyword: "",
  },
  wa_text: {
    kind: "wa_text",
    label: "Text Message",
    text: "",
  },
  wa_photo: {
    kind: "wa_photo",
    label: "Send Photo",
    mediaUrl: "",
    mediaCaption: "",
  },
  wa_video: {
    kind: "wa_video",
    label: "Send Video",
    mediaUrl: "",
    mediaCaption: "",
  },
  wa_link: {
    kind: "wa_link",
    label: "Share Link",
    linkUrl: "",
    linkTitle: "",
    linkDescription: "",
  },
  wa_email: {
    kind: "wa_email",
    label: "Send Email",
    emailTo: "",
    emailSubject: "",
    emailBody: "",
  },
  wa_call: {
    kind: "wa_call",
    label: "Initiate Call",
    callNumber: "",
  },
  wa_question: {
    kind: "wa_question",
    label: "Ask Question",
    questionText: "",
    questionSaveAs: "user_reply",
    questionValidator: "none",
  },
  wa_mcq: {
    kind: "wa_mcq",
    label: "Multiple Choice",
    mcqBody: "",
    mcqOptions: [
      { id: uid(), title: "Option 1" },
      { id: uid(), title: "Option 2" },
    ],
  },
  wa_list: {
    kind: "wa_list",
    label: "Interactive List",
    listHeader: "",
    listBody: "",
    listFooter: "",
    listButtonText: "View Options",
    listSections: [
      {
        title: "Section 1",
        items: [{ id: uid(), title: "Item 1", description: "" }],
      },
    ],
  },
  wa_delay: {
    kind: "wa_delay",
    label: "Wait / Delay",
    waitDuration: 1,
    waitUnit: "minutes",
  },
  wa_condition: {
    kind: "wa_condition",
    label: "Keyword Check",
    keywords: [],
    matchType: "any",
  },
  wa_if_else: {
    kind: "wa_if_else",
    label: "If / Else",
    conditionVariable: "{{user_reply}}",
    conditionOperator: "equals",
    conditionValue: "",
  },
  wa_set_variable: {
    kind: "wa_set_variable",
    label: "Set Variable",
    variableKey: "",
    variableValue: "",
  },
  wa_support: {
    kind: "wa_support",
    label: "Support Ticket",
    supportDepartment: "General",
    supportMessage: "A support agent will be with you shortly.",
    supportEscalate: false,
    supportTicketTag: "support",
  },
  wa_sales: {
    kind: "wa_sales",
    label: "Sales Step",
    salesStage: "lead_capture",
    salesMessage: "",
  },
  wa_location: {
    kind: "wa_location",
    label: "Request Location",
    text: "Please share your location.",
  },
  wa_carousel: {
    kind: "wa_carousel",
    label: "Carousel",
    carouselCards: [
      {
        id: uid(),
        title: "Card 1",
        subtitle: "",
        imageUrl: "",
        buttons: [{ id: uid(), text: "Learn More" }],
      },
    ],
  },
  wa_end: {
    kind: "wa_end",
    label: "End Flow",
  },
};

// ─── Transform saved flow data back to React Flow format ─────────────────────

export function transformSavedFlow(savedData: any): {
  nodes: Node<WaNodeData>[];
  edges: Edge[];
} {
  if (!savedData?.nodes?.length) {
    return {
      nodes: [
        {
          id: "start",
          type: "wa_start",
          position: { x: 300, y: 80 },
          data: { ...(defaultsByKind.wa_start as WaNodeData) },
        },
      ],
      edges: [],
    };
  }

  const nodes: Node<WaNodeData>[] = savedData.nodes.map((n: any) => ({
    id: n.nodeId || n.id,
    type: n.type,
    position: n.position || { x: 300, y: 150 },
    data: { ...n.data, label: n.data?.label || n.type },
  }));

  const edges: Edge[] = (savedData.edges || []).map((e: any) => ({
    id: e.id || `e-${e.source || e.sourceNodeId}-${e.target || e.targetNodeId}`,
    source: e.source || e.sourceNodeId,
    target: e.target || e.targetNodeId,
    sourceHandle: e.sourceHandle,
    animated: e.animated !== false,
    type: "wa_edge",
  }));

  return { nodes, edges };
}

// ─── Convert React Flow state to API payload ──────────────────────────────────

export function transformFlowToPayload(
  nodes: Node<WaNodeData>[],
  edges: Edge[]
) {
  return {
    nodes: nodes.map((n) => ({
      nodeId: n.id,
      type: n.type,
      position: n.position,
      data: n.data,
    })),
    edges: edges.map((e) => ({
      id: e.id,
      sourceNodeId: e.source,
      targetNodeId: e.target,
      sourceHandle: e.sourceHandle,
      animated: e.animated,
    })),
  };
}
