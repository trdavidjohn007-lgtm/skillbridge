/**
 * Input sanitization and validation utilities.
 * Protects against XSS, injection, and oversized payloads.
 */

// ============================================================
// SANITIZATION
// ============================================================

/** Remove HTML tags and dangerous characters */
export function stripHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")           // Remove HTML tags
    .replace(/[<>]/g, "")              // Fallback angle bracket removal
    .trim();
}

/** Remove zero-width characters and control characters */
export function stripControlChars(input: string): string {
  // eslint-disable-next-line no-control-regex
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\u200B-\u200F\u2028-\u202F\uFEFF]/g, "");
}

/** Full sanitization pipeline for user-provided text */
export function sanitizeText(input: string): string {
  if (typeof input !== "string") return "";
  return stripControlChars(stripHtml(input)).slice(0, 10000);
}

/** Sanitize an email address */
export function sanitizeEmail(input: string): string {
  if (typeof input !== "string") return "";
  return input.toLowerCase().trim().slice(0, 254);
}

/** Sanitize a URL — only allow http/https */
export function sanitizeUrl(input: string): string {
  if (typeof input !== "string") return "";
  const trimmed = input.trim();
  if (/^(https?:\/\/)/i.test(trimmed)) {
    return trimmed.slice(0, 2048);
  }
  return "";
}

// ============================================================
// SIZE LIMITS
// ============================================================

/** Maximum sizes for different input types */
export const MAX_SIZES = {
  email: 254,
  password: 128,
  name: 100,
  topic: 200,
  description: 2000,
  message: 5000,
  tag: 50,
  reason: 1000,
  url: 2048,
} as const;

/** Reject if string exceeds max length */
export function assertMaxSize(
  value: string,
  maxSize: number,
  fieldName: string
): string | { error: string } {
  if (typeof value !== "string") {
    return { error: `${fieldName} must be a string` };
  }
  if (value.length > maxSize) {
    return { error: `${fieldName} exceeds maximum length of ${maxSize} characters` };
  }
  return value;
}

// ============================================================
// STRUCTURED VALIDATION
// ============================================================

/** Validate that a value is a valid UUID */
export function isValidUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

/** Validate that a value is a valid email */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= MAX_SIZES.email;
}

/** Validate an array of strings (tags, subjects) */
export function sanitizeStringArray(
  arr: unknown,
  maxItems: number = 10,
  maxItemLength: number = 50
): string[] | { error: string } {
  if (!Array.isArray(arr)) {
    return { error: "Expected an array" };
  }
  if (arr.length > maxItems) {
    return { error: `Maximum ${maxItems} items allowed` };
  }
  const sanitized = arr
    .filter((item): item is string => typeof item === "string")
    .map((item) => stripHtml(item).trim().slice(0, maxItemLength))
    .filter((item) => item.length > 0);

  return sanitized;
}

/** Validate a number is within bounds */
export function sanitizeNumber(
  value: unknown,
  min: number,
  max: number,
  fieldName: string
): number | { error: string } {
  const num = Number(value);
  if (isNaN(num)) {
    return { error: `${fieldName} must be a number` };
  }
  if (num < min || num > max) {
    return { error: `${fieldName} must be between ${min} and ${max}` };
  }
  return num;
}

// ============================================================
// REQUEST BODY SIZE CHECK
// ============================================================

/** Maximum request body size in bytes (100KB) */
export const MAX_BODY_SIZE = 100 * 1024;

/** Validate request body size from Content-Length header */
export function assertBodySize(
  contentLength: string | null,
  maxSize: number = MAX_BODY_SIZE
): { ok: true } | { ok: false; response: Response } {
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    if (isNaN(size) || size > maxSize) {
      return {
        ok: false,
        response: new Response(
          JSON.stringify({ error: `Request body too large (max ${maxSize / 1024}KB)` }),
          { status: 413, headers: { "Content-Type": "application/json" } }
        ),
      };
    }
  }
  return { ok: true };
}

// ============================================================
// HELPER: Extract client IP from request
// ============================================================

export function getClientIp(request: Request): string {
  // Check X-Forwarded-For (set by proxies/load balancers)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  // Check X-Real-IP
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "unknown";
}
