import type { Task } from "@rumbo/core";
import type { useFocusDay } from "./useFocusDay";

type FocusDay = ReturnType<typeof useFocusDay>;

/** Las tareas de hoy que van en «Sin hora»: sin las del foco ni las que cumplen un hábito. */
export function untimedTasks(day: FocusDay): Task[] {
  return day.todayTasks.filter(
    (task) =>
      !task.fields.habit && !day.focus.some((f) => f.path === task.path && f.line === task.line),
  );
}

/** Cuánto del día va hecho: bloques de la agenda, foco, tareas de hoy y hábitos. */
export function dayCount(day: FocusDay): { done: number; total: number } {
  const blocks = day.plan.filter((item) => item.kind === "agenda");
  const items = [...blocks, ...day.focus, ...untimedTasks(day)];
  return {
    done: items.filter((item) => item.done).length + day.habits.filter((h) => h.doneToday).length,
    total: items.length + day.habits.length,
  };
}
