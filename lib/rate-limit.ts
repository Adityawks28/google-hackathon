interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();
let callsSinceCleanup = 0;
const CLEANUP_INTERVAL = 100;

function pruneExpired() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now >= entry.resetAt) {
      store.delete(key);
    }
  }
}

export function rateLimit(
  key: string,
  maxRequests: number = 30,
  windowMs: number = 60_000,
): { allowed: boolean; remaining: number } {
  callsSinceCleanup++;
  if (callsSinceCleanup >= CLEANUP_INTERVAL) {
    callsSinceCleanup = 0;
    pruneExpired();
  }

  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: maxRequests - entry.count };
}
