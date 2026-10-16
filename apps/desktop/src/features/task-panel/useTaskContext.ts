import type { Resource, TaskDraft } from "@rumbo/core";
import { useVaultQuery } from "@/hooks/useVaultQuery";

export interface TaskContext {
  /** El objetivo al que empuja, por su hábito o por la ruta de su módulo. */
  goal?: string;
  roadmap?: string;
  module?: string;
  /** Los recursos del módulo vinculado. */
  resources: Resource[];
}

const NONE: TaskContext = { resources: [] };

/** Dónde encaja la tarea: su módulo, la ruta de ese módulo y el objetivo de arriba. */
export function useTaskContext(draft: TaskDraft): TaskContext {
  return (
    useVaultQuery(
      (rumbo) => {
        const roadmap = rumbo.learning
          .roadmaps()
          .find((candidate) => candidate.modules.some((module) => module.name === draft.module));
        const module = roadmap?.modules.find((candidate) => candidate.name === draft.module);
        return {
          goal: rumbo.tasks.goalOf(draft),
          roadmap: roadmap?.title,
          module: module?.title,
          resources: module?.resources ?? [],
        };
      },
      [draft.module, draft.habit],
    ).data ?? NONE
  );
}
