import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getAllPostSlugs, getPostBySlug } from "@/lib/blog";
import BlogMarkdown from "@/components/portfolio/Blog/BlogMarkdown";

export const dynamic = "force-dynamic";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return getAllPostSlugs();
}

export function generateMetadata({ params }: Props): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) return { title: "Article" };
  return {
    title: `${post.title} — Suvojit`,
    description: post.excerpt,
  };
}

export default function BlogArticlePage({ params }: Props) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen min-w-0 bg-background px-3 py-8 text-foreground sm:px-4 sm:py-10 md:px-8">
      <div className="mx-auto max-w-3xl min-w-0 border-4 border-foreground bg-card p-4 shadow-neo-lg sm:p-8 md:p-12">
        <Link
          href="/"
          className="text-sm font-semibold text-primary underline decoration-2 underline-offset-4 hover:opacity-80"
        >
          ← Back to portfolio
        </Link>
        <header className="mt-8 border-b-4 border-foreground pb-8">
          <p className="text-xs font-bold uppercase tracking-wide text-muted">
            Blog
            {post.publishedAt ? (
              <>
                {" "}
                · <span>{post.publishedAt}</span>
              </>
            ) : null}
          </p>
          <h1 className="mt-3 font-mono text-2xl font-bold leading-tight md:text-3xl">
            {post.title}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
            {post.excerpt}
          </p>
          {post.tags?.length ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <span
                  key={t}
                  className="border-2 border-foreground bg-background px-2 py-1 text-xs font-semibold shadow-neo-sm"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : null}
        </header>
        <BlogMarkdown markdown={post.bodyMarkdown} />
      </div>
    </div>
  );
}
