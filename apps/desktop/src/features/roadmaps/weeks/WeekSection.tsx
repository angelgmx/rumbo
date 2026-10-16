import type { RoadmapSummary } from "@rumbo/core";
import type { ReactNode } from "react";
import { formatDayMonth, formatMinutes } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { WeekGroup } from "./groupWeeks";

/** Una semana de la línea de tiempo: su punto en la línea, su fecha, lo que suma y sus filas. */
export function WeekSection({
  group,
  roadmap,
  current,
  children,
}: {
  group: WeekGroup;
  roadmap: RoadmapSummary;
  current: boolean;
  children: ReactNode;
}) {
  const minutes = group.modules.reduce(
    (sum, module) =>
      sum +
      (group.kind === "done"
        ? module.estimatedMinutes
        : (roadmap.plan.minutesLeft.get(module.path) ?? 0)),
    0,
  );
  const count = `${group.modules.length} ${group.modules.length === 1 ? "módulo" : "módulos"}`;

  return (
    <li className="relative flex flex-col gap-1">
      <div className="relative flex items-center gap-3 pl-9">
        <span
          className={cn(
            "absolute left-1 size-3.5 rounded-full border-2 bg-card",
            current ? "border-primary" : "border-border",
          )}
        />
        <h3 className="text-sm font-semibold">{title(group)}</h3>
        {current && (
          <span className="font-mono text-[11px] tracking-widest text-primary-text uppercase">
            Esta semana
          </span>
        )}
        <span className="ml-auto font-mono text-xs text-muted-foreground">
          {count}
          {minutes > 0 && ` · ${formatMinutes(minutes)}`}
        </span>
      </div>
      {children}
    </li>
  );
}

function title(group: WeekGroup): string {
  if (group.kind === "done") return "Hecho";
  if (group.kind === "undated") return "Sin fecha";
  return `Semana del ${formatDayMonth(group.start!)}`;
}
