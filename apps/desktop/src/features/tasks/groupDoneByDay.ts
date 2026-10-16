import type { IsoDate, Task } from "@rumbo/core";
import { capitalize, formatLongDay } from "@/lib/format";
import type { TaskGroup } from "./groupByDay";

const UNDATED = "~undated";

/** Las hechas por día, la más reciente arriba. Las que no apuntan cuándo, al final. */
export function groupDoneByDay(tasks: Task[]): TaskGroup[] {
  const groups = new Map<string, TaskGroup>();
  for (const task of tasks) {
    const key = task.doneOn ?? UNDATED;
    const group = groups.get(key) ?? newGroup(key, task.doneOn);
    group.tasks.push(task);
    groups.set(key, group);
  }
  return [...groups.values()].sort((a, b) => b.key.localeCompare(a.key));
}

function newGroup(key: string, date: IsoDate | undefined): TaskGroup {
  if (!date) return { key, title: "Sin fecha", subtitle: "", tasks: [], oneDay: false };
  return { key, title: capitalize(formatLongDay(date)), subtitle: "", tasks: [], oneDay: true };
}
