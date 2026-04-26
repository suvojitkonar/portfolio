import { NextResponse } from "next/server";
import { isBlogAdminSession } from "@/lib/blog-admin-session";
import {
  adminStoreConfigured,
  getStoredProjects,
  setStoredProjects,
} from "@/lib/content-admin-store";
import { getAllProjectsFromFiles } from "@/lib/projects";

const PROJECT_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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

export async function GET() {
  const projects = await getCurrentProjects();
  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
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
  if (projects.some((p) => p.id === payload.id)) {
    return NextResponse.json({ error: "Project id already exists" }, { status: 409 });
  }
  const next = [...projects, payload];
  await setStoredProjects(next);
  return NextResponse.json({ ok: true, id: payload.id });
}
