/** Client-safe project shape and helpers (no Node fs). */

export type Project = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  href?: string;
  repo?: string;
  /** Markdown body shown on the Read page / modal */
  readDetails?: string;
};

export function projectByIdMap(list: Project[]): Map<string, Project> {
  return new Map(list.map((p) => [p.id, p]));
}
