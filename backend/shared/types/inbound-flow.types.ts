export enum WebhookJobType {
  PROCESS_RAW_WEBHOOK = "process_raw_webhook",
}

export enum AutomationJobType {
  TRIGGER_WORKFLOW = "trigger_workflow",
}

export enum AiJobType {
  GENERATE_RESPONSE = "generate_response",
}

export interface WebhookPayloadData {
  provider: "meta" | "manual";
  payload: any;
  receivedAt: string;
}

export interface AutomationTriggerData {
  tenantId: string;
  conversationId: string;
  messageId: string;
  body: string;
  metadata: any;
}
