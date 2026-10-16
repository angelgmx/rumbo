import { daysBetween, type IsoDate } from "./dates";

// El ritmo compara lo que te pide la fecha objetivo con lo que da tu horario.
// No usa horas reales (todavía no se registran): todo sale de lo que queda por
// hacer, de las franjas de estudio y de la fecha. Nada se guarda.

export type PaceState = "ahead" | "on-track" | "behind" | "no-deadline";

export interface PaceInput {
  /** Minutos que lleva la ruta entera, hechos y por hacer. */
  totalMinutes: number;
  remainingMinutes: number;
  /** Minutos de estudio a la semana según el horario de la ruta. */
  weeklyMinutes: number;
  today: IsoDate;
  deadline?: IsoDate;
  /** Cuándo terminarías con tu horario (lo calcula el planificador). */
  projectedFinish?: IsoDate;
}

export interface Pace {
  state: PaceState;
  /** De 0 a 1: lo hecho sobre el total. */
  progress: number;
  /** Lo que te da tu horario, de media por día. */
  plannedMinutesPerDay: number;
  /** Lo que necesitarías al día para llegar a la fecha. */
  requiredMinutesPerDay?: number;
  /** Cuánto te falta de ritmo, en %: 33 = tu horario da un tercio menos de lo que hace falta. */
  behindPercent?: number;
  /** Días que llegas tarde (positivo) o pronto (negativo) respecto a la fecha. */
  delayDays?: number;
}

// Un 10 % de margen arriba o abajo cuenta como ir al día.
const MARGIN = 0.1;

export function pace(input: PaceInput): Pace {
  const progress = input.totalMinutes
    ? 1 - input.remainingMinutes / Math.max(input.totalMinutes, input.remainingMinutes)
    : 0;
  const plannedMinutesPerDay = input.weeklyMinutes / 7;
  const base = { progress, plannedMinutesPerDay };
  if (!input.deadline) return { ...base, state: "no-deadline" };

  const daysLeft = Math.max(daysBetween(input.today, input.deadline), 1);
  const requiredMinutesPerDay = input.remainingMinutes / daysLeft;
  const delayDays = input.projectedFinish
    ? daysBetween(input.deadline, input.projectedFinish)
    : undefined;
  const ratio = requiredMinutesPerDay ? plannedMinutesPerDay / requiredMinutesPerDay : Infinity;

  return {
    ...base,
    requiredMinutesPerDay,
    delayDays,
    behindPercent: ratio < 1 ? Math.round((1 - ratio) * 100) : 0,
    state: ratio < 1 - MARGIN ? "behind" : ratio > 1 + MARGIN ? "ahead" : "on-track",
  };
}

export interface TrimCandidate {
  id: string;
  minutes: number;
}

/**
 * Qué módulos quitar, empezando por los últimos, para que lo que queda quepa
 * en `capacityMinutes`. Si ya cabe, no quita nada.
 */
export function trimToFit(pending: TrimCandidate[], capacityMinutes: number): TrimCandidate[] {
  let total = pending.reduce((sum, item) => sum + item.minutes, 0);
  const removed: TrimCandidate[] = [];
  for (const item of [...pending].reverse()) {
    if (total <= capacityMinutes) break;
    removed.push(item);
    total -= item.minutes;
  }
  return removed;
}

/** Minutos que da el horario entre hoy y la fecha. */
export function capacityUntil(weeklyMinutes: number, today: IsoDate, deadline: IsoDate): number {
  return Math.round((weeklyMinutes / 7) * Math.max(daysBetween(today, deadline), 0));
}
