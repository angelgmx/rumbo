import type { ProjectStatus, ProjectSummary } from "@rumbo/core";
import { STATUS_ORDER } from "./projectLabels";

/** «Activos» son todos menos los terminados; «todos» también los terminados. */
export type StatusFilter = "open" | "all" | ProjectStatus;

export interface ProjectFilters {
  area?: string;
  goalId?: number;
  status: StatusFilter;
  query: string;
}

export const NO_FILTERS: ProjectFilters = { status: "open", query: "" };

/** Los proyectos que cumplen área, objetivo y búsqueda; el estado lo aplica cada vista a su manera. */
export function matchingProjects(
  projects: ProjectSummary[],
  { area, goalId, query }: ProjectFilters,
): ProjectSummary[] {
  const typed = query.trim().toLowerCase();
  return projects.filter(
    ({ project, goal }) =>
      (area === undefined || project.area === area) &&
      (goalId === undefined || goal?.id === goalId) &&
      (typed === "" || project.title.toLowerCase().includes(typed)),
  );
}

/** Los estados que enseña cada filtro, en el orden de las columnas. */
export function visibleStatuses(status: StatusFilter): readonly ProjectStatus[] {
  if (status === "all") return STATUS_ORDER;
  if (status === "open") return STATUS_ORDER.filter((candidate) => candidate !== "done");
  return [status];
}
