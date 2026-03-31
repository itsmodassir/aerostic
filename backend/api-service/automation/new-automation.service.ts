import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  AutomationFlow,
  AutomationNode,
  AutomationEdge,
  AutomationExecution,
  AutomationExecutionLog,
  ExecutionStatus,
} from '@shared/database/entities/core/automation-flow.entity';
import { MessagesService } from '../messages/messages.service';
import { ContactsService } from '../contacts/contacts.service';

interface ExecutionContext {
  executionId: string;
  automationId: string;
  tenantId: string;
  contactId?: string;
  conversationId?: string;
  variables: Record<string, any>;
  triggerData: any;
  lastUserMessage?: string;
}

@Injectable()
export class NewAutomationService {
  private readonly logger = new Logger(NewAutomationService.name);

  constructor(
    @InjectRepository(AutomationFlow)
    private flowRepo: Repository<AutomationFlow>,
    @InjectRepository(AutomationNode)
    private nodeRepo: Repository<AutomationNode>,
    @InjectRepository(AutomationEdge)
    private edgeRepo: Repository<AutomationEdge>,
    @InjectRepository(AutomationExecution)
    private executionRepo: Repository<AutomationExecution>,
    @InjectRepository(AutomationExecutionLog)
    private logRepo: Repository<AutomationExecutionLog>,
    private messagesService: MessagesService,
    private contactsService: ContactsService,
  ) {}

  async executeAutomation(executionId: string) {
    this.logger.log(`Starting execution: ${executionId}`);

    try {
      const execution = await this.executionRepo.findOne({
        where: { id: executionId },
        relations: ['automation'],
      });

      if (!execution) {
        throw new Error(`Execution ${executionId} not found`);
      }

      const automation = await this.getAutomationWithFlow(execution.automation.id);
      if (!automation) {
        throw new Error(`Automation ${execution.automation.id} not found`);
      }

      // Update execution count
      await this.flowRepo.update(automation.id, {
        executionCount: (automation.executionCount || 0) + 1,
        lastExecutedAt: new Date(),
      });

      const triggerData = execution.triggerData || {};
      const context: ExecutionContext = {
        executionId: execution.id,
        automationId: automation.id,
        tenantId: automation.tenantId,
        contactId: execution.contact?.id,
        conversationId: execution.conversationId,
        variables: {
          ...triggerData,
          contactId: execution.contact?.id,
          conversationId: execution.conversationId,
        },
        triggerData,
        lastUserMessage: triggerData.message?.content || triggerData.message?.text || '',
      };

      // Find start node (no incoming edges)
      const startNode = automation.nodes.find(
        (n) => !automation.edges.some((e) => e.targetNodeId === n.nodeId),
      );

      if (startNode) {
        await this.executeNode(startNode, automation, context);
      } else {
        await this.completeExecution(executionId, ExecutionStatus.COMPLETED, 'No start node found');
      }
    } catch (error) {
      this.logger.error(`Error executing automation ${executionId}: ${error.message}`);
      await this.completeExecution(executionId, ExecutionStatus.FAILED, error.message);
    }
  }

  private async executeNode(node: AutomationNode, automation: AutomationFlow, context: ExecutionContext) {
    this.logger.log(`Executing node ${node.nodeId} (${node.type})`);

    try {
      await this.logNodeExecution(context.executionId, node.nodeId, node.type, 'running', node.data);

      let result: any = null;

      switch (node.type) {
        case 'custom_reply':
          result = await this.executeCustomReply(node, context);
          break;
        case 'set_variable':
          result = await this.executeSetVariable(node, context);
          break;
        case 'conditions':
          result = await this.executeConditions(node, automation, context);
          return; // Conditions handle their own routing
        case 'end':
          result = { action: 'flow_ended' };
          break;
        default:
          this.logger.warn(`Unknown node type: ${node.type}`);
          result = { action: 'skipped', reason: `Unknown node type: ${node.type}` };
      }

      await this.logNodeExecution(context.executionId, node.nodeId, node.type, 'completed', node.data, result);

      if (result?.action === 'execution_paused') {
        return;
      }

      await this.continueToNextNode(node, automation, context);
    } catch (error) {
      this.logger.error(`Node ${node.nodeId} failed: ${error.message}`);
      await this.logNodeExecution(context.executionId, node.nodeId, node.type, 'failed', node.data, null, error.message);
      await this.completeExecution(context.executionId, ExecutionStatus.FAILED, `Node ${node.nodeId} failed: ${error.message}`);
    }
  }

  private async executeCustomReply(node: AutomationNode, context: ExecutionContext) {
    const message = this.replaceVariables(node.data.message || '', context.variables);
    
    if (context.contactId) {
      const contact = await this.contactsService.findOne(context.tenantId, context.contactId);
      if (contact?.phoneNumber) {
        await this.messagesService.send({
          tenantId: context.tenantId,
          to: contact.phoneNumber,
          type: 'text',
          payload: { text: message },
        });
      }
    }

    return { action: 'message_sent', message };
  }

  private async executeSetVariable(node: AutomationNode, context: ExecutionContext) {
    const { key, value } = node.data;
    if (key) {
      context.variables[key] = this.replaceVariables(value, context.variables);
    }
    return { action: 'variable_set', key, value: context.variables[key] };
  }

  private async executeConditions(node: AutomationNode, automation: AutomationFlow, context: ExecutionContext) {
    const { conditionType, keywords = [], matchType = 'any' } = node.data;
    const userInput = this.normalizeText(context.lastUserMessage);
    
    let conditionMet = false;
    const lowerKeywords = keywords.map((k: string) => this.normalizeText(k));

    if (matchType === 'any') {
      conditionMet = lowerKeywords.some((k: string) => userInput.includes(k));
    } else if (matchType === 'all') {
      conditionMet = lowerKeywords.every((k: string) => userInput.includes(k));
    } else if (matchType === 'exact') {
      conditionMet = lowerKeywords.includes(userInput);
    }

    await this.logNodeExecution(context.executionId, node.nodeId, node.type, 'completed', node.data, { conditionMet });
    
    const outgoingEdges = automation.edges.filter(e => e.sourceNodeId === node.nodeId);
    
    if (conditionMet && outgoingEdges.length > 0) {
      const nextNode = automation.nodes.find(n => n.nodeId === outgoingEdges[0].targetNodeId);
      if (nextNode) await this.executeNode(nextNode, automation, context);
    } else if (!conditionMet && outgoingEdges.length > 1) {
      const nextNode = automation.nodes.find(n => n.nodeId === outgoingEdges[1].targetNodeId);
      if (nextNode) await this.executeNode(nextNode, automation, context);
    } else {
      await this.completeExecution(context.executionId, ExecutionStatus.COMPLETED, 'Condition branch ended');
    }
  }

  private async continueToNextNode(currentNode: AutomationNode, automation: AutomationFlow, context: ExecutionContext) {
    const outgoingEdges = automation.edges.filter(e => e.sourceNodeId === currentNode.nodeId);
    
    if (outgoingEdges.length === 0) {
      await this.completeExecution(context.executionId, ExecutionStatus.COMPLETED, 'Flow finished');
      return;
    }

    for (const edge of outgoingEdges) {
      const nextNode = automation.nodes.find(n => n.nodeId === edge.targetNodeId);
      if (nextNode) {
        await this.executeNode(nextNode, automation, context);
      }
    }
  }

  private async getAutomationWithFlow(id: string): Promise<AutomationFlow | null> {
    return this.flowRepo.findOne({
      where: { id },
      relations: ['nodes', 'edges'],
    });
  }

  private async logNodeExecution(
    executionId: string,
    nodeId: string,
    nodeType: string,
    status: string,
    input: any,
    output: any = null,
    error?: string,
  ) {
    const log = this.logRepo.create({
      execution: { id: executionId } as any,
      nodeId,
      nodeType,
      status,
      input,
      output,
      error,
    });
    await this.logRepo.save(log);
  }

  private async completeExecution(id: string, status: ExecutionStatus, resultOrError: string) {
    const update: any = { status, completedAt: new Date() };
    if (status === ExecutionStatus.FAILED) {
      update.error = resultOrError;
    } else {
      update.result = resultOrError;
    }
    await this.executionRepo.update(id, update);
  }

  private replaceVariables(text: string, variables: Record<string, any>): string {
    return text.replace(/\{\{(.*?)\}\}/g, (_, key) => {
      const val = variables[key.trim()];
      return val !== undefined ? String(val) : `{{${key}}}`;
    });
  }

  private normalizeText(text: string = ''): string {
    return text.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, ' ').trim();
  }
}
