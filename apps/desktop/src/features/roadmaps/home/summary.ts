import type { RoadmapStatus, TopicSummary } from "@rumbo/core";

const WORDS: Record<RoadmapStatus, [string, string]> = {
  active: ["activa", "activas"],
  planned: ["planificada", "planificadas"],
  paused: ["pausada", "pausadas"],
  done: ["completada", "completadas"],
};

/** «3 activas · 1 pausada · 2 completadas» */
export function countByStatus(topics: TopicSummary[]): string {
  return (Object.keys(WORDS) as RoadmapStatus[])
    .flatMap((status) => {
      const count = topics.filter((topic) => topic.roadmap!.status === status).length;
      return count ? [`${count} ${WORDS[status][count === 1 ? 0 : 1]}`] : [];
    })
    .join(" · ");
}
