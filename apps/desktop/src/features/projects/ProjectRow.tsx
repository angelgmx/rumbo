import type { ProjectSummary } from "@rumbo/core";
import { GoalProgressBar } from "@/features/goals/GoalProgressBar";
import { AreaDot } from "@/features/tasks/AreaDot";
import { formatDayMonth } from "@/lib/format";
import { cn } from "@/lib/utils";
import { NextMilestone } from "./NextMilestone";
import { ownEvent } from "./ownEvent";
import { ProjectRiskTag } from "./ProjectRiskTag";
import { ProjectStatusTag } from "./ProjectStatusTag";
import { ProjectTile } from "./ProjectTile";

export const PROJECT_COLUMNS =
  "grid grid-cols-[minmax(0,1.6fr)_7.5rem_minmax(0,1.2fr)_9rem_minmax(0,1.4fr)_5.5rem_6.5rem] items-center gap-4 border-l-2 border-l-transparent px-5";

/** Una fila de la tabla: el proyecto con su estado, objetivo, avance, siguiente hito, pendientes y límite. */
export function ProjectRow({
  summary,
  selected,
  onSelect,
  onOpen,
}: {
  summary: ProjectSummary;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
}) {
  const { project, goal, progress, nextTasks } = summary;

  return (
    <div
      onClick={ownEvent(onSelect)}
      onDoubleClick={ownEvent(onOpen)}
      className={cn(
        PROJECT_COLUMNS,
        "cursor-pointer border-b py-3 transition-colors duration-(--dur-fast) last:border-b-0 hover:bg-muted/40",
        selected && "border-l-primary bg-primary-soft/60 hover:bg-primary-soft/60",
      )}
    >
      <span className="flex min-w-0 items-center gap-3">
        <ProjectTile area={project.area} />
        <span className="flex min-w-0 flex-col items-start gap-0.5">
          <button
            type="button"
            className="max-w-full truncate rounded-sm text-left font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {project.title}
          </button>
          {project.area && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <AreaDot area={project.area} className="size-1.5 rounded-full" />
              {project.area}
            </span>
          )}
        </span>
      </span>
      <ProjectStatusTag status={project.status} />
      <span className={cn("truncate text-sm", !goal && "text-muted-foreground")}>
        {goal ? goal.title : "Sin objetivo"}
      </span>
      <GoalProgressBar progress={progress} />
      <NextMilestone summary={summary} stacked />
      <span className="text-sm">{nextTasks.length}</span>
      <span className="flex flex-col items-end gap-1">
        {project.deadline && (
          <span className="font-mono text-sm font-medium">{formatDayMonth(project.deadline)}</span>
        )}
        <ProjectRiskTag summary={summary} />
      </span>
    </div>
  );
}
