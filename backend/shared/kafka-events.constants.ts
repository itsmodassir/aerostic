/**
 * Standardized Kafka Topic and Event Definitions
 * Ensures consistency across Node.js (backend) and Python (ml-service)
 */

export enum KafkaTopic {
    USAGE_EVENTS = 'aerostic.usage.events',
    BILLING_ALERTS = 'aerostic.billing.alerts',
    WHATSAPP_INBOUND = 'aerostic.whatsapp.inbound',
    WHATSAPP_STATUS = 'aerostic.whatsapp.status',
    SYSTEM_HEALTH = 'aerostic.system.health',
    AUDIT_LOGS = 'aerostic.audit.logs',
    ML_ANOMALIES = 'aerostic.ml.anomalies'
}

export enum KafkaEvent {
    // Usage Events
    MESSAGE_SENT = 'message.sent',
    MESSAGE_RECEIVED = 'message.received',
    API_CALL = 'api.call',
    
    // Billing Events
    WALLET_LOW = 'wallet.low',
    RECHARGE_SUCCESS = 'recharge.success',
    
    // ML Events
    ANOMALY_DETECTED = 'anomaly.detected',
    RISK_SCORE_UPDATED = 'risk.score.updated',
    
    // System Events
    SERVICE_UP = 'service.up',
    SERVICE_DOWN = 'service.down',
    
    // Audit Events
    AUDIT_CREATED = 'audit.created'
}

export interface KafkaMessagePayload<T = any> {
    event: KafkaEvent;
    timestamp: string;
    tenantId?: string;
    data: T;
    metadata?: Record<string, any>;
}
