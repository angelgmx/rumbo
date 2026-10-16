import type { TaskDraft } from "@rumbo/core";
import { useRumbo } from "@/app/RumboContext";

export interface Inheritance {
  area: string;
  from: "módulo" | "proyecto";
}

/** El área que la tarea toma de su módulo o proyecto mientras no tenga una propia. */
export function useInheritance(draft: TaskDraft): Inheritance | undefined {
  const { tasks } = useRumbo();
  const area = tasks.inheritedArea(draft);
  if (draft.area !== undefined || !area) return undefined;
  return { area, from: tasks.inheritedArea({ module: draft.module }) ? "módulo" : "proyecto" };
}
