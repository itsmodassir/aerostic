import { AutomationService } from './automation.service';
export declare class AutomationController {
    private readonly automationService;
    constructor(automationService: AutomationService);
    createRule(tenantId: string, body: any): Promise<import("./entities/automation-rule.entity").AutomationRule>;
    getRules(tenantId: string): Promise<import("./entities/automation-rule.entity").AutomationRule[]>;
    execute(): Promise<{
        status: string;
    }>;
}
