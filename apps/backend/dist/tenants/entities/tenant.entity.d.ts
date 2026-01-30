export declare class Tenant {
    id: string;
    name: string;
    plan: string;
    status: string;
    subscriptionStatus: string;
    razorpayCustomerId: string;
    razorpaySubscriptionId: string;
    currentPeriodEnd: Date;
    monthlyMessageLimit: number;
    messagesSentThisMonth: number;
    aiCredits: number;
    aiCreditsUsed: number;
    apiAccessEnabled: boolean;
    webhookUrl: string;
    webhookSecret: string;
    logo: string;
    website: string;
    phone: string;
    createdAt: Date;
    updatedAt: Date;
}
