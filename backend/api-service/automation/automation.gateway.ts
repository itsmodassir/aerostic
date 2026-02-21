import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { UseGuards, Logger } from "@nestjs/common";
import { JwtAuthGuard } from "@api/auth/jwt-auth.guard";

@WebSocketGateway({
  cors: {
    origin: "*",
  },
  namespace: "automation",
})
export class AutomationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AutomationGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected to automation gateway: ${client.id}`);
  }

  handleGatewayDisconnect(client: Socket) {
    this.logger.log(
      `Client disconnected from automation gateway: ${client.id}`,
    );
  }

  @SubscribeMessage("subscribe_execution")
  handleSubscribeExecution(client: Socket, executionId: string) {
    this.logger.log(
      `Client ${client.id} subscribed to execution: ${executionId}`,
    );
    client.join(`execution_${executionId}`);
  }

  @SubscribeMessage("unsubscribe_execution")
  handleUnsubscribeExecution(client: Socket, executionId: string) {
    this.logger.log(
      `Client ${client.id} unsubscribed from execution: ${executionId}`,
    );
    client.leave(`execution_${executionId}`);
  }

  emitExecutionEvent(executionId: string, event: string, data: any) {
    this.server.to(`execution_${executionId}`).emit("execution_event", {
      event,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(
      `Client disconnected from automation tracing: ${client.id}`,
    );
  }
}
