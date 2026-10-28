import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { SendMessageInput } from "@everpride/shared";

@Injectable()
export class ChatService {
  // In-memory live socket presence tracking: userId -> Set of active socketIds
  private onlineUsersMap = new Map<string, Set<string>>();

  constructor(private readonly prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────
  // Presence Tracking
  // ─────────────────────────────────────────────────────────────
  registerUserSocket(userId: string, socketId: string): boolean {
    let sockets = this.onlineUsersMap.get(userId);
    const isFirstSocket = !sockets || sockets.size === 0;
    if (!sockets) {
      sockets = new Set();
      this.onlineUsersMap.set(userId, sockets);
    }
    sockets.add(socketId);
    return isFirstSocket;
  }

  removeUserSocket(userId: string, socketId: string): boolean {
    const sockets = this.onlineUsersMap.get(userId);
    if (!sockets) return false;
    sockets.delete(socketId);
    if (sockets.size === 0) {
      this.onlineUsersMap.delete(userId);
      return true; // user is now fully offline
    }
    return false;
  }

  isUserOnline(userId: string): boolean {
    const sockets = this.onlineUsersMap.get(userId);
    return !!(sockets && sockets.size > 0);
  }

  getOnlineUserIds(): string[] {
    return Array.from(this.onlineUsersMap.keys());
  }

  // ─────────────────────────────────────────────────────────────
  // Conversations & Messaging
  // ─────────────────────────────────────────────────────────────

  /**
   * Get all conversations for a user with partner profile, last message snippet,
   * unread counts, and live online status.
   */
  async getConversations(userId: string, filter?: "all" | "unread" | "online") {
    const conversations = await this.prisma.client.conversation.findMany({
      where: {
        OR: [{ participant1Id: userId }, { participant2Id: userId }],
      },
      include: {
        participant1: {
          include: {
            profile: {
              include: { photos: { where: { isPrimary: true } } },
            },
          },
        },
        participant2: {
          include: {
            profile: {
              include: { photos: { where: { isPrimary: true } } },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Check mutual photo permissions and count unread messages
    const formatted = await Promise.all(
      conversations.map(async (conv) => {
        const partner = conv.participant1Id === userId ? conv.participant2 : conv.participant1;
        const lastMessage = conv.messages[0] || null;

        const unreadCount = await this.prisma.client.message.count({
          where: {
            conversationId: conv.id,
            senderId: partner.id,
            isRead: false,
          },
        });

        // Photo access permission
        const photoRequest = await this.prisma.client.photoAccessRequest.findUnique({
          where: {
            requesterId_targetId: {
              requesterId: userId,
              targetId: partner.id,
            },
          },
        });
        const canViewOriginal =
          partner.profile?.photoVisibility === "ALL_MEMBERS" ||
          (partner.profile?.photoVisibility === "MUTUAL_MATCHES_ONLY") ||
          photoRequest?.status === "ACCEPTED";

        const primaryPhoto = partner.profile?.photos?.[0];
        const displayPhotoUrl = primaryPhoto
          ? canViewOriginal
            ? primaryPhoto.originalUrl
            : primaryPhoto.blurredUrl || primaryPhoto.originalUrl
          : null;

        return {
          id: conv.id,
          updatedAt: conv.updatedAt,
          partner: {
            id: partner.id,
            displayName: partner.profile?.displayName || "Member",
            gender: partner.profile?.gender,
            city: partner.profile?.city,
            state: partner.profile?.state,
            profession: partner.profile?.profession,
            avatarUrl: displayPhotoUrl,
            isOnline: this.isUserOnline(partner.id),
          },
          lastMessage: lastMessage
            ? {
                id: lastMessage.id,
                content: lastMessage.content,
                createdAt: lastMessage.createdAt,
                senderId: lastMessage.senderId,
                isRead: lastMessage.isRead,
                isOwn: lastMessage.senderId === userId,
              }
            : null,
          unreadCount,
        };
      })
    );

    if (filter === "unread") {
      return formatted.filter((c) => c.unreadCount > 0);
    }
    if (filter === "online") {
      return formatted.filter((c) => c.partner.isOnline);
    }

    return formatted;
  }

  /**
   * Get an existing conversation between two users, or create one if it doesn't exist yet
   */
  async getOrCreateConversation(userId: string, partnerUserId: string) {
    if (userId === partnerUserId) {
      throw new BadRequestException("Cannot create conversation with yourself");
    }

    // Check if communication is blocked
    const isBlocked = await this.prisma.client.blockedUser.findFirst({
      where: {
        OR: [
          { userId, blockedId: partnerUserId },
          { userId: partnerUserId, blockedId: userId },
        ],
      },
    });

    if (isBlocked) {
      throw new BadRequestException("Communication is blocked between these accounts");
    }

    // Verify mutual match exists
    const mutualMatch = await this.prisma.client.matchInterest.findFirst({
      where: {
        OR: [
          { senderId: userId, receiverId: partnerUserId, status: "ACCEPTED" },
          { senderId: partnerUserId, receiverId: userId, status: "ACCEPTED" },
        ],
      },
    });

    if (!mutualMatch) {
      throw new ForbiddenException("Cannot start conversation without mutual accepted match");
    }

    // Find or create conversation
    let conv = await this.prisma.client.conversation.findFirst({
      where: {
        OR: [
          { participant1Id: userId, participant2Id: partnerUserId },
          { participant1Id: partnerUserId, participant2Id: userId },
        ],
      },
    });

    if (!conv) {
      const p1 = userId < partnerUserId ? userId : partnerUserId;
      const p2 = userId < partnerUserId ? partnerUserId : userId;
      conv = await this.prisma.client.conversation.create({
        data: {
          participant1Id: p1,
          participant2Id: p2,
        },
      });
    }

    // Return the formatted conversation item
    const formattedList = await this.getConversations(userId, "all");
    const formattedItem = formattedList.find((c) => c.id === conv.id);

    return formattedItem || { id: conv.id };
  }

  /**
   * Get paginated messages for a conversation
   */
  async getMessages(userId: string, conversationId: string, page = 1, limit = 50) {
    const conversation = await this.prisma.client.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException("Conversation not found");
    }

    if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
      throw new ForbiddenException("You are not a participant in this conversation");
    }

    const skip = (page - 1) * limit;

    const [messages, totalCount] = await Promise.all([
      this.prisma.client.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.client.message.count({ where: { conversationId } }),
    ]);

    // Format chronologically for client reading
    return {
      messages: messages.reverse(),
      pagination: {
        page,
        limit,
        total: totalCount,
        hasMore: skip + messages.length < totalCount,
      },
    };
  }

  /**
   * Post message via REST or WebSocket
   */
  async sendMessage(senderId: string, dto: SendMessageInput) {
    const conversation = await this.prisma.client.conversation.findUnique({
      where: { id: dto.conversationId },
    });

    if (!conversation) {
      throw new NotFoundException("Conversation not found");
    }

    if (conversation.participant1Id !== senderId && conversation.participant2Id !== senderId) {
      throw new ForbiddenException("You are not authorized to send messages in this conversation");
    }

    const recipientId = conversation.participant1Id === senderId ? conversation.participant2Id : conversation.participant1Id;

    // Check if either party blocked each other
    const isBlocked = await this.prisma.client.blockedUser.findFirst({
      where: {
        OR: [
          { userId: senderId, blockedId: recipientId },
          { userId: recipientId, blockedId: senderId },
        ],
      },
    });

    if (isBlocked) {
      throw new BadRequestException("Cannot send message. Communication is blocked between these accounts.");
    }

    const [message] = await this.prisma.client.$transaction([
      this.prisma.client.message.create({
        data: {
          conversationId: dto.conversationId,
          senderId,
          content: dto.content,
        },
      }),
      this.prisma.client.conversation.update({
        where: { id: dto.conversationId },
        data: { updatedAt: new Date() },
      }),
    ]);

    // Fetch sender profile details for notifications
    const sender = await this.prisma.client.user.findUnique({
      where: { id: senderId },
      include: {
        profile: {
          include: {
            photos: { where: { isPrimary: true } },
          },
        },
      },
    });

    const senderPhoto = sender?.profile?.photos?.[0];

    return {
      message,
      recipientId,
      sender: {
        id: senderId,
        displayName: sender?.profile?.displayName || "Member",
        avatarUrl: senderPhoto?.originalUrl || senderPhoto?.blurredUrl || null,
      },
    };
  }

  /**
   * Mark all unread messages in a conversation as read by the user
   */
  async markAsRead(userId: string, conversationId: string) {
    const conversation = await this.prisma.client.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException("Conversation not found");
    }

    if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
      throw new ForbiddenException("Unauthorized");
    }

    const recipientId = conversation.participant1Id === userId ? conversation.participant2Id : conversation.participant1Id;

    await this.prisma.client.message.updateMany({
      where: {
        conversationId,
        senderId: recipientId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return { conversationId, readerId: userId };
  }

  /**
   * Edit a sent message
   */
  async editMessage(userId: string, messageId: string, content: string) {
    const message = await this.prisma.client.message.findUnique({
      where: { id: messageId },
      include: { conversation: true },
    });

    if (!message) {
      throw new NotFoundException("Message not found");
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException("You can only edit your own messages");
    }

    if (message.isDeleted) {
      throw new BadRequestException("Cannot edit a deleted message");
    }

    const updated = await this.prisma.client.message.update({
      where: { id: messageId },
      data: {
        content: content.trim(),
        isEdited: true,
      },
    });

    return updated;
  }

  /**
   * Delete a sent message (soft delete so conversation continuity is maintained, or for both participants)
   */
  async deleteMessage(userId: string, messageId: string) {
    const message = await this.prisma.client.message.findUnique({
      where: { id: messageId },
      include: { conversation: true },
    });

    if (!message) {
      throw new NotFoundException("Message not found");
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException("You can only delete your own messages");
    }

    const updated = await this.prisma.client.message.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        content: "This message was deleted",
      },
    });

    return {
      success: true,
      messageId: updated.id,
      conversationId: updated.conversationId,
      message: updated,
    };
  }

  /**
   * Get online matches list for the top strip
   */
  async getOnlineMatches(userId: string) {
    // 1. Get mutual accepted matches
    const acceptedInterests = await this.prisma.client.matchInterest.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
        status: "ACCEPTED",
      },
      include: {
        sender: {
          include: {
            profile: {
              include: { photos: { where: { isPrimary: true } } },
            },
          },
        },
        receiver: {
          include: {
            profile: {
              include: { photos: { where: { isPrimary: true } } },
            },
          },
        },
      },
    });

    const onlineMatches: any[] = [];
    const seenUserIds = new Set<string>();

    for (const interest of acceptedInterests) {
      const partner = interest.senderId === userId ? interest.receiver : interest.sender;
      if (!partner?.id || seenUserIds.has(partner.id)) {
        continue;
      }
      seenUserIds.add(partner.id);

      if (this.isUserOnline(partner.id)) {
        const photo = partner.profile?.photos?.[0];
        onlineMatches.push({
          userId: partner.id,
          displayName: partner.profile?.displayName || "Member",
          photoUrl: photo?.blurredUrl || photo?.originalUrl || null,
          gender: partner.profile?.gender,
          city: partner.profile?.city,
        });
      }
    }

    return onlineMatches;
  }
}

