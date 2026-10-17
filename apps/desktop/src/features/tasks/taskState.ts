import { minutesOf, type Task } from "@rumbo/core";

export type TaskState = "todo" | "doing" | "done";

/** Hecha, en curso (hoy y dentro de su franja) o pendiente. */
export function taskState(task: Task, today: string, time: string, end?: string): TaskState {
  if (task.done) return "done";
  const inside =
    task.scheduled === today &&
    task.time !== undefined &&
    end !== undefined &&
    task.time <= time &&
    minutesOf(time) < minutesOf(end);
  return inside ? "doing" : "todo";
}
