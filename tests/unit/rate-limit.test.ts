import { describe, it, expect } from "vitest";
import { rateLimit, rateLimitHeaders } from "@/lib/security/rate-limit";

describe("rate-limit", () => {
  it("allows requests within limit", async () => {
    const config = { limit: 3, windowSec: 60, prefix: "test" };
    const key = `test-${Date.now()}`;

    const r1 = await rateLimit(key, config);
    const r2 = await rateLimit(key, config);

    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
    expect(r2.remaining).toBeLessThan(r1.remaining);
  });

  it("blocks requests over limit", async () => {
    const config = { limit: 2, windowSec: 60, prefix: "test" };
    const key = `block-${Date.now()}`;

    await rateLimit(key, config);
    await rateLimit(key, config);
    const r3 = await rateLimit(key, config);

    expect(r3.success).toBe(false);
    expect(r3.remaining).toBe(0);
  });

  it("sets rate limit headers", () => {
    const headers = rateLimitHeaders({
      success: true,
      limit: 10,
      remaining: 5,
      resetAt: 1_700_000_000_000,
    });
    expect(headers["X-RateLimit-Limit"]).toBe("10");
    expect(headers["X-RateLimit-Remaining"]).toBe("5");
  });
});
