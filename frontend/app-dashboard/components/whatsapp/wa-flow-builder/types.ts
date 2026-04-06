import { Node, Edge } from "@xyflow/react";

// ─── Node Kinds ──────────────────────────────────────────────────────────────

export type NodeKind =
  // Content nodes
  | "wa_start"
  | "wa_text"
  | "wa_photo"
  | "wa_video"
  | "wa_link"
  | "wa_email"
  | "wa_call"
  // Interactive nodes
  | "wa_question"
  | "wa_mcq"
  | "wa_list"
  // Logic nodes
  | "wa_delay"
  | "wa_condition"
  | "wa_if_else"
  | "wa_set_variable"
  // System nodes
  | "wa_support"
  | "wa_sales"
  | "wa_location"
  | "wa_carousel"
  | "wa_end";

// ─── Node Data ────────────────────────────────────────────────────────────────

export interface MCQOption {
  id: string;
  title: string;
  description?: string;
}

export interface ListSection {
  title: string;
  items: { id: string; title: string; description?: string }[];
}

export interface CarouselCard {
  id: string;
  title: string;
  body?: string;
  mediaUrl?: string;
  buttons: { id: string; text: string; url?: string }[];
}

export interface WaNodeData {
  label: string;
  kind?: NodeKind;

  // Text / general message
  text?: string;

  // Media
  mediaUrl?: string;
  mediaCaption?: string;
  filename?: string;

  // Link / Website
  linkUrl?: string;
  linkTitle?: string;
  linkDescription?: string;
  linkPreviewUrl?: string;

  // Email
  emailTo?: string;
  emailSubject?: string;
  emailBody?: string;

  // Call
  callNumber?: string;

  // Question (open-ended)
  questionText?: string;
  questionSaveAs?: string;
  questionValidator?: "text" | "number" | "email" | "phone" | "none";

  // MCQ (buttons – max 3 buttons per Meta spec)
  mcqBody?: string;
  mcqOptions?: MCQOption[];

  // List (Interactive list message – max 10 items)
  listHeader?: string;
  listBody?: string;
  listFooter?: string;
  listButtonText?: string;
  listSections?: ListSection[];

  // Delay
  waitDuration?: number;
  waitUnit?: "seconds" | "minutes" | "hours" | "days";

  // Condition / If-Else
  conditionVariable?: string;
  conditionOperator?: "equals" | "not_equals" | "contains" | "starts_with" | "greater_than" | "less_than" | "is_set";
  conditionValue?: string;
  keywords?: string[];
  matchType?: "any" | "all";

  // Variable
  variableKey?: string;
  variableValue?: string;

  // Support System
  supportDepartment?: string;
  supportMessage?: string;
  supportEscalate?: boolean;
  supportTicketTag?: string;

  // Sales System
  salesStage?: "lead_capture" | "qualify" | "demo" | "close" | "nurture";
  salesMessage?: string;
  salesProductId?: string;
  salesQuestion?: string;

  // Carousel
  carouselCards?: CarouselCard[];

  // Trigger
  triggerType?: "keyword" | "any_message" | "new_contact" | "campaign_reply";
  triggerKeyword?: string;

  [key: string]: any;
}

export type WaBuilderNode = Node<WaNodeData>;
export type WaBuilderEdge = Edge;

export interface WaFlowBuilderProps {
  flowId?: string;
  flowName?: string;
  initialData?: any;
  onClose: () => void;
  onSaved?: () => void;
}
