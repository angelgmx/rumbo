import type { ModuleSummary } from "@rumbo/core";
import type { ModuleState } from "./types";

export function moduleState(module: ModuleSummary, current?: ModuleSummary): ModuleState {
  if (module.status === "mastered") return "mastered";
  if (module.path === current?.path) return "current";
  return module.status === "learning" ? "learning" : "idle";
}

export function moduleProgress(module: ModuleSummary): number {
  if (module.status === "mastered") return 1;
  const concepts = module.content.concepts;
  return concepts.length ? concepts.filter((concept) => concept.done).length / concepts.length : 0;
}

export function isPending(module: ModuleSummary): boolean {
  return module.status === "learning" || module.status === "not-started";
}
