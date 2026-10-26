import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import { TokenService, TokenPayload } from "@everpride/auth";

export interface AuthenticatedUserRequest extends Request {
  user: TokenPayload;
}

@Injectable()
export class AuthGuard implements CanActivate {
  private tokenService: TokenService;

  constructor() {
    const accessSecret = process.env.JWT_ACCESS_SECRET || "super-secret-access-token-change-in-production";
    this.tokenService = new TokenService(accessSecret);
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedUserRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("Authentication token is required");
    }

    const token = authHeader.split(" ")[1];
    try {
      const payload = this.tokenService.verifyAccessToken(token);
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException("Invalid or expired authentication token");
    }
  }
}
