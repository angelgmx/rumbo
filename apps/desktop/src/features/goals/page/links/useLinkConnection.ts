import type { GoalSummary, Resource } from "@rumbo/core";
import { useRumbo } from "@/app/RumboContext";
import { topicResources } from "@/features/roadmaps/topic";
import type { Connection } from "../plan/useConnections";

const NOTE = "note:";
const RESOURCE = "resource:";

/**
 * Lo que aún no acompaña al objetivo: las notas del vault y los recursos de sus temas
 * (solo los que tienen dirección, que es lo que los distingue).
 */
export function useLinkConnection({ id, notes, goal }: GoalSummary): Connection {
  const rumbo = useRumbo();
  const resources = new Map<string, Resource>(
    rumbo.learning
      .topics()
      .flatMap(topicResources)
      .flatMap(({ resource }) => (resource.url ? [[resource.url, resource] as const] : [])),
  );
  const linkedUrls = new Set(goal.resources.map(({ url }) => url));
  const linkedNotes = new Set(notes.map(({ name }) => name));

  return {
    options: [
      ...rumbo.store
        .allNotes()
        .filter(({ name }) => !linkedNotes.has(name))
        .map(({ name }) => ({ value: NOTE + name, label: name, hint: "Nota" })),
      ...[...resources]
        .filter(([url]) => !linkedUrls.has(url))
        .map(([url, { title, source }]) => ({
          value: RESOURCE + url,
          label: title,
          hint: source ?? "Recurso",
        })),
    ],
    connect: (value) => {
      const resource = resources.get(value.slice(RESOURCE.length));
      if (value.startsWith(NOTE)) {
        void rumbo.goals.connect(id, { kind: "note", name: value.slice(NOTE.length) });
      } else if (resource) {
        void rumbo.goals.connect(id, { kind: "resource", resource });
      }
    },
  };
}
