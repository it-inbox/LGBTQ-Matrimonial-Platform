import { describe, it, expect } from "vitest";
import { ZodValidationPipe } from "./zod-validation.pipe.js";
import { z } from "zod";
import { BadRequestException } from "@nestjs/common";

describe("ZodValidationPipe Unit Tests", () => {
  const schema = z.object({
    email: z.string().email(),
    age: z.number().min(18),
  });

  const pipe = new ZodValidationPipe(schema);

  it("should successfully parse and return valid payload", () => {
    const validData = { email: "test@everpride.com", age: 25 };
    const result = pipe.transform(validData, { type: "body" });
    expect(result).toEqual(validData);
  });

  it("should throw BadRequestException with formatted error array on validation failure", () => {
    const invalidData = { email: "invalid-email", age: 16 };

    try {
      pipe.transform(invalidData, { type: "body" });
      expect.fail("Expected pipe.transform to throw BadRequestException");
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      const response = (error as BadRequestException).getResponse() as any;
      expect(response.message).toBe("Validation failed");
      expect(Array.isArray(response.errors)).toBe(true);
      expect(response.errors.length).toBe(2);
      expect(response.errors.some((e: any) => e.field === "email")).toBe(true);
      expect(response.errors.some((e: any) => e.field === "age")).toBe(true);
    }
  });

  it("should handle non-Zod errors gracefully", () => {
    const brokenSchema = {
      parse: () => {
        throw new Error("Unexpected schema failure");
      },
    } as any;
    const brokenPipe = new ZodValidationPipe(brokenSchema);

    expect(() => brokenPipe.transform({}, { type: "body" })).toThrow(BadRequestException);
  });
});
