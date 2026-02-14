import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workflow } from './entities/workflow.entity';
import { MessagesService } from '../messages/messages.service';
import { AiService } from '../ai/ai.service';
import { ContactsService } from '../contacts/contacts.service';
import { AuditService } from '../audit/audit.service';
import { LogLevel, LogCategory } from '../audit/entities/audit-log.entity';

@Injectable()
export class WorkflowsService {
    private readonly logger = new Logger(WorkflowsService.name);
    private readonly MAX_DEPTH = 10;

    constructor(
        @InjectRepository(Workflow)
        private workflowRepo: Repository<Workflow>,
        private messagesService: MessagesService,
        private aiService: AiService,
        private contactsService: ContactsService,
        private auditService: AuditService,
    ) { }

    async create(tenantId: string, data: Partial<Workflow>) {
        const workflow = this.workflowRepo.create({ ...data, tenantId });
        return this.workflowRepo.save(workflow);
    }

    async findAll(tenantId: string) {
        return this.workflowRepo.find({ where: { tenantId }, order: { updatedAt: 'DESC' } });
    }

    async findOne(id: string, tenantId: string) {
        return this.workflowRepo.findOne({ where: { id, tenantId } });
    }

    async update(id: string, tenantId: string, data: Partial<Workflow>) {
        await this.workflowRepo.update({ id, tenantId }, data);
        return this.findOne(id, tenantId);
    }

    async delete(id: string, tenantId: string) {
        return this.workflowRepo.delete({ id, tenantId });
    }

    async executeTrigger(tenantId: string, triggerType: string, context: any) {
        const activeWorkflows = await this.workflowRepo.find({
            where: { tenantId, isActive: true },
        });

        for (const workflow of activeWorkflows) {
            const triggerNode = workflow.nodes.find(
                (n) => n.type === 'trigger' && n.data?.triggerType === triggerType,
            );

            if (triggerNode) {
                this.logger.log(`Starting workflow ${workflow.id} for tenant ${tenantId}`);
                try {
                    await this.runNode(workflow, triggerNode.id, context, 0);
                } catch (error) {
                    this.logger.error(`Workflow ${workflow.id} failed: ${error.message}`);
                }
            }
        }
    }

    private async runNode(workflow: Workflow, nodeId: string, context: any, depth: number) {
        if (depth > this.MAX_DEPTH) {
            this.logger.warn(`Max depth reached for workflow ${workflow.id}`);
            return;
        }

        const edges = workflow.edges.filter((e) => e.source === nodeId);

        for (const edge of edges) {
            const nextNode = workflow.nodes.find((n) => n.id === edge.target);
            if (!nextNode) continue;

            try {
                let shouldContinue = true;

                switch (nextNode.type) {
                    case 'action':
                        await this.executeAction(workflow.tenantId, nextNode, context);
                        break;
                    case 'condition':
                        shouldContinue = await this.evaluateCondition(nextNode, context, edge);
                        break;
                    case 'ai_agent':
                        await this.handleAiNode(workflow.tenantId, nextNode, context);
                        shouldContinue = false;
                        break;
                    case 'lead_update':
                        await this.handleLeadUpdate(workflow.tenantId, nextNode, context);
                        break;
                }

                if (shouldContinue) {
                    await this.runNode(workflow, nextNode.id, context, depth + 1);
                }
            } catch (error) {
                this.logger.error(`Error executing node ${nextNode.id} in workflow ${workflow.id}: ${error.message}`);
                await this.auditService.logAction(
                    'SYSTEM',
                    'Workflow Engine',
                    'EXECUTION_ERROR',
                    `Workflow: ${workflow.id}`,
                    workflow.tenantId,
                    { nodeId: nextNode.id, error: error.message },
                    '',
                    LogLevel.ERROR,
                    LogCategory.SYSTEM
                );
            }
        }
    }

    private async executeAction(tenantId: string, node: any, context: any) {
        const { actionType, payload } = node.data;

        if (actionType === 'send_whatsapp' || !actionType) { // default to whatsapp
            await this.messagesService.send({
                tenantId,
                to: context.from,
                type: 'text',
                payload: { text: payload?.text || 'Hello from Automation' },
            });
        }
    }

    private async evaluateCondition(node: any, context: any, edge: any): Promise<boolean> {
        const { condition, value } = node.data;
        const body = (context.messageBody || '').toLowerCase();
        const val = (value || '').toLowerCase();

        let match = false;
        if (condition === 'contains') match = body.includes(val);
        else if (condition === 'exact') match = body === val;
        else match = true; // default pass if no condition specified

        // If the edge has a sourceHandle (e.g. "true" or "false"), respect it
        if (edge.sourceHandle === 'true') return match;
        if (edge.sourceHandle === 'false') return !match;

        return match;
    }

    private async handleAiNode(tenantId: string, node: any, context: any) {
        this.logger.log(`Forwarding to AI Agent: ${tenantId}`);
        await this.aiService.process(tenantId, context.from, context.messageBody);
    }

    private async handleLeadUpdate(tenantId: string, node: any, context: any) {
        const { status, score } = node.data;
        if (context.contactId) {
            await this.contactsService.update(context.contactId, tenantId, {
                status,
                score: score ? parseInt(score) : undefined
            });
        }
    }
}
