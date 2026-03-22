import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { isBlogAdminSession } from "@/lib/blog-admin-session";
import {
  PROJECTS_BOARD_KV_KEY,
  normalizeColumns,
} from "@/lib/projects-board-state";
import { getAllProjects } from "@/lib/projects";
import {
  getTcpRedisClient,
  tcpRedisConfigured,
} from "@/lib/redis-tcp-client";

function redisRestConfig(): { url: string; token: string } | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return { url, token };
}

function redisConfigured(): boolean {
  return redisRestConfig() !== null || tcpRedisConfigured();
}

function getUpstashRedis(): Redis | null {
  const cfg = redisRestConfig();
  if (!cfg) return null;
  return new Redis({ url: cfg.url, token: cfg.token });
}

async function boardGet(): Promise<unknown> {
  const rest = getUpstashRedis();
  if (rest) {
    try {
      return await rest.get(PROJECTS_BOARD_KV_KEY);
    } catch {
      return null;
    }
  }
  if (tcpRedisConfigured()) {
    try {
      const redis = await getTcpRedisClient();
      if (!redis) return null;
      const raw = await redis.get(PROJECTS_BOARD_KV_KEY);
      if (raw == null) return null;
      try {
        return JSON.parse(raw) as unknown;
      } catch {
        return null;
      }
    } catch {
      return null;
    }
  }
  return null;
}

async function boardSet(value: Record<string, string[]>): Promise<void> {
  const rest = getUpstashRedis();
  if (rest) {
    await rest.set(PROJECTS_BOARD_KV_KEY, value);
    return;
  }
  if (tcpRedisConfigured()) {
    const redis = await getTcpRedisClient();
    if (!redis) throw new Error("Redis TCP client unavailable");
    await redis.set(PROJECTS_BOARD_KV_KEY, JSON.stringify(value));
    return;
  }
  throw new Error("Redis not configured");
}

function allProjectIds(): string[] {
  return getAllProjects().map((p) => p.id);
}

export async function GET() {
  const allIds = allProjectIds();
  let stored: unknown = null;
  if (redisConfigured()) {
    stored = await boardGet();
  }
  const columns = normalizeColumns(stored, allIds);
  const admin = isBlogAdminSession();
  const editable = admin && redisConfigured();

  return NextResponse.json({
    columns,
    editable,
    persistence: redisConfigured() ? "redis" : "none",
  });
}

export async function PUT(request: Request) {
  if (!isBlogAdminSession()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!redisConfigured()) {
    return NextResponse.json({ error: "Redis not configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const columns = normalizeColumns(body, allProjectIds());

  try {
    await boardSet(columns);
  } catch (e) {
    console.error("projects-board boardSet", e);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, columns });
}
