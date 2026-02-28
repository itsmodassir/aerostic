/**
 * Centralized Queue Names for Aimstors Solution Platform
 */

export const CAMPAIGN_QUEUE = "campaign_queue";
export const AUTOMATION_QUEUE = "automation_queue";
export const AI_QUEUE = "ai_queue";
export const WEBHOOK_QUEUE = "webhook_queue";
export const USAGE_AGGREGATION_QUEUE = "usage_aggregation_queue";
export const METRICS_QUEUE = "metrics_queue";
export const ANOMALY_QUEUE = "anomaly_queue";

export const QUEUES = [
  CAMPAIGN_QUEUE,
  AUTOMATION_QUEUE,
  AI_QUEUE,
  WEBHOOK_QUEUE,
  USAGE_AGGREGATION_QUEUE,
  METRICS_QUEUE,
  ANOMALY_QUEUE,
] as const;
