/**
 * In-memory rate limiter for API routes.
 * Uses per-endpoint key prefixes so dashboard polling doesn't eat into POST limits.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  maxRequests: number;
  windowMs?: number;
  keyPrefix?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const { maxRequests, windowMs = 15 * 60 * 1000, keyPrefix = "rl" } = config;
  const fullKey = `${keyPrefix}:${key}`;
  const now = Date.now();

  const entry = store.get(fullKey);

  if (!entry || now > entry.resetAt) {
    store.set(fullKey, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

export function rateLimit(
  ip: string | undefined,
  config: RateLimitConfig
): { limited: false } | { limited: true; response: Response } {
  const clientIp = ip || "unknown";
  const result = checkRateLimit(clientIp, config);

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
    return {
      limited: true,
      response: new Response(
        JSON.stringify({
          error: "Too many requests. Please try again later.",
          retryAfterSeconds: retryAfter,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(retryAfter),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(result.resetAt),
          },
        }
      ),
    };
  }

  return { limited: false };
}

export const RATE_LIMITS = {
  /** Auth endpoints: 10 attempts per 15 minutes */
  auth: {
    maxRequests: 10,
    windowMs: 15 * 60 * 1000,
    keyPrefix: "auth",
  },
  /** Read-only GET endpoints: 300 per 15 min (dashboard polling) */
  read: {
    maxRequests: 300,
    windowMs: 15 * 60 * 1000,
    keyPrefix: "read",
  },
  /** Write POST endpoints: 30 per 15 min */
  write: {
    maxRequests: 30,
    windowMs: 15 * 60 * 1000,
    keyPrefix: "write",
  },
  /** General API (legacy): 120 requests per 15 minutes */
  api: {
    maxRequests: 120,
    windowMs: 15 * 60 * 1000,
    keyPrefix: "api",
  },
  /** Chatbot: 30 messages per 15 minutes */
  chatbot: {
    maxRequests: 30,
    windowMs: 15 * 60 * 1000,
    keyPrefix: "chat",
  },
  /** Session creation: 10 per 15 minutes */
  sessionCreate: {
    maxRequests: 10,
    windowMs: 15 * 60 * 1000,
    keyPrefix: "sess",
  },
} as const;
