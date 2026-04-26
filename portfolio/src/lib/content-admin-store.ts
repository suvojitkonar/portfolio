import type { BlogPost, BlogPostMeta } from "@/lib/blog";
import type { Project } from "@/lib/project-model";
import {
  redisConfigured,
  redisGetJson,
  redisSetJson,
} from "@/lib/redis-json";

const PROJECTS_CONTENT_KV_KEY = "portfolio:projects-content";
const BLOG_CONTENT_KV_KEY = "portfolio:blog-content";

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string").map((v) => v.trim()).filter(Boolean);
}

function normalizeProject(value: unknown): Project | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const id = String(raw.id ?? "").trim();
  const title = String(raw.title ?? "").trim();
  const description = String(raw.description ?? "").trim();
  if (!id || !title || !description) return null;
  const href = String(raw.href ?? "").trim() || undefined;
  const repo = String(raw.repo ?? "").trim() || undefined;
  const readDetails = String(raw.readDetails ?? "").trim() || undefined;
  return {
    id,
    title,
    description,
    tags: toStringArray(raw.tags),
    href,
    repo,
    readDetails,
  };
}

function normalizeBlogPost(value: unknown): BlogPost | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const slug = String(raw.slug ?? "").trim();
  const title = String(raw.title ?? "").trim();
  const excerpt = String(raw.excerpt ?? "").trim();
  const bodyMarkdown = String(raw.bodyMarkdown ?? "");
  if (!slug || !title || !excerpt || !bodyMarkdown.trim()) return null;
  const publishedAt = String(raw.publishedAt ?? "").trim() || undefined;
  return {
    slug,
    title,
    excerpt,
    bodyMarkdown: bodyMarkdown.trim(),
    publishedAt,
    tags: toStringArray(raw.tags),
  };
}

function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
  }
  return out;
}

function dedupeBySlug<T extends { slug: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    if (seen.has(item.slug)) continue;
    seen.add(item.slug);
    out.push(item);
  }
  return out;
}

export function adminStoreConfigured(): boolean {
  return redisConfigured();
}

export async function getStoredProjects(): Promise<Project[] | null> {
  const value = await redisGetJson<unknown>(PROJECTS_CONTENT_KV_KEY);
  if (!Array.isArray(value)) return null;
  const list = value.map(normalizeProject).filter((v): v is Project => v !== null);
  return dedupeById(list);
}

export async function setStoredProjects(projects: Project[]): Promise<void> {
  await redisSetJson(PROJECTS_CONTENT_KV_KEY, projects);
}

export async function getStoredBlogPosts(): Promise<BlogPost[] | null> {
  const value = await redisGetJson<unknown>(BLOG_CONTENT_KV_KEY);
  if (!Array.isArray(value)) return null;
  const list = value.map(normalizeBlogPost).filter((v): v is BlogPost => v !== null);
  return dedupeBySlug(list);
}

export async function setStoredBlogPosts(posts: BlogPost[]): Promise<void> {
  await redisSetJson(BLOG_CONTENT_KV_KEY, posts);
}

export async function ensureProjectStoreSeeded(seed: Project[]): Promise<void> {
  if (!redisConfigured()) return;
  const existing = await getStoredProjects();
  if (existing && existing.length > 0) return;
  await setStoredProjects(seed);
}

export async function ensureBlogStoreSeeded(seed: BlogPost[]): Promise<void> {
  if (!redisConfigured()) return;
  const existing = await getStoredBlogPosts();
  if (existing && existing.length > 0) return;
  await setStoredBlogPosts(seed);
}

export function toBlogMeta(post: BlogPost): BlogPostMeta {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    publishedAt: post.publishedAt,
    tags: post.tags,
  };
}
