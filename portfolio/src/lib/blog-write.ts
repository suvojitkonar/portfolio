import fs from "fs";
import path from "path";
import { BLOG_SLUG_PATTERN } from "@/lib/blog-slug";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export { BLOG_SLUG_PATTERN };

function yamlScalar(value: string): string {
  if (value === "") return '""';
  if (/[\n:#"'\[\]{}]|^\s|\s$/.test(value)) {
    return JSON.stringify(value);
  }
  return value;
}

export type BlogWriteMeta = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt?: string;
  tags?: string[];
};

export function buildBlogMarkdown(meta: BlogWriteMeta, bodyMarkdown: string): string {
  const lines: string[] = [
    "---",
    `slug: ${meta.slug}`,
    `title: ${yamlScalar(meta.title)}`,
    `excerpt: ${yamlScalar(meta.excerpt)}`,
  ];
  if (meta.publishedAt?.trim()) {
    lines.push(`publishedAt: ${yamlScalar(meta.publishedAt.trim())}`);
  }
  if (meta.tags?.length) {
    lines.push("tags:");
    for (const t of meta.tags) {
      lines.push(`  - ${yamlScalar(t)}`);
    }
  }
  lines.push("---", "", bodyMarkdown.trimEnd(), "");
  return lines.join("\n");
}

export function writeBlogPostFile(slug: string, markdown: string): void {
  if (!BLOG_SLUG_PATTERN.test(slug)) {
    throw new Error("Invalid slug");
  }
  if (!fs.existsSync(BLOG_DIR)) {
    fs.mkdirSync(BLOG_DIR, { recursive: true });
  }
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  fs.writeFileSync(filePath, markdown, "utf8");
}
