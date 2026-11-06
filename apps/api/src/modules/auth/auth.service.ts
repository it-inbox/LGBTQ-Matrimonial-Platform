import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import * as crypto from "crypto";
import { PrismaService } from "../prisma/prisma.service.js";
import { TokenService } from "@everpride/auth";
import { RegisterInput, LoginInput, SendOtpInput, VerifyOtpInput } from "@everpride/shared";
import { SmsService } from "./sms.service.js";
import { PaymentsService } from "../payments/payments.service.js";

@Injectable()
export class AuthService {
  private tokenService: TokenService;

  constructor(
    private prisma: PrismaService,
    private smsService: SmsService,
    private paymentsService: PaymentsService,
  ) {
    const accessSecret = process.env.JWT_ACCESS_SECRET || "super-secret-access-token-change-in-production";
    const refreshSecret = process.env.JWT_REFRESH_SECRET || "super-secret-refresh-token-change-in-production";
    this.tokenService = new TokenService(accessSecret, "15m", refreshSecret, "7d");
  }

  private hashOtp(phone: string, otp: string): string {
    return crypto.createHash("sha256").update(`${phone}:${otp}:everpride_salt`).digest("hex");
  }

  async sendOtp(data: SendOtpInput) {
    const cleanPhone = data.phoneNumber.trim();

    // Rate-limit check: cooldown of 30 seconds before sending another OTP
    const existing = await this.prisma.client.phoneVerification.findUnique({
      where: { phoneNumber: cleanPhone },
    });

    if (existing) {
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
    };
  }

  private async validateAndConsumeOtp(phoneNumber: string, otp: string): Promise<boolean> {
    const cleanPhone = phoneNumber.trim();
    const inputOtp = otp.trim();

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
    if (record.otpHash !== expectedHash) {
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

    const tokens = this.generateTokens(user.id, cleanPhone);
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

    let user = await this.prisma.client.user.findUnique({
      where: { phoneNumber: cleanPhone },
    });

    if (!user) {
      // Register on the fly if new user authenticates with phone
      user = await this.prisma.client.user.create({
        data: {
          phoneNumber: cleanPhone,
          isVerified: true,
        },
      });
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

    const tokens = this.generateTokens(user.id, cleanPhone);
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
      const user = await this.prisma.client.user.findUnique({
        where: { id: payload.userId },
      });
      if (!user || !user.isActive) {
        throw new UnauthorizedException("User no longer active");
      }

      return this.generateTokens(user.id, user.phoneNumber || "");
    } catch {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }
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

  private generateTokens(userId: string, phoneNumber: string, role: string = "USER") {
    const payload = { userId, phoneNumber, role };
    return {
      accessToken: this.tokenService.signAccessToken(payload),
      refreshToken: this.tokenService.signRefreshToken(payload),
    };
  }
}
