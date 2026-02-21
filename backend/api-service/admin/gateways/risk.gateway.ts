import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger, OnModuleInit } from "@nestjs/common";
import { RedisService } from "@shared/redis.service";

@WebSocketGateway({
  namespace: "admin/risk-stream",
  cors: {
    origin: "*",
  },
})
export class RiskGateway
  implements
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnModuleInit
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RiskGateway.name);

  constructor(private readonly redisService: RedisService) {}

  afterInit(server: Server) {
    this.logger.log("Risk WebSocket Gateway initialized");
  }

  handleConnection(client: Socket) {
    this.logger.log(`Admin connected to risk-stream: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Admin disconnected from risk-stream: ${client.id}`);
  }

  async onModuleInit() {
    // Setup Redis Subscriber to bridge from worker-service
    const subscriber = this.redisService.createSubscriber();

    await subscriber.subscribe(
      "risk_platform_update",
      "risk_tenant_update",
      "security_alerts",
    );

    subscriber.on("message", (channel, message) => {
      try {
        const data = JSON.parse(message);

        if (channel === "risk_platform_update") {
          this.server.emit("platform_risk_update", data);
        } else if (channel === "risk_tenant_update") {
          this.server.emit("tenant_risk_update", data);
        } else if (channel === "security_alerts") {
          this.server.emit("security_alert", data);
        }
      } catch (err) {
        this.logger.error(
          `Failed to handle redis message on channel ${channel}`,
          err,
        );
      }
    });

    this.logger.log("📡 RiskGateway bridging Redis Pub/Sub to WebSockets");
  }
}
