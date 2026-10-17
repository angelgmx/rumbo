import type { ProjectSummary } from "@rumbo/core";
import { STATUS_ORDER } from "./projectLabels";

export type SortKey =
  | "title"
  | "status"
  | "goal"
  | "progress"
  | "milestone"
  | "pending"
  | "deadline";
export type SortDirection = "asc" | "desc";
export interface ProjectSort {
  key: SortKey;
  direction: SortDirection;
}

export const DEFAULT_SORT: ProjectSort = { key: "deadline", direction: "asc" };

const SORT_VALUE: Record<SortKey, (summary: ProjectSummary) => string | number | undefined> = {
  title: ({ project }) => project.title,
  status: ({ project }) => STATUS_ORDER.indexOf(project.status),
  goal: ({ goal }) => goal?.title,
  progress: ({ progress }) => progress,
  milestone: ({ nextMilestone }) => nextMilestone?.date,
  pending: ({ nextTasks }) => nextTasks.length,
  deadline: ({ project }) => project.deadline,
};

/** Pulsar la misma columna invierte el orden; otra empieza de menor a mayor. */
export function nextSort(current: ProjectSort, key: SortKey): ProjectSort {
  if (current.key !== key) return { key, direction: "asc" };
  return { key, direction: current.direction === "asc" ? "desc" : "asc" };
}

/** Los proyectos por la columna elegida; lo que no tiene valor (sin fecha, sin objetivo) va siempre al final. */
export function sortProjects(projects: ProjectSummary[], { key, direction }: ProjectSort) {
  const value = SORT_VALUE[key];
  const sign = direction === "asc" ? 1 : -1;
  return [...projects].sort((a, b) => {
    const left = value(a);
    const right = value(b);
    if (left === undefined || right === undefined) {
      return left === right ? 0 : left === undefined ? 1 : -1;
    }
    const order =
      typeof left === "number" && typeof right === "number"
        ? left - right
        : String(left).localeCompare(String(right), "es");
    return order * sign;
  });
}
