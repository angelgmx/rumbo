import { useVaultQuery } from "@/hooks/useVaultQuery";
import type { ChipOption } from "./OptionChip";

export interface TaskOptions {
  areas: ChipOption[];
  projects: ChipOption[];
  modules: ChipOption[];
  tags: string[];
}

const NONE: TaskOptions = { areas: [], projects: [], modules: [], tags: [] };

/** Lo que se puede elegir en las fichas: lo que ya existe en el vault. */
export function useTaskOptions(): TaskOptions {
  return (
    useVaultQuery((rumbo) => ({
      areas: rumbo.store
        .notesOfType("area")
        .map((note) => String(note.data.name ?? note.name))
        .sort((a, b) => a.localeCompare(b))
        .map((name) => ({ value: name, label: name })),
      projects: rumbo.store
        .notesOfType("project")
        .map((note) => ({ value: note.name, label: note.name }))
        .sort((a, b) => a.label.localeCompare(b.label)),
      modules: rumbo.learning.roadmaps().flatMap((roadmap) =>
        roadmap.modules.map((module) => ({
          value: module.name,
          label: module.title,
          hint: roadmap.title,
        })),
      ),
      tags: [...new Set(rumbo.tasks.all().flatMap((task) => task.tags))].sort((a, b) =>
        a.localeCompare(b),
      ),
    })).data ?? NONE
  );
}
