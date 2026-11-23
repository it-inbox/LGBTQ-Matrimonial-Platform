import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from "@nestjs/common";
import * as crypto from "crypto";
import { PrismaService } from "../prisma/prisma.service.js";
import { TokenService } from "@everpride/auth";
import { RegisterInput, LoginInput, SendOtpInput, VerifyOtpInput } from "@everpride/shared";
import { SmsService } from "./sms.service.js";
import { PaymentsService } from "../payments/payments.service.js";
import { getJwtSecrets } from "../../config/jwt.config.js";

@Injectable()
export class AuthService {
  private tokenService: TokenService;
  private otpHmacSecret: string;

  constructor(
    @Inject(forwardRef(() => PrismaService))
    private prisma: PrismaService,
    @Inject(forwardRef(() => SmsService))
    private smsService: SmsService,
    @Inject(forwardRef(() => PaymentsService))
    private paymentsService: PaymentsService,
  ) {
    const { accessSecret, refreshSecret, otpHmacSecret } = getJwtSecrets();
    this.tokenService = new TokenService(accessSecret, "15m", refreshSecret, "7d");
    this.otpHmacSecret = otpHmacSecret;
  }

  async checkPhoneRegistered(phoneNumber: string): Promise<boolean> {
    const cleanPhone = phoneNumber.trim();
    const user = await this.prisma.client.user.findFirst({
      where: {
        phoneNumber: cleanPhone,
        deletedAt: null,
      },
      select: { id: true },
    });
    return !!user;
  }

  private hashOtp(phone: string, otp: string): string {
    return crypto
      .createHmac("sha256", this.otpHmacSecret)
      .update(`${phone}:${otp}`)
      .digest("hex");
  }

  private async purgeExpiredVerifications(): Promise<void> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      await this.prisma.client.phoneVerification.deleteMany({
        where: {
          expiresAt: {
            lt: oneHourAgo,
          },
        },
      });
    } catch {
      // Non-blocking background cleanup
    }
  }

  async sendOtp(data: SendOtpInput) {
    const cleanPhone = data.phoneNumber.trim();

    // Trigger asynchronous purge of old expired phone verifications
    this.purgeExpiredVerifications().catch(() => {});

    // Rate-limit check: cooldown of 30 seconds before sending another OTP
    const isDev = process.env.NODE_ENV !== "production";
    const existing = await this.prisma.client.phoneVerification.findUnique({
      where: { phoneNumber: cleanPhone },
    });

    if (existing && !isDev) {
      const msSinceLast = Date.now() - existing.updatedAt.getTime();
      if (msSinceLast < 30 * 1000) {
        const remainingSeconds = Math.ceil((30 * 1000 - msSinceLast) / 1000);
        throw new BadRequestException(`Please wait ${remainingSeconds}s before requesting a new code.`);
      }
    }

    // Generate cryptographically random 6-digit OTP
    const randomOtp = crypto.randomInt(100000, 999999).toString();
    const otpHash = this.hashOtp(cleanPhone, randomOtp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

    // Upsert into PhoneVerification table
    await this.prisma.client.phoneVerification.upsert({
      where: { phoneNumber: cleanPhone },
      create: {
        phoneNumber: cleanPhone,
        otpHash,
        attempts: 0,
        expiresAt,
      },
      update: {
        otpHash,
        attempts: 0,
        expiresAt,
        updatedAt: new Date(),
      },
    });

    // Dispatch SMS via provider (or dev console simulator)
    await this.smsService.sendOtpSms(cleanPhone, randomOtp);

    return {
      success: true,
      phoneNumber: cleanPhone,
      message: "Verification code sent to your mobile number.",
      ...(isDev ? { devOtp: randomOtp } : {}),
    };
  }

  private async validateAndConsumeOtp(phoneNumber: string, otp: string): Promise<boolean> {
    const cleanPhone = phoneNumber.trim();
    const inputOtp = otp.trim();
    const isDev = process.env.NODE_ENV !== "production";

    // In development mode, allow universal bypass OTP '123456'
    if (isDev && inputOtp === "123456") {
      // Consume phone verification record if it exists
      await this.prisma.client.phoneVerification
        .delete({ where: { phoneNumber: cleanPhone } })
        .catch(() => {});
      return true;
    }

    const record = await this.prisma.client.phoneVerification.findUnique({
      where: { phoneNumber: cleanPhone },
    });

    if (!record) {
      throw new BadRequestException("No verification code found. Please click 'Send OTP' first.");
    }

    if (record.attempts >= 5) {
      await this.prisma.client.phoneVerification.delete({ where: { phoneNumber: cleanPhone } });
      throw new BadRequestException("Too many incorrect attempts. Please request a new verification code.");
    }

    if (new Date() > record.expiresAt) {
      await this.prisma.client.phoneVerification.delete({ where: { phoneNumber: cleanPhone } });
      throw new BadRequestException("Verification code has expired. Please request a new code.");
    }

    const expectedHash = this.hashOtp(cleanPhone, inputOtp);
    const expectedBuffer = Buffer.from(expectedHash, "hex");
    const recordBuffer = Buffer.from(record.otpHash, "hex");

    const isMatch =
      expectedBuffer.length === recordBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, recordBuffer);

    if (!isMatch) {
      await this.prisma.client.phoneVerification.update({
        where: { phoneNumber: cleanPhone },
        data: { attempts: record.attempts + 1 },
      });
      const remainingAttempts = 5 - (record.attempts + 1);
      throw new BadRequestException(`Invalid verification code. (${remainingAttempts} attempts remaining)`);
    }

    // Verification successful: consume and remove OTP record
    await this.prisma.client.phoneVerification.delete({
      where: { phoneNumber: cleanPhone },
    });

    return true;
  }

  async verifyOtp(data: VerifyOtpInput) {
    const cleanPhone = data.phoneNumber.trim();
    await this.validateAndConsumeOtp(cleanPhone, data.otp);

    return {
      success: true,
      phoneNumber: cleanPhone,
      verified: true,
    };
  }

  async register(data: RegisterInput) {
    const cleanPhone = data.phoneNumber.trim();
    if (!data.otp) {
      throw new BadRequestException("Verification code (OTP) is required for registration.");
    }
    await this.validateAndConsumeOtp(cleanPhone, data.otp);

    const existing = await this.prisma.client.user.findUnique({
      where: { phoneNumber: cleanPhone },
    });
    if (existing) {
      throw new ConflictException("Account already exists. Please log in.");
    }

    const user = await this.prisma.client.user.create({
      data: {
        phoneNumber: cleanPhone,
        isVerified: true,
      },
      select: {
        id: true,
        phoneNumber: true,
        isVerified: true,
        createdAt: true,
      },
    });

    const tokens = await this.generateAndSaveTokens(user.id, cleanPhone);
    const membership = this.paymentsService.getMembership(user.id);
    return {
      user: {
        ...user,
        role: "USER",
        onboardingCompleted: false,
      },
      profile: null,
      membership,
      ...tokens,
    };
  }

  async login(data: LoginInput) {
    const cleanPhone = data.phoneNumber.trim();
    await this.validateAndConsumeOtp(cleanPhone, data.otp);

    const user = await this.prisma.client.user.findFirst({
      where: {
        phoneNumber: cleanPhone,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new NotFoundException("User not registered. Please register a new account.");
    }

    if (!user.isActive) {
      throw new UnauthorizedException("User account is deactivated");
    }

    const [profile, membership] = await Promise.all([
      this.prisma.client.profile.findUnique({
        where: { userId: user.id },
        include: { photos: true, partnerPreference: true },
      }),
      Promise.resolve(this.paymentsService.getMembership(user.id)),
    ]);

    const tokens = await this.generateAndSaveTokens(user.id, cleanPhone);
    return {
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        role: "USER",
        isVerified: user.isVerified,
        onboardingCompleted: !!profile,
      },
      profile,
      membership,
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.tokenService.verifyRefreshToken(refreshToken);
      const tokenHash = this.hashToken(refreshToken);

      // Check database for token status
      const storedToken = await this.prisma.client.refreshToken.findUnique({
        where: { tokenHash },
      });

      if (!storedToken) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      // Reuse detection: If token was already revoked, revoke ALL tokens for this user as a security measure
      if (storedToken.revoked) {
        await this.prisma.client.refreshToken.updateMany({
          where: { userId: payload.userId },
          data: { revoked: true },
        });
        throw new UnauthorizedException("Refresh token was previously revoked. Suspicious reuse detected.");
      }

      if (new Date() > storedToken.expiresAt) {
        await this.prisma.client.refreshToken.update({
          where: { tokenHash },
          data: { revoked: true },
        });
        throw new UnauthorizedException("Refresh token has expired");
      }

      const user = await this.prisma.client.user.findUnique({
        where: { id: payload.userId },
      });
      if (!user || !user.isActive) {
        throw new UnauthorizedException("User no longer active");
      }

      // Rotate token: revoke current stored token
      await this.prisma.client.refreshToken.update({
        where: { tokenHash },
        data: { revoked: true },
      });

      // Issue and persist new refresh token
      return await this.generateAndSaveTokens(user.id, user.phoneNumber || "");
    } catch (err: any) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException("Invalid or expired refresh token");
    }
  }

  async logout(refreshToken?: string) {
    if (refreshToken) {
      try {
        const tokenHash = this.hashToken(refreshToken);
        await this.prisma.client.refreshToken.updateMany({
          where: { tokenHash },
          data: { revoked: true },
        });
      } catch {
        // Non-blocking
      }
    }
    return { success: true };
  }

  async getSession(userId: string) {
    const [user, profile, membership] = await Promise.all([
      this.prisma.client.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          phoneNumber: true,
          isVerified: true,
        },
      }),
      this.prisma.client.profile.findUnique({
        where: { userId },
        include: {
          photos: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] },
          educations: { orderBy: { createdAt: "asc" } },
          partnerPreference: true,
        },
      }),
      Promise.resolve(this.paymentsService.getMembership(userId)),
    ]);

    if (!user) {
      throw new UnauthorizedException("User not found or inactive");
    }

    return {
      user: {
        ...user,
        role: "USER",
        onboardingCompleted: !!profile,
      },
      profile,
      membership,
    };
  }

  private hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  private async generateAndSaveTokens(userId: string, phoneNumber: string, role: string = "USER") {
    const payload = { userId, phoneNumber, role };
    const accessToken = this.tokenService.signAccessToken(payload);
    const refreshToken = this.tokenService.signRefreshToken(payload);

    // 7 days expiration for refresh tokens
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const tokenHash = this.hashToken(refreshToken);

    await this.prisma.client.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
        revoked: false,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
