import type { ModuleStatus, Resource, ResourceOwner, TopicSummary } from "@rumbo/core";

/** Cómo va el tema entero según sus módulos. Sin ruta no hay estado. */
export function topicStatus(topic: TopicSummary): ModuleStatus | undefined {
  const modules = topic.roadmap?.modules ?? [];
  if (modules.length === 0) return undefined;
  if (modules.some((module) => module.status === "learning")) return "learning";
  if (modules.every((module) => module.status === "mastered" || module.status === "skipped"))
    return "mastered";
  return "not-started";
}

export function noteCount(topic: TopicSummary): number {
  return topic.notes.reduce((sum, folder) => sum + folder.notes.length, 0);
}

export function topicExercises(topic: TopicSummary) {
  return (topic.roadmap?.modules ?? []).flatMap((module) => module.exercises);
}

export interface ResourceItem {
  resource: Resource;
  /** La nota donde está guardado y su posición, para cambiarlo. */
  owner: ResourceOwner;
  index: number;
  /** El módulo al que pertenece; sin módulo es de todo el tema. */
  module?: string;
}

/** Los recursos del tema entero y los de cada módulo, en una sola lista. */
export function topicResources(topic: TopicSummary): ResourceItem[] {
  const own = topic.resources.map((resource, index) => ({ resource, owner: topic, index }));
  const ofModules = (topic.roadmap?.modules ?? []).flatMap((module) =>
    module.resources.map((resource, index) => ({
      resource,
      owner: module,
      index,
      module: module.title,
    })),
  );
  return [...own, ...ofModules];
}

/** "01 - Operadores" → "01 · Operadores" */
export function folderLabel(name: string): string {
  return name.replace(/^(\d+)\s*-\s*/, "$1 · ");
}
