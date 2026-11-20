import { describe, it, expect, vi, beforeEach } from "vitest";
import { ChatService } from "./chat.service.js";
import { ForbiddenException, BadRequestException, NotFoundException } from "@nestjs/common";

describe("ChatService", () => {
  let service: ChatService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      client: {
        user: {
          findUnique: vi.fn(),
        },
        conversation: {
          findMany: vi.fn(),
          findFirst: vi.fn(),
          findUnique: vi.fn(),
          create: vi.fn(),
          update: vi.fn(),
        },
        message: {
          create: vi.fn(),
          findMany: vi.fn(),
          count: vi.fn(),
          updateMany: vi.fn(),
        },
        blockedUser: {
          findFirst: vi.fn(),
        },
        matchInterest: {
          findFirst: vi.fn(),
        },
        photoAccessRequest: {
          findUnique: vi.fn(),
        },
        $transaction: vi.fn((promises) => Promise.all(promises)),
      },
    };

    service = new ChatService(mockPrisma);
  });

  describe("Presence Tracking", () => {
    it("should track online user socket connections and disconnects", () => {
      expect(service.isUserOnline("user1")).toBe(false);
      const firstConnected = service.registerUserSocket("user1", "socket-a");
      expect(firstConnected).toBe(true);
      expect(service.isUserOnline("user1")).toBe(true);

      const secondConnected = service.registerUserSocket("user1", "socket-b");
      expect(secondConnected).toBe(false);
      expect(service.isUserOnline("user1")).toBe(true);

      const removedFirst = service.removeUserSocket("user1", "socket-a");
      expect(removedFirst).toBe(false);
      expect(service.isUserOnline("user1")).toBe(true);

      const removedSecond = service.removeUserSocket("user1", "socket-b");
      expect(removedSecond).toBe(true);
      expect(service.isUserOnline("user1")).toBe(false);
    });
  });

  describe("getOrCreateConversation", () => {
    it("throws BadRequestException if userId equals partnerUserId", async () => {
      await expect(service.getOrCreateConversation("user1", "user1")).rejects.toThrow(BadRequestException);
    });

    it("throws BadRequestException if communication is blocked", async () => {
      mockPrisma.client.blockedUser.findFirst.mockResolvedValueOnce({ id: "block1" });
      await expect(service.getOrCreateConversation("user1", "user2")).rejects.toThrow(
        "Communication is blocked between these accounts"
      );
    });

    it("throws ForbiddenException if no mutual accepted match exists", async () => {
      mockPrisma.client.blockedUser.findFirst.mockResolvedValueOnce(null);
      mockPrisma.client.matchInterest.findFirst.mockResolvedValueOnce(null);

      await expect(service.getOrCreateConversation("user1", "user2")).rejects.toThrow(
        "Cannot start conversation without mutual accepted match"
      );
    });
  });

  describe("sendMessage", () => {
    it("throws NotFoundException if conversation does not exist", async () => {
      mockPrisma.client.conversation.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.sendMessage("user1", { conversationId: "conv-1", content: "hello" })
      ).rejects.toThrow(NotFoundException);
    });

    it("throws ForbiddenException if sender is not participant in conversation", async () => {
      mockPrisma.client.conversation.findUnique.mockResolvedValueOnce({
        id: "conv-1",
        participant1Id: "user2",
        participant2Id: "user3",
      });

      await expect(
        service.sendMessage("user1", { conversationId: "conv-1", content: "hello" })
      ).rejects.toThrow(ForbiddenException);
    });

    it("throws BadRequestException if sender or recipient is blocked", async () => {
      mockPrisma.client.conversation.findUnique.mockResolvedValueOnce({
        id: "conv-1",
        participant1Id: "user1",
        participant2Id: "user2",
      });
      mockPrisma.client.blockedUser.findFirst.mockResolvedValueOnce({ id: "block-1" });

      await expect(
        service.sendMessage("user1", { conversationId: "conv-1", content: "hello" })
      ).rejects.toThrow("Cannot send message. Communication is blocked between these accounts.");
    });

    it("creates message with recipientId and updates conversation timestamp", async () => {
      mockPrisma.client.conversation.findUnique.mockResolvedValueOnce({
        id: "conv-1",
        participant1Id: "user1",
        participant2Id: "user2",
      });
      mockPrisma.client.blockedUser.findFirst.mockResolvedValueOnce(null);

      const createdMsg = {
        id: "msg-1",
        conversationId: "conv-1",
        senderId: "user1",
        recipientId: "user2",
        content: "hello",
      };
      mockPrisma.client.message.create.mockReturnValue(Promise.resolve(createdMsg));
      mockPrisma.client.conversation.update.mockReturnValue(Promise.resolve({ id: "conv-1" }));
      mockPrisma.client.user.findUnique.mockResolvedValueOnce({
        id: "user1",
        profile: { displayName: "Alice", photos: [] },
      });

      const result = await service.sendMessage("user1", {
        conversationId: "conv-1",
        content: "hello",
      });

      expect(mockPrisma.client.message.create).toHaveBeenCalledWith({
        data: {
          conversationId: "conv-1",
          senderId: "user1",
          recipientId: "user2",
          content: "hello",
        },
      });
      expect(result.message).toEqual(createdMsg);
      expect(result.recipientId).toBe("user2");
      expect(result.sender.displayName).toBe("Alice");
    });
  });
});
