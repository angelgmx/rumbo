// Objetivos: un resultado que quieres en una fecha, medido por sus resultados clave. Los
// empujan proyectos, hábitos y rutas. El progreso se calcula al leer; solo se guarda lo que
// apuntas (dónde va cada resultado clave).
import { addDays, daysBetween, type IsoDate } from "./dates";
import type { Resource } from "./resources";
import type { Priority } from "./tasks";

export const GOAL_STATUSES = [
  "not-started",
  "active",
  "paused",
  "done",
  "dropped",
  "failed",
] as const;
export type GoalStatus = (typeof GOAL_STATUSES)[number];

export type GoalHorizon = "year" | "quarter";

/** Un resultado clave: cómo sabrás que lo has logrado. De dónde partes, a dónde llegas y dónde vas. */
export interface KeyResult {
  title: string;
  from: number;
  target: number;
  unit?: string;
  current?: number;
}

/** Qué harás cuando aparezca el obstáculo. */
export interface IfThen {
  if: string;
  then: string;
}

export interface Goal {
  title: string;
  area?: string;
  why: string;
  horizon?: GoalHorizon;
  /** «2027» o «2027-T1». */
  period?: string;
  start?: IsoDate;
  deadline?: IsoDate;
  status: GoalStatus;
  priority?: Priority;
  keyResults: KeyResult[];
  obstacle: string;
  plans: IfThen[];
  /** Enlaces que te ayudan: cursos, artículos, vídeos… */
  resources: Resource[];
}

/** Lo que se rellena al crear o editar un objetivo. */
export type GoalInput = Omit<Goal, "status">;

/** Lo que empuja un objetivo, cada cosa con su avance de 0 a 1. */
export interface GoalDrivers {
  projects: number[];
  roadmaps: number[];
  /** Cumplimiento de los últimos 30 días de cada hábito. */
  habits: number[];
}

/**
 * De 0 a 1. Por sus resultados clave si los tiene; si no, la media de lo que lo empuja
 * (proyectos, rutas y hábitos). Sin nada de eso no hay progreso: está «sin plan».
 */
export function goalProgress(goal: Goal, drivers: GoalDrivers): number | undefined {
  if (goal.status === "done") return 1;
  if (goal.keyResults.length > 0) return average(goal.keyResults.map(keyResultProgress));
  const parts = [drivers.projects, drivers.roadmaps, drivers.habits]
    .filter((values) => values.length > 0)
    .map(average);
  return parts.length === 0 ? undefined : average(parts);
}

export function keyResultProgress({ from, target, current }: KeyResult): number {
  if (target === from) return current === undefined ? 0 : 1;
  return clamp(((current ?? from) - from) / (target - from));
}

/** Días hasta la fecha límite; negativo si ya pasó. */
export function daysLeft(goal: Goal, today: IsoDate): number | undefined {
  return goal.deadline ? daysBetween(today, goal.deadline) : undefined;
}

/** `at-risk`: la fecha límite ya pasó o tu ritmo no llega ni a la mitad del necesario. */
export type GoalPaceState = "ahead" | "on-track" | "behind" | "at-risk";

/** Avance por semana, de 0 a 1: lo que llevas de media y lo que hace falta para llegar. */
export interface GoalPace {
  /** Sin él, aún es pronto para medir el ritmo (menos de una semana desde el inicio). */
  state?: GoalPaceState;
  actualPerWeek?: number;
  /** Sin él, la fecha límite ya ha pasado. */
  requiredPerWeek?: number;
  /** Cuánto se aparta tu ritmo del necesario, en %: -45 va un 45 % por detrás; 20, un 20 % por delante. */
  differencePercent?: number;
  /** El día en que terminarías si mantienes tu ritmo; sin avance no hay día. */
  projectedFinish?: IsoDate;
}

// Menos de una semana de datos no dice nada del ritmo; un 10 % de margen cuenta como ir al día;
// con menos de la mitad del ritmo necesario ya hay riesgo de no llegar.
const MIN_DAYS_FOR_PACE = 7;
const PACE_MARGIN = 0.1;
const AT_RISK_RATIO = 0.5;

/** El ritmo real frente al necesario; solo para un objetivo en marcha, con fecha límite y sin terminar. */
export function goalPace(
  goal: Pick<Goal, "start" | "deadline"> & { status: string },
  progress: number | undefined,
  today: IsoDate,
): GoalPace | undefined {
  if (goal.status !== "active" || !goal.deadline || progress === undefined || progress >= 1) {
    return undefined;
  }
  const left = daysBetween(today, goal.deadline);
  const elapsed = goal.start ? daysBetween(goal.start, today) : 0;
  const requiredPerWeek = left > 0 ? ((1 - progress) / left) * 7 : undefined;
  const actualPerWeek = elapsed >= MIN_DAYS_FOR_PACE ? (progress / elapsed) * 7 : undefined;
  if (requiredPerWeek === undefined) return { state: "at-risk", actualPerWeek };
  if (actualPerWeek === undefined) return { requiredPerWeek };

  const ratio = actualPerWeek / requiredPerWeek;
  return {
    state: paceState(ratio),
    actualPerWeek,
    requiredPerWeek,
    differencePercent: Math.round((ratio - 1) * 100),
    projectedFinish:
      actualPerWeek > 0
        ? addDays(today, Math.ceil(((1 - progress) / actualPerWeek) * 7))
        : undefined,
  };
}

function paceState(ratio: number): GoalPaceState {
  if (ratio < AT_RISK_RATIO) return "at-risk";
  if (ratio < 1 - PACE_MARGIN) return "behind";
  return ratio > 1 + PACE_MARGIN ? "ahead" : "on-track";
}

/** «2027» es de todo el año; «2027-T1», de un trimestre. */
export function periodHorizon(period: string): GoalHorizon {
  return /-T[1-4]$/.test(period) ? "quarter" : "year";
}

/** Los periodos que se pueden elegir: este año y el siguiente, y los trimestres que quedan. */
export function periodChoices(today: IsoDate): string[] {
  const year = Number(today.slice(0, 4));
  const quarter = Math.ceil(Number(today.slice(5, 7)) / 3);
  const quarters = Array.from({ length: 4 }, (_, index) => {
    const offset = quarter - 1 + index;
    return `${year + Math.floor(offset / 4)}-T${(offset % 4) + 1}`;
  });
  return [String(year), String(year + 1), ...quarters];
}

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}
