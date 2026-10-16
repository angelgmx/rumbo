// Proyectos: algo con un final. Se terminan y se archivan; si no acaban nunca, son un área o
// un hábito. Su progreso se calcula al leer: por sus hitos o, si no tiene, por sus tareas.
import type { IsoDate } from "./dates";

export const PROJECT_STATUSES = ["idea", "active", "blocked", "done"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export interface Milestone {
  title: string;
  date?: IsoDate;
  done: boolean;
}

export interface ProjectLink {
  title: string;
  url: string;
}

export interface Project {
  title: string;
  /** Cómo sabrás que está terminado. */
  outcome: string;
  area?: string;
  goalId?: number;
  status: ProjectStatus;
  start?: IsoDate;
  deadline?: IsoDate;
  finished?: IsoDate;
  links: ProjectLink[];
  milestones: Milestone[];
  archived: boolean;
}

/** Lo que se rellena al crear o editar un proyecto. */
export type ProjectInput = Omit<Project, "finished" | "archived">;

/** Los pasos de un proyecto: sus hitos si los tiene y, si no, sus tareas. */
export function projectSteps(
  project: Project,
  tasks: { done: boolean }[],
): { done: number; total: number } {
  const steps = project.milestones.length > 0 ? project.milestones : tasks;
  return { done: steps.filter((step) => step.done).length, total: steps.length };
}

/** De 0 a 1: hecho es 1; si no, los pasos hechos entre todos. */
export function projectProgress(project: Project, tasks: { done: boolean }[]): number {
  if (project.status === "done") return 1;
  const { done, total } = projectSteps(project, tasks);
  return total === 0 ? 0 : done / total;
}
