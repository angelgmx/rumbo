import type { ProjectSummary } from "@rumbo/core";
import { FlagIcon } from "lucide-react";
import { formatDayMonth } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * El siguiente hito sin hacer con su fecha, en la misma línea o debajo; sin hitos o con todos
 * hechos, lo dice.
 */
export function NextMilestone({
  summary,
  stacked = false,
  className,
}: {
  summary: ProjectSummary;
  stacked?: boolean;
  className?: string;
}) {
  const next = summary.nextMilestone;
  const empty = summary.project.milestones.length === 0 ? "Sin hitos" : "Todos hechos";
  const date = next?.date && (
    <span className="shrink-0 font-mono text-sm text-muted-foreground">
      {formatDayMonth(next.date)}
    </span>
  );

  return (
    <span className={cn("flex min-w-0 items-start gap-2", className)}>
      <FlagIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      {next ? (
        <span className={cn("flex min-w-0 flex-1", stacked ? "flex-col" : "items-baseline gap-3")}>
          <span className="min-w-0 flex-1 truncate text-sm font-medium">{next.title}</span>
          {date}
        </span>
      ) : (
        <span className="text-sm text-muted-foreground">{empty}</span>
      )}
    </span>
  );
}
