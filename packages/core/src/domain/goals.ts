// Objetivos: un resultado que quieres en una fecha. Los empujan proyectos, hábitos y rutas.
// El progreso se calcula al leer; solo se guarda lo que apuntas (p. ej. dónde va tu métrica).
import { daysBetween, type IsoDate } from "./dates";

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

/** Cómo sabrás que lo has logrado: de dónde partes, a dónde llegas y dónde vas. */
export interface GoalMetric {
  label: string;
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
  deadline?: IsoDate;
  status: GoalStatus;
  metric?: GoalMetric;
  obstacle: string;
  plans: IfThen[];
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
 * De 0 a 1. Por la métrica si la hay; si no, la media de lo que lo empuja (proyectos, rutas y
 * hábitos). Sin nada que lo empuje no hay progreso: está «sin plan».
 */
export function goalProgress(goal: Goal, drivers: GoalDrivers): number | undefined {
  if (goal.status === "done") return 1;
  if (goal.metric) return metricProgress(goal.metric);
  const parts = [drivers.projects, drivers.roadmaps, drivers.habits]
    .filter((values) => values.length > 0)
    .map(average);
  return parts.length === 0 ? undefined : average(parts);
}

export function metricProgress({ from, target, current }: GoalMetric): number {
  if (target === from) return current === undefined ? 0 : 1;
  return clamp(((current ?? from) - from) / (target - from));
}

/** Días hasta la fecha límite; negativo si ya pasó. */
export function daysLeft(goal: Goal, today: IsoDate): number | undefined {
  return goal.deadline ? daysBetween(today, goal.deadline) : undefined;
}

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}
