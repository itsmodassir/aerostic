import { Module, Logger } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
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
import { EmailTemplatesController } from "./email-templates.controller";
import { EmailTemplatesService } from "./email-templates.service";
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
import { BrowserAgentExecutor } from "./executors/browser-agent.executor";
import { AutomationGateway } from "./automation.gateway";

import { WorkflowVersion } from "./entities/workflow-version.entity";
import { AutomationExecution } from "./entities/automation-execution.entity";
import { EmailTemplate } from "./entities/email-template.entity";
import { Mailbox } from "@shared/database/entities/core/mailbox.entity";
import { FlowAutomation } from "./entities/flow/flow-automation.entity";
import { FlowNode } from "./entities/flow/flow-node.entity";
import { FlowEdge } from "./entities/flow/flow-edge.entity";
import { FlowExecution } from "./entities/flow/flow-execution.entity";
import { FlowExecutionLog } from "./entities/flow/flow-execution-log.entity";
import { FlowAutomationService } from "./flow-automation.service";
import { FlowAutomationsController } from "./flow-automations.controller";
import {
  AutomationFlow,
  AutomationNode,
  AutomationEdge,
  AutomationExecution as NewAutomationExecution,
  AutomationExecutionLog as NewAutomationExecutionLog,
} from "@shared/database/entities/core/automation-flow.entity";
import { NewAutomationService } from "@api/automation/new-automation.service";
import { NewAutomationController } from "@api/automation/new-automation.controller";

import { WaitExecutor } from "./executors/wait.executor";
import { WorkflowResumeProcessor } from "./workflow-resume.processor";

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
      FlowAutomation,
      FlowNode,
      FlowEdge,
      FlowExecution,
      FlowExecutionLog,
      AutomationFlow,
      AutomationNode,
      AutomationEdge,
      NewAutomationExecution,
      NewAutomationExecutionLog,
    ]),
    BullModule.registerQueue({
      name: "workflow-resume",
    }),
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
    EmailTemplatesController,
    AutomationWebhooksController,
    FlowAutomationsController,
    NewAutomationController,
  ],
  providers: [
    AutomationService,
    WorkflowsService,
    EmailTemplatesService,
    WorkflowRunnerService,
    VariableResolverService,
    ApiRequestExecutor,
    ActionExecutor,
    EmailExecutor,
    ConditionExecutor,
    GeminiExecutor,
    LeadUpdateExecutor,
    WaitExecutor,
    WorkflowExecutionService,
    WorkflowResumeProcessor,
    DAGTraversalService,
    MemoryExecutor,
    KnowledgeExecutor,
    BrowserAgentExecutor,
    AutomationGateway,
    FlowAutomationService,
    NewAutomationService,
  ],
  exports: [
    AutomationService,
    WorkflowsService,
    EmailTemplatesService,
    WorkflowRunnerService,
    VariableResolverService,
    ApiRequestExecutor,
    ActionExecutor,
    EmailExecutor,
    ConditionExecutor,
    GeminiExecutor,
    LeadUpdateExecutor,
    WaitExecutor,
    WorkflowExecutionService,
    WorkflowResumeProcessor,
    DAGTraversalService,
    MemoryExecutor,
    KnowledgeExecutor,
    BrowserAgentExecutor,
    AutomationGateway,
    FlowAutomationService,
    NewAutomationService,
  ],
})
export class AutomationModule { }
