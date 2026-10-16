import { startOfWeek, type IsoDate, type ModuleSummary, type RoadmapSummary } from "@rumbo/core";

export interface WeekGroup {
  key: string;
  kind: "done" | "week" | "undated";
  /** Lunes de la semana, solo en las que tienen fecha. */
  start?: IsoDate;
  modules: ModuleSummary[];
}

const isClosed = (module: ModuleSummary) =>
  module.status === "mastered" || module.status === "skipped";

/** Lo hecho, luego cada semana en que terminarías módulos con tu horario y, al final, lo que no tiene fecha. */
export function groupByWeek(roadmap: RoadmapSummary): WeekGroup[] {
  const weeks = new Map<IsoDate, ModuleSummary[]>();
  const done: ModuleSummary[] = [];
  const undated: ModuleSummary[] = [];

  for (const module of roadmap.modules) {
    const finishes = roadmap.plan.modules.get(module.path);
    if (isClosed(module)) done.push(module);
    else if (!finishes) undated.push(module);
    else {
      const start = startOfWeek(finishes);
      weeks.set(start, [...(weeks.get(start) ?? []), module]);
    }
  }

  return [
    ...(done.length ? [{ key: "done", kind: "done" as const, modules: done }] : []),
    ...[...weeks]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([start, modules]) => ({ key: start, kind: "week" as const, start, modules })),
    ...(undated.length ? [{ key: "undated", kind: "undated" as const, modules: undated }] : []),
  ];
}

/** Dónde cae la línea de «hoy»: la semana en curso o, si no tiene módulos, justo antes de la siguiente. */
export function todayAt(
  groups: WeekGroup[],
  today: IsoDate,
): { group: WeekGroup; thisWeek: boolean } | undefined {
  const week = startOfWeek(today);
  const group = groups.find(
    (candidate) => candidate.start !== undefined && candidate.start >= week,
  );
  return group && { group, thisWeek: group.start === week };
}
