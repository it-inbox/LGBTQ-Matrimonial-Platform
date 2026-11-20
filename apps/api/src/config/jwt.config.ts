const DEFAULT_DEV_ACCESS_SECRET = "super-secret-access-token-change-in-production";
const DEFAULT_DEV_REFRESH_SECRET = "super-secret-refresh-token-change-in-production";

export interface JwtSecrets {
  accessSecret: string;
  refreshSecret: string;
  otpHmacSecret: string;
}

/**
 * Validates and retrieves security secrets.
 * In production (NODE_ENV === "production"):
 * - Requires JWT_ACCESS_SECRET and JWT_REFRESH_SECRET to be explicitly configured.
 * - Enforces a minimum secret length of 32 characters.
 * - Throws a fatal Error if requirements are not met to prevent starting in an insecure state.
 */
export function getJwtSecrets(): JwtSecrets {
  const isProduction = process.env.NODE_ENV === "production";
  const accessSecret = process.env.JWT_ACCESS_SECRET || (!isProduction ? DEFAULT_DEV_ACCESS_SECRET : "");
  const refreshSecret = process.env.JWT_REFRESH_SECRET || (!isProduction ? DEFAULT_DEV_REFRESH_SECRET : "");
  const otpHmacSecret = process.env.OTP_HMAC_SECRET || accessSecret;

  if (isProduction) {
    if (!accessSecret || accessSecret === DEFAULT_DEV_ACCESS_SECRET) {
      throw new Error(
        "[Security Error] JWT_ACCESS_SECRET must be set to a secure, unique string in production."
      );
    }
    if (accessSecret.length < 32) {
      throw new Error(
        "[Security Error] JWT_ACCESS_SECRET must be at least 32 characters long in production."
      );
    }
    if (!refreshSecret || refreshSecret === DEFAULT_DEV_REFRESH_SECRET) {
      throw new Error(
        "[Security Error] JWT_REFRESH_SECRET must be set to a secure, unique string in production."
      );
    }
    if (refreshSecret.length < 32) {
      throw new Error(
        "[Security Error] JWT_REFRESH_SECRET must be at least 32 characters long in production."
      );
    }
  }

  return { accessSecret, refreshSecret, otpHmacSecret };
}
