import type { ProjectSummary } from "@rumbo/core";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  CircleCheckIcon,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { type StatusFilter, visibleStatuses } from "./projectFilters";
import {
  DEFAULT_SORT,
  nextSort,
  type ProjectSort,
  sortProjects,
  type SortKey,
} from "./projectSort";
import { PROJECT_COLUMNS, ProjectRow } from "./ProjectRow";
import type { ProjectViewProps } from "./ProjectViewProps";

const COLUMNS: { key: SortKey; label: string; align?: "end" }[] = [
  { key: "title", label: "Proyecto" },
  { key: "status", label: "Estado" },
  { key: "goal", label: "Objetivo" },
  { key: "progress", label: "Progreso" },
  { key: "milestone", label: "Siguiente hito" },
  { key: "pending", label: "Pendientes" },
  { key: "deadline", label: "Límite", align: "end" },
];

/**
 * Los proyectos en una tabla que se ordena por cualquier columna. Con «activos», los terminados
 * quedan plegados debajo.
 */
export function ProjectTable({
  projects,
  status,
  selectedId,
  onSelect,
  onOpen,
}: ProjectViewProps & { status: StatusFilter }) {
  const [sort, setSort] = useState(DEFAULT_SORT);
  const [doneOpen, setDoneOpen] = useState(false);
  const shown = sortProjects(
    projects.filter(({ project }) => visibleStatuses(status).includes(project.status)),
    sort,
  );
  const done =
    status === "open"
      ? sortProjects(
          projects.filter(({ project }) => project.status === "done"),
          sort,
        )
      : [];

  const row = (summary: ProjectSummary) => (
    <ProjectRow
      key={summary.id}
      summary={summary}
      selected={summary.id === selectedId}
      onSelect={() => onSelect(summary.id)}
      onOpen={() => onOpen(summary.id)}
    />
  );

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className={cn(PROJECT_COLUMNS, "border-b bg-muted/30 py-3 text-sm")}>
        {COLUMNS.map(({ key, label, align }) => (
          <SortHeader
            key={key}
            label={label}
            align={align}
            active={sort.key === key}
            direction={sort.direction}
            onSort={() => setSort(nextSort(sort, key))}
          />
        ))}
      </div>
      {shown.map(row)}
      {done.length > 0 && (
        <>
          <button
            type="button"
            aria-expanded={doneOpen}
            onClick={() => setDoneOpen(!doneOpen)}
            className="flex h-12 w-full items-center gap-2 border-t px-5 text-sm outline-none hover:bg-muted/40 focus-visible:bg-muted/40"
          >
            <ChevronRightIcon
              className={cn(
                "size-4 text-muted-foreground transition-transform duration-(--dur-fast)",
                doneOpen && "rotate-90",
              )}
            />
            <CircleCheckIcon className="size-4 text-success" />
            <span className="font-medium">Terminados</span>
            <span className="font-mono text-xs text-muted-foreground">{done.length}</span>
          </button>
          {doneOpen && done.map(row)}
        </>
      )}
    </div>
  );
}

function SortHeader({
  label,
  align,
  active,
  direction,
  onSort,
}: {
  label: string;
  align?: "end";
  active: boolean;
  direction: ProjectSort["direction"];
  onSort: () => void;
}) {
  const Arrow = !active ? ChevronsUpDownIcon : direction === "asc" ? ArrowUpIcon : ArrowDownIcon;

  return (
    <button
      type="button"
      onClick={onSort}
      className={cn(
        "flex w-fit items-center gap-1.5 rounded-sm font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
        align === "end" && "justify-self-end",
        active && "text-foreground",
      )}
    >
      {label}
      <Arrow className={cn("size-3.5", active && "text-primary")} />
    </button>
  );
}
