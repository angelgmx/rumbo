import type { ProjectSummary } from "@rumbo/core";
import { ChevronRightIcon, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { PROJECT_COLUMNS, ProjectRow } from "./ProjectRow";

const COLUMNS = ["Proyecto", "Progreso", "Siguiente hito", "Límite"];

/** Los proyectos de un estado en una tabla, plegable bajo su nombre y su cuenta. */
export function ProjectGroup({
  title,
  icon: Icon,
  projects,
  selectedId,
  defaultOpen,
}: {
  title: string;
  icon: LucideIcon;
  projects: ProjectSummary[];
  selectedId: number | undefined;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  if (projects.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex w-fit items-center gap-2 rounded-md px-1 py-1 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <ChevronRightIcon
          className={cn(
            "size-3.5 text-muted-foreground transition-transform duration-(--dur-fast)",
            open && "rotate-90",
          )}
        />
        <Icon className="size-4 text-muted-foreground" />
        <span className="font-medium">{title}</span>
        <span className="font-mono text-xs text-muted-foreground">{projects.length}</span>
      </button>
      {open && (
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className={`${PROJECT_COLUMNS} border-b py-3 text-sm text-muted-foreground`}>
            {COLUMNS.map((column, index) => (
              <span key={column} className={index === COLUMNS.length - 1 ? "justify-self-end" : ""}>
                {column}
              </span>
            ))}
          </div>
          {projects.map((summary) => (
            <ProjectRow key={summary.id} summary={summary} selected={summary.id === selectedId} />
          ))}
        </div>
      )}
    </section>
  );
}
