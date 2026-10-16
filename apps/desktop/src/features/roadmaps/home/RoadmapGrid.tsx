import type { TopicSummary } from "@rumbo/core";
import { RoadmapCard } from "./RoadmapCard";

export function RoadmapGrid({ topics }: { topics: TopicSummary[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(19rem,1fr))] gap-4">
      {topics.map((topic) => (
        <RoadmapCard key={topic.path} topic={topic} />
      ))}
    </div>
  );
}
