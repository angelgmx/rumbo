// Proyectos: algo con un final. Se terminan y se archivan; si no acaban nunca, son un área o
// un hábito. Su progreso se calcula al leer: por sus hitos o, si no tiene, por sus tareas.
import { daysBetween, type IsoDate } from "./dates";
import { goalPace, type GoalPace } from "./goals";
import type { Priority, Task } from "./tasks";

export const PROJECT_STATUSES = ["idea", "active", "blocked", "done"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

/** Un hito lleva un id propio dentro del proyecto: las tareas lo señalan por él, no por su posición. */
export interface Milestone {
  id: number;
  title: string;
  date?: IsoDate;
  done: boolean;
}

/** Lo que se da para crear un hito: nace sin hacer y recibe su id al guardarse. */
export type NewMilestone = Pick<Milestone, "title" | "date">;

/** Un enlace del proyecto: su repositorio, su web o una nota del vault (por su nombre). */
export type ProjectLink =
  | { kind: "repo" | "web"; title: string; url: string }
  | { kind: "note"; name: string };

export interface Project {
  title: string;
  /** Cómo sabrás que está terminado. */
  outcome: string;
  area?: string;
  goalId?: number;
  status: ProjectStatus;
  priority?: Priority;
  start?: IsoDate;
  deadline?: IsoDate;
  finished?: IsoDate;
  links: ProjectLink[];
  milestones: Milestone[];
  archived: boolean;
}

/** Lo que se rellena al crear o editar un proyecto. */
export type ProjectInput = Omit<Project, "finished" | "archived" | "milestones"> & {
  milestones: NewMilestone[];
};

/** Un paso de lo que falta por mirar: una tarea con fecha o un hito, en orden de fecha. */
export type UpcomingEntry =
  | { kind: "task"; date: IsoDate; task: Task }
  | { kind: "milestone"; date: IsoDate; milestone: Milestone };

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

/** Los hitos por fecha, los que no la tienen al final; a igual fecha, en el orden en que se crearon. */
export function sortMilestones<T extends { date?: IsoDate }>(milestones: T[]): T[] {
  return milestones
    .map((milestone, index) => ({ milestone, index }))
    .sort(
      (a, b) =>
        (a.milestone.date ?? "9999").localeCompare(b.milestone.date ?? "9999") || a.index - b.index,
    )
    .map(({ milestone }) => milestone);
}

/** El primer hito sin hacer según el orden por fecha. */
export function nextMilestone(project: Pick<Project, "milestones">): Milestone | undefined {
  return project.milestones.find((milestone) => !milestone.done);
}

/** El ritmo del proyecto frente a su fecha límite, con la misma regla que el de un objetivo. */
export function projectPace(
  project: Project,
  progress: number,
  today: IsoDate,
): GoalPace | undefined {
  return goalPace(project, progress, today);
}

/** De 0 a 1: cuánto del tiempo entre el inicio y la fecha límite ha pasado. Sin ambas, nada. */
export function timeElapsed(
  project: Pick<Project, "start" | "deadline">,
  today: IsoDate,
): number | undefined {
  const { start, deadline } = project;
  if (!start || !deadline || deadline <= start) return undefined;
  const elapsed = daysBetween(start, today) / daysBetween(start, deadline);
  return Math.min(Math.max(elapsed, 0), 1);
}

/**
 * Dónde cae hoy en la línea de tiempo de los hitos, de 0 a 1. Los hitos se reparten a partes
 * iguales; hoy se coloca entre los dos con fecha que lo rodean. Fuera de ellos, nada.
 */
export function todayOnTimeline(
  milestones: Pick<Milestone, "date">[],
  today: IsoDate,
): number | undefined {
  const slots = milestones.length - 1;
  for (let index = 0; index < slots; index++) {
    const from = milestones[index]!.date;
    const to = milestones[index + 1]!.date;
    if (!from || !to || today < from || today > to) continue;
    const length = daysBetween(from, to);
    const through = length === 0 ? 0 : daysBetween(from, today) / length;
    return (index + through) / slots;
  }
  return undefined;
}

/** Lo que viene en el proyecto: tareas sin hacer con fecha e hitos con fecha, lo más cercano primero. */
export function upcomingEntries(
  tasks: Task[],
  milestones: Milestone[],
  limit: number,
): UpcomingEntry[] {
  const entries: UpcomingEntry[] = [
    ...tasks.flatMap((task) => {
      const date = task.scheduled ?? task.due;
      return !task.done && date ? [{ kind: "task" as const, date, task }] : [];
    }),
    ...milestones.flatMap((milestone) =>
      !milestone.done && milestone.date
        ? [{ kind: "milestone" as const, date: milestone.date, milestone }]
        : [],
    ),
  ];
  const when = (entry: UpcomingEntry) =>
    `${entry.date} ${entry.kind === "task" ? (entry.task.time ?? "24:00") : "24:00"}`;
  return entries.sort((a, b) => when(a).localeCompare(when(b))).slice(0, limit);
}

const REPO_HOSTS = ["github.com", "gitlab.com", "bitbucket.org", "codeberg.org"];

/** Un enlace a partir de lo que se escribe: la dirección, con o sin «https://». Sin dirección válida, nada. */
export function parseProjectLink(text: string): ProjectLink | undefined {
  const typed = text.trim();
  if (!typed) return undefined;
  // «citalash.app:8080» es una dirección con puerto; «mailto:a@b.es», una con esquema propio.
  const url = /^[a-z][a-z\d+.-]*:(?!\d)/i.test(typed) ? typed : `https://${typed}`;
  try {
    const { protocol, hostname } = new URL(url);
    if (!["http:", "https:"].includes(protocol) || !hostname.includes(".")) return undefined;
    const repo = REPO_HOSTS.includes(hostname.replace(/^www\./, ""));
    return { kind: repo ? "repo" : "web", title: repo ? "Repositorio" : "Web", url };
  } catch {
    return undefined;
  }
}

/** Si dos enlaces señalan lo mismo: la misma dirección o la misma nota. */
export function sameLink(a: ProjectLink, b: ProjectLink): boolean {
  if (a.kind === "note" || b.kind === "note") {
    return a.kind === "note" && b.kind === "note" && a.name === b.name;
  }
  return a.url === b.url;
}
