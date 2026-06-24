import { apiError } from "@/lib/api-response";
import {
  getClientIp,
  rateLimit,
  rateLimitHeaders,
  RATE_LIMITS,
  type RateLimitConfig,
} from "@/lib/security/rate-limit";

export { RATE_LIMITS };

type RouteHandler = (req: Request, ctx?: unknown) => Promise<Response> | Response;

export function withRateLimit(
  handler: RouteHandler,
  config: RateLimitConfig,
  keyFn?: (req: Request) => string
): RouteHandler {
  return async (req, ctx) => {
    const ip = getClientIp(req);
    const key = keyFn ? keyFn(req) : ip;
    const result = await rateLimit(key, config);

    if (!result.success) {
      const response = apiError("Too many requests. Please try again later.", 429);
      const headers = rateLimitHeaders(result);
      Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v));
      response.headers.set("Retry-After", String(Math.ceil((result.resetAt - Date.now()) / 1000)));
      return response;
    }

    const response = await handler(req, ctx);
    const headers = rateLimitHeaders(result);
    Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v));
    return response;
  };
}

export function checkRateLimit(req: Request, config: RateLimitConfig, key?: string) {
  const identifier = key ?? getClientIp(req);
  return rateLimit(identifier, config);
}

export function rateLimitedResponse(result: Awaited<ReturnType<typeof rateLimit>>) {
  const response = apiError("Too many requests. Please try again later.", 429);
  const headers = rateLimitHeaders(result);
  Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v));
  response.headers.set("Retry-After", String(Math.ceil((result.resetAt - Date.now()) / 1000)));
  return response;
}
