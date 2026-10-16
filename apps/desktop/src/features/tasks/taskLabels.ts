import type { Priority } from "@rumbo/core";

export const PRIORITY_LABEL: Record<Priority, string> = {
  high: "Alta",
  medium: "Media",
  low: "Baja",
};

export const FLAG_COLOR: Record<Priority, string> = {
  high: "text-destructive",
  medium: "text-warning",
  low: "text-muted-foreground",
};
