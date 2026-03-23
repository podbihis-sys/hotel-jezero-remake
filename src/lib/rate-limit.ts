import { getRedis } from "./redis";

export async function rateLimit(
  key: string,
  limit: number = 5,
  windowMs: number = 60 * 1000 // 1 minute default
): Promise<{ success: boolean; remaining: number }> {
  try {
    const redis = getRedis();
    const redisKey = `ratelimit:${key}`;
    const current = await redis.incr(redisKey);

    if (current === 1) {
      // First request — set expiry
      await redis.pexpire(redisKey, windowMs);
    }

    const remaining = Math.max(0, limit - current);
    return { success: current <= limit, remaining };
  } catch {
    // If Redis fails, allow the request (fail open)
    return { success: true, remaining: limit };
  }
}
