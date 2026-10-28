import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";
import { TokenService } from "@everpride/auth";
import { ChatService } from "./chat.service.js";

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: "*",
    credentials: true,
  },
  namespace: "/chat",
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private tokenService: TokenService;

  constructor(private readonly chatService: ChatService) {
    const accessSecret = process.env.JWT_ACCESS_SECRET || "super-secret-access-token-change-in-production";
    this.tokenService = new TokenService(accessSecret);
  }

  emitToUser(userId: string, event: string, data: any) {
    if (this.server) {
      this.server.to(`user:${userId}`).emit(event, data);
    }
  }

  emitToConversation(conversationId: string, event: string, data: any) {
    if (this.server) {
      this.server.to(`conversation:${conversationId}`).emit(event, data);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Connection Lifecycle
  // ─────────────────────────────────────────────────────────────

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const authHeader =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization;

      if (!authHeader) {
        this.logger.warn(`[ChatGateway] Disconnecting unauthenticated socket ${client.id}`);
        client.disconnect();
        return;
      }

      const token = authHeader.replace(/^Bearer\s+/i, "");
      const payload = this.tokenService.verifyAccessToken(token);

      client.userId = payload.userId;

      // Join individual user notifications room
      client.join(`user:${payload.userId}`);

      // Register live presence
      const becameOnline = this.chatService.registerUserSocket(payload.userId, client.id);

      if (becameOnline) {
        this.logger.log(`[ChatGateway] User ${payload.userId} came online`);
        this.server.emit("presence_update", {
          userId: payload.userId,
          isOnline: true,
        });
      }
    } catch (err) {
      this.logger.error(`[ChatGateway] Socket auth verification failed: ${err}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      const becameOffline = this.chatService.removeUserSocket(client.userId, client.id);
      if (becameOffline) {
        this.logger.log(`[ChatGateway] User ${client.userId} went offline`);
        this.server.emit("presence_update", {
          userId: client.userId,
          isOnline: false,
          lastSeenAt: new Date().toISOString(),
        });
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // WebSocket Events
  // ─────────────────────────────────────────────────────────────

  @SubscribeMessage("join_conversation")
  handleJoinConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string }
  ) {
    if (!data?.conversationId) return;
    client.join(`conversation:${data.conversationId}`);
    return { status: "joined", conversationId: data.conversationId };
  }

  @SubscribeMessage("leave_conversation")
  handleLeaveConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string }
  ) {
    if (!data?.conversationId) return;
    client.leave(`conversation:${data.conversationId}`);
    return { status: "left", conversationId: data.conversationId };
  }

  @SubscribeMessage("send_message")
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string; content: string }
  ) {
    if (!client.userId) return;
    if (!data?.conversationId || !data?.content?.trim()) return;

    try {
      const { message, recipientId, sender } = await this.chatService.sendMessage(client.userId, {
        conversationId: data.conversationId,
        content: data.content.trim(),
      });

      // 1. Broadcast message to everyone inside the conversation room
      this.server.to(`conversation:${data.conversationId}`).emit("new_message", message);

      // 2. Also notify the recipient's personal user room (for toast notifications & unread badges)
      this.server.to(`user:${recipientId}`).emit("incoming_message_notification", {
        conversationId: data.conversationId,
        message,
        sender,
      });

      return { status: "sent", message };
    } catch (error: any) {
      return { status: "error", message: error.message || "Failed to send message" };
    }
  }

  @SubscribeMessage("typing")
  handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string; isTyping: boolean }
  ) {
    if (!client.userId || !data?.conversationId) return;

    client.to(`conversation:${data.conversationId}`).emit("user_typing", {
      conversationId: data.conversationId,
      userId: client.userId,
      isTyping: !!data.isTyping,
    });
  }

  @SubscribeMessage("mark_read")
  async handleMarkRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string }
  ) {
    if (!client.userId || !data?.conversationId) return;

    try {
      const result = await this.chatService.markAsRead(client.userId, data.conversationId);

      // Notify other participant that messages have been read
      client.to(`conversation:${data.conversationId}`).emit("messages_read", result);

      return { status: "success" };
    } catch (error) {
      return { status: "error" };
    }
  }

  @SubscribeMessage("edit_message")
  async handleEditMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: string; content: string }
  ) {
    if (!client.userId || !data?.messageId || !data?.content?.trim()) {
      return { status: "error", message: "Invalid payload" };
    }

    try {
      const updated = await this.chatService.editMessage(
        client.userId,
        data.messageId,
        data.content.trim()
      );

      this.emitToConversation(updated.conversationId, "message_edited", updated);
      return { status: "success", message: updated };
    } catch (error: any) {
      return { status: "error", message: error.message || "Failed to edit message" };
    }
  }

  @SubscribeMessage("delete_message")
  async handleDeleteMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: string }
  ) {
    if (!client.userId || !data?.messageId) {
      return { status: "error", message: "Invalid payload" };
    }

    try {
      const result = await this.chatService.deleteMessage(client.userId, data.messageId);

      this.emitToConversation(result.conversationId, "message_deleted", result);
      return { status: "success", ...result };
    } catch (error: any) {
      return { status: "error", message: error.message || "Failed to delete message" };
    }
  }
}

