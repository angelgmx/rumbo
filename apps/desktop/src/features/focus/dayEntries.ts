import type { DayPlanItem } from "@rumbo/core";
import type { RoutineGroup } from "./useFocusDay";

export type DayEntry =
  | { kind: "plan"; start: string; item: DayPlanItem }
  | { kind: "routine"; start: string; group: RoutineGroup };

/**
 * «Tu día» en orden de hora: la agenda, los hábitos con hora y las rutinas. Un hábito
 * que ya está en una rutina sale dentro de ella y no suelto.
 */
export function dayEntries(plan: DayPlanItem[], groups: RoutineGroup[]): DayEntry[] {
  const inRoutine = new Set(
    groups.flatMap(({ summary }) => summary.habits.map(({ habit }) => habit.key)),
  );
  const items: DayEntry[] = plan
    .filter((item) => item.kind === "agenda" || !inRoutine.has(item.habit.habit.key))
    .map((item) => ({ kind: "plan", start: item.start, item }));
  const routines: DayEntry[] = groups.map((group) => ({
    kind: "routine",
    start: group.summary.routine.start.padStart(5, "0"),
    group,
  }));
  return [...items, ...routines].sort((a, b) => a.start.localeCompare(b.start));
}

/** El nombre de la rutina de cada hábito que está en una, para decir «en Rutina X». */
export function routineOfHabits(groups: RoutineGroup[]): Map<string, string> {
  const names = new Map<string, string>();
  for (const { summary } of groups) {
    for (const { habit } of summary.habits) {
      if (!names.has(habit.key)) names.set(habit.key, summary.title);
    }
  }
  return names;
}

/** Lo siguiente de «Tu día» que aún no está hecho y empieza después de ahora. */
export function nextEntry(
  entries: DayEntry[],
  time: string,
): { start: string; title: string } | undefined {
  const next = entries.find((entry) => entry.start > time && !isDone(entry));
  if (!next) return undefined;
  const title = next.kind === "routine" ? next.group.summary.title : next.item.text;
  return { start: next.start, title };
}

function isDone(entry: DayEntry): boolean {
  if (entry.kind === "plan") return entry.item.done;
  return entry.group.steps.length > 0 && entry.group.steps.every((step) => step.done);
}
