import type { ProjectSummary } from "@rumbo/core";
import { TargetIcon } from "lucide-react";
import { AreaDot } from "@/features/tasks/AreaDot";

/** El área (punto de color) y el objetivo del proyecto, en una línea pequeña. */
export function ProjectContext({ summary: { project, goal } }: { summary: ProjectSummary }) {
  return (
    <span className="flex min-w-0 items-center gap-3 text-xs text-muted-foreground">
      {project.area && (
        <span className="flex shrink-0 items-center gap-1.5">
          <AreaDot area={project.area} />
          {project.area}
        </span>
      )}
      {goal && (
        <span className="flex min-w-0 items-center gap-1.5">
          <TargetIcon className="size-3.5 shrink-0" />
          <span className="truncate">{goal.title}</span>
        </span>
      )}
    </span>
  );
}
