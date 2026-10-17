import type { Task } from "@rumbo/core";
import { useRumbo } from "@/app/RumboContext";
import { exerciseHref } from "@/features/exercises/links";
import { moduleHref } from "@/features/roadmaps/links";

export interface TaskLink {
  kind: "exercise" | "module";
  /** «Ejercicio 03 · Bucles» o solo el módulo. */
  label: string;
  href: string;
}

/** De dónde viene la tarea: el ejercicio de un módulo, o el módulo, con la dirección para abrirlo. */
export function useTaskLink({
  module,
  exercise,
}: Pick<Task, "module" | "exercise">): TaskLink | undefined {
  const { learning } = useRumbo();
  const found = module ? learning.findModule(module) : undefined;
  if (!found) return undefined;

  const { topic, module: moduleSummary } = found;
  if (!exercise) {
    return { kind: "module", label: moduleSummary.title, href: moduleHref(topic.path, module!) };
  }
  return {
    kind: "exercise",
    label: `Ejercicio ${exercise} · ${moduleSummary.title}`,
    href: exerciseHref(topic.path, module!, exercise),
  };
}
