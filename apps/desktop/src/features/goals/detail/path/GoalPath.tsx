import type { GoalSummary } from "@rumbo/core";
import { BookOpenIcon, CompassIcon, FlameIcon, FolderKanbanIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { PanelSection } from "@/components/panel/PanelSection";
import { AddField } from "./AddField";
import { HabitNode } from "./HabitNode";
import { LooseTasks } from "./LooseTasks";
import { ProjectNode } from "./ProjectNode";
import { RoadmapNode } from "./RoadmapNode";
import { useConnections } from "./useConnections";

/**
 * «Cómo llegas»: lo que empuja el objetivo como un árbol. Cada parte termina en su campo
 * para añadir: proyectos y tareas se crean, rutas y hábitos se conectan.
 */
export function GoalPath({ summary }: { summary: GoalSummary }) {
  const rumbo = useRumbo();
  const connections = useConnections(summary);
  const { id, projects, roadmaps, habits, looseTasks } = summary;
  const planned = projects.length + roadmaps.length + habits.length + looseTasks.length > 0;

  return (
    <PanelSection title="Cómo llegas" icon={CompassIcon}>
      {!planned && (
        <p className="text-sm text-muted-foreground">
          Aún no hay nada que te haga avanzar. Empieza por aquí:
        </p>
      )}
      <div className="flex flex-col divide-y">
        {projects.map((project) => (
          <ProjectNode key={project.id} goal={summary} summary={project} />
        ))}
        {roadmaps.map((roadmap) => (
          <RoadmapNode key={roadmap.name} goal={summary} roadmap={roadmap} />
        ))}
        {habits.map((habit) => (
          <HabitNode key={habit.habit.key} goal={summary} summary={habit} />
        ))}
      </div>
      <div className="flex flex-col gap-1">
        <AddField
          icon={FolderKanbanIcon}
          label="Añadir proyecto"
          placeholder="Añadir proyecto…"
          options={connections.projects.options}
          onPick={connections.projects.connect}
          onCreate={(title) => void rumbo.goals.createProject(id, title)}
        />
        <AddField
          icon={BookOpenIcon}
          label="Conectar roadmap"
          placeholder="Conectar roadmap…"
          options={connections.roadmaps.options}
          onPick={connections.roadmaps.connect}
        />
        <AddField
          icon={FlameIcon}
          label="Conectar hábito"
          placeholder="Conectar hábito…"
          options={connections.habits.options}
          onPick={connections.habits.connect}
        />
        <LooseTasks summary={summary} />
      </div>
    </PanelSection>
  );
}
