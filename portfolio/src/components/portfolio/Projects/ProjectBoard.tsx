"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import type { Project } from "./projectsData";
import { projectByIdMap } from "./projectsData";
import { cn } from "@/lib/utils";

/** Client-visible gate only; not a security boundary. */
const SAFE_WORD = "blueberrycheesecake";

const STORAGE_KEY = "portfolio-projects-board";

export const COLUMN_IDS = ["backlog", "inDevelopment", "done"] as const;
export type ColumnId = (typeof COLUMN_IDS)[number];

const COLUMN_LABELS: Record<ColumnId, string> = {
  backlog: "Backlog",
  inDevelopment: "In development",
  done: "Done",
};

const COLUMN_HEADER_CLASS: Record<ColumnId, string> = {
  backlog: "bg-card",
  inDevelopment: "bg-primary text-foreground",
  done: "bg-accent text-white",
};

function isColumnId(id: string): id is ColumnId {
  return COLUMN_IDS.includes(id as ColumnId);
}

function normalizeColumns(
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

function findColumnForProjectId(
  projectId: string,
  cols: Record<ColumnId, string[]>
): ColumnId | null {
  for (const col of COLUMN_IDS) {
    if (cols[col].includes(projectId)) return col;
  }
  return null;
}

function defaultColumns(allIds: string[]): Record<ColumnId, string[]> {
  return {
    backlog: [...allIds],
    inDevelopment: [],
    done: [],
  };
}

function ProjectCardContent({
  project,
  dragHandleProps,
}: {
  project: Project;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}) {
  return (
    <>
      {dragHandleProps ? (
        <div
          {...dragHandleProps}
          className="cursor-grab border-b-2 border-foreground bg-muted px-2 py-1.5 text-center text-xs font-bold uppercase tracking-wide text-foreground active:cursor-grabbing"
        >
          Drag
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-4 pt-3">
        <h3 className="text-base font-bold text-foreground">{project.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
          {project.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {project.tags.map((t) => (
            <span
              key={t}
              className="border-2 border-foreground bg-card px-2 py-1 text-xs font-semibold shadow-neo-sm"
            >
              {t}
            </span>
          ))}
        </div>
        {project.href || project.repo ? (
          <div className="mt-4 flex flex-wrap gap-3 border-t-2 border-foreground pt-3 text-sm font-semibold">
            {project.href ? (
              <a
                href={project.href}
                className="text-primary underline decoration-2 underline-offset-4 hover:opacity-80"
              >
                Live
              </a>
            ) : null}
            {project.repo ? (
              <a
                href={project.repo}
                className="text-foreground underline decoration-2 underline-offset-4 hover:text-primary"
              >
                Code
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  );
}

function DraggableProjectCard({
  project,
  columnId,
}: {
  project: Project;
  columnId: ColumnId;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: project.id,
      data: { type: "project", columnId },
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex flex-col border-4 border-foreground bg-background shadow-neo",
        isDragging && "opacity-40"
      )}
    >
      <ProjectCardContent
        project={project}
        dragHandleProps={{ ...listeners, ...attributes }}
      />
    </article>
  );
}

function KanbanColumn({
  columnId,
  title,
  headerClass,
  children,
}: {
  columnId: ColumnId;
  title: string;
  headerClass: string;
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: columnId });
  return (
    <div className="flex min-h-[min(320px,50vh)] flex-1 flex-col border-4 border-foreground bg-card shadow-neo min-[900px]:min-h-[360px]">
      <div
        className={cn(
          "border-b-4 border-foreground px-3 py-3 text-center text-sm font-bold uppercase shadow-neo-sm",
          headerClass
        )}
      >
        {title}
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-1 flex-col gap-4 p-3 transition-colors",
          isOver && "bg-primary/15"
        )}
      >
        {children}
      </div>
    </div>
  );
}

type Props = {
  projects: Project[];
};

export default function ProjectBoard({ projects: projectList }: Props) {
  const allIds = useMemo(() => projectList.map((p) => p.id), [projectList]);
  const byId = useMemo(() => projectByIdMap(projectList), [projectList]);

  const [columns, setColumns] = useState<Record<ColumnId, string[]>>(() =>
    defaultColumns(allIds)
  );
  const [hydrated, setHydrated] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const columnsRef = useRef(columns);
  columnsRef.current = columns;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        setColumns(normalizeColumns(parsed, allIds));
      } else {
        setColumns(defaultColumns(allIds));
      }
    } catch {
      setColumns(defaultColumns(allIds));
    }
    setHydrated(true);
  }, [allIds]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(columns));
    } catch {
      /* ignore quota */
    }
  }, [columns, hydrated]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const onDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const onDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const draggedId = String(active.id);
    const sourceCol = active.data.current?.columnId as ColumnId | undefined;
    if (!sourceCol || !isColumnId(sourceCol)) return;

    const overId = String(over.id);
    const cols = columnsRef.current;
    const targetCol: ColumnId | null = isColumnId(overId)
      ? overId
      : findColumnForProjectId(overId, cols);

    if (!targetCol) return;
    if (sourceCol === targetCol) return;

    const answer = window.prompt("What's your safe word?");
    if ((answer ?? "").trim() !== SAFE_WORD) return;

    setColumns((prev) => {
      const t =
        isColumnId(overId) ? overId : findColumnForProjectId(overId, prev);
      if (!t || sourceCol === t) return prev;
      const next: Record<ColumnId, string[]> = {
        backlog: [...prev.backlog],
        inDevelopment: [...prev.inDevelopment],
        done: [...prev.done],
      };
      next[sourceCol] = next[sourceCol].filter((id) => id !== draggedId);
      if (!next[t].includes(draggedId)) {
        next[t] = [...next[t], draggedId];
      }
      return next;
    });
  }, []);

  const onDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  const activeProject = activeId ? byId.get(activeId) : undefined;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <div className="flex w-full flex-col gap-4 min-[900px]:flex-row min-[900px]:items-stretch">
        {COLUMN_IDS.map((colId) => (
          <KanbanColumn
            key={colId}
            columnId={colId}
            title={COLUMN_LABELS[colId]}
            headerClass={COLUMN_HEADER_CLASS[colId]}
          >
            {columns[colId].map((id) => {
              const p = byId.get(id);
              if (!p) return null;
              return (
                <DraggableProjectCard
                  key={id}
                  project={p}
                  columnId={colId}
                />
              );
            })}
          </KanbanColumn>
        ))}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeProject ? (
          <article className="flex max-w-[280px] flex-col border-4 border-foreground bg-background opacity-95 shadow-neo-lg">
            <ProjectCardContent project={activeProject} />
          </article>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
