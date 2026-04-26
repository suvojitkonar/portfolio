import "server-only";

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import {
  ensureProjectStoreSeeded,
  getStoredProjects,
} from "@/lib/content-admin-store";
import { redisConfigured } from "@/lib/redis-json";
import type { Project } from "./project-model";

export type { Project } from "./project-model";

const PROJECTS_DIR = path.join(process.cwd(), "content", "projects");

type ParsedMeta = {
  id: string;
  title: string;
  description: string;
  tags?: string[];
  href?: string;
  repo?: string;
  order: number;
};

function parseFrontmatter(data: Record<string, unknown>): ParsedMeta {
  const id = String(data.id ?? "");
  const title = String(data.title ?? "");
  const description = String(data.description ?? "");
  if (!id || !title || !description) {
    throw new Error(
      "Project frontmatter must include id, title, and description"
    );
  }
  let tags: string[] | undefined;
  if (Array.isArray(data.tags)) {
    tags = data.tags.map(String);
  }
  const href =
    data.href != null && String(data.href).trim() !== ""
      ? String(data.href)
      : undefined;
  const repo =
    data.repo != null && String(data.repo).trim() !== ""
      ? String(data.repo)
      : undefined;
  const order =
    typeof data.order === "number" && Number.isFinite(data.order)
      ? data.order
      : 0;
  return { id, title, description, tags, href, repo, order };
}

function listMarkdownFiles(): string[] {
  if (!fs.existsSync(PROJECTS_DIR)) return [];
  return fs.readdirSync(PROJECTS_DIR).filter((f) => f.endsWith(".md"));
}

function fileToProjectEntry(
  file: string
): { project: Project; order: number } {
  const full = path.join(PROJECTS_DIR, file);
  const raw = fs.readFileSync(full, "utf8");
  const { data, content } = matter(raw);
  const meta = parseFrontmatter(data as Record<string, unknown>);
  const body = content.trim();
  return {
    order: meta.order,
    project: {
      id: meta.id,
      title: meta.title,
      description: meta.description,
      tags: meta.tags ?? [],
      href: meta.href,
      repo: meta.repo,
      readDetails: body || undefined,
    },
  };
}

export function getAllProjectsFromFiles(): Project[] {
  const entries = listMarkdownFiles().map((file) => fileToProjectEntry(file));
  const seen = new Set<string>();
  for (const { project: p } of entries) {
    if (seen.has(p.id)) {
      throw new Error(`Duplicate project id in content/projects: ${p.id}`);
    }
    seen.add(p.id);
  }
  entries.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.project.id.localeCompare(b.project.id);
  });
  return entries.map((e) => e.project);
}

export function getProjectByIdFromFiles(id: string): Project | null {
  for (const file of listMarkdownFiles()) {
    const { project } = fileToProjectEntry(file);
    if (project.id === id) return project;
  }
  return null;
}

export async function getAllProjects(): Promise<Project[]> {
  const fallback = getAllProjectsFromFiles();
  if (!redisConfigured()) return fallback;
  await ensureProjectStoreSeeded(fallback);
  const stored = await getStoredProjects();
  return stored ?? fallback;
}

export async function getProjectById(id: string): Promise<Project | null> {
  const list = await getAllProjects();
  return list.find((p) => p.id === id) ?? null;
}
