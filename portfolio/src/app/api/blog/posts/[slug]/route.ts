import { NextResponse } from "next/server";
import { isBlogAdminSession } from "@/lib/blog-admin-session";
import {
  adminStoreConfigured,
  getStoredBlogPosts,
  setStoredBlogPosts,
} from "@/lib/content-admin-store";
import { BLOG_SLUG_PATTERN } from "@/lib/blog-slug";
import { getAllPostsFromFiles } from "@/lib/blog";

type Ctx = { params: { slug: string } };

type BlogBody = {
  slug?: string;
  title?: string;
  excerpt?: string;
  bodyMarkdown?: string;
  publishedAt?: string;
  tags?: string[];
};

function normalizeInput(body: BlogBody) {
  return {
    slug: String(body.slug ?? "").trim(),
    title: String(body.title ?? "").trim(),
    excerpt: String(body.excerpt ?? "").trim(),
    bodyMarkdown: String(body.bodyMarkdown ?? "").trim(),
    publishedAt: String(body.publishedAt ?? "").trim() || undefined,
    tags: Array.isArray(body.tags)
      ? body.tags.map((t) => String(t).trim()).filter(Boolean)
      : [],
  };
}

async function getCurrentPosts() {
  const filePosts = getAllPostsFromFiles();
  if (!adminStoreConfigured()) return filePosts;
  const stored = await getStoredBlogPosts();
  if (stored && stored.length > 0) return stored;
  await setStoredBlogPosts(filePosts);
  return filePosts;
}

export async function GET(_: Request, { params }: Ctx) {
  if (!isBlogAdminSession()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const posts = await getCurrentPosts();
  const post = posts.find((p) => p.slug === params.slug);
  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ post });
}

export async function PUT(request: Request, { params }: Ctx) {
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
  const index = posts.findIndex((p) => p.slug === params.slug);
  if (index < 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (payload.slug !== params.slug && posts.some((p) => p.slug === payload.slug)) {
    return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
  }
  posts[index] = payload;
  await setStoredBlogPosts(posts);
  return NextResponse.json({ ok: true, slug: payload.slug });
}

export async function DELETE(_: Request, { params }: Ctx) {
  if (!isBlogAdminSession()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!adminStoreConfigured()) {
    return NextResponse.json({ error: "Redis not configured" }, { status: 503 });
  }
  const posts = await getCurrentPosts();
  const next = posts.filter((p) => p.slug !== params.slug);
  if (next.length === posts.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await setStoredBlogPosts(next);
  return NextResponse.json({ ok: true });
}
