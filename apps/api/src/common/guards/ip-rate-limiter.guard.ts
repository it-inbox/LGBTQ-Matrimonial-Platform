import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Request } from "express";

interface IpRecord {
  timestamps: number[];
}

/**
 * Sliding window IP rate limiter for sensitive endpoints (e.g. OTP dispatch).
 * Defaults to max 5 requests per 10-minute sliding window per client IP.
 */
@Injectable()
export class IpRateLimiterGuard implements CanActivate {
  private static ipHits = new Map<string, IpRecord>();
  private readonly maxRequests: number = 5;
  private readonly windowMs: number = 10 * 60 * 1000; // 10 minutes

  constructor() {
    // Periodically clean up entries with no timestamps in the active window (every 5 mins)
    if (!IpRateLimiterGuard.cleanupScheduled) {
      IpRateLimiterGuard.cleanupScheduled = true;
      setInterval(() => {
        const now = Date.now();
        for (const [ip, record] of IpRateLimiterGuard.ipHits.entries()) {
          record.timestamps = record.timestamps.filter((t) => now - t < 10 * 60 * 1000);
          if (record.timestamps.length === 0) {
            IpRateLimiterGuard.ipHits.delete(ip);
          }
        }
      }, 5 * 60 * 1000).unref();
    }
  }

  private static cleanupScheduled = false;

  private getClientIp(req: Request): string {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string") {
      return forwarded.split(",")[0].trim();
    }
    if (Array.isArray(forwarded) && forwarded.length > 0) {
      return forwarded[0].trim();
    }
    return req.socket?.remoteAddress || req.ip || "unknown-ip";
  }

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const clientIp = this.getClientIp(req);
    const now = Date.now();

    const record = IpRateLimiterGuard.ipHits.get(clientIp) || { timestamps: [] };
    // Filter timestamps within the sliding window
    record.timestamps = record.timestamps.filter((t) => now - t < this.windowMs);

    if (record.timestamps.length >= this.maxRequests) {
      const oldestInWindow = record.timestamps[0];
      const retryAfterSeconds = Math.ceil((oldestInWindow + this.windowMs - now) / 1000);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Too many OTP requests from this network. Please try again in ${retryAfterSeconds} seconds.`,
          retryAfter: retryAfterSeconds,
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    record.timestamps.push(now);
    IpRateLimiterGuard.ipHits.set(clientIp, record);

    return true;
  }
}
