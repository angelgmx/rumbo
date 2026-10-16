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

/** De 0 a 1: hecho es 1; si tiene hitos, los hechos; si no, sus tareas terminadas. */
export function projectProgress(project: Project, tasks: { done: boolean }[]): number {
  if (project.status === "done") return 1;
  const steps = project.milestones.length > 0 ? project.milestones : tasks;
  if (steps.length === 0) return 0;
  return steps.filter((step) => step.done).length / steps.length;
}

export interface UpcomingMilestone {
  project: string;
  title: string;
  date: IsoDate;
}

/** El hito sin hacer con fecha más cercano de entre varios proyectos. */
export function nearestMilestone(projects: Project[]): UpcomingMilestone | undefined {
  return projects
    .flatMap((project) =>
      project.milestones.flatMap(({ title, date, done }) =>
        done || !date ? [] : [{ project: project.title, title, date }],
      ),
    )
    .sort((a, b) => a.date.localeCompare(b.date))[0];
}
