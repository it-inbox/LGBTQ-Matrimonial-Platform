import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { PaymentsService, UserMembership } from "../payments/payments.service.js";
import { Gender, GenderEnum, Orientation } from "@everpride/shared";
import { PasswordService, TokenService } from "@everpride/auth";

type UserRole = "USER" | "MODERATOR" | "ADMIN";

export interface AdminUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  isDummy?: string;
  gender?: string;
  city?: string;
}

export interface InviteAdminDto {
  email: string;
  displayName: string;
  password: string;
  role: "ADMIN" | "MODERATOR";
}

@Injectable()
export class AdminService {
  private readonly passwordService = new PasswordService();
  private readonly tokenService: TokenService;

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentsService: PaymentsService
  ) {
    const accessSecret = process.env.JWT_ACCESS_SECRET || "super-secret-access-token-change-in-production";
    const refreshSecret = process.env.JWT_REFRESH_SECRET || "super-secret-refresh-token-change-in-production";
    this.tokenService = new TokenService(accessSecret, "15m", refreshSecret, "7d");
  }

  async getPlatformStats() {
    const [
      totalUsers,
      activeUsers,
      dummyUsers,
      verifiedUsers,
      totalInterests,
      acceptedInterests,
      totalConversations,
      totalMessages,
      membershipStats,
    ] = await Promise.all([
      this.prisma.client.user.count(),
      this.prisma.client.user.count({ where: { isActive: true } }),
      this.prisma.client.user.count({ where: { isDummyUser: true } }),
      this.prisma.client.user.count({ where: { isVerified: true } }),
      this.prisma.client.matchInterest.count(),
      this.prisma.client.matchInterest.count({ where: { status: "ACCEPTED" } }),
      this.prisma.client.conversation.count(),
      this.prisma.client.message.count(),
      this.paymentsService.getAllMemberships(),
    ]);

    const realUsers = totalUsers - dummyUsers;
    const bannedUsers = totalUsers - activeUsers;

    // Membership tier distribution from active memberships
    const tierCounts: Record<string, number> = {
      FREE: 0,
      PRO: 0,
      PRO_MAX: 0,
      PRO_SUPREME: 0,
      PREMIER_LITE: 0,
    };

    membershipStats.forEach((m) => {
      if (m.status === "ACTIVE" && tierCounts[m.tier] !== undefined) {
        tierCounts[m.tier]++;
      }
    });

    tierCounts.FREE = Math.max(0, realUsers - Object.values(tierCounts).reduce((a, b) => a + b, 0));

    return {
      users: {
        total: totalUsers,
        real: realUsers,
        dummy: dummyUsers,
        active: activeUsers,
        banned: bannedUsers,
        verified: verifiedUsers,
      },
      matches: {
        totalInterests,
        acceptedInterests,
        conversations: totalConversations,
        messages: totalMessages,
      },
      memberships: tierCounts,
    };
  }

  async getUsers(query: AdminUsersQuery) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.search && query.search.trim()) {
      const term = query.search.trim();
      where.OR = [
        { phoneNumber: { contains: term, mode: "insensitive" } },
        { email: { contains: term, mode: "insensitive" } },
        { profile: { displayName: { contains: term, mode: "insensitive" } } },
        { profile: { city: { contains: term, mode: "insensitive" } } },
      ];
    }

    if (query.status === "active") {
      where.isActive = true;
    } else if (query.status === "banned") {
      where.isActive = false;
    }

    if (query.isDummy === "true") {
      where.isDummyUser = true;
    } else if (query.isDummy === "false") {
      where.isDummyUser = false;
    }

    if (query.gender && GenderEnum.options.includes(query.gender as Gender)) {
      where.profile = { ...where.profile, gender: query.gender as Gender };
    }

    if (query.city) {
      where.profile = {
        ...where.profile,
        city: { contains: query.city, mode: "insensitive" },
      };
    }

    const [total, users] = await Promise.all([
      this.prisma.client.user.count({ where }),
      this.prisma.client.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          phoneNumber: true,
          isActive: true,
          isVerified: true,
          isDummyUser: true,
          createdAt: true,
          updatedAt: true,
          profile: {
            select: {
              id: true,
              displayName: true,
              gender: true,
              orientation: true,
              city: true,
              state: true,
              country: true,
              outnessStatus: true,
              photoVisibility: true,
              photos: {
                take: 1,
                orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
                select: {
                  id: true,
                  originalUrl: true,
                  blurredUrl: true,
                  isPrimary: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      data: users.map((u) => ({
        ...u,
        role: "USER",
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(userId: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            photos: true,
            educations: true,
            partnerPreference: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const membership = this.paymentsService.getMembership(userId);

    return {
      ...user,
      membership,
    };
  }

  async updateUserStatus(userId: string, isActive: boolean) {
    const user = await this.prisma.client.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    return this.prisma.client.user.update({
      where: { id: userId },
      data: { isActive },
      select: { id: true, isActive: true },
    });
  }

  async updateUserRole(_userId: string, role: UserRole) {
    return { id: _userId, role };
  }

  async updateUserVerified(userId: string, isVerified: boolean) {
    const user = await this.prisma.client.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    return this.prisma.client.user.update({
      where: { id: userId },
      data: { isVerified },
      select: { id: true, isVerified: true },
    });
  }

  async purgeDummyUsers() {
    const dummyCount = await this.prisma.client.user.count({
      where: { isDummyUser: true },
    });

    if (dummyCount === 0) {
      return { count: 0, message: "No dummy users found to delete." };
    }

    const deleted = await this.prisma.client.user.deleteMany({
      where: { isDummyUser: true },
    });

    return {
      count: deleted.count,
      message: `Successfully purged ${deleted.count} dummy users!`,
    };
  }

  async adminLogin(email: string, password: string) {
    const cleanEmail = email.toLowerCase().trim();
    const admin = await this.prisma.client.admin.findUnique({
      where: { email: cleanEmail },
    });

    if (!admin || !admin.passwordHash) {
      throw new UnauthorizedException("Invalid corporate email or password");
    }

    const isValid = await this.passwordService.compare(password, admin.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException("Invalid corporate email or password");
    }

    if (!admin.isActive) {
      throw new UnauthorizedException("Administrator account is suspended");
    }

    const payload = {
      userId: admin.id,
      email: admin.email,
      role: admin.role,
    };

    const accessToken = this.tokenService.signAccessToken(payload);
    const refreshToken = this.tokenService.signRefreshToken(payload);

    return {
      user: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        isVerified: true,
        displayName: admin.displayName || "Admin",
      },
      accessToken,
      refreshToken,
    };
  }

  async inviteAdmin(dto: InviteAdminDto) {
    const cleanEmail = dto.email.toLowerCase().trim();

    if (!cleanEmail || !dto.password || dto.password.length < 8) {
      throw new BadRequestException("Valid email and password (min 8 characters) are required.");
    }

    const existing = await this.prisma.client.admin.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      throw new BadRequestException(`An administrator with email ${cleanEmail} already exists.`);
    }

    const passwordHash = await this.passwordService.hash(dto.password);

    const newAdmin = await this.prisma.client.admin.create({
      data: {
        email: cleanEmail,
        passwordHash,
        displayName: dto.displayName.trim() || "Staff Member",
        role: dto.role,
        isActive: true,
      },
    });

    return {
      id: newAdmin.id,
      email: newAdmin.email,
      role: newAdmin.role,
      displayName: newAdmin.displayName,
      message: `Successfully invited ${cleanEmail} as ${dto.role}`,
    };
  }

  async revokeAdmin(adminId: string) {
    const admin = await this.prisma.client.admin.findUnique({ where: { id: adminId } });
    if (!admin) throw new NotFoundException("Admin account not found");

    await this.prisma.client.admin.update({
      where: { id: adminId },
      data: { isActive: false },
    });

    await this.prisma.client.adminRefreshToken.deleteMany({
      where: { adminId },
    });

    return {
      success: true,
      message: `Successfully revoked admin access for ${admin.email}`,
    };
  }

  async updateMembership(
    userId: string,
    tier: "FREE" | "PRO" | "PRO_MAX" | "PRO_SUPREME" | "PREMIER_LITE",
    durationDays: number = 30
  ) {
    const user = await this.prisma.client.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    const expiresAt = tier === "FREE" ? null : new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

    const updated: UserMembership = {
      tier,
      planName: tier === "FREE" ? "Free Member" : `${tier.replace("_", " ")} Plan (Admin Override)`,
      expiresAt,
      status: tier === "FREE" ? "NONE" : "ACTIVE",
      superInterestsRemaining: tier === "FREE" ? 1 : 25,
      spotlightsRemaining: tier === "FREE" ? 0 : 5,
      hasGoldBadge: tier !== "FREE",
      canViewPhoneNumbers: tier !== "FREE",
      lastPaymentAt: new Date().toISOString(),
      lastPaymentAmount: 0,
    };

    return this.paymentsService.setMembership(userId, updated);
  }
}
