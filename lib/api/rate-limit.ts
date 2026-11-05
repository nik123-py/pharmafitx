import "server-only";

/**
 * Best-effort fixed-window rate limiter kept in instance memory. On Vercel each
 * serverless instance has its own memory, so this throttles abusive bursts but is
 * not a global quota — swap in Upstash/Vercel KV for a shared limit if needed.
 */
const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) if (b.reset < now) buckets.delete(k);
  }
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }
  b.count++;
  if (b.count > limit) return { ok: false, remaining: 0, retryAfter: Math.ceil((b.reset - now) / 1000) };
  return { ok: true, remaining: limit - b.count, retryAfter: 0 };
}

export function clientIp(req: Request) {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd?.split(",")[0] || req.headers.get("x-real-ip") || "anonymous").trim();
}
