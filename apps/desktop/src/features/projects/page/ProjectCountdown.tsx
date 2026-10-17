import type { ProjectSummary } from "@rumbo/core";
import { formatDayMonth } from "@/lib/format";

/** Los días hasta la fecha límite en grande, con cuánto tiempo del plazo ha pasado en una barra fina. */
export function ProjectCountdown({
  summary: { project, daysLeft, timeElapsed },
}: {
  summary: ProjectSummary;
}) {
  if (project.status === "done" && project.finished) {
    return (
      <div className="flex flex-col items-end">
        <span className="text-3xl font-semibold">Terminado</span>
        <span className="text-sm text-muted-foreground">el {formatDayMonth(project.finished)}</span>
      </div>
    );
  }
  if (daysLeft === undefined || !project.deadline) return null;

  const late = daysLeft < 0;
  const days = Math.abs(daysLeft);

  return (
    <div className="flex w-44 shrink-0 flex-col items-end gap-1">
      <span className="flex items-baseline gap-1.5">
        <span className="text-4xl leading-none font-semibold tabular-nums">{days}</span>
        <span className="text-muted-foreground">{days === 1 ? "día" : "días"}</span>
      </span>
      <span className="text-sm text-muted-foreground">
        {late ? "de retraso desde el" : "hasta el"} {formatDayMonth(project.deadline)}
      </span>
      {timeElapsed !== undefined && (
        <span className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
          <span
            className="block h-full rounded-full bg-primary"
            style={{ width: `${timeElapsed * 100}%` }}
          />
        </span>
      )}
    </div>
  );
}
