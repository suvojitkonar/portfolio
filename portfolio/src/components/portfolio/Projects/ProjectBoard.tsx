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
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import type { Project } from "@/lib/project-model";
import { projectByIdMap } from "@/lib/project-model";
import {
  COLUMN_IDS,
  type ColumnId,
  defaultColumns,
  findColumnForProjectId,
  isColumnId,
  normalizeColumns,
} from "@/lib/projects-board-state";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "portfolio-projects-board";

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

function ProjectCardContent({
  project,
  dragHandleProps,
  omitReadLink,
}: {
  project: Project;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  /** Hide Read during drag overlay preview */
  omitReadLink?: boolean;
}) {
  return (
    <>
      {dragHandleProps ? (
        <div
          {...dragHandleProps}
          className="touch-none cursor-grab border-b-2 border-foreground bg-muted px-2 py-1.5 text-center text-xs font-bold uppercase tracking-wide text-foreground active:cursor-grabbing"
        >
          Drag
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-4 pt-3">
        <h3 className="break-words text-base font-bold text-foreground">
          {project.title}
        </h3>
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
        {!omitReadLink || project.href || project.repo ? (
          <div className="mt-4 flex flex-wrap gap-3 border-t-2 border-foreground pt-3 text-sm font-semibold">
            {!omitReadLink ? (
              <a
                href={`/projects/${project.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline decoration-2 underline-offset-4 hover:opacity-80"
              >
                Read
              </a>
            ) : null}
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
  editable,
}: {
  project: Project;
  columnId: ColumnId;
  editable: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: project.id,
      data: { type: "project", columnId },
      disabled: !editable,
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
        dragHandleProps={
          editable ? { ...listeners, ...attributes } : undefined
        }
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

type ApiBoardResponse = {
  columns?: unknown;
  editable?: boolean;
  persistence?: string;
};

export default function ProjectBoard({ projects: projectList }: Props) {
  const allIds = useMemo(() => projectList.map((p) => p.id), [projectList]);
  const byId = useMemo(() => projectByIdMap(projectList), [projectList]);

  const [columns, setColumns] = useState<Record<ColumnId, string[]>>(() =>
    defaultColumns(allIds)
  );
  const [hydrated, setHydrated] = useState(false);
  const [editable, setEditable] = useState(false);
  const [serverBacked, setServerBacked] = useState(false);
  const [apiPersistence, setApiPersistence] = useState<
    "redis" | "none" | null
  >(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const columnsRef = useRef(columns);
  columnsRef.current = columns;
  const editableRef = useRef(editable);
  editableRef.current = editable;
  const serverBackedRef = useRef(serverBacked);
  serverBackedRef.current = serverBacked;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/projects-board", {
          credentials: "include",
        });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as ApiBoardResponse;
        if (cancelled) return;
        setColumns(normalizeColumns(data.columns, allIds));
        setEditable(Boolean(data.editable));
        const isRedis = data.persistence === "redis";
        setServerBacked(isRedis);
        setApiPersistence(isRedis ? "redis" : "none");
        setLoadFailed(false);
      } catch {
        if (cancelled) return;
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            setColumns(
              normalizeColumns(JSON.parse(raw) as unknown, allIds)
            );
          } else {
            setColumns(defaultColumns(allIds));
          }
        } catch {
          setColumns(defaultColumns(allIds));
        }
        setEditable(process.env.NODE_ENV === "development");
        setServerBacked(false);
        setApiPersistence(null);
        setLoadFailed(true);
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [allIds]);

  useEffect(() => {
    if (!hydrated || serverBacked) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(columns));
    } catch {
      /* quota */
    }
  }, [columns, hydrated, serverBacked]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 6 },
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

    if (!targetCol || sourceCol === targetCol) return;

    const previous = columnsRef.current;
    const next: Record<ColumnId, string[]> = {
      backlog: [...previous.backlog],
      inDevelopment: [...previous.inDevelopment],
      done: [...previous.done],
    };
    const t = isColumnId(overId)
      ? overId
      : findColumnForProjectId(overId, previous);
    if (!t || sourceCol === t) return;

    next[sourceCol] = next[sourceCol].filter((id) => id !== draggedId);
    if (!next[t].includes(draggedId)) {
      next[t] = [...next[t], draggedId];
    }

    setColumns(next);

    if (serverBackedRef.current && editableRef.current) {
      void (async () => {
        try {
          const res = await fetch("/api/projects-board", {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(next),
          });
          if (!res.ok) throw new Error();
        } catch {
          setColumns(previous);
        }
      })();
    }
  }, []);

  const onDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  const activeProject = activeId ? byId.get(activeId) : undefined;

  return (
    <div className="w-full min-w-0">
      {hydrated && serverBacked && !editable ? (
        <p className="mb-4 text-center text-xs leading-relaxed text-muted">
          This layout is shared for everyone. Sign in at{" "}
          <a
            href="/admin/blog"
            className="font-semibold text-primary underline decoration-2 underline-offset-4"
          >
            /admin/blog
          </a>{" "}
          (blog admin), then open this tab again to drag and save.
        </p>
      ) : null}
      {hydrated && apiPersistence === "none" ? (
        <p className="mb-4 text-center text-xs leading-relaxed text-muted">
          Set either Upstash REST vars (
          <code className="border border-foreground bg-background px-1 font-mono text-[10px]">
            UPSTASH_REDIS_REST_URL
          </code>
          ,{" "}
          <code className="border border-foreground bg-background px-1 font-mono text-[10px]">
            UPSTASH_REDIS_REST_TOKEN
          </code>
          ) or a TCP URL (
          <code className="border border-foreground bg-background px-1 font-mono text-[10px]">
            STORAGE_REDIS_URL
          </code>
          ,{" "}
          <code className="font-mono text-[10px]">redis://…</code>
          ). REST is preferred if both are set.
        </p>
      ) : null}
      {hydrated && loadFailed ? (
        <p className="mb-4 text-center text-xs leading-relaxed text-muted">
          {process.env.NODE_ENV === "development"
            ? "Could not load board API; using localStorage for this browser only."
            : "Could not load board from the server; showing default or saved layout."}
        </p>
      ) : null}

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
                    editable={editable}
                  />
                );
              })}
            </KanbanColumn>
          ))}
        </div>
        <DragOverlay dropAnimation={null}>
          {activeProject ? (
            <article className="flex max-w-[280px] flex-col border-4 border-foreground bg-background opacity-95 shadow-neo-lg">
              <ProjectCardContent project={activeProject} omitReadLink />
            </article>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
