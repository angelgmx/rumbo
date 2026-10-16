import type { GoalSummary } from "@rumbo/core";
import { CalendarIcon } from "lucide-react";
import { Link } from "wouter";
import { AreaDot } from "@/features/tasks/AreaDot";
import { formatDayMonth } from "@/lib/format";
import { cn } from "@/lib/utils";
import { daysLeftLabel, goalHref, periodLabel } from "./goalLabels";
import { GoalProgress } from "./GoalProgress";

/** Un objetivo en una tarjeta: título, área, periodo, fecha límite y avance. */
export function GoalCard({ summary, className }: { summary: GoalSummary; className?: string }) {
  const { id, goal, daysLeft, progress } = summary;
  const late = daysLeft !== undefined && daysLeft < 0 && goal.status === "active";

  return (
    <Link
      href={goalHref(id)}
      draggable={false}
      className={cn(
        "flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-card transition-colors duration-(--dur-fast) outline-none hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <span className="font-medium">{goal.title}</span>
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {goal.area && (
          <span className="flex items-center gap-1.5">
            <AreaDot area={goal.area} />
            {goal.area}
          </span>
        )}
        {goal.period && <span className="font-mono">{periodLabel(goal.period)}</span>}
      </span>
      <span className="flex items-center justify-between gap-3">
        <GoalProgress progress={progress} />
        {goal.deadline && (
          <span
            className={cn(
              "flex items-center gap-1.5 text-xs text-muted-foreground",
              late && "text-destructive",
            )}
          >
            <CalendarIcon className="size-3.5" />
            {daysLeft !== undefined && goal.status === "active"
              ? daysLeftLabel(daysLeft)
              : formatDayMonth(goal.deadline)}
          </span>
        )}
      </span>
    </Link>
  );
}
