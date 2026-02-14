import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workflow } from './entities/workflow.entity';
import { WorkflowExecution, ExecutionStatus } from './entities/workflow-execution.entity';
import { WorkflowExecutionLog, NodeExecutionStatus } from './entities/workflow-execution-log.entity';
import { WorkflowMemory } from './entities/workflow-memory.entity';
import { VariableResolverService } from './variable-resolver.service';
import { MessagesService } from '../messages/messages.service';
import { AutomationGateway } from './automation.gateway';
import { ApiRequestExecutor } from './executors/api-request.executor';
import { ActionExecutor } from './executors/action.executor';
import { ConditionExecutor } from './executors/condition.executor';
import { GeminiExecutor } from './executors/gemini.executor';
import { LeadUpdateExecutor } from './executors/lead-update.executor';
import { MemoryExecutor } from './executors/memory.executor';
import { KnowledgeExecutor } from './executors/knowledge.executor';
import { DAGTraversalService } from './dag-traversal.service';

@Injectable()
export class WorkflowRunnerService {
    private readonly logger = new Logger(WorkflowRunnerService.name);

    constructor(
        @InjectRepository(Workflow)
        private workflowRepo: Repository<Workflow>,
        @InjectRepository(WorkflowExecution)
        private executionRepo: Repository<WorkflowExecution>,
        @InjectRepository(WorkflowExecutionLog)
        private logRepo: Repository<WorkflowExecutionLog>,
        @InjectRepository(WorkflowMemory)
        private memoryRepo: Repository<WorkflowMemory>,
        private variableResolver: VariableResolverService,
        private messagesService: MessagesService,
        private automationGateway: AutomationGateway,
        private apiExecutor: ApiRequestExecutor,
        private actionExecutor: ActionExecutor,
        private conditionExecutor: ConditionExecutor,
        private geminiExecutor: GeminiExecutor,
        private leadUpdateExecutor: LeadUpdateExecutor,
        private memoryExecutor: MemoryExecutor,
        private knowledgeExecutor: KnowledgeExecutor,
        private dagService: DAGTraversalService,
    ) { }

    /**
     * Entry point for executing a workflow
     */
    async executeWorkflow(workflowId: string, tenantId: string, initialContext: any = {}) {
        const workflow = await this.workflowRepo.findOne({
            where: { id: workflowId, tenantId, isActive: true },
        });

        if (!workflow) {
            throw new Error('Workflow not found or inactive');
        }

        // 1. Create execution record
        const execution = this.executionRepo.create({
            workflowId,
            tenantId,
            status: ExecutionStatus.RUNNING,
            context: initialContext,
            startedAt: new Date(),
        });
        await this.executionRepo.save(execution);

        // Fetch Memory for context
        const contactId = initialContext.trigger?.contactId || initialContext.contactId;
        if (contactId) {
            const memoryRecords = await this.memoryRepo.find({
                where: { tenantId, contactId }
            });
            initialContext.memory = memoryRecords.reduce((acc: Record<string, any>, m) => {
                acc[m.key] = m.value;
                return acc;
            }, {});
        }

        try {
            // 2. Resolve execution order (DAG traversal & Cycle Detection)
            if (this.dagService.hasCycle(workflow.nodes, workflow.edges)) {
                throw new Error('Circular dependency detected in workflow');
            }

            // For now, let's find the trigger node
            const triggerNode = workflow.nodes.find(n => n.type === 'trigger' || n.type === 'webhook' || n.type === 'manual');

            if (!triggerNode) {
                throw new Error('No trigger node found in workflow');
            }

            // 3. Start recursive execution from trigger
            await this.executeNode(workflow, triggerNode, execution, initialContext);

            // 4. Mark execution as completed
            execution.status = ExecutionStatus.COMPLETED;
            execution.completedAt = new Date();
            await this.executionRepo.save(execution);

        } catch (error) {
            this.logger.error(`Workflow execution ${execution.id} failed: ${error.message}`);
            execution.status = ExecutionStatus.FAILED;
            execution.error = error.message;
            execution.completedAt = new Date();
            await this.executionRepo.save(execution);
            throw error;
        }

        return execution;
    }

    /**
     * Executes an individual node and its children
     */
    private async executeNode(workflow: Workflow, node: any, execution: WorkflowExecution, context: any) {
        const startTime = Date.now();

        // 1. Create log entry
        const log = this.logRepo.create({
            executionId: execution.id,
            nodeId: node.id,
            nodeType: node.type,
            status: NodeExecutionStatus.STARTED,
            input: context,
        });
        await this.logRepo.save(log);

        try {
            this.logger.log(`Executing node ${node.id} (${node.type})`);

            // Emit Progress Event
            this.automationGateway.emitExecutionEvent(execution.id, 'node_started', {
                nodeId: node.id,
                nodeType: node.type,
            });

            // 2. Delegate to specific executor
            const result = await this.resolveNodeExecution(node, context);

            // 3. Update log with output
            log.status = NodeExecutionStatus.COMPLETED;
            log.output = result;
            log.durationMs = Date.now() - startTime;
            await this.logRepo.save(log);

            // Emit Success Event
            this.automationGateway.emitExecutionEvent(execution.id, 'node_completed', {
                nodeId: node.id,
                result: result,
            });

            // 4. Update overall execution context
            // Store results in nodes section of context
            if (!context.nodes) context.nodes = {};
            context.nodes[node.id] = {
                output: result,
                status: 'completed',
                completedAt: new Date(),
            };

            // If the node defines a variableName, also store it in the top-level context
            if (node.data?.variableName) {
                context[node.data.variableName] = result.data || result;
            }

            // 5. Find next nodes to execute
            const edges = workflow.edges.filter(e => e.source === node.id);

            // Handle branching for conditions
            let filteredEdges = edges;
            if (node.type === 'condition' && result.branch) {
                filteredEdges = edges.filter(e => e.sourceHandle === result.branch || !e.sourceHandle);
            }

            for (const edge of filteredEdges) {
                const nextNode = workflow.nodes.find(n => n.id === edge.target);
                if (nextNode) {
                    await this.executeNode(workflow, nextNode, execution, context);
                }
            }

        } catch (error) {
            log.status = NodeExecutionStatus.FAILED;
            log.error = error.message;
            log.durationMs = Date.now() - startTime;
            await this.logRepo.save(log);

            // Emit Failure Event
            this.automationGateway.emitExecutionEvent(execution.id, 'node_failed', {
                nodeId: node.id,
                error: error.message,
            });

            throw error;
        }
    }

    /**
     * Routing logic for node-specific execution logic
     */
    private async resolveNodeExecution(node: any, context: any): Promise<any> {
        switch (node.type) {
            case 'trigger':
            case 'webhook':
            case 'broadcast_trigger':
            case 'manual':
                return { status: 'triggered', data: context.trigger?.data || {} };

            case 'action':
                return this.actionExecutor.execute(node, context);

            case 'api_request':
            case 'api':
                return this.apiExecutor.execute(node, context);

            case 'condition':
                return this.conditionExecutor.execute(node, context);

            case 'gemini_model':
            case 'ai_agent':
                return this.geminiExecutor.execute(node, context);

            case 'lead_update':
                return this.leadUpdateExecutor.execute(node, context);

            case 'memory':
                return this.memoryExecutor.execute(node, context);

            case 'knowledge_query':
                return this.knowledgeExecutor.execute(node, context);

            default:
                this.logger.warn(`No executor for node type: ${node.type}`);
                return { status: 'skipped' };
        }
    }
}
