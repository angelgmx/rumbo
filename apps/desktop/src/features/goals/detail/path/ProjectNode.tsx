import type { GoalSummary, ProjectSummary } from "@rumbo/core";
import { CheckIcon, FolderKanbanIcon } from "lucide-react";
import { projectHref } from "@/features/projects/projectLabels";
import { useRumbo } from "@/app/RumboContext";
import { MilestoneLeaf } from "./MilestoneLeaf";
import { StepsMeter } from "./StepsMeter";
import { TreeNode } from "./TreeNode";
import { AddField } from "@/components/AddField";
import { TaskLeaf } from "@/features/tasks/TaskLeaf";

/** Un proyecto del objetivo con sus hitos y tareas pendientes, y un campo para sumar tareas. */
export function ProjectNode({ goal, summary }: { goal: GoalSummary; summary: ProjectSummary }) {
  const { goals, tasks } = useRumbo();
  const { id, project, nextTasks, steps } = summary;

  return (
    <TreeNode
      icon={FolderKanbanIcon}
      title={project.title}
      href={projectHref(id)}
      aside={<StepsMeter {...steps} label={project.title} />}
      removeLabel={`Quitar ${project.title}`}
      onRemove={() => void goals.disconnect(goal.id, { kind: "project", id })}
    >
      {project.milestones.map((milestone, index) => (
        <MilestoneLeaf key={index} projectId={id} index={index} milestone={milestone} />
      ))}
      {nextTasks.map((task) => (
        <TaskLeaf key={task.id} task={task} />
      ))}
      <AddField
        icon={CheckIcon}
        label={`Nueva tarea de ${project.title}`}
        placeholder="Escribe una tarea…"
        onCreate={(text) => void tasks.createFromTitle(text, { projectId: id })}
      />
    </TreeNode>
  );
}
