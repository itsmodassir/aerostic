import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AutomationService } from "./automation.service";
import { AutomationController } from "./automation.controller";
import { AutomationRule } from "./entities/automation-rule.entity";
import { Workflow } from "./entities/workflow.entity";
import { WorkflowExecution } from "./entities/workflow-execution.entity";
import { WorkflowExecutionLog } from "./entities/workflow-execution-log.entity";
import { WorkflowMemory } from "./entities/workflow-memory.entity";
import { WorkflowsService } from "./workflows.service";
import { WorkflowRunnerService } from "./workflow-runner.service";
import { VariableResolverService } from "./variable-resolver.service";
import { WorkflowExecutionService } from "./workflow-execution.service";
import { DAGTraversalService } from "./dag-traversal.service";
import { WorkflowsController } from "./workflows.controller";
import { MessagesModule } from "../messages/messages.module";
import { AuditModule } from "../audit/audit.module";
import { AiModule } from "../ai/ai.module";
import { ContactsModule } from "../contacts/contacts.module";
import { EmailModule } from "../email/email.module";
import { GoogleModule } from "../google/google.module";
import { AutomationWebhooksController } from "./webhooks.controller";
import { ApiRequestExecutor } from "./executors/api-request.executor";
import { ActionExecutor } from "./executors/action.executor";
import { EmailExecutor } from "./executors/email.executor";
import { ConditionExecutor } from "./executors/condition.executor";
import { GeminiExecutor } from "./executors/gemini.executor";
import { LeadUpdateExecutor } from "./executors/lead-update.executor";
import { MemoryExecutor } from "./executors/memory.executor";
import { KnowledgeExecutor } from "./executors/knowledge.executor";
import { AutomationGateway } from "./automation.gateway";

import { WorkflowVersion } from "./entities/workflow-version.entity";
import { AutomationExecution } from "./entities/automation-execution.entity";
import { EmailTemplate } from "./entities/email-template.entity";
import { Mailbox } from "@shared/database/entities/core/mailbox.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AutomationRule,
      Workflow,
      WorkflowExecution,
      WorkflowExecutionLog,
      WorkflowMemory,
      WorkflowVersion,
      AutomationExecution,
      EmailTemplate,
      Mailbox,
    ]),
    MessagesModule,
    AuditModule,
    AiModule,
    ContactsModule,
    EmailModule,
    GoogleModule,
  ],
  controllers: [
    AutomationController,
    WorkflowsController,
    AutomationWebhooksController,
  ],
  providers: [
    AutomationService,
    WorkflowsService,
    WorkflowRunnerService,
    VariableResolverService,
    ApiRequestExecutor,
    ActionExecutor,
    EmailExecutor,
    ConditionExecutor,
    GeminiExecutor,
    LeadUpdateExecutor,
    WorkflowExecutionService,
    DAGTraversalService,
    MemoryExecutor,
    KnowledgeExecutor,
    AutomationGateway,
  ],
  exports: [
    AutomationService,
    WorkflowsService,
    WorkflowRunnerService,
    VariableResolverService,
    ApiRequestExecutor,
    ActionExecutor,
    EmailExecutor,
    ConditionExecutor,
    GeminiExecutor,
    LeadUpdateExecutor,
    WorkflowExecutionService,
    DAGTraversalService,
    MemoryExecutor,
    KnowledgeExecutor,
    AutomationGateway,
  ],
})
export class AutomationModule { }
