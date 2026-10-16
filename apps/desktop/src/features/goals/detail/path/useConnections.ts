import type { GoalLink, GoalSummary } from "@rumbo/core";
import { useRumbo } from "@/app/RumboContext";
import type { PropertyOption } from "@/components/panel/OptionList";

/** Lo que se puede conectar de una clase: las opciones libres y qué pasa al elegir una. */
export interface Connection {
  options: PropertyOption[];
  connect: (value: string) => void;
}

interface Connections {
  habits: Connection;
  roadmaps: Connection;
  projects: Connection;
}

/**
 * Lo que aún no empuja este objetivo, listo para conectarse. Un hábito o un proyecto empuja
 * un solo objetivo: si ya tiene otro, se avisa en la opción.
 */
export function useConnections({ id, roadmaps: linked }: GoalSummary): Connections {
  const rumbo = useRumbo();
  const titles = new Map(rumbo.goals.list().map((summary) => [summary.id, summary.goal.title]));
  const elsewhere = (owner: number | undefined) =>
    owner === undefined || owner === id ? undefined : titles.get(owner);
  const link = (value: GoalLink) => void rumbo.goals.connect(id, value);

  return {
    habits: {
      options: rumbo.habits
        .list()
        .filter(({ habit }) => habit.goalId !== id)
        .map(({ habit }) => ({
          value: habit.key,
          label: habit.name,
          hint: elsewhere(habit.goalId),
        })),
      connect: (key) => link({ kind: "habit", key }),
    },
    roadmaps: {
      options: rumbo.learning
        .roadmaps()
        .filter(({ name }) => !linked.some((roadmap) => roadmap.name === name))
        .map(({ name, title }) => ({ value: name, label: title })),
      connect: (name) => link({ kind: "roadmap", name }),
    },
    projects: {
      options: rumbo.projects
        .list()
        .filter(({ project }) => project.goalId !== id)
        .map(({ id: projectId, project }) => ({
          value: String(projectId),
          label: project.title,
          hint: elsewhere(project.goalId),
        })),
      connect: (value) => link({ kind: "project", id: Number(value) }),
    },
  };
}
