import type { ProjectSummary } from "@rumbo/core";
import { Link } from "wouter";
import { GoalProgressBar } from "@/features/goals/GoalProgressBar";
import { formatDayMonth } from "@/lib/format";
import { cn } from "@/lib/utils";
import { NextMilestone } from "./NextMilestone";
import { ProjectContext } from "./ProjectContext";
import { projectHref } from "./projectLabels";
import { ProjectPaceTag } from "./ProjectPaceTag";
import { ProjectTile } from "./ProjectTile";

export const PROJECT_COLUMNS =
  "grid grid-cols-[minmax(0,1fr)_11rem_12rem_6.5rem] items-center gap-4 border-l-2 border-l-transparent px-4";

/** Una fila de la lista: el proyecto con su contexto, avance, siguiente hito y fecha límite. */
export function ProjectRow({ summary, selected }: { summary: ProjectSummary; selected: boolean }) {
  const { id, project, progress } = summary;

  return (
    <Link
      href={projectHref(id)}
      aria-current={selected || undefined}
      className={cn(
        PROJECT_COLUMNS,
        "border-b py-3 transition-colors duration-(--dur-fast) outline-none last:border-b-0 hover:bg-muted/40 focus-visible:bg-muted/40",
        selected && "border-l-primary bg-primary-soft/60 hover:bg-primary-soft/60",
      )}
    >
      <span className="flex min-w-0 items-center gap-3">
        <ProjectTile area={project.area} />
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate font-medium">{project.title}</span>
          <ProjectContext summary={summary} />
        </span>
      </span>
      <GoalProgressBar progress={progress} />
      <NextMilestone summary={summary} />
      <span className="flex flex-col items-end gap-1">
        {project.deadline && (
          <span className="font-mono text-sm font-medium">{formatDayMonth(project.deadline)}</span>
        )}
        <ProjectPaceTag summary={summary} />
      </span>
    </Link>
  );
}
