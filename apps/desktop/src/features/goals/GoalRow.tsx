import type { GoalSummary } from "@rumbo/core";
import { Link } from "wouter";
import { AreaDot } from "@/features/tasks/AreaDot";
import { formatDayMonth } from "@/lib/format";
import { cn } from "@/lib/utils";
import { goalHref } from "./goalLabels";
import { GoalPaceTag } from "./GoalPaceTag";
import { GoalProgressBar } from "./GoalProgressBar";

export const GOAL_COLUMNS =
  "grid grid-cols-[minmax(0,1fr)_12rem_5rem_6.5rem] items-center gap-4 border-l-2 border-l-transparent px-4";

/** Una fila de la lista: el objetivo con su área, el avance, la fecha límite y el ritmo. */
export function GoalRow({ summary, selected }: { summary: GoalSummary; selected: boolean }) {
  const { id, goal, progress } = summary;

  return (
    <Link
      href={goalHref(id)}
      aria-current={selected || undefined}
      className={cn(
        GOAL_COLUMNS,
        "border-b py-3 transition-colors duration-(--dur-fast) outline-none last:border-b-0 hover:bg-muted/40 focus-visible:bg-muted/40",
        selected && "border-l-primary bg-primary-soft/60 hover:bg-primary-soft/60",
      )}
    >
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate font-medium">{goal.title}</span>
        {goal.area && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <AreaDot area={goal.area} />
            {goal.area}
          </span>
        )}
      </span>
      <GoalProgressBar progress={progress} />
      <span className="text-sm">{goal.deadline && formatDayMonth(goal.deadline)}</span>
      <span className="justify-self-end">
        <GoalPaceTag summary={summary} />
      </span>
    </Link>
  );
}
