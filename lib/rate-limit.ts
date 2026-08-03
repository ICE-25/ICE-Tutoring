import { headers } from "next/headers";
import { createHash } from "node:crypto";

/**
 * Fixed-window, in-process rate limiter.
 *
 * IMPORTANT LIMITATION: state lives in the memory of one server instance.
 * On Vercel that means it resets on cold start and is not shared between
 * concurrent lambdas, so it slows abuse down rather than stopping it. It is
 * a speed bump, not a wall.
 *
 * For a durable limit, back this with Postgres or Upstash Redis. See the
 * note in the enroll action about the remaining direct-to-PostgREST gap,
 * which no app-level limiter can close on its own.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Trim expired buckets so the map cannot grow without bound. */
function sweep(now: number) {
  if (buckets.size < 500) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function rateLimit(
  key: string,
  limit = 5,
  windowMs = 10 * 60 * 1000,
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  existing.count += 1;

  if (existing.count > limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  return {
    allowed: true,
    remaining: limit - existing.count,
    retryAfterSeconds: 0,
  };
}

/**
 * Best-effort client IP from proxy headers, hashed before use so raw
 * addresses are never stored or logged.
 */
export async function getClientIpHash() {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown";

  return {
    ip,
    hash: createHash("sha256").update(ip).digest("hex").slice(0, 32),
  };
}
