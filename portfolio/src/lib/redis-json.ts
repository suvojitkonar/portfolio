import { Redis } from "@upstash/redis";
import { getTcpRedisClient, tcpRedisConfigured } from "@/lib/redis-tcp-client";

function redisRestConfig(): { url: string; token: string } | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? "";
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN ?? "";
  if (!url || !token) return null;
  return { url, token };
}

export function redisConfigured(): boolean {
  return redisRestConfig() !== null || tcpRedisConfigured();
}

function getUpstashRedis(): Redis | null {
  const cfg = redisRestConfig();
  if (!cfg) return null;
  return new Redis({ url: cfg.url, token: cfg.token });
}

export async function redisGetJson<T>(key: string): Promise<T | null> {
  const rest = getUpstashRedis();
  if (rest) {
    try {
      const value = await rest.get(key);
      return value == null ? null : (value as T);
    } catch {
      return null;
    }
  }
  if (tcpRedisConfigured()) {
    try {
      const redis = await getTcpRedisClient();
      if (!redis) return null;
      const raw = await redis.get(key);
      if (raw == null) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }
  return null;
}

export async function redisSetJson(key: string, value: unknown): Promise<void> {
  const rest = getUpstashRedis();
  if (rest) {
    await rest.set(key, value);
    return;
  }
  if (tcpRedisConfigured()) {
    const redis = await getTcpRedisClient();
    if (!redis) throw new Error("Redis TCP client unavailable");
    await redis.set(key, JSON.stringify(value));
    return;
  }
  throw new Error("Redis not configured");
}

export async function redisDeleteKey(key: string): Promise<void> {
  const rest = getUpstashRedis();
  if (rest) {
    await rest.del(key);
    return;
  }
  if (tcpRedisConfigured()) {
    const redis = await getTcpRedisClient();
    if (!redis) throw new Error("Redis TCP client unavailable");
    await redis.del(key);
    return;
  }
  throw new Error("Redis not configured");
}
