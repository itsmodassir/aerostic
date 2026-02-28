import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import axios from "axios";
import { Workflow } from "./entities/workflow.entity";
import { MessagesService } from "../messages/messages.service";
import { AiService } from "../ai/ai.service";
import { ContactsService } from "../contacts/contacts.service";
import { AuditService } from "../audit/audit.service";
import { LogLevel, LogCategory } from "@api/audit/audit.service";
import { MessagesGateway } from "../messages/messages.gateway";
import { GoogleService } from "../google/google.service";

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
    private messagesGateway: MessagesGateway,
    private googleService: GoogleService,
  ) { }

  async create(tenantId: string, data: Partial<Workflow>) {
    const workflow = this.workflowRepo.create({ ...data, tenantId });
    return this.workflowRepo.save(workflow);
  }

  async findAll(tenantId: string) {
    return this.workflowRepo.find({
      where: { tenantId },
      order: { updatedAt: "DESC" },
    });
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

  /**
   * Returns the number of active workflows that contain an ai_agent node.
   * Used by the webhook handler to avoid double-sending AI responses.
   */
  async getActiveAiWorkflows(tenantId: string): Promise<number> {
    const workflows = await this.workflowRepo.find({ where: { tenantId, isActive: true } });
    return workflows.filter(w => w.nodes?.some((n: any) => n.type === 'ai_agent')).length;
  }

  async executeTest(tenantId: string, workflowId: string, message: string) {
    const workflow = await this.findOne(workflowId, tenantId);
    if (!workflow) throw new Error("Workflow not found");

    // Find the trigger node (usually the starting point)
    const triggerNode = workflow.nodes.find((n) => n.type === "trigger");
    if (!triggerNode) throw new Error("No Trigger node found");

    this.logger.log(`Starting Test Execution for Workflow ${workflow.id}`);

    // Mock Context
    const context = {
      from: "TEST_USER",
      contactId: "test-contact-id",
      messageBody: message,
      contactName: "Test User",
    };

    // Emit initial debug event
    this.messagesGateway.emitWorkflowDebug(tenantId, {
      workflowId: workflow.id,
      nodeId: triggerNode.id,
      status: "processing",
    });

    // Start execution
    await this.runNode(workflow, triggerNode.id, context, 0);

    // Emit success for trigger
    this.messagesGateway.emitWorkflowDebug(tenantId, {
      workflowId: workflow.id,
      nodeId: triggerNode.id,
      status: "completed",
    });
  }

  async executeBroadcast(
    tenantId: string,
    workflowId: string,
    audience: any[],
  ) {
    const workflow = await this.findOne(workflowId, tenantId);
    if (!workflow) throw new Error("Workflow not found");

    const broadcastNode = workflow.nodes.find(
      (n) => n.type === "broadcast_trigger",
    );
    if (!broadcastNode) throw new Error("No Broadcast Trigger node found");

    this.logger.log(
      `Executing Broadcast for ${audience.length} contacts on workflow ${workflow.id}`,
    );

    // In a real implementation, we would push these to a Queue (BullMQ)
    // For now, we process them in batch
    for (const contact of audience) {
      const context = {
        from: contact.phone,
        contactId: contact.id,
        contactName: contact.name,
        messageBody: "BROADCAST_TRIGGER",
        isBroadcast: true,
      };

      // Run async to not block
      this.runNode(workflow, broadcastNode.id, context, 0).catch((err) =>
        this.logger.error(`Broadcast failed for ${contact.id}: ${err.message}`),
      );
    }
  }

  async executeWebhook(workflowId: string, payload: any) {
    // Find workflow without tenant restriction (public webhook)
    const workflow = await this.workflowRepo.findOne({
      where: { id: workflowId },
    });

    if (!workflow) {
      throw new Error("Workflow not found");
    }

    if (!workflow.isActive) {
      throw new Error("Workflow is inactive");
    }

    const webhookNode = workflow.nodes.find((n) => n.type === "webhook");
    if (!webhookNode) {
      throw new Error("No Webhook Trigger node found in this workflow");
    }

    this.logger.log(`Executing Webhook Trigger for Workflow ${workflow.id}`);

    // Construct context with payload
    const context = {
      from: "WEBHOOK",
      contactId: "webhook-user", // Placeholder, or derive from payload if possible
      messageBody: "WEBHOOK_TRIGGER",
      webhookPayload: payload,
    };

    // Emit initial debug event
    this.messagesGateway.emitWorkflowDebug(workflow.tenantId, {
      workflowId: workflow.id,
      nodeId: webhookNode.id,
      status: "processing",
    });

    // Start execution
    // We catch here to prevent crashing the controller, but ideally runNode handles its own errors
    try {
      await this.runNode(workflow, webhookNode.id, context, 0);

      // Emit success for trigger
      this.messagesGateway.emitWorkflowDebug(workflow.tenantId, {
        workflowId: workflow.id,
        nodeId: webhookNode.id,
        status: "completed",
      });
    } catch (error) {
      this.logger.error(`Webhook execution failed: ${error.message}`);
      // Failure event emitted in runNode usually, but if runNode throws immediately:
      this.messagesGateway.emitWorkflowDebug(workflow.tenantId, {
        workflowId: workflow.id,
        nodeId: webhookNode.id,
        status: "failed",
        error: error.message,
      });
      throw error;
    }
  }

  async executeTrigger(tenantId: string, triggerType: string, context: any): Promise<boolean> {
    const activeWorkflows = await this.workflowRepo.find({
      where: { tenantId, isActive: true },
    });

    let handled = false;

    for (const workflow of activeWorkflows) {
      const triggerNode = workflow.nodes.find(
        (n) => n.type === "trigger" && n.data?.triggerType === triggerType,
      );

      // Check if conversation is in handoff mode
      if (context.conversationId) {
        const conversation = await this.messagesService.getConversation(
          context.conversationId,
        );
        if (conversation && conversation.status === "agent_handoff") {
          this.logger.log(
            `Skipping workflow trigger for ${context.conversationId} (Agent Handoff)`,
          );
          continue;
        }
      }

      if (triggerNode) {
        this.logger.log(
          `Starting workflow ${workflow.id} for tenant ${tenantId}`,
        );
        try {
          await this.runNode(workflow, triggerNode.id, context, 0);
          handled = true;
        } catch (error) {
          this.logger.error(`Workflow ${workflow.id} failed: ${error.message}`);
        }
      }
    }

    return handled;
  }

  private async runNode(
    workflow: Workflow,
    nodeId: string,
    context: any,
    depth: number,
  ) {
    if (depth > this.MAX_DEPTH) {
      this.logger.warn(`Max depth reached for workflow ${workflow.id}`);
      return;
    }

    // Emit Processing Event
    this.messagesGateway.emitWorkflowDebug(workflow.tenantId, {
      workflowId: workflow.id,
      nodeId,
      status: "processing",
    });

    const edges = workflow.edges.filter((e) => e.source === nodeId);

    for (const edge of edges) {
      const nextNode = workflow.nodes.find((n) => n.id === edge.target);
      if (!nextNode) continue;

      try {
        let shouldContinue = true;

        switch (nextNode.type) {
          case "action":
            await this.executeAction(workflow.tenantId, nextNode, context);
            break;
          case "condition":
            shouldContinue = await this.evaluateCondition(
              nextNode,
              context,
              edge,
            );
            break;
          case "ai_agent":
            await this.handleAiNode(workflow, nextNode, context);
            shouldContinue = false;
            break;
          case "lead_update":
            await this.handleLeadUpdate(workflow.tenantId, nextNode, context);
            break;
          case "google_sheets":
            await this.handleGoogleSheets(workflow.tenantId, nextNode, context);
            break;
          case "contact":
            await this.handleContactNode(workflow.tenantId, nextNode, context);
            break;
          case "template":
            await this.handleTemplateNode(workflow.tenantId, nextNode, context);
            break;
          case "chat":
            await this.handleChatNode(workflow.tenantId, nextNode, context);
            shouldContinue = false; // Stop workflow execution
            break;
          case "webhook":
            // Webhook is primarily a trigger. If used mid-flow, logic goes here.
            break;
          case "api_request":
            await this.handleApiNode(workflow.tenantId, nextNode, context);
            break;
          case "google_drive":
            await this.handleGoogleDriveNode(
              workflow.tenantId,
              nextNode,
              context,
            );
            break;
        }

        if (shouldContinue) {
          await this.runNode(workflow, nextNode.id, context, depth + 1);
        }

        // Emit Success Event
        this.messagesGateway.emitWorkflowDebug(workflow.tenantId, {
          workflowId: workflow.id,
          nodeId: nextNode.id,
          status: "completed",
        });
      } catch (error) {
        // Emit Failure Event
        this.messagesGateway.emitWorkflowDebug(workflow.tenantId, {
          workflowId: workflow.id,
          nodeId: nextNode.id,
          status: "failed",
          error: error.message,
        });

        this.logger.error(
          `Error executing node ${nextNode.id} in workflow ${workflow.id}: ${error.message}`,
        );
        await this.auditService.logAction(
          "SYSTEM",
          "Workflow Engine",
          "EXECUTION_ERROR",
          `Workflow: ${workflow.id}`,
          workflow.tenantId,
          { nodeId: nextNode.id, error: error.message },
          "",
          LogLevel.ERROR,
          LogCategory.SYSTEM,
        );
      }
    }
  }

  private async executeAction(tenantId: string, node: any, context: any) {
    const { actionType, payload } = node.data;

    if (actionType === "send_whatsapp" || !actionType) {
      // default to whatsapp
      await this.messagesService.send({
        tenantId,
        to: context.from,
        type: "text",
        payload: { text: payload?.text || "Hello from Automation" },
      });
    }
  }

  private async evaluateCondition(
    node: any,
    context: any,
    edge: any,
  ): Promise<boolean> {
    const { condition, value } = node.data;
    const body = (context.messageBody || "").toLowerCase();
    const val = (value || "").toLowerCase();

    let match = false;
    if (condition === "contains") match = body.includes(val);
    else if (condition === "exact") match = body === val;
    else match = true; // default pass if no condition specified

    // If the edge has a sourceHandle (e.g. "true" or "false"), respect it
    if (edge.sourceHandle === "true") return match;
    if (edge.sourceHandle === "false") return !match;

    return match;
  }

  private async handleAiNode(workflow: Workflow, node: any, context: any) {
    const { model, systemPrompt, persona } = node.data;
    const tenantId = workflow.tenantId;

    // Tool Discovery
    const tools = [];
    const incomingEdges = workflow.edges.filter(
      (e) => e.target === node.id && e.targetHandle === "tool-target",
    );

    for (const edge of incomingEdges) {
      const toolNode = workflow.nodes.find((n) => n.id === edge.source);
      if (!toolNode) continue;

      if (toolNode.type === "google_drive") {
        // Tools now handle their own secure token retrieval
        const driveTools = this.googleService.getTools(tenantId);
        tools.push(...driveTools);
      }
    }

    if (tools.length > 0) {
      this.logger.log(`Executing AI Agent with ${tools.length} tools`);

      // Use runAgent from AiService
      const response = await this.aiService.runAgent(
        tenantId,
        context.messageBody,
        tools,
        systemPrompt || "You are a helpful agent.",
      );

      if (response) {
        await this.messagesService.send({
          tenantId,
          to: context.from,
          type: "text",
          payload: { text: response },
        });
      }
    } else {
      // Fallback to Legacy Process
      const promptWithContext = systemPrompt
        ? systemPrompt.replace("{{contact.name}}", "Customer")
        : undefined;

      this.logger.log(
        `Forwarding to AI Service (Legacy): ${tenantId}, Persona: ${persona}`,
      );
      await this.aiService.process(
        tenantId,
        context.from,
        context.messageBody,
        {
          model,
          systemPrompt: promptWithContext,
        },
      );
    }
  }

  private async handleGoogleSheets(tenantId: string, node: any, context: any) {
    const { operation, sheetId, range } = node.data;
    this.logger.log(
      `Executing Google Sheets Operation: ${operation} on ${sheetId} range ${range}`,
    );

    if (operation === "read") {
      context.sheetData = [
        ["Mock Row 1", "Data A"],
        ["Mock Row 2", "Data B"],
      ];
    }
  }

  private async handleLeadUpdate(tenantId: string, node: any, context: any) {
    const { status, score } = node.data;
    if (context.contactId) {
      await this.contactsService.update(context.contactId, tenantId, {
        status,
        score: score ? parseInt(score) : undefined,
      });
    }
  }

  private async handleContactNode(tenantId: string, node: any, context: any) {
    const { operation, matchField } = node.data;
    this.logger.log(`Executing Contact Node: ${operation} by ${matchField}`);

    if (operation === "get") {
      const contact = await this.contactsService.findOne(
        context.contactId,
        tenantId,
      );
      if (contact) {
        context.contact = contact;
      }
    } else if (operation === "update") {
      if (context.contactId) {
        await this.contactsService.update(context.contactId, tenantId, {
          updatedAt: new Date() as any,
        });
      }
    } else if (operation === "create") {
      this.logger.log("Contact creation skipped (already contextually bound)");
    }
  }

  private async handleTemplateNode(tenantId: string, node: any, context: any) {
    const { templateName, language, variables } = node.data;

    // Parse variables
    const components = [];
    if (variables) {
      const vars = variables.split(",").map((v: string) => v.trim());
      components.push({
        type: "body",
        parameters: vars.map((v: string) => ({ type: "text", text: v })),
      });
    }

    this.logger.log(`Sending Template: ${templateName} to ${context.from}`);

    await this.messagesService.send({
      tenantId,
      to: context.from,
      type: "template",
      payload: {
        name: templateName,
        language: { code: language || "en_US" },
        components,
      },
    });
  }

  private async handleChatNode(tenantId: string, node: any, context: any) {
    this.logger.log(`Executing Agent Handoff for ${context.contactId}`);
    if (context.conversationId) {
      await this.messagesService.setConversationStatus(
        context.conversationId,
        "agent_handoff",
      );
    }
  }

  private async handleApiNode(tenantId: string, node: any, context: any) {
    // ... (existing code, ensure it matches previous state)
    const { method, url, headers, body, variableName } = node.data;
    this.logger.log(`Executing API Request: ${method} ${url}`);

    try {
      let finalUrl = url;
      const finalBody = body;

      if (context.contact) {
        finalUrl = finalUrl.replace("{{contact.id}}", context.contact.id);
      }

      const parsedHeaders = headers ? JSON.parse(headers) : {};
      const parsedBody =
        body && method !== "GET" ? JSON.parse(body) : undefined;

      const response = await axios({
        method: method || "GET",
        url: finalUrl,
        headers: parsedHeaders,
        data: parsedBody,
      });

      this.logger.log(`API Request Successful: ${response.status}`);

      const varName = variableName || "apiResponse";
      context[varName] = response.data;
    } catch (error) {
      this.logger.error(`API Request Failed: ${error.message}`);
      if (error.response) {
        this.logger.error(
          `Response Data: ${JSON.stringify(error.response.data)}`,
        );
      }
      throw new Error(`API Request Failed: ${error.message}`);
    }
  }

  private async handleGoogleDriveNode(
    tenantId: string,
    node: any,
    context: any,
  ) {
    const { operation, fileId, fileName, fileContent, mimeType, variableName } =
      node.data;
    this.logger.log(`Executing Google Drive Operation: ${operation}`);

    try {
      // Mock Access Token - in real world, fetch from DB/Auth Service
      const accessToken = "mock-access-token";
      let result;

      if (operation === "upload") {
        // In a real scenario, fileContent might come from a previous node (e.g., generated report)
        // For now, we mock it or expect a string
        result = await this.googleService.uploadFile(
          tenantId,
          accessToken,
          fileContent || "Mock Content",
          fileName || "upload.txt",
          mimeType || "text/plain",
        );
      } else if (operation === "read") {
        result = await this.googleService.readFile(
          tenantId,
          accessToken,
          fileId,
        );
      } else if (operation === "list") {
        result = await this.googleService.listFiles(tenantId, accessToken);
      }

      const varName = variableName || "driveResult";
      context[varName] = result;
    } catch (error) {
      this.logger.error(`Google Drive Operation Failed: ${error.message}`);
      throw new Error(`Google Drive Operation Failed: ${error.message}`);
    }
  }
}
