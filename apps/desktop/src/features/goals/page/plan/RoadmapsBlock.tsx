import type { GoalSummary } from "@rumbo/core";
import { BookOpenIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { PlanBlock } from "./PlanBlock";
import { PlanRow } from "./PlanRow";
import type { Connection } from "./useConnections";
import { useRoadmapHref } from "./useRoadmapHref";

export function RoadmapsBlock({
  summary,
  connection,
}: {
  summary: GoalSummary;
  connection: Connection;
}) {
  const { goals } = useRumbo();
  const hrefOf = useRoadmapHref();

  return (
    <PlanBlock
      icon={BookOpenIcon}
      title="Rutas"
      count={summary.roadmaps.length}
      connection={connection}
    >
      {summary.roadmaps.map(({ name, title, mastered, modules, current }) => (
        <PlanRow
          key={name}
          title={title}
          next={current ? `Siguiente: ${current.title}` : "Ruta terminada"}
          progress={modules.length === 0 ? 0 : mastered / modules.length}
          href={hrefOf(name)}
          onRemove={() => void goals.disconnect(summary.id, { kind: "roadmap", name })}
        />
      ))}
    </PlanBlock>
  );
}
