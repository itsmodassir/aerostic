import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull, Not, Any } from "typeorm";
import { FlowAutomation } from "./entities/flow/flow-automation.entity";
import { FlowNode } from "./entities/flow/flow-node.entity";
import { FlowEdge } from "./entities/flow/flow-edge.entity";
import { FlowExecution } from "./entities/flow/flow-execution.entity";
import { FlowExecutionLog } from "./entities/flow/flow-execution-log.entity";
import { MessagesService } from "../messages/messages.service";
import { ContactsService } from "../contacts/contacts.service";
import { v4 as uuidv4 } from "uuid";

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
export class FlowAutomationService {
  private readonly logger = new Logger(FlowAutomationService.name);
  private pendingExecutions = new Map<string, any>();

  constructor(
    @InjectRepository(FlowAutomation)
    private automationRepo: Repository<FlowAutomation>,
    @InjectRepository(FlowNode)
    private nodeRepo: Repository<FlowNode>,
    @InjectRepository(FlowEdge)
    private edgeRepo: Repository<FlowEdge>,
    @InjectRepository(FlowExecution)
    private executionRepo: Repository<FlowExecution>,
    @InjectRepository(FlowExecutionLog)
    private logRepo: Repository<FlowExecutionLog>,
    private messagesService: MessagesService,
    private contactsService: ContactsService,
  ) {}

  /**
   * Main entry point to trigger an automation
   */
  async triggerAutomation(
    tenantId: string,
    triggerType: string,
    data: any,
    contactId?: string,
    conversationId?: string,
  ) {
    this.logger.log(`Triggering automation: ${triggerType} for tenant ${tenantId}`);

    // 1. Find active automations for this trigger
    const query: any = {
      tenantId,
      trigger: triggerType,
      status: "active",
    };

    const activeAutomations = await this.automationRepo.find({ where: query });

    for (const automation of activeAutomations) {
      // 2. Check trigger config (e.g., keyword match)
      if (triggerType === "keyword") {
        const keyword = automation.triggerConfig.keyword?.toLowerCase();
        const input = data.message?.text?.toLowerCase() || "";
        if (keyword && !input.includes(keyword)) continue;
      }

      // 3. Create execution record
      const execution = this.executionRepo.create({
        automationId: automation.id,
        tenantId,
        contactId,
        conversationId,
        triggerData: data,
        status: "running",
        variables: {
          tenantId,
          contactId,
          conversationId,
          ...data,
        },
      });

      const savedExecution = await this.executionRepo.save(execution);

      // 4. Start execution
      // We run this asynchronously to not block the trigger source (e.g., webhook)
      this.executeFlow(savedExecution.id).catch((err) => {
        this.logger.error(`Error in flow execution ${savedExecution.id}: ${err.message}`);
      });
    }
  }

  /**
   * Execute a flow from the start
   */
  async executeFlow(executionId: string) {
    const execution = await this.executionRepo.findOne({
      where: { id: executionId },
    });

    if (!execution) {
      throw new NotFoundException(`Execution ${executionId} not found`);
    }

    try {
      const automation = await this.getAutomationWithFlow(execution.automationId);
      if (!automation) throw new Error("Automation not found");

      // Update execution count
      await this.automationRepo.update(automation.id, {
        executionCount: (automation.executionCount || 0) + 1,
        lastExecutedAt: new Date(),
      });

      const context: ExecutionContext = {
        executionId: execution.id,
        automationId: execution.automationId,
        tenantId: execution.tenantId,
        contactId: execution.contactId,
        conversationId: execution.conversationId,
        variables: execution.variables || {},
        triggerData: execution.triggerData || {},
        lastUserMessage: execution.triggerData?.message?.text || "",
      };

      // Find start nodes (nodes with no incoming edges)
      const startNodes = automation.nodes.filter(
        (node) => !automation.edges.some((edge) => edge.targetNodeId === node.nodeId),
      );

      if (startNodes.length === 0) {
        await this.completeExecution(executionId, "completed", "No start nodes found");
        return;
      }

      // Start execution from each start node
      for (const node of startNodes) {
        await this.executeNode(node, automation, context);
      }
    } catch (error) {
      this.logger.error(`Failed to execute flow ${executionId}: ${error.message}`);
      await this.completeExecution(executionId, "failed", error.message);
    }
  }

  private async executeNode(node: FlowNode, automation: any, context: ExecutionContext) {
    this.logger.debug(`Executing node ${node.nodeId} (${node.type}:${node.subtype})`);

    try {
      // 1. Log node start
      await this.logNodeStatus(context.executionId, node, "running");

      let result: any = null;

      // 2. Dispatch by type
      switch (node.type) {
        case "trigger":
          result = { status: "trigger_processed" };
          break;
        case "custom_reply":
        case "action":
          if (node.subtype === "send_message" || node.type === "custom_reply") {
            result = await this.handleSendMessage(node, context);
          } else if (node.subtype === "set_variable") {
            result = await this.handleSetVariable(node, context);
          }
          break;
        case "condition":
        case "conditions":
          result = await this.handleConditions(node, automation, context);
          return; // Conditions handle their own next steps
        case "delay":
          // Not implemented yet in this version, would need a scheduler
          result = { status: "delay_skipped" };
          break;
        case "end":
          result = { status: "flow_ended" };
          break;
        default:
          this.logger.warn(`Unknown node type: ${node.type}`);
          result = { status: "unknown_type" };
      }

      // 3. Log completion
      await this.logNodeStatus(context.executionId, node, "completed", result);

      // 4. Continue to next nodes
      if (result?.status !== "paused") {
        await this.continueFlow(node, automation, context);
      }
    } catch (error) {
      this.logger.error(`Node ${node.nodeId} failed: ${error.message}`);
      await this.logNodeStatus(context.executionId, node, "failed", null, error.message);
      throw error;
    }
  }

  private async continueFlow(currentNode: FlowNode, automation: any, context: ExecutionContext) {
    const nextEdges = automation.edges.filter((e: FlowEdge) => e.sourceNodeId === currentNode.nodeId);
    for (const edge of nextEdges) {
      const nextNode = automation.nodes.find((n: FlowNode) => n.nodeId === edge.targetNodeId);
      if (nextNode) {
        await this.executeNode(nextNode, automation, context);
      }
    }
  }

  // --- Handlers ---

  private async handleSendMessage(node: FlowNode, context: ExecutionContext) {
    const text = this.resolveVariables(node.data.message || "", context.variables);

    if (!context.contactId) {
      throw new Error("Contact ID missing in execution context");
    }

    // Resolve contact phone
    const contact = await this.contactsService.findOne(context.contactId, context.tenantId);
    if (!contact || !contact.phoneNumber) {
      throw new Error("Contact not found or missing phone number");
    }

    await this.messagesService.send({
      tenantId: context.tenantId,
      to: contact.phoneNumber,
      type: "text",
      payload: { text },
    });

    return { status: "message_sent", text };
  }

  private async handleSetVariable(node: FlowNode, context: ExecutionContext) {
    const { key, value } = node.data;
    const resolvedValue = this.resolveVariables(value, context.variables);
    context.variables[key] = resolvedValue;
    
    // Update execution variables in DB
    await this.executionRepo.update(context.executionId, {
      variables: context.variables,
    });

    return { status: "variable_set", key, value: resolvedValue };
  }

  private async handleConditions(node: FlowNode, automation: any, context: ExecutionContext) {
    const { value, operator } = node.data;
    const resolvedValue = this.resolveVariables(value, context.variables);
    const inputValue = context.lastUserMessage || "";

    let match = false;
    // Simple evaluation engine (can be expanded)
    switch (operator) {
      case "equals": match = inputValue === resolvedValue; break;
      case "contains": match = inputValue.toLowerCase().includes(resolvedValue.toLowerCase()); break;
      case "starts_with": match = inputValue.toLowerCase().startsWith(resolvedValue.toLowerCase()); break;
      default: match = false;
    }

    await this.logNodeStatus(context.executionId, node, "completed", { match, inputValue, operator, resolvedValue });

    // Route based on match
    const edges = automation.edges.filter((e: FlowEdge) => e.sourceNodeId === node.nodeId);
    // Convention: First edge is TRUE, Second edge is FALSE (if exists)
    const nextEdges = match ? [edges[0]] : edges.length > 1 ? [edges[1]] : [];

    for (const edge of nextEdges) {
      if (!edge) continue;
      const nextNode = automation.nodes.find((n: FlowNode) => n.nodeId === edge.targetNodeId);
      if (nextNode) await this.executeNode(nextNode, automation, context);
    }
  }

  // --- Helpers ---

  private async getAutomationWithFlow(id: string) {
    const automation = await this.automationRepo.findOne({ where: { id } });
    if (!automation) return null;

    const nodes = await this.nodeRepo.find({ where: { automationId: id } });
    const edges = await this.edgeRepo.find({ where: { automationId: id } });

    return { ...automation, nodes, edges };
  }

  private async logNodeStatus(
    executionId: string,
    node: FlowNode,
    status: string,
    output?: any,
    error?: string,
  ) {
    const log = this.logRepo.create({
      executionId,
      nodeId: node.nodeId,
      nodeType: `${node.type}:${node.subtype || ""}`,
      status,
      input: node.data,
      output,
      error,
    });
    await this.logRepo.save(log);

    // Update execution last run node
    await this.executionRepo.update(executionId, {
      currentNodeId: node.nodeId,
      updatedAt: new Date(),
    });
  }

  private async completeExecution(id: string, status: string, result?: string) {
    await this.executionRepo.update(id, {
      status,
      result,
      completedAt: new Date(),
    });
  }

  private resolveVariables(text: string, variables: Record<string, any>): string {
    if (!text || typeof text !== "string") return text;
    return text.replace(/\{\{\s*([^{}]+)\s*\}\}/g, (match, key) => {
      return variables[key.trim()] !== undefined ? variables[key.trim()] : match;
    });
  }
}
