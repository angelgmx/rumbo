import type { Priority } from "@rumbo/core";

export const PRIORITY_LABEL: Record<Priority, string> = {
  high: "Alta",
  medium: "Media",
  low: "Baja",
};

/** «Inbox» de «00 - Inbox/Inbox.md»: la nota donde vive la tarea. */
export function noteName(path: string): string {
  return (path.split("/").pop() ?? path).replace(/\.md$/, "");
}
