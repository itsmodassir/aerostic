import { Repository } from 'typeorm';
import { AutomationRule } from './entities/automation-rule.entity';
import { MessagesService } from '../messages/messages.service';
export declare class AutomationService {
    private ruleRepo;
    private messagesService;
    constructor(ruleRepo: Repository<AutomationRule>, messagesService: MessagesService);
    createRule(tenantId: string, ruleData: Partial<AutomationRule>): Promise<AutomationRule>;
    getRules(tenantId: string): Promise<AutomationRule[]>;
    evaluate(tenantId: string, from: string, messageBody: string): Promise<boolean>;
    private executeAction;
}
