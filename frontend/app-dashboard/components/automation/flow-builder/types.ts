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
  | "set_variable";

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
