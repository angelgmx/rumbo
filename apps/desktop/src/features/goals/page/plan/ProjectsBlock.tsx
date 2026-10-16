import type { GoalSummary } from "@rumbo/core";
import { FolderKanbanIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { PlanBlock } from "./PlanBlock";
import { PlanRow } from "./PlanRow";
import type { Connection } from "./useConnections";

export function ProjectsBlock({
  summary,
  connection,
}: {
  summary: GoalSummary;
  connection: Connection;
}) {
  const { goals } = useRumbo();

  return (
    <PlanBlock
      icon={FolderKanbanIcon}
      title="Proyectos"
      count={summary.projects.length}
      connection={connection}
    >
      {summary.projects.map(({ id, project, progress, nextTasks }) => (
        <PlanRow
          key={id}
          title={project.title}
          next={nextTasks[0] ? `Siguiente: ${nextTasks[0].text}` : "Sin tareas pendientes"}
          progress={progress}
          onRemove={() => void goals.disconnect(summary.id, { kind: "project", id })}
        />
      ))}
    </PlanBlock>
  );
}
