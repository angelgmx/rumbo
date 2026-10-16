import type { Counter, Task } from "@rumbo/core";

/** Una tarea que se mide con un contador. */
export type CountedTask = Task & { counter: Counter };

export function hasCounter(task: Task): task is CountedTask {
  return task.counter !== undefined;
}
