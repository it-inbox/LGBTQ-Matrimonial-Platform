import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProfilesService } from "./profiles.service.js";
import { NotFoundException } from "@nestjs/common";

describe("ProfilesService", () => {
  let service: ProfilesService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      client: {
        profile: {
          findUnique: vi.fn(),
          findFirst: vi.fn(),
          update: vi.fn(),
          create: vi.fn(),
        },
        matchInterest: {
          findFirst: vi.fn(),
        },
        photoAccessRequest: {
          findFirst: vi.fn(),
        },
        blockedUser: {
          findUnique: vi.fn(),
        },
      },
    };

    service = new ProfilesService(mockPrisma);
  });

  describe("getMyProfile", () => {
    it("throws NotFoundException if profile does not exist", async () => {
      mockPrisma.client.profile.findUnique.mockResolvedValueOnce(null);

      await expect(service.getMyProfile("user-1")).rejects.toThrow(NotFoundException);
    });

    it("returns profile if found", async () => {
      const mockProf = { id: "p1", userId: "user-1", displayName: "Alex" };
      mockPrisma.client.profile.findUnique.mockResolvedValueOnce(mockProf);

      const result = await service.getMyProfile("user-1");
      expect(result).toEqual(mockProf);
    });
  });

  describe("getProfileByUserId photo sanitization", () => {
    it("strips originalUrl and sets blurred url if viewer does not have permission", async () => {
      mockPrisma.client.profile.findFirst.mockResolvedValueOnce({
        id: "target-prof-1",
        userId: "target-user-1",
        photoVisibility: "REQUEST_REQUIRED",
        photos: [
          {
            id: "ph-1",
            isPrimary: true,
            originalUrl: "https://photos.everpride.com/orig.jpg",
            blurredUrl: "https://photos.everpride.com/blur.jpg",
          },
        ],
        educations: [],
        partnerPreference: null,
      });

      // No mutual match
      mockPrisma.client.matchInterest.findFirst.mockResolvedValue(null);
      // No accepted photo request
      mockPrisma.client.photoAccessRequest.findFirst.mockResolvedValue(null);
      mockPrisma.client.blockedUser.findUnique.mockResolvedValue(null);

      const result = await service.getProfileByUserId("target-user-1", "viewer-user-2");

      expect(result.photos[0].originalUrl).toBeUndefined();
      expect(result.photos[0].url).toBe("https://photos.everpride.com/blur.jpg");
    });

    it("includes originalUrl if photoVisibility is ALL_MEMBERS", async () => {
      mockPrisma.client.profile.findFirst.mockResolvedValueOnce({
        id: "target-prof-1",
        userId: "target-user-1",
        photoVisibility: "ALL_MEMBERS",
        photos: [
          {
            id: "ph-1",
            isPrimary: true,
            originalUrl: "https://photos.everpride.com/orig.jpg",
            blurredUrl: "https://photos.everpride.com/blur.jpg",
          },
        ],
        educations: [],
        partnerPreference: null,
      });

      mockPrisma.client.matchInterest.findFirst.mockResolvedValue(null);
      mockPrisma.client.photoAccessRequest.findFirst.mockResolvedValue(null);
      mockPrisma.client.blockedUser.findUnique.mockResolvedValue(null);

      const result = await service.getProfileByUserId("target-user-1", "viewer-user-2");

      expect(result.photos[0].originalUrl).toBe("https://photos.everpride.com/orig.jpg");
      expect(result.photos[0].url).toBe("https://photos.everpride.com/orig.jpg");
    });
  });
});
