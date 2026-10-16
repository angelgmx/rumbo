import { GOAL_STATUSES, type GoalStatus } from "@rumbo/core";

export const STATUS_ORDER = GOAL_STATUSES;

export const STATUS_LABEL: Record<GoalStatus, string> = {
  "not-started": "Sin empezar",
  active: "En marcha",
  paused: "En pausa",
  done: "Hecho",
  dropped: "Abandonado",
  failed: "Fallido",
};

export const STATUS_STYLE: Record<GoalStatus, string> = {
  "not-started": "text-muted-foreground",
  active: "text-success",
  paused: "text-warning",
  done: "text-primary-text",
  dropped: "text-faint",
  failed: "text-destructive",
};

export const goalHref = (id: number) => `/objetivos/${id}`;

/** «2027» se lee igual; «2027-T1» pasa a «T1 2027». */
export function periodLabel(period: string): string {
  const [year, quarter] = period.split("-");
  return quarter ? `${quarter} ${year}` : period;
}

export function percent(progress: number): string {
  return `${Math.round(progress * 100)} %`;
}

/** «14 días», «mañana», «vencido hace 3 días»… */
export function daysLeftLabel(days: number): string {
  if (days === 0) return "vence hoy";
  if (days === 1) return "queda 1 día";
  if (days > 1) return `quedan ${days} días`;
  return days === -1 ? "venció ayer" : `venció hace ${-days} días`;
}
