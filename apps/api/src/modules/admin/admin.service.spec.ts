import { describe, it, expect, vi, beforeEach } from "vitest";
import { AdminService } from "./admin.service.js";
import { NotFoundException } from "@nestjs/common";

describe("AdminService Unit Tests", () => {
  let service: AdminService;
  let mockPrisma: any;
  let mockPaymentsService: any;

  beforeEach(() => {
    mockPrisma = {
      client: {
        user: {
          count: vi.fn(),
          findMany: vi.fn(),
          findUnique: vi.fn(),
          update: vi.fn(),
          create: vi.fn(),
        },
        profile: {
          count: vi.fn(),
          findMany: vi.fn(),
        },
        matchInterest: {
          count: vi.fn(),
        },
        conversation: {
          count: vi.fn(),
        },
        message: {
          count: vi.fn(),
        },
        admin: {
          findUnique: vi.fn(),
          create: vi.fn(),
          update: vi.fn(),
        },
        adminRefreshToken: {
          deleteMany: vi.fn(),
        },
        adminAuditLog: {
          create: vi.fn(),
          findMany: vi.fn(),
          count: vi.fn(),
        },
      },
    };

    mockPaymentsService = {
      getAllMemberships: vi.fn(),
      getMembership: vi.fn(),
      setMembership: vi.fn(),
      grantTrialMembership: vi.fn(),
    };

    service = new AdminService(mockPrisma, mockPaymentsService);
  });

  describe("getPlatformStats", () => {
    it("should aggregate and return platform counts and metrics", async () => {
      mockPrisma.client.user.count
        .mockResolvedValueOnce(100) // totalUsers
        .mockResolvedValueOnce(80)  // activeUsers
        .mockResolvedValueOnce(5)   // dummyUsers
        .mockResolvedValueOnce(40); // verifiedUsers

      mockPrisma.client.matchInterest.count
        .mockResolvedValueOnce(250) // totalInterests
        .mockResolvedValueOnce(60);  // acceptedInterests

      mockPrisma.client.conversation.count.mockResolvedValue(45);
      mockPrisma.client.message.count.mockResolvedValue(320);

      mockPaymentsService.getAllMemberships.mockResolvedValue([
        { tier: "PRO", status: "ACTIVE" },
        { tier: "PRO_MAX", status: "ACTIVE" },
      ]);

      const stats = await service.getPlatformStats();

      expect(stats.users.total).toBe(100);
      expect(stats.users.active).toBe(80);
      expect(stats.users.dummy).toBe(5);
      expect(stats.users.verified).toBe(40);
      expect(stats.matches.totalInterests).toBe(250);
      expect(stats.matches.acceptedInterests).toBe(60);
      expect(stats.matches.conversations).toBe(45);
      expect(stats.matches.messages).toBe(320);
      expect(stats.memberships.PRO).toBe(1);
      expect(stats.memberships.PRO_MAX).toBe(1);
    });
  });

  describe("updateUserStatus", () => {
    it("should throw NotFoundException if user is not found", async () => {
      mockPrisma.client.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updateUserStatus("nonexistent-user", false, "admin-1")
      ).rejects.toThrow(NotFoundException);
    });

    it("should successfully update user status and record an audit log", async () => {
      mockPrisma.client.user.findUnique.mockResolvedValue({
        id: "target-user-1",
        email: "target@everpride.com",
        isActive: true,
      });

      mockPrisma.client.user.update.mockResolvedValue({
        id: "target-user-1",
        isActive: false,
      });

      const res = await service.updateUserStatus("target-user-1", false, "admin-1", "Spam activity");

      expect(mockPrisma.client.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "target-user-1" },
          data: { isActive: false },
        })
      );
      expect(mockPrisma.client.adminAuditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          adminId: "admin-1",
          action: "BAN_USER",
          targetId: "target-user-1",
        }),
      });
      expect(res.isActive).toBe(false);
    });
  });

  describe("revokeAdmin", () => {
    it("should throw NotFoundException if admin account is not found", async () => {
      mockPrisma.client.admin.findUnique.mockResolvedValue(null);

      await expect(service.revokeAdmin("admin-missing")).rejects.toThrow(
        NotFoundException
      );
    });

    it("should set admin isActive to false and delete refresh tokens", async () => {
      mockPrisma.client.admin.findUnique.mockResolvedValue({
        id: "admin-mod-1",
        email: "mod@everpride.com",
        isActive: true,
      });

      mockPrisma.client.admin.update.mockResolvedValue({
        id: "admin-mod-1",
        isActive: false,
      });

      const res = await service.revokeAdmin("admin-mod-1");

      expect(mockPrisma.client.admin.update).toHaveBeenCalledWith({
        where: { id: "admin-mod-1" },
        data: { isActive: false },
      });
      expect(mockPrisma.client.adminRefreshToken.deleteMany).toHaveBeenCalledWith({
        where: { adminId: "admin-mod-1" },
      });
      expect(res.success).toBe(true);
    });
  });
});
