import { describe, it, expect, vi, beforeEach } from "vitest";
import { MatchesService } from "./matches.service.js";
import { BadRequestException, NotFoundException } from "@nestjs/common";

describe("MatchesService Unit Tests", () => {
  let service: MatchesService;
  let mockPrisma: any;
  let mockChatGateway: any;

  beforeEach(() => {
    mockPrisma = {
      client: {
        profile: {
          findUnique: vi.fn(),
          count: vi.fn(),
          findMany: vi.fn(),
        },
        blockedUser: {
          findMany: vi.fn(),
        },
        matchInterest: {
          findMany: vi.fn(),
          findUnique: vi.fn(),
          findFirst: vi.fn(),
          update: vi.fn(),
          upsert: vi.fn(),
          count: vi.fn(),
          create: vi.fn(),
        },
        photoAccessRequest: {
          findMany: vi.fn(),
          findFirst: vi.fn(),
          create: vi.fn(),
          update: vi.fn(),
        },
        conversation: {
          findFirst: vi.fn(),
          create: vi.fn(),
          upsert: vi.fn(),
        },
        user: {
          findUnique: vi.fn(),
        },
        $transaction: vi.fn((operations) => {
          if (Array.isArray(operations)) {
            return Promise.all(operations);
          }
          if (typeof operations === "function") {
            return operations(mockPrisma.client);
          }
          return Promise.resolve(operations);
        }),
      },
    };

    mockChatGateway = {
      emitToUser: vi.fn(),
    };

    service = new MatchesService(mockPrisma, mockChatGateway);
  });

  describe("getFeed", () => {
    it("should throw BadRequestException if current user profile is not found", async () => {
      mockPrisma.client.profile.findUnique.mockResolvedValue(null);

      await expect(service.getFeed("user-1")).rejects.toThrow(
        "Please complete your profile before browsing matches"
      );
    });

    it("should correctly exclude blocked and already interacted user profiles", async () => {
      mockPrisma.client.profile.findUnique.mockResolvedValue({
        userId: "user-1",
        gender: "MAN",
        lookingFor: ["WOMAN"],
        city: "Mumbai",
        state: "Maharashtra",
        partnerPreference: null,
      });

      mockPrisma.client.blockedUser.findMany.mockResolvedValue([
        { userId: "user-1", blockedId: "blocked-user-2" },
      ]);

      mockPrisma.client.matchInterest.findMany.mockResolvedValue([
        { senderId: "user-1", receiverId: "interacted-user-3" },
      ]);

      mockPrisma.client.profile.count.mockResolvedValue(1);
      mockPrisma.client.profile.findMany.mockResolvedValue([
        {
          userId: "eligible-user-4",
          displayName: "Priya",
          photoVisibility: "ALL_MEMBERS",
          photos: [
            { id: "p1", isPrimary: true, originalUrl: "orig.jpg", blurredUrl: "blur.jpg" },
          ],
        },
      ]);

      mockPrisma.client.photoAccessRequest.findMany.mockResolvedValue([]);

      const result = await service.getFeed("user-1", { page: 1, limit: 10 });

      expect(mockPrisma.client.profile.findMany).toHaveBeenCalled();
      const whereArg = mockPrisma.client.profile.findMany.mock.calls[0][0].where;

      // Excluded user IDs should include current user, blocked user, and interacted user
      expect(whereArg.userId.notIn).toContain("user-1");
      expect(whereArg.userId.notIn).toContain("blocked-user-2");
      expect(whereArg.userId.notIn).toContain("interacted-user-3");

      expect(result.data.length).toBe(1);
      expect(result.data[0].photos[0].isBlurred).toBe(false);
      expect(result.data[0].photos[0].url).toBe("orig.jpg");
    });
  });

  describe("sendInterest", () => {
    it("should throw BadRequestException if senderId equals targetUserId", async () => {
      await expect(
        service.sendInterest("user-1", { targetUserId: "user-1", message: "Hey" })
      ).rejects.toThrow("You cannot send interest to yourself");
    });

    it("should automatically establish mutual match when reverse interest already exists", async () => {
      mockPrisma.client.matchInterest.findUnique.mockResolvedValue({
        id: "interest-rev-1",
        senderId: "user-2",
        receiverId: "user-1",
        status: "PENDING",
      });

      mockPrisma.client.matchInterest.update.mockResolvedValue({
        id: "interest-rev-1",
        status: "ACCEPTED",
      });

      mockPrisma.client.matchInterest.upsert.mockResolvedValue({
        id: "interest-my-1",
        status: "ACCEPTED",
      });

      mockPrisma.client.conversation.upsert.mockResolvedValue({
        id: "conv-mutual-1",
        participant1Id: "user-1",
        participant2Id: "user-2",
      });

      mockPrisma.client.user.findUnique.mockResolvedValue({
        id: "user-1",
        profile: {
          displayName: "Member 1",
          photos: [{ isPrimary: true, originalUrl: "photo.jpg" }],
        },
      });

      const res = await service.sendInterest("user-1", {
        targetUserId: "user-2",
        message: "Glad to connect!",
      });

      expect(res.status).toBe("ACCEPTED");
      expect(mockChatGateway.emitToUser).toHaveBeenCalledWith(
        "user-2",
        "new_match",
        expect.any(Object)
      );
      expect(mockChatGateway.emitToUser).toHaveBeenCalledWith(
        "user-1",
        "new_match",
        expect.any(Object)
      );
    });
  });

  describe("respondInterest", () => {
    it("should throw NotFoundException if incoming interest does not exist", async () => {
      mockPrisma.client.matchInterest.findUnique.mockResolvedValue(null);

      await expect(
        service.respondInterest("user-1", "invalid-id", { status: "ACCEPTED" })
      ).rejects.toThrow(NotFoundException);
    });

    it("should accept interest, update status, and upsert conversation", async () => {
      mockPrisma.client.matchInterest.findUnique.mockResolvedValue({
        id: "int-10",
        senderId: "user-2",
        receiverId: "user-1",
        status: "PENDING",
      });

      mockPrisma.client.matchInterest.update.mockResolvedValue({
        id: "int-10",
        status: "ACCEPTED",
      });

      mockPrisma.client.conversation.upsert.mockResolvedValue({
        id: "conv-10",
        participant1Id: "user-1",
        participant2Id: "user-2",
      });

      mockPrisma.client.user.findUnique.mockResolvedValue({
        id: "user-1",
        profile: {
          displayName: "Receiver Name",
          photos: [{ isPrimary: true, originalUrl: "recv.jpg" }],
        },
      });

      const res = await service.respondInterest("user-1", "int-10", {
        status: "ACCEPTED",
      });

      expect(res.status).toBe("ACCEPTED");
      expect(mockChatGateway.emitToUser).toHaveBeenCalledWith(
        "user-2",
        "interest_accepted",
        expect.any(Object)
      );
    });
  });
});
