import { NextResponse } from "next/server";
import { isBlogAdminSession } from "@/lib/blog-admin-session";
import {
  adminStoreConfigured,
  getStoredBlogPosts,
  setStoredBlogPosts,
  toBlogMeta,
} from "@/lib/content-admin-store";
import { BLOG_SLUG_PATTERN } from "@/lib/blog-slug";
import { getAllPostsFromFiles } from "@/lib/blog";

type BlogBody = {
  slug?: string;
  title?: string;
  excerpt?: string;
  bodyMarkdown?: string;
  publishedAt?: string;
  tags?: string[];
};

function normalizeInput(body: BlogBody) {
  const slug = String(body.slug ?? "").trim();
  const title = String(body.title ?? "").trim();
  const excerpt = String(body.excerpt ?? "").trim();
  const bodyMarkdown = String(body.bodyMarkdown ?? "").trim();
  const publishedAt = String(body.publishedAt ?? "").trim() || undefined;
  const tags = Array.isArray(body.tags)
    ? body.tags.map((t) => String(t).trim()).filter(Boolean)
    : [];
  return { slug, title, excerpt, bodyMarkdown, publishedAt, tags };
}

async function getCurrentPosts() {
  const filePosts = getAllPostsFromFiles();
  if (!adminStoreConfigured()) return filePosts;
  const stored = await getStoredBlogPosts();
  if (stored && stored.length > 0) return stored;
  await setStoredBlogPosts(filePosts);
  return filePosts;
}

export async function GET() {
  if (!isBlogAdminSession()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const posts = await getCurrentPosts();
  return NextResponse.json({ posts: posts.map((p) => toBlogMeta(p)) });
}

export async function POST(request: Request) {
  if (!isBlogAdminSession()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!adminStoreConfigured()) {
    return NextResponse.json({ error: "Redis not configured" }, { status: 503 });
  }
  let body: BlogBody;
  try {
    body = (await request.json()) as BlogBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const payload = normalizeInput(body);
  if (!BLOG_SLUG_PATTERN.test(payload.slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }
  if (!payload.title || !payload.excerpt || !payload.bodyMarkdown) {
    return NextResponse.json(
      { error: "slug, title, excerpt and bodyMarkdown are required" },
      { status: 400 }
    );
  }

  const posts = await getCurrentPosts();
  if (posts.some((p) => p.slug === payload.slug)) {
    return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
  }
  const next = [payload, ...posts];
  await setStoredBlogPosts(next);
  return NextResponse.json({ ok: true, slug: payload.slug });
}
