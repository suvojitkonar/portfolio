/** Shared kanban column state for Projects (API + client). */

export const PROJECTS_BOARD_KV_KEY = "portfolio:projects-board";

export const COLUMN_IDS = ["backlog", "inDevelopment", "done"] as const;
export type ColumnId = (typeof COLUMN_IDS)[number];

export function isColumnId(id: string): id is ColumnId {
  return COLUMN_IDS.includes(id as ColumnId);
}

export function defaultColumns(allIds: string[]): Record<ColumnId, string[]> {
  return {
    backlog: [...allIds],
    inDevelopment: [],
    done: [],
  };
}

export function normalizeColumns(
  saved: unknown,
  allIds: string[]
): Record<ColumnId, string[]> {
  const result: Record<ColumnId, string[]> = {
    backlog: [],
    inDevelopment: [],
    done: [],
  };
  const used = new Set<string>();
  const raw =
    saved && typeof saved === "object"
      ? (saved as Record<string, unknown>)
      : null;

  for (const col of COLUMN_IDS) {
    const list = raw?.[col];
    if (!Array.isArray(list)) continue;
    for (const id of list) {
      if (typeof id !== "string") continue;
      if (allIds.includes(id) && !used.has(id)) {
        result[col].push(id);
        used.add(id);
      }
    }
  }
  for (const id of allIds) {
    if (!used.has(id)) {
      result.backlog.push(id);
      used.add(id);
    }
  }
  return result;
}

export function findColumnForProjectId(
  projectId: string,
  cols: Record<ColumnId, string[]>
): ColumnId | null {
  for (const col of COLUMN_IDS) {
    if (cols[col].includes(projectId)) return col;
  }
  return null;
}
