import type { ProjectStatus, ProjectSummary } from "@rumbo/core";
import { CheckIcon, ChevronRightIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { useRumbo } from "@/app/RumboContext";
import { type BoardColumn, ColumnHeading, StatusBoard } from "@/components/StatusBoard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProjectCard } from "./ProjectCard";
import type { ProjectViewProps } from "./ProjectViewProps";
import { type StatusFilter, visibleStatuses } from "./projectFilters";
import { STATUS_ICON, STATUS_LABEL } from "./projectLabels";

/**
 * Un proyecto por tarjeta, en la columna de su estado; arrastrarla a otra columna lo cambia.
 * Con «activos» los terminados quedan plegados a un lado, a un clic de verse.
 */
export function ProjectBoard({
  projects,
  status,
  selectedId,
  onSelect,
  onOpen,
  onCreate,
}: ProjectViewProps & {
  status: StatusFilter;
  onCreate: (status: ProjectStatus) => void;
}) {
  const rumbo = useRumbo();
  const [doneOpen, setDoneOpen] = useState(false);
  const foldable = status === "open";
  const statuses = foldable
    ? [...visibleStatuses(status), "done" as const]
    : visibleStatuses(status);

  function column(columnStatus: ProjectStatus): BoardColumn<ProjectStatus> {
    const own = projects.filter(({ project }) => project.status === columnStatus);
    const { icon: Icon, style } = STATUS_ICON[columnStatus];
    const folded = foldable && columnStatus === "done" && !doneOpen;
    const creatable = columnStatus !== "done";
    const create = () => onCreate(columnStatus);

    return {
      status: columnStatus,
      heading: (
        <ColumnHeading
          icon={
            <>
              {foldable && columnStatus === "done" && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={doneOpen ? "Plegar terminados" : "Abrir terminados"}
                  aria-expanded={doneOpen}
                  onClick={() => setDoneOpen(!doneOpen)}
                >
                  <ChevronRightIcon className={cn(doneOpen && "rotate-90")} />
                </Button>
              )}
              <Icon className={cn("size-4", style)} />
            </>
          }
          title={STATUS_LABEL[columnStatus]}
          count={own.length}
          action={
            creatable && (
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={`Nuevo proyecto en ${STATUS_LABEL[columnStatus]}`}
                onClick={create}
              >
                <PlusIcon />
              </Button>
            )
          }
        />
      ),
      footer: creatable && (
        <Button
          variant="outline"
          className="h-10 justify-start gap-2 border-dashed bg-transparent text-muted-foreground"
          onClick={create}
        >
          <PlusIcon data-icon="inline-start" />
          Nuevo proyecto
        </Button>
      ),
      folded: folded && (
        <FoldedProjects projects={own} onSelect={onSelect} onOpen={() => setDoneOpen(true)} />
      ),
    };
  }

  return (
    <StatusBoard
      items={projects}
      statusOf={({ project }) => project.status}
      columns={statuses.map(column)}
      onMove={({ id }, next) => void rumbo.projects.setStatus(id, next)}
      columnClassName="min-w-64 flex-1"
      renderCard={(summary, className) => (
        <ProjectCard
          summary={summary}
          selected={summary.id === selectedId}
          onSelect={() => onSelect(summary.id)}
          onOpen={() => onOpen(summary.id)}
          className={className}
        />
      )}
    />
  );
}

function FoldedProjects({
  projects,
  onSelect,
  onOpen,
}: {
  projects: ProjectSummary[];
  onSelect: (id: number) => void;
  onOpen: () => void;
}) {
  return (
    <div className="flex flex-col gap-1 text-sm">
      {projects.map(({ id, project }) => (
        <button
          key={id}
          type="button"
          onClick={() => onSelect(id)}
          className="flex items-center gap-2 rounded-md px-1 py-1.5 text-left outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <CheckIcon className="size-4 shrink-0 text-success" />
          <span className="truncate">{project.title}</span>
        </button>
      ))}
      <button
        type="button"
        onClick={onOpen}
        className="mt-2 w-fit rounded-sm px-1 text-left text-xs text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        Plegado · pulsa para abrir
      </button>
    </div>
  );
}
