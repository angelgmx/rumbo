import type { TopicSummary } from "@rumbo/core";
import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { moduleHref } from "./links";
import { NoteReader } from "./NoteReader";
import { RoadmapDiagram } from "./RoadmapDiagram";
import { RoadmapLegend } from "./RoadmapLegend";
import { RoadmapWeeks } from "./weeks/RoadmapWeeks";

type View = "diagram" | "weeks";

/** Pestaña Ruta: el diagrama tipo roadmap.sh o la lista por semanas. */
export function TopicRoadmap({ topic }: { topic: TopicSummary }) {
  const [view, setView] = useState<View>("diagram");
  const [reading, setReading] = useState<string>();
  const [, navigate] = useLocation();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <RoadmapLegend />
        <ToggleGroup
          variant="outline"
          size="sm"
          value={[view]}
          onValueChange={(values) => values[0] && setView(values[0] as View)}
        >
          <ToggleGroupItem value="diagram">Diagrama</ToggleGroupItem>
          <ToggleGroupItem value="weeks">Por semanas</ToggleGroupItem>
        </ToggleGroup>
      </div>
      {view === "diagram" ? (
        <Card className="gap-0 overflow-hidden py-0">
          <RoadmapDiagram
            topic={topic}
            className="h-[640px]"
            onSelectModule={(module) => navigate(moduleHref(topic.path, module.name))}
            onOpenChallenge={setReading}
          />
        </Card>
      ) : (
        <Card className="gap-0 p-4">
          <RoadmapWeeks topic={topic} onOpenChallenge={setReading} />
        </Card>
      )}
      <NoteReader path={reading} onClose={() => setReading(undefined)} />
    </div>
  );
}
