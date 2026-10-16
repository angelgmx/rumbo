import type { RoadmapStatus, RoadmapSummary, TopicSummary } from "@rumbo/core";

export type StatusFilter = "all" | "active" | "paused" | "done";

const RANK: Record<RoadmapStatus, number> = { active: 0, planned: 1, paused: 2, done: 3 };

const FILTER_STATUSES: Record<StatusFilter, RoadmapStatus[]> = {
  all: ["active", "planned", "paused", "done"],
  active: ["active", "planned"],
  paused: ["paused"],
  done: ["done"],
};

export function areaOf(topic: TopicSummary) {
  return topic.area ?? topic;
}

/** Lo dominado sobre el total de módulos, en %. */
export function modulePercent(roadmap: RoadmapSummary): number {
  return roadmap.modules.length ? Math.round((roadmap.mastered / roadmap.modules.length) * 100) : 0;
}

export function inFilter(topic: TopicSummary, filter: StatusFilter): boolean {
  return FILTER_STATUSES[filter].includes(topic.roadmap!.status);
}

export function countIn(topics: TopicSummary[], filter: StatusFilter): number {
  return topics.filter((topic) => inFilter(topic, filter)).length;
}

function isAhead(topic: TopicSummary): boolean {
  return topic.roadmap!.pace.state !== "behind";
}

/** Activas con la fecha más próxima primero (a igual fecha, las atrasadas), luego pausadas y completadas. */
export function sortRoadmaps(topics: TopicSummary[]): TopicSummary[] {
  const date = (topic: TopicSummary) => topic.roadmap!.deadline ?? "9999-12-31";
  return [...topics].sort(
    (a, b) =>
      RANK[a.roadmap!.status] - RANK[b.roadmap!.status] ||
      date(a).localeCompare(date(b)) ||
      Number(isAhead(a)) - Number(isAhead(b)) ||
      a.roadmap!.title.localeCompare(b.roadmap!.title),
  );
}

/** La ruta de «Ahora»: la activa que antes vence o, sin fechas, la que tiene un módulo en curso. */
export function pickNow(topics: TopicSummary[]): TopicSummary | undefined {
  const active = sortRoadmaps(topics).filter(
    ({ roadmap }) => roadmap!.status === "active" && roadmap!.current,
  );
  return (
    active.find(({ roadmap }) => roadmap!.deadline) ??
    active.find(({ roadmap }) => roadmap!.current!.status === "learning") ??
    active[0]
  );
}
