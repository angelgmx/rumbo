import type { ProjectSummary } from "@rumbo/core";
import { FlagIcon } from "lucide-react";
import { formatDayMonth } from "@/lib/format";

/** El siguiente hito sin hacer con su fecha; sin hitos o con todos hechos, lo dice. */
export function NextMilestone({ summary }: { summary: ProjectSummary }) {
  const next = summary.nextMilestone;
  const empty = summary.project.milestones.length === 0 ? "Sin hitos" : "Todos hechos";

  return (
    <span className="flex min-w-0 items-start gap-2">
      <FlagIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      {next ? (
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-sm">{next.title}</span>
          {next.date && (
            <span className="font-mono text-xs text-muted-foreground">
              {formatDayMonth(next.date)}
            </span>
          )}
        </span>
      ) : (
        <span className="text-sm text-muted-foreground">{empty}</span>
      )}
    </span>
  );
}
