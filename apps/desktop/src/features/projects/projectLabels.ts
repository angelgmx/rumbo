import { PROJECT_STATUSES, type ProjectStatus } from "@rumbo/core";

export const STATUS_ORDER = PROJECT_STATUSES;

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  idea: "Planificado",
  active: "En marcha",
  blocked: "En pausa",
  done: "Terminado",
};

export const STATUS_STYLE: Record<ProjectStatus, string> = {
  idea: "text-muted-foreground",
  active: "text-success",
  blocked: "text-warning",
  done: "text-primary-text",
};

/** Cada grupo de la lista, en el orden en que se leen, con su nombre en singular y plural. */
export const GROUPS: { status: ProjectStatus; one: string; many: string }[] = [
  { status: "active", one: "en marcha", many: "en marcha" },
  { status: "idea", one: "planificado", many: "planificados" },
  { status: "blocked", one: "en pausa", many: "en pausa" },
  { status: "done", one: "terminado", many: "terminados" },
];

export const projectHref = (id: number) => `/proyectos/${id}`;

/** «vence hoy», «vence en 12 días» o «vence en 7 meses». */
export function dueLabel(days: number): string {
  if (days < 0) return days === -1 ? "venció ayer" : `venció hace ${-days} días`;
  if (days === 0) return "vence hoy";
  if (days === 1) return "vence mañana";
  if (days < 45) return `vence en ${days} días`;
  return `vence en ${Math.round(days / 30)} meses`;
}

/** «en 6 días», «mañana», «hoy» o «hace 2 días» para un hito. */
export function inDaysLabel(days: number): string {
  if (days === 0) return "hoy";
  if (days === 1) return "mañana";
  return days > 0 ? `en ${days} días` : `hace ${-days} días`;
}
