import { createClient, type RedisClientType } from "redis";

/**
 * Single shared TCP client for serverless (Vercel pattern).
 * @see https://vercel.com/docs/redis — uses `createClient` + `connect`.
 */
const globalForRedis = globalThis as typeof globalThis & {
  __portfolioRedisTcp?: RedisClientType;
};

function tcpRedisUrl(): string | null {
  const u =
    process.env.REDIS_URL?.trim() ||
    process.env.STORAGE_REDIS_URL?.trim() ||
    process.env.storage_REDIS_URL?.trim() ||
    "";
  return u || null;
}

export function tcpRedisConfigured(): boolean {
  return tcpRedisUrl() !== null;
}

/** Lazily create and connect (cached on globalThis between invocations). */
export async function getTcpRedisClient(): Promise<RedisClientType | null> {
  const url = tcpRedisUrl();
  if (!url) return null;

  if (!globalForRedis.__portfolioRedisTcp) {
    globalForRedis.__portfolioRedisTcp = createClient({ url });
    globalForRedis.__portfolioRedisTcp.on("error", (err) => {
      console.error("Redis TCP error", err);
    });
  }

  const client = globalForRedis.__portfolioRedisTcp;
  if (!client.isOpen) {
    await client.connect();
  }
  return client;
}
