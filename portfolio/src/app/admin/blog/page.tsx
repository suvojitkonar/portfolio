"use client";

import { useCallback, useEffect, useState } from "react";
import BlogMarkdown from "@/components/portfolio/Blog/BlogMarkdown";
import { BLOG_SLUG_PATTERN } from "@/lib/blog-slug";
import { cn } from "@/lib/utils";

export default function AdminBlogPage() {
  const [sessionOk, setSessionOk] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [bodyMarkdown, setBodyMarkdown] = useState("");
  const [publishMessage, setPublishMessage] = useState("");
  const [publishError, setPublishError] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const refreshSession = useCallback(async () => {
    const res = await fetch("/api/blog/session", { credentials: "include" });
    const data = (await res.json()) as { ok?: boolean };
    setSessionOk(Boolean(data.ok));
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/blog/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setLoginError("Invalid password or server not configured.");
      return;
    }
    setPassword("");
    await refreshSession();
  };

  const handleLogout = async () => {
    await fetch("/api/blog/logout", { method: "POST", credentials: "include" });
    await refreshSession();
    setPublishMessage("");
    setPublishError("");
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishMessage("");
    setPublishError("");
    const trimmedSlug = slug.trim();
    if (!BLOG_SLUG_PATTERN.test(trimmedSlug)) {
      setPublishError(
        "Slug must be lowercase letters and numbers, separated by hyphens (e.g. my-new-post)."
      );
      return;
    }
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const res = await fetch("/api/blog/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        slug: trimmedSlug,
        title: title.trim(),
        excerpt: excerpt.trim(),
        bodyMarkdown,
        publishedAt: publishedAt.trim() || undefined,
        tags: tags.length ? tags : undefined,
      }),
    });
    const data = (await res.json()) as { error?: string; slug?: string };
    if (!res.ok) {
      setPublishError(data.error ?? "Publish failed.");
      return;
    }
    setPublishMessage(`Published as /blog/${data.slug}.`);
  };

  if (sessionOk === null) {
    return (
      <div className="min-h-screen bg-background px-4 py-16 text-foreground">
        <p className="text-center text-sm text-muted">Loading…</p>
      </div>
    );
  }

  if (!sessionOk) {
    return (
      <div className="min-h-screen bg-background px-4 py-16 text-foreground">
        <div className="mx-auto max-w-md border-4 border-foreground bg-card p-8 shadow-neo-lg">
          <h1 className="font-mono text-xl font-bold">Blog admin</h1>
          <p className="mt-2 text-sm text-muted">Sign in to write and publish.</p>
          <form className="mt-8 space-y-4" onSubmit={handleLogin}>
            <label className="block text-sm font-semibold">
              Password
              <input
                type="password"
                autoComplete="current-password"
                className="mt-2 w-full border-2 border-foreground bg-background px-3 py-2 shadow-neo-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            {loginError ? (
              <p className="text-sm font-medium text-red-600" role="alert">
                {loginError}
              </p>
            ) : null}
            <button
              type="submit"
              className="w-full border-4 border-foreground bg-primary px-4 py-3 font-bold uppercase shadow-neo"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-foreground md:px-8">
      <div className="mx-auto max-w-4xl border-4 border-foreground bg-card p-6 shadow-neo-lg md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b-4 border-foreground pb-6">
          <div>
            <h1 className="font-mono text-2xl font-bold">Write blog post</h1>
            <p className="mt-1 text-sm text-muted">
              Publishes to <code className="text-xs">content/blog/</code> on this
              server. Serverless hosts cannot persist files; use a VPS or phase-2
              storage.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="border-2 border-foreground bg-background px-4 py-2 text-sm font-bold uppercase shadow-neo-sm hover:bg-muted/30"
          >
            Log out
          </button>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handlePublish}>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block text-sm font-semibold">
              Slug (URL)
              <input
                required
                className="mt-2 w-full border-2 border-foreground bg-background px-3 py-2 font-mono text-sm shadow-neo-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="my-post-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </label>
            <label className="block text-sm font-semibold">
              Published at (optional)
              <input
                className="mt-2 w-full border-2 border-foreground bg-background px-3 py-2 text-sm shadow-neo-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="2025-03-22"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
              />
            </label>
          </div>
          <label className="block text-sm font-semibold">
            Title
            <input
              required
              className="mt-2 w-full border-2 border-foreground bg-background px-3 py-2 shadow-neo-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label className="block text-sm font-semibold">
            Excerpt
            <textarea
              required
              rows={3}
              className="mt-2 w-full resize-y border-2 border-foreground bg-background px-3 py-2 shadow-neo-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />
          </label>
          <label className="block text-sm font-semibold">
            Tags (comma-separated)
            <input
              className="mt-2 w-full border-2 border-foreground bg-background px-3 py-2 shadow-neo-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="React, Next.js"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </label>
          <label className="block text-sm font-semibold">
            Body (Markdown)
            <textarea
              rows={16}
              className="mt-2 w-full resize-y border-2 border-foreground bg-background px-3 py-2 font-mono text-sm shadow-neo-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={bodyMarkdown}
              onChange={(e) => setBodyMarkdown(e.target.value)}
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="border-4 border-foreground bg-accent px-6 py-3 font-bold uppercase text-white shadow-neo"
            >
              Publish
            </button>
            <button
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              className={cn(
                "border-4 border-foreground px-6 py-3 font-bold uppercase shadow-neo",
                showPreview ? "bg-primary" : "bg-card"
              )}
            >
              {showPreview ? "Hide preview" : "Preview"}
            </button>
          </div>

          {publishError ? (
            <p className="text-sm font-medium text-red-600" role="alert">
              {publishError}
            </p>
          ) : null}
          {publishMessage ? (
            <p className="text-sm font-medium text-green-700" role="status">
              {publishMessage}
            </p>
          ) : null}
        </form>

        {showPreview ? (
          <div className="mt-10 border-t-4 border-foreground pt-8">
            <h2 className="font-mono text-lg font-bold">Preview</h2>
            <div className="mt-4 border-4 border-foreground bg-background p-6 shadow-neo">
              <BlogMarkdown markdown={bodyMarkdown || "*Nothing to preview.*"} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
