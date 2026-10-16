import { linkTarget, type Task } from "@rumbo/core";

/** Los filtros de la lista de tareas. Vacío = todas. */
export interface TaskFilter {
  area?: string;
  project?: string;
  tag?: string;
}

/** El área y el proyecto pueden venir como «Negocio» o como «[[Negocio]]»: siempre el nombre. */
export function areaOf(task: Task): string | undefined {
  return linkTarget(task.fields.area) ?? task.fields.area;
}

export function projectOf(task: Task): string | undefined {
  return linkTarget(task.fields.project) ?? task.fields.project;
}

export function matchesFilter(task: Task, filter: TaskFilter): boolean {
  if (filter.area && areaOf(task) !== filter.area) return false;
  if (filter.project && projectOf(task) !== filter.project) return false;
  if (filter.tag && !task.tags.includes(filter.tag)) return false;
  return true;
}

export function hasFilter(filter: TaskFilter): boolean {
  return Boolean(filter.area || filter.project || filter.tag);
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
