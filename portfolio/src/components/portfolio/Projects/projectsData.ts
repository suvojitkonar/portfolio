export type Project = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  href?: string;
  repo?: string;
  /** Markdown body shown in the Read modal */
  readDetails?: string;
};

export const projects: Project[] = [
  {
    id: "platform-dashboard",
    title: "Developer platform dashboard",
    description:
      "Internal tooling for teams to manage services, deploy workflows, and monitor usage with role-based access.",
    tags: ["React", "TypeScript", "API design"],
    href: "#",
    readDetails: `## Overview

A consolidated **internal console** where engineers and leads can provision services, wire up deployment pipelines, and inspect usage without jumping between disparate tools.

## What I focused on

- Role-based views so operators see only what their team owns
- Predictable API contracts between the UI and backing services
- Clear empty and error states so on-call isn’t guessing

## Outcome

Faster turnaround for routine changes and fewer “who has access?” threads in chat.`,
  },
  {
    id: "data-pipeline-toolkit",
    title: "Data pipeline toolkit",
    description:
      "Batch and streaming jobs for large-scale analytics with Spark and Hadoop, including observability hooks.",
    tags: ["Spark", "Hadoop", "Python"],
    repo: "#",
    readDetails: `## Overview

Reusable patterns and small utilities for **batch and streaming** workloads on Spark and Hadoop, with hooks for metrics and logging so jobs are observable in production.

## What I focused on

- Shared job configuration and validation to cut down copy-paste
- Consistent naming and partitioning conventions for downstream consumers
- Lightweight instrumentation points (timings, row counts, failure reasons)

## Outcome

Teams could stand up new pipelines faster and debug failures without digging through ad-hoc logs.`,
  },
  {
    id: "portfolio-site",
    title: "Portfolio site",
    description:
      "Personal site with a tabbed layout, project highlights, and contact flow—built with Next.js and Tailwind.",
    tags: ["Next.js", "Tailwind CSS"],
    href: "#",
    readDetails: `## Overview

This **portfolio** uses a tabbed layout to separate home, projects, blog, and contact—styled with a bold, neo-brutalist look using Tailwind.

## What I focused on

- Fast, static-friendly pages with Next.js App Router
- A project board with optional persisted layout when admin features are enabled
- Markdown-driven blog posts with readable typography

## Outcome

A single place to showcase work, writing, and how to get in touch.`,
  },
];

export function projectByIdMap(list: Project[]): Map<string, Project> {
  return new Map(list.map((p) => [p.id, p]));
}

export function getProjectById(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}
