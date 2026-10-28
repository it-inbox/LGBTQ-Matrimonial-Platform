import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Inject,
  forwardRef,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { ChatService } from "./chat.service.js";
import { ChatGateway } from "./chat.gateway.js";
import { AuthGuard } from "../../common/guards/auth.guard.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.js";
import {
  sendMessageSchema,
  SendMessageInput,
  editMessageSchema,
  EditMessageInput,
} from "@everpride/shared";

@ApiTags("Chat & Messaging")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("chat")
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway
  ) {}

  @Get("conversations")
  @ApiOperation({ summary: "Get all user conversations with partner info, unread count, and last message" })
  async getConversations(
    @CurrentUser("userId") userId: string,
    @Query("filter") filter?: "all" | "unread" | "online"
  ) {
    return this.chatService.getConversations(userId, filter);
  }

  @Post("conversations/with/:partnerUserId")
  @ApiOperation({ summary: "Get or create a conversation with a matched partner" })
  async getOrCreateConversation(
    @CurrentUser("userId") userId: string,
    @Param("partnerUserId") partnerUserId: string
  ) {
    return this.chatService.getOrCreateConversation(userId, partnerUserId);
  }

  @Get("conversations/:id/messages")
  @ApiOperation({ summary: "Get paginated messages for a conversation" })
  async getMessages(
    @CurrentUser("userId") userId: string,
    @Param("id") conversationId: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string
  ) {
    return this.chatService.getMessages(
      userId,
      conversationId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50
    );
  }

  @Post("messages")
  @ApiOperation({ summary: "Send a message via REST fallback" })
  async sendMessage(
    @CurrentUser("userId") userId: string,
    @Body(new ZodValidationPipe(sendMessageSchema)) dto: SendMessageInput
  ) {
    return this.chatService.sendMessage(userId, dto);
  }

  @Patch("messages/:id")
  @ApiOperation({ summary: "Edit a message" })
  async editMessage(
    @CurrentUser("userId") userId: string,
    @Param("id") messageId: string,
    @Body(new ZodValidationPipe(editMessageSchema)) dto: EditMessageInput
  ) {
    const updated = await this.chatService.editMessage(userId, messageId, dto.content);
    // Broadcast via socket to conversation room
    this.chatGateway.emitToConversation(updated.conversationId, "message_edited", updated);
    return updated;
  }

  @Delete("messages/:id")
  @ApiOperation({ summary: "Delete a message" })
  async deleteMessage(
    @CurrentUser("userId") userId: string,
    @Param("id") messageId: string
  ) {
    const result = await this.chatService.deleteMessage(userId, messageId);
    // Broadcast via socket to conversation room
    this.chatGateway.emitToConversation(result.conversationId, "message_deleted", result);
    return result;
  }

  @Post("conversations/:id/read")
  @ApiOperation({ summary: "Mark conversation messages as read" })
  async markAsRead(
    @CurrentUser("userId") userId: string,
    @Param("id") conversationId: string
  ) {
    return this.chatService.markAsRead(userId, conversationId);
  }

  @Get("online-matches")
  @ApiOperation({ summary: "Get list of accepted matches currently online" })
  async getOnlineMatches(@CurrentUser("userId") userId: string) {
    return this.chatService.getOnlineMatches(userId);
  }
}

