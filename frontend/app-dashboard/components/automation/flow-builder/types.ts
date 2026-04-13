import { Node, Edge } from "@xyflow/react";

export type NodeKind =
  | "trigger"
  | "custom_reply"
  | "action"
  | "condition"
  | "conditions"
  | "delay"
  | "end"
  | "user_reply"
  | "send_template"
  | "send_message"
  | "set_variable"
  | "photo"
  | "video"
  | "doc"
  | "if_else"
  | "browser_agent"
  | "whatsapp_flow"
  | "list_message"
  | "template"
  | "ai_agent";

export interface BuilderNodeData {
  label: string;
  kind?: NodeKind;
  message?: string;
  imageFile?: any;
  videoFile?: any;
  audioFile?: any;
  documentFile?: any;
  imagePreview?: string;
  videoPreview?: string;
  audioPreview?: string;
  documentPreview?: string;
  variableName?: string;
  variableValue?: string;
  condition?: string;
  operator?: string;
  value?: string;
  templateId?: string;
  templateName?: string;
  templateMeta?: any;
  variableMapping?: Record<string, string>;
  headerImageId?: string;
  waitDuration?: number;
  waitUnit?: "minutes" | "hours" | "days";
  taskPrompt?: string;
  buttons?: Array<{ id: string, text: string, type: 'reply' | 'url', url?: string }>;
  
  // New Interactive Properties
  listSections?: Array<{ id: string, title: string, rows: Array<{ id: string, title: string, description?: string }> }>;
  listButton?: string;
  metaFlowId?: string;
  flowCTA?: string;
  flowInitialScreen?: string;
  aiPrompt?: string;
  aiModel?: string;

  [key: string]: any;
}

export type BuilderNode = Node<BuilderNodeData>;
export type BuilderEdge = Edge;

export interface Template {
  id: string;
  name: string;
  category: string;
  language: string;
  status: string;
  components: any[];
}

export interface Member {
  id: string;
  name: string;
  email: string;
}

export interface AutomationFlowBuilderProps {
  automation?: any;
  channelId?: string;
  onClose: () => void;
  onDraftSaved?: () => void;
}
