import { Tenant } from '../../tenants/entities/tenant.entity';
export declare enum AgentType {
    CUSTOMER_SUPPORT = "customer_support",
    SALES = "sales",
    LEAD_FOLLOWUP = "lead_followup",
    FAQ = "faq",
    CUSTOM = "custom"
}
export declare class AiAgent {
    id: string;
    tenantId: string;
    tenant: Tenant;
    name: string;
    description: string;
    type: AgentType;
    systemPrompt: string;
    welcomeMessage: string;
    fallbackMessage: string;
    confidenceThreshold: number;
    maxContextMessages: number;
    model: string;
    temperature: number;
    maxTokens: number;
    isActive: boolean;
    handoffEnabled: boolean;
    handoffKeywords: string[];
    businessHoursOnly: boolean;
    knowledgeBase: string;
    sampleConversations: string;
    totalConversations: number;
    successfulResolutions: number;
    handoffsTriggered: number;
    avgResponseTimeMs: number;
    createdAt: Date;
    updatedAt: Date;
}
