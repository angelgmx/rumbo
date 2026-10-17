import type { ProjectSummary } from "@rumbo/core";
import { CalendarIcon, CheckIcon } from "lucide-react";
import { GoalProgressBar } from "@/features/goals/GoalProgressBar";
import { AreaDot } from "@/features/tasks/AreaDot";
import { formatDayMonth } from "@/lib/format";
import { cn } from "@/lib/utils";
import { NextMilestone } from "./NextMilestone";
import { ownEvent } from "./ownEvent";
import { ProjectGoalLine } from "./ProjectGoalLine";
import { ProjectMenu } from "./ProjectMenu";
import { ProjectRiskTag } from "./ProjectRiskTag";

/**
 * Un proyecto en una tarjeta: área, nombre, objetivo, avance, siguiente hito, tareas pendientes,
 * fecha límite y aviso de riesgo. Un clic lo previsualiza y un doble clic abre su página.
 */
export function ProjectCard({
  summary,
  selected,
  onSelect,
  onOpen,
  className,
}: {
  summary: ProjectSummary;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
  className?: string;
}) {
  const { project, progress, goal, nextTasks } = summary;
  const { area, deadline } = project;

  return (
    <article
      onClick={ownEvent(onSelect)}
      onDoubleClick={ownEvent(onOpen)}
      className={cn(
        "flex cursor-pointer flex-col gap-3 rounded-xl border bg-card p-4 shadow-card transition-colors duration-(--dur-fast) hover:bg-muted/40",
        selected && "border-primary hover:bg-card",
        className,
      )}
    >
      <div className="flex min-h-6 items-center justify-between gap-2">
        {area ? (
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <AreaDot area={area} className="size-2 rounded-full" />
            {area}
          </span>
        ) : (
          <span />
        )}
        <span onClick={(event) => event.stopPropagation()}>
          <ProjectMenu summary={summary} size="icon-xs" />
        </span>
      </div>
      <button
        type="button"
        className="-mt-1 w-fit max-w-full rounded-sm text-left text-lg leading-snug font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {project.title}
      </button>
      <ProjectGoalLine goal={goal} />
      <GoalProgressBar progress={progress} />
      <div className="flex flex-col gap-3 border-t pt-3">
        <NextMilestone summary={summary} />
        <span className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm whitespace-nowrap text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CheckIcon className="size-4" />
            {nextTasks.length} {nextTasks.length === 1 ? "pendiente" : "pendientes"}
          </span>
          {deadline && (
            <span className="flex items-center gap-1.5 font-mono">
              <CalendarIcon className="size-4" />
              {formatDayMonth(deadline)}
            </span>
          )}
          <span className="ml-auto">
            <ProjectRiskTag summary={summary} />
          </span>
        </span>
      </div>
    </article>
  );
}
