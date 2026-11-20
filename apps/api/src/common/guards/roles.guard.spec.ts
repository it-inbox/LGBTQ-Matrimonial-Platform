import { describe, it, expect, vi, beforeEach } from "vitest";
import { RolesGuard } from "./roles.guard.js";
import { ForbiddenException, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

describe("RolesGuard Unit Tests", () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const createMockContext = (user?: { role?: string }): ExecutionContext => {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  };

  it("should allow access when no roles are required on the route", () => {
    vi.spyOn(reflector, "getAllAndOverride").mockReturnValue(undefined);

    const context = createMockContext({ role: "USER" });
    expect(guard.canActivate(context)).toBe(true);
  });

  it("should throw ForbiddenException when user is not present or has no role", () => {
    vi.spyOn(reflector, "getAllAndOverride").mockReturnValue(["ADMIN"]);

    const contextNoUser = createMockContext(undefined);
    expect(() => guard.canActivate(contextNoUser)).toThrow(ForbiddenException);

    const contextNoRole = createMockContext({});
    expect(() => guard.canActivate(contextNoRole)).toThrow("Access denied: No role assigned");
  });

  it("should throw ForbiddenException when user does not have the required role", () => {
    vi.spyOn(reflector, "getAllAndOverride").mockReturnValue(["ADMIN"]);

    const context = createMockContext({ role: "USER" });
    expect(() => guard.canActivate(context)).toThrow(
      "Access denied: Requires one of roles: [ADMIN]"
    );
  });

  it("should allow access when user matches one of the allowed roles", () => {
    vi.spyOn(reflector, "getAllAndOverride").mockReturnValue(["ADMIN", "MODERATOR"]);

    const contextAdmin = createMockContext({ role: "ADMIN" });
    expect(guard.canActivate(contextAdmin)).toBe(true);

    const contextMod = createMockContext({ role: "MODERATOR" });
    expect(guard.canActivate(contextMod)).toBe(true);
  });
});
