import { NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 60 seconds
let cleanupScheduled = false;
function scheduleCleanup() {
  if (cleanupScheduled) return;
  cleanupScheduled = true;
  setTimeout(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) store.delete(key);
    }
    cleanupScheduled = false;
  }, 60_000);
}

/**
 * In-memory rate limiter for API routes.
 * Returns null if allowed, or a 429 NextResponse if rate-limited.
 *
 * @param key - Unique key for the rate limit bucket (e.g. userId or IP)
 * @param limit - Max requests per window
 * @param windowMs - Window duration in milliseconds (default: 60s)
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs = 60_000
): NextResponse | null {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    scheduleCleanup();
    return null;
  }

  entry.count++;

  if (entry.count > limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return NextResponse.json(
      { success: false, error: { code: "RATE_LIMITED", message: "Muitas requisições. Tente novamente em breve." } },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  return null;
}
