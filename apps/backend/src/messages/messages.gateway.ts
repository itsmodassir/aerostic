import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
    cors: {
        origin: '*', // In production, restrict to your frontend domain
    },
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(MessagesGateway.name);

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('joinTenant')
    handleJoinTenant(client: Socket, tenantId: string) {
        client.join(tenantId);
        this.logger.log(`Client ${client.id} joined tenant room: ${tenantId}`);
        return { event: 'joinedTenant', data: { tenantId } };
    }

    @SubscribeMessage('leaveTenant')
    handleLeaveTenant(client: Socket, tenantId: string) {
        client.leave(tenantId);
        this.logger.log(`Client ${client.id} left tenant room: ${tenantId}`);
        return { event: 'leftTenant', data: { tenantId } };
    }

    /**
     * Emit a new message event to all clients in a tenant room
     */
    emitNewMessage(tenantId: string, payload: any) {
        this.server.to(tenantId).emit('newMessage', payload);
    }

    /**
     * Emit a message status update to all clients in a tenant room
     */
    emitMessageStatus(tenantId: string, payload: any) {
        this.server.to(tenantId).emit('messageStatus', payload);
    }

    /**
     * Emit a conversation update to all clients in a tenant room
     */
    emitConversationUpdate(tenantId: string, payload: any) {
        this.server.to(tenantId).emit('conversationUpdate', payload);
    }

    /**
     * Handle typing indicator events
     * Broadcasts typing status to all agents in the tenant room
     */
    @SubscribeMessage('typing')
    handleTyping(client: Socket, payload: { tenantId: string; conversationId: string; agentId?: string; isTyping: boolean }) {
        this.logger.log(`Typing event from ${client.id}: ${JSON.stringify(payload)}`);

        // Broadcast to all clients in the tenant room except the sender
        client.to(payload.tenantId).emit('typing', payload);

        return { event: 'typingAck', data: { received: true } };
    }

    /**
     * Handle agent online event
     */
    @SubscribeMessage('agentOnline')
    handleAgentOnline(client: Socket, payload: { tenantId: string; agentId: string; agentName: string }) {
        this.logger.log(`Agent ${payload.agentId} is online in tenant ${payload.tenantId}`);

        // Broadcast to all clients in the tenant room
        this.server.to(payload.tenantId).emit('agentOnline', payload);

        return { event: 'agentOnlineAck', data: { agentId: payload.agentId } };
    }

    /**
     * Handle agent offline event
     */
    @SubscribeMessage('agentOffline')
    handleAgentOffline(client: Socket, payload: { tenantId: string; agentId: string }) {
        this.logger.log(`Agent ${payload.agentId} is offline in tenant ${payload.tenantId}`);

        // Broadcast to all clients in the tenant room
        this.server.to(payload.tenantId).emit('agentOffline', payload);

        return { event: 'agentOfflineAck', data: { agentId: payload.agentId } };
    }

    /**
     * Handle mark as read event
     * This is for internal tracking when an agent reads messages
     */
    @SubscribeMessage('markAsRead')
    handleMarkAsRead(client: Socket, payload: { tenantId: string; conversationId: string; agentId?: string }) {
        this.logger.log(`Messages marked as read in conversation ${payload.conversationId}`);

        // Broadcast to all clients in the tenant room
        this.server.to(payload.tenantId).emit('messageRead', payload);

        return { event: 'markAsReadAck', data: { conversationId: payload.conversationId } };
    }
}
