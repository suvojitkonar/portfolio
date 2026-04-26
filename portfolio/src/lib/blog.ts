import fs from "fs";
import path from "path";
import matter from "gray-matter";
import {
  ensureBlogStoreSeeded,
  getStoredBlogPosts,
  toBlogMeta,
} from "@/lib/content-admin-store";
import { redisConfigured } from "@/lib/redis-json";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type BlogPostMeta = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt?: string;
  tags?: string[];
};

export type BlogPost = BlogPostMeta & {
  bodyMarkdown: string;
};

function parseFrontmatter(data: Record<string, unknown>): BlogPostMeta {
  const slug = String(data.slug ?? "");
  const title = String(data.title ?? "");
  const excerpt = String(data.excerpt ?? "");
  if (!slug || !title) {
    throw new Error("Blog post frontmatter must include slug and title");
  }
  let tags: string[] | undefined;
  if (Array.isArray(data.tags)) {
    tags = data.tags.map(String);
  }
  return {
    slug,
    title,
    excerpt,
    publishedAt:
      data.publishedAt != null ? String(data.publishedAt) : undefined,
    tags,
  };
}

function listMarkdownFiles(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
}

export function getAllPostsMetaFromFiles(): BlogPostMeta[] {
  const posts = listMarkdownFiles().map((file) => {
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
    const { data } = matter(raw);
    return parseFrontmatter(data as Record<string, unknown>);
  });
  return posts.sort((a, b) => {
    const ya = a.publishedAt ?? "";
    const yb = b.publishedAt ?? "";
    return yb.localeCompare(ya);
  });
}

export function getPostBySlugFromFiles(slug: string): BlogPost | null {
  for (const file of listMarkdownFiles()) {
    const full = path.join(BLOG_DIR, file);
    const raw = fs.readFileSync(full, "utf8");
    const { data, content } = matter(raw);
    const meta = parseFrontmatter(data as Record<string, unknown>);
    if (meta.slug === slug) {
      return { ...meta, bodyMarkdown: content.trim() };
    }
  }
  return null;
}

export function getAllPostsFromFiles(): BlogPost[] {
  return getAllPostsMetaFromFiles()
    .map((meta) => {
      const full = getPostBySlugFromFiles(meta.slug);
      if (!full) return null;
      return full;
    })
    .filter((post): post is BlogPost => post !== null);
}

function compareByPublishedAtDesc(a: BlogPostMeta, b: BlogPostMeta): number {
  const ya = a.publishedAt ?? "";
  const yb = b.publishedAt ?? "";
  return yb.localeCompare(ya);
}

export async function getAllPostsMeta(): Promise<BlogPostMeta[]> {
  const fallback = getAllPostsMetaFromFiles();
  if (!redisConfigured()) return fallback;
  await ensureBlogStoreSeeded(getAllPostsFromFiles());
  const stored = await getStoredBlogPosts();
  if (!stored) return fallback;
  return stored.map(toBlogMeta).sort(compareByPublishedAtDesc);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!redisConfigured()) return getPostBySlugFromFiles(slug);
  await ensureBlogStoreSeeded(getAllPostsFromFiles());
  const stored = await getStoredBlogPosts();
  if (!stored) return getPostBySlugFromFiles(slug);
  return stored.find((p) => p.slug === slug) ?? null;
}

export async function getAllPostSlugs(): Promise<{ slug: string }[]> {
  const posts = await getAllPostsMeta();
  return posts.map((p) => ({ slug: p.slug }));
}
