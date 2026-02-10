import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AutomationRule } from './entities/automation-rule.entity';
import { MessagesService } from '../messages/messages.service';

@Injectable()
export class AutomationService {
  constructor(
    @InjectRepository(AutomationRule)
    private ruleRepo: Repository<AutomationRule>,
    private messagesService: MessagesService,
  ) {}

  async createRule(tenantId: string, ruleData: Partial<AutomationRule>) {
    const rule = this.ruleRepo.create({ ...ruleData, tenantId });
    return this.ruleRepo.save(rule);
  }

  async getRules(tenantId: string) {
    return this.ruleRepo.find({ where: { tenantId } });
  }

  async evaluate(
    tenantId: string,
    from: string,
    messageBody: string,
  ): Promise<boolean> {
    // 1. Fetch active rules for tenant
    const rules = await this.ruleRepo.find({
      where: { tenantId, isActive: true },
    });

    for (const rule of rules) {
      let match = false;
      const lowerMsg = messageBody.toLowerCase();
      const lowerKey = rule.keyword.toLowerCase();

      if (rule.trigger === 'keyword') {
        if (rule.condition === 'contains' && lowerMsg.includes(lowerKey))
          match = true;
        if (rule.condition === 'exact' && lowerMsg === lowerKey) match = true;
      }

      if (match) {
        await this.executeAction(tenantId, from, rule);
        return true; // Use handled it
      }
    }
    return false; // No rule handled it
  }

  private async executeAction(
    tenantId: string,
    to: string,
    rule: AutomationRule,
  ) {
    if (rule.action === 'reply') {
      await this.messagesService.send({
        tenantId,
        to,
        type: 'text',
        payload: { text: rule.payload.text },
      });
    }
  }
}
