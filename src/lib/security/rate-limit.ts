export interface RateLimitConfig {
  /** Max requests per window */
  limit: number;
  /** Window size in seconds */
  windowSec: number;
  /** Namespace prefix for keys */
  prefix?: string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, Bucket>();

function memoryRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSec * 1000;
  const bucket = memoryStore.get(key);

  if (!bucket || now >= bucket.resetAt) {
    const resetAt = now + windowMs;
    memoryStore.set(key, { count: 1, resetAt });
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetAt,
    };
  }

  if (bucket.count >= config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      resetAt: bucket.resetAt,
    };
  }

  bucket.count += 1;
  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - bucket.count,
    resetAt: bucket.resetAt,
  };
}

async function upstashRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const redisKey = `${config.prefix ?? "rl"}:${key}`;
  const windowMs = config.windowSec * 1000;

  try {
    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify([
        ["INCR", redisKey],
        ["PTTL", redisKey],
      ]),
    });

    if (!res.ok) return null;

    const results = (await res.json()) as { result: number }[];
    const count = results[0]?.result ?? 1;
    let ttl = results[1]?.result ?? -1;

    if (ttl === -1) {
      await fetch(`${url}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(["PEXPIRE", redisKey, String(windowMs)]),
      });
      ttl = windowMs;
    }

    const resetAt = Date.now() + ttl;
    const remaining = Math.max(0, config.limit - count);

    return {
      success: count <= config.limit,
      limit: config.limit,
      remaining,
      resetAt,
    };
  } catch {
    return null;
  }
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function rateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const distributed = await upstashRateLimit(identifier, config);
  if (distributed) return distributed;
  return memoryRateLimit(identifier, config);
}

export const RATE_LIMITS = {
  auth: { limit: 10, windowSec: 60, prefix: "auth" },
  contact: { limit: 5, windowSec: 300, prefix: "contact" },
  aiChat: { limit: 20, windowSec: 60, prefix: "ai" },
  api: { limit: 100, windowSec: 60, prefix: "api" },
  webhook: { limit: 200, windowSec: 60, prefix: "webhook" },
} as const satisfies Record<string, RateLimitConfig>;

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
  };
}
