// Calendario: colocar tareas en la rejilla, repartir lo que se solapa, encontrar huecos libres,
// reunir las fechas límite y decidir qué tareas ofrece cada fuente. Todo puro: el calendario
// se recalcula de las tareas, hábitos y rutinas, y no guarda nada propio.
import type { IsoDate } from "./dates";
import { freeIntervals, minutesOf, timeOf, type Interval } from "./freeTime";
import type { Goal } from "./goals";
import type { Project } from "./projects";
import { linkTarget } from "./links";
import { isInView, type Task, type TaskChanges } from "./tasks";

/** Lo que dura una tarea con hora si no dice otra cosa. */
export const DEFAULT_TASK_MINUTES = 30;
export const SNAP_MINUTES = 15;
const MIN_TASK_MINUTES = 15;
const MINUTES_PER_DAY = 24 * 60;

// Un hueco libre solo se enseña si cabe un rato largo de trabajo, dentro de la jornada.
const GAP_FROM = "08:00";
const GAP_TO = "22:00";
const MIN_GAP_MINUTES = 120;

/** Redondea unos minutos al paso de la rejilla. */
export function snapMinutes(minutes: number, step = SNAP_MINUTES): number {
  return Math.round(minutes / step) * step;
}

/** Lo que cambia en una tarea al ponerla en un día a una hora; sin duración, se le da un rato corto. */
export function placeTask(task: Task, date: IsoDate, startMinutes: number): TaskChanges {
  const duration = task.duration ?? DEFAULT_TASK_MINUTES;
  const start = Math.min(Math.max(snapMinutes(startMinutes), 0), MINUTES_PER_DAY - duration);
  return { scheduled: date, time: timeOf(start), duration };
}

/** La duración de una tarea al estirarla o encogerla hasta unos minutos. */
export function resizeTask(minutes: number): TaskChanges {
  return { duration: Math.max(snapMinutes(minutes), MIN_TASK_MINUTES) };
}

export interface Placed<T> {
  item: T;
  /** Columna dentro de su grupo de solapados, desde 0. */
  lane: number;
  /** Cuántas columnas tiene ese grupo: el ancho de cada una es 1 / lanes. */
  lanes: number;
}

/** Reparte en columnas lo que se pisa en el tiempo; lo que no se pisa ocupa todo el ancho. */
export function layoutLanes<T extends Interval>(items: readonly T[]): Placed<T>[] {
  const sorted = [...items].sort((a, b) => a.start.localeCompare(b.start));
  const placed: Placed<T>[] = [];
  let group: Placed<T>[] = [];
  let groupEnd = "";

  const close = () => {
    const lanes = Math.max(...group.map(({ lane }) => lane + 1), 1);
    placed.push(...group.map((entry) => ({ ...entry, lanes })));
    group = [];
  };

  for (const item of sorted) {
    if (group.length > 0 && item.start >= groupEnd) close();
    const taken = new Set(
      group.filter((entry) => entry.item.end > item.start).map(({ lane }) => lane),
    );
    let lane = 0;
    while (taken.has(lane)) lane++;
    group.push({ item, lane, lanes: 0 });
    groupEnd = group.length === 1 || item.end > groupEnd ? item.end : groupEnd;
  }
  close();
  return placed;
}

/**
 * Los huecos largos de un día que aún se pueden usar: un día pasado no tiene y hoy cuenta
 * desde ahora.
 */
export function dayGaps(
  busy: readonly Interval[],
  date: IsoDate,
  today: IsoDate,
  now: string,
): Interval[] {
  if (date < today) return [];
  const from = date === today && now > GAP_FROM ? now : GAP_FROM;
  return freeIntervals(busy, from, GAP_TO, MIN_GAP_MINUTES);
}

export function freeMinutes(gaps: readonly Interval[]): number {
  return gaps.reduce((total, gap) => total + minutesOf(gap.end) - minutesOf(gap.start), 0);
}

export interface Deadline {
  kind: "goal" | "project" | "milestone";
  date: IsoDate;
  title: string;
  area?: string;
}

const OPEN_GOALS: Goal["status"][] = ["not-started", "active", "paused"];

/** Las fechas límite de objetivos, proyectos e hitos sin terminar entre dos días, por fecha. */
export function deadlinesBetween(
  goals: readonly Goal[],
  projects: readonly Project[],
  from: IsoDate,
  to: IsoDate,
): Deadline[] {
  const all: Deadline[] = [
    ...goals.flatMap(({ deadline, title, area, status }) =>
      deadline && OPEN_GOALS.includes(status)
        ? [{ kind: "goal" as const, date: deadline, title, area }]
        : [],
    ),
    ...projects.flatMap((project) => {
      if (project.archived) return [];
      const { title, area } = project;
      const milestones = project.milestones.flatMap((milestone) =>
        milestone.date && !milestone.done
          ? [{ kind: "milestone" as const, date: milestone.date, title: milestone.title, area }]
          : [],
      );
      const own =
        project.deadline && project.status !== "done"
          ? [{ kind: "project" as const, date: project.deadline, title, area }]
          : [];
      return [...own, ...milestones];
    }),
  ];
  return all
    .filter(({ date }) => date >= from && date <= to)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** De dónde salen las tareas que se ofrecen para colocar. */
export type CalendarSource =
  | { kind: "inbox" }
  | { kind: "undated" }
  /** `within` son las subáreas: sus tareas cuentan también en el área madre. */
  | { kind: "area"; area: string; within?: string[] }
  | { kind: "routines" };

/** Lo que se ve u oculta en el calendario: lo que no tiene área se agrupa bajo el Inbox. */
export function sourceKey(source: CalendarSource): string {
  return source.kind === "area" ? areaKey(source.area) : source.kind;
}

/** El área sin importar si viene como nombre o como wikilink: "Gym" y "[[Gym]]" son la misma. */
export function areaName(area: string | undefined): string | undefined {
  return (linkTarget(area) ?? area)?.trim() || undefined;
}

export function areaKey(area: string | undefined): string {
  const name = areaName(area);
  return name ? `area:${name}` : "inbox";
}

export interface SourceTasks {
  undated: Task[];
  /** Con fecha dentro de la semana que se mira, hechas o no. */
  scheduled: Task[];
}

export interface DayRange {
  from: IsoDate;
  to: IsoDate;
}

/** Las tareas de una fuente: las que aún no tienen día y las que caen en la semana. */
export function sourceTasks(
  tasks: readonly Task[],
  source: CalendarSource,
  week: DayRange,
  today: IsoDate,
): SourceTasks {
  const isUndated = (task: Task) => !task.done && !task.scheduled;
  switch (source.kind) {
    case "inbox":
      return { undated: tasks.filter((task) => isInView(task, "inbox", today)), scheduled: [] };
    case "undated":
      return { undated: tasks.filter(isUndated), scheduled: [] };
    case "routines":
      return { undated: [], scheduled: [] };
    case "area": {
      const areaKeys = [source.area, ...(source.within ?? [])].map(areaKey);
      const own = tasks.filter((task) => areaKeys.includes(areaKey(task.area)));
      return {
        undated: own.filter(isUndated),
        scheduled: own.filter(
          (task) => task.scheduled && task.scheduled >= week.from && task.scheduled <= week.to,
        ),
      };
    }
  }
}

/** Cuántas quedan por hacer entre las dos listas. */
export function sourceCount({ undated, scheduled }: SourceTasks): number {
  return undated.length + scheduled.filter((task) => !task.done).length;
}

/**
 * Los días que caben cuando no hay sitio para todos: `count` seguidos que incluyen hoy, con hoy
 * hacia el centro. Si hoy no está, desde el primero.
 */
export function visibleWindow<T extends { date: IsoDate }>(
  days: readonly T[],
  count: number,
  today: IsoDate,
): T[] {
  if (count >= days.length) return [...days];
  const todayIndex = days.findIndex((day) => day.date === today);
  const centered = todayIndex < 0 ? 0 : todayIndex - Math.floor(count / 2);
  const start = Math.min(Math.max(centered, 0), days.length - count);
  return days.slice(start, start + count);
}
