"use client";

import { useCallback, useEffect, useState } from "react";
import BlogMarkdown from "@/components/portfolio/Blog/BlogMarkdown";
import { BLOG_SLUG_PATTERN } from "@/lib/blog-slug";
import { cn } from "@/lib/utils";

type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt?: string;
  tags?: string[];
  bodyMarkdown?: string;
};

type Project = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  href?: string;
  repo?: string;
  readDetails?: string;
};

export default function AdminBlogPage() {
  const [sessionOk, setSessionOk] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState<"blog" | "projects">("blog");

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [selectedBlogSlug, setSelectedBlogSlug] = useState<string | null>(null);
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [bodyMarkdown, setBodyMarkdown] = useState("");
  const [blogMessage, setBlogMessage] = useState("");
  const [blogError, setBlogError] = useState("");

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectTagsInput, setProjectTagsInput] = useState("");
  const [projectHref, setProjectHref] = useState("");
  const [projectRepo, setProjectRepo] = useState("");
  const [projectReadDetails, setProjectReadDetails] = useState("");
  const [projectMessage, setProjectMessage] = useState("");
  const [projectError, setProjectError] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const clearBlogForm = useCallback(() => {
    setSelectedBlogSlug(null);
    setSlug("");
    setTitle("");
    setExcerpt("");
    setPublishedAt("");
    setTagsInput("");
    setBodyMarkdown("");
  }, []);

  const clearProjectForm = useCallback(() => {
    setSelectedProjectId(null);
    setProjectId("");
    setProjectTitle("");
    setProjectDescription("");
    setProjectTagsInput("");
    setProjectHref("");
    setProjectRepo("");
    setProjectReadDetails("");
  }, []);

  const loadBlogPosts = useCallback(async () => {
    const res = await fetch("/api/blog/posts", { credentials: "include" });
    const data = (await res.json()) as { posts?: BlogPost[] };
    setBlogPosts(data.posts ?? []);
  }, []);

  const loadProjects = useCallback(async () => {
    const res = await fetch("/api/projects", { credentials: "include" });
    const data = (await res.json()) as { projects?: Project[] };
    setProjects(data.projects ?? []);
  }, []);

  const refreshSession = useCallback(async () => {
    const res = await fetch("/api/blog/session", { credentials: "include" });
    const data = (await res.json()) as { ok?: boolean };
    const ok = Boolean(data.ok);
    setSessionOk(ok);
    if (ok) {
      await Promise.all([loadBlogPosts(), loadProjects()]);
    }
  }, [loadBlogPosts, loadProjects]);

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
    setBlogMessage("");
    setBlogError("");
    setProjectMessage("");
    setProjectError("");
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlogMessage("");
    setBlogError("");
    const trimmedSlug = slug.trim();
    if (!BLOG_SLUG_PATTERN.test(trimmedSlug)) {
      setBlogError(
        "Slug must be lowercase letters and numbers, separated by hyphens (e.g. my-new-post)."
      );
      return;
    }
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const editing = Boolean(selectedBlogSlug);
    const endpoint = editing ? `/api/blog/posts/${selectedBlogSlug}` : "/api/blog/posts";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(endpoint, {
      method,
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
      setBlogError(data.error ?? "Save failed.");
      return;
    }
    setBlogMessage(
      editing
        ? `Updated /blog/${data.slug}.`
        : `Created and saved /blog/${data.slug}.`
    );
    await loadBlogPosts();
    clearBlogForm();
  };

  const startEditBlog = async (targetSlug: string) => {
    setBlogMessage("");
    setBlogError("");
    const res = await fetch(`/api/blog/posts/${targetSlug}`, {
      credentials: "include",
    });
    const data = (await res.json()) as { post?: BlogPost; error?: string };
    if (!res.ok || !data.post) {
      setBlogError(data.error ?? "Could not load post.");
      return;
    }
    const post = data.post;
    setSelectedBlogSlug(targetSlug);
    setSlug(post.slug);
    setTitle(post.title);
    setExcerpt(post.excerpt);
    setPublishedAt(post.publishedAt ?? "");
    setTagsInput(post.tags?.join(", ") ?? "");
    setBodyMarkdown(post.bodyMarkdown ?? "");
  };

  const handleDeleteBlog = async (targetSlug: string) => {
    if (!window.confirm(`Delete blog post "${targetSlug}"?`)) return;
    setBlogMessage("");
    setBlogError("");
    const res = await fetch(`/api/blog/posts/${targetSlug}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setBlogError(data.error ?? "Delete failed.");
      return;
    }
    if (selectedBlogSlug === targetSlug) clearBlogForm();
    await loadBlogPosts();
    setBlogMessage(`Deleted /blog/${targetSlug}.`);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setProjectMessage("");
    setProjectError("");
    const payload = {
      id: projectId.trim(),
      title: projectTitle.trim(),
      description: projectDescription.trim(),
      tags: projectTagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      href: projectHref.trim() || undefined,
      repo: projectRepo.trim() || undefined,
      readDetails: projectReadDetails.trim() || undefined,
    };
    const editing = Boolean(selectedProjectId);
    const endpoint = editing
      ? `/api/projects/${selectedProjectId}`
      : "/api/projects";
    const res = await fetch(endpoint, {
      method: editing ? "PUT" : "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { error?: string; id?: string };
    if (!res.ok) {
      setProjectError(data.error ?? "Save failed.");
      return;
    }
    await loadProjects();
    clearProjectForm();
    setProjectMessage(
      editing
        ? `Updated project "${data.id ?? payload.id}".`
        : `Created project "${data.id ?? payload.id}".`
    );
  };

  const startEditProject = async (id: string) => {
    setProjectMessage("");
    setProjectError("");
    const res = await fetch(`/api/projects/${id}`, { credentials: "include" });
    const data = (await res.json()) as { project?: Project; error?: string };
    if (!res.ok || !data.project) {
      setProjectError(data.error ?? "Could not load project.");
      return;
    }
    const p = data.project;
    setSelectedProjectId(id);
    setProjectId(p.id);
    setProjectTitle(p.title);
    setProjectDescription(p.description);
    setProjectTagsInput(p.tags.join(", "));
    setProjectHref(p.href ?? "");
    setProjectRepo(p.repo ?? "");
    setProjectReadDetails(p.readDetails ?? "");
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm(`Delete project "${id}"?`)) return;
    setProjectMessage("");
    setProjectError("");
    const res = await fetch(`/api/projects/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setProjectError(data.error ?? "Delete failed.");
      return;
    }
    if (selectedProjectId === id) clearProjectForm();
    await loadProjects();
    setProjectMessage(`Deleted project "${id}".`);
  };

  if (sessionOk === null) {
    return (
      <div className="min-h-screen min-w-0 bg-background px-3 py-12 text-foreground sm:px-4 sm:py-16">
        <p className="text-center text-sm text-muted">Loading…</p>
      </div>
    );
  }

  if (!sessionOk) {
    return (
      <div className="min-h-screen min-w-0 bg-background px-3 py-12 text-foreground sm:px-4 sm:py-16">
        <div className="mx-auto max-w-md border-4 border-foreground bg-card p-5 shadow-neo-lg sm:p-8">
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
    <div className="min-h-screen min-w-0 bg-background px-3 py-8 text-foreground sm:px-4 sm:py-10 md:px-8">
      <div className="mx-auto max-w-4xl min-w-0 border-4 border-foreground bg-card p-4 shadow-neo-lg sm:p-6 md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b-4 border-foreground pb-6">
          <div>
            <h1 className="font-mono text-2xl font-bold">Write blog post</h1>
            <p className="mt-1 text-sm text-muted">
              Admin CRUD for blogs and projects, persisted in Redis.
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

        <div className="mt-8 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("blog")}
            className={cn(
              "border-2 border-foreground px-4 py-2 text-sm font-bold uppercase shadow-neo-sm",
              activeTab === "blog" ? "bg-primary" : "bg-background"
            )}
          >
            Blogs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("projects")}
            className={cn(
              "border-2 border-foreground px-4 py-2 text-sm font-bold uppercase shadow-neo-sm",
              activeTab === "projects" ? "bg-primary" : "bg-background"
            )}
          >
            Projects
          </button>
        </div>

        {activeTab === "blog" ? (
          <>
            <div className="mt-6 border-2 border-foreground bg-background p-3">
              <p className="text-xs font-bold uppercase text-muted">
                Existing posts
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {blogPosts.map((post) => (
                  <div
                    key={post.slug}
                    className="flex items-center gap-2 border-2 border-foreground px-2 py-1 text-xs"
                  >
                    <span>{post.slug}</span>
                    <button
                      type="button"
                      className="font-semibold text-primary underline"
                      onClick={() => void startEditBlog(post.slug)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="font-semibold text-red-600 underline"
                      onClick={() => void handleDeleteBlog(post.slug)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSaveBlog}>
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
              {selectedBlogSlug ? "Save changes" : "Create post"}
            </button>
            {selectedBlogSlug ? (
              <button
                type="button"
                onClick={clearBlogForm}
                className="border-2 border-foreground bg-background px-6 py-3 font-bold uppercase shadow-neo-sm"
              >
                Cancel edit
              </button>
            ) : null}
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

          {blogError ? (
            <p className="text-sm font-medium text-red-600" role="alert">
              {blogError}
            </p>
          ) : null}
          {blogMessage ? (
            <p className="text-sm font-medium text-green-700" role="status">
              {blogMessage}
            </p>
          ) : null}
            </form>

            {showPreview ? (
              <div className="mt-10 border-t-4 border-foreground pt-8">
                <h2 className="font-mono text-lg font-bold">Preview</h2>
                <div className="mt-4 min-w-0 border-4 border-foreground bg-background p-4 shadow-neo sm:p-6">
                  <BlogMarkdown markdown={bodyMarkdown || "*Nothing to preview.*"} />
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <>
            <div className="mt-6 border-2 border-foreground bg-background p-3">
              <p className="text-xs font-bold uppercase text-muted">
                Existing projects
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center gap-2 border-2 border-foreground px-2 py-1 text-xs"
                  >
                    <span>{project.id}</span>
                    <button
                      type="button"
                      className="font-semibold text-primary underline"
                      onClick={() => void startEditProject(project.id)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="font-semibold text-red-600 underline"
                      onClick={() => void handleDeleteProject(project.id)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSaveProject}>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block text-sm font-semibold">
                  Id (URL)
                  <input
                    required
                    className="mt-2 w-full border-2 border-foreground bg-background px-3 py-2 font-mono text-sm shadow-neo-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="my-project-id"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                  />
                </label>
                <label className="block text-sm font-semibold">
                  Tags (comma-separated)
                  <input
                    className="mt-2 w-full border-2 border-foreground bg-background px-3 py-2 shadow-neo-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={projectTagsInput}
                    onChange={(e) => setProjectTagsInput(e.target.value)}
                  />
                </label>
              </div>
              <label className="block text-sm font-semibold">
                Title
                <input
                  required
                  className="mt-2 w-full border-2 border-foreground bg-background px-3 py-2 shadow-neo-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                />
              </label>
              <label className="block text-sm font-semibold">
                Description
                <textarea
                  required
                  rows={3}
                  className="mt-2 w-full resize-y border-2 border-foreground bg-background px-3 py-2 shadow-neo-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                />
              </label>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block text-sm font-semibold">
                  Live URL (optional)
                  <input
                    className="mt-2 w-full border-2 border-foreground bg-background px-3 py-2 shadow-neo-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={projectHref}
                    onChange={(e) => setProjectHref(e.target.value)}
                  />
                </label>
                <label className="block text-sm font-semibold">
                  Repo URL (optional)
                  <input
                    className="mt-2 w-full border-2 border-foreground bg-background px-3 py-2 shadow-neo-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={projectRepo}
                    onChange={(e) => setProjectRepo(e.target.value)}
                  />
                </label>
              </div>
              <label className="block text-sm font-semibold">
                Read details markdown (optional)
                <textarea
                  rows={10}
                  className="mt-2 w-full resize-y border-2 border-foreground bg-background px-3 py-2 font-mono text-sm shadow-neo-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={projectReadDetails}
                  onChange={(e) => setProjectReadDetails(e.target.value)}
                />
              </label>
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="border-4 border-foreground bg-accent px-6 py-3 font-bold uppercase text-white shadow-neo"
                >
                  {selectedProjectId ? "Save changes" : "Create project"}
                </button>
                {selectedProjectId ? (
                  <button
                    type="button"
                    onClick={clearProjectForm}
                    className="border-2 border-foreground bg-background px-6 py-3 font-bold uppercase shadow-neo-sm"
                  >
                    Cancel edit
                  </button>
                ) : null}
              </div>
              {projectError ? (
                <p className="text-sm font-medium text-red-600" role="alert">
                  {projectError}
                </p>
              ) : null}
              {projectMessage ? (
                <p className="text-sm font-medium text-green-700" role="status">
                  {projectMessage}
                </p>
              ) : null}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
