import { Injectable, Logger } from "@nestjs/common";
import { NodeExecutor } from "./executor.interface";
import { VariableResolverService } from "../variable-resolver.service";
import { MessagesService } from "../../messages/messages.service";

@Injectable()
export class ActionExecutor implements NodeExecutor {
  private readonly logger = new Logger(ActionExecutor.name);

  constructor(
    private variableResolver: VariableResolverService,
    private messagesService: MessagesService,
  ) {}

  async execute(node: any, context: any): Promise<any> {
    const data = node.data;
    const tenantId = context.tenantId;
    const to =
      context.from ||
      context.contact?.phone ||
      context.trigger?.data?.from ||
      context.trigger?.from;

    if (!to) {
      throw new Error("Destination phone number not found in context");
    }

    if (node.type === "template") {
      const rawComponents = data.components;
      let parsedComponents: any[] = [];
      if (typeof rawComponents === "string" && rawComponents.trim()) {
        try {
          const decoded = JSON.parse(this.variableResolver.resolve(rawComponents, context));
          if (Array.isArray(decoded)) parsedComponents = decoded;
        } catch {
          parsedComponents = [];
        }
      }

      await this.messagesService.send({
        tenantId,
        to,
        type: "template",
        payload: {
          name: data.templateName,
          language: { code: data.language || "en_US" },
          ...(parsedComponents.length ? { components: parsedComponents } : {}),
        },
      });

      return { status: "sent", to, type: "template", template: data.templateName };
    }

    if (node.type === "whatsapp_flow" || node.type === "wa_form") {
      const resolvedFlowId = data.flowId || data.metaFlowId || data.formId;
      if (!resolvedFlowId) {
        throw new Error("WA Form/WhatsApp Flow node requires flowId");
      }

      const resolvedBody = this.variableResolver.resolve(
        data.bodyText || "Please complete the form to continue.",
        context,
      );

      let flowPayloadData: any = undefined;
      if (data.payload) {
        try {
          flowPayloadData = JSON.parse(this.variableResolver.resolve(data.payload, context));
        } catch {
          flowPayloadData = this.variableResolver.resolve(data.payload, context);
        }
      }

      await this.messagesService.send({
        tenantId,
        to,
        type: "interactive",
        payload: {
          type: "flow",
          body: { text: resolvedBody },
          action: {
            name: "flow",
            parameters: {
              flow_message_version: "3",
              flow_token: data.flowToken || `aimstors_${Date.now()}`,
              flow_id: String(resolvedFlowId),
              flow_cta: String(data.ctaText || "Open Form"),
              flow_action: String(data.flowAction || "NAVIGATE"),
              ...(data.screenId || flowPayloadData
                ? {
                    flow_action_payload: {
                      ...(data.screenId ? { screen: data.screenId } : {}),
                      ...(flowPayloadData ? { data: flowPayloadData } : {}),
                    },
                  }
                : {}),
            },
          },
        },
      });

      return {
        status: "sent",
        to,
        type: node.type === "wa_form" ? "wa_form" : "whatsapp_flow",
        flowId: resolvedFlowId,
      };
    }

    const message = this.variableResolver.resolve(data.message || "", context);
    const nodeType = node.type;

    // Handle Media Nodes or Message Nodes with Media
    if (nodeType === "photo" || nodeType === "video" || nodeType === "doc" || data.mediaUrl) {
      const mediaType = nodeType === "photo" ? "image" : nodeType === "video" ? "video" : nodeType === "doc" ? "document" : "image";
      const mediaUrl = this.variableResolver.resolve(data.mediaUrl || "", context);
      
      if (mediaUrl) {
        // If buttons are present, send as interactive media message
        if (data.buttons && data.buttons.length > 0) {
          await this.messagesService.send({
            tenantId,
            to,
            type: "interactive",
            payload: {
              type: "button",
              header: { 
                type: mediaType, 
                [mediaType]: { link: mediaUrl } 
              },
              body: { text: message || "Select an option" },
              action: {
                buttons: data.buttons.slice(0, 3).map((b: any) => ({
                  type: "reply",
                  reply: { id: b.id, title: b.text.substring(0, 20) }
                }))
              }
            }
          });
          return { status: "sent", to, type: "interactive_media", mediaType, buttons: data.buttons.length };
        }

        // Otherwise send as standard media message
        const payload: Record<string, any> = { link: mediaUrl };
        if (message) payload.caption = message;
        if (mediaType === "document" && data.mediaFilename) {
          payload.filename = this.variableResolver.resolve(data.mediaFilename, context);
        }

        await this.messagesService.send({
          tenantId,
          to,
          type: mediaType,
          payload,
        });
        return { status: "sent", to, type: mediaType, mediaUrl };
      }
    }

    // Handle Text Message with Buttons
    if (data.buttons && data.buttons.length > 0) {
      await this.messagesService.send({
        tenantId,
        to,
        type: "interactive",
        payload: {
          type: "button",
          body: { text: message || "Select an option" },
          action: {
            buttons: data.buttons.slice(0, 3).map((b: any) => ({
              type: "reply",
              reply: { id: b.id, title: b.text.substring(0, 20) }
            }))
          }
        }
      });
      return { status: "sent", to, type: "interactive_text", buttons: data.buttons.length };
    }

    // Fallback to standard Text Message
    await this.messagesService.send({
      tenantId,
      to,
      type: "text",
      payload: { text: message || "..." },
    });

    return {
      status: "sent",
      to,
      message,
      type: "text",
    };
  }
}
