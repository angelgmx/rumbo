import type { GoalSummary } from "@rumbo/core";
import { BookOpenIcon, FlameIcon, FolderKanbanIcon, ListChecksIcon } from "lucide-react";
import { GoalSection } from "../GoalSection";
import { ConnectButton } from "./ConnectButton";
import { HabitsBlock } from "./HabitsBlock";
import { ProjectsBlock } from "./ProjectsBlock";
import { RoadmapsBlock } from "./RoadmapsBlock";
import { TasksBlock } from "./TasksBlock";
import { useConnections } from "./useConnections";

/** Todo lo que empuja el objetivo, por clases. Sin nada conectado: «Sin plan» y cómo conectarlo. */
export function GoalPlan({ summary }: { summary: GoalSummary }) {
  const connections = useConnections(summary);
  const { habits, roadmaps, projects, tasks } = summary;
  const planned = [habits, roadmaps, projects, tasks].some((items) => items.length > 0);

  if (!planned) {
    return (
      <GoalSection title="Plan">
        <div className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          <span className="mr-2">Sin plan. Conecta lo que lo empuja:</span>
          <ConnectButton connection={connections.habits} label="Hábito" icon={FlameIcon} />
          <ConnectButton connection={connections.roadmaps} label="Ruta" icon={BookOpenIcon} />
          <ConnectButton
            connection={connections.projects}
            label="Proyecto"
            icon={FolderKanbanIcon}
          />
          <ConnectButton connection={connections.tasks} label="Tarea" icon={ListChecksIcon} />
        </div>
      </GoalSection>
    );
  }

  return (
    <GoalSection title="Plan">
      <div className="flex flex-col gap-4">
        <HabitsBlock summary={summary} connection={connections.habits} />
        <RoadmapsBlock summary={summary} connection={connections.roadmaps} />
        <ProjectsBlock summary={summary} connection={connections.projects} />
        <TasksBlock summary={summary} connection={connections.tasks} />
      </div>
    </GoalSection>
  );
}
