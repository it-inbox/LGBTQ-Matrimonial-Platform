import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import request from "supertest";
import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { AppModule } from "../src/app.module.js";
import { PrismaService } from "../src/modules/prisma/prisma.service.js";
import { AllExceptionsFilter } from "../src/common/filters/all-exceptions.filter.js";

describe("Auth Endpoints (E2E Integration)", () => {
  let app: INestApplication;
  let mockPrisma: any;

  beforeAll(async () => {
    mockPrisma = {
      client: {
        user: {
          findFirst: vi.fn(),
          findUnique: vi.fn(),
          create: vi.fn(),
          update: vi.fn(),
        },
        refreshToken: {
          create: vi.fn(),
          findUnique: vi.fn(),
          delete: vi.fn(),
          deleteMany: vi.fn(),
        },
        phoneVerification: {
          findUnique: vi.fn(),
          create: vi.fn(),
          upsert: vi.fn(),
          deleteMany: vi.fn(),
        },
        membership: {
          findUnique: vi.fn(),
        },
      },
    };

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api/v1");
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("GET /api/v1/auth/check-phone", () => {
    it("returns exists: false when phone number does not exist", async () => {
      mockPrisma.client.user.findFirst.mockResolvedValueOnce(null);

      const res = await request(app.getHttpServer())
        .get("/api/v1/auth/check-phone?phoneNumber=%2B1234567890")
        .expect(200);

      expect(res.body).toEqual({ exists: false });
    });

    it("returns exists: true when phone number is found", async () => {
      mockPrisma.client.user.findFirst.mockResolvedValueOnce({
        id: "user-1",
        phoneNumber: "+1234567890",
      });

      const res = await request(app.getHttpServer())
        .get("/api/v1/auth/check-phone?phoneNumber=%2B1234567890")
        .expect(200);

      expect(res.body).toEqual({ exists: true });
    });
  });

  describe("POST /api/v1/auth/send-otp", () => {
    it("returns success: true on valid phone number", async () => {
      mockPrisma.client.phoneVerification.findUnique.mockResolvedValueOnce(null);
      mockPrisma.client.phoneVerification.upsert.mockResolvedValueOnce({
        id: "otp-1",
        phoneNumber: "+1234567890",
      });

      const res = await request(app.getHttpServer())
        .post("/api/v1/auth/send-otp")
        .send({ phoneNumber: "+1234567890" })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.phoneNumber).toBe("+1234567890");
    });

    it("returns 400 validation error if phone number is invalid", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/v1/auth/send-otp")
        .send({ phoneNumber: "invalid" })
        .expect(400);

      expect(res.body.statusCode || res.body.message).toBeTruthy();
      expect(res.status).toBe(400);
    });
  });
});
