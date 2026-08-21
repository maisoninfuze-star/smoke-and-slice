/**
 * Small in-process rate limiter for auth and order endpoints.
 *
 * This is deliberately simple: a fixed window in memory. On a single Vercel
 * instance that is enough to stop credential stuffing and order-number
 * enumeration from a script. It is NOT shared across serverless instances, so
 * a determined attacker spread across many cold starts gets more attempts than
 * the nominal limit — for a neighbourhood restaurant that trade-off is fine,
 * and moving to Upstash/Redis later means swapping this one file.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_KEYS = 5000;

export type RateLimitResult = { ok: boolean; retryAfterSeconds: number };

export function rateLimit(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  // Cheap eviction so a long-lived instance cannot grow without bound.
  if (buckets.size > MAX_KEYS) {
    for (const [k, b] of buckets) if (b.resetAt < now) buckets.delete(k);
    if (buckets.size > MAX_KEYS) buckets.clear();
  }

  const existing = buckets.get(key);
  if (!existing || existing.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  if (existing.count > limit) {
    return { ok: false, retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfterSeconds: 0 };
}

/** Best-effort client identity behind Vercel's proxy. */
export function clientKey(req: Request, scope: string): string {
  const fwd = req.headers.get("x-forwarded-for") ?? "";
  const ip = fwd.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  return `${scope}:${ip}`;
}
