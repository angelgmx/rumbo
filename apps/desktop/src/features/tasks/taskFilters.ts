import type { Task } from "@rumbo/core";

/** Los filtros de la lista de tareas. Vacío = todas. */
export interface TaskFilter {
  area?: string;
  /** El id del proyecto, en texto como el resto de filtros. */
  project?: string;
  tag?: string;
}

export function areaOf(task: Task): string | undefined {
  return task.area;
}

export function projectOf(task: Task): string | undefined {
  return task.projectId === undefined ? undefined : String(task.projectId);
}

export function matchesFilter(task: Task, filter: TaskFilter): boolean {
  if (filter.area && areaOf(task) !== filter.area) return false;
  if (filter.project && projectOf(task) !== filter.project) return false;
  if (filter.tag && !task.tags.includes(filter.tag)) return false;
  return true;
}

/** Cuántas tareas hay de cada valor (área, proyecto, etiqueta…), ordenado por nombre. */
export function countBy(
  tasks: Task[],
  valuesOf: (task: Task) => string | string[] | undefined,
): [string, number][] {
  const counts = new Map<string, number>();
  for (const task of tasks) {
    for (const value of [valuesOf(task) ?? []].flat()) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }
  return [...counts].sort(([a], [b]) => a.localeCompare(b));
}
