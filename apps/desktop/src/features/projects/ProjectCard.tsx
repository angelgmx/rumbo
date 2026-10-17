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

/** Un proyecto en una tarjeta: título, contexto, avance, siguiente hito y fecha límite. */
export function ProjectCard({
  summary,
  className,
}: {
  summary: ProjectSummary;
  className?: string;
}) {
  const { id, project, progress } = summary;

  return (
    <Link
      href={projectHref(id)}
      draggable={false}
      className={cn(
        "flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-card transition-colors duration-(--dur-fast) outline-none hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <span className="flex items-center gap-3">
        <ProjectTile area={project.area} />
        <span className="min-w-0 truncate font-medium">{project.title}</span>
      </span>
      <ProjectContext summary={summary} />
      <GoalProgressBar progress={progress} />
      <NextMilestone summary={summary} />
      <span className="flex items-center justify-between gap-3">
        <ProjectPaceTag summary={summary} />
        {project.deadline && (
          <span className="font-mono text-xs text-muted-foreground">
            {formatDayMonth(project.deadline)}
          </span>
        )}
      </span>
    </Link>
  );
}
