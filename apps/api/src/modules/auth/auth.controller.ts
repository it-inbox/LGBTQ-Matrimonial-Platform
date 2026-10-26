import { Controller, Post, Body, HttpCode, HttpStatus, Res, Req, UnauthorizedException } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import type { Response, Request } from "express";
import { AuthService } from "./auth.service.js";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.js";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  sendOtpSchema,
  verifyOtpSchema,
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
  SendOtpInput,
  VerifyOtpInput,
} from "@everpride/shared";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  private setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie("everpride_refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });
  }

  @Post("send-otp")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Send OTP to mobile number" })
  async sendOtp(@Body(new ZodValidationPipe(sendOtpSchema)) dto: SendOtpInput) {
    return this.authService.sendOtp(dto);
  }

  @Post("verify-otp")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Verify OTP code" })
  async verifyOtp(@Body(new ZodValidationPipe(verifyOtpSchema)) dto: VerifyOtpInput) {
    return this.authService.verifyOtp(dto);
  }

  @Post("register")
  @ApiOperation({ summary: "Register a user account with phone number" })
  @ApiResponse({ status: 201, description: "Account created successfully" })
  async register(
    @Body(new ZodValidationPipe(registerSchema)) dto: RegisterInput,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.register(dto);
    if (result.refreshToken) {
      this.setRefreshTokenCookie(res, result.refreshToken);
    }
    return result;
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Log in with phone number and OTP" })
  @ApiResponse({ status: 200, description: "Authenticated successfully" })
  async login(
    @Body(new ZodValidationPipe(loginSchema)) dto: LoginInput,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.login(dto);
    if (result.refreshToken) {
      this.setRefreshTokenCookie(res, result.refreshToken);
    }
    return result;
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Refresh access token" })
  async refresh(
    @Body() body: { refreshToken?: string },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    // Extract token from body or from cookie
    const tokenFromCookie = req.cookies?.everpride_refresh_token || (req.headers.cookie && req.headers.cookie.split(";").find(c => c.trim().startsWith("everpride_refresh_token="))?.split("=")[1]);
    const token = body?.refreshToken || tokenFromCookie;
    if (!token) {
      throw new UnauthorizedException("Refresh token is required");
    }
    const result = await this.authService.refresh(token);
    if (result.refreshToken) {
      this.setRefreshTokenCookie(res, result.refreshToken);
    }
    return result;
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Log out and clear refresh token cookie" })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("everpride_refresh_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });
    return { success: true };
  }
}
