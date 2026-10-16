import { useVaultQuery } from "@/hooks/useVaultQuery";
import type { PropertyOption } from "@/components/panel/OptionList";

export interface TaskOptions {
  areas: PropertyOption[];
  projects: PropertyOption[];
  modules: PropertyOption[];
  goals: PropertyOption[];
  tags: string[];
}

const NONE: TaskOptions = { areas: [], projects: [], modules: [], goals: [], tags: [] };

/** Lo que se puede elegir en las propiedades: lo que ya existe en el vault y en la base de datos. */
export function useTaskOptions(): TaskOptions {
  return (
    useVaultQuery((rumbo) => ({
      areas: rumbo.store
        .notesOfType("area")
        .map((note) => String(note.data.name ?? note.name))
        .sort((a, b) => a.localeCompare(b))
        .map((name) => ({ value: name, label: name })),
      projects: rumbo.projects
        .list()
        .map(({ id, project }) => ({ value: String(id), label: project.title })),
      modules: rumbo.learning.roadmaps().flatMap((roadmap) =>
        roadmap.modules.map((module) => ({
          value: module.name,
          label: module.title,
          hint: roadmap.title,
        })),
      ),
      goals: rumbo.goals.list().map(({ id, goal }) => ({ value: String(id), label: goal.title })),
      tags: [...new Set(rumbo.tasks.all().flatMap((task) => task.tags))].sort((a, b) =>
        a.localeCompare(b),
      ),
    })).data ?? NONE
  );
}
