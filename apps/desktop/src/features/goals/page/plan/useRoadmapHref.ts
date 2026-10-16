import { moduleHref, roadmapHref } from "@/features/roadmaps/links";
import { useVaultQuery } from "@/hooks/useVaultQuery";

/** Dónde se abre una ruta, o uno de sus módulos, por el nombre de su nota. */
export function useRoadmapHref(): (roadmap: string, module?: string) => string | undefined {
  const topics = useVaultQuery((rumbo) => rumbo.learning.topics()).data ?? [];

  return (roadmap, module) => {
    const topic = topics.find((candidate) => candidate.roadmap?.name === roadmap);
    if (!topic) return undefined;
    return module ? moduleHref(topic.path, module) : roadmapHref(topic.path);
  };
}
