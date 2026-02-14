import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutomationService } from './automation.service';
import { AutomationController } from './automation.controller';
import { AutomationRule } from './entities/automation-rule.entity';
import { Workflow } from './entities/workflow.entity';
import { WorkflowsService } from './workflows.service';
import { WorkflowsController } from './workflows.controller';
import { MessagesModule } from '../messages/messages.module';
import { AuditModule } from '../audit/audit.module';
import { AiModule } from '../ai/ai.module';
import { ContactsModule } from '../contacts/contacts.module';
import { EmailModule } from '../email/email.module';
import { GoogleModule } from '../google/google.module';
import { AutomationWebhooksController } from './webhooks.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([AutomationRule, Workflow]),
    MessagesModule,
    AuditModule,
    AiModule,
    ContactsModule,
    EmailModule,
    GoogleModule,
  ],
  controllers: [AutomationController, WorkflowsController, AutomationWebhooksController],
  providers: [AutomationService, WorkflowsService],
  exports: [AutomationService, WorkflowsService],
})
export class AutomationModule { }

