import {
  PROJECT_STATUSES,
  type GoalPaceState,
  type ProjectStatus,
  type TaskStatus,
} from "@rumbo/core";
import {
  CircleCheckIcon,
  CircleDotIcon,
  CircleIcon,
  PauseIcon,
  type LucideIcon,
} from "lucide-react";

export const STATUS_ORDER = PROJECT_STATUSES;

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  idea: "Planificado",
  active: "En marcha",
  blocked: "En pausa",
  done: "Terminado",
};

/** El color del chip de estado, como clase de texto. */
export const STATUS_STYLE: Record<ProjectStatus, string> = {
  idea: "text-muted-foreground",
  active: "text-success",
  blocked: "text-warning",
  done: "text-success",
};

/** El icono con que cada estado encabeza su columna del tablero. */
export const STATUS_ICON: Record<ProjectStatus, { icon: LucideIcon; style: string }> = {
  idea: { icon: CircleIcon, style: "text-muted-foreground" },
  active: { icon: CircleDotIcon, style: "text-primary" },
  blocked: { icon: PauseIcon, style: "text-muted-foreground" },
  done: { icon: CircleCheckIcon, style: "text-success" },
};

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "Por hacer",
  doing: "En curso",
  done: "Hecho",
};

export const TASK_STATUS_ICON: Record<TaskStatus, { icon: LucideIcon; style: string }> = {
  todo: { icon: CircleIcon, style: "text-muted-foreground" },
  doing: { icon: CircleDotIcon, style: "text-primary" },
  done: { icon: CircleCheckIcon, style: "text-success" },
};

export const TASK_STATUS_STYLE: Record<TaskStatus, string> = {
  todo: "text-muted-foreground",
  doing: "text-primary-text",
  done: "text-success",
};

/** Cómo se llama el ritmo de un proyecto y de qué color es su etiqueta. */
export const PACE_LABEL: Record<GoalPaceState, { label: string; style: string }> = {
  ahead: { label: "Al día", style: "text-success" },
  "on-track": { label: "Al día", style: "text-success" },
  behind: { label: "Por detrás", style: "text-warning" },
  "at-risk": { label: "Va tarde", style: "text-destructive" },
};

export const projectHref = (id: number) => `/proyectos/${id}`;

/** «vence hoy», «vence en 12 días» o «vence en 7 meses». */
export function dueLabel(days: number): string {
  if (days < 0) return days === -1 ? "venció ayer" : `venció hace ${-days} días`;
  if (days === 0) return "vence hoy";
  if (days === 1) return "vence mañana";
  if (days < 45) return `vence en ${days} días`;
  return `vence en ${Math.round(days / 30)} meses`;
}
