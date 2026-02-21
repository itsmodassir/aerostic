export enum CampaignJobType {
  PROCESS_CAMPAIGN = "process_campaign",
  SEND_MESSAGE = "send_message",
}

export interface CampaignJobData {
  campaignId: string;
  tenantId: string;
  batchSize?: number;
}

export interface SendMessageJobData {
  campaignId: string;
  tenantId: string;
  recipientId: string;
  phoneNumber: string;
  templateId: string;
  variables?: Record<string, string>;
}
