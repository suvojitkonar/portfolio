"use client";

import { useEffect } from "react";
import Link from "next/link";
import ScreenHeading from "@/components/portfolio/ScreenHeading/ScreenHeading";
import Animations from "@/lib/animations";
import type { BlogPostMeta } from "@/lib/blog";
import { cn } from "@/lib/utils";

type Props = {
  id?: string;
  screenName?: string;
  posts: BlogPostMeta[];
};

export default function Blog({ id, posts }: Props) {
  useEffect(() => {
    if (!id) return;
    const frame = requestAnimationFrame(() => {
      Animations.animations.fadeInScreen(id);
    });
    return () => cancelAnimationFrame(frame);
  }, [id]);

  return (
    <section
      id={id || ""}
      className={cn(
        "screen-container fade-in flex flex-col items-center opacity-0",
        "translate-y-20 transition-all duration-700 ease-out"
      )}
    >
      <div className="w-full min-w-0 max-w-5xl">
        <ScreenHeading title="Blog & articles" subHeading="Writing and notes" />
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="flex min-w-0 flex-col border-4 border-foreground bg-background p-4 shadow-neo sm:p-6"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="break-words text-lg font-bold text-foreground">
                  {post.title}
                </h3>
                {post.publishedAt ? (
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                    {post.publishedAt}
                  </span>
                ) : null}
              </div>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                {post.excerpt}
              </p>
              {post.tags?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {post.tags.map((t) => (
                    <span
                      key={t}
                      className="border-2 border-foreground bg-card px-2 py-1 text-xs font-semibold shadow-neo-sm"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}
              <div className="mt-6 border-t-4 border-foreground pt-4">
                <Link
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-primary underline decoration-2 underline-offset-4 hover:opacity-80"
                >
                  Read article
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
