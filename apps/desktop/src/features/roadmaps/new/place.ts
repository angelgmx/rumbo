import type { RoadmapDraft, RoadmapPlace, TopicOption } from "@rumbo/core";

/** Lo que eliges en «Dónde va»: un tema sin ruta o uno nuevo, dentro de un área si quieres. */
export interface PlaceChoice {
  /** `null` es «tema nuevo». */
  topicPath: string | null;
  newName: string;
  parentPath: string | null;
}

/** Al empezar: el tema que propone la IA si existe y aún no tiene ruta; si no, uno nuevo. */
export function initialPlace(draft: RoadmapDraft, topics: TopicOption[]): PlaceChoice {
  const wanted = draft.topic?.toLowerCase();
  const match = topics.find((topic) => topic.name.toLowerCase() === wanted);
  if (match && !match.hasRoadmap) return { topicPath: match.path, newName: "", parentPath: null };
  return {
    topicPath: null,
    newName: draft.topic ?? draft.title,
    parentPath: match?.path ?? null,
  };
}

export function toRoadmapPlace(choice: PlaceChoice): RoadmapPlace | undefined {
  if (choice.topicPath) return { kind: "topic", topicPath: choice.topicPath };
  if (!choice.newName.trim()) return undefined;
  return {
    kind: "new-topic",
    name: choice.newName,
    parentPath: choice.parentPath ?? undefined,
  };
}
