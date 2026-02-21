import { Injectable } from "@nestjs/common";

@Injectable()
export class FeatureExtractorService {
  /**
   * Transforms a raw event or historical snapshot into a numeric feature vector
   * Vector order:
   * [messages, api_calls, failed_ratio, login_freq, geo_change, campaign_ratio, credit_ratio]
   */
  extract(event: any): any {
    return {
      tenant_id: event.tenantId,
      api_key_id: event.metadata?.apiKeyId || event.resourceId,
      message_rate_1m: Number(event.message_rate_1m || 0),
      message_rate_5m: Number(event.message_rate_5m || 0),
      failure_rate: Number(event.failure_rate || 0),
      unique_ips: Number(event.unique_ips || 1),
      geo_entropy: Number(event.geo_entropy || 0),
      avg_response_time: Number(event.avg_response_time || 0),
    };
  }

  /**
   * Helper to normalize values if needed (scaling 0-1)
   */
  normalize(value: number, max: number): number {
    if (max === 0) return 0;
    return Math.min(value / max, 1);
  }
}
