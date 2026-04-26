import { NextResponse } from "next/server";
import { isBlogAdminSession } from "@/lib/blog-admin-session";
import {
  PROJECTS_BOARD_KV_KEY,
  normalizeColumns,
} from "@/lib/projects-board-state";
import { getAllProjects } from "@/lib/projects";
import {
  redisConfigured,
  redisGetJson,
  redisSetJson,
} from "@/lib/redis-json";

async function boardGet(): Promise<unknown> {
  return redisGetJson<unknown>(PROJECTS_BOARD_KV_KEY);
}

async function boardSet(value: Record<string, string[]>): Promise<void> {
  await redisSetJson(PROJECTS_BOARD_KV_KEY, value);
}

async function allProjectIds(): Promise<string[]> {
  const projects = await getAllProjects();
  return projects.map((p) => p.id);
}

export async function GET() {
  const allIds = await allProjectIds();
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

  const columns = normalizeColumns(body, await allProjectIds());

  try {
    await boardSet(columns);
  } catch (e) {
    console.error("projects-board boardSet", e);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, columns });
}
