import { NextResponse } from "next/server";
import { isBlogAdminSession } from "@/lib/blog-admin-session";
import {
  adminStoreConfigured,
  getStoredProjects,
  setStoredProjects,
} from "@/lib/content-admin-store";
import { getAllProjectsFromFiles } from "@/lib/projects";
import { PROJECTS_BOARD_KV_KEY, normalizeColumns } from "@/lib/projects-board-state";
import { redisGetJson, redisSetJson } from "@/lib/redis-json";

const PROJECT_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
type Ctx = { params: { id: string } };

type ProjectBody = {
  id?: string;
  title?: string;
  description?: string;
  tags?: string[];
  href?: string;
  repo?: string;
  readDetails?: string;
};

function normalizeInput(body: ProjectBody) {
  return {
    id: String(body.id ?? "").trim(),
    title: String(body.title ?? "").trim(),
    description: String(body.description ?? "").trim(),
    tags: Array.isArray(body.tags)
      ? body.tags.map((t) => String(t).trim()).filter(Boolean)
      : [],
    href: String(body.href ?? "").trim() || undefined,
    repo: String(body.repo ?? "").trim() || undefined,
    readDetails: String(body.readDetails ?? "").trim() || undefined,
  };
}

async function getCurrentProjects() {
  const fileProjects = getAllProjectsFromFiles();
  if (!adminStoreConfigured()) return fileProjects;
  const stored = await getStoredProjects();
  if (stored && stored.length > 0) return stored;
  await setStoredProjects(fileProjects);
  return fileProjects;
}

async function normalizeBoardForProjects(projectIds: string[]) {
  const stored = await redisGetJson<unknown>(PROJECTS_BOARD_KV_KEY);
  const columns = normalizeColumns(stored, projectIds);
  await redisSetJson(PROJECTS_BOARD_KV_KEY, columns);
}

export async function GET(_: Request, { params }: Ctx) {
  const projects = await getCurrentProjects();
  const project = projects.find((p) => p.id === params.id);
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ project });
}

export async function PUT(request: Request, { params }: Ctx) {
  if (!isBlogAdminSession()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!adminStoreConfigured()) {
    return NextResponse.json({ error: "Redis not configured" }, { status: 503 });
  }
  let body: ProjectBody;
  try {
    body = (await request.json()) as ProjectBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const payload = normalizeInput(body);
  if (!PROJECT_ID_PATTERN.test(payload.id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  if (!payload.title || !payload.description) {
    return NextResponse.json(
      { error: "id, title and description are required" },
      { status: 400 }
    );
  }

  const projects = await getCurrentProjects();
  const index = projects.findIndex((p) => p.id === params.id);
  if (index < 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (payload.id !== params.id && projects.some((p) => p.id === payload.id)) {
    return NextResponse.json({ error: "Project id already exists" }, { status: 409 });
  }
  projects[index] = payload;
  await setStoredProjects(projects);
  await normalizeBoardForProjects(projects.map((p) => p.id));
  return NextResponse.json({ ok: true, id: payload.id });
}

export async function DELETE(_: Request, { params }: Ctx) {
  if (!isBlogAdminSession()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!adminStoreConfigured()) {
    return NextResponse.json({ error: "Redis not configured" }, { status: 503 });
  }
  const projects = await getCurrentProjects();
  const next = projects.filter((p) => p.id !== params.id);
  if (next.length === projects.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await setStoredProjects(next);
  await normalizeBoardForProjects(next.map((p) => p.id));
  return NextResponse.json({ ok: true });
}
