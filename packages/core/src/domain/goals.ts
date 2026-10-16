// Objetivos: un resultado que quieres en una fecha, medido por sus resultados clave. Los
// empujan proyectos, hábitos y rutas. El progreso se calcula al leer; solo se guarda lo que
// apuntas (dónde va cada resultado clave).
import { daysBetween, type IsoDate } from "./dates";
import type { Resource } from "./resources";

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

export interface PeriodGroup<T> {
  /** `undefined` agrupa lo que no tiene periodo. */
  year?: string;
  /** Primero lo de todo el año (sin trimestre) y después T1 a T4. */
  quarters: { quarter?: string; items: T[] }[];
}

/** Agrupa por año y, dentro, por trimestre; los años de menor a mayor y «sin periodo» al final. */
export function groupByPeriod<T extends { goal: Goal }>(items: T[]): PeriodGroup<T>[] {
  const years = new Map<string | undefined, Map<string | undefined, T[]>>();
  for (const item of items) {
    const [year, quarter] = item.goal.period?.split("-") ?? [];
    const quarters = years.get(year) ?? new Map<string | undefined, T[]>();
    quarters.set(quarter, [...(quarters.get(quarter) ?? []), item]);
    years.set(year, quarters);
  }
  return [...years]
    .sort(([a], [b]) => (a ?? "9999").localeCompare(b ?? "9999"))
    .map(([year, quarters]) => ({
      year,
      quarters: [...quarters]
        .sort(([a], [b]) => (a ?? "").localeCompare(b ?? ""))
        .map(([quarter, grouped]) => ({ quarter, items: grouped })),
    }));
}

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}
