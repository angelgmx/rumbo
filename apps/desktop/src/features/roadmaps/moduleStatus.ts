import type { ExerciseLevel, ModuleStatus, Resource } from "@rumbo/core";

export const STATUS_LABEL: Record<ModuleStatus, string> = {
  "not-started": "Sin empezar",
  learning: "Aprendiendo",
  mastered: "Dominado",
  skipped: "Saltado",
};

/** Color de cada estado, con los colores de la UI v3. */
export const STATUS_STYLE: Record<ModuleStatus, string> = {
  "not-started": "text-muted-foreground",
  learning: "text-primary-text",
  mastered: "text-success",
  skipped: "text-faint line-through",
};

export const STATUS_ORDER: ModuleStatus[] = ["not-started", "learning", "mastered", "skipped"];

export const LEVEL_NAME: Record<ExerciseLevel, string> = {
  1: "Para arrancar",
  2: "Para pensar",
  3: "Para lucirse",
  4: "Depuración",
};

/** Cada nivel tiene su color: verde, ámbar, rojo y gris, como en el diseño. */
export const LEVEL_STYLE: Record<ExerciseLevel, string> = {
  1: "text-success",
  2: "text-warning",
  3: "text-destructive",
  4: "text-muted-foreground",
};

export const RESOURCE_STATUS_LABEL: Record<Resource["status"], string> = {
  pending: "Pendiente",
  doing: "En curso",
  done: "Visto",
  skip: "Saltado",
};

export const RESOURCE_STATUS_STYLE: Record<Resource["status"], string> = {
  pending: "text-muted-foreground",
  doing: "text-primary-text",
  done: "text-success",
  skip: "text-faint",
};
