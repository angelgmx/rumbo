import type { Habit, HabitValue, Task } from "@rumbo/core";

/** "12/20 páginas", "1/2 tareas", "hecho"… */
export function describeValue(
  habit: Habit,
  value: HabitValue | undefined,
  todayTasks?: Task[],
): string {
  if (habit.kind === "check") return value === true ? "hecho" : "sin hacer";
  if (habit.kind === "tasks") {
    if (!todayTasks) return value === true ? "hecho" : "sin hacer";
    return `${todayTasks.filter((task) => task.done).length}/${todayTasks.length} tareas`;
  }
  return `${typeof value === "number" ? value : 0}/${habit.target ?? 1} ${habit.unit ?? ""}`.trim();
}
