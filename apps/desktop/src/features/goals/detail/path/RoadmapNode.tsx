import type { GoalRoadmap, GoalSummary } from "@rumbo/core";
import { BookOpenIcon, LibraryIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { StepsMeter } from "./StepsMeter";
import { TreeNode } from "./TreeNode";
import { useRoadmapHref } from "./useRoadmapHref";
import { TaskLeaf } from "@/features/tasks/TaskLeaf";

/** Una ruta del objetivo, con el módulo que toca y las tareas de hoy de ese módulo. */
export function RoadmapNode({ goal, roadmap }: { goal: GoalSummary; roadmap: GoalRoadmap }) {
  const { goals } = useRumbo();
  const hrefOf = useRoadmapHref();
  const { name, title, mastered, modules, current, todayTasks } = roadmap;
  const position = current && modules.findIndex((module) => module.name === current.name) + 1;

  return (
    <TreeNode
      icon={BookOpenIcon}
      title={title}
      href={hrefOf(name)}
      aside={<StepsMeter done={mastered} total={modules.length} label={title} />}
      removeLabel={`Quitar ${title}`}
      onRemove={() => void goals.disconnect(goal.id, { kind: "roadmap", name })}
    >
      {current ? (
        <TreeNode
          icon={LibraryIcon}
          title={current.title}
          href={hrefOf(name, current.name)}
          aside={`módulo ${position}`}
        >
          {todayTasks.map((task) => (
            <TaskLeaf key={task.id} task={task} />
          ))}
        </TreeNode>
      ) : (
        <p className="min-h-10 content-center pl-1.5 text-sm text-muted-foreground">
          Ruta terminada
        </p>
      )}
    </TreeNode>
  );
}
