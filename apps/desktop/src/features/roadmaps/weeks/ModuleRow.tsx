import { sessionStart, type IsoDate, type ModuleSummary, type RoadmapSummary } from "@rumbo/core";
import { Link } from "wouter";
import { formatMinutes, formatRelativeDay } from "@/lib/format";
import { cn } from "@/lib/utils";
import { moduleHref } from "../links";
import { STATUS_LABEL } from "../moduleStatus";
import { ROW_GRID } from "./rowGrid";

const DOT: Record<ModuleSummary["status"], string> = {
  "not-started": "border border-muted-foreground bg-transparent",
  learning: "bg-primary",
  mastered: "bg-success",
  skipped: "bg-faint",
};

/** Un módulo de la semana: número, estado, horas que quedan, ejercicios y su próxima sesión. */
export function ModuleRow({
  topicPath,
  roadmap,
  module,
  today,
}: {
  topicPath: string;
  roadmap: RoadmapSummary;
  module: ModuleSummary;
  today: IsoDate;
}) {
  const closed = module.status === "mastered" || module.status === "skipped";
  const minutes = closed ? module.estimatedMinutes : roadmap.plan.minutesLeft.get(module.path);
  const exercisesDone = module.exercises.filter((exercise) => exercise.done).length;
  const session = closed ? undefined : roadmap.plan.sessions.get(module.path)?.[0];

  return (
    <Link
      href={moduleHref(topicPath, module.name)}
      className={cn(
        ROW_GRID,
        "rounded-md py-2 pr-3 pl-9 text-sm outline-none transition-colors duration-(--dur-fast) hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50",
        module.status === "skipped" && "text-faint",
      )}
    >
      <span className="font-mono text-xs text-muted-foreground">
        {String(module.order).padStart(2, "0")}
      </span>
      <span className={cn("truncate", module.status === "skipped" && "line-through")}>
        {module.title}
      </span>
      <span className="flex items-center gap-2 text-muted-foreground">
        <span className={cn("size-2 shrink-0 rounded-full", DOT[module.status])} />
        {STATUS_LABEL[module.status]}
      </span>
      <span className="font-mono text-xs text-muted-foreground">
        {minutes ? formatMinutes(minutes) : "—"}
      </span>
      <span className="font-mono text-xs text-muted-foreground">
        {module.exercises.length ? `${exercisesDone}/${module.exercises.length}` : "—"}
      </span>
      <span className="truncate font-mono text-xs text-muted-foreground">
        {session ? sessionLabel(roadmap, session, today) : "—"}
      </span>
    </Link>
  );
}

/** «vie 17 · 17:00» */
function sessionLabel(roadmap: RoadmapSummary, day: IsoDate, today: IsoDate): string {
  const start = sessionStart(roadmap.schedule, day);
  return [formatRelativeDay(day, today), start].filter(Boolean).join(" · ");
}
