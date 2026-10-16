import type { TopicSummary } from "@rumbo/core";
import { AllCompleted, AllPaused } from "./NowEmpty";
import { NowZone } from "./NowZone";
import { pickNow, sortRoadmaps } from "./roadmapList";

/** La zona de arriba: la ruta de «Ahora» o, si no hay ninguna en marcha, por qué. */
export function NowSlot({ topics }: { topics: TopicSummary[] }) {
  const now = pickNow(topics);
  if (now) return <NowZone topic={now} />;

  const statuses = topics.map((topic) => topic.roadmap!.status);
  if (statuses.every((status) => status === "done")) return <AllCompleted />;
  const paused = sortRoadmaps(topics).find((topic) => topic.roadmap!.status === "paused");
  if (paused && statuses.every((status) => status === "paused" || status === "done")) {
    return <AllPaused topic={paused} />;
  }
  return null;
}
