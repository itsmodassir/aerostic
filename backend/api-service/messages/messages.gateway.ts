import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger, OnModuleInit } from "@nestjs/common";
import { RedisService } from "@shared/redis.service";

@WebSocketGateway({
  cors: {
    origin: "*", // In production, restrict to your frontend domain
  },
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagesGateway.name);

  constructor(private redisService: RedisService) { }

  async onModuleInit() {
    const subscriber = this.redisService.createSubscriber();
    await subscriber.subscribe("chat_events");

    subscriber.on("message", (channel, message) => {
      try {
        if (channel === "chat_events") {
          const { event, tenantId, payload } = JSON.parse(message);
          this.server.to(tenantId).emit(event, payload);
        }
      } catch (err) {
        this.logger.error("Failed to parse redis chat_events message", err);
      }
    });

    this.logger.log("📡 MessagesGateway bridged to Redis Pub/Sub");
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage("joinTenant")
  handleJoinTenant(client: Socket, tenantId: string) {
    client.join(tenantId);
    this.logger.log(`Client ${client.id} joined tenant room: ${tenantId}`);
    return { event: "joinedTenant", data: { tenantId } };
  }

  @SubscribeMessage("leaveTenant")
  handleLeaveTenant(client: Socket, tenantId: string) {
    client.leave(tenantId);
    this.logger.log(`Client ${client.id} left tenant room: ${tenantId}`);
    return { event: "leftTenant", data: { tenantId } };
  }

  /**
   * Emit a new message event to all clients in a tenant room (via Redis)
   */
  emitNewMessage(tenantId: string, payload: any) {
    this.redisService.publish("chat_events", { event: "newMessage", tenantId, payload });
  }

  /**
   * Emit a message status update to all clients in a tenant room
   */
  emitMessageStatus(tenantId: string, payload: any) {
    this.redisService.publish("chat_events", { event: "messageStatus", tenantId, payload });
  }

  /**
   * Emit a conversation update to all clients in a tenant room
   */
  emitConversationUpdate(tenantId: string, payload: any) {
    this.redisService.publish("chat_events", { event: "conversationUpdate", tenantId, payload });
  }

  /**
   * Emit workflow debug events (node execution status)
   */
  emitWorkflowDebug(
    tenantId: string,
    payload: {
      workflowId: string;
      nodeId: string;
      status: "processing" | "completed" | "failed";
      error?: string;
      result?: any;
    },
  ) {
    this.redisService.publish("chat_events", { event: "workflowDebug", tenantId, payload });
  }

  /**
   * Handle typing indicator events
   */
  @SubscribeMessage("typing")
  handleTyping(
    client: Socket,
    payload: {
      tenantId: string;
      conversationId: string;
      agentId?: string;
      isTyping: boolean;
    },
  ) {
    this.redisService.publish("chat_events", { event: "typing", tenantId: payload.tenantId, payload });
    return { event: "typingAck", data: { received: true } };
  }

  /**
   * Handle agent online event
   */
  @SubscribeMessage("agentOnline")
  handleAgentOnline(
    client: Socket,
    payload: { tenantId: string; agentId: string; agentName: string },
  ) {
    this.redisService.publish("chat_events", { event: "agentOnline", tenantId: payload.tenantId, payload });
    return { event: "agentOnlineAck", data: { agentId: payload.agentId } };
  }

  /**
   * Handle agent offline event
   */
  @SubscribeMessage("agentOffline")
  handleAgentOffline(
    client: Socket,
    payload: { tenantId: string; agentId: string },
  ) {
    this.redisService.publish("chat_events", { event: "agentOffline", tenantId: payload.tenantId, payload });
    return { event: "agentOfflineAck", data: { agentId: payload.agentId } };
  }

  /**
   * Handle mark as read event
   */
  @SubscribeMessage("markAsRead")
  handleMarkAsRead(
    client: Socket,
    payload: { tenantId: string; conversationId: string; agentId?: string },
  ) {
    this.redisService.publish("chat_events", { event: "messageRead", tenantId: payload.tenantId, payload });
    return {
      event: "markAsReadAck",
      data: { conversationId: payload.conversationId },
    };
  }
}
