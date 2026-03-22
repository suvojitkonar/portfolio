export type Project = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  href?: string;
  repo?: string;
};

export const projects: Project[] = [
  {
    id: "platform-dashboard",
    title: "Developer platform dashboard",
    description:
      "Internal tooling for teams to manage services, deploy workflows, and monitor usage with role-based access.",
    tags: ["React", "TypeScript", "API design"],
    href: "#",
  },
  {
    id: "data-pipeline-toolkit",
    title: "Data pipeline toolkit",
    description:
      "Batch and streaming jobs for large-scale analytics with Spark and Hadoop, including observability hooks.",
    tags: ["Spark", "Hadoop", "Python"],
    repo: "#",
  },
  {
    id: "portfolio-site",
    title: "Portfolio site",
    description:
      "Personal site with a tabbed layout, project highlights, and contact flow—built with Next.js and Tailwind.",
    tags: ["Next.js", "Tailwind CSS"],
    href: "#",
  },
];

export function projectByIdMap(list: Project[]): Map<string, Project> {
  return new Map(list.map((p) => [p.id, p]));
}
