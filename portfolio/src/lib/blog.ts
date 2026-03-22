import fs from "fs";
import path from "path";
import matter from "gray-matter";

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

export function getAllPostsMeta(): BlogPostMeta[] {
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

export function getPostBySlug(slug: string): BlogPost | null {
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

export function getAllPostSlugs(): { slug: string }[] {
  return getAllPostsMeta().map((p) => ({ slug: p.slug }));
}
