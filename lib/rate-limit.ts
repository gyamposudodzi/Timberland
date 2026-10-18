import "server-only";

/**
 * Minimal fixed-window rate limiter (in-memory).
 *
 * Good enough to blunt guest-tracking enumeration on a single server. On a
 * multi-instance / serverless deployment, swap this for a shared store (Redis,
 * Upstash, etc.) — the call signature is designed to stay identical.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSec: 0 };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count, retryAfterSec: 0 };
}

/** Periodically drop expired buckets to bound memory usage. */
export function sweepRateLimits() {
  const now = Date.now();
  for (const [key, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(key);
  }
}
